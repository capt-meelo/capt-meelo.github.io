---
layout: post
title: "Asset Enumeration: Expanding a Target's Attack Surface"
date: 2019-09-02
categories: bugbounty
---

## Introduction

Whenever I'm doing bug hunting sessions with a wide range of scope (e.g. CIDRs, subdomains, all assets belonging to a company, etc.), I'm always overwhelmed with the amount of information that I have to gather to expand my attack surface. It's true that `a wider scope = a larger attack surface = more chances of pwning`. However, increasing the attack surface is always a challenge for me. 

In this post, I'll describe the methodology that I'm using to expand the attack surface of my target domain or company. 

> _Please note that this methodology is limited only to enumerating subdomains and finding the domains associated with the target domain._


## Asset Discovery

Given a target domain, there are two ways to expand its attack surface: 

1. Find as many domain names as possible that share the same base domain with the target. This is commonly called as **subdomain enumeration**. 
2. Identify all domain names "associated" with the target domain. 

The illustration below helps differentiate what the two methods do.
![Asset Discovery](/static/img/2019-09-02-asset-enumeration/asset-disc.png)

Now let's take a look at the methodology that I'm using to enumerate both the subdomains and the associated domains. 


## Subdomain Enumeration

The focus of this step is to identify as much subdomains as possible that are tied to the target domain. Ideally, we want to go as deep as we can. What do I mean by that is we don't want to limit our enumeration in finding only the subdomains of the target domain. We also want to identify the subdomains of the subdomains of the target domain. For example, we want to also identify `another.subdomain.domain.com`, and not just `subdomain.domain.com`.

There are many tools that will do subdomain enumeration but not all of them provide good results. Personally, I prefer to use a tool that combines results from various enumeration services or sources of inputs, and has all the options and functionalities that I need such as recursive brute force and alteration of words. 

For subdomain enumeration, I always start with [**Amass**](https://github.com/OWASP/Amass) using its `-passive` option.
```bash
amass enum -passive -d <DOMAIN> -o <OUT_FILE>
```

Followed by a brute force attack on the target domain using either [all.txt](https://github.com/OWASP/Amass/blob/master/wordlists/all.txt) or [commonspeak2](https://github.com/assetnote/commonspeak2-wordlists/blob/master/subdomains/subdomains.txt).
```bash
amass enum -brute -w <WORDLIST> -d <DOMAIN> -o <OUT_FILE>
```

> _The success and efficiency of your brute force attack relies mostly on your wordlist; so better use a highly-reputed one._

If you want to speed up the performance of **Amass**, you can use the options `-noalts`, `-norecursive`, and `-max-dns-queries`. Just don't be surprised if you got fewer results.


Not all subdomains gathered from the above commands will resolve to its corresponding IP addresses. To filter out only those that will be resolved, I prefer to use [**Massdns**](https://github.com/blechschmidt/massdns).
```bash
./bin/massdns -r lists/resolvers.txt -o S <LIST_OF_SUBDOMAINS> | grep -e ' A ' |  cut -d 'A' -f 1 | rev | cut -d "." -f1 --complement | rev | sort | uniq > <OUT_FILE>
```


## Associated Domains Enumeration

Through acquisitions and merges, it is not only a company's business that grows but also their domains and associated domains. For example, when "Facebook, Inc." acquired [Instragram](https://newsroom.fb.com/news/2012/04/facebook-to-acquire-instagram/) and [Whatsapp](https://newsroom.fb.com/news/2014/02/facebook-to-acquire-whatsapp/), the domains `instragram.com` and `whatsapp.com` became associated with `facebook.com`. 

As we can see from the following `whois` queries below, the domains `facebook.com`, `instagram.com`, and `whatsapp.com` were all registered by the email address `domain@fb.com`.
![WHOIS Records](/static/img/2019-09-02-asset-enumeration/whois.png)

To enumerate domains that are associated with the target domain, we could use the `Registrant Email` record taken from a WHOIS search result and perform a **Reverse WHOIS Lookup**. This can be done using sites such as [viewdns.info](https://viewdns.info/reversewhois/) or [whoisxmlapi.com](https://tools.whoisxmlapi.com/reverse-whois-search).
![Reverse WHOIS](/static/img/2019-09-02-asset-enumeration/viewdns1.png)

You can also run a Reverse WHOIS Lookup based on the `Registrant Organization` record to get different results.
![Reverse WHOIS](/static/img/2019-09-02-asset-enumeration/viewdns2.png)

It is normal to get overlapping results when performing Reverse WHOIS Lookup based on `Registrant Email` and `Registrant Organization` records, so make some post-processing and remove the duplicates.

> _Be wary that most "Reverse WHOIS" services are freemium. If you want to get more results (or have the full report), they require you to spend some $$$._
>
> ![Make it rain!](https://media.giphy.com/media/3oFzmqENRBkRTRfLcA/giphy.gif)


## Filling Up the Empty Areas

Now that we've already enumerated the target domain "vertically" and "horizontally", should we stop and proceed with attacking these subdomains and associated domains? I'd say **NO!**. 

![NO!](https://media.giphy.com/media/LOEI8jsNKPmzdJYvhJ/giphy.gif)

Wouldn't it be nice if we expand more our target's attack surface by filling up the empty areas (_shown in red boxes_) below?
![Attack Surface](/static/img/2019-09-02-asset-enumeration/attack-surface.png)

We can do this by doing subdomain enumeration on every associated domains that we've discovered from the previous step. Obviously, this will take way more time than doing a subdomain enumeration on the target domain alone. But who cares? Right? Remember, `a larger attack surface = more chances of pwning`.

But before that, filter first only those associated domains that will be resolved:
```bash
./bin/massdns -r lists/resolvers.txt -o S <LIST_OF_ASSOCIATED_DOMAINS> | grep -e ' A ' |  cut -d 'A' -f 1 | rev | cut -d "." -f1 --complement | rev | sort | uniq > <OUT_FILE>
```

Then run another subdomain enumeration via:
```bash
amass enum -passive -df <LIST_OF_RESOLVED_ASSOCIATED_DOMAINS> -o <OUT_FILE>
```

or through brute force attack:
```bash
amass enum -brute -w <WORDLIST> -df <LIST_OF_RESOLVED_ASSOCIATED_DOMAINS> -o <OUT_FILE>
```

If you have a powerful machine, you can speed up this process by running multiple concurrent jobs using [GNU Parallel](https://www.gnu.org/software/parallel/) or [Xargs](http://man7.org/linux/man-pages/man1/xargs.1.html). For example:
```bash
cat <LIST_OF_RESOLVED_ASSOCIATED_DOMAINS> | parallel -j <NO_OF_CONCURRENT_JOBS> "amass enum -passive -d {} -o {}.out"
```

> I prefer to use **GNU Parallel** so you won't see commands related to **xargs** here. 

One you've enumerated the subdomains of all identified associated domains, filter them out again by running a DNS resolution using **Massdns**.


## What's Next?

After doing the above steps, the last thing to do is to combine them and remove any duplicates. 

Using all these enumerated data/hosts, you can do the following:

* Check for subdomain takeover
* Run a port scan and identify any running services
* Take screenshots for host/s that have web service/s running
* Run a directory brute force attack
* etc.


## Conclusion

This methodology is what I'm doing when I'm trying to do bug bounties. I cannot guarantee that this will work for you as well, and there's no assurance that you will find any bug once you follow this methodology. This post was written to share my knowledge and to help bug hunters like me who are struggling with expanding a target's attack surface. 

That's it for this post. I hope you will find this useful. 