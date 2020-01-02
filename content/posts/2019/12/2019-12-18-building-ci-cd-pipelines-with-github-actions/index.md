---
title: "Building Clearly Bounded CI/CD Pipelines with GitHub Actions"
date: "2019-12-18"
slug: building-ci-cd-pipelines-with-github-actions
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- github
- github-actions
- static-website
- vue-js
- gridsome
- azure-cli
- ci-cd
- azure-blob-storage
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/building-ci-cd-with-github-actions-00.png
---

In my [prevous post](https://devkimchi.com/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/), we built a [workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow), using [GitHub Actions](https://github.com/features/actions) to build, test and deploy a static web app to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo). Throughout this post, I'm extending the previous workflow with bounded CI/CD pipelines to separate concerns.

> You can download the sample codes used in this post at this [GitHub repository](https://github.com/devkimchi/PWA-GitHub-Actions-Sample).

## Separate Deployment from Build

We discussed four fundamental concepts – [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow), [Event](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#event), [Runner](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner) and [Action](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action) in my [previous post](https://devkimchi.com/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/). These concepts are bare minimum information to build a [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow) with GitHub Actions. In addition to them, in order to build bounded pipelines, another concept, [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job), needs to bring in. [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job) is a logical grouping that contains [Runner](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner) and series of [Action](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action)s. It can be defined multiple times in one [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow) and run at the same time or one after another, based on the definition.

Here's the workflow from the [previous post](https://devkimchi.com/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/). Under the `jobs` attribute, we can see one [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job), named `build_and_publish`.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=github-actions-workflow.yaml

### Redefine Build Job

The last action is `Publish app`. In fact, this action is more accurate if we change it to "upload an artifact" as the final step before deployment. Let's change it to the appropriate one. We're going to use the action, called [`upload-artifact`](https://github.com/actions/upload-artifact). `app` is the name of the artifact.

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=action-upload-artifact.yaml

After updating the workflow, push it back to GitHub repo, and it will trigger the updated workflow. The workflow doesn't push the artifact to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo). Instead, it uploads the artifact to the designated location on the pipeline.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/building-ci-cd-with-github-actions-01.png)

Now, we've got the existing [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job) redefined. Let's add another [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job) for deployment.

### Define Deployment Job

There is no fixed or definite way of the application deployment scenario. But Here are over-simplified two scenarios. One runs the [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)s sequentially, one after another, and the other runs deployment jobs in parallel.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/building-ci-cd-with-github-actions-02.png)

In the first scenario, the `deploy_to_dev` job should have a dependency on its previous job, `build_and_publish`, `deploy_to_test` on `deploy_to_dev`, and `deploy_to_prod` on `deploy_to_test`. In other words, if one job fails, the next job can't be run. Therefore, declare the dependency like below:

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=workflow-jobs-scenario-1.yaml

On the other hands, the second scenario shows all deployment job has only the dependency on the `build_and_publish` job. Therefore, the [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow) definition can look like below:

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=workflow-jobs-scenario-2.yaml

In this scenario, we publish two static websites – one for `DEV` and the other for `PROD`. For the deployment job, we use another action, called [`download-artifact`](https://github.com/actions/download-artifact).

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=action-download-artifact.yaml

Based on this action, let's add two jobs, `deploy_to_dev`와 `deploy_to_prod`, to the existing workflow.

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=workflow-updated.yaml

We should make sure one thing here. Each [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job) has its own [Runner](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner) and runs on it. Once after one [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job) is over, the [Runner](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner) is also removed. In other words, although we logged into Azure in the previous [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job), it doesn't necessarily mean that the login credentials are carried over to the next [Job](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job). Therefore, like the workflow definition above, each Job should log in to Azure first.

Once redefinition complete, let's push the change and see the result. The first screenshot is the result of the `build_and_publish` job.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/building-ci-cd-with-github-actions-03.png)

And this is the last job, `deploy_to_prod`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/building-ci-cd-with-github-actions-04.png)

We only defined two distinctive actions – download artifact and deploy to Azure, which is a bare minimum for deployment. But there can be many other scenarios from business requirements. For example, either integration testing or end-to-end testing can be added to each job, respectively.

* * *

So far, we've built bounded CI/CD pipelines to separate concerns and responsibilities on each job.
