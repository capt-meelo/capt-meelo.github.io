---
layout: post
title:  "[VulnServer] Exploiting GTER Command with Limited Buffer Space Using Egghunter"
date:   2018-06-27
categories: [exploitdev, osceprep]
---

The next command that I tried exploiting was the `GTER` command. Just like in my [previous post](https://capt-meelo.github.io/exploitdev/osceprep/2018/06/27/vulnserver-trun.html), I started fuzzing this command using the following **SPIKE** template.
![GTER Spike](/static/img/03/01.png)

The application crashed when SPIKE sent **around 5000 bytes** of data. To know how the fuzzing was done, please visit my [[previous post]](https://capt-meelo.github.io/exploitdev/osceprep/2018/06/27/vulnserver-trun.html). 
