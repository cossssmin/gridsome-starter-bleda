---
title: "Cosmos DB in Azure Functions V1 and V2"
date: "2018-02-19"
slug: cosmos-db-in-azure-functions-v1-and-v2
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-cosmos-db
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/cosmos-db-in-azure-functions-v1-and-v2-00.png
---

As one of serverless families in Azure, Cosms DB is becoming very popular. In many development scenarios, Cosmos DB actually replaces existing RDBMS because it requires relatively lower cost for maintenance, and is easy to use. Another serverless family, Azure Functions, also provides triggers and bindings for Cosmos DB. However, in Azure Functions V1 and V2, they are slightly different from each other from the Cosmos DB point of view. In this post, I am going to discuss how they are different from each other, and what version of Azure Functions we should choose with regards to Cosmos DB.

> The sample code used in this post can be found [here](https://github.com/devkimchi/Cosmos-DB-Azure-Function-Binding-Sample).

## Azure Functions Tooling & Template

At the time of this writing, the latest version of [Azure Functions and Web Job Tools](https://marketplace.visualstudio.com/items?itemName=VisualStudioWebandAzureTools.AzureFunctionsandWebJobsTools) is `15.0.40108.0`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/cosmos-db-in-azure-functions-v1-and-v2-01.png)

With this tooling, when we create an Azure Functions project, we are asked to choose the version V1 or V2.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/cosmos-db-in-azure-functions-v1-and-v2-02.png)

Interestingly, number of templates supported in V1 and V2 is different from each other. In other words, Cosmos DB Trigger template is only included in V1. On the other hand, there is no template for Cosmos DB Trigger in V2 at the time of this writing. Here are the screenshots for V1 and V2:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/cosmos-db-in-azure-functions-v1-and-v2-03.png) ![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/cosmos-db-in-azure-functions-v1-and-v2-04.png)

Even though there is no template for Cosmos DB in Azure Functions V2, we still can generate Cosmos DB triggers. Here's what [Jeff Hollan](https://twitter.com/jeffhollan) from Microsoft says about this:

https://twitter.com/justinchronicle/status/960369468449763328

https://twitter.com/justinchronicle/status/960371110301745152

https://twitter.com/jeffhollan/status/960371256737648647

https://twitter.com/jeffhollan/status/960371351570796544

So, technically, even though the tooling doesn't provide the template, we are still able to generate Cosmos DB triggers by our hands. Let's make this happen.

## NuGet Package Dependencies

Azure Functions V1 uses the NuGet package, [`Microsoft.Azure.WebJobs.Extensions.DocumentDB` 1.1.0](https://www.nuget.org/packages/Microsoft.Azure.WebJobs.Extensions.DocumentDB/1.1.0). This package has dependencies on [`Microsoft.NET.Sdk.Functions` 1.0.8](https://www.nuget.org/packages/Microsoft.NET.Sdk.Functions/1.0.8) which also has a dependency on [`Microsoft.Azure.WebJobs.Extensions` 2.1.0](https://www.nuget.org/packages/Microsoft.Azure.WebJobs.Extensions/2.1.0).

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/cosmos-db-in-azure-functions-v1-and-v2-05.png)

On the other hand, Azure Functions V2 uses the NuGet package, [`Microsoft.Azure.WebJobs.Extensions.CosmosDB` 3.0.0-beta6](https://www.nuget.org/packages/Microsoft.Azure.WebJobs.Extensions.CosmosDB/3.0.0-beta6). The Azure Functions SDK has a dependency on [`Microsoft.Azure.WebJobs.Extensions` 3.0.0-beta4](https://www.nuget.org/packages/Microsoft.Azure.WebJobs.Extensions/3.0.0-beta4).

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/02/cosmos-db-in-azure-functions-v1-and-v2-06.png)

Please be mindful that V1 and V2 are using a different NuGet package for Cosmos DB. I hope this will be consolidated sometime soon.

## Cosmos DB Trigger

