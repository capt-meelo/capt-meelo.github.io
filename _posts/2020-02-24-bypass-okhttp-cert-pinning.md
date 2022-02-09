---
layout: post
title: "Bypassing OkHttp Certificate Pinning"
date: 2020-02-24
categories: mobile
---

Yesterday, I was analyzing an Android application which uses OkHttp for certificate pinning. It took me hours to analyze the app, and have tried different methods to circumvent the app's certificate pinning implementation. If I had only been monitoring the system log while running the app, I could have done it in just a matter of minutes. I might have wasted a lot of time and effort, but at least I've learned. 

Here's my write up on how I bypassed OkHttp's Certificate Pinning implementation. 

## Attempt #1: Using Xposed Modules

Since I had Xposed running on my test device, I first used the modules [SSLUnpinning](https://repo.xposed.info/module/mobi.acpm.sslunpinning) and [TrustMeAlready](https://repo.xposed.info/module/com.virb3.trustmealready). I know these modules are outdated, but it might still work. Unfortunately, it didn't work on the app that I'm testing. 

## Attempt #2: Using Frida Scripts

My second attempt involved the use of Frida. After [setting it up](https://frida.re/docs/android/) on my test device, I immediately tried the "most popular" Frida script on [CodeShare](https://codeshare.frida.re/) which is the [Universal Android SSL Pinning Bypass](https://codeshare.frida.re/@pcipolloni/universal-android-ssl-pinning-bypass-with-frida/) script. But what I got was just an error. 
![Frida Script #1](/static/img/2020-02-24-bypass-okhttp-cert-pinning/frida-universal.png)

> _**NOTE:** The reason I got the error because I forgot to copy Burp's cert into `/data/local/tmp/cert-der.crt`. Anyway, fixing the error still didn't solve my problem of bypassing the app's cert pinning implementation._

I tried another [script](https://codeshare.frida.re/@akabe1/frida-multiple-unpinning/) but no luck as well. It did not even successfully detect the certificate pinning implementation used by the app.
![Frida Script #2](/static/img/2020-02-24-bypass-okhttp-cert-pinning/frida-multiple-pinning.png)

I ended up trying all Frida scripts from [CodeShare](https://codeshare.frida.re/browse) related to certificate pinning bypass but none of them worked.

## Attempt #3: Via Manual Modification

I decided to look at the system log to see what's happening in the background when the app is running. From the app's log, I found the following certificate fingerprints _(highlighted in green)_. 
![Log](/static/img/2020-02-24-bypass-okhttp-cert-pinning/log.png)

Basically, the app checks for these fingerprints. If the fingerprint from the certificate chain matches one of the pinned fingerprints, then the peer's identity has been verified and SSL pinning can be bypassed.

Before I could inject Burp's certificate fingerprint, I first decompiled the app and look for the file where these pinned certificates were located. From the output below, the pinned fingerprints were located in `/res/values/arrays.xml`.
![Location](/static/img/2020-02-24-bypass-okhttp-cert-pinning/location.png)

I then injected Burp's certificate fingerprint to the list inside `/res/values/arrays.xml`.
![Modification](/static/img/2020-02-24-bypass-okhttp-cert-pinning/modification.png)

Lastly, I recompiled the app and installed it.
![Rebuild](/static/img/2020-02-24-bypass-okhttp-cert-pinning/rebuild.png)

![Install](/static/img/2020-02-24-bypass-okhttp-cert-pinning/install.png)

That's it! I was able to bypass the app's certificate pinning mechanism. 
![Burp](/static/img/2020-02-24-bypass-okhttp-cert-pinning/burp.png)

**Lesson Learned:** Always keep an eye on the system log while running the target application.