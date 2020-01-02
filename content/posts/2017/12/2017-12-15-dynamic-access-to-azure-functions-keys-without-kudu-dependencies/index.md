---
title: "Dynamic Access to Azure Functions Keys without KUDU Dependencies"
date: "2017-12-15"
slug: dynamic-access-to-azure-functions-keys-without-kudu-dependencies
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- azure-functions
- azure-powershell
- kudu
- secret
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-00.png
---

> ACKNOWLEDGEMENT: This has been originally posted on [Mexia blog](https://blog.mexia.com.au/dynamic-access-to-azure-functions-keys-without-kudu-dependencies)

I was asked by a previous client whether there would be a way to access to individual function keys, host keys and master key of an Azure Functions app instance without visiting Azure Portal. Because they wanted to use Azure Functions for their CI/CD pipeline with [Deployment Gates](https://docs.microsoft.com/en-us/vsts/build-release/concepts/definitions/release/approvals/gates), they would need direct access to Azure Functions HTTP triggers within their build/release pipeline. Of course, they can store those function keys as environment variables, but it will be more handy, if they can retrieve those keys programmatically. It's an interesting question to me because I know how to do it but I haven't really done this before. I did quick research on it and found a few [blog](http://blog.octavie.nl/index.php/2017/04/20/get-the-default-azure-function-key-with-powershell) [posts](http://bloggingoncloud.com/get-azure-function-app-master-key-host-key-by-api-end-point-programmatically/) and [StackOverflow question and answer](https://stackoverflow.com/questions/46338239/retrieve-the-host-keys-from-an-azure-function-app). You might have been aware that all these approaches use KUDU API at the first place. This is OK as long as it works. However, [Microsoft Azure App Service Team tried to keep away from using KUDU API for it](https://github.com/Azure/azure-webjobs-sdk-script/issues/1334) and [managed to implement another approach using a JWT bearer token](https://github.com/Azure/azure-webjobs-sdk-script/pull/1373). In this post, I'm going to show how to use the JWT bearer token to retrieve all function master key, host keys and individual function keys through Azure PowerShell, without having dependency on KUDU APIs.

## Prerequisites

In order to use this approach, we need an Azure Function app instance up and running. This can be easily done through Azure Portal or ARM template. Then, deploy a few functions.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-01.png)

We can add more function keys on each function, if we like.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-02.png)

In addition to this, we need the following information:

- Tenant Id and Subscription Id,
- Resource Group Name, and
- Function App Name.

And finally, we might have to need a service principal that is:

- Registered in our Azure Active Directory, and
- Application Id (client Id) and key (client secret).

We're not going to dive further to register the service principal to Azure Active Directory here. Instead, refer to this [official guide](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal).

## Claiming JWT Token for Azure Resource Manager API

OK, first thing goes first. All Azure resources provide their REST API endpoints. In order to call those APIs, we need to get an access token beforehand. As acquiring the access token is [well documented here](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-rest-api#generating-an-access-token), we just use this.

https://gist.github.com/justinyoo/231c595c411791fc4aba4da3a9e01c68

When we run this, we'll have the access token for Azure Resource Management REST API.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-03.png)

## Claiming JWT Token for Azure Functions

Now, Azure Resource Manager REST API offers [an endpoint to get functions admin token](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/getfunctionsadmintoken). This is the very KUDU API replacement.

https://gist.github.com/justinyoo/1c60c59feef0aaf76462b3142809f06a

When we run this, we'll have the admin bearer token to access to Azure Function app's admin APIs.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-04.png)

> **NOTE**: This token has a very short life-time span. Therefore, it's always a good idea to get this admin token every time we access to the Azure Functions admin API endpoints.

## Retrieving List of Functions

In an Azure Functions app, if more than one function exist, we can list up all functions.

https://gist.github.com/justinyoo/450b793d2e75fd201dce7f346f74ff7a

When we run this, we'll see the list of functions.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-05.png)

> **NOTE**: The list of functions doesn't only include HTTP trigger functions, but also include other types of functions. In this example, `test3` is a disabled Timer trigger function and `test4` is Queue trigger function.

## Accessing to Individual Function Keys

According to the [wiki document](https://github.com/Azure/azure-webjobs-sdk-script/wiki/Key-management-API), we can access to the individual function keys by sending an API request to Azure Functions' admin API. We now have the bearer token to access to the admin APIs, and list of functions. Therefore, simply run the following PowerShell script to get those function keys.

https://gist.github.com/justinyoo/6db76e59d925cddbafe704991900779c

> **NOTE**: You can iterate `$functionName` using either [`ForEach-Object`](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/foreach-object) or [`foreach` loop](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_foreach) to get the keys of all functions.

When we run this, we'll see the list of keys belong to the given function.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-06.png)

## Accessing to Host Keys

Let's think about there are multiple functions in one Azure Functions instance. Iterating each function to get individual function key might not be ideal. Instead, we can use a host key to access to all functions. Let's get into it.

https://gist.github.com/justinyoo/a26b15941c7af4e1565e547e2098d55e

When we run this, we'll see the list of host keys belong to the function app instance.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-07.png)

## Accessing to Master Key

There's one more. We have not been able to get the master function key, `_master`. In order to get this, we need to try a different endpoint, which has not been documented. Fortunately, the fact that Azure Functions is [an open source project](https://github.com/Azure/azure-webjobs-sdk-script) allows us to see its source code. When we have a look at [the code](https://github.com/Azure/azure-webjobs-sdk-script/blob/dev/src/WebJobs.Script.WebHost/Controllers/KeysController.cs#L74), it has a different endpoint to get the `_master` key, which is `/admin/host/systemkeys/_master`.

https://gist.github.com/justinyoo/d072ba1170421ebd1b7ce31bd50a799c

When we run this, we'll see the master key belongs to the function app instance.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/dynamic-access-to-azure-functions-host-keys-without-kudu-08.png)

> **NOTE**: Even though we can retrieve the master key, I wouldn't recommend doing it as we should keep this key as secure as possible.

* * *

So far, we have retrieved individual function keys, host keys and master key that belong to each function and function app itself. As discussed at the beginning of this post, there must be a requirement that we need to get those keys programatically. Although we just use PowerShell scripts here, we can actually write this entirely in C# or JavaScript, if necessary, as it's purely REST API-based. I hope this will give your app development with more flexibilities.
