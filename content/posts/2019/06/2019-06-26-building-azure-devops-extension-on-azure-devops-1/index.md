---
title: "Building Azure DevOps Extension on Azure DevOps - Design"
date: "2019-06-26"
slug: building-azure-devops-extension-on-azure-devops-1
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- extensions
- alm
- design
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops.png
---

[Azure DevOps](https://azure.microsoft.com/en-us/services/devops/) provides an end-to-end service that takes care of the entire [ALM (Application Lifecycle Management)](https://en.wikipedia.org/wiki/Application_lifecycle_management) process. DevOps itself takes a big part of this ALM journey. While the service naming indicates that only DevOps related features are offered, it comprises all the ALM cycle from request analysis to delivery, via development and test. There's no doubt that it's such a powerful tool. In addition to this, Azure DevOps offers a strong extension model so that anyone can publish extensions to [Visual Studio Marketplace](https://marketplace.visualstudio.com/azuredevops). If your Azure DevOps instance doesn't have a necessary extension that you're looking for, you can search it on the marketplace and install it. If you can't find it, then publish it by yourself publicly or privately. Throughout this series of posts, I'm going to discuss how to build an Azure DevOps extension from various perspectives.

## Table of Contents

This series consists of those six posts:

1. **_Building Azure DevOps Extension - Design_**
2. [Building Azure DevOps Extension - Implementation](https://devkimchi.com/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. [Building Azure DevOps Extension - Publisher Registration](https://devkimchi.com/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. [Building Azure DevOps Extension - Manual Publish](https://devkimchi.com/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. [Building Azure DevOps Extension - Automated Publish 1](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. [Building Azure DevOps Extension - Automated Publish 2](https://devkimchi.com/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## Use Case Scenario

I'm interested in using a static website generator, called [Hugo](https://gohugo.io/), to publish a website. There's [an extension](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension) already published in the marketplace so that I'm able to install it for my Azure DevOps organisation. To publish this static website, I wanted to use [Netlify](https://netlify.com/). However, it doesn't yet exist, unfortunately. Therefore, I'm going to build an extension for Netlify and at the end of this series, you will be able to write an extension like what I did.

> Actually, this Netlify extension has already been [published](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions), which you can use it straight away. This series of posts is a sort of reflection that I fell into situations – some are from the official documents but the others are not, but very important to know during the development. The source code of this extension can be found at [this GitHub repository](https://github.com/aliencube/AzureDevOps.Extensions).

## Designing Azure DevOps Extension

There are two different SDKs for Azure DevOps extension development. One is for [Web Extensions SDK](https://github.com/Microsoft/vss-web-extension-sdk), and the other i for [Pipelines Task SDK](https://github.com/microsoft/azure-pipelines-task-lib). As a rule of thumb, the former is generally used for [Azure Boards](https://azure.microsoft.com/en-us/services/devops/boards/) and [Azure Repos](https://azure.microsoft.com/en-us/services/devops/repos/) related extension development, and the latter is generally used for [Azure Pipelines](https://azure.microsoft.com/en-us/services/devops/pipelines/) related extension development. I'm going to use the latter because my extension will only be used for Azure Pipelines. You can start from [this document](https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task) to understand the basic approach.

> To use [Netlify CLI](https://www.npmjs.com/package/netlify-cli) to publish your static websites, you might need two tasks – one is to install the `netlify-cli` from npm, and the other is to deploy your website to Netlify through `netlify-cli` installed. So, I'm going to create two tasks named `install` and `deploy`.

### Scaffolding Folder Structure

First of all, let's scaffold the folder structure. I've set it up like the image below – there are `images`, `src`, `test` folders, and under the `src` folder, I created `install` and `deploy` folder. These very two folders are the ones I'm working on. I'm going to touch the other folders later in this series.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-1-01.png)

### Designing `install` Task

The `netlify-cli` is installed into the pipeline through this task. The first thing I need to do is to create a `task.json` file in the `install` folder and put the JSON content in the file:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=install-task.json

Here are attributes you need to understand at the first place:

- `id`: A unique GUID value. [This website](https://www.guidgen.com/) can easily get the GUID value.
- `name`: Name of the task. This only allows alpha-numeric letters. It's recommended to have the same name as the folder name.
- `friendlyName`: The name displayed in the Azure DevOps pipeline UI.
- `preview`: Indicator that this task is a preview. This usually is set to `false`, unless it's a preview.
- `showEnvironmentVariables`: Environment variables only scoped to this task. If necessary, set this value to `true`.
- `runsOn`: List of agents that the task can run. The possible values are `Agent` (Hosted Agent), `MachineGroup` (Deployment Group), `Server` (Azure DevOps Server). In general, set those three values at the same time.
- `category`: Azure DevOps category. As my use case is only responsible for Azure Pipelines, I just set the value here to `Azure Pipelines`.
- `instanceNameFormat`: The initial task name when the task is brought to the pipeline.
- `execution`: The file name that this task invokes. It can be either a PowerShell script or JavaScript. In my use case, I'm going to use JavaScript, so I set `Node` and `index.js`.
- `inputs`: This is the most crucial part of designing the `task.json`. It defines the user input flow. Based on this, the UI of the task is determined. This task only requires the `netlify-cli` version. My intention around this will be to take the version value. If it's omitted, the latest version of `netlify-cli` will be installed.

Based on the design, the actual UI will look like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-1-02.png)

> If you want to know more details on the `task.json` structure, have a look at [`task.schema.json`](https://github.com/microsoft/azure-pipelines-task-lib/blob/master/tasks.schema.json) as a reference.

### Designing `deploy` Task

This task is to deploy websites through `netlify-cli` installed from the previous task. If you're not familiar with Netlify command, this will be the command I'm going to use:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-deploy.cmd

> If you want to know more about the `netlify-cli` command, visit this [official page](https://www.netlify.com/docs/cli/).

As the command requires several parameters, I need to reflect them into the design. Under the `deploy` folder, create a `task.json` file and enter the following JSON object:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=deploy-task.json

I'm going to discuss only the `inputs` attribute here. As you can see, it needs more parameters than the `install` task.

- `authToken`: **(Required)** PAT (Personal Access Token) of your Netlify account.
- `siteId`: **(Required)** Site ID of your Netlify website, which is unique to every website on Netlify.
- `sourceDirectory`: **(Required)** The folder location of the static website artifact. Default value is `$(System.DefaultWorkingDirectory)`.
- `isValidationOnly`: **(Optional)** If selected, this task only validates deployment. if not selected the task publishes the website.
- `message`: **(Optional)** A short blurb for logging during the deployment.
- `functionsDirectory`: **(Optional)** The folder location of AWS Lambda functions, if they exist.

Based on this design, the UI will look like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-1-03.png)

### Setting up Icon for Task

When you see the [Extension Layout](https://docs.microsoft.com/en-us/azure/devops/extend/develop/integrate-build-task#traditional-extension-layout) page, each task needs its icon to display on the pipeline UI. This is the only information on the official document, but this is not enough to publish. Fortunately, this [Stack Overflow page](https://stackoverflow.com/questions/42050550/why-tfs-build-step-extension-icon-is-missing#42051436) provides more details. To sum up:

- The icon name **MUST** be `icon.png`.
- The icon size **MUST** be `32x32` pixels.
- The icon **MUST** be placed at the same location as the `task.json` file.

If you can't meet this condition, your extension won't be displaying the task icon properly.

> Of course, the extension icon is different from this task icon, which will be discussed in later of this series.

* * *

Now, we've completed designing the extension tasks. As a result, you'll be able to see the folder and file structure like below:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-1-04.png)

In the [next post](https://devkimchi.com/2019/07/03/building-azure-devops-extension-on-azure-devops-2/), I'll discuss how to implement the `index.js` that is invoked by the `task.json`.

## More Readings

- [Hugo](https://gohugo.io/)
    
    - [Hugo Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension)
    - [Hugo Extension (Source Codes)](https://github.com/giuliov/hugo-vsts-extension)
- [Netlify](https://netlify.com/)
    
    - [Netlify Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)
    - [Netlify Extension (Source Codes)](https://github.com/aliencube/AzureDevOps.Extensions/tree/master/Netlify)
    - [Netlify Docs](https://www.netlify.com/docs/)
    - [Netlify CLI (Docs)](https://www.netlify.com/docs/cli/)
    - [Netlify CLI (npm Package)](https://www.npmjs.com/package/netlify-cli)
- [Develop Azure DevOps Extensions](https://docs.microsoft.com/en-us/azure/devops/extend/)
    
    - [Azure DevOps Marketplace](https://marketplace.visualstudio.com/azuredevops)
    - [Add Build or Release Task](https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task)
    - [Reference for Integrating Custom Build Tasks into Extensions](https://docs.microsoft.com/en-us/azure/devops/extend/develop/integrate-build-task)
    - [Why TFS Build Step Extension Icon Is Missing?](https://stackoverflow.com/questions/42050550/why-tfs-build-step-extension-icon-is-missing#42051436)
    - [Task Schema Reference](https://github.com/Microsoft/azure-pipelines-task-lib/blob/master/tasks.schema.json)
- [GUID Online Generator](https://www.guidgen.com/)
