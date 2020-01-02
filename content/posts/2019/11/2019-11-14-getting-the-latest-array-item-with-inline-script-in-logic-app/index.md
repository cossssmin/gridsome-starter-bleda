---
title: "Getting the Latest Array Item with Inline Script in Logic App"
date: "2019-11-14"
slug: getting-the-latest-array-item-with-inline-script-in-logic-app
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-logic-apps
- array
- sort
- inline-javascript
- integration-account
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-with-inline-script-in-logic-app-00.png
---

In my [previous post](https://devkimchi.com/2019/11/06/getting-the-latest-array-item-in-logic-app/), we've walked through a [Logic App](https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo) workflow to get the latest item in an array, by combining the [`Select` action](https://docs.microsoft.com/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=devkimchicom-blog-juyoo#select-action) and the [`Filter` action](https://docs.microsoft.com/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=devkimchicom-blog-juyoo#query-action). In fact, although this approach is practical, it is only applicable for a few specific use cases, and a workaround, which is a bit tricky to apply in general. But, this preview feature, [Inline JavaScript Code action](https://docs.microsoft.com/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=devkimchicom-blog-juyoo), can be handy for array sort. In this post, I'm going to discuss how to use the [Inline JavaScript Code action](https://docs.microsoft.com/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=devkimchicom-blog-juyoo) to sort array items and take the latest one in the Logic App workflow.

## Integration Account

In order to use this Inline JavaScript Code action, we have to provision an [Integration Account](https://docs.microsoft.com/azure/logic-apps/logic-apps-enterprise-integration-create-integration-account?WT.mc_id=devkimchicom-blog-juyoo) instance. There are [three pricing tiers](https://docs.microsoft.com/azure/logic-apps/logic-apps-pricing?WT.mc_id=devkimchicom-blog-juyoo#integration-accounts) of Integration Account – Free, Basic and Standard. For our practice, the free one is more than enough.

Once the Integration Account instance is provisioned, connect it with the existing Logic App instance to use the action.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-with-inline-script-in-logic-app-03.png)

## JavaScript Support

Currently, the action supports the [built-in functions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects) of node.js `8.11.1`. We can't import external libraries through `npm` or so. Therefore, we can't rely on any [`require()`](https://nodejs.org/docs/latest-v8.x/api/modules.html#modules_require) statement. Everything **MUST** stay in the action.

## Inline JavaScript Code

Let's have a look at the JavaScript code below. It's not related to Logic App but the pure JavaScript code. If you run this code in a node.js console, it returns the latest file path value of `20191104.json`, which is expected. [Array sorting feature in JavaScript](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) needs a separate callback function, which contains the sort logic.

https://gist.github.com/justinyoo/9fe349aed14085321eaf48b14338dc9b?file=sort.js

The callback function **SHOULD** return either `-1`, `0` or `1`.

- Returning `-1` means, between the array items `a` and `b`, `a` is sent to the lower index.
- Returning `1` means the array item `b` is sent to the lower index.

Therefore, the callback function gets rid of `.json` from the `Name` property value of both `a` and `b`, compare both values to each other, and the later (larger) one goes to the upper place of the array item (takes the lower index). In other words, the array items are sorted in descending order.

> If you want to know more about the sort, please refer to [this page](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description).

Now, let's apply this code into Logic App.

## Inline JavaScript Code Action

Let's add an action for [Inline JavaScript Code](https://docs.microsoft.com/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=devkimchicom-blog-juyoo).

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-with-inline-script-in-logic-app-01.png)

Then enter the JavaScript code in the action. It's almost the same as the one in above, but there are two places changed for accommodation.

https://gist.github.com/justinyoo/9fe349aed14085321eaf48b14338dc9b?file=sort-action.js

- The `items` variable takes the array items from the output of the previous action, `List Backups`.
- In the last line, it uses the `return` statement to send the result of the action to the `outputs` value.

If we want to refer the result of this action, any action later in this workflow can use `outputs('ACTION_NAME')?['body']`.

## Comparison

Now, we only use this Inline JavaScript Code action and sort out the issue (pun intended). Let's compare the same result as the [previous post](https://devkimchi.com/2019/11/06/getting-the-latest-array-item-in-logic-app/), with the picture below.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/getting-the-latest-array-item-with-inline-script-in-logic-app-02.png)

The right-hand side is what we created in the [previous post](https://devkimchi.com/2019/11/06/getting-the-latest-array-item-in-logic-app/). At least we **SHOULD** use both the `Select Filename from Backups` action (`Select`) and the `Take Latest Backup` action (`Filter`). If we want a more elegant way, a few extra actions are placed before and after.

On the other hand, if we use the [Inline JavaScript Code action](https://docs.microsoft.com/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=devkimchicom-blog-juyoo), like the left-hand side, we only need one action.

But there's a caveat. Make sure that we have to have the [Integration Account](https://docs.microsoft.com/azure/logic-apps/logic-apps-enterprise-integration-create-integration-account?WT.mc_id=devkimchicom-blog-juyoo) associated with using this inline code action. The Integration Account is pretty expensive and fixed price – [US$ 302.4 (Basic) and US$ 986.4 (Standard) per month](https://azure.microsoft.com/pricing/details/logic-apps/?WT.mc_id=devkimchicom-blog-juyoo). If your organisation has already been using the Integration Account, then it's OK. However, if it hasn't, it **SHOULD** be really careful.

* * *

So far, we've walked through how to use the [Inline JavaScript Code action](https://docs.microsoft.com/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=devkimchicom-blog-juyoo) to sort array items within the Logic App workflow. It's powerful but expensive. Therefore, only if your organisation takes the cost, use it.
