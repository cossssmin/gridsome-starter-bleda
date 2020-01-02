---
title: "Getting the Latest Array Item in Logic App"
date: "2019-11-06"
slug: getting-the-latest-array-item-in-logic-app
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-logic-apps
- array
- sort
- workflow-definition-language
- wdl
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-in-logic-app-00.png
---

Back in the day at one of my previous client engagements, I had a chance to have a quick chat about this:

> Q: Can we sort an array within a Logic App workflow? A: As the Logic App is a workflow engine, only basic levels of data handling features are provided out-of-the-box. Therefore, that sorting should be done by an external app like an Azure Functions app. Q: Well, I'd like to pick up the latest one from the stored back-up files. How can I do this, with no code or less code? A: Good question! As our log files are stored at Azure Blob Storage and their filenames represent timestamp, we might be able to leverage the filenames.

As mentioned in the conversation above, [Azure Logic App](https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo) uses [Workflow Definition Language (WDL)](https://docs.microsoft.com/azure/logic-apps/logic-apps-workflow-definition-language?WT.mc_id=devkimchicom-blog-juyoo) and provides full [function references](https://docs.microsoft.com/azure/logic-apps/workflow-definition-language-functions-reference?WT.mc_id=devkimchicom-blog-juyoo). However, there is no array sort related function, unfortunately. The user requirement seems pretty challenging with the limited native feature. You know, however, there's always a way as we always have. We can achieve the requirement within the Logic App with no code involved. In this post, I'm going to show how we can fetch the latest back-up file from [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo).

## Assumptions

First of all, there are a couple of assumptions:

- [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo) stores all the back-up files.
- The back-up files are stored daily and their filename has the format of `yyyyMMdd.json`. For example, one of the files should be `20191104.json`.

Based on these assumptions, let's create [actions](https://docs.microsoft.com/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=devkimchicom-blog-juyoo#actions-overview) within a Logic App.

## List of Back-up Files

We need to fetch all the files from the Blob Storage. If we use the [blob connector](https://docs.microsoft.com/connectors/azureblobconnector/?WT.mc_id=devkimchicom-blog-juyoo), it's pretty easy. Here is the screenshot and JSON definition.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-in-logic-app-01.png)

https://gist.github.com/justinyoo/a04b468a7a0790ff6e0b531a69161aff?file=api-connection.json

Once this is done, the run result might look like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-in-logic-app-02.png)

## Conversion of Filenames to Integer Array

Like the result screen above, and based on our assumption, all the file names are in `yyyyMMdd.json` format. Therefore, let's take off the `.json` part, convert them into integer and put them into an array. The [`Select` action](https://docs.microsoft.com/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=devkimchicom-blog-juyoo#select-action) can take care of those jobs. Here is the UI screen and JSON representation of the action.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-in-logic-app-03.png)

https://gist.github.com/justinyoo/a04b468a7a0790ff6e0b531a69161aff?file=select.json

After rerunning the workflow, the conversion result might look like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-in-logic-app-04.png)

## Selection of the Latest Back-up File

Now, we've got all the file names converted into integer and put into the array. The [`Filter`](https://docs.microsoft.com/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=devkimchicom-blog-juyoo#query-action) takes the latest file by comparing each list item to the maximum value of the array item. Here is the UI and JSON representation of the action.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-in-logic-app-05.png)

https://gist.github.com/justinyoo/a04b468a7a0790ff6e0b531a69161aff?file=query.json

This is the result of the filtering.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-in-logic-app-06.png)

We've got the latest back-up file. The next action will be another Blob Storage connection to fetch the content of the file.

* * *

So far, instead of performing an array sort, we've used two actions to get the maximum value of an array. As the `max()` function used in the `Filter` action only applies to numbers, we converted the file name into numbers, which was not exactly the sort thing. Nonetheless, we got the result we required, which we can say as a workaround. Using `min()` or `max()` function might be expanding use cases to different ways.

In my next post, I'll show how to deal with the real-world use case using this approach.
