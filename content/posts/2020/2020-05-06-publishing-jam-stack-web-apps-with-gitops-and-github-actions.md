---
title: "Publishing JAM Stack Web Apps with GitOps and GitHub Actions"
slug: publishing-jam-stack-web-apps-with-gitops-and-github-actions
description: "This post shows how to automate all GitOps workflow for JAM stack websites, using GitHub Actions."
date: "2020-05-06"
author: Justin-Yoo
tags:
- gitops
- github-actions
- jam-stack
- azure-durable-functions
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/05/publishing-jam-stack-web-apps-with-gitops-and-github-actions-00.png
fullscreen: true
---

In my [previous post][post gitops schedule], we discussed how to set schedules for your [JAM stack][jam stack] based static websites with [GitHub Actions][gh actions] and [Azure Durable Functions][az func durable]. But it didn't complete the final piece &ndash; scheduling automation. Throughout this post, I'm going to implement that scheduling part to be automated.


## JAM Stack in Short ##

JAM stands for JavaScript, API and Mark-up. What does this mean to me? Let me give you an example. There are many static website generators such as [Jekyll][jekyll], [Hugo][hugo], [Gatsby][gatsby], [VuePress][vuepress], [Gridsome][gridsome], etc. When we write a post using Markdown syntax, the generator converts those markdown documents into HTML ones as a front-end application. If it needs to communicate with its back-end API, JavaScript makes the communication possible. Of course, JavaScript is used to enrich the front-end application. This website is built with [Gridsome][gridsome] as well.


## GitOps Automation ##

We've implemented the workflow below, except for the red arrow part, in the [previous post][post gitops schedule].

![][image-01]

The red arrow is responsible for, after creating a PR, sending an API request to [Azure Durable Functions][az func durable] endpoint. I wasn't able to find out a simple way of automating this part. However, I realised that PR is another type of events that GitHub Actions can capture.

Therefore, I put the timestamp for scheduling in the PR request body so that the GitHub Actions workflow can recognise it.

![][image-02]

Here's the GitHub Actions workflow only triggered by PR. Not every PR-related event triggers this workflow, but only the opener does it (line #8). And for debugging purpose, I put the PR event payload to be rendered (line #20).

https://gist.github.com/justinyoo/b1793b9fe678641de6308b956c3d77d1?file=01-pr-flow-1.yaml&highlights=8,20

After running this workflow once, we can see this payload structure showing the PR request body.

![][image-03]

Let's trim the timestamp from the `body` field. I use the regular expression to get the timestamp and store it to the `published` output value (line #5).

https://gist.github.com/justinyoo/b1793b9fe678641de6308b956c3d77d1?file=02-pr-flow-2.yaml&highlights=5

The `published` output value can be actually verified with the following action. As the action defined above uses the ID of `prbody`, we can access to the output value by `steps.prbody.outputs.published`.

https://gist.github.com/justinyoo/b1793b9fe678641de6308b956c3d77d1?file=03-pr-flow-3.yaml

Now we got the timestamp for scheduling. We need to send it to the [Azure Durable Functions][az func durable] API endpoint, within the GitHub Actions workflow. Here's the `curl` command that sends the request.

https://gist.github.com/justinyoo/b1793b9fe678641de6308b956c3d77d1?file=04-pr-flow-4.yaml

Therefore, instead of sending the API request like below:

![][image-05]

The PR workflow takes the responsibility, and the whole workflow has been automated.

![][image-04]

All we need to do is to create a PR with a timestamp for publishing schedule. The workflow will take care of the rest, and we'll be able to see the post published.

---

So far, we've fully automated post scheduling with GitOps, [Azure Durable Functions][az func durable] and [GitHub Actions][gh actions]. If you are running a static website and have the code in GitHub, this automation will reduce your workload significantly.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/05/publishing-jam-stack-web-apps-with-gitops-and-github-actions-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/05/publishing-jam-stack-web-apps-with-gitops-and-github-actions-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/05/publishing-jam-stack-web-apps-with-gitops-and-github-actions-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/05/publishing-jam-stack-web-apps-with-gitops-and-github-actions-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/05/publishing-jam-stack-web-apps-with-gitops-and-github-actions-05.png

[post gitops schedule]: /2020/03/25/scheduling-posts-with-gitops-durable-functions-and-github-actions/

[gh sample]: https://github.com/devkimchi/KeyVault-Reference-Sample
[gh actions]: https://github.com/features/actions

[jam stack]: https://jamstack.org/
[jekyll]: https://jekyllrb.com/
[hugo]: https://gohugo.io/
[gatsby]: https://www.gatsbyjs.org/
[vuepress]: https://vuepress.vuejs.org/
[gridsome]: https://gridsome.org/

[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func durable]: https://docs.microsoft.com/azure/azure-functions/durable/durable-functions-overview?tabs=csharp&WT.mc_id=devkimchicom-blog-juyoo
