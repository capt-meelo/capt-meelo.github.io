---
layout: post
title:  "Offensive Security Certifications - Are They Still Worth Taking?"
date:   2019-01-15
categories: pentest
---

## Introduction
![Offsec](/static/img/11/offsec.png)


Offensive Security certifications are very popular and the most sought-after courses/certifications by people who are interested in the offensive side of information security. Until now, people are still willing to spend their money to take the courses and pass the certifications. However, several companies out there are establishing their own hacking courses/certifications/labs, and they're starting to become popular among the folks of the penetration testing community. With the rise of several courses, the question is "**Are Offensive Security courses/certifications still worth taking? Are they still worth the price?**" Or is it wiser to spend money elsewhere? 



I think it's time to write my thoughts about them now that I have completed OSCE, OSCP, and OSWP certifications. 


>_**Take note that everything written here is based on my own opinion and views. I do not have any intentions to discourage people from taking Offensive Security's courses and certifications. No hate or bitterness against Offensive Security.**_

## OSCP
![OSCP](/static/img/11/oscp.png)


Let's start with the most popular certification of Offensive Security - OSCP. This is the most sought-after certification by people who wanted to get into penetration testing. Nowadays, everyone want this certification on their CV because of the higher chance of acceptance in the hiring process. Almost every job posting for a pentest position requires OSCP certification. The course material is great and it teaches the skills, mindset, and methodology needed to get the students started with their hacking journey. However, the material is limited. Based on my experience, I was not able to utilized what I learned from this course when I started doing internal network and active directory pentesting. While the lab teaches students how to pivot from one machine/network to another, the lab still doesn't mimic the real-world corporate environment. The course does not cover Man-in-the-Middle attacks as well, which is the most common attack used by pentesters when doing an internal network testing. 


In my opinion, if you're the kind of person who's after for the knowledge and skills, and don't mind having the certification, it's better to check [Hack The Box (HTB)][htb]. You'll find that the machines in HTB is similar to the PWK lab. Another great thing is that HTB is way cheaper than PWK lab. Also, if you want to practice your active directory pentesting skills, HTB has the Pro labs **Offshore** and **RastaLabs**. You can also check Pentester Academy's [Windows Red Team Lab][redteam] which focuses on red teaming. I haven't signed up to this course, but I heard a lot of good things about it. It's kind of pricey though compared to HTB's Pro labs, but it's still better than PWK lab. 


## OSCE
![OSCE](/static/img/11/osce.png)


