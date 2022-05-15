---
layout: post
title: "Bypassing Android’s RootBeer Library (Part 2)"
date: 2020-06-15
categories: mobile
description: "How to bypass the different checks used by RootBeer library by changing the application’s process during runtime through dynamic instrumentation."
header-img: /static/img/2020-06-15-bypass-rootbeer-part2/success.png
image: /static/img/2020-06-15-bypass-rootbeer-part2/success.png
published: false
---

## Introduction

In the first part of this post, I discussed one method to bypass RootBeer Library through code manipulation. However, installing and running a modified/patched application is not always possible. This happens when an application contains protections such as anti-tampering and/or integrity checks.

If patching an application is not working, then how can we change an application’s behaviour? In this post, I’ll discuss how to change an application’s process during runtime through dynamic instrumentation using [Frida](https://frida.re/). The goal of this post is the same, and that is to bypass all the root-detection checks used by RootBeer library.

## Simple Bypass

Let’s start by identifying the functions responsible for the root-detection checks used by RootBeer. As you can see below, the `doInBackground()` function of the **RootCheckTask** (`com.scottyab.rootbeer.sample.CheckRootTask`) class can be used to identify the different functions/checks used by the application.

[![A Snippet of the Different Functions Used by RootBeer](/static/img/2020-06-15-bypass-rootbeer-part2/checks.png)](/static/img/2020-06-15-bypass-rootbeer-part2/checks.png)

The goal here is to "hook" these functions by injecting a JavaScript code into the application’s process, and change their return value to `false`.

As a simple example, let’s force RootBeer to give the "**NOT ROOTED**" result. This can be done with the following JS code to hook the `isRooted()` function and change its return value to `false`.

```js
Java.perform(function(){
    // Create an instance of the RootBeer class
    var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
    
    // Hook the isRooted() function
    RootBeer.isRooted.overload().implementation = function(){
        // Change the return value to "false"
        return false
    };
})
```

Once the script has been saved, execute Frida and load the script.

[![Executing Frida and Loading the JS Script](/static/img/2020-06-15-bypass-rootbeer-part2/run-frida.png)](/static/img/2020-06-15-bypass-rootbeer-part2/run-frida.png)

Injecting the JS code into RootBeer’s process resulted into the following.

[![Result Before and After Using the Frida Script](/static/img/2020-06-15-bypass-rootbeer-part2/result.png)](/static/img/2020-06-15-bypass-rootbeer-part2/result.png)

## Full Bypass

If we want to bypass all the checks, we need to hook all the relevant functions and force their return value to `false`. The following quick and dirty script can be used to obtain the result that we're after.

```js
Java.perform(function(){
    console.log("\n\n===== RootBeer Detection Bypass with Frida =====\n");
    
    var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
    var Utils = Java.use("com.scottyab.rootbeer.util.Utils");    
    
    try {
        RootBeer.detectRootManagementApps.overload().implementation = function(){
            console.log("[+] detectRootManagementApps check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.detectPotentiallyDangerousApps.overload().implementation = function(){
            console.log("[+] detectPotentiallyDangerousApps check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.detectTestKeys.overload().implementation = function(){
            console.log("[+] detectTestKeys check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.checkForBusyBoxBinary.overload().implementation = function(){
            console.log("[+] checkForBusyBoxBinary check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.checkForSuBinary.overload().implementation = function(){
            console.log("[+] checkForSuBinary check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.checkSuExists.overload().implementation = function(){
            console.log("[+] checkSuExists check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.checkForRWPaths.overload().implementation = function(){
            console.log("[+] checkForRWPaths check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.checkForDangerousProps.overload().implementation = function(){
            console.log("[+] checkForDangerousProps check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.checkForRootNative.overload().implementation = function(){
            console.log("[+] checkForRootNative check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.detectRootCloakingApps.overload().implementation = function(){
            console.log("[+] detectRootCloakingApps check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        Utils.isSelinuxFlagInEnabled.overload().implementation = function(){
            console.log("[+] isSelinuxFlagInEnabled check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
 
    try {
        RootBeer.checkForMagiskBinary.overload().implementation = function(){
            console.log("[+] checkForMagiskBinary check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
    
    try {
        RootBeer.isRooted.overload().implementation = function(){
            console.log("[+] isRooted check bypassed!");
            return false;
        };
    } catch(err) {
        console.log("[-] Bypass attempt failed!");
    }
});
```

> _**Tip**: You can edit and save your script while Frida is running. This way, you don’t have to keep executing the same Frida command every time._

After loading the above script with Frida and running the application, it can be seen that all checks were bypassed.

[![Successfully Bypassed All RootBeer’s Checks](/static/img/2020-06-15-bypass-rootbeer-part2/success.png)](/static/img/2020-06-15-bypass-rootbeer-part2/success.png)

## Conclusion

It should be noted that Frida will not work at all times as there are applications which use protections, such as anti-tampering and anti-reversing techniques, that will detect Frida’s presence. If this is the case, you need to find a way to bypass these additional protections first or look for another method which does not involve Frida.

Lastly, if you’re not confident in writing your own Frida script, do not worry because there are ready-to-use Frida scripts which are hosted in [Frida CodeShare](https://codeshare.frida.re/browse).