---
layout: post
title: "Filtering the OPTIONS Method in Burp"
date: 2020-01-06
categories: pentest
---

> _**UPDATE 2:** The extension is now available from the [BApp Store](https://portswigger.net/bappstore/fa14ac579cff4682b32f39af8d3651e7)._

> _**UPDATE 1:** Instead of emptying the response, I decided to comment them out instead so the response body (if there's any) is still intact._

My first week of 2020 started with testing an application which performs several CORS preflight requests. These "unwanted" preflight requests filled up my Burp's "HTTP history". 
![Lots of HTTP Options Method](/static/img/15/options-method.png)

I wanted to filter out these `OPTIONS` requests, so I could have an uncluttered "HTTP history". Unfortunately, Burp does not have an option to do what I wanted. Thankfully, our friend Google is always there to help me. The search result led me to this [blog post](https://parsiya.net/blog/2019-04-06-hiding-options-an-adventure-in-dealing-with-burp-proxy-in-an-extension/) and [@CryptoGangsta](https://twitter.com/cryptogangsta/) has a detailed walkthrough and explanation on how he wrote a Burp Extension to filter out these `OPTIONS` requests. His post contains a link to his Burp Extension [burp-filter-options](https://github.com/parsiya/Parsia-Code/tree/master/burp-filter-options), so I tried it. The extension worked and was able to change the `Content-Type` to **CSS**, but Burp still categorized the responses as **JSON** instead of **CSS**.
![Extension Failed](/static/img/15/extension-failed.png)

I reread his post and I tried using the draft version of his extension ([burp3.py](https://github.com/parsiya/Parsia-Code/blob/master/burp-filter-options/blog/burp3.py)). Again, the extension successfully injected the new `Content-Type` (**CSS**) header but the original `Content-Type` (**JSON**) header still existed.
![Extension Failed Again](/static/img/15/still-failed.png)

Using the codes from the post, I made the following modifications:

This checks the original response for the presence of `Content-Type` header. If it exists, remove it. This is done as an assurance that there's only one `Content-Type` header in the response.
```python
removeHeaders = ""
for headers in responseHeaders:
    if "Content-Type: " in headers:
        removeHeaders = headers
try:
    responseHeaders.remove(removeHeaders)
except:
    pass
```

After injecting the new `Content-Type` header, comment out the response body. Going back to the first [extension](https://github.com/parsiya/Parsia-Code/tree/master/burp-filter-options) that I tried, it can be seen that Burp keep on recognizing the MIME type as **JSON** even if the `Content-Type` was already set to **CSS**. I discovered that this happens because of the presence of `{}` in the response body.
```python
responseHeaders.add("Content-Type: text/css; charset=UTF-8")
responseBodyBytes = "/* Injected by 'Filter OPTIONS Method'\n\n" + responseBytes[responseInfo.getBodyOffset():] + "\n\nInjected by 'Filter OPTIONS Method' */"
responseModified = self._helpers.buildHttpMessage(responseHeaders, responseBodyBytes)
messageInfo.setResponse(responseModified)
```

By doing these modifications, I now got what I wanted! 
![Extension Worked](/static/img/15/extension-worked.png)

Now, to filter these `OPTIONS` requests from "HTTP history", untick the **CSS** checkbox under the "Filter by MIME type" option.
![Filter CSS](/static/img/15/filter-css.png)

That's it! I tried it on other web applications and it's also working. Hooray! 

Once again, huge thanks to [@CryptoGangsta](https://twitter.com/cryptogangsta/) for his [blog post](https://parsiya.net/blog/2019-04-06-hiding-options-an-adventure-in-dealing-with-burp-proxy-in-an-extension/).

My version of this Burp extension can be found at:
- [https://github.com/capt-meelo/filter-options-method](https://github.com/capt-meelo/filter-options-method)