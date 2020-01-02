---
title: "Handling Messages with Geo-Redundant Azure Service Bus via Azure Functions"
date: "2019-10-30"
slug: handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-functions
- azure-service-bus
- dependency-injection
- geo-redundancy
- fan-in
- fan-out
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-00.png
---

[Azure Service Bus](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview?WT.mc_id=devkimchicom-blog-juyoo) is one of the messaging services in Azure. According to their SLA, it [guarantees 99.9% of uptime](https://azure.microsoft.com/support/legal/sla/service-bus/v1_1/?WT.mc_id=devkimchicom-blog-juyoo), which is approximately equivalent to 43 mins of downtime per month (30 days). If your organisation uses Azure Service Bus and can be tolerant of 43 mins of a service failure for a month, then it should be fine. However, if your system is really required for high availability, 43 mins of downtime might be unacceptable. As a part of the business continuity plan (BCP), [disaster recovery](https://en.wikipedia.org/wiki/Disaster_recovery) can be covered by [Azure Service Bus Premium Plan](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-premium-messaging?WT.mc_id=devkimchicom-blog-juyoo).

By the way, the Premium plan is [way more expensive](https://azure.microsoft.com/pricing/details/service-bus/?WT.mc_id=devkimchicom-blog-juyoo), comparing to the Standard plan. Although the Premium plan brings more benefits to the organisation, if your organisation is cost-sensitive, introducing the plan is not convincing enough. Fortunately, we can also implement [the high availability with the Standard plan](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-outages-disasters?WT.mc_id=devkimchicom-blog-juyoo#active-replication). Once it's implemented, the highly available architecture keeps the uptime rate of 99.9999%, which is converted to 2.6 secs per month.

The Premium plan takes care of all those disaster recovery plans, while we MUST take care of it by ourselves. There's already a sample code on [GitHub](https://github.com/Azure/azure-service-bus/tree/master/samples/DotNet/Microsoft.Azure.ServiceBus/GeoReplication), but it's for [Service Bus Queue](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-dotnet-get-started-with-queues?WT.mc_id=devkimchicom-blog-juyoo), not for [Service Bus Topic](https://docs.microsoft.com/azure/service-bus-messaging/service-bus-dotnet-how-to-use-topics-subscriptions?WT.mc_id=devkimchicom-blog-juyoo). Therefore, I'm going to walk-through how to implement geo-redundant Azure Service Bus instances with [Azure Functions](https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo), to Service Bus Topics.

> The sample codes used in this post can be found at this [GitHub repository](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample).

## Creating Two Azure Service Bus Standard Instances

First of all, we need two Azure Service Bus instances with the Standard plan. In this post, I'm going to create one in Australia Southeast as the primary region and the other in Australia East as the secondary region.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-01.png) ![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-02.png)

Once created, create a topic, `my-topic`, and a subscription, `my-topic-subscription` in both instances.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-03.png)

Now, we've got two Standard instances in a different region. Both are representing the geo-redundant Service Bus. Let's implement an Azure Functions app to handle messages for both.

## Preparing Azure Functions

It's probably a good time to get yourself familiarised the following technics. I'm sure you can pick up those concepts pretty quickly, as it's been already used in many places.

- [Deserialising environment variables](https://docs.microsoft.com/azure/app-service/configure-common?WT.mc_id=devkimchicom-blog-juyoo#configure-app-settings)
- Managing [Inversion of Control (IoC)](https://en.wikipedia.org/wiki/Inversion_of_control) container
- [Constructor injection on Azure Functions](https://docs.microsoft.com/azure/azure-functions/functions-dotnet-dependency-injection?WT.mc_id=devkimchicom-blog-juyoo)
- Message [Fan-out](https://en.wikipedia.org/wiki/Fan-out_(software))/[Fan-in](https://en.wikipedia.org/wiki/Fan-in)

### Deserialising Environment Variables

To develop an Azure Function app in our local machine, we always use the `local.settings.json` file. It emulates the App Settings blade of the Azure Functions instance, which is basically a list of key/value pairs. Therefore, if we need more structural and strongly-typed configurations, the keys SHOULD follow the format like below. The overall format can be found at [here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/local.settings.json).

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=local-settings.json

For each nested field is concatenated with two underscores(`__`). Those two underscores convert those environment variables into the [strongly-typed objects](https://docs.microsoft.com/azure/app-service/configure-common?WT.mc_id=devkimchicom-blog-juyoo#configure-app-settings). Here are class definitions of those environment variables.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=app-settings-service-bus.cs

The `AzureServiceBusSettings` class has the `ConnectionStrings` property of the dictionary type. With this dictionary, any number of Azure Service Bus instance can be declared here for geo-redundancy. Here in this post, we only use two instances, but technically we can use more instances.

`AppSettings` instantiates those environment variables. Have a look at the code below. The overall code is [here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Configs/AppSettings.cs).

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=app-settings.cs

The `AppSettings` class inherits the `AppSettingsBase` class which is included within the [Aliencube.AzureFunctions.Extensions.Configuration.AppSettings](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.Configuration.AppSettings/) package. This package calls the method like `this.Config.Get<AzureServiceBusSettings>(ServiceBusSettingsKey)` to create the strongly-typed object that represents the entire app settings configurations. Then register the `AppSettings` instance as a singleton to the IoC container. Once we complete this step, we don't need to worry about the configurations any longer.

### Creating IoC Container

Until recently, earlier this year precisely, we had to use the `static` modifier for Azure Functions. With this restriction, we SHOULD use the service locator pattern for dependency injection. However, as we are now able to use the [IoC container](https://devkimchi.com/2019/02/22/performing-constructor-injections-on-azure-functions-v2/), dependency management has become really easy. Have a look at the [code](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/StartUp.cs) below.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=ioc-container.cs

In the IoC container, we register the `AppSettings` instance as a singleton. There's another instance, `IMessageService`. We'll discuss it later in this post.

### Constructor Injection to Function Class

Let's create a function class. Unfortunately, Azure Functions [Service Bus binding](https://docs.microsoft.com/azure/azure-functions/functions-bindings-service-bus?WT.mc_id=devkimchicom-blog-juyoo) doesn't natively support multiple service instances for geo-replication. Therefore, we MUST use the [SDK](https://docs.microsoft.com/dotnet/api/overview/azure/service-bus?view=azure-dotnet&WT.mc_id=devkimchicom-blog-juyoo) to send messages to multiple instances at the same time. The `IMessageService` interface looks after this concern.

Therefore, this `IMessageService` instance SHOULD be injected to the function class. Here's the code snippet how the constructor injection works. The complete code can be found at [here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/MessageSendHttpTrigger.cs).

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=http-trigger.cs

There's no `static` modifier any longer, as you can see. In addition to this, the `IMessageService` is injected through the constructor.

### Implementing Message Fan-Out

It's time to implement to send messages. Have a look at the class, `MessageService`, that implements `IMessageService`. The `AppSettings` instance is injected for use. There are two methods implemented to send messages – one for `WithTopicClients()` and the other for `SendAsync()`. The actual implementation is [here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Services/MessageService.cs#L38).

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=message-with-topic-clients.cs

The `WithTopicClients()` method registers the `TopicClient` instances based on the connection strings from `AppSettings`. By returning `this`, it's also worth noting this method also implements method chaining, using the [fluent interface](https://en.wikipedia.org/wiki/Fluent_interface) approach.

Let's have a look at the method, `SendAsync()`. It sends a message to both Service Bus Topics at the same time, which is called [Fan-out](https://en.wikipedia.org/wiki/Fan-out_(software)). [Here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Services/MessageService.cs#L66)'s the actual code.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=message-send.cs

In the method, as we've already got the list of `TopicClient` instances, if one Service Bus instance is temporarily unavailable, we can send the message to the other, or both. Therefore, unless an exception occurs from both instances, we consider the message is sent successfully. As we've got only 2.6 secs of downtime, it's not an issue. As you can see, there's no fancy technic used here, but just we send messages to all instances at the same time.

> However, we make sure that, when we send a message, we MUST use the same `MessageId` value. Otherwise, we can't take both messages that are the same as each other when we consume them.

The function method SHOULD call the `SendAsync()` method now. Have a look at the code below. There's no `static` modifier on the method any longer either. [Here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/MessageSendHttpTrigger.cs#L37)'s the complete code.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=http-trigger-send.cs

As we implemented the fluent interface, both `.WithTopicClients()` and `.SendAsync()` are beautifully chained one after the other. Let's send five messages for this experiment, and we'll find out there are five duplicated messages on both instances.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-04.png)

Fan-out has been successfully implemented. Let's move on.

### Implementing Message Fan-In

We need to generate `SubscriptionClient` instances from the connection strings. [Here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Services/MessageService.cs#L52)'s the code.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=message-with-subscription-clients.cs

Like the other method, this method also returns `this`, which implements the [fluent interface](https://en.wikipedia.org/wiki/Fluent_interface).

The core part of this implementation is that regardless we pick up messages from multiple instances, we only take one for further processing, and the others are automatically processed as complete. In general, the concept of [Fan-in](https://en.wikipedia.org/wiki/Fan-in) is slightly different, but the overall approach that takes multiple messages and processes them at once is the same.

In my [previous post](https://devkimchi.com/2019/09/18/servicebusplugin-tricks/), I've mentioned the usage of callbacks to handle messages when receiving them. This part might be slightly confusing, but following the code snippet would reduce the confusion. The actual implementation can be found at [here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Services/MessageService.cs#L107).

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=message-receive.cs

- `onMessageReceived`: Starting from C# 7.0, we can use [local functions](https://docs.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/local-functions?WT.mc_id=devkimchicom-blog-juyoo) within a method. As it increases readability, use the local functions instead of lambda functions.
    
    - As everything works asynchronously, we have no idea which `SubscriptionClient` instance picks up the message first.
    - However, we MUST process only one message against the same `MessageId`. Therefore, using the `lock` block will release the message double-take issue.
    - Once picking up the message, process it with the lambda expression passed through the `callbackToProcess` parameter.
    - The default value of `maxMessageDeduplicationCount` is `20`, but it's just an arbitrary number. Any number can be set, as long as it's bing enough so that no message double-take happens.
- `onExceptionReceived`: Another local function for exception handling.
- `MessageHandlerOptions` It has the property, `AutoComplete`, that sets `true`. It is because all other unpicked redundant messages need to be automatically completed.

This method now needs to be called within the function method. [Here](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/MessageReceiveHttpTrigger.cs#L36)'s the implementation.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=http-trigger-receive.cs

The code above sets a lambda expression within the `ReceiveAsync()` method. The lambda expression is the actual logic to process the message. This example only logs the message ID, but the real business logic SHOULD come here.

Let's run this function. Only one message is picked from either the primary region or secondary region, and all the others are completed automatically. The screenshot below shows how each region was picked up for message handling.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-05.png)

After all, all messages have been processed, and both instances have no more messages left.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-06.png)

## Considerations

So far, we've walked through the implementation of geo-redundant Service Bus instances for high availability. As mentioned in the first place, the Premium plan takes care of this behind the scene. However, if we really want to achieve this with the Standard plan, please make sure that:

- The implementation here is active/active. In other words, we use two Service Bus instances, and messages are duplicated. We pay double.
- Therefore, we need to carefully monitor the usage of two Standard plan instances, comparing to use only one Premium plan instance. At the end of the day, the Premium plan might be cheaper.
- We should also consider the development cost and maintenance cost, as we're all doing it by ourselves.

After considering all those things, if your organisation decides to use this approach, it would be worth trying.
