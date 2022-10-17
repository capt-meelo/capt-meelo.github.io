---
layout: post
title: "Bypassing Android’s RootBeer Library (Part 1)"
date: 2020-05-29
categories: mobile
description: "How to bypass the different checks used by RootBeer library by changing the application’s process through code manipulation."
header-img: /static/img/2020-05-29-bypass-rootbeer-part1/isrooted-class.png
image: /static/img/2020-05-29-bypass-rootbeer-part1/isrooted-class.png
---

## Introduction

In my previous post, I made a comparison between the different well-known and open-source root-detection bypass tools for Android. In that post, I encouraged analysts to learn how to reverse engineer an application and bypass an application’s protection manually.

This post is a follow up on how to bypass the different checks used by RootBeer library by changing the application’s process through code manipulation.

## First Attempt

Before you could modify an application’s code, you first need to have a copy of the APK file. After downloading the application ([RootBeer Sample](https://play.google.com/store/apps/details?id=com.scottyab.rootbeer.sample)) from the Play Store, the following series of commands can be used to extract the APK file from the Android device.

```bash
$ adb shell pm path com.scottyab.rootbeer.sample
$ adb pull <apk-path>
```

If you’re like me and do not like typing series of commands, the easiest way to retrieve an APK file from a device is by using [Frida Android Helper](https://github.com/Hamz-a/frida-android-helper).

[![Retrieving an Application’s APK File with Frida Android Helper](/static/img/2020-05-29-bypass-rootbeer-part1/download-apk.png)](/static/img/2020-05-29-bypass-rootbeer-part1/download-apk.png)

Once you have a copy of the APK file, decompile it using [apktool](https://ibotpeaches.github.io/Apktool/).

[![Decompiling the APK File with apktool](/static/img/2020-05-29-bypass-rootbeer-part1/decompile-apk.png)](/static/img/2020-05-29-bypass-rootbeer-part1/decompile-apk.png)

> _**Tip 1**: Sometimes, rebuilding a decompiled application results in an error. One way to fix that error is by removing the file **1.apk** (highlighted above) before rebuilding the app._

> _**Tip 2**: If an error related to “resources” shows during the building process, try excluding the resources during the decompilation by using the `-r` flag (shown below)._

[![Excluding Resources During Decompilation](/static/img/2020-05-29-bypass-rootbeer-part1/no-resource.png)](/static/img/2020-05-29-bypass-rootbeer-part1/no-resource.png)

Reading smali code is not as easy as reading java code. So if you’re not comfortable with smali, you can open the APK file in [jadx-gui](https://github.com/skylot/jadx) to view its java equivalent and use it as a reference to gain better understanding.

[![Using jadx-gui to Analyse an Application’s Code](/static/img/2020-05-29-bypass-rootbeer-part1/jadx.png)](/static/img/2020-05-29-bypass-rootbeer-part1/jadx.png)

Looking at the **RootBeer** (`com.scottyab.rootbeer.RootBeer`) class, there exists a function called `isRooted()` which, as per its name, is responsible for identifying whether the device is rooted.

[![Snippet of the RootBeer Class](/static/img/2020-05-29-bypass-rootbeer-part1/isrooted-class.png)](/static/img/2020-05-29-bypass-rootbeer-part1/isrooted-class.png)

The equivalent smali code of this class is located in `/decompiled/smali/com/scottyab/rootber/RootBeer.smali`. From this smali code, the `isRooted()` function is located on line **1084** (as shown below).

[![Snippet of the isRooted Function](/static/img/2020-05-29-bypass-rootbeer-part1/smali-code.png)](/static/img/2020-05-29-bypass-rootbeer-part1/smali-code.png)

On line **1158**, it can be seen that the `isRooted()` function returns whatever value the variable `v0` holds. To force this function to return the value of false, just change the value of the variable `v0` from `0x1` to `0x0` (shown in line **1155**).

[![Forcing isRooted() Function to Return “False”](/static/img/2020-05-29-bypass-rootbeer-part1/before-after-modification.png)](/static/img/2020-05-29-bypass-rootbeer-part1/before-after-modification.png)

After doing the necessary changes, rebuild the application using apktool.

[![Rebuilding the Modified Application](/static/img/2020-05-29-bypass-rootbeer-part1/repack.png)](/static/img/2020-05-29-bypass-rootbeer-part1/repack.png)

Before installing the application, make sure to sign it using your own certificate or a debug certificate. To sign the application easily, you can use [uber-apk-signer](https://github.com/patrickfav/uber-apk-signer).

[![Signing the Application with a Debug Certificate](/static/img/2020-05-29-bypass-rootbeer-part1/sign.png)](/static/img/2020-05-29-bypass-rootbeer-part1/sign.png)

Using the modified application, it can be seen that we’ve successfully forced the result to "**NOT ROOTED**" (see the right image below). However, nothing changed with the different checks used by RootBeer; some of the checks still failed.

[![Result of Modifying the APK File](/static/img/2020-05-29-bypass-rootbeer-part1/result.png)](/static/img/2020-05-29-bypass-rootbeer-part1/result.png)

This happened because we only modified one function of the application and forced it to return as "**NOT ROOTED**". To pass all the checks used by the RootBeer library, we need to modify and bypass all the relevant functions.

## Second Attempt

So how can we find all these functions? If we look at the **RootCheckTask** (`com.scottyab.rootbeer.sample.CheckRootTask`) class, there’s a function called `doInBackground()` which can be used to identify the different functions/checks used by RootBeer. This list of functions can be used as a reference to determine which smali code/files to modify.

[![A Snippet of the Different Functions Used by RootBeer](/static/img/2020-05-29-bypass-rootbeer-part1/checks.png)](/static/img/2020-05-29-bypass-rootbeer-part1/checks.png)

The following lists the changes that were made to the relevant classes and functions to bypass all of RootBeer’s checks.

> _**Note**: **bold text** in the code snippets below signifies the changes that were made._

**RootBeer (com.scottyab.rootbeer.RootBeer) Class**

- `detectRootManagementApps()` - inserted `return v0`.

<pre><code>
.method public detectRootManagementApps()Z
    .locals 1    
    
    const/4 v0, 0x0
    <strong>return v0</strong>

[...]
</code></pre>

- `detectPotentiallyDangerousApps()` - inserted `return v0`.

<pre><code>
.method public detectPotentiallyDangerousApps()Z
    .locals 1    
    
    const/4 v0, 0x0
    <strong>return v0</strong>

[...]
</code></pre>

- `detectTestKeys()` - changed `const/4 v0, 0x1` to `const/4 v0, 0x0`.

<pre><code>
.method public detectTestKeys()Z
[...]  
    
    const/4 v0, 0x0
    
    goto :goto_0
    
    :cond_0
    <strong>const/4 v0, 0x0</strong>
    
    :goto_0
    return v0
</code></pre>

- `checkForBusyBoxBinary()` - changed `move-result v0` to `const/4 v0, 0x0`.

<pre><code>
.method public checkForBusyBoxBinary()Z
[...]  
    
    <strong>const/4 v0, 0x0</strong>

    return v0
.end method
</code></pre>

- `checkForSuBinary()` - changed `move-result v0` to `const/4 v0, 0x0`.

<pre><code>
.method public checkForSuBinary()Z
[...]  
    
    <strong>const/4 v0, 0x0</strong>

    return v0
.end method
</code></pre>

- `checkSuExists()` - inserted `return v0`.

<pre><code>
.method public checkSuExists()Z
    .locals 6 
    
    const/4 v0, 0x0
    <strong>return v0</strong>
    const/4 v1, 0x0

[...]
</code></pre>

- `checkForRWPaths()` - inserted `return v1`.

<pre><code>
.method public checkForRWPaths()Z
    .locals 16

    .line 301
    invoke-direct/range {p0 .. p0}, Lcom/scottyab/rootbeer/RootBeer;->mountReader()[Ljava/lang/String;
    
    move-result-object v0

    const/4 v1, 0x0
    <strong>return v1</strong>

[...]
</code></pre>

- `checkForDangerousProps()` - changed `const/4 v4, 0x1` to `const/4 v4, 0x0`.

<pre><code>
.method public checkForDangerousProps()Z
[...]

    invoke-static {v4}, Lcom/scottyab/rootbeer/util/QLog;->v(Ljava/lang/Object;)V
    
    <strong>const/4 v1, 0x0</strong>

    goto :goto_1

    :cond_2
    add-int/lit8 v2, v2, 0x1

    goto :goto_0
    
    :cond_3
    return v4
.end method
</code></pre>

- `checkForRootNative()` - changed `const/4 v1, 0x1` to `const/4 v1, 0x0`.

<pre><code>
.method public checkForRootNative()Z
[...]

    if-lez v0, :cond_2
    
    <strong>const/4 v1, 0x0</strong>

    :catch_0
    :cond_2
    return v1
.end method
</code></pre>

- `detectRootCloakingApps()` - changed `const/4 v0, 0x1` to `const/4 v0, 0x0`.

<pre><code>
.method public detectRootCloakingApps()Z
[...]

    :cond_1
    :goto_0
    
    <strong>const/4 v0, 0x0</strong>

    :goto_1
    return v0
.end method
</code></pre>

- `checkForMagiskBinary()` - changed `move-result v0` to `const/4 v0, 0x0`.

<pre><code>
.method public checkForMagiskBinary()Z
[...]
    
    <strong>const/4 v0, 0x0</strong>

    return v0
.end method
</code></pre>

**Utils (com.scottyab.rootbeer.util) Class**

- `isSelinuxFlagInEnabled()` - inserted `return v0`.

<pre><code>
.method public static isSelinuxFlagInEnabled()Z
    .locals 6
    
    const/4 v0, 0x0
    <strong>return v0</strong>

[...]
</code></pre>

After doing the above changes, the last thing to do is to rebuild, resign, and re-install the modified application.

[![Rebuilding, Resigning, and Re-installing the Modified Application](/static/img/2020-05-29-bypass-rootbeer-part1/final-step.png)](/static/img/2020-05-29-bypass-rootbeer-part1/final-step.png)

Though the process of modifying the application’s code took quite some time, it’s worth the effort as it resulted in all the checks being bypassed.

[![Successfully Bypassed All RootBeer’s Checks](/static/img/2020-05-29-bypass-rootbeer-part1/success.png)](/static/img/2020-05-29-bypass-rootbeer-part1/success.png)

## Conclusion

The way I modified the application’s code _(e.g., inserting `return v0` after a few lines of the beginning of a function)_ is not the only way to do it. We all think differently and each of us could come up with different ways on how to solve a problem. So it doesn’t matter how you do your modifications as long as you’re getting the results that you’re aiming for.