OSCE is my latest certifcation. The exploit development section of the CTP course focuses only on Windows environment. Some might think it’s one of the cons of this course, but for me, it’s not. I don’t mind if exploit development on Linux environment isn’t covered. My biggest concern is the lack of value of the course material. We know that Offensive Security always want their students to do the extra mile and to “try harder” - meaning they expect us to research related materials about a topic, and not just rely on what is presented from the course material. I get their motives and even support the need to go the extra mile. My problem is that the information from the course is lacking, and there is no deep explanation of some of the topics. Since I paid for the course material, I expected to learn a lot from it. Unfortunately, that’s not the case. **I learned and gained more knowledge from [Corelan's][corelan] and [FuzzySecurity’s][fuzzysec] tutorials, and from googling.**


For me, the lab is a waste of money because **you don’t need lab access to practice what’s being taught in the course.** If you refer to the [syllabus][osce-syllabus], you can easily set up your own lab environment by spinning up some VMS and installing vulnerable softwares. This is what I did - before signing up to the course, I practiced on my own lab by following the syllabus provided by Offensive Security. I highly recommend doing this especially for those who have a slow network connection like mine. With these, I think the CTP course is not worth taking. If there’s an option to pay only for the exam (excluding the course), I would definitely do it.


The exam is a different scenario. I find it gruelling and challenging, yet at the same time enjoyable. If you’re like me who’s not very experienced in exploit development, you’ll learn new things while doing the exam. I can say that taking exam is worth the money, time, and effort. 
<br>

## OSWP
![OSWP](/static/img/11/oswp.png)


With all honesty, I took OSWP for the sake of having it on my CV. As we all know, the contents of this course are very outdated. While the course teaches you the knowledge you need, the value you’re getting is minimal. I recommend you just spend your money on other courses like [Pentester Academy’s Wi-Fi Security and Pentesting][wifi] as you’ll learn more from this course as Vivek really spends his time and effort in explaining the topic deeply. 


Another issue I have with this certification is that the name is misleading. OSWP stands for Offensive Security **Wireless** Professional, and yet the course only teaches you about WiFi. It would have been better if the course includes Bluetooth, Zigbee, RFID, Smart Cards, NFC, SDR, and other wireless technologies. 


If you have the money and wanted to learn more about wireless hacking (aside from WiFi), I think the [SANS SEC617][sec617] course is worth taking. If you don’t want to spend on expensive courses, you can sign up to Pentester Academy and take their [Wi-Fi Security and Pentesting][wifi] course. If you are cheap and don’t want to spend at all, just watch some videos on Youtube, and read blogs. Several tutorials on the web are out there waiting for you to read and watch.

Among Offensive Security’s courses, **I think this is the most disappointing and not worth-taking**.


## How About OSWE and OSEE?


I haven’t taken these courses/certifications since they’re not yet available online. However, there’s a rumor on [reddit][oswe] that the AWAE course will become online. I also heard that the course is now being updated. Since I haven’t taken the course yet, I don't have much to say about it. I’ll definitely take this course for the sake of having it on my CV. If you can’t wait for the online version of AWAE course, and don’t want to spend thousands of dollars, I suggest you take a look at [PentesterLab Pro][pentestlab].


For AWE/OSEE, I don't have much to say as well since I haven’t taken the course/certification yet. Regarding the course’s online availability, I read from [Jollyfrog’s blog] that it will be online by early 2020. However, some said that the online version might not happen since the course is being updated yearly. I also heard that this is the hardest exploit development course. If you're looking for a prep course, I think [Prace Security's Advanced Software Exploitation][ptrace] is good based on its syllabus. I also haven't taken this course yet so no review about it.


Again, these are just my opinions since I haven't taken both AWAE and AWE courses.


## Conclusion

If you love challenges, and really need the certifications on your CV, go ahead and take the Offensive Security courses. However, if you are the type of person who always want the best value out of your pocket, I suggest you look for other courses since these courses are not worth the money anymore. I'm still taking Offensive Security certifications because they don't expire and are still valuable in my CV. 


Another thing, I'm not a fan of certifications in a sense that people should choose knowledge and skills over certification. I know a lot of people who are not certified but very skilled and talented in the infosec field, thus making them more valuable than those who are certified. It's not about the certifications that you can add in your CV and hang in your wall, but it's more about the skills and the knowledge that you can gain. **Take the course for the sake of knowledge and skills, not just for the sake of being certified.**


If you're like me who does not earn much and who is frugal, keep on searching the web for a particular topic that you need and want to learn. There are a lot of people/companies who freely provide tutorials, writeups, and courses. Good examples of these are [Open Security Training][open] and [Sam Bowne][samclass]. Remember, always **be resourceful**.

[htb]: https://www.hackthebox.eu/
[redteam]: https://www.pentesteracademy.com/redteamlab
[corelan]: https://www.corelan.be/index.php/articles/
[fuzzysec]: http://www.fuzzysecurity.com/tutorials.html
[osce-syllabus]: https://www.offensive-security.com/documentation/cracking-the-perimeter-syllabus.pdf
[wifi]: https://www.pentesteracademy.com/course?id=9
[sec617]: https://www.sans.org/course/wireless-penetration-testing-ethical-hacking
[oswe]: https://old.reddit.com/r/netsecstudents/comments/a3s5ag/offsec_is_making_the_awae_course_online_about_time/
[pentestlab]: https://pentesterlab.com/
[osee]: https://www.jollyfrogs.com/osee-awestralia-2018-preparations/
[ptrace]: https://www.psec-courses.com/courses/advanced-software-exploitation
[open]: http://opensecuritytraining.info/Training.html
[samclass]: https://samsclass.info/

