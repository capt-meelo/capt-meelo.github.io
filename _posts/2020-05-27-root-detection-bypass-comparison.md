---
layout: post
title: "Comparison of Different Root-Detection Bypass Tools"
date: 2020-05-27
categories: mobile
description: "This research shows the effectiveness of different root-detection tools. The goal is to have a “go-to” tool when bypassing an app’s root-detection implementation."
header-img: /static/img/2020-05-27-root-detection-bypass-comparison/results.png
image: /static/img/2020-05-27-root-detection-bypass-comparison/results.png
---

## Introduction

When testing Android applications, it is recommended to use a rooted device to perform the assessment efficiently and thoroughly. However, some applications have an additional layer of protection, which prevents an application from running on a rooted device. When presented with this scenario, one of the restrictions a tester need to overcome is the root-detection mechanism used by the application.

Several tools already exist to defeat an application’s root-detection mechanisms. But which one performs best? To answer this question, I decided to perform a comparison between these root-detection bypass tools. The goal of this experiment is to identify which tool performs best and to help analysts to have a “go-to” tool when bypassing an app’s root-detection implementation.

The target application used here is [**RootBeer Sample (v0.8)**](https://play.google.com/store/apps/details?id=com.scottyab.rootbeer.sample&hl=en); a sample app which utilizes the [**RootBeer**](https://github.com/scottyab/rootbeer) library.

## What is RootBeer?

[**RootBeer**](https://github.com/scottyab/rootbeer) is an open-source library which can be used by developers to verify the integrity of an Android device and check whether it is rooted or not. RootBeer performs the following checks as an indication of root:

- Presence of apps used to manage superuser/root access (e.g., `eu.chainfire.supersu` and `com.topjohnwu.magisk`)
- Installation of apps that require root (e.g., `com.keramidas.TitaniumBackup` and `com.chelpus.luckypatcher`)
- Detection of root-cloaking apps which can hide the root status of a device (e.g, `com.devadvance.rootcloak2`)
- Review of the build properties (`android.os.Build.TAGS`) for test-keys
- Locations of binaries, such as `busybox` and `su`, which are usually present in a rooted device (e.g., `/system/xbin/"` and `/su/bin/`)
- Analysis of system folders that should not be writable (e.g., `/system`)
- Look up of system properties that can only be changed when the device is rooted (e.g., `ro.debuggable` and `ro.secure`)

## Test Setup

The following Android device was used for this experiment:

- **Device:** Lenovo P8 (TB-8703F)
- **Android Version:** Pie (9.0)
- **ROM:** PixelExperience

This device was installed with the following applications which use and require root permissions:

- [Magisk](https://github.com/topjohnwu/Magisk)
- [EdXposed](https://github.com/ElderDrivers/EdXposed)
- [BusyBox](https://play.google.com/store/apps/details?id=ru.meefik.busybox)
- [Titanium Backup](https://play.google.com/store/apps/details?id=com.keramidas.TitaniumBackup)
- [Lucky Patcher](https://www.luckypatchers.com/)
- [ADBManager](https://f-droid.org/en/packages/com.matoski.adbm/)

As a baseline for this experiment, **RootBeer Sample** was executed without any root-detection bypass tool used. Using this baseline setup, 6/11 checks failed.

[![Result Taken from the Baseline Setup](/static/img/2020-05-27-root-detection-bypass-comparison/baseline.png)](/static/img/2020-05-27-root-detection-bypass-comparison/baseline.png)

## List of Tools

This experiment only covered the following well-known and open-source root-detection bypass tools:

- [RootCloak](https://repo.xposed.info/module/com.devadvance.rootcloak2) 
- [UnRootBeer](https://github.com/jakev/unrootbeer)
- [Fridantiroot](https://codeshare.frida.re/@dzonerzy/fridantiroot/)
- [Objection](https://github.com/sensepost/objection)
- [Magisk](https://github.com/topjohnwu/Magisk)
- [MagiskHide](https://www.didgeridoohan.com/magisk/MagiskHide)

**Tool #1: RootCloak**

[RootCloak](https://repo.xposed.info/module/com.devadvance.rootcloak2) is a very popular Xposed module that can be used to hide the root status of a device. Even though the module's repo page states "_with 5.x and 6.x support_" and my device was running Android 9.0, I still tried it. 

RootCloak is very simple to use. Just add the target application (**RootBeer Sample** in this case) and you're good to go.

[![Adding RootBeer Sample to RootCloak](/static/img/2020-05-27-root-detection-bypass-comparison/rootcloak-add.png)](/static/img/2020-05-27-root-detection-bypass-comparison/rootcloak-add.png)

Surprisingly, RootCloak bypassed some checks used by RootBeer library. Even though there's no official statement that the module supports Android 9.0, it still worked. Using RootCloak, 7/11 checks were bypassed.

[![RootCloak Result](/static/img/2020-05-27-root-detection-bypass-comparison/rootcloak-result.png)](/static/img/2020-05-27-root-detection-bypass-comparison/rootcloak-result.png)

**Tool #2: UnRootBeer**

The next tool is [UnRootBeer](https://github.com/jakev/unrootbeer), which is another Xposed module specifically developed to disable the checks performed by RootBeer library. To use this tool, just install the [APK file](https://github.com/jakev/unrootbeer/raw/master/out/jakev.unrootbeer-debug.apk), and reboot the device to activate the module.

As seen from the result below, UnRootBeer performed better than RootCloak as it passed 8/11 checks. While this tool was specifically developed to bypass the checks being performed by RootBeer library, it is not surprising that it failed some checks because this tool has not been updated for quite some time.

[![UnRootBeer Result](/static/img/2020-05-27-root-detection-bypass-comparison/unrootbeer-result.png)](/static/img/2020-05-27-root-detection-bypass-comparison/unrootbeer-result.png)

> _Be wary though because while three checks failed, the result still says **NOT ROOTED**. The goal of this experiment is to pass all RootBeer library checks._

**Tool #3: Fridantiroot**

The next tool involves [Frida](https://frida.re/), which is a dynamic instrumentation toolkit that can be used to tamper an application's process. For this experiment, the publicly available JS script ([Fridantiroot](https://codeshare.frida.re/@dzonerzy/fridantiroot/)) was used. However, this script didn't work on my device (at the time of doing this experiment).

[![Error Upon Running Fridantiroot](/static/img/2020-05-27-root-detection-bypass-comparison/fridantiroot-error.png)](/static/img/2020-05-27-root-detection-bypass-comparison/fridantiroot-error.png)

Luckily, I found a [modified version of Fridantiroot](https://gist.github.com/pich4ya/0b2a8592d3c8d5df9c34b8d185d2ea35) which worked on my device.

[![Running the Modified Version of Fridantiroot](/static/img/2020-05-27-root-detection-bypass-comparison/fridantiroot-worked.png) ](/static/img/2020-05-27-root-detection-bypass-comparison/fridantiroot-worked.png)

The result was very surprising because it almost passed all the checks, with a score of 10/11. 

[![Fridantiroot Result](/static/img/2020-05-27-root-detection-bypass-comparison/fridantiroot-result.png)](/static/img/2020-05-27-root-detection-bypass-comparison/fridantiroot-result.png)

> _Please note that one of the checks failed and yet the app still considered it as **NOT ROOTED**._

**Tool #4: Objection**

[Objection](https://github.com/sensepost/objection) is a runtime toolkit powered by Frida. Using the command `android root disable`, objection will attempt to bypass an app's root-detection mechanism.

[![Running Objection](/static/img/2020-05-27-root-detection-bypass-comparison/objection-running.png)](/static/img/2020-05-27-root-detection-bypass-comparison/objection-running.png)

As seen below, objection's root-detection bypass command didn't provide a pleasing result, as it only passed 5 out of 11 checks.

[![Objection Result](/static/img/2020-05-27-root-detection-bypass-comparison/objection-result.png)](/static/img/2020-05-27-root-detection-bypass-comparison/objection-result.png)

**Tool #5: Magisk Hide**

One of the features of [Magisk](https://github.com/topjohnwu/Magisk) is [Magisk Hide](https://www.didgeridoohan.com/magisk/MagiskHide), which can be used to bypass root-detection and system integrity checks.

Since Magisk v20.4, Magisk Hide is disabled by default. To enable this feature, open **Magisk Manager**, click **Settings** from the sidebar, toggle **ON** the **Magisk Hide** option, and restart the app.

[![Enable MagiskHide](/static/img/2020-05-27-root-detection-bypass-comparison/magiskhide-enable.png)](/static/img/2020-05-27-root-detection-bypass-comparison/magiskhide-enable.png)

> _Take note that **Magisk Hide** and **Frida** do not work well together. To use one of them, the other one must be disabled first._

Bypassing an app's root-detection mechanism is as simple as adding the app to the Hide list (just like in RootCloak).

[![Adding RootBeer Sample to Magisk Hide List](/static/img/2020-05-27-root-detection-bypass-comparison/magiskhide-add-app.png)](/static/img/2020-05-27-root-detection-bypass-comparison/magiskhide-add-app.png)

After adding **RootBeer Sample** to Magisk Hide, the result was a near-perfect score, with 10 out of 11 checks were passed.

[![MagiskHide Result](/static/img/2020-05-27-root-detection-bypass-comparison/magiskhide-result.png)](/static/img/2020-05-27-root-detection-bypass-comparison/magiskhide-result.png)

**Tool #5: Hiding Magisk Manager**

Looking back at the result of using Magisk Hide, only the first check (Root Management Apps) failed. This was because one of the checks used by RootBeer library is to look for the presence of root management apps, such as **Magisk Manager** (`com.topjohnwu.magisk`).

Since Magisk v20.1, a new feature was introduced that could repackage Magisk Manager with a random package and app names. To use this feature, click the **Settings** option from the sidebar, click the **Hide Magisk Manager** option, and set Magisk Manager's new app name.

[![Hiding Magisk Manager](/static/img/2020-05-27-root-detection-bypass-comparison/hidemanager-enable.png)](/static/img/2020-05-27-root-detection-bypass-comparison/hidemanager-enable.png)

After doing the above steps and using this feature, Magisk Manager’s package name changed to a random one.

[![Before and After Hiding Magisk Manager](/static/img/2020-05-27-root-detection-bypass-comparison/hidemanager-before-after.png)](/static/img/2020-05-27-root-detection-bypass-comparison/hidemanager-before-after.png)

So how did it perform? Well, it did not do well and only 7 checks passed.

[!["Hide Magisk Manager" Result](/static/img/2020-05-27-root-detection-bypass-comparison/hidemanager-result.png)](/static/img/2020-05-27-root-detection-bypass-comparison/hidemanager-result.png)

**Tool #5: Magisk Hide + Hiding Magisk Manager**

Since Magisk Hide and Hide Magisk Manager are both features of Magisk, why not use both features at the same time? It turned out that this was what we’re aiming for. The result was outstanding! The result stating that it is **NOT ROOTED** was valid since all checks passed.

[![Magisk Hide + Hiding Magisk Manager Result](/static/img/2020-05-27-root-detection-bypass-comparison/magisk-result.png)](/static/img/2020-05-27-root-detection-bypass-comparison/magisk-result.png)

## Results

For ease of viewing, the following table summarizes the results obtained from this experiment.

[![Summary of Results](/static/img/2020-05-27-root-detection-bypass-comparison/results.png)](/static/img/2020-05-27-root-detection-bypass-comparison/results.png)

Among all the tools covered in this experiment, only Magisk’s features (Magisk Hide and Hiding Magisk Manager) gave the best result.

## Final Thoughts

While the goal of this experiment is to have a “go-to” tool when bypassing root-detection mechanisms, testers should be aware that the results gathered here will not always be the same against every application. This is because app developers can modify and improve the RootBeer library by adding more checks, or they could use their custom anti-root solutions. Thus, I encourage analysts to also learn how to reverse engineer an application and bypass an app’s root-detection manually.

Lastly, no root-detection mechanism can ever be perfect. That’s why it is recommended to implement additional security measures to make a bypass more difficult to achieve. Such measures include the use of run-time protections, as well as anti-reversing and anti-tampering solutions.