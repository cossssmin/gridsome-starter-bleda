---
title: "Azure Storage Emulator on Azure Pipelines"
date: "2019-10-16"
slug: azure-storage-emulator-on-azure-pipelines
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- azure-pipelines
- azure-storage-emulator
- azurite
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-storage-emulator-on-azure-pipelines-00.png
---

While developing applications on Azure, it's often necessary to integrate with [Azure Storage](https://azure.microsoft.com/services/storage/?WT.mc_id=devkimchicom-blog-juyoo). Notably, [Azure Functions](https://azure.microsoft.com/services/functions/?WT.mc_id=devkimchicom-blog-juyoo) development always needs Azure Storage. Fortunately, [Azure Storage Emulator](https://docs.microsoft.com/azure/storage/common/storage-use-emulator?WT.mc_id=devkimchicom-blog-juyoo) can literally emulate the connection. For unit testing, it's rarely necessary, but it is for integration testing or end-to-end testing for some scenarios. Running the emulator is OK at my local machine. How can it be run in a CI/CD pipeline?

Throughout this post, I'm going to discuss how to run Azure Storage Emulator in [Azure DevOps Pipelines](https://azure.microsoft.com/services/devops/pipelines/?WT.mc_id=devkimchicom-blog-juyoo).

## Azure Storage Emulator

You can directly download and install [Azure Storage Emulator](https://docs.microsoft.com/azure/storage/common/storage-use-emulator?WT.mc_id=devkimchicom-blog-juyoo) from [this link](https://go.microsoft.com/fwlink/?linkid=717179&clcid=0x409&WT.mc_id=devkimchicom-blog-juyoo). As it's also a part of Azure SDK, it's already installed on [Microsoft-hosted Agent](https://docs.microsoft.com/azure/devops/pipelines/agents/hosted?WT.mc_id=devkimchicom-blog-juyoo). Therefore, running the commands below can let the emulator up and run through the pipeline. Let's have a look.

The agent is always spun up whenever each build is triggered. Therefore, define a task to initialise a local database for the emulator.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=storage-emulator-init.cmd

Once initialised, then run the emulate like this:

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=storage-emulator-start.cmd

You can run separate tasks for both commands or run at once, like below:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-storage-emulator-on-azure-pipelines-01.png)

If you prefer using YAML pipeline, add the `CommandLine` task and enter both commands like this:

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=storage-emulator.yaml

It's not that hard.

However, there's a slight problem on this approach. This emulator runs only on Windows machine. In other words, if you want to run this emulator, the build agent **MUST** be running Windows OS like `windows-latest`, `windows-2019`, `vs2017-win2016`, or `vs2015-win2012r2`. Many applications we build nowadays support cross-platform, which is not a problem. But there are still many applications that only support a specific OS other than Windows. This OS-specific application will be the problem. What will be the solution for these cases?

## Azurite

Azure also maintains a [cross-platform and open-source emulator](https://docs.microsoft.com/azure/storage/common/storage-use-azurite?WT.mc_id=devkimchicom-blog-juyoo), called [Azurite](https://github.com/azure/azurite). According to [the official document](https://docs.microsoft.com/azure/storage/common/storage-use-azurite?WT.mc_id=devkimchicom-blog-juyoo), Azurite will replace Azure Storage Emulator sooner rather than later.

> Azurite is the future storage emulator platform. Azurite supersedes the Azure Storage Emulator. Azurite will continue to be updated to support the latest versions of Azure Storage APIs.

Therefore, using this tool also needs to be considered as an alternative.

Unfortunately, we need to install Azurite first before anything else, as it's not yet the default tool installed on the agent. As it's an npm package, simply run the command like below for installation. Make sure you run `sudo` command to install the package.

> At the time of this writing, the latest version of Azurite is [`3.2.0-preview`](https://www.npmjs.com/package/azurite). However, you can still install the latest stable version of `2.7.1`.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=azurite-install.sh

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-storage-emulator-on-azure-pipelines-02.png)

Once installed, run the command below to run Azurite. Also, make sure that you run Azurite in the background by adding `&` at the end of the command. If it's not running in the background, the pipelines won't proceed to the next step.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=azurite-run.sh

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/azure-storage-emulator-on-azure-pipelines-03.png)

The YAML pipeline representation might look like:

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=azurite.yaml

* * *

So far, we've walked through how to run Azure Storage Emulator within Azure Pipelines. We've also discussed how Azurite can be installed and run within Azure Pipelines as an alternative to Azure Storage Emulator.

## Get Azure DevOps

Are you interested in playing around Azure Storage Emulator or Azurite on Azure DevOps? [Sign-up now](https://azure.microsoft.com/services/devops/?WT.mc_id=devkimchicom-blog-juyoo). It's free!
