---
title: "Many Meanings of Message Validation"
date: "2019-10-09"
slug: many-meanings-of-message-validation
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- soap
- wsdl
- schema
- open-api
- payload
- message
- publisher
- subscriber
- schema-registry
- validation
- fluent-validation
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/many-meanings-of-message-validation-00.png
---

Many information systems consist of a front-end user interface where users enter inputs and back-end that processes the input data. This concept can be extended to information systems that send and receive messages. Regardless the data come from user input or other systems, those messages **MUST** be validated before going forward. There are always chances that compromised messages are projected to a system, which is a real threat to the system. If the system can't prevent those corrupted messages from being processed, the entire system will be down and result in the organisation's business loss of opportunities.

How can we implement the message validation to the system, or how can we validate messages? More specifically, what does the "validation" even mean? Throughout this post, I'm going to discuss several viewpoints of the "message validation".

## Message Body/Payload Validation

Let's talk about the message payload (or body). Assuming there is an online pizza ordering system. As I love pineapple toppings, I'll place an order for a large pan of Hawaiian pizza, as well as a bottle of sparkling water. Here are my order items:

- Hawaiian Pizza, Large, 1
- Sparkling Water, Medium, 1

![Hwaiian Pizza](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/many-meanings-of-message-validation-01.png)

My order is parsed as a JSON object and transmitted to the system. Here's a rough JSON request object. Of course, I intentionally omitted payment details and delivery details as they are not necessary for discussion.

https://gist.github.com/justinyoo/c5cd857042083f4c84bff28e4a7899e9?file=order.json

This JSON object represents a message and is sent to the system for processing. Before processing, the system **MUST** validate the payload. For example:

1. `orderId`: This field **MUST** be numeric.
2. `itemId`: This field **MUST** be a string with the format of `category-subcategory-size`.
3. `amount`: This field **MUST** be less than or equal to 100.

Therefore, the message payload validation **MUST** set the rule on each field for validation check. If any validation fails, the system **SHOULD** reject the message or take an exception handling process.

