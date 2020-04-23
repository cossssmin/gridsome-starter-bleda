---
title: "Building RequestBin with Durable Functions"
slug: building-requestbin-with-durable-functions
description: 'This post is to experiment building a RequestBin app using Azure Durable Functions with its "Stateful" nature.'
date: "2020-04-23"
author: Justin-Yoo
tags:
- azure-durable-functions
- requestbin
- stateful-api
- event-sourcing
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-requestbin-with-durable-functions-00.png
fullscreen: true
---

In my [previous post][post gitops], I discussed the workflow orchestration using [Azure Durable Functions][az func durable]. It's possible because of the "Stateful" nature of [Durable Functions][az func durable]. If we make use of these characteristics, we can build an [Azure Functions][az func] app in more various use cases that require the "Stateful-ness". Throughout this post, I'm going to implement the [RequestBin application][requestbin] feature as an experiment, to understand its working mechanism. If you want to see the more complete example, find [another post][paco requestbin] written by my fellow MVP, [Paco][paco].

> You can find the sample code from GitHub, [Durable RequestBin Sample][gh sample].

We used to deal with this nostalgic RequestBin app pretty often.

![][image-01]

It's now gone to history, but the [source code is open][requestbin] for anyone to build and use. There's a [sample Heroku app][requestbin herokuapp], but it's not surprising whenever it goes down. Therefore, if you want to run your own one, host this code somewhere, using a Docker container. With regards to this, I introduced two sample codes &ndash; [one][gh sample aci] using [Azure Container Instances][az aci] and [the other][gh sample appsvc] using [Azure App Service][az appsvc]. They're totally OK to use. By the way, the original RequestBin app consists of two parts &ndash; an application and Redis Cache. The cache is evaporating, not sustainable. If you want to look for some old webhook history, the original app might not be a solution.

Azure [Durable Functions][az func durable] internally implements [Event Sourcing Pattern][event sourcing pattern] using [Azure Table Storage][az st table]. As all events are statefully stored within the storage, it's a perfect example to build the RequestBin app.


## Stateful (or Durable) Entity ##

The orchestration feature of [Durable Functions][az func durable] **IMPLICITLY** stores the "State" through the `IDurableOrchestrationClient` instance. On the other hand, if we use the [stateful entity or durable entity][az func durable entity], we can **EXPLICITLY** handle the "State" via the `IDurableClient` instance. Let's have a look at the code below; the `DurableClient` binding goes with `IDurableClient` (line #4).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=01-create-bin.cs&highlights=4

