---
title: "Building Azure DevOps Extension on Azure DevOps - Automated Publish 2"
date: "2019-07-31"
slug: building-azure-devops-extension-on-azure-devops-6
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
- multi-stage-pipelines
- yaml
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops.png
---

In my [previous post](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/), we've discussed how to set up CI/CD pipelines on Azure DevOps to publish the extension to [Marketplace](https://marketplace.visualstudio.com/azuredevops), which we built throughout this series. As the last one of this series, this post will discuss how to write YAML pipelines for both build and release that sit in the source code repository, so that they are managed as a part of the code.

## Table of Contents

This series consists of those six posts:

1. [Building Azure DevOps Extension - Design](https://devkimchi.com/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. [Building Azure DevOps Extension - Implementation](https://devkimchi.com/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. [Building Azure DevOps Extension - Publisher Registration](https://devkimchi.com/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. [Building Azure DevOps Extension - Manual Publish](https://devkimchi.com/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. [Building Azure DevOps Extension - Automated Publish 1](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. **_Building Azure DevOps Extension - Automated Publish 2_**

## Use Case Scenario

I'm interested in using a static website generator, called [Hugo](https://gohugo.io/), to publish a website. There's [an extension](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension) already published in the marketplace so that I'm able to install it for my Azure DevOps organisation. To publish this static website, I wanted to use [Netlify](https://netlify.com/). However, it doesn't yet exist, unfortunately. Therefore, I'm going to build an extension for Netlify, and at the end of this series, you will be able to write an extension like what I did.

> Actually, this Netlify extension has already been [published](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions), which you can use it straight away. This series of posts is a sort of reflection that I fell into situations – some are from the official documents, but the others are not, but very important to know during the development. The source code of this extension can be found at [this GitHub repository](https://github.com/aliencube/AzureDevOps.Extensions).

## Classic CI/CD Pipelines

The CI/CD pipelines used in my [previous post](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/) is now called `classic pipelines`, which rely on Azure DevOps UI. One of the main selling points of Azure DevOps is easy to use from intuitive UI screen, instead of configuration files like XML, JSON or YAML. It has also brought about significant benefits to developers because of its usability.

On the other hands, from a DevOps perspective, this visualised CI/CD authoring approach may cause unnecessary maintenance overhead. Those pipelines are managed outside the main source code repository. What if we can store software source code and pipelines at the same repository?

To answer this question, Azure DevOps now supports YAML-style pipelines for both build and release.

## YAML-style CI/CD Pipelines

Azure DevOps has been supporting build pipelines in YAML format. In addition to this, at the time of writing this post, [Multi-stage Pipelines](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/) feature has been running as a public preview. With this multi-stage pipelines feature, we can manage the pipelines from build to release. In this series, I intentionally build three different pipelines for dev, PR and release, which consist of a different set of tasks. If you have different requirements, of course, you can set up differently.

As the multi-stage pipelines are in public preview, we need to activate this feature. Click your profile picture and choose the `Preview Features` menu.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-01.png)

In the list of preview features modal, select which level you apply the preview feature - only for myself or organisation. After that, enable the `Multi-step Pipelines` feature.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-02.png)

Now, you'll see the new UI for pipelines. It may look strange at first sight, but you'll eventually get used to it. Don't panic.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-03.png)

### Build Pipeline

Let's have a look at the build pipeline below. It looks complicating or overwhelming in the first place. In fact, it's not. If you're unsure, [this page](https://docs.microsoft.com/en-us/azure/devops/pipelines/customize-pipeline) will be a good starting point.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-build.yaml

These are some brief of each attribute:

- `name`: Unlike the attribute itself, it's in charge of pipeline versioning. The value, `$(Version)`, comes from the variable group.
- `variables`: It takes care of environment variables used in the pipeline. I put the reference to variable groups, using the `groups` attribute. If you want to use individual variables directly, you **SHOULD** consider the `name/value` attribute pair.
- `trigger`: This indicates which branches invoke this pipeline. With the branch filter attribute (`branches`) and path filter attribute (`paths`), you can do more granular control. If you're using wild cards like `*` or `?`, the value **SHOULD** be wrapped with quotes. The build pipeline only reacts with `dev`, `feature/*` and `hotfix/*` branches.
- `stages`: This doesn't need for a single-stage pipeline, but if you build a multi-stage pipeline, this attribute **MUST** be declared, and an array of `stage` is declared under this.
- `stage`: This is the stage that runs build. This stage contains the `jobs` attribute that consists of multiple `job`s.
- `job`: It's easy to understand that each `job` has a collection of tasks declared under the `steps` attribute.
- `steps`: This consist of a sequence of `task` that takes action.
- `task`: The actual task unit. We define two tasks identified in my [previous post](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/).

Now, all the build pipeline setup has completed. Push this pipeline back to the repository and create the pipeline. Click the `New Pipeline` button.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-07.png)

