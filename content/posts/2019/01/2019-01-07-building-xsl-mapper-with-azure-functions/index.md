---
title: "Building XSL Mapper with Azure Functions"
date: "2019-01-07"
slug: building-xsl-mapper-with-azure-functions
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-logic-apps
- integration-account
- xml-transformation
- xsl-mapping
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-xsl-mapper-with-azure-functions-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

In order to use [BizTalk server](https://www.microsoft.com/en-au/cloud-platform/biztalk) for your service integration project, you can't avoid using XML transformation. If you're about to migrate these integration components into Azure iPaaS, [Logic Apps](https://azure.microsoft.com/en-au/services/logic-apps/) and [Integration Account](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-enterprise-integration-create-integration-account) should be necessary. Integration Account provides many features like XML schema mapping, XML data transformation, extension objects storage, etc. However, it's way too expensive, which costs more than AU$410 per month.

Therefore, using Integration Account might not be cost-efficient, especially if you're using Azure Functions and/or Logic Apps, which is way cheaper than Integration Account. Fortunately, our fellow Azure MVP, [Toon Vanhoutte](https://twitter.com/toonvanhoutte) wrote an awesome [blog post](https://toonvanhoutte.wordpress.com/2017/06/16/run-biztalk-extension-objects-in-logic-apps/) that discussed how to write a Web API application as an alternative to Integration Account. In addition to that, throughout this post, I'm going to write an Azure Function app doing the same job, instead of Web API app.

> All sample codes used in this post can be found at [here](https://github.com/aliencube/AzureFunctions-XSL-Mapper).

## Azure Functions Version Selection

The [`XslCompiledTransform`](https://docs.microsoft.com/en-us/dotnet/api/system.xml.xsl.xslcompiledtransform?view=netcore-2.2) class must be used for this feature. Especially the XSLT mapper feature in the BizTalk Server relies on the inline C# script feature, but unfortunately, it's not supported yet. If you run the Function app 2.x, it throws the following error message.

```bat
Compiling JScript/CSharp scripts is not supported

```

At the time of writing this post, [.NET Core doesn't supports this feature. Even there's no plan to implement this feature](https://github.com/dotnet/corefx/issues/19837). In other words, we can't use Azure Functions 2.x, which uses .NET Core 2.x. Therefore, we have to stay on 1.x.

## Configurations

We now got the correct version of Azure Functions. Now we need to setup environment variables. In your local dev box, simply use `local.settings.json`. Then set the App Settings blade on your Azure Functions instance.

- `Containers__Mappers`: Blob storage container name that stores XSL mapper files. Default value is `mappers`.
- `Containers__ExtensionObjects`: Blob storage container name that stores extension object library files. Default value is `extensionobjects`.
- `EncodeBase64Output`: Value indicating whether to encode the transformed XML data in base-64 or not. Default value is `false`.

## XSLT Mapper Files Upload

If you have the XSLT mapper container in the blob storage, upload all XSLT mapper files to the container. Any XSLT file might look like:

https://gist.github.com/justinyoo/aabdf5f167ab644a39c13eb5469039b2?file=transform.xsl

For example, the XSLT file above has the namespace of `userCSharp` and `ScriptNS0`. The `userCSharp` namespace refers to the inline C# script block, and the `ScriptNS0` namespace refers to the extension object library files. You might have found out `select="usserCSharp:DoSomething1()"` and `select="ScriptNS0:DoSomething2()"`.

Therefore, if you upload this XSLT file to the blob storage, the inline C# script block can be directly referred. How can the external libraries be referenced?

## Extension Object Libraries Upload

If you have the extension object container in the blob storage, upload all .dll files to the container. There must be files containing each library file's metadata like below:

https://gist.github.com/justinyoo/aabdf5f167ab644a39c13eb5469039b2?file=extension-object.xml

This metadata is very important because this needs to be included within the request payload together with XML data.

## Request Payload Structure

In this example, we have the JSON request payload like:

https://gist.github.com/justinyoo/aabdf5f167ab644a39c13eb5469039b2?file=request.json

If you're organised enough, you might have already created sub-directories for each XSLT mapper and extension object library. If you don't need sub-directories, you don't have to fill in the `directory` value. Instead, just put `null`. Then, give XSLT mapper name and .dll file name. And finally, give fully qualified assembly name and class name.

The `inputXML` value will be the XML document to be transformed.

## XML Transformation

Everything is ready! Call the function endpoint with the payload above. If you choose to use base-64 encoding, the result might look like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-xsl-mapper-with-azure-functions-01.png)

If no encoding option is chosen, the result might look like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-xsl-mapper-with-azure-functions-02.png)

## Logic App Integration

Now we got an Azure Function app. After this, instead Logic App calls the Integration Account, simply call the Azure Functions instance with the request payload above. Then you'll get the exactly same result from Integration Account.

* * *

So far, we've written an Azure Function app to see if it can replace the existing Integration Account or not, for XML data transformation. If your organisation plans to migrate to Azure iPaaS from on-prem, this serverless option can be an option to reduce cost.
