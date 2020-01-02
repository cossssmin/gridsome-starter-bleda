---
title: "ServiceBusPlugin Tricks"
date: "2019-09-18"
slug: servicebusplugin-tricks
description: ""
author: Justin-Yoo
tags:
- sdk-support-on-azure
- azure-service-bus
- sdk
- plugin
- validation
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/servicebusplugin-tricks-00.png
---

The legacy Azure Service Bus SDK ([WindowsAzure.ServiceBus](https://www.nuget.org/packages/WindowsAzure.ServiceBus/)) uses event handlers for message pre-/post-processing. For example, [`OnSend`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.servicebus.messaging.messagesender.onsend) is used for synchronous message pre-processing, and both [`OnBeginSend`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.servicebus.messaging.messagesender.onendsend) and [`OnEndSend`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.servicebus.messaging.messagesender.onbeginsend) are used for asynchronous message pre-processing. There are other event handlers for message post-processing. It's OK to use those event handlers. But, as there is a number of event handlers to implement, the amount of codes gets massively increased, which is not that great.

Is there an elegant way of pre-/post-processing messages?

Fortunately, the new version of Azure Service Bus SDK ([Microsoft.Azure.ServiceBus](https://www.nuget.org/packages/Microsoft.Azure.ServiceBus/)) uses [`ServiceBusPlugin`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.servicebus.core.servicebusplugin), instead of lots of event handlers. In other words, as long as we implement the plug-ins, all pre-/post-processing messages are performed within the plug-in automatically.

Throughout this post, I'm going to discuss how to build a custom plug-in for Azure Service Bus, by inheriting `ServiceBusPlugin`.

## Use Case Scenario

> AS an application, I WANT to validate whether a specific user property exists in the message, SO THAT I throw an error if the user property doesn't exist.

## Extending `ServiceBusPlugin`

The **specific user property** mentioned in the user story above is `sender`. If many information systems share the same Service Bus topic, a subscriber needs to know which one is valid for me or not. Of course, Azure Service Bus already has the filtering feature, so this might not be a good example. However, as at least it shows how the message is handled, it's worth discussing here. Anyway, without using the filtering feature, the plug-in validates the message origin by checking the `sender` custom property. If there's no sender or unidentified sender, the message will be rejected straightaway.

Because `ServiceBusPlugin` is an abstract class, it **MUST** be inherited. Let's create a derived class of `SenderValidationPlugin`:

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=sender-validation-plugin-1.cs

The `ServiceBusPlugin` class contains an abstract property, `Name`. It provides a unique name to the plug-in to remove any duplicated registration. Here in this post, it is just the fully-qualified class name.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=sender-validation-plugin-2.cs

The class also contains one virtual property and two virtual methods. Through those properties and methods, we can implement how the plug-in works.

- `ShouldContinueOnException`: The default value of this property is `false`. If any exception arises, the plug-in stops further processing and bubbles up the exception.
- `BeforeMessageSend(Message message)`: This method validates the message before it is sent to the topic. The validation process includes checking whether the custom property exists or not. If the 'sender\` property doesn't exist in the message custom property, it will throw an exception and stop sending the message to the topic.
- `AfterMessageReceive(Message message)`: This method intercepts the message before it is sent to the subscriber. It will also throw an exception while intercepting the message and validating it.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=sender-validation-plugin-3.cs

Let's add a private method, `ValidateAsync(Message message)`. It is invoked by either `BeforeMessageSend` or `AfterMessageReceived`.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=sender-validation-plugin-4.cs

Now all the validation logic sits inside `ValidateAsync`. It throws an exception and stops further processing, if:

- There is no message,
- There is no custom property of `sender`, or
- There is no sender value expected.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=validate-async.cs

All plug-n implementation has been completed. Let's play around it.

## Registering and Using `ServiceBusPlugin`

When sending a message, register the plug-in to `TopicClient`. Let's have a look at the code below. First of all, create a new plug-in instance and register it to `TopicClient`. Then send a message. The code sample below will throw an exception because its `sender` value is `lorem`, which is not on the list.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=topic-send.cs

When receiving the message, register the plug-in to `SubscriptionClient`. Then the plug-in automatically validates the message before it arrives at the target system.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=subscription-receive.cs

As you can see above, registering the plug-in makes the custom property validation, without additional efforts. As a result, the amount of codes has been decreased. Even better the code itself has been separated from the main `TopicClient` or `SubscriptionClient`.

* * *

So far, we've walked through how to write an Azure Service Bus plug-in for message validation. This plug-in approach will developers a lot easier and happier due to its ease of use.
