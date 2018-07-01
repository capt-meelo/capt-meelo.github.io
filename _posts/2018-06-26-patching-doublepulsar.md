---
layout: post
title:  "Patching DoublePulsar to Exploit Windows Embedded Machines"
date:   2018-06-26
categories: [pentest, research]
permalink: /pentest/:year/:month/:day/:title:output_ext
---

During one of my engagements, I discovered some Windows devices that were affected by the **MS17-010** vulnerability. One of these devices caught my attention as it’s something I haven’t encountered yet - a **Windows Embedded** operating system. 
![MS17-010 Auxiliary Module](/static/img/01/01.png)

Since it’s vulnerable to MS17-010, I immediately tried the relevant Metasploit modules. However, none of them worked. All I got was just an error saying that the target OS is not supported. 
![MS17-010 Eternalblue](/static/img/01/02.png)

Even the new MS17-010 module *(exploit/windows/smb/ms17_010_psexec)* didn’t work. 
![New MS17-010](/static/img/01/03.png)

That’s weird. Maybe MSF’s auxiliary module gave me a false positive. Or maybe the authors of the exploit modules forgot to include the support for Windows Embedded. 

![Meme](/static/img/01/04.png)

To verify if the target was really vulnerable, I decided to use the original exploit for MS17-010. So, I fired up **Fuzzbunch** and then used **SMBTouch**. The result showed that the target was actually vulnerable via **EternalBlue**.
![SMBTouch](/static/img/01/05.png)

I then quickly used the EternalBlue module and the result was successful - the backdoor was successfully installed on the target. So I guessed the authors of the MSF exploit modules just forgot to add the support for Windows Embedded version.
![EternalBlue](/static/img/01/06.png)

Since the backdoor was already installed, the last thing that needs to be done to complete the exploitation and gain a shell was to use **DoublePulsar**. First, I generated a shell in DLL format.
![MSFvenom](/static/img/01/07.png)

Then I used **DoublePulsar** to inject the generated DLL to the target host. However, it failed with an error message of `[-] ERROR unrecognized OS string`. I guessed the MSF modules were true after all that the Windows Embedded version was not supported.
![DoublePulsar Failed](/static/img/01/08.png)

With still a few hours left before the engagement ended, I decided to dig deeper and examined DoublePulsar. First, I searched for the error message that I got while attempting to use DoublePulsar. This string was found on the `.text` section at `0x0040376C`. 
![Error String](/static/img/01/09.png)

To have a better understanding on how DoublePulsar ended up with that error message, I decided to follow the program's flow using IDA's graphical view.
![Graph View](/static/img/01/10.png)

As seen from the graphical view, if the target machine is running Windows 7, it will take the **left path**, then proceed to detect whether its architecture is x86 or x64. If the target is not Windows 7, it will take the **right path** and do the other OS checks. Since there’s no check for Windows Embedded, the program ended up outputting the error message `[-] ERROR unrecognized OS string`.
![Program Flow](/static/img/01/11.png)

By analyzing further the **“Windows 7 OS Check”**, I observed that I could “force” the program to take the **left path** by modifying the instruction `jz short loc_403641` to `jnz short loc_403641`.
![Windows7 Check](/static/img/01/12.png)

To do this, I went to **_Edit > Patch program > Change byte_**.
![Change Byte](/static/img/01/13.png)

Then I changed the value `74` _(opcode of **JZ**)_ to `75` _(opcode of **JNZ**)_.
![Patch Bytes](/static/img/01/14.png)

This is what it looked like after modifying the jump instruction. 
![New Instruction](/static/img/01/15.png)

I then created a DIF file by going to **_File > Produce file > Create DIF file..._**. 
![DIF File](/static/img/01/16.png)

Then used  [@stalkr_’s](https://twitter.com/stalkr_) script ([https://stalkr.net/files/ida/idadif.py](https://stalkr.net/files/ida/idadif.py)) in order to patch the modified exe file.
![Patched](/static/img/01/17.png)

Then moved back the **modified Doublepulsar-1.3.1.exe** to its original location.
![Modified DoublePulsar](/static/img/01/18.png)

Using the modified DoublePulsar, I was able to inject the generated DLL payload to the target host.
![DoublePulsar Worked](/static/img/01/19.png)

And gained a **SYSTEM** shell.
![Shell](/static/img/01/20.png)
