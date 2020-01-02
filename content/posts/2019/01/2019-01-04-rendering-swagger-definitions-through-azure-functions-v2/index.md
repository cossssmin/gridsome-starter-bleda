---
title: "Rendering Swagger Definitions through Azure Functions V2"
date: "2019-01-04"
slug: rendering-swagger-definitions-through-azure-functions-v2
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- dependency-injection
- di
- swagger
- open-api
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/rendering-swagger-definitions-on-azure-functions-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

Azure Function 1.x provides a preview feature [to render Open API 2 (Swagger) definitions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-openapi-definition). I wrote a [blog post about this](https://blog.kloud.com.au/2017/06/13/azure-functions-with-swagger/) quite a while ago, but unfortunately, Azure Functions 2.x hasn't yet supported this feature. Therefore, we can't automagically generate it but manually implement to render it. Throughout this post, I'm going to walk through how to render Swagger definition in both JSON and YAML.

> All sample codes used in this post can be found at [here](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps).

## API Design-First vs Implementation-First

In terms of the API Implementation-First approach, Azure Functions 1.x only provides its limited feature as preview. It automatically generates Swagger definitions (although it doesn't perfectly generate it) from the portal by identifying HTTP triggers. As Azure Functions 2.x has omitted this feature, we're not able to use the Implementation-First approach any longer.

On the other hand, if we take the API Design-First approach, we can still render the definitions through another Azure Functions endpoint. This Design-First approach is also beneficial for collaborations between front-end and back-end developers, even though back-end developers haven't implemented it because front-end developers already know API structures. Therefore, many enterprise-wide development prefer this API Design-First approach.

The sample code above has already got the Swagger definitions in YAML format, so we can simply use this.

https://gist.github.com/justinyoo/d52cc2d6f5613b0714f21db993c5918d?file=swagger.yaml

## Rendering Swagger Definitions

As you can see the definitions above, there are two endpoints, `/api/secrets` and `/api/secret/{name}`. In addition to them, it also defines how request formats are and how response payloads look like. So, the Functions code is only to read the YAML file and parse it either JSON or YAML format, depending on the request. Let's have a look at the entry point below. It has the endpoint of `/api/swagger.{extension}`, which takes either `json` or `yaml` as an extension.

https://gist.github.com/justinyoo/d52cc2d6f5613b0714f21db993c5918d?file=swagger-trigger.cs

Of course, this code uses the [Azure Functions Dependency Injection package](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.DependencyInjection/), so the main logic for rendering/parsing is done within the `IRenderSwaggerFunction` instance. Let's have a look. It reads the API definition from the given URL and render it either JSON or YAML, based on the request extension.

https://gist.github.com/justinyoo/d52cc2d6f5613b0714f21db993c5918d?file=render-swagger-function.cs

Let's run this code in our local machine and send a request through Postman. If the request is sent with the `json` extension, it renders like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/rendering-swagger-definitions-on-azure-functions-01.png)

This time, it renders with the `yaml` extension.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/rendering-swagger-definitions-on-azure-functions-02.png)

It is noticed that the original document is written in YAML, it renders either JSON or YAML. Actually, this can be updated to read either YAML or JSON, rather than reading only YAML document.

* * *

So far, we have walked through how Azure Functions 2.x can render Swagger definition document based on request extension. Over the last a few posts, we've played around Azure Functions and Key Vault. In the next post, I'll put this altogether to create a bigger value.
