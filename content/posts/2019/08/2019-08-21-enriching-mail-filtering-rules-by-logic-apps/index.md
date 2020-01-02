---
title: "Enriching Mail Filtering Rules by Logic Apps"
date: "2019-08-21"
slug: enriching-mail-filtering-rules-by-logic-apps
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-logic-apps
- email-filtering
- outlook
- office365
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-00.png
---

While using either [Outlook.com](https://outlook.com) or [Office 365 Mail](https://outlook.office.com), I always want to have a better email filtering rule engines shipped. Apparently, [Gmail](https://gmail.com) has a better spam-mail filtering engine. Personally, as soon as I receive emails, I prefer to moving them into designated folders based on my **manual** filtering rule. I've set many filtering rules in my account options, but that's not enough. About half of my incoming mails are filtered, and the rest simply go into the spam mail folder or stay inbox.

The good news is that the [MS Flow](https://flow.microsoft.com) service is offered to both Outlook.com users and Office 365 users, free of charge. That [Free plan](https://flow.microsoft.com/en-us/pricing/) offers free 750 execution times, which is convenient. If you have an Azure subscription, [Logic App](https://azure.microsoft.com/en-us/services/logic-apps/) is an alternative as both MS Flow and Logic App shares the same connectors and workflows. Therefore, with these services, you reinforce your mail filtering rules with satisfaction. In this post, I'm going to build an Azure Logic App to filter out emails and move them to designated folders.

## Use Case Scenario

As a Microsoft MVP, I have a lot of emails sending to and receiving from Microsoft product groups and other MVPs, by sharing pieces of information and feedback. As there are many mailing lists for this purpose, depending on the mailing list, I want to move them into their corresponding folders. For example, Azure related mails go into the `Azure` folder, and .NET related mails go into the `.NET` folder, etc.

## Assumptions

There are a few assumptions to achieve this scenario.

1. I use a free Outlook.com email address.
2. I have mailing lists.
3. I have folders corresponding to the mailing lists.
4. All emails come into `Inbox`.

## Finding Unique Folder ID in Outlook.com with Graph Explorer

Each folder in Outlook.com has its own/unique ID. As it is an encrypted string, it's not easy to remember. Fortunately, [Microsoft Graph](https://developer.microsoft.com/en-us/graph) provides API endpoints to get those folder IDs. Even easier, there is a web-based [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) tool so that we can easily find out all folder IDs.

When we go to Graph Explorer, you can see the following screen. Login to your Outlook.com account through the `Sign In with Microsoft` button at the left-hand side.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-02.png)

Once logged in, you'll be asked to register an application and grant permissions, followed by the logged-in screen with your profile picture.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-03.png)

The current version of Microsoft Graph is `1.0` and `beta`. As either version is okay for us to use, let's use the `1.0` version of API. Then use [this document](https://docs.microsoft.com/en-us/graph/api/user-list-mailfolders?view=graph-rest-1.0&tabs=http) to find out all folders under the `Inbox` folder.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-04.png)

> **NOTE**: This API only returns the list of folders under the `Inbox` folder. If you want to get all sub-folders, it will require several recursive calls.

Although I only need the `id` attribute from the result, for the sake of convenience, I take both `id` and `displayName` attributes. Here are my returns, which I slightly masked those folder IDs.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=lookup-references.json

Let's add an email address to the `email` attribute for each array item, and change the `id` attribute to `folderId` for better readability.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=lookup-references-updated.json

> **NOTE**: The email address is for the demo purpose only, not the real ones.

I've got ready for folder lookup reference. Let's build the Logic App.

## Building Logic App for Email Filtering

First of all, let's create a blank Logic App instance with your preferred location. Then add `outlook.com` trigger to be invoked when a new email arrives. In the trigger, set the folder to `Inbox` and leave others as default.

> **NOTE**: This time, I just use UI for authoring, not through an ARM template, as I want to show this would bring the same experience to anyone who uses Flow.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-05.png)

Now, with this trigger, all emails hitting `Inbox` will invoke this Logic App. Let's add workflows with actions. As I've created the lookup array above, put that array as a reference into the variable with an `Initialize Variable` action. It's called `FolderLookupReferences`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-06.png)

An email can have multiple recipients, so they need to be converted to an array. I put both recipients (`To`) and carbon-copied (`Cc`) into one array. Add a `Compose` action for this.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-07.png)

The action in JSON may look like this. I'm not explaining each function used in this action, but it is worth having a look at [Workflow Definition Language](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-workflow-definition-language) when you have time. As soon as you see those functions, you'll understand straight away.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=get-all-recipients.json

This action is to find out who the recipient is and folder. Use the `Query` action for it. Put the reference array into the `From` field. Then add the query to check whether the recipient array contains any of reference email or not.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-08.png)

Here's the JSON bit.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=filter-recipients.json

If the filter query returns nothing or an empty array, this workflow doesn't need to proceed. It can be done with a combination of the `If` action and `Terminate` action.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-09.png)

Its corresponding JSON code looks like this:

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=stop-processing-if-filter-returns-empty.json

If this condition is NOT met, the email belongs to at least one mailing list. As there is a chance that it has multiple reference array items, this `Compose` action takes the first item.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-10.png)

Here's the JSON code.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=take-the-first-recipient.json

I've finally got the folder ID for the email to be sent. As the last step, this `API Connection` action moves the email to the designated folder. Put the message ID and folder ID into their corresponding fields.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-11.png)

This action can be expressed in JSON like:

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=move-email-to-designated-folder.json

Now, we've completed the entire workflow orchestration. As soon as it's deployed, this Logic App watches my `Inbox` on outlook.com. When an email touches the `Inbox`, it invokes the Logic App. If processed, the email goes into the designated folder; otherwise, it will stay in `Inbox`. Here's the result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-12.png)

After all, my `Inbox` looks cleaner than ever!

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/enriching-mail-filtering-by-logic-apps-13.png)

* * *

So far, I've built a Logic App to enrich email filtering rules of Outlook.com. Based on the Logic App invocation result, emails are moved to their own folders. This activity may seem to be a tiny thing, but it gets your productivity improved a lot, actually. What I showed in this post is Logic App, but this can be done in Flow exactly in the same way.

If you feel like adding some automation for your email sorting, why not trying this?
