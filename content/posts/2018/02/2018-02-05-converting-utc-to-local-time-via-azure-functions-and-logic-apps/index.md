---
title: "Converting UTC to Local Time via Azure Functions and Logic Apps"
date: "2018-02-05"
slug: converting-utc-to-local-time-via-azure-functions-and-logic-apps
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-logic-apps
- datetime
- datetimeoffset
- timezone
- timezoneinfo
- utc
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/converting-utc-to-local-time-via-azure-functions-and-logic-apps-00.png
---

In many information system development scenarios, including integration scenarios, handling date/time value is always problematic. If your information systems reside in your office or data centre located in your area, that won't bring about too much trouble. However, if your organisation runs applications in several different regions, which implies different time zones, date/time values when exchanging data result in a lot of headaches. Applications running on cloud, in order to figure out this issue, usually uses UTC, which is fine. However, let's think about a scenario that cloud applications need to exchange data with on-prem legacy applications that only takes local date/time values. In this case there must be some conversion logic around. In this post, we're going to write a sample Azure Functions code and Logic Apps for those conversions.

> The sample code used in this post can be found [here](https://github.com/devkimchi/Azure-Functions-TimeZone-Conversion-Sample).

## `TimeZoneInfo`

.NET Standard, .NET Framework and .NET Core have the [`TimeZoneInfo`](https://docs.microsoft.com/en-au/dotnet/api/system.timezoneinfo) class that represents any time zone in the world. Here are the list of available time zones:

<iframe width="100%" height="475" src="https://dotnetfiddle.net/Widget/cnMACe" frameborder="0"></iframe>

Each time zone has its own offset value. For example, `AUS Eastern Standard Time` (AEST) has +10 hours offset value. This `TimeZoneInfo` instance also contains daylight saving information, so we don't have to worry too much about calculating it. Therefore, we can simply use this and easily convert UTC to a designated local time like:

<iframe width="100%" height="475" src="https://dotnetfiddle.net/Widget/6QZaA7" frameborder="0"></iframe>

Now, we know how to apply the time zone value. Let's write Azure Functions code for it.

## Azure Functions Core 2.0

[Azure Functions now supports .NET Core 2.0](https://blogs.msdn.microsoft.com/webdev/2017/11/15/improvements-to-azure-functions-in-visual-studio/) as public preview. Why not using this feature? Basically, it's the same as the previous version, so there's no reason not to use, unless we have a specific reason against it. When we create a new Azure Functions project in Visual Studio, nothing has been changed except choosing the .NET framework version:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/converting-utc-to-local-time-via-azure-functions-and-logic-apps-01.png)

Choose .NET Core then HTTP trigger, and write the conversion code like:

https://gist.github.com/justinyoo/39e18fac1ecedf2cf776e85d730e6633

This code doesn't make differences from the one above, except the JSON deserialisation part. Azure Functions uses Json.NET library for JSON objects serialisation/deserialisation, and Json.NET has a [default behaviour](https://github.com/JamesNK/Newtonsoft.Json/issues/862) that converts ISO8601 date/time string into [`DateTime`](https://docs.microsoft.com/en-au/dotnet/api/system.datetime) instance. Therefore, in order to avoid automatic conversion from date/time formatted string to `DateTime` instance, we should explicitly pass the `DateParsHandling.None` option during the deserialisation like that. Once deployed, it passes a JSON input and output like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/converting-utc-to-local-time-via-azure-functions-and-logic-apps-02.png)

If we want to use the `GET` method, instead of `POST`, then we should pass the date/time string through its querystring. In this case, the date/time string, `2018-02-01T02:26:02.727Z` for example, **MUST** be URL encoded, which will be `2018-02-01T02%3a26%3a02.727Z`.

## Logic Apps Integration

There's no action in Logic Apps for this time zone conversion at the time of this writing. In other words, we need to implement a custom action, which can be an Azure Function like above. By the way, we need to know this interesting fact. Logic Apps supports Azure Functions out-of-the-box but webhook triggers only. Azure Functions Core 2 has dependencies onto ASP.NET Core 2 [that hasn't implemented webhooks migration yet](https://twitter.com/codesapien/status/959883678011633664). This implies:

- If you want to use OOTB Logic App's action for Azure Functions, you **MUST** write the Azure Functions app using .NET Framework, instead of .NET Core.
- If you want to use .NET Core based Azure Functions, you **MUST** use a normal HTTP action in Logic App to call Azure Functions.

If I am asked to write a custom Logic App action using Azure Functions, I will choose a normal HTTP trigger, because:

- I can write the code on both .NET Framework and .NET Core, and
- I can parameterise the Function endpoint in Logic App. If I use Logic App's Function action, [the endpoint can't be parameterised](https://feedback.azure.com/forums/287593-logic-apps/suggestions/32849239-allow-calling-functions-and-nested-logic-apps-usin) at the time of writing.

With having this in mind, the completed Logic App workflow might look like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/converting-utc-to-local-time-via-azure-functions-and-logic-apps-03.png)

As mentioned above, we just use an HTTP action to call Azure Functions.

* * *

So far, we have walked through how UTC can be converted to local time zone using Azure Functions and Logic Apps. Especially, in the integration world, keeping the time zone from one source to another is somewhat critical, so I hope this small tip would help.

* * *

**UPDATE**

[Kevin Lam](https://twitter.com/kevinlam_msft) from Microsoft pointed me out that there are WDL functions to convert time zone.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/converting-utc-to-local-time-via-azure-functions-and-logic-apps-04.png)

While [these WDL functions are not documented](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-workflow-definition-language#date-functions) at this time of writing, it's worth trying and comparing to the result from the Function app. Update the Logic App workflow by adding a `Compose` action right after the HTTP action like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/converting-utc-to-local-time-via-azure-functions-and-logic-apps-05.png)

And the code around the `Compose` action might look like:

https://gist.github.com/justinyoo/cac53708da40e1c8535b9d4237fee605

After running this updated Logic App, we can get converted value from both Logic App and Function App.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/converting-utc-to-local-time-via-azure-functions-and-logic-apps-06.png)

Did you find any difference between the outputs from Logic Apps and Functions? Logic App returns `DateTime` value, while Function returns `DateTimeOffset` value. If we change the output format from `'o'` to `'yyyy-MM-ddTHH:mm:ss.fffzzz'` to resemble the `DateTimeOffset` format, then it returns:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/converting-utc-to-local-time-via-azure-functions-and-logic-apps-07.png)

That doesn't make sense to me, because the conversion has lost the time zone offset information, which `DateTimeOffset` keeps it. Therefore, if we want to get a correct local date/time value including time zone offset information, using Azure Functions is still the only way for now. This seems to be a bug and hopefully Microsoft has already identified this issue and fix it sooner rather than later.

> ACKNOWLEDGEMENT: This post has originally been posted at [Mexia blog](https://blog.mexia.com.au/converting-utc-to-local-time-via-azure-functions-and-logic-apps).
