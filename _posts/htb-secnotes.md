---
layout: post
title:  "[HTB] SecNotes Write-up"
date:   2019-01-19
categories: hackthebox
---

## Introduction

![SecNotes](/static/img/12/01.png)


Now that **SecNotes** has retired, here's my attempt on how I root the box. During the privilege escalation part, I discovered that the contents of _root.txt_ file can be obtained either with or without an admin shell/credentials. Here you go!


## Information

![Info](/static/img/12/02.png)

## Part 1: user.txt


An Nmap scan against the target machine reveals HTTP and SMB services. The HTTP services are running on two ports, **80/tcp** and **8808/tcp**.
```
root@kali:~/htb# nmap -sVC -p- --open -T4  10.10.10.97
Starting Nmap 7.70 ( https://nmap.org ) at 2019-01-17 17:11 PST
Nmap scan report for 10.10.10.97
Host is up (0.33s latency).
Not shown: 65532 filtered ports
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE      VERSION
80/tcp   open  http         Microsoft IIS httpd 10.0
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
| http-title: Secure Notes - Login
|_Requested resource was login.php
445/tcp  open  microsoft-ds Windows 10 Enterprise 17134 microsoft-ds (workgroup: HTB)
8808/tcp open  http         Microsoft IIS httpd 10.0
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows
Service Info: Host: SECNOTES; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 2h40m01s, deviation: 4h37m10s, median: 0s
| smb-os-discovery:
|   OS: Windows 10 Enterprise 17134 (Windows 10 Enterprise 6.3)
|   OS CPE: cpe:/o:microsoft:windows_10::-
|   Computer name: SECNOTES
|   NetBIOS computer name: SECNOTES\x00
|   Workgroup: HTB\x00
|_  System time: 2019-01-17T01:19:09-08:00
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2019-01-17 17:19:06
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 523.22 seconds
```


The web service port 80 shows a login page. To gain access to the application, we need to sign up first.
![Port80](/static/img/12/03.png)


Takte note that when creating a username, it should contain the SQL syntax `' or '1'='1`. You'll know later why.
![Registration](/static/img/12/04.png)


Using the created account, we can now login.
![Login](/static/img/12/05.png)


Before proceeding, let's us know the reason why the SQL syntax is needed for the username. Here's what happens when you created an account without the said SQL syntax. 
![w/o SQL](/static/img/12/06.png)


And here's what happens when you login using the account with an SQL syntax - other notes are shown. If we open the **new site** note, we can see plaintext credentials and a share name. The format gives a hint that we need to use this credentials via SMB to access the **new-site** share.
![w/ SQL](/static/img/12/07.png)


Using the discovered credentials and the share name, we now have an SMB access. In this share, we can see a Netcat binary **nc.exe**. However, we can't use it directly since SMB won't allow us to execute files.
![SMB Access](/static/img/12/08.png)


For us to execute nc.exe, let's create following PHP shell. 
![PHP Shell](/static/img/12/09.png)


Then upload it to the SMB share.
![Shell Upload](/static/img/12/10.png)


Using other HTTP service running on port **808/tcp**, let's access the shell and execute a command. As seen here, the **dir** command returns the expected output.
![Command Execute](/static/img/12/11.png)


Now, let's execute **nc.exe** to connect to the attacking machine and have a shell. Looking at the listening port from the attacking machine, we can see that a reverse connection was established from the target machine.
![Reverse Shell](/static/img/12/12.png)


Now that we have a shell, we can now get the contents of **user.txt** from **C:\Users\tyler\Desktop\user.txt**.
![user.txt](/static/img/12/13.png)


## Part 2.1: root.txt w/o Admin Creds


By doing some enumeration on the target machine, we can see that there's a folder **C:\Distros\Ubuntu**. Here's the contents of this folder. Based on this, we can have an idea that the machine is using _WSL (Windows Subsystem for Linux)_. 
![Ubuntu](/static/img/12/14.png)


Before we can spawn a bash shell, let's first look for **bash.exe**.
![bash.exe](/static/img/12/15.png)


Once located, let's execute it. As seen here, simply executing **bash.exe** gives us a bash shell with root privileges.
![Bash Shell](/static/img/12/16.png)


By spawning a tty shell, and doing a directory listing, we can see the location of **root.txt**. More importantly, we can already view its contents even without gaining an administrative shell/credentials. 
![root.txt](/static/img/12/17.png)


## Part 2.2: root.txt via Admin Creds


To have an admin shell, let's look at the contents of **.bash_history**. Viewing this file reveals the administrator's credentials that we can use to connect to the target via SMB.
![bash+history](/static/img/12/18.png)


Using the discovered credentials, let's connect via SMB to the target machine and download **root.txt**. Once downloaded, we can now go back to the attacking machine and read its contents. 
![bash.exe](/static/img/12/19.png)
