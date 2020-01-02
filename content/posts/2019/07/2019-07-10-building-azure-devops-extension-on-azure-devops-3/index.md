---
title: "Building Azure DevOps Extension on Azure DevOps - Publisher Registration"
date: "2019-07-10"
slug: building-azure-devops-extension-on-azure-devops-3
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- extensions
- alm
- publisher
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops.png
---

In my [previous post](https://devkimchi.com/2019/07/03/building-azure-devops-extension-on-azure-devops-2/), we completed implementing [Azure DevOps](https://azure.microsoft.com/en-us/services/devops/) extension. Now, it's time to publish it to [Marketplace](https://marketplace.visualstudio.com/azuredevops). But before doing that, we **MUST** register a publisher. This post will discuss how to register a publisher on the marketplace, and what to know for it.

## Table of Contents

This series consists of those six posts:

1. [Building Azure DevOps Extension - Design](https://devkimchi.com/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. [Building Azure DevOps Extension - Implementation](https://devkimchi.com/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. **_Building Azure DevOps Extension - Publisher Registration_**
4. [Building Azure DevOps Extension - Manual Publish](https://devkimchi.com/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. [Building Azure DevOps Extension - Automated Publish 1](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. [Building Azure DevOps Extension - Automated Publish 2](https://devkimchi.com/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## Use Case Scenario

I'm interested in using a static website generator, called [Hugo](https://gohugo.io/), to publish a website. There's [an extension](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension) already published in the marketplace so that I'm able to install it for my Azure DevOps organisation. To publish this static website, I wanted to use [Netlify](https://netlify.com/). However, it doesn't yet exist, unfortunately. Therefore, I'm going to build an extension for Netlify and at the end of this series, you will be able to write an extension like what I did.

> Actually, this Netlify extension has already been [published](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions), which you can use it straight away. This series of posts is a sort of reflection that I fell into situations – some are from the official documents but the others are not, but very important to know during the development. The source code of this extension can be found at [this GitHub repository](https://github.com/aliencube/AzureDevOps.Extensions).

## Registering Publisher on Visual Studio Marketplace

Without a registered publisher, we can't publish our Azure DevOps extension, as all extensions are tagged with their publishers' name. As the name describes, the marketplace only provides a platform for publishers to play, and the publishers take all the responsibilities for their extensions including publication and maintenance. The registration process itself is not that tricky. But there are a few things you should know beforehand.

### Number of Publishers to Register

Have you ever thought how many publishers you might need to register to publish my extensions? Should I have one for each extension? Should I have only one to manage all my extensions? Should I have multiple extensions based on the stages - dev/test/prod, etc? One publisher seems to be sufficient, at first thought. Generally speaking, that's right. One could be enough. On the other hand, if you consider your software development process automation, is it enough to have only one publisher?

I've got an example. The typical software development process has at least two deployment stages – `dev` and `prod`. If there is a QA team involved, another `test` stage is placed in between `dev` and `prod`. If your organisation has a complex deployment stage structure, there might be more, such as `sit`, `uat`, `pre-prod`, etc. Why do we have multiple stages for the deployment process? One reason for this is to detect any possible defect before going live.

The same rules apply to Azure DevOps extension development. Of course, we can use one publisher to manage all of them. But, why not creating multiple publishers that represent individual deployment stages? By doing so, each publisher only takes care of its own stage responsibilities, which is more efficient. As the registration itself is completely free, there's no hurdle for it. Let's create multiple publishers.

> Throughout this series, there are only two stages considered, which are `dev` and `prod`, so I'll create two publishers that represent the respective stages. Of course, there are many reasons to create only one publisher. I'll touch this case later in this series.

### Choosing Right Azure Active Directory

When you go into the [marketplace page](https://marketplace.visualstudio.com/azuredevops), at the right top corner, you'll be able to find both the `Log in` link and the [`publish extensions`](https://marketplace.visualstudio.com/manage) link. Click it for sign-in. When you log in, make sure that you login with your Microsoft Account or Office365 Account that you want to register the publisher.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-3-01.png)

Once you're logged in, if you're the first-timer, you'll be able to see the screen like below. You can see the email address you used for log-in and Azure Active Directory that your account belongs to, which I blurred in the screenshot below.

You **MUST** check your account and directory.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-3-02.png)

Choosing the right directory is very important. If you create a publisher in a different directory, collaborating other developers might be trickier than expected. Also if your organisation has a sensitive policy, things might be even trickier. So, please choose your directory carefully.

Click the `Change` link above. Then the screen slightly morphs so that you can choose the right directory. My account has been linked to three different Azure AD, but depending on your account, yours might be different.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-3-03.png)

### Basic Information

For the basic information, you need to enter both `Name` and `ID` fields. The `ID` field **MUST** be unique across the whole marketplace, so choose the ID very carefully. Once you choose it, there's no chance for change.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-3-04.png)

I've created two publishers for this series – [`aliencube-dev`](https://marketplace.visualstudio.com/publishers/aliencube-dev) and [`aliencube`](https://marketplace.visualstudio.com/publishers/aliencube).

### About You

This is more detailed information. In fact, this part is optional. But if you publish your extension for the public, it is strongly recommended to fill in so that others who download my extensions feel more comfortable.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-3-05.png)

I intentionally filled in details only for `aliencube`, not `aliencube-dev`, because `aliencube-dev` will only be used for internal purpose.

### Verification Request

Like `aliencube-dev`, it's only used for internal purpose. Therefore, we don't need this step. However, `aliencube` that publishes the extension publicly **MUST** send a request for verification from Microsoft. Click the tick box like below.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-3-06.png)

### Create Publisher

Click the `Create` button to create a publisher. If you selected the request verification checkbox, you'll receive an email like below:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-3-07.png)

And a few days later, you'll receive a confirmation email like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-3-08.png)

* * *

So far, we've completed the publisher registration process. Like I mentioned above, the process itself is simple, but if we consider build/release automation using CI/CD pipelines, it is worth reviewing the process above. In the [next post](https://devkimchi.com/2019/07/17/building-azure-devops-extension-on-azure-devops-4/), I'll discuss how to package the extension and manually publish it to the marketplace with this publisher.
