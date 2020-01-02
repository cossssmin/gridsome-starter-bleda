---
title: "Two Ways Building MS Teams Custom Connector with Logic Apps"
date: "2019-08-28"
slug: two-ways-building-ms-teams-custom-connector-with-logic-apps
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-logic-apps
- custom-connector
- microsoft-teams
- office365
- webhook
- actionable-message-card
- adaptive-card
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-00.png
---

According to this [newspaper article](https://www.theverge.com/2019/7/11/20689143/microsoft-teams-active-daily-users-stats-slack-competition), [Microsoft Teams](https://products.office.com/en-us/microsoft-teams/) gets more daily users than [Slack](https://slack.com). It doesn't necessarily mean that MS Teams is better than Slack, nor the one is killing the other. They have been expanding the size of the pie by competing with each other. Both have strong bot features by integrating third-party services so that users get notified through channels without having to leave the tool.

Although they offer many useful bot connectors, if I have a specific requirement, a bot that meets my needs may not exist. In this case, I should create a custom connector. We can send messages to MS Teams in two different ways, through respective custom connectors. In this post, I'm going to show how to implement those custom connectors with Azure Logic Apps.

> The Logic App code used in this post can be found at this [GitHub repository](https://github.com/devkimchi/Microsoft-Teams-Channel-Notification).

## Use Case Scenario

When I deploy my static website to [Netlify](https://netlify.com), it sends a webhook payload. I want to capture the webhook payload and send a notification to an MS Teams channel. As the Netlify connector doesn't exist in MS Teams, I want to create a custom connector for it, using Azure Logic Apps.

## MS Teams Incoming Webhook Connector

Using the [`Incoming Webhook` connector](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/connectors/connectors-using) is the easiest way to create a custom connector for MS Teams. Find the three dots button at the channel you want to add the connector.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-01.png)

There is an overwhelming number of connectors. Find `Incoming Webhook` and click the `Add` button.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-02.png)

Have a look at the text about the connector and click the `Install` button. It's not added to the channel. If you do this on another channel, repeat the same process.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-03.png)

Once the connector is installed, you need to create the webhook link URL. Enter the name and click the `Create` button to generate the webhook URL. You can replace the default image with something else if you like.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-04.png)

Now, you have the webhook URL automatically generated. This URL will be used for your custom connector.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-05.png)

But, before creating the custom connector, let's try the webhook whether it really sends messages or not. Wait, what? The error message doesn't look right. It throws the `400 Bad Request` error response, which gives an impression that we would need to send a request payload in a specific format.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-06.png)

According to this [document](https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference), the Incoming Webhook connector expects payloads in the Actionable Message Card format.

## Actionable Message Card

All the payloads through Incoming Webhook **MUST** use the Ationable Message Card format. I'm not going to discuss too many details on the card format itself here. But instead, I'm leaving an [example link page](https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference#card-examples) here so that anyone interested can have a look further.

The following code snippet describes an `HTTP` action in a Logic App, which sends a notification to MS Teams though the Incoming Webhook connector.

https://gist.github.com/justinyoo/4030dd4fa2f2875905c770d8013d6856?file=actionable-message-card.json

Once this is deployed, the notification message from MS Teams might look like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-07.png)

## Adaptive Card

The Adaptive Card format is the next version of the Actionable Message Card format. Although Microsoft recommends using this Adaptive Card format, MS Teams only supports the Actionable Message Card format at the time of this writing, unfortunately.

On the flip side, Logic App has the built-in MS Teams connector, and it only supports the Adaptive Card format, not the Actionable Message Card format. I assume (or guess) that the Logic App connector internally converts the Adaptive Card format into the Actionable Message Card format.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-08.png)

As you can see the screenshot above, the connector can send messages in a different format, but it doesn't look pretty. The most elegant way to send messages to MS Teams is to use the Adaptive Card format. Then, how does it look like? As Adaptive Card has a comprehensive [schema reference](https://adaptivecards.io/explorer/), you can have a look, if you like. It also provides the [Adaptive Card Designer](https://adaptivecards.io/designer/) tool, which we can quickly generate the card format. The code snippet below is the message written in the Adaptive Card format to be injected into the Logic App.

https://gist.github.com/justinyoo/4030dd4fa2f2875905c770d8013d6856?file=adaptive-card.json

As you can see the JSON object, Adaptive Card is more expressive than Actionable Message Card. It may look verbose, but it depends on the perspective. Add this to the Logic App action. At this stage, it **MUST** be serialised.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-10.png)

Once deployed, it shows notification on MS Teams like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-09.png)

As you can see, it uses Logic App's connector, not the custom connector that we created. As a result, the bot icon is different. Also, it shows additional information at the bottom of the message, which is about the bot itself.

* * *

So far, we've discussed two different ways sending notifications to MS Teams through Logic App. If we use the custom connector of MS Teams, we **MUST** stick on the legacy format (Actionable Message Card), but it assures we use our bot. On the other hand, if we use the MS Teams connector of Logic App, we can use the newer message format (Adaptive CArd). But we can't customise the bot icon.

Another one we should consider for both ways is about security. As MS Teams custom connector only provides us with the webhook URL, anyone can send spam messages through it, if it is compromised. On the other hand, if we use MS Teams connector of Logic App, any unauthorised message cannot be sent to MS Teams. It's because we MUST authorise the connector.

Surely there are requirements on each approach. Your organisation should carefully review and choose an appropriate way.

## More Readings

- [Actionable Message Card Reference](https://docs.microsoft.com/en-us/outlook/actionable-messages/message-card-reference)
- [Adaptive Card Reference](https://adaptivecards.io/explorer/)
