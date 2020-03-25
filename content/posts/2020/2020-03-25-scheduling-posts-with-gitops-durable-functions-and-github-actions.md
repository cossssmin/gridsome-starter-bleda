---
title: "Scheduling Posts with GitOps, Azure Durable Functions and GitHub Actions"
slug: scheduling-posts-with-gitops-durable-functions-and-github-actions
description: "This post shows how to implement GitOps and use Azure Durable Functions and GitHub Actions to schedule blog posts."
date: "2020-03-25"
author: Justin-Yoo
tags:
- azure-durable-functions
- github-actions
- gitops
- event-scheduling
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/scheduling-posts-with-gitops-durable-functions-and-github-actions-00.png
fullscreen: true
---

When you use a static website generator, like [Gridsome][gridsome], for your blog posts, you might have found that it's tricky to set a scheduled publish on your post. Like [Wordpress][wordpress], it's a blogging specific tool and offers the scheduled post feature. But mostly static website generator doesn't have such feature. There are two options to achieve this. 1) Give up and publish each post on the day you desire, or 2) Build a tool for schedule post. Throughout this post, I'm going to take the second option using [GitOps][weaveworks gitops], [Azure Durable Functions][az func durable] and [GitHub Actions][gh actions].

> You can download the source code from [https://github.com/devkimchi/GitHub-Repository-Event-Scheduler][gh sample].


## Acknowledgements ##

I got a basic idea from [PublishTo.Dev][todd publishtodev] using [Durable Functions][az func durable], which is developed by one of my colleagues [Todd][todd]. If you don't like this idea, blame [Burke][todd publishtodev about]. 😉


## About Durable Functions ##

One of the characteristics of the [serverless architecture][post serverless] is "stateless". This statement is correct from one perspective - building a serverless API application. On the other hand, if you encompass the aspect to "event-driven architecture", this statement is not always correct as most events are "stateful". For example, there is a timer function that runs every hour. Where does the "every hour" come from? There must be storage that keeps the timer information. This stored timer information is called "state" in this context, and the application that relies on the "state" is "stateful".

One of the "stateful" serverless applications on Azure is [Logic Apps][az logapp]. It manages workflow, and each trigger and action in the workflow has its "state" which can be used by the following actions. What if [Azure Functions][az func] can manage the workflow like what [Logic Apps][az logapp] does? How can [Azure Functions][az func] manage "state" to manage workflows? [Azure Durable Functions][az func durable] has implemented this idea, which is "stateful".

Then, what sort of "stateful" workflow do we need for this post?


## Designing Workflow ##

Let me describe the workflow briefly.

![][image-01]

First of all, a schedule is sent to the given function endpoint. This function is nothing special but works as a gateway that takes the payload and passes it to the [Durable Functions orchestrator][az func durable orchestrations]. The actual orchestration is managed in the second function. It checks the schedule and calls the timer that sends a queue message to [Azure Queue Storage][az storage queue]. At the same time, it stores the "state" to [Azure Table Storage][az storage table]. When the scheduled time arrives, the queue is triggered, and the third (and the last) function is executed based on the "state" from the [Table Storage][az storage table].

The second function takes care of all orchestration workflows, and the last function takes care of the business logic, which is to call an API on GitHub in the context of this post.


## Implementing Workflow ##

### Endpoint Function ###

This function publicly opens the endpoint, takes the payload and pass it to the [orchestration function][az func durable orchestrations]. Here's how the payload looks like:

https://gist.github.com/justinyoo/0516447045d0ef3c606d7e84f0ecd872?file=01-payload-dk.json

You can see the GitHub repository name and its owner/organisation name, PR number and schedule for publish. Let's have a look at the code below. It takes the payload (line #8) and calls the [orchestration function][az func durable orchestrations] with the payload (line #9). Finally, it returns the metadata that can check the orchestration status (line #13).

https://gist.github.com/justinyoo/0516447045d0ef3c606d7e84f0ecd872?file=02-entrypoint.cs&highlights=8-9,13


### Orchestration Function ###

The [orchestration function][az func durable orchestrations] consists of the followings.

1. Take the payload from the context (line #6).
2. Check the maximum duration of the schedule (line #9-13). Due to the limitation of [Azure Queue Storage][az storage queue] of [7 days][az storage queue lifespan], [Durable Functions][az func durable] timer also has a [lifespan of 7 days][az func durable timer limitations]. The maximum duration is configurable, and I set it up to 6.5 days.

> You can set the more extended scheduling than seven days, but it's beyond this post.

3. Check the input schedule is longer than the maximum duration (line #25-28).
4. Run the timer for scheduling (line #30). At this time, the function stops running and goes into sleep until the timer expires.
5. Once the timer expires the orchestration function continues where it stops and calls the third (activity) function (line #32).

https://gist.github.com/justinyoo/0516447045d0ef3c606d7e84f0ecd872?file=03-orchestrator.cs&highlights=6,9-13,25-28,30,32


### Activity Function ###

This function actually calls the [GitHub API][gh api] to raise an event. Let's take a look at the code below. It calls the [`repository_dispatch` API][gh api repository dispatch] defined in the GitHub API document. [Octokit][octokit] makes it really easy, but there's [no implementation on this API][octokit issue] yet. Therefore, in the meantime, you should directly call the API (line #18-19).

https://gist.github.com/justinyoo/0516447045d0ef3c606d7e84f0ecd872?file=04-activity.cs&highlights=16,18-19

The payload passed from the orchestration function is wrapped with another object for the [`repository_dispatch` API][gh api repository dispatch] (line #16). Once the activity function calls the API, it triggers the [GitHub Actions workflow][gh actions repository dispatch].


### Webhook Function ###

This function is almost identical to the activity function. The only difference is that it sets the event type of `publish` (line #18). I'll discuss this later in this post.

https://gist.github.com/justinyoo/0516447045d0ef3c606d7e84f0ecd872?file=05-webhook.cs&highlights=18


## Designing GitHub Actions ##

So, we got the workflow on the Durable Functions side, which sends a scheduled event to GitHub. Now, the [GitHub Actions workflow][gh actions repository dispatch] takes the event and runs its own pipeline workflow. Let's have a look at the picture below that describes the end-to-end workflow.

1. Once a new post is ready, create a PR for it.
2. When the PR number with the publishing schedule is ready, send an HTTP request to [Durable Functions][az func durable] endpoint.
3. The [Durable Functions][az func durable] puts the timer and raises the event on the scheduled day, that calls the GitHub API.
4. [GitHub Actions][gh actions] is triggered to merge the PR.
5. Once the PR is merged, it triggers another GitHub Actions to deploy (publish) the new post.
6. New post is published.

![][image-02]

You got the [Durable Functions][az func durable] covered above. The second [GitHub Actions][gh actions] was handled by [the other post][post prev]. This section takes the first [GitHub Actions][gh actions] using the [`repository dispatch` event][gh actions repository dispatch]. Let's take a look at the following YAML definition. This workflow is only triggered by the [`repository_dispatch` event][gh actions repository dispatch] (line #3). In addition to the trigger, it runs the workflow only if the `if` statement meets &ndash; the event type MUST match with `merge-pr` (line #8). The workflow itself is pretty straightforward. We've previously got the PR, and the workflow uses the [`github-pr-merge-action` action][gh actions merge] to merge the PR (line #14).

https://gist.github.com/justinyoo/0516447045d0ef3c606d7e84f0ecd872?file=05-workflow.yaml&highlights=3,8,14,24-27

> **NOTE**: The [GitHub PR Merge action][gh actions merge] is that I contribute. 🙈

Please note. The next workflow should have been automatically triggered for deployment. But this is not the case. Therefore, you should manually execute the deployment workflow. However, GitHub Action doesn't support manual trigger at the time of this writing. Instead, you can use the [`repository_dispatch` event][gh actions repository dispatch] that triggers the deployment workflow as a workaround (line #24-27). As we wrote the webhook function earlier, this workflow will call the webhook to raise the `publish` event.

Once the merge succeeds, it triggers the next GitHub Actions workflow, and the new post is published!

If you've completed by this far now, you're all set. Build the function app and deploy it to Azure. Send an HTTP request to the function endpoint, and wait. Then a new post will be published on your scheduled day. Actually, this post is published by this scheduler!


## Where's GitOps? ##

The idea of [GitOps][weaveworks gitops] that [Weaveworks][weaveworks] introduced is roughly "to deploy applications based on changes detected by PR". The workflow used in this post is not exactly the same as GitOps, but the concept, PR-based application deployment, is similar.

Let's give an example with this post:

1. A new post is ready to publish.
2. A new PR is created to publish the post.
3. Set the publish schedule using [Azure Durable Functions][az func durable].
4. [Durable Functions][az func durable] sends an event to GitHub based on the schedule.
5. The event captured by GitHub repository runs the [GitHub Actions][gh actions] to merge the PR.
6. The merged PR eventually builds and deploys the application, which is the static website with the new post.

How do you feel like? Is it similar to GitOps?

---

So far, we've walked through how we used [Azure Durable Functions][az func durable] and [GitHub Actions][gh actions] in the context of [GitOps][weaveworks gitops] to schedule blog posts. It's like a very comprehensive example that uses [Durable Functions][az func durable] and [GitHub Actions][gh actions]. If you've been using a GitHub repository to host your blog, now you can schedule your new posts!


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/scheduling-posts-with-gitops-durable-functions-and-github-actions-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/scheduling-posts-with-gitops-durable-functions-and-github-actions-02.png

[post serverless]: https://martinfowler.com/articles/serverless.html
[post prev]: https://devkimchi.com/2020/01/03/migrating-wordpress-to-gridsome-on-netlify-through-github-actions/

[todd]: https://twitter.com/toddanglin
[todd publishtodev]: https://www.publishto.dev/
[todd publishtodev about]: https://www.publishto.dev/about

[gh sample]: https://github.com/devkimchi/GitHub-Repository-Event-Scheduler
[gh actions]: https://github.com/features/actions
[gh actions repository dispatch]: https://help.github.com/en/actions/reference/events-that-trigger-workflows#external-events-repository_dispatch
[gh actions merge]: https://github.com/marketplace/actions/github-pr-merge-generic
[gh api]: https://developer.github.com/v3/
[gh api repository dispatch]: https://developer.github.com/v3/repos/#create-a-repository-dispatch-event

[az logapp]: https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func durable]: https://docs.microsoft.com/azure/azure-functions/durable/durable-functions-overview?tabs=csharp&WT.mc_id=devkimchicom-blog-juyoo
[az func durable orchestrations]: https://docs.microsoft.com/azure/azure-functions/durable/durable-functions-orchestrations?tabs=csharp&WT.mc_id=devkimchicom-blog-juyoo
[az func durable timer limitations]: https://docs.microsoft.com/azure/azure-functions/durable/durable-functions-timers?tabs=csharp&WT.mc_id=devkimchicom-blog-juyoo#timer-limitations

[az storage table]: https://docs.microsoft.com/azure/storage/tables/table-storage-overview?WT.mc_id=devkimchicom-blog-juyoo
[az storage queue]: https://docs.microsoft.com/azure/storage/queues/storage-queues-introduction?WT.mc_id=devkimchicom-blog-juyoo
[az storage queue lifespan]: https://github.com/Azure/azure-functions-durable-extension/issues/14

[octokit]: https://github.com/octokit/octokit.net
[octokit issue]: https://github.com/octokit/octokit.net/issues/2100

[gridsome]: https://gridsome.org/
[wordpress]: https://wordpress.org/
[devto]: https://dev.to/

[weaveworks]: https://www.weave.works/
[weaveworks gitops]: https://www.weave.works/blog/gitops-operations-by-pull-request
