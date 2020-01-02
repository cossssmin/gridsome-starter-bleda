---
title: "Building Azure DevOps Extension on Azure DevOps - Automated Publish 1"
date: "2019-07-24"
slug: building-azure-devops-extension-on-azure-devops-5
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- extensions
- alm
- automated-publish
- ci
- cd
- ci-cd
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops.png
---

In my [previous post](https://devkimchi.com/2019/07/17/building-azure-devops-extension-on-azure-devops-4/), we've discussed how to package an Azure DevOps extension and publish it to [Marketplace](https://marketplace.visualstudio.com/azuredevops) in a manual way. This posts will discuss how to automate all the processes from build to package and publish by using [Azure Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/).

## Table of Contents

This series consists of those five posts:

1. [Building Azure DevOps Extension - Design](https://devkimchi.com/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. [Building Azure DevOps Extension - Implementation](https://devkimchi.com/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. [Building Azure DevOps Extension - Publisher Registration](https://devkimchi.com/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. [Building Azure DevOps Extension - Manual Publish](https://devkimchi.com/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. **_Building Azure DevOps Extension - Automated Publish 1_**
6. [Building Azure DevOps Extension - Automated Publish 2](https://devkimchi.com/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## Use Case Scenario

I'm interested in using a static website generator, called [Hugo](https://gohugo.io/), to publish a website. There's [an extension](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension) already published in the marketplace so that I'm able to install it for my Azure DevOps organisation. To publish this static website, I wanted to use [Netlify](https://netlify.com/). However, it doesn't yet exist, unfortunately. Therefore, I'm going to build an extension for Netlify, and at the end of this series, you will be able to write an extension like what I did.

> Actually, this Netlify extension has already been [published](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions), which you can use it straight away. This series of posts is a sort of reflection that I fell into situations – some are from the official documents, but the others are not, but very important to know during the development. The source code of this extension can be found at [this GitHub repository](https://github.com/aliencube/AzureDevOps.Extensions).

## Build Pipeline

As mentioned in the last part of my [previous post](https://devkimchi.com/2019/07/17/building-azure-devops-extension-on-azure-devops-4/), we **MUST** change `vss-extension.json` for different publishers and create different packages. This manual change may be OK for a straightforward process and a sort of ad-hoc deployment. However, in most cases, the software development process needs a lot of repetition, and that manual way is not recommended. Therefore the overall process including build, test, package and publish **SHOULD** be automated, and this build pipeline is the first step of this automation.

> Azure DevOps has released a preview feature of [YAML-based Multi-Stage Pipelines](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/). This post creates pipelines with the existing UI (classic pipelines), but the next post will discuss the multi-stage pipelines.

Creating a build pipeline is relatively simple. If my code includes testing, I would have includes that part in the pipeline. Therefore the build pipeline only consists of those three tasks:

1. To restore npm packages,
2. To compile all TypeScript (`.ts`) files into JavaScript (`.js`) ones, and
3. To create a `.vsix` package for a release pipeline to publish it.

These three tasks would be enough in the build pipeline. I prefer having build pipelines for developments, pull requests and releases respectively, because each pipeline may consist a different number of tasks and, from the separation of concern perspective, splitting them would be more efficient. I'm going to touch the release build pipeline.

First of all, we need to install the [Azure DevOps Extension Tasks](https://marketplace.visualstudio.com/items?itemName=ms-devlabs.vsts-developer-tools-build-tasks) extension in my Azure DevOps organisation. This extension contains many tasks using `tfx-cli`, including installation, package creation and extension publishment.

### Restore npm Packages

The first task is to restore npm packages using the `npm install` command.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-01.png)

### Compile TypeScript Files

The second task is to compile all `.ts` files into `.js` ones. I've already got a PowerShell script for this compilation. Therefore, in the pipeline, simply run the PowerShell script like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-02.png)

The PowerShell script might look like:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=compile-typescripts.ps1

### Install `tfx-cli`

To generate a package, `tfx-cli` is required. Therefore, this needs to be installed while the pipeline is running. We've already installed the [Azure DevOps Extension Tasks](https://marketplace.visualstudio.com/items?itemName=ms-devlabs.vsts-developer-tools-build-tasks) extension, so add a task for `tfx-cli` installation.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-03.png)

At the time of writing this post, the latest version of `tfx-cli` is `0.7.6`. Like the screenshot above, enter `v0.7.x` and tick the `Auto Update` option, and it will cache the latest version of `0.7.x`.

### Package Extension

This is the most important task because it is the key to resolve the manual publish issue. Leave the `vss-extension.json` file for public/free facing, and use the public publisher ID. Then in the task field, these values can be substituted with environment variables. Let's see the screenshot below.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-04.png)

Set the `Publisher ID` field with `$(PublisherId)`, the `Extension Visibility` field with `Private` and the `Extension Pricing` with `Free`.

> I was expecting to set both `Extension Visibility` and `Extension Pricing` values through environment variables, but it's not supported yet, unfortunately.

### Upload Package

This task is to upload the package created in the previous task to a temporary location of the pipeline.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-05.png)

Now, the package is ready to publish. Let's get this package to be handled within a release pipeline.

### Environment Variables

This is just a reference used in the build pipeline.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-06.png)

### Build Trigger

For CI, here's the setup. As this pipeline is for release branch build, the trigger only looks for the `release/netlify` branch to be updated.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-07.png)

If you're building a dev branch trigger, set up the branch filter like `dev`, `feature/*`, `hotfix/*`, instead of `release/*`. Alternatively, if you only want to trigger this build pipeline for PR, disable CI and enable PR underneath.

Now, we've got our build pipelines. Let's do the release pipeline.

## Release Pipeline

The release pipeline is only triggered when the release build pipeline completes the build.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-08.png)

It also sets the branch filter of `release/netlify`. In the release pipeline, we have two different stages, `DEV` and `PROD`. As we've got two publishers, each stage has different publishers.

### Stage `DEV`

The first task of the `DEV` stage is to install `tfx-cli`, which is the same task like the one in the build pipeline.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-09.png)

This stage publishes the package to the marketplace through the publisher, `aliencube-dev`. Whatever the package has been generated from the build pipeline, for the publisher `aliencube-dev`, the package should be `Private` and `Free`. Therefore, like the screenshot below, update `Publisher ID`, `Extension Visibility` and `Extension Pricing` value. And finally, this private package should be shared with an organisation, which is passed from `$(Organisation)`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-10.png)

### Stage `PROD`

This stage is almost the same as `DEV`. The only differences will be the `Extension Visibility` and `Extension Pricing` values that fit the `PROD` stage. To minimise the configuration efforts, leave all the environment variable keys the same as the `DEV` stage and only change their values. Here are the values assigned to each stage:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-11.png)

We've completed all the CI/CD pipelines. Now push a change to the `release/netlify` branch. Then the build/release pipelines will work as expected.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-12.png)

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-5-13.png)

* * *

Throughout the entire series, we've walked through the whole processes of Azure DevOps extensions development – design, implementation, and publish. I used the [Netlify extension](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions) as an example, which is relatively simple. If you create the one for your purpose, it might be more complicating. But I believe the overall process will remain the same. I hope this series of articles will help your extension development practice. [The next post](https://devkimchi.com/2019/07/31/building-azure-devops-extension-on-azure-devops-6/), as the last one of this series, will discuss the YAML build/release pipelines instead of using the classic UI pipelines.

## More Readings

- [Multi-Stage Pipelines YAML Support (Preview)](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/)
- [Azure DevOps Extension Tasks](https://marketplace.visualstudio.com/items?itemName=ms-devlabs.vsts-developer-tools-build-tasks)