If you build a .NET based application, there are a bunch of open-source libraries for data validation. [`FluentValidation`](https://fluentvalidation.net/) is one of the most famous libraries for data validation. Here's a sample code snippet using `FluentValidation` to check the message payload.

https://gist.github.com/justinyoo/c5cd857042083f4c84bff28e4a7899e9?file=fluent-validation.cs

You may have noticed that this sample code defines the `OrderItem` class first, which we assume that we know the message structure. What if a message comes in with a format not-understandable? What should we do in this case?

## Message Structure Validation

Now, we're about to validate message structure. Structure validation consists of two parts. One is to check the payload structure through data contract or schema, and the other is to check the interface through service contract whether the message arrives at an agreed endpoint or not.

![Handshake on Both Parties](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/many-meanings-of-message-validation-02.png)

Both parties sending and receiving messages **MUST** use the shared data contract or schema for communication. In other words, if the message sender uses one format and the other expects another format, the message will be ignored or not get processed. In addition to this, the sender **MUST** project messages through the agreed interfaces, including endpoint, protocol or method. Otherwise, the receiver cannot process the messages.

Which approaches are popular for message structure validations, then?

### WSDL

XML Web Service via [SOAP](https://en.wikipedia.org/wiki/SOAP) utilises WSDL. According to the [WSDL spec](https://en.wikipedia.org/wiki/Web_Services_Description_Language), it defines both service contract (`interface`) and data contract (`types`). Here is a very simplified WSDL document based on the [WSDL 2.0 spec](https://www.w3.org/TR/wsdl20/).

https://gist.github.com/justinyoo/c5cd857042083f4c84bff28e4a7899e9?file=wsdl.xml

As WSDL defines service contract and data contract like above, both parties sending and receiving messages **MUST** conform to the contract to communicate with each other. All other messages outside the contract cannot be made. And based on this contract, we can easily create SDK. [`dotnet-svcutil`](https://docs.microsoft.com/dotnet/core/additional-tools/dotnet-svcutil-guide?tabs=dotnetsvcutil2x&WT.mc_id=devkimchicom-blog-juyoo) is a good example to generate SDK.

### Open API

Unlike legacy systems mainly use XML Web Service with SOAP, [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer) (RESTful Web API, precisely) is widely adopted for message transmission. [Open API](https://www.openapis.org/) is nowadays a de-facto standard to define services. Similar to WSDL, [Open API spec version 3.0.2](http://spec.openapis.org/oas/v3.0.2) defines [Path](http://spec.openapis.org/oas/v3.0.2#paths-object) for service contract, and [Schema](http://spec.openapis.org/oas/v3.0.2#schema-object) defines data contract. For SDK generation, [AutoRest](https://github.com/Azure/autorest) is such a great tool to meet the requirements.

https://gist.github.com/justinyoo/c5cd857042083f4c84bff28e4a7899e9?file=openapi.yaml

Now, either WSDL or Open API lets systems communicate with each other by validating message structures.

At this point, we might be facing another issue. Systems through either WSDL or Open API spec needs the synchronous way of communication. Of course, the receiving party can internally process the message in an async way, but at least the receiving end **MUST** synchronously return a response that the message has been accepted. For example, HTTP status codes like [`201 (Created)`](https://developer.mozilla.org/docs/Web/HTTP/Status/201) or [`202 (Accepted)`](https://developer.mozilla.org/docs/Web/HTTP/Status/202) **SHOULD** be returned.

In other words, as both systems depend on each other, if any side is temporarily unavailable, messages cannot be handled. It means there is no way to validate the message structure in this situation. Once the contract is established between systems, changing it is even harder. If we need to change the contract, it becomes really expensive to accommodate the change.

### Schema Registry

Many attempts and patterns have been introduced to figure out the dependency between systems during message transmission. The [Publisher/Subscriber Pattern](https://docs.microsoft.com/azure/architecture/patterns/publisher-subscriber?WT.mc_id=devkimchicom-blog-juyoo) is one of those patterns, and it's a great way for exchanging messages on the cloud. Instead of sending and receiving messages between systems on a real-time basis, a message broker is placed in the middle. The publisher (message sender) sends messages to the broker, and the subscriber (message receiver) picks up the messages from the broker. Both publisher and subscriber become completely decoupled and work asynchronously.

The message broker even works with multiple publishers and subscribers at the same time. It also accepts all messages without validating them, as long as both publishers and subscribers send messages with minimum requirements that the broker expects. In other words, message validation is solely for publishers' and subscribers' responsibility. Let's have a look at the diagram below. It's an over-simplified architecture implementing the pub/sub pattern using [Azure Logic Apps](https://docs.microsoft.com/azure/logic-apps/?WT.mc_id=devkimchicom-blog-juyoo) and [Service Bus](https://docs.microsoft.com/azure/service-bus/?WT.mc_id=devkimchicom-blog-juyoo).

![Diagram Implementing Pub/Sub Pattern with Azure Logic Apps and Service Bus](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/many-meanings-of-message-validation-03.png)

The blue arrows indicate the direction of message flow.

1. A message coming from the source system passes through the publisher Logic App and is stored to Service Bus.
2. The subscriber Logic App picks up the message and transfers it to the target system.

The pattern itself works perfectly fine. However, there are a few questions:

- Are we really sure that the messages from the publisher Logic App have the same structure that the subscriber Logic App would expect?
- Is there a systematic way to validate message structure between publisher and subscriber?

We can't answer that.

Therefore, an event broker like [Apache Kafka](https://kafka.apache.org) has introduced a [Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) to solve this concern. Outside the Kafka cluster, a separate Schema Registry is up and running. When an event producer sends events, it checks the registry to validate schema. The same thing happens on an event consumer side. When the event consumer picks up messages from the broker, it validates against the schema from the registry, before further processing.

With a similar approach, we can use Azure Service Bus by implementing a Schema Registry. Let's have a look at the diagram below. It's basically the same pattern above, but it adds up an [Azure Storage](https://docs.microsoft.com/azure/storage/?WT.mc_id=devkimchicom-blog-juyoo) instance as Schema registry and [Azure Functions](https://docs.microsoft.com/azure/azure-functions/?WT.mc_id=devkimchicom-blog-juyoo) to perform validation.

![Diagram Implementing Pub/Sub Pattern with Azure Logic Apps and Service Bus, and Azure Storage and Function App](https://sa0blogs.blob.core.windows.net/devkimchi/2019/10/many-meanings-of-message-validation-04.png)

The blue arrows are the main message flow like the previous diagram. On top of them, there are orange and green ones.

- Orange arrows send the message payload from either publisher or subscriber Logic App.
- Green arrows pick up the message schema from the schema registry (Blob Storage).
- Azure Function App validates the message payload against the schema.

If we use the schema registry for Azure Service Bus, the overall system architecture will have several improvements:

1. There are no more dependencies left between the systems at both the publisher and subscriber side. That says one system change won't affect the other at all.
2. This decoupling also removes the dependency on the schema version change. Systems themselves still work as they are, but only change applies to the Logic Apps workflow.
3. Logic Apps don't internally implement the validation logic but divert to Function App for schema validation.
4. No more service contract is required. Only schema validation is required.

* * *

So far, we have discussed many perspectives about message validation. On top of checking the validity on message payload, validating message schema **MUST** be done. With WSDL or Open API, we've done the message schema validation, and we now use the schema registry for event-/message-driven architecture.

These perspectives are not new at all. Instead, they are always considered whenever designing a system. In the next post, let's implement a schema registry for Azure Service Bus, using Azure Storage.
