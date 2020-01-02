---
title: "Building Azure DevOps Extension on Azure DevOps - Manual Publish"
date: "2019-07-17"
slug: building-azure-devops-extension-on-azure-devops-4
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- extensions
- alm
- manual-publish
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops.png
---

In my [previous post](https://devkimchi.com/2019/07/10/building-azure-devops-extension-on-azure-devops-3/), we've discussed how to register publishers to [Marketplace](https://marketplace.visualstudio.com/azuredevops). This post will discuss how to package the extension and manually publish it to the marketplace.

## Table of Contents

This series consists of those six posts:

1. [Building Azure DevOps Extension - Design](https://devkimchi.com/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. [Building Azure DevOps Extension - Implementation](https://devkimchi.com/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. [Building Azure DevOps Extension - Publisher Registration](https://devkimchi.com/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. **_Building Azure DevOps Extension - Manual Publish_**
5. [Building Azure DevOps Extension - Automated Publish 1](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. [Building Azure DevOps Extension - Automated Publish 2](https://devkimchi.com/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## Use Case Scenario

I'm interested in using a static website generator, called [Hugo](https://gohugo.io/), to publish a website. There's [an extension](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension) already published in the marketplace so that I'm able to install it for my Azure DevOps organisation. To publish this static website, I wanted to use [Netlify](https://netlify.com/). However, it doesn't yet exist, unfortunately. Therefore, I'm going to build an extension for Netlify and at the end of this series, you will be able to write an extension like what I did.

> Actually, this Netlify extension has already been [published](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions), which you can use it straight away. This series of posts is a sort of reflection that I fell into situations – some are from the official documents but the others are not, but very important to know during the development. The source code of this extension can be found at [this GitHub repository](https://github.com/aliencube/AzureDevOps.Extensions).

## Packaging Extension

Extension **MUST** be packaged before it is published to the marketplace. It has `.vsix` file extension, which is basically another type of `.zip` file. To generate this package, we need to create a manifest file, `vss-extension.json`. Let's start from there.

### Manifest File

The manifest file, `vss-extension.json` **MUST** be placed in the root folder of the extension. Once it is created, the folder structure might look like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-01.png)

Fill in the file like below:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=vss-extension.json

It looks overwhelming, but it's not that complicated. Let's have a look at each attribute.

- `id`: Extension ID. This **MUST** be unique across the whole marketplace. Only alphanumeric letters and hyphen are allowed.
- `version`: Extension version. It doesn't need to be the same version as individual tasks in the extension.
- `name`: Extension name
- `publisher`: Publisher ID that the extension belongs.
- `description`: Brief description of the extension.
- `targets`: List of areas the extension is in charge. It **SHOULD** always be `Microsoft.VisualStudio.Services` as this is the Azure DevOps extension.
- `categories`: List of services in Azure DevOps. Set `Azure Pipelines`, as this extension is for Azure Pipelines.
- `tags`: List of tags for search in the marketplace.
- `galleryFlags`: List of flags how the extension is published. Possible values are `Free`, `Paid`, `Private`, `Public`, `Preview`. Of course, `Free` and `Paid` can't come together, and neither does `Private` and `Public`.
- `icons`: Path and name of the icon. It can be any location and name like `images/my-icon.png`. But it is recommended using the root folder and fixed name of `icon.png`.
- `content`: Path and name of the content that describes the extension. Like the `icons`, it can be any location and name like `docs/readme.md`. But it is recommended using the root folder and fixed name of `README.md`.
- `files`: List of files that consist of this extension.
    
    - If the `README.md` needs some images, that images themselves or folder containing the images can be included. In this case, the files or folder **MUST** have the `addressable` value of `true`, to be accessible from the Internet.
    - The current folder structure shows all the tasks are placed under the `src` folder, like `src/install` and `src/deploy`. However, the package expects all the task folders **MUST** be under the root folder. Therefore, `packagePath` attribute is used to adjust the location.
    - Each task expects `node_modules` folder for proper invocation. Therefore, the current `src/node_modules` folder **MUST** be copied to `install/node_modules` and `deploy/node_modules` using the `packagePath` attribute.
- `links`: List of external URL links for more information. It generally includes `overview`, `license`, `repository`, and `issues`.
- `repository`: Repository URL, if the extension is open-sourced.
- `badges`: Build/release status badge URL.
- `contributions`: Each task **MUST** have its corresponding contribution.

It's really a brief, but if you need more details, refer to [this page](https://docs.microsoft.com/ko-kr/azure/devops/extend/develop/manifest).

### Packaging Extension

Now, we've got the manifest file. Let's create the package. It requires to install [Azure DevOps Extension CLI (`tfx-cli`)](https://github.com/microsoft/tfs-cli). Enter the following command to install `tfx-cli` on your local machine.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-install-tfx-cli.cmd

After installing CLI, run the following command at the location where the `vss-extension.json` is.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=tfx-extension-create.cmd

Obviously, there are many more commands on `tfx-cli`, but we only need this command above. If you need to more about `tfx-cli`, refer to [this page](https://github.com/microsoft/tfs-cli).

> There might be naming confusion around many CLIs. This `tfx-cli` is for Azure DevOps Extension related. If you want Azure DevOps itself through CLI, use [Azure DevOps CLI Extension](https://github.com/Azure/azure-devops-cli-extension), which is one of the extensions of [Azure CLI](https://docs.microsoft.com/ko-kr/cli/azure/).

Now, we've got the package file! The package file name always looks like `[Publisher ID].[Extension ID]-[Version].vsix`.

## Publishing Extension

It's time to publish. We're going to publish it through the publisher of `aliencube-dev`.

When you go into the [publisher manager](https://marketplace.visualstudio.com/manage) page, `aliencube-dev` has nothing published yet. Click the `+ New Extension` button to publish a new extension.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-02.png)

You'll be asked to upload the package file. As we just created the package, upload it.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-03.png)

Oops! Upload failure! How come? As the error message says, we create the package for the publisher of `aliencube`, which is not correct for now. In other words, we need to update the manifest file, `vss-extension.json` to declare the correct publisher.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-04.png)

Update the `vss-extension.json` file with correct publisher ID, package it again with `tfx-cli` and upload it. Hmmm, another error occurred. What does this mean this time?

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-05.png)

As the `aliencube-dev` publisher hasn't officially verified, it can't publish any public-facing extension. To sort this out, either the publisher is verified by Microsoft, or upload a private package. The intention of using `aliencube-dev` is only to deal with private extensions. So, just update `vss-extension.json` to create a private extension. Change the `galleryFlags` attribute values from `Public` to `Private`, package it and upload it.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-06.png)

Now, it's all good!

## Sharing Extension

The extension uploaded is private, which is not publicly shown. Unless it's visible, we can't download and use it. Therefore, we can share the private extension with designated Azure DevOps organisations. Click the three dots button then click `Share/Unshare`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-07.png)

It shows to enter the Azure DevOps organisation to whare this private extension. I've got an Azure DevOps organisation only for the extension testing only, `https://dev.azure.com/aliencube-dev`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-08.png)

It's now shared. Open the Azure DevOps organisation and go to the organisation settings page. In the settings, open the `Extensions` tab then click the `Shared` tab in the middle.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-09.png)

Now you can find out the shared extension. Install it and you'll be able to see the following screen.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-10.png)

Now, the extension has been installed. Let's run the task in a pipeline.

## Running Task in Pipeline

In a release pipeline, search `netlify` and you'll be able to find two tasks that we've built.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-4-11.png)

* * *

So far, we've created a package of Azure DevOps extension that we built, published, shared, installed and used it. All these steps were manual, by the way.

Let's think about the errors we've met during the package publishing. We had to modify the manifest file for testing. If we publish it publicly, we have to modify the manifest file again, which is not nice. I'm not sure this is efficient. Is there any other way to minimise manual human intervention?

[The next post](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/) will discuss how to automate the entire publishing process through CI/CD pipelines using Azure DevOps.

## More Readings

- [Azure DevOps Extension Manifest](https://docs.microsoft.com/ko-kr/azure/devops/extend/develop/manifest)
- [Azure DevOps Extension CLI (`tfx-cli`)](https://github.com/microsoft/tfs-cli)
- [Azure DevOps CLI Extension](https://github.com/Azure/azure-devops-cli-extension)
- [Azure CLI](https://docs.microsoft.com/ko-kr/cli/azure/)
