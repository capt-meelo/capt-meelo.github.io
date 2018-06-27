---
layout: post
title:  "[VulnServer] Exploiting TRUN Command via Vanilla EIP Overwrite"
date:   2018-06-27
categories: [exploitdev, osceprep]
---

As part of my preparation for the taking the CTP course and OSCE exam, I decided to practice and hone my skills using [vulnserver.exe](http://www.thegreycorner.com/p/vulnserver.html). Based on the creator’s note:
> "Vulnserver is a Windows based threaded TCP server application that is designed to be exploited. The program is intended to be used as a learning tool to teach about the process of software exploitation, as well as a good victim program for testing new exploitation techniques and shellcode."

Before anything else, I first started exploring the application by connecting to it on port **9999/tcp**. Using the `HELP` command, all the available commands showed up. It can also be seen that all the commands (except from `HELP` and `EXIT`) only require one argument.
![Vulnserver](/static/img/02/01.png)

Now that I already knew the available commands, I started fuzzing the `TRUN` command of the application using the following **SPIKE** template. *(Note: If you wanted to learn more about SPIKE, please read [this](https://resources.infosecinstitute.com/intro-to-fuzzing/).)*
```
s_readline();
s_string("TRUN ");
s_string_variable("FUZZ");
```
