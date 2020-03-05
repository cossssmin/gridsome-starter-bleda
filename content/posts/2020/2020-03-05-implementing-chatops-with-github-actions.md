---
title: "Implementing ChatOps on GitHub Actions"
slug: implementing-chatops-on-github-actions
description: "This post shows how to implement ChatOps on GitHub Action with Microsoft Teams."
date: "2020-03-05"
author: Justin-Yoo
tags:
- github-actions
- chatops
- continuous-delivery
- approval-process
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/implementing-chatops-with-github-actions-00.png
fullscreen: true
---

There have been many discussions around ["Continuous Delivery" and "Continuous Deployment"][ci cd] while composing DevOps pipelines. A rough comparison between both can be depicted below:

![][image-01]

Depending on circumstances at your organisation, either taking "delivery" or "deployment", or combining both approaches could be possible. The significant difference between both is whether there is a manual step-in process included (Continuous Delivery) or not (Continuous Deployment).

Generally speaking, [GitHub Actions][gh actions] supports "Continuous Deployment" out-of-the-box. In other words, to achieve "Continuous Delivery", we need a different approach. There have been many popular methodologies introduced. [GitOps][gitops] and [ChatOps][chatops] are the two most popular ones. Throughout this post, I'll show you how to implement ChatOps on [GitHub Actions][gh actions] pipelines to become more interactive, using [Microsoft Teams][ms teams].


## What Do We Need for ChatOps? ##

As the name indicates, we need a chatting platform like [Slack][slack] or [Microsoft Teams][ms teams]. I'm going to use [Microsoft Teams][ms teams] for ChatOps.


## Sending Messages to Microsoft Teams from GitHub Actions ##

In my [previous post][prev post], I introduced a custom GitHub Actions and built a [Microsoft Teams action][gh actions teams marketplace]. With this action, we can easily send messages to [Microsoft Teams][ms teams]. There are many different formats we can send to [Microsoft Teams][ms teams], but those two formats are frequently used for ChatOps.

1. [Open URI][ms teams openuri action]: It provides an external link so that members in the Teams channel can click the link.
  ![][image-02]

2. [HTTP POST][ms teams httppost action]: It raises a webhook event so that the external system can capture the event message and process it.
  ![][image-03]

Like the first image, the Open URI format simply provides external URLs, which is useful for notifications. On the other hand, the second image represents the HTTP POST format that sends a webhook payload to an event broker or handler. In addition to this, this can be more interactive with the invocation status, which will result in better user experiences.

The [Microsoft Teams action][gh actions teams marketplace] can be defined as below:

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=github-actions-teams-1.yaml

The actual implementation that I took from another project looks like this. There are many variables expressed with `${{ ... }}`. As they are from other actions, we don't need to worry about them for now.

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=github-actions-teams-2.yaml&highlights=9-10

> You might feel overwhelmed by `sections` and `actions` parameters. This will be [resolved][gh issue] sooner rather than later. <strike>who knows?</strike>

The second option, HTTP POST, would be better for us to use. Let's have a look at the definition below:

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=github-actions-teams-3.yaml&highlights=9-10


## Message Analysis ##

Let's beautify the JSON object at the `actions` parameter. The JSON schema is defined at the [HTTP POST action][ms teams httppost action].

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=actionable-message-card.json&highlights=3,8-9,13

As you can see, the webhook payload is sent to somewhere by an HTTP POST request. While the webhook event can be directly sent to GitHub, I deliberately include an [Azure Functions][az func] endpoint in the middle, which I'll discuss later in this post. The webhook payload looks like:

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=repository-dispatch.json&highlights=2-3

The event payload format follows the definition of [`Repository Dispatch`][gh events dispatch]. It's currently a public preview at the time of writing this post, which may change later at any time.

* `event_type`: It's the `string` type, not the `enum` type. Therefore, any string can be acceptable. But your organisation better to define these types.
* `client_payload`: It's the `object` type. Therefore any JSON object can come here. Again, your organisation should define the format.

Send messages to [Microsoft Teams][ms teams] through [GitHub Actions][gh actions], with this composition. Then clicking the message on the [Microsoft Teams][ms teams] channel will raise the webhook event of [`Repository Dispatch`][gh events dispatch] to GitHub via [Azure Functions][az func]. This event now turns the approval process.


## ChatOps on GitHub Actions ##

Can a [GitHub Actions][gh action] workflow take the event raised from [Microsoft Teams][ms teams]? Of course, it can. There are many events that trigger [GitHub Actions] workflows, including push and pull request. There are other different event types, including [`Repository Dispatch`][gh actions events dispatch]. Therefore, if we build a workflow that takes this event, then it will work! Let's have a look at the workflow below:

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=workflow.yaml&highlights=3,8

