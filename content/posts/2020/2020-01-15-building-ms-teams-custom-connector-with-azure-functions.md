---
title: "Building MS Teams Custom Connector with Azure Functions"
slug: building-ms-teams-custom-connector-with-azure-functions
description: "This post shows a high-level concept code to send a message to Microsoft Teams via Azure Functions."
date: "2020-01-15"
author: Justin-Yoo
tags:
- microsoft-teams
- azure-functions
- custom-connector
- incoming-webhook
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/01/sending-messages-to-microsoft-teams-via-azure-functions-00.png
fullscreen: true
---

In my [previous post][prev post], we discussed how [Azure Logic Apps][az log app], as a [custom connector][ms teams cus con], can build up a message format in two different ways to send messages to [Microsoft Teams][ms teams]. This post will discuss the same, but this time it will be using [Azure Functions][az func] as a [custom connector][ms teams cus con] to send messages to [Microsoft Teams][ms teams].


## Registering Custom Connector on Teams ##

First of all, we need to register the custom connector on our preferred [Microsoft Teams][ms teams] channel. Like the [previous post][prev post], we use the [Incoming Webhook][ms teams webhook] connector. Once the webhook is created, take a note for the webhook URL.


## Building Actionable Message Card ##

As discussed in [my previous post][prev post], [Microsoft Teams][ms teams] custom connectors currently, at the time of this writing, only support the [Actionable Message Card)][ms teams amc] format, instead of the [Adaptive Card][ms teams ac] format. Either way, they are basically a massive JSON object, which is a bit tricky to build the object from scratch. Fortunately, there's a community effort that makes our lives easier at [NuGet][nuget amc]. We just use it. With this library, the card generation part might look like:

https://gist.github.com/justinyoo/f5208618f8a06d8b15e048094b8bafcb?file=build-message-card.cs

Except both `webhookUri` and `summary` parameters, others are all optional, as you can see. And both `sections` and `actions` parameters accept a stringified JSON array, which is deserialised within the code. Of course, depending on your situation, you can handle both parameters differently.

> In general, both `sections` and `actions` structure might be unique and have a pre-formatted structure for each organisation, so the code above might need to be accommodated to individual organisation's situation.


## Sending Messages via Azure Functions ##

In fact, the concept code above is pretty generic so that any application can send messages to a [Microsoft Teams][ms teams] channel. If we use [Azure Functions][az func], the code might look like:

https://gist.github.com/justinyoo/f5208618f8a06d8b15e048094b8bafcb?file=function-app.cs


## Sending Messages via Console App ##

What if we send the same messages through a console app? If we use another library like [CommandLineParser][nuget clp], the parameter will be way elegant, but we just use the `args` array, and the console app might look like:

https://gist.github.com/justinyoo/f5208618f8a06d8b15e048094b8bafcb?file=console-app.cs

---

So far, we've discussed how to send messages to a [Microsoft Teams ][ms teams] channel through [Azure Functions][az func] and console app. As the PoC code is, like I mentioned earlier, very generic, it can be used anywhere, including Azure Functions, which is just a container of the code. Let's see some other use cases in the next post.



[prev post]: https://devkimchi.com/2019/08/28/two-ways-building-ms-teams-custom-connector-with-logic-apps/

[az log app]: https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo

[ms teams]: https://products.office.com/microsoft-teams/group-chat-software?WT.mc_id=devkimchicom-blog-juyoo
[ms teams cus con]: https://docs.microsoft.com/microsoftteams/office-365-custom-connectors?WT.mc_id=devkimchicom-blog-juyoo
[ms teams webhook]: https://docs.microsoft.com/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?WT.mc_id=devkimchicom-blog-juyoo
[ms teams ac]: https://docs.microsoft.com/outlook/actionable-messages/adaptive-card?WT.mc_id=devkimchicom-blog-juyoo
[ms teams amc]: https://docs.microsoft.com/outlook/actionable-messages/message-card-reference?WT.mc_id=devkimchicom-blog-juyoo

[nuget amc]: https://www.nuget.org/packages/MessageCardModel/
[nuget clp]: https://www.nuget.org/packages/CommandLineParser/