Because V1 and V2 use a different NuGet package, their codebases are slightly different from each other. For example, here is the Cosmos DB trigger function in V1:

https://gist.github.com/justinyoo/ab73b7afa3ab09a79daca2c68e2895ec

It uses the attribute class, `CosmosDBTrigger` that comes from the NuGet package, `Microsoft.Azure.WebJobs.Extensions.DocumentDB`. On the other hand, although V2 uses the same `CosmosDBTrigger` attribute class, but it comes from the different NuGet package, `Microsoft.Azure.WebJobs.Extensions.CosmosDB`.

Also, V1 uses a default connection string key of [`AzureWebJobsDocumentDBConnectionString`](https://github.com/Azure/azure-webjobs-sdk-extensions/blob/18ff1df93de3069cd59d822c669ddb86b13b8509/src/WebJobs.Extensions.DocumentDB/Config/DocumentDBConfiguration.cs#L24), while V2 uses a default connection string key of [`AzureWebJobsCosmosDBConnectionString`](https://github.com/Azure/azure-webjobs-sdk-extensions/blob/f3d37b8fc73d36a3a20125a4633fed66b1178cf2/src/WebJobs.Extensions.CosmosDB/Config/CosmosDBConfiguration.cs#L24).

> The `CosmosDBTrigger` only accepts hard-coded database name and collection name so it's very hard for configuration and testing. However, Azure WebJobs SDK has the [`INameResolver`](https://github.com/Azure/azure-webjobs-sdk/blob/1c44518071a79d8165c298078db722f38012f220/src/Microsoft.Azure.WebJobs.Host/INameResolver.cs) interface that [interprets app settings key into its value](https://github.com/Azure/azure-webjobs-sdk/wiki/Creating-custom-input-and-output-bindings#binding-expressions). With this feature, we can easily pass configurable database and collection name through app settings.

So, the trigger part is basically the same as each other in V1 and V2 except NuGet package and connection string key, which is good for developers not to get confused too much.

## Cosmos DB Output Binding

However, despite the fact that Cosmos DB trigger in both V1 and V2 is almost the same as each other, its output binding decorator is rather confusing at the first glance. This is the Cosmos DB output binding in V1:

https://gist.github.com/justinyoo/8540f08c5d9d8fdc4e6cfc17802bc40a

It uses the `DocumentDB` attribute class. And this is the same output binding in V2:

https://gist.github.com/justinyoo/2e8f58b30774b3a381995c7b1ab07b89

It instead uses the `CosmosDB` attribute class.

## Which Version to Choose – V1 or V2?

Why are they different from each other? As we can see their version of NuGet packages, V1 is running on Azure WebJobs 2.x while V2 is running on Azure WebJobs 3.x. Eventually, when V2 becomes GA, all 2.x related classes (the `DocumentDB` attribute class for example in this post) will be deprecated and no longer supported. If you are currently running Azure WebJobs and Functions V1, and still have time for migration, stay V1 but prepare migration to reduce hiccups on those changes.

If you start implementing Azure Functions, I would recommend using V2 because it is running on .NET Core, which supports cross-platform development environment. Of course, currently number of supporting templates in V2 is way too smaller than V1, but it is just matter of time. Actually, these reasons are not as enough as for choosing V2 in your Azure Functions development. But think of this. In V2, the out-of-the-box dependency injection feature is on the way.

https://twitter.com/codesapien/status/963998369063424000

This feature will be a huge step forward for V2 in Azure Functions. Even only with this feature, I would suggest and use V2 to make your function codes easily mockable, testable and decoupled. As soon as this feature is shipped, I will review it and post another blog for dependency injections.

* * *

So far, we have briefly discussed a few differences between Azure Functions V1 and V2, and choosing the most appropriate version between both. I hope this post will help you develop Azure Functions application with Cosmos DB.

> ACKNOWLEDGEMENT: This post has originally been posted at [Mexia blog](https://blog.mexia.com.au/cosmos-db-in-azure-functions-v1-and-v2).
