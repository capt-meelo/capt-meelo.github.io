---
layout: post
title: "Lessons Learned from Cloning Windows Binaries and Code Signing Implants"
date: 2022-11-07
categories: [redteam, maldev]
description: "Lessons learned and observed while experimenting with code signing and cloning file attributes."
header-img: /static/img/2022-11-07-cloning-signing/cloned-at.exe.gif
image: /static/img/2022-11-07-cloning-signing/cloned-at.exe.gif
---

> _All the lessons I'm sharing here are based on what I learned/observed during my experiment._

[AntiScan.Me](https://antiscan.me/) has always been my choice to check how my implant fares against different AV software/companies. The main reason is they never distribute the scan results _(well, at least that's what they [claim](https://antiscan.me/faq))_ compared to [VirusTotal](https://www.virustotal.com/gui/home/upload). 

Checking the detection (evasion) rate of my implant helps improve my maldev skills. It also forces me to learn and research different evasion techniques which I find challenging and fun. But recently, I got stuck trying to get a **0/26** detection rate. Here's an image showing the detection rate of the implant that I have written.

[![Base Implant](/static/img/2022-11-07-cloning-signing/base-implant.png)](/static/img/2022-11-07-cloning-signing/base-implant.png)

I'm quite happy with the result though since the majority of the AV products failed to detect it. But, I'm not satisfied so I keep thinking and trying different ways to improve the detection rate. After several attempts and testing, nothing worked and the detection rate remains the same. After doing some research, I came across **Code Signing** to make my binary look "trusted" (even though it should not be trusted as it's actually doing malicious things). I don't want to spend a dime purchasing a valid code signing certificate so I opted to use an invalid/spoofed certificate.

```powershell
PS C:\bin> .\signtool.exe sign /v /f .\cert.pfx /fd SHA256 .\base-implant.exe
The following certificate was selected:
    Issued to: www.microsoft.com
    Issued by: Microsoft Azure TLS Issuing CA 06
    Expires:   Sat Sep 30 07:23:11 2023
    SHA1 hash: 1FE9A0EC7C3D307369DF61348838DC12F3FAE024

Done Adding Additional Store
Successfully signed: .\base-implant.exe

Number of files successfully Signed: 1
Number of warnings: 0
Number of errors: 0
```

The `cert.pfx` file used from the above command was derived from a certificate and key created from the `www.microsoft.com` domain.
```powershell
PS C:\bin> certutil.exe -dump .\cert.pfx
Enter PFX password:
================ Certificate 0 ================
================ Begin Nesting Level 1 ================
Element 0:
Serial Number: 330059f8b6da8689706ffa1bd900000059f8b6
Issuer: CN=Microsoft Azure TLS Issuing CA 06, O=Microsoft Corporation, C=US
 NotBefore: 10/5/2022 7:23 AM
 NotAfter: 9/30/2023 7:23 AM
Subject: CN=www.microsoft.com, O=Microsoft Corporation, L=Redmond, S=WA, C=US
Signature matches Public Key
Non-root Certificate uses same Public Key as Issuer
Cert Hash(sha1): 1fe9a0ec7c3d307369df61348838dc12f3fae024
----------------  End Nesting Level 1  ----------------
  Provider = Microsoft Enhanced Cryptographic Provider v1.0
Encryption test passed
CertUtil: -dump command completed successfully.
```

Here's what the signed implant looks like and it is clearly shown that it was signed with an invalid certificate.

[![Invalid Cert](/static/img/2022-11-07-cloning-signing/invalid-cert1.png)](/static/img/2022-11-07-cloning-signing/invalid-cert1.png)

Based on the scan result, the detection rate improved from **6/26** to **3/26**. This signifies that code signing works (or simply fools some AVs) even with an invalid certificate.

[![Signed Implant](/static/img/2022-11-07-cloning-signing/signed-implant.png)](/static/img/2022-11-07-cloning-signing/signed-implant.png)

> _**LESSON #1:** Signed binaries are less investigated by some AV software. This means using a spoofed/invalid certificate works because there are AVs that don't verify the validity of the digital certificate used._

Obsessed with improving the detection rate, I decided to time-stamp my signed implant, using `http://timestamp.digicert.com` as the Time Stamp Authority (TSA) server, to make it more "trusted" and "verified"?

```powershell
PS C:\bin> .\signtool.exe timestamp /v /tr http://timestamp.digicert.com /td SHA256 .\signed-implant.exe
Successfully timestamped: .\signed-implant.exe

Number of files successfully timestamped: 1
Number of errors: 0
```

Now here's what the time-stamped binary looks like.

[![Invalid Cert with Time Stamp](/static/img/2022-11-07-cloning-signing/invalid-cert2.png)](/static/img/2022-11-07-cloning-signing/invalid-cert2.png)

Did I get a better result? I'm quite disappointed because nothing changed and the detection rate stays at **3/26**.

[![Time Stamped Implant](/static/img/2022-11-07-cloning-signing/timestamped-implant.png)](/static/img/2022-11-07-cloning-signing/timestamped-implant.png)

My disappointment did not stop me so I keep on thinking and trying different methods. Out of curiosity, I decided to change the TSA server and used `http://sha256timestamp.ws.symantec.com/sha256/timestamp` instead.

```powershell
PS C:\bin> .\signtool.exe timestamp /v /tr http://sha256timestamp.ws.symantec.com/sha256/timestamp /td SHA256 .\timestamped-implant.exe
Successfully timestamped: .\timestamped-implant.exe

Number of files successfully timestamped: 1
Number of errors: 0
```

[![Invalid Cert with New TSA server](/static/img/2022-11-07-cloning-signing/invalid-cert3.png)](/static/img/2022-11-07-cloning-signing/invalid-cert3.png)

Surprisingly, it worked and I now achieved the detection rate that I wanted!

[![Time Stamped Changed Implant](/static/img/2022-11-07-cloning-signing/timestamped-implant2.png)](/static/img/2022-11-07-cloning-signing/timestamped-implant2.png)

> _**LESSON #2:** AV products behave differently depending on the TSA server used to time-stamp the binary._

I want to further investigate this observation. However, [AntiScan.Me](https://antiscan.me/) only allows 4 submissions per IP each day and I don't have the luxury of time/resources to do it. Anyway, if you want to further explore this observation, here's a [list of free RFC 3161 TSA servers](https://gist.github.com/Manouchehri/fd754e402d98430243455713efada710).

Now that I got what I wanted, it's time to celebrate! Well... **NO**! Because as soon as my implant touches the disk of my target system (Windows 11 with up-to-date Windows Defender engine), it is caught immediately.

[![Signed Implant Detected](/static/img/2022-11-07-cloning-signing/signed-implant-detected.png)](/static/img/2022-11-07-cloning-signing/signed-implant-detected.png)

How did Windows Defender flag my implant when [AntiScan.Me](https://antiscan.me/) told me I got a 0/26 detection rate? How is that possible? I don't even know how to answer my questions because I don't have an idea how the different AV products within [AntiScan.Me](https://antiscan.me/) actually works!

> _**LESSON #3:** Don't fully rely on online AV scanning tools/websites. While these online services make life easier since we can test our binary on different AV vendors and get the results at once, nothing beats testing your implant on a local and isolated machine._

Is there a way to evade Windows Defender in this scenario? What if I make my implant look like a Microsoft-signed binary? To do that, I looked for signed binaries within the `C:\Windows\System32\` directory and ended up with `RuntimeBroker.exe`. I cloned this file's attributes into my implant, signed then time-stamped my implant with an invalid `www.microsoft.com` certificate, and rename it to `RuntimeBroker.exe`. Here's what my implant looks like.

[![Cloned & Signed RuntimeBroker.exe](/static/img/2022-11-07-cloning-signing/cloned-runtimebroker.png)](/static/img/2022-11-07-cloning-signing/cloned-runtimebroker.png)

I was very hopeful it will work but sadly, Windows Defender detected it as soon as it touches the disk.

[![Cloned & Signed RuntimeBroker.exe Detected](/static/img/2022-11-07-cloning-signing/cloned-binary-detected.png)](/static/img/2022-11-07-cloning-signing/cloned-binary-detected.png)

Maybe it was detected because I spoofed a Microsoft domain to sign a cloned Microsoft binary, and Windows Defender could easily verify the authenticity of the certificate and the binary since Microsoft owned them. Maybe, maybe not. Who knows?

As a further investigation, I tried cloning only the file attributes of `RuntimeBroker.exe` but did not sign it. And the result is still the same.

[![Cloned & Unsigned RuntimeBroker.exe Detected](/static/img/2022-11-07-cloning-signing/cloned-unsigned-detected.png)](/static/img/2022-11-07-cloning-signing/cloned-unsigned-detected.png)

I already expected this to happen though since the original and legit copy of `RuntimeBroker.exe` is signed by Microsoft.

[![Legit RuntimeBroker.exe](/static/img/2022-11-07-cloning-signing/legit-runtimebroker.png)](/static/img/2022-11-07-cloning-signing/legit-runtimebroker.png)

But what if I clone the file attributes of an unsigned Windows binary? This time, I opted to clone `C:\Windows\System32\at.exe` and did not bother signing it since the original/legit copy is not signed. As soon as my implant touches the disk, Windows Defender did not detect it. Even when executed and the shell was received, Windows Defender also failed.

> _**LESSON #4:** There are tons of Windows binaries (signed/unsigned and/or installed by default or not) so the above observation might not be true 100%. However, based on my experiment, I would say cloning and code-signing Windows binaries comes with a risk. So make sure to thoroughly test your implant if you opted to use cloning and code signing._

[![Cloned at.exe](/static/img/2022-11-07-cloning-signing/cloned-at.exe.gif)](/static/img/2022-11-07-cloning-signing/cloned-at.exe.gif)

However, as soon as I used meterpreter's `shell` command (as shown above), Windows Defender alerted with `Behavior:Win32/Meterpreter.D`. Despite the alert, my meterpreter shell did not die and when I used the `shell` command for the second time, Windows Defender alert did not pop out again.
 
> _**LESSON #5:** Being able to download and execute your implant undetected does not necessarily mean the job is done and you won't get caught. So don't forget to implement some in-memory evasion techniques._

## Conclusion

After spending some time with this experiment and trying to achieve what I wanted (0 detection rate), I realized an important lesson (at least for me).

> _**LESSON #6:** Don't be obsessed or force a 0 detection rate. If we don't know the security solution running on our target, we ideally wanted to aim for a 0 detection rate. However, the time spent (or wasted) achieving a 0 detection rate could instead be used for information gathering to identify the AV/EDR installed on our target. Using this information, we can then solely focus on evading that particular product._

Before I end this post, I would like to leave these additional lessons.

> _**LESSON #7:** When cloning file attributes, don't limit yourself to Windows binaries. Beware though and ensure that the binary you wanted to clone and execute on your target must be present/installed and/or most likely being used/run on that machine. What I mean is you obviously don't want to clone and execute an iTunes binary when your target is a Windows Server._

> _**LESSON #8:** No detection does not mean no alert/notification will be sent to the blue team._

> _**LESSON #9:** Signing an implant with a spoofed certificate might have LEGAL consequences. Do it at your own risk and be responsible._

That's it for this post. Again, these are my opinions which are based on what I have observed during my experiment. There's no guarantee that you'll see the same observations and that all lessons shared here will work in your environment and all scenarios.

**Remember, evasion is always a cat-and-mouse game.**