It asks to select the repository service. All have the `YAML` badge that means it will create a YAML style pipeline through the repository service. As the repository used for this series stays in GitHub, select GitHub.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-08.png)

It shows the list of accessible repositories on GitHub. Select one to use for the build.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-09.png)

As we have already written the build pipeline, Pick up the `Existing Azure Pipelines YAML File` option.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-10.png)

Enter the location of the pipeline, including the branch name, then the `Continue` button at the right-bottom corner turns enabled. Click the button for the next screen.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-11.png)

This is the last step of adding the pipeline from the YAML file. Review it and click the `Run` button for a test run and verify the pipeline.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-12.png)

Once the pipeline invocation is OK, you'll see the screen like below. As this is the single-stage pipeline, there is only one green tick mark.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-04.png)

### PR Pipeline

In this repository, there is no difference between the build pipeline and the PR one, unless any PR-specific task is added. The only difference from the build pipeline is that this PR pipeline uses the `pr` attribute, instead of the `trigger` attribute.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-pr.yaml

In other words, this pipeline is only invoked when a PR arrives in the `dev` branch.

### Release Pipeline

As both build and PR pipelines have only one build stage, it's called a single-stage pipeline. On the other hand, this release pipeline creates an extension package during the build and publish it to the marketplace through different publishers (`aliencube-dev` and `aliencube`), which we can call it as the multi-stage pipeline. Let's have a look at the pipeline below:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-release.yaml

In overall, there are not many differences between this release pipeline and the build pipeline, in terms of the build stage. Triggering branch has changed to `release/netlify`, and a couple of extra tasks have been added to the build stage of the release pipeline.

Here's the main thing. You can see two other `stage`s. One is named as `DEV`, and the other is named as `PROD`. Through these two new stages, we are building the multi-stage pipeline. Let's have a look.

- In the build stage, we declare `job` under the `jobs` node, while in the release stages, we declare `deployment` under the `jobs` node. Under the `deployment` attribute, we define `strategy`, `runOnce` and `deploy` node, and `steps` and `task` node under it. This is the main distinction.
- For task declaration, if we use a third-party extension, the official document recommends to use the fully-qualified task name with a format of `[Publisher ID].[Extension ID].[Task Name]@[Major Version]`.

> At the time of this writing, the fully-qualified task name works well for the `job` node in the build stage. However, it doesn't work for the `deployment` node in the release stage. Therefore, as a workaround, instead of using the fully-qualified task name, just use the task name. This may cause an issue if there are multiple third-party extensions installed and they use the same task name by any chance. I hope this gets fixed when this feature becomes GA or even beforehand.

Now, we got the release pipeline setup. Push it to the repository and import it to Azure DevOps, then run this. The result might look like below. I intentionally enabled for both build and `DEV` release – meaning we can only see the two green tick mark.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-05.png)

Click the pipeline result, and you will see more details of the build and release.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/building-azure-devops-extension-on-azure-devops-6-06.png)

## Refactoring Pipelines with Templates

So far, we've written all multi-stage pipelines. By the way, there are two common tasks in each pipeline – the first one is to restore the `npm` packages, and the other one is to compile TypeScript files. It would be awesome if we can refactor these tasks from each pipeline and make it as a template.

This [Job and Step Templates](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/process/templates?view=azure-devops) page describes how to refactor some common tasks in a template. Here's the result:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-build-steps.yaml

This template, `npm-build-steps.yaml`, has extracted the two steps. You might notice that the template has the `parametres` attribute. This contains a number of parameters that pass values from the parent pipeline to the template. Within the template, those parameters are used with the double braces like `${{ parameters.[attribute] }}` within the template. In this template, you can see `${{ parameters.extensionName }}`.

Once the template is done, the original pipeline should be updated like:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-build-templated.yaml

Instead of the `task` object, it points to the `template` object to call the template file. And the `template` object has the `parameters` attribute that passes values. Both build and PR pipelines can be done like this. The release pipeline is a little bit different, though. In the build stage, it has more steps than the build and PR pipelines.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-release-templated.yaml

As you can see above, the template is called, and extra steps follow. Unfortunately, at the time of writing this post, this template feature is only applicable to the build stage. Therefore, other common steps in both release stages cannot be templatised.

* * *

We've built the multi-stage pipelines and refactored them for common steps. As stated at the beginning of the post, if we write pipelines in this way, we don't have to worry about additional maintenance overhead for separate pipelines. As this is still in public preview, the multi-stage feature is not perfect at this moment, but it might change and be improved over time. By using this YAML style CI/CD pipelines will give you more flexibility and consistency, I'm sure.

## More Readings

- [Multi-stage YAML Pipelines (Preview)](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/)
- [Customising YAML Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/customize-pipeline?view=azure-devops)
- [Job and Step Template](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/templates?view=azure-devops)
