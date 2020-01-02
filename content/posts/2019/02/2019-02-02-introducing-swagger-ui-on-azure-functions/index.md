---
title: "Introducing Swagger UI on Azure Functions"
date: "2019-02-02"
slug: introducing-swagger-ui-on-azure-functions
description: ""
author: Justin-Yoo
tags:
- dotnet
- azure-functions
- open-api
- swagger
- swagger-ui
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/rendering-swagger-ui-via-azure-functions-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer’s.

There's an awesome library called [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore) in ASP.NET Core Application. With Swashbuckle, it can't never be easier to build Swagger UI automatically. On the other hand, Azure Functions hasn't been invited to that party yet.

In Azure Functions 1.x, it's been offering [Swagger document as a preview feature](https://docs.microsoft.com/en-us/azure/azure-functions/functions-openapi-definition). I wrote a [blog post](https://blog.kloud.com.au/2017/06/13/azure-functions-with-swagger/) about that. The downside of it is that preview feature is still immature. Even worse, Azure Functions 2.x hasn't offered that preview feature at all. In the end, I wrote another [blog post](https://devkimchi.com/2019/01/04/rendering-swagger-definitions-through-azure-functions-v2/) to render a Swagger document that was already written and uploaded to somewhere. But this doesn't still look good. This is based on Design-First Approach draws the Open API definition first then does the implementation later. This is only good when designing the API at the first time. However, over time it's not always the case during the operation phase. Therefore a library like Swashbuckle is very useful. The lack of this feature in Azure Functions has brought out my attention and, as a result, I built an extension library, called [Aliencube.AzureFunctions.Extensions.OpenApi](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/).

I'm not too sure how the internal discussion in Microsoft product group goes on and they put a priority on this. But I'm sure this would be very useful until an official library or extension comes out. I'm going to discuss here how to use my library, [Aliencube.AzureFunctions.Extensions.OpenApi](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/).

> **NOTE**: All the code sample used here can be found at [here](https://github.com/aliencube/AzureFunctions.Extensions).

## What Version of Azure Functions Should I Use?

As this library uses the HTTP triggers on Azure Functions, you can use this on both version 1.x and 2.x.

## Download NuGet Package

Here's the NuGet package download: [![](https://img.shields.io/nuget/dt/Aliencube.AzureFunctions.Extensions.OpenApi.svg)](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/) [![](https://img.shields.io/nuget/v/Aliencube.AzureFunctions.Extensions.OpenApi.svg)](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/)

## Writing HTTP Triggers

Now, in order to generate Open API document, we need HTTP endpoints. Let's write two basic HTTP triggers – one for GET and the other for POST.

https://gist.github.com/justinyoo/002920c00bfbe31e427d4de4a914f58e?file=sample-function.cs

As you can see, the library uses many decorators like what Swashbuckle does, to define Open API document. In addition to this, the library is based on [OpenAPI.NET](https://www.nuget.org/packages/Microsoft.OpenApi/), which follows [Open API 3.0.1 spec](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md). Therefore, all decorators also follows that spec. If you want to know further details of each decorator, [this document](https://github.com/aliencube/AzureFunctions.Extensions/blob/master/docs/openapi.md) would be worth reading. The latest version of my extension library is [1.1.0](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/1.1.0) and it has implemented the minimum viable working level.

## Configuring Metatdata for Open API

It is mandatory to define [Info Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#infoObject). As this is basically metadata, it's better to define thorough environment variables like `local.settings.json` or App Settings. Here's an example:

https://gist.github.com/justinyoo/002920c00bfbe31e427d4de4a914f58e?file=local-settings.json

If this is for Azure Functions instance, its App Settings blade should include the following keys:

- `OpenApi__Info__Version`: **REQUIRED** Version of Open API document. This is not the version of Open API spec. eg. 1.0.0
- `OpenApi__Info__Title`: **REQUIRED** Title of Open API document. eg. Open API Sample on Azure Functions
- `OpenApi__Info__Description`: Description of Open API document. eg. A sample API that runs on Azure Functions either 1.x or 2.x using Open API specification.
- `OpenApi__Info__TermsOfService`: Terms of service URL. eg. https://github.com/aliencube/AzureFunctions.Extensions
- `OpenApi__Info__Contact__Name`: Name of contact. eg. Aliencube Community
- `OpenApi__Info__Contact__Email`: Email address for the contact. eg. no-reply@aliencube.org
- `OpenApi__Info__Contact__Url`: Contact URL. eg. https://github.com/aliencube/AzureFunctions.Extensions/issues
- `OpenApi__Info__License__Name`: **REQUIRED** License name. eg. MIT
- `OpenApi__Info__License__Url`: License URL. eg. http://opensource.org/licenses/MIT
- `OpenApi__ApiKey`: API Key of the endpoint that renders the Open API document.

## Rendering Open API Document

We've setup environment variables and written two HTTP triggers. Now, it's time to render them. Let's have a look at another HTTP trigger, which uses the `OpenApiIgnoreAttribute` decorator to avoid it from being included to the Open API document.

https://gist.github.com/justinyoo/002920c00bfbe31e427d4de4a914f58e?file=render-openapi-document.cs

The function code above allows both `version` and `extension` bindings. As a result, you can find out the result like below:

- `/api/openapi/v2.json` ![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/rendering-swagger-ui-via-azure-functions-01.png)
    
- `/api/openapi/v2.yaml` ![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/rendering-swagger-ui-via-azure-functions-02.png)
    
- `/api/openapi/v3.json` ![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/rendering-swagger-ui-via-azure-functions-03.png)
    
- `/api/openapi/v3.yaml` ![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/rendering-swagger-ui-via-azure-functions-04.png)
    

## Rendering Swagger UI Page

Once the Open API document rendering HTTP trigger is done, it's now the time to build the Swagger UI page. Likewise, the `OpenApiIgnoreAttribute` decorator is used to be excluded from the Open API document. The code below has the `swagger.json` endpoint hard-coded because the code above hard-coded `swagger.json` for Open API document endpoint.

> The version of Swagger UI at the time of this writing is [`3.20.5`](https://github.com/swagger-api/swagger-ui/releases/tag/v3.20.5).

https://gist.github.com/justinyoo/002920c00bfbe31e427d4de4a914f58e?file=render-swagger-ui.cs

Once it's done, just hit the endpoint of `/api/swagger/ui` through your web browser, and you will be able to see the following screen, which is awesome!

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/rendering-swagger-ui-via-azure-functions-05.png)

This has been done in your local machine. Let's deploy it to Azure. In order to access to the HTTP trigger endpoint, we should use either `code=xxx` in the querystring or `x-functions-key` header. As a result, you will be able to see the page like below:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/rendering-swagger-ui-via-azure-functions-06.png)

* * *

So far, we've walked through how to use the [Aliencube.AzureFunctions.Extensions.OpenApi](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/) library to render both Open API document and Swagger UI page. With this library, your Azure Function instance will be much more useful than before.
