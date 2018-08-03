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
