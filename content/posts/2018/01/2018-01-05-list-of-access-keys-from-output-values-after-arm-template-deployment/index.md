---
title: "List of Access Keys from Output Values after ARM Template Deployment"
date: "2018-01-05"
slug: list-of-access-keys-from-output-values-after-arm-template-deployment
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- azure-functions
- azure-logic-apps
- arm-templates
- azure-application-insights
- azure-service-bus
- azure-cosmos-db
- azure-storage-account
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/01/list-of-access-keys-from-output-values-after-arm-template-deployment-00.png
---

There are many cases that we need to retrieve access keys and/or endpoints of Azure resources, as soon as they are deployed through ARM templates. Typical uses cases are:

1. To display those values in the `outputs` section of ARM templates,
2. To get a reference to the `outputs` section of nested ARM templates from their parent template,
3. To store those values to Azure Key Vault, and
4. To store those values to environment variables of Visual Studio Team Service.

Due to the nature of individual Azure resources, populating those keys through ARM template `outputs` section is not that easy. Rather it's a bit tricky and not well documented. In this post, I'm going to list up how to get those keys and endpoints using ARM template functions.

## List of Azure Resources

- [Application Insights](#app-insights)
- [Cosmos DB](#cosmos-db)
- [Service Bus](#service-bus)
- [Storage Accounts](#storage-accounts)
- [Functions](#functions)
- [Logic Apps](#logic-apps)

> **NOTE**: This is not a complete list, but the list contains ones quite frequently used. Therefore, if any of you know something not on the list, please let us know.

## Application Insights

Azure [Application Insights](https://azure.microsoft.com/en-us/services/application-insights/) has an instrumentation key for other Azure resources to use. After it is deployed, the instrumentation key is found under its properties. Therefore, we need to use the [`reference()`](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-functions-resource#reference) function.

### Implementation

Here's a sample ARM template to see the `outputs` section:

https://gist.github.com/justinyoo/5937f12a1b7a78b1aed86e01d956962b

## Cosmos DB

Once Azure [Cosmos DB](https://azure.microsoft.com/en-au/services/cosmos-db/) instance is deployed, we might need to get at least three values – endpoint, access key and connection string. In order to get the endpoint details, the `reference()` function provides it, which is not that hard. But fetching the access keys are not that easy.

### Available Functions

In order to identify available resource functions, simply run the following Azure PowerShell cmdlet. It will show several operations that we can utilise in the `outputs` section of ARM templates.

https://gist.github.com/justinyoo/e428559b411a345dc53e4bc313157bf5

It returns two operations – `listKeys` and `listConnectionStrings`, which are corresponding to the resource functions of `listKeys()` and `listConnectionStrings()`. The [`listKeys()`](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-functions-resource#listkeys) function returns the access key. However, the other function, `listConnectionStrings()` returns nothing. Apparently it has not been implemented yet. Therefore, in order to get the connection string, we should use the [`concat()`](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-functions-string#concat) function to make-up the connection string. If we want to know the object structure that `listKeys()` function returns, simply run the following Azure PowerShell cmdlet:

https://gist.github.com/justinyoo/620c4945b5d82e98829481f362b23fa0

The `listKeys()` function returns `primaryMasterKey` and `secondaryMasterKey`.

### Implementation

With this information, we can implement the `outputs` section like this:

https://gist.github.com/justinyoo/90addf3243a1368133cf5c56f5e42c5b

## Service Bus

For Azure [Service Bus](https://azure.microsoft.com/en-us/services/service-bus/), we can apply a similar approach to Azure Cosmos DB. In order to pull the endpoint, we can simply use the `reference()` function, which is the same as Azure Cosmos DB. However, getting the access keys and connection strings is different. Let's have a look.

### Available Functions

In order to identify available resource functions, simply run the following Azure PowerShell cmdlet. It will show several operations that we can utilise in the `outputs` section of ARM templates.

https://gist.github.com/justinyoo/94e5ce154cf18fa8c7a541d53dc72df1

It returns one operation, `listKeys`, in three different providers – Service Bus itself, Service Bus Queue and Service Bus Topic. We're interested in the root one for now. If we want to know the object structure that `listKeys()` function returns, simply run the following Azure PowerShell cmdlet:

https://gist.github.com/justinyoo/ecc5ba5a52c27bc024093b6370ae40e4

Unlike Azure Cosmos DB, the `listKeys()` function for Azure Service Bus doesn't only return access key (`primaryKey`), but also returns connection strings (`primaryConnectionString`).

### Implementation

With this information, we can implement the `outputs` section like this:

https://gist.github.com/justinyoo/3f2590a858e4d09b0b3c4d671d8228a9

## Storage Accounts

Azure [Storage Account](https://azure.microsoft.com/en-us/services/storage/) is similar to Azure Cosmos DB, in terms of providing the result after ARM template deployment – it provides only access keys through the `listKeys()` function when it's deployed, not the connection string. Therefore, we should make this up using the `concat()` function.

### Available Functions

In order to identify available resource functions, simply run the following Azure PowerShell cmdlet. It will show several operations that we can utilise in the `outputs` section of ARM templates.

https://gist.github.com/justinyoo/cb1116a257b6ae335e029adacd438910

It returns three operation, `listKeys`, `listAccountSas` and `listServiceSas`, but we only use the `listKeys` operation for now. If we want to know the object structure that `listKeys()` function returns, simply run the following Azure PowerShell cmdlet:

https://gist.github.com/justinyoo/116f9d8e6e04f71e9e5abecf189dae91

The `listKeys()` function returns `keys` as an array value.

### Implementation

With this information, we can implement the `outputs` section like this:

https://gist.github.com/justinyoo/d92ae73916b985794bf298695f90ff74

## Functions

In my previous post, [Dynamic Access to Azure Functions Keys without KUDU Dependencies](https://blog.mexia.com.au/dynamic-access-to-azure-functions-keys-without-kudu-dependencies), we had walked through Azure REST API to get function keys from an Azure [Functions](https://azure.microsoft.com/en-us/services/functions/) app. In fact, we can also get those individual function keys through the ARM template's `outputs` section. By the way, this approach has a restriction. This can only access to individual function keys, not host key nor master key.

### Available Functions

In order to identify available resource functions, simply run the following Azure PowerShell cmdlet. It will show several operations that we can utilise in the `outputs` section of ARM templates.

https://gist.github.com/justinyoo/ee45fd41392da402ede7c72d7cd18322

It returns one operation, `listSecrets`. As mentioned above, this requires individual function names to get their respective keys. If we want to know the object structure that `listSecrets()` function returns, simply run the following Azure PowerShell cmdlet:

https://gist.github.com/justinyoo/85379f6fc4a93a0879baf317d54ffb89

The `listSecrets()` function returns `key` property.

> **NOTE**: We need to specify the API version to run this cmdlet, even though it's an optional parameter; otherwise it will throw an error.

### Implementation

With this information, we can implement the `outputs` section like this:

https://gist.github.com/justinyoo/f1d93c7412ece27e0351fef33f564926

## Logic Apps

When an Azure [Logic Apps](https://azure.microsoft.com/en-us/services/logic-apps/) instance is deployed, the instance has an endpoint URL. However, we only knows when it is created. In addition to this, the endpoint URL comes with a SAS token, which we have no idea how it's generated. Therefore, we need to identify those values. Make sure that we only get the endpoint URL, if the Logic App instance is an HTTP trigger.

### Available Functions

In order to identify available resource functions, simply run the following Azure PowerShell cmdlet. It will show several operations that we can utilise in the `outputs` section of ARM templates.

https://gist.github.com/justinyoo/ecd6d9cf87e4bca99494e89438a627ab

It returns the `listCallbackUrl` operation. If we want to know the object structure that `listCallbackUrl()` function returns, simply run the following Azure PowerShell cmdlet:

https://gist.github.com/justinyoo/d1346882cd9ae862631fae5d20593881

The `listCallbackUrl()` function returns `value`, `basePath` and `queries` properties.

> **NOTE**: We need to specify the API version to run this cmdlet, even though it's an optional parameter; otherwise it will throw an error.

### Implementation

With this information, we can implement the `outputs` section like this:

https://gist.github.com/justinyoo/2196cf52cc28b7d16726465be1db4c02

* * *

So far, we have identified how we can utilise the `outputs` sections of ARM templates using various template functions. As we can see above, Each Azure resource has all different implementations to get keys, endpoints and connection strings. Some are directly using the `reference()` function, the others are using either `listKeys()` or `listWhatever()` functions to get those values. Even worse, the object returned by `listKeys()` or `listWhatever()` has all different structure. Having a different structure is fine for each Azure resource, but they could have been documented in a better way. I hope this post would help figure out how to utilise the `outputs` section with more ease.

> ACKNOWLEDGEMENT: This post has originally been posted at [Mexia blog](https://blog.mexia.com.au/list-of-access-keys-from-output-values-after-arm-template-deployment).