Now, we need to create a reference entity that stores the "State" (line #7). The `binId` can be anything as long as it guarantees its uniqueness. GUID can be the right candidate for it (line #6).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=02-create-bin.cs&highlights=6,7

Have a look at the code above. The `"Bin"` is the name of the entity that **EXPLICITLY** stores the "State". What's interesting here is the entity follows the concept of the Actor Model, which stores the entity state and defines its behaviours. The following code illustrates the actions or behaviours of the entity through the `IBin` interface. Here in this exercise, we only use "add" and "reset" states.

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=03-ibin.cs

And we implement the interface with the `Bin` class. The class has the property, `History` that stores the "State" (line #5). You probably have noticed that I use the JSON serialiser option of `MemberSerialization.OptIn` (line #1). With this option, only properties that explicitly decorated with `JsonProperty` are serialised (line #4). There is a static method, `Run()` (line #23). It dispatches the event and stores the "State" to the table storage.

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=04-bin.cs&highlights=1,4,5,23


## Create Bin ##

In order to store the "State" to the entity, we use this `SignalEntityAsync()` method. As its name suggests, it sends a signal only (fire and forget) to the behaviour in the actor (line #8), `Bin` in this example. At this time, we only need a Bin, so we only pass `null`.

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=05-create-bin.cs&highlights=8

At this stage, we can see the records in the [Table Storage][az st table]. We can only see the empty array in the `history` field because we've only created the bin itself.

![][image-02]


## Add Webhook Requests ##

Let's add the webhook request items. The endpoint is pretty similar to the previous one. But this time, instead of passing `null`, we need to put the actual request data like timestamp, request method, header, query string and payload (line #10-14).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=06-add-history.cs&highlights=10-14

Then, create the bin reference with the `binId` and call the `SignalEntityAsync()` method to add the history (line #11).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=07-add-history.cs&highlights=11

Once completed, send a webhook request to this endpoint. Then the records in the [Table Storage][az st table] has changed.

![][image-03]


## View Webhook Requests History ##

We also need to see the list of webhooks that we've sent so far. Create the bin reference first (line #7).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=08-get-history.cs&highlights=7

Then, invoke the `ReadEntityStateAsync()` method that replays the events and converts into the response (line #9).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=09-get-history.cs&highlights=9

By doing so, we can see the list of histories stored in the bin.

![][image-04]


## Reset Webhook Requests ##

Let's remove all the webhook requests from the bin. Create the bin reference first (line #7).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=10-reset-history.cs&highlights=7

Call the `SignalEntityAsync()` method again, but this time it invokes the actor behaviour of `Reset()` (line #9).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=11-reset-history.cs&highlights=9

Check the [Table Storage][az st table], and you will be able to see the empty array in the `history` field.

![][image-05]


## Delete Bin ##

If you don't need the bin itself, then delete the bin completely. Create the bin reference first (line #7).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=12-purge-bin.cs&highlights=7

This time, call the `PurgeInstanceHistoryAsync()` method that completely remove the entity from the [Table Storage][az st table] (line #9).

https://gist.github.com/justinyoo/01426032d1ee6886796d9cb72e048dd9?file=13-purge-bin.cs&highlights=9

Once completed, all records related to the entity have gone.

![][image-06]

---

So far, we've implemented a very simple RequestBin app, using [Durable Functions][az func durable]. If we add UI, it will be more elegant. The point of this exercise is to experiment with the "Stateful-ness" of [Durable Functions][az func durable] not just for orchestration purpose but also for direct handling purpose. I hope this experiment can give you a more useful idea for your work.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-requestbin-with-durable-functions-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-requestbin-with-durable-functions-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-requestbin-with-durable-functions-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-requestbin-with-durable-functions-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-requestbin-with-durable-functions-05.png
[image-06]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/building-requestbin-with-durable-functions-06.png

[post gitops]: /2020/03/25/scheduling-posts-with-gitops-durable-functions-and-github-actions/

[gh sample]: https://github.com/devkimchi/RequestBin-Sample
[gh sample aci]: https://github.com/aliencube/RequestBin-on-ACI
[gh sample appsvc]: https://github.com/aliencube/RequestBin-on-Azure-App-Service

[az st table]: https://docs.microsoft.com/azure/storage/tables/table-storage-overview?WT.mc_id=devkimchicom-blog-juyoo

[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func durable]: https://docs.microsoft.com/azure/azure-functions/durable/durable-functions-overview?tabs=csharp&WT.mc_id=devkimchicom-blog-juyoo
[az func durable entity]: https://docs.microsoft.com/azure/azure-functions/durable/durable-functions-entities?tabs=csharp&WT.mc_id=devkimchicom-blog-juyoo

[requestbin]: https://github.com/Runscope/requestbin
[requestbin herokuapp]: https://requestbin.herokuapp.com/

[az aci]: https://docs.microsoft.com/azure/container-instances/container-instances-overview?WT.mc_id=devkimchicom-blog-juyoo
[az appsvc]: https://docs.microsoft.com/azure/app-service/?WT.mc_id=devkimchicom-blog-juyoo

[event sourcing pattern]: https://docs.microsoft.com/azure/architecture/patterns/event-sourcing?WT.mc_id=devkimchicom-blog-juyoo

[paco]: https://twitter.com/pacodelacruz
[paco requestbin]: https://pacodelacruz.io/2019/10/22/serverless-request-bin-azure-durable-functions
