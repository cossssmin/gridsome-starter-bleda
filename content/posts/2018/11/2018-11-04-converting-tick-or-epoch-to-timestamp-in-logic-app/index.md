---
title: "Converting Tick or Epoch to Timestamp in Logic App"
date: "2018-11-04"
slug: converting-tick-or-epoch-to-timestamp-in-logic-app
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-logic-apps
- epoch
- ticks
- timestamp
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/11/converting-tick-or-epoch-to-timestamp-in-logic-app-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

While we are using Logic Apps, one of the most common things might be date/time conversion. In Logic App, there are two different ways to dealing date/time values. One is a [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html) style string value, `timestamp`, and the other is a 64-bit integer style value, `tick`. In addition to them, there are many chances to deal with [`epoch` (or UNIX timestamp)](https://en.wikipedia.org/wiki/Epoch_(reference_date)) values from the API connections. Those values need to be converted into one common format so that we can compare them to each other. Unfortunately, the conversion is not that intuitive in Logic App. In this post, I am going to show how to convert those date/time values from one format to the other.

## Epoch

Epoch [refers to various timestamp representation](https://en.wikipedia.org/wiki/Epoch_(reference_date)#Notable_epoch_dates_in_computing), but usually it is known as UNIX timestamp. In this post, we use the term, epoch, as UNIX timestamp. It is a 32-bit integer value starting from 0, which represents `1970-01-01T00:00:00Z`. For example, `2018-09-10T12:34:56+11:00` is the epoch value of `1536543296`, according to [this online conversion page](https://www.epochconverter.com/). As you can see, it can't represent any date before 1970. It won't be able to represent [after January 19th, 2038](https://www.epochconverter.com/) because epoch uses 32-bit integer value.

## Ticks

On the other hand, tick uses 64-bit integer starting from 0, which represents `0001-01-01T00:00:00Z`. In the tick world, `10 000 000` represents 1 second. Therefore, with this tick value, we control date/time value precisely. The same date/time value, `2018-09-10T12:34:56+11:00` is equivalent to the tick value of `636721400960000000`.

## Timestamp to Ticks

This conversion is easy in Logic App. Logic App has a built-in function, [`ticks()`](https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference#ticks). Therefore, simply use this function like:

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=get-timestamp-in-ticks.yaml

This Logic App action will return the tick value of `636721400960000000`.

> **NOTE**: Throughout this post, I intentionally use YAML to define Logic App workflow as a part of ARM template. If you want to know more about using YAML in ARM template, please have a look at this post, [https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/).

## Timestamp to Epoch

OK, we're now getting into a bit of tricky part. Basically, epoch value starts from 0, which is `1970-01-01T00:00:00Z`, and there's no way in Logic App to handle epoch values. But we know how to handle ticks. Therefore the trick is:

1. Get the tick value from the given timestamp.
2. Get the tick value of `1970-01-01T00:00:00Z`, which is `621355968000000000`.
3. Get the difference between two.
4. Divide the difference into `10 000 000`.

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=get-timestamp-in-epoch.yaml

The last Logic App action will return the epoch value of `1536543296`.

## Eopch to Timestamp

This is the interesting part. Many APIs return date/time values in UNIX timestamp format, which is epoch. For example, When you use Azure AD for your OAuth system, the access token response contains expiry date in UNIX timestamp format like:

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=aad-response.json

Both `expires_on` and `not_before` contain the epoch value, which are not very human-friendly for reading. Therefore, sometimes there's a requirement to convert them into a human-readable timestamp format like `2018-12-31T01:23:45.678Z`. As mentioned above, there's not direct way for this type of conversion in Logic App, but we have another function called [`addToTime()`](https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference#addToTime) or [`addSeconds()`](https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference#addSeconds). As the epoch value shows how many seconds has been elapsed since `1970-01-01T00:00:00Z`, we can use either function like:

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=convert-epoch-to-timestamp.yaml

This will return the timestamp value of `2018-09-10T12:34:56+11:00`.

> **NOTE**: Make sure that epoch value is in UTC. If you want to have a your local value like "Australian Estern Standard Time (AEST)", you need to add another function to the result like [`convertTimeZone()`](https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference#convertTimeZone). But this won't include the offset information, but only converted date/time value.

## Ticks to Timestamp

One of the challenges using the built-in date/time functions in Logic App, `addToTime()` or `addSeconds()`, is it can only handle as precise as seconds, while ticks provide ten million times more accurate values, which we lose a certain level of precision. Let's have a look. It's really a combination of two – Ticks to Epoch, and Epoch to Timestamp. We already know the tick value of the day, `1970-01-01T00:00:00Z`, which is `621355968000000000`. Therefore, if any tick is given, say `636721400967890200`, we can sort this out like below:

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=convert-ticks-to-timestamp.yaml

As a result, the last action returns the timestamp of `2018-09-10T01:34:56.0000000Z`. Actually, the tick value of `636721400967890200` represents `2018-09-10T12:34:56.789012+11:00`, which is `2018-09-10T01:34:56.789012Z` and the converted value has lost the decimal part. This is a sort of downside of using this approach. But, if you are not too much fussed of this precision, this conversion will be really handy.

* * *

So far, we've walked through how to convert epoch value and/or tick value into ISO8601-complied and human-readable timestamp value. This is not that important, but really useful when you know how to do this.

If you want to see the complete Logic App workflow, find this out on this repository, [https://github.com/devkimchi/DateTime-Conversions-in-Logic-App](https://github.com/devkimchi/DateTime-Conversions-in-Logic-App).