This workflow only reacts on the event, `repository_dispatch`. Let's define the release process in this workflow. Then, if we click the "Approve" button from the [Microsoft Teams][ms teams] channel, the approval process gets initiated.

> **NOTE**: Please be mindful here. You should use the `if` condition here to filter out the event, whether the `repository_dispatch` event is for me or not; otherwise, all payloads coming through the `repository_dispatch` event will trigger the workflow, which is not desirable.


## What Does Azure Functions Do Here? ##

As we saw, the webhook payload defined in the [Microsoft Teams][ms teams] channel sends the event to [Azure Functions][az func] first. In fact, it's totally OK to send the event directly to GitHub. Why did we implement [Azure Functions][az func] then? The response code from GitHub is either `204 No Content` or `400 Bad Request`, without a response body. Events typically are raised and forgot. They don't care who to consume. The event handler should take care of them, not the event source. But in this case, the event handler side, GitHub, only returns the status code. We don't know if the event has been properly consumed or not.

Therefore, we put an event broker to handle this. There are several event brokers on Azure &ndash; [Event Grid][az eventg], [Logic Apps][az logapp] and [Azure Functions][az func]. We use the [Azure Functions][az func] here in this post.

> If this event is mission-critical, I'd recommend using [Event Grid][az eventg] for [DLQ (Dead Letter Queue)][az eventg dlq].

There's another reason using [Azure Functions][az func]. When we use the [HTTP POST][ms teams httppost action] on [Microsoft Teams][ms teams], we can enrich the user experience by adding a response header of [`CARD-ACTION-STATUS`][ms teams httppost action status]. If the response contains this header, [Microsoft Teams][ms teams] can show the action invocation status as a reply. If we directly use the GitHub event, we can't make use of the response header. Here's the sample Function code:

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=function.cs&highlights=27,31

Depending on the HTTP API result from GitHub, we can set up a different `CARD-ACTION-STATUS` header value in the response, and [Microsoft Teams][ms teams] will know the approval process has gone successful or not.

---

So far, we have walked through implementing ChatOps on [GitHub Actions][gh actions] with [Microsoft Teams][ms teams]. This is a really simple use case. Your organisation might have more complex scenarios. Instead of [Azure Functions][az func], how about using [Event Grid][az eventg] or [Logic Apps][az logapp] for your use cases? I'll leave that to you.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/implementing-chatops-with-github-actions-01-en.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/implementing-chatops-with-github-actions-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/implementing-chatops-with-github-actions-03.png

[ci cd]: https://dzone.com/articles/continuous-delivery-vs-continuous-deployment-an-ov
[gitops]: https://www.weave.works/technologies/gitops/
[chatops]: https://searchitoperations.techtarget.com/definition/ChatOps

[slack]: https://slack.com/

[ms teams]: https://products.office.com/microsoft-teams/group-chat-software?WT.mc_id=devkimchicom-blog-juyoo
[ms teams openuri action]: https://docs.microsoft.com/outlook/actionable-messages/message-card-reference?WT.mc_id=devkimchicom-blog-juyoo#openuri-action
[ms teams httppost action]: https://docs.microsoft.com/outlook/actionable-messages/message-card-reference?WT.mc_id=devkimchicom-blog-juyoo#httppost-action
[ms teams httppost action status]: https://docs.microsoft.com/outlook/actionable-messages/message-card-reference?WT.mc_id=devkimchicom-blog-juyoo#reporting-an-actions-execution-success-or-failure

[prev post]: https://devkimchi.com/2020/02/19/building-custom-github-action-with-dotnet-core/

[gh actions]: https://github.com/features/actions
[gh actions teams marketplace]: https://github.com/marketplace/actions/microsoft-teams-generic
[gh actions teams repo]: https://github.com/aliencube/microsoft-teams-actions
[gh actions events]: https://help.github.com/en/actions/reference/events-that-trigger-workflows
[gh actions events dispatch]: https://help.github.com/en/actions/reference/events-that-trigger-workflows#external-events-repository_dispatch

[gh issue]: https://github.com/aliencube/microsoft-teams-actions/issues/4

[gh events dispatch]: https://developer.github.com/v3/repos/#create-a-repository-dispatch-event

[az eventg]: https://docs.microsoft.com/azure/event-grid/overview?WT.mc_id=devkimchicom-blog-juyoo
[az eventg dlq]: https://docs.microsoft.com/azure/event-grid/manage-event-delivery?WT.mc_id=devkimchicom-blog-juyoo

[az logapp]: https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
