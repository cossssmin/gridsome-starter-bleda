---
title: "Introducing Schema Registry for Azure Messaging Services"
date: "2019-10-23"
slug: introducing-schema-registry-for-azure-messaging-services
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-blob-storage
- azure-queue-storage
- azure-service-bus
- azure-event-grid
- azure-event-hub
- eventing
- messaging
- schema-registry
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/introduction-to-schema-registry-for-azure-messaging-service-01.png
---

In my [previous post](https://devkimchi.com/2019/10/09/many-meanings-of-message-validation/), we discussed the Schema Registry as a tool for message validation. When designing asynchronous or event-/message-driven system architecture on the cloud, the schema registry should really be considered to check the validity of messages. Unfortunately, any of Azure messaging service including [Queue Storage](https://docs.microsoft.com/azure/storage/queues/storage-queues-introduction?WT.mc_id=devkimchicom-blog-juyoo), [Service Bus](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview?WT.mc_id=devkimchicom-blog-juyoo), [Event Hub](https://docs.microsoft.com/azure/event-hubs/event-hubs-about?WT.mc_id=devkimchicom-blog-juyoo), [Event Grid](https://docs.microsoft.com/azure/event-grid/overview?WT.mc_id=devkimchicom-blog-juyoo) doesn't currently support the schema registry feature. Therefore, we have to implement it by ourselves.

Throughout this post, I'm going to build a schema registry using [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo) and register schemas there, with sample codes.

## Sample Codes and NuGet Libraries

All [sample codes](https://github.com/aliencube/AzureMessaging.SchemaRegistry/tree/master/samples) shown in this post use C# libraries from NuGet, based on [.NET Core](https://docs.microsoft.com/dotnet/core/about?WT.mc_id=devkimchicom-blog-juyoo). Here are all the links to the libraries and documents downloadable from the [GitHub repository](https://github.com/aliencube/AzureMessaging.SchemaRegistry).

| Package | Document | Download | Version |
| ------- | -------- | -------- | ------- |
| [Aliencube.AzureMessaging.SchemaRegistry](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry/) |
| [Aliencube.AzureMessaging.SchemaRegistry.Sinks](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.Sinks.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.Sinks.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks/) |
| [Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks-blob.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob/) |
| [Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks-file-system.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem/) |
| [Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks-http.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http/) |
| [Aliencube.AzureMessaging.SchemaValidation](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-validation.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaValidation.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaValidation.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation/) |
| [Aliencube.AzureMessaging.SchemaValidation.HttpClient](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.HttpClient/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-validation-http-client.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaValidation.HttpClient.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.HttpClient/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaValidation.HttpClient.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.HttpClient/) |
| [Aliencube.AzureMessaging.SchemaValidation.ServiceBus](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.ServiceBus/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-validation-service-bus.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaValidation.ServiceBus.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.ServiceBus/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaValidation.ServiceBus.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.ServiceBus/) |

## Publisher/Subscriber Architecture Pattern

The [Pub/Sub pattern](https://docs.microsoft.com/azure/architecture/patterns/publisher-subscriber?WT.mc_id=devkimchicom-blog-juyoo) introduced in the [previous post](https://devkimchi.com/2019/10/09/many-meanings-of-message-validation/) has now a schema registry and here's the updated architecture diagram.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/introduction-to-schema-registry-for-azure-messaging-service-01.png)

We're going to implement those three parts:

- [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo): This works as a schema registry.
- [Azure Logic Apps](https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo): This is used for both publisher and subscriber. It'll be further discussed in the next post.
- [Azure Functions](https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo): This is used for message validation. It'll be further discussed in the next post.

## Implementing Schema Registry

By declaring a container on [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo), we can use it as a schema registry. If the high availability is considered, get another Blob Storage instance and store schemas to both storages. However, for our convenience, we're going to create two containers in one Blob Storage, called `schemas` and `backups`, which emulates as if there are two separate Azure Storage accounts. From the resource management perspective, we need three resources to use Blob Storage as the schema registry:

1. Storage Account instance
2. Blob Service
3. Blob Container

Here's the over-simplified version of ARM template for Blob Storage. If you're interested in the whole template structure, [check out](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/samples/Resources/StorageAccount.yaml) this GitHub page.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=storage-account.yaml

> As you can see above, all ARM templates are written in YAML. If you want to know more about YAML-based ARM templates, please have a look at my [previous post](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/).

After completing the ARM template, run this through [Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=devkimchicom-blog-juyoo) to generate the instance.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=deploy-storage-account.sh

This is the result of Schema Registry implementation.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/introduction-to-schema-registry-for-azure-messaging-service-02.png)

Let's write a console app to register schemas.

## Schema Registration

In a nutshell, registering schemas is just uploading them into [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo). Therefore, we can simply use Azure [REST API](https://docs.microsoft.com/rest/api/storageservices/blob-service-rest-api?WT.mc_id=devkimchicom-blog-juyoo) or [SDKs](https://docs.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-dotnet?WT.mc_id=devkimchicom-blog-juyoo) [using](https://docs.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-java?WT.mc_id=devkimchicom-blog-juyoo) [in](https://docs.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-python?WT.mc_id=devkimchicom-blog-juyoo) [different](https://docs.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-nodejs-v10?WT.mc_id=devkimchicom-blog-juyoo) [languages](https://docs.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-php?tabs=windows&WT.mc_id=devkimchicom-blog-juyoo). However, there are always use cases that [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo) is not the only schema registry, but it can be anything, say [AWS S3 Bucket](https://aws.amazon.com/s3/) or something else. To consider this sort of possibility, the library borrows the concept of the [Sink](https://en.wikipedia.org/wiki/Sink_(computing)) and each sink works as [DSL](https://en.wikipedia.org/wiki/Domain-specific_language). Therefore, for our use case, declare [`BlobStorageSchemaSink`](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks-blob.md) and upload schemas through it.

> The entire sample code for this schema registration console app is [here](https://github.com/aliencube/AzureMessaging.SchemaRegistry/tree/master/samples/Aliencube.AzureMessaging.SchemaRegistry.ConsoleApp).

### Sink Declaration for Schema Registry

Within the console app, declare two sinks with two containers, as we are going to have two sinks, one for main and the other for backup.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=declare-blob-sink-for-schema-registry.cs

When you have a look at the code, the `BlobStorageSchemaSink` library introduces [Fluent API](https://en.wikipedia.org/wiki/Fluent_interface) and actively uses the [method chaining](https://en.wikipedia.org/wiki/Method_chaining) approach like `WithXXX()` methods. As a result, the code readability gets significantly improved.

> In case you are confused the concept between "train wreck" and "method chaining", have a look at [this post](http://www.blackwasp.co.uk/LawOfDemeter.aspx) and [this post](https://randomthoughtsonjavaprogramming.blogspot.com/2013/10/trainwreck-vs-method-chaining.html) to get a high-level overview.

### Schema Producer Declaration

Now, we've got the schema sink representing the schema registry. We need to declare the [`SchemaProducer`](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/src/Aliencube.AzureMessaging.SchemaRegistry/SchemaProducer.cs). As the [`SchemaRegistry`](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry.md) library contains the producer, import the library and use it.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=declare-schema-producer.cs

The code shows how to declare the producer and register two sinks that connect to each schema registry.

### Schema Upload

Let's upload schemas! The following code snippet shows how to upload schema through the producer by sending the class type reference.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=register-schema-1.cs

If a JSON schema is ready, then upload it directly like below:

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=register-schema-2.cs

Once the schema is uploaded, [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo) shows it's uploaded.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/introduction-to-schema-registry-for-azure-messaging-service-03.png)

So far, we've created a schema registry using [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-overview?WT.mc_id=devkimchicom-blog-juyoo) and register schemas using the NuGet libraries with a sample console app. In the next post, we're going to deal with the next part of this implementation – how publisher and subscriber make use of the schema registry for message validation.
