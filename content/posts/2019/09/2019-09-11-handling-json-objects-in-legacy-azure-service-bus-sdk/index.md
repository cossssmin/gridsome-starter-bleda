---
title: "Handling JSON Objects in Legacy Azure Service Bus SDK"
date: "2019-09-11"
slug: handling-json-objects-in-legacy-azure-service-bus-sdk
description: ""
author: Justin-Yoo
tags:
- sdk-support-on-azure
- azure-service-bus
- legacy
- sdk
- message-driven-architecture
- serialisation
- deserialisation
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/handling-json-objects-in-azure-service-bus-00.png
---

When you're building a message-driven architecture on Azure, you highly likely to consider [Azure Service Bus](https://azure.microsoft.com/en-us/services/service-bus/) as a messaging platform. If you use either Azure Functions or Logic Apps, it's really easy for service integration. However, there are always cases that you would need to use the SDK directly. If you're writing codes in .NET, NuGet has two different SDKs:

- [Microsoft.Azure.ServiceBus](https://www.nuget.org/packages/Microsoft.Azure.ServiceBus/)
- [WindowsAzure.ServiceBus](https://www.nuget.org/packages/WindowsAzure.ServiceBus/)

The first one is based on .NET Standard, which is a cross-platform library. This library has no problem with handling JSON objects as the message format. On the other hand, the second library is the legacy one that requires the full .NET Framework of 4.6.2 or higher. As the latter supports XML document as its default, it's a little bit tricky to handle the JSON message payloads. But as always, there is a way to get through.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/well-find-a-way-we-always-have.jpg)

Throughout this short post, I'm going to discuss how to handle the JSON objects in the legacy SDK. First of all, let's have a look at both message object structure.

## `Microsoft.Azure.ServiceBus.Message`

The first one – cross-platform library – uses the message class of [`Microsoft.Azure.ServiceBus.Message`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.servicebus.message), and it accepts [byte array (`byte[]`) for message body](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.servicebus.message.body). Therefore, serialising and deserialising JSON objects is not a problem. Here is the sample code snippet:

https://gist.github.com/justinyoo/6647b4da30201624a6b3eac372c53657?file=microsoft-azure-servicebus-message.cs

## `Microsoft.ServiceBus.Messaging.BrokeredMessage`

The second one, which is the legacy library, is the one we're dealing with, in this post. It uses the [`Microsoft.ServiceBus.Messaging.BrokeredMessage`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.servicebus.messaging.brokeredmessage) class and is instantiated with an XML serialiser as default.

https://gist.github.com/justinyoo/6647b4da30201624a6b3eac372c53657?file=microsoft-servicebus-messaging-brokeredmessage-with-serialiser.cs

Even if you don't specify the XML serialiser, the message object internally uses it. Therefore, like the second snippet, if you want to use the JSON message, you should use the `DataContractJsonSerializer` class. Now, here's another question. Should we always use the serialiser for JSON messages? Well, not always. We can do without relying on the serialiser!

https://gist.github.com/justinyoo/6647b4da30201624a6b3eac372c53657?file=microsoft-servicebus-messaging-brokeredmessage-with-stream.cs

This code doesn't serialise the object, but serialises it to JSON string and send it to the `BrokeredMessage` object through the `Stream` object. Apparently, the `BrokeredMessage` uses the `Stream` object inside. Therefore, instead of sending the object directly that requires the serialiser, injecting the stream object directly to the `BrokeredMessage` instance would be sufficient.

Of course, both approaches have their own use cases, regardless of using the serialiser or not. If your existing application has already been using serialisers, then it would be easy to stay there. Otherwise, the second option may be useful.

What's your thought?
