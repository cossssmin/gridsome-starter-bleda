---
title: "Locale Settings in Azure Functions"
date: "2018-12-30"
slug: locale-settings-in-azure-functions
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- locale
- localisation
- l10n
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/12/locale-settings-in-azure-functions-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

PaaS (Platform as a Service) like [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) is a fully-managed service, so we don't have to do maintenance efforts. This often implies that there are something we can't configure. One of these limitations is locale. Throughout this post, I'm going to talk about handling locale in Azure Functions. Let's have a look at the following date format. How can you interpret it?

```bat
11/12/13

```

Depending on our culture (or locale), this can be translated in different ways:

- Korean (`ko-KR`): Dec. 13, 2011
- US English (`en-US`): Nov. 12, 2013
- AUS English (`en-AU`): Dec. 11, 2013

If we develop a new application, we follow [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601) not to be confused so that in general we use the date/time format like `yyyy-MM-ddTHH:mm:ss.fffzzz`. However, not every system follows this format. In many integration scenario, we have to deal with legacy systems that uses localised date/time formatted values. Even worse, if we handle those legacy data on the cloud like Azure Functions, this must be properly handled; otherwise it will be in trouble. Let's have a look at the code below.

```json
{
  "date": "11/12/13"
}

```

If we use the payload like above, how does this date format get parsed?

https://gist.github.com/justinyoo/f98f86536560c9b99cedbdcf48cadb4c#file-locale-default-cs

If your dev machine's default locale is set to `ko-KR`, it will display like:

```bat
Input: 2011-12-13T00:00:00.0000000+09:00

```

If yours is `en-AU`, then you will see like:

```bat
Input: 2013-12-11T00:00:00.0000000+11:00

```

OK. What if we deploy this code into Azure Function instance?

```bat
Input: 2013-11-12T00:00:00.0000000+00:00

```

As you might have expected, it follows the US locale, `en-US`. If our data only deals with Australian locale, `ko-KR`? There's no way to change the locale of an Azure Function instance. In other words, we should handle this in the code level. Fortunately, we have [`Thread.CurrentThread.CurrentCulture`](https://docs.microsoft.com/en-us/dotnet/api/system.threading.thread.currentculture?view=netcore-2.2), so we need to change this value. Let's have a look at this code below:

https://gist.github.com/justinyoo/f98f86536560c9b99cedbdcf48cadb4c#file-locale-en-au-cs

Like the code above, we can simply add one line that changes the default locale, `en-US`, to `en-AU`. Once deployed, it returns the expected result.

```bat
Input: 2013-12-11T00:00:00.0000000+00:00

```

Easy, huh?
