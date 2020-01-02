---
title: "Azure DevOps Multi-Stage Pipelines Approval Strategies"
date: "2019-10-02"
slug: azure-devops-multi-stage-pipelines-approval-strategies
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- azure-pipelines
- multi-stage-pipelines
- release
- approval
- yaml
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-00.png
---

There are two ways using [Azure DevOps Release Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/?view=azure-devops&WT.mc_id=devkimchicom-blog-juyoo). We use UI so that we compose each task directly on the screen. On the other hand, we can use YAML pipelines so that all the pipeline stages, jobs and tasks are managed as code. We call the second option as "Multi-Stage Pipelines". As the Multi-Stage Pipelines feature is still in [public preview](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/?WT.mc_id=devkimchicom-blog-juyoo), it doesn't fully offer the same functionalities that the UI pipelines do. The approval process for each release stage is one of the limited features, but it's [been available](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops&WT.mc_id=devkimchicom-blog-juyoo#approvals) for a couple of months now.

In my [previous post](https://devkimchi.com/2019/09/04/azure-devops-pipelines-refactoring-technics/), I dealt with YAML pipeline refactoring technics. Throughout this post, I'm going to discuss how each release stage can configure the approval process.

> The sample release pipeline code can be found at this [GitHub repository](https://github.com/devkimchi/Azure-Pipelines-Template-Sample).

## Prerequisites

It would be nice to have the following tools if you want to read and follow this post:

- [Microsoft Account (Free)](https://account.microsoft.com/account?lang=en-us&WT.mc_id=devkimchicom-blog-juyoo) or [Office 365 Account (Free)](https://www.office.com/?omkt=en-us&WT.mc_id=devkimchicom-blog-juyoo)
- [Azure DevOps Account (Free)](https://azure.microsoft.com/en-us/services/devops/?WT.mc_id=devkimchicom-blog-juyoo)
- [Visual Studio Code](https://code.visualstudio.com/?WT.mc_id=devkimchicom-blog-juyoo)

## Multi-Stage Release Pipeline Check-In

The classic UI release pipeline allows developers to put various configurations on each stage. We can configure [pre-/post-approvals](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/approvals/approvals?view=azure-devops&WT.mc_id=devkimchicom-blog-juyoo) either automatically or manually. We also can do [pre-/post-gated-check-in](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/approvals/gates?view=azure-devops&WT.mc_id=devkimchicom-blog-juyoo) features. Which one can we do this on our YAML pipelines?

**NONE**

Unfortunately, we can't do anything like this on the Multi-Stage pipelines. However, the [`deployment job`](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs?view=azure-devops&WT.mc_id=devkimchicom-blog-juyoo) used in a release stage includes the [`environment`](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/environments?view=azure-devops&WT.mc_id=devkimchicom-blog-juyoo) attribute, which allows the manual approval check. Let's have a look at the sample pipeline below. It says the first two release stages have the same environment name of `release`.

https://gist.github.com/justinyoo/653068f01485a332324614daec4b011f?file=stages.yaml

In other words, those two different stages share the same environment of `release`. We can configure the manual approval check on the environment. Let's have a look at the picture below. First of all, click the `Environment` tab.

![Highlighting the Environments tab](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-01.png)

In this screen, choose an environment to activate the approval feature. In this example, the picture selects the `release` environment.

![Choosing an environment](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-02.png)

Within the `release` environment, click the three dots button at the right top corner of the screen and select the `Checks` menu.

![Highlighting the Checks option](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-03.png)

As it's our first time to add manual approval, we see nothing but the screen below. Click the `Create` button.

![Showing empty screen with the Create button](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-04.png)

Select the approvers. If we choose approvers individually, all approvers **MUST** approve the stage; otherwise, the pipeline cannot proceed. If we want a group or team as an approver, only one of the group/team member would be enough for approval.

![Finding approvers in a modal](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-05.png)

We've now assigned the approver like below:

![Displaying approvers on the Checks screen](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-06.png)

Let's rerun the pipeline. The pipeline stops at the stage of `Release without Template` and waiting for approval. Click the `Review` button in the middle of the screen.

![Highlighting the Review area and Stage waiting](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-07.png)

The approver can see the buttons below – to approve or reject. Choose the `Approve` button to proceed.

![Choosing the Approve option](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-08.png)

Now the pipeline carries on the stage, stops the next stage of `Release with Steps Template` and waits for another approval.

![Highlighting another Review area and Stage waiting](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-09.png)

Give the approval to the pipeline and wait to see. This time, the pipeline doesn't stop at the next stage but keeps moving onto the next stages.

![Bypassing the rest stages](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-10.png)

The pipeline defined above sets up the environment name of `release` on the first two stages, and the rest stages use their own environment name. This is the reason why the rest stages are not being interrupted.

* * *

You might be able to catch an essential point here. Depending on how we configure the environment on each stage, one environment can dictate all approvals, or multiple environments can take care of their own stages.

Let's have a look at the diagram below. All stages share the `release` environment and set the `QA` as the approver. Therefore, every time the stage stops for approval and `QA` has to approve to move onto the next stage. If we want to skip the approval step at the `DEV` stage, this single environment approach won't give you that flexibility. If we're going to assign a different approver at the `PROD` stage, it won't be possible either.

![Showing one environment dictating all stages](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-11.png)

On the other hand, in the diagram below, each stage has its own environment. We even set a different approver or don't set the approver on each stage. In other words, having a different environment on each stage will give more flexibilities from the approval point of view.

![Showing multiple environments looking after their stage only](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-devops-yaml-pipelines-approval-strategy-12.png)

It may sound more reasonable to have their own environment for each stage. But we also need to consider the management overhead. The more environments we create, the more difficult we manage them. If we have only one environment, we dictate them all in one go.

We can also use a mixture of both approaches. For example, consider group stages into several environments like `dev`, `non-prod` and `prod` and assign stages to each environment like `DEV` to `dev`, `TEST` and `UAT` to `non-prod`, and `PROD` to `prod`.

As it's still in preview, I'm not sure how it's changing when it becomes GA. But for now, if you need the approval process in the Multi-Stage pipelines, consider those strategies.

If you haven't tried the practice above, why don't you do it now?
