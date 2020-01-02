---
title: "Writing ARM Templates in YAML"
date: "2018-08-07"
slug: writing-arm-templates-in-yaml
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- arm-templates
- ci-cd
- vsts
- yarm-cli
- yarm
- yaml
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/writing-arm-templates-in-yaml-00.png
---

In my previous post, [ARM Template Lifecycle Management: DOs and DON'Ts](https://devkimchi.com/2018/06/19/arm-template-lifecycle-management-dos-and-donts/), I recommend to consider YAML for ARM template authoring. In the post, I also suggest using [yarm](https://github.com/aliencube/yarm) to convert YAML to JSON and/or vice-versa. However, `yarm` is not that easy to use because it has to be deployed to Azure or, at least, it has to be run on your local machine. What if there is a command-line tool for easy conversion between YAML and JSON? If this is the case, integrating it with a CI/CD pipeline will be much easier. In this post, I am going to write an ARM template in YAML, build it to JSON, test it against [Pester](https://github.com/pester/Pester), and finally deploy it to Azure.

## Why YAML?

As I mentioned in my [previous post](https://devkimchi.com/2018/06/19/arm-template-lifecycle-management-dos-and-donts/), YAML is a superset of JSON and much more human-readable while authoring complex objects like ARM templates. Have a look at the picture below.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/writing-arm-templates-in-yaml-01.png)

The left-hand side of the picture is the original ARM template for Azure Virtual Machine. Can you easily find out where the square brackets are, amongst all curly braces? I know. It is very hard to spot them. On the other hand, at the right-hand side, the same ARM template is written in YAML format. Does it look easier to read? Of course it does.

Therefore, it will be fantastic, if I write the ARM template in YAML and can easily convert it to JSON which [Azure PowerShell](https://docs.microsoft.com/en-us/powershell/azure/overview) or [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) understands.

## YARM CLI

Instead of using an Azure Function instance of `yarm`, there is a command-line tool, called [`yarm cli`](https://github.com/TeamYARM/YARM-CLI). It is a very simple cross-platform tool, which is written in C# with [.NET Core](https://docs.microsoft.com/en-us/dotnet/core/). It's even better because it doesn't require you to install any .NET Core runtime on your machine. If you want to know more about `yarm cli`, read this post, [Introducing YARM CLI](https://devkimchi.com/2018/08/04/introducing-yarm-cli/)

Let's create a simple [Azure Logic App](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-overview) placeholder in YAML.

https://gist.github.com/justinyoo/53a5c751808161187b69e35c10b3b481?file=azuredeploy.yaml

This YAML file itself can't be used for testing nor deploying. Therefore, it needs to be converted into JSON, using `yarm cli`.

https://gist.github.com/justinyoo/53a5c751808161187b69e35c10b3b481?file=yarm-cli-cmd.txt

That's it, actually. Now, we need to do this conversion task on our preferred CI/CD pipeline. Let's move on.

## YARM CLI on VSTS

In this post, I'm going to use [VSTS](https://visualstudio.com). Let's have a look at the build tasks. The build pipeline consists of several tasks including the `yarm cli` installation and YAML to JSON conversion.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/writing-arm-templates-in-yaml-02.png)

Installing `yarm cli` is easy. Run the following PowerShell script and it will install the latest release of `yarm cli` onto VSTS. As I mentioned above, it doesn't install the .NET Core runtime at all. Therefore, if you are running `yarm cli` on your machine, even if you don't have any .NET Core runtime installed, it shouldn't really matter.

https://gist.github.com/justinyoo/53a5c751808161187b69e35c10b3b481?file=install-yarm-cli-ps1.txt

Conversion is also easy. Simply loop through all YAML files and convert them one-by-one.

https://gist.github.com/justinyoo/53a5c751808161187b69e35c10b3b481?file=convert-yaml-to-json-ps1.txt

Now, we have the converted ARM template that can be understood by Azure PowerShell and Azure CLI. Let's move onto the test part.

## Test ARM Template

As I have already dealt with this topic in my previous post, [Testing ARM Templates with Pester #2 – Azure CLI](https://devkimchi.com/2018/07/12/testing-arm-templates-with-pester-2/), I'm not going walk through this part here. But, I'm going to show the steps for this – install Pester, install Azure CLI, run Pester for test and publish the test results.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/writing-arm-templates-in-yaml-03.png)

## Build and Publish Artifacts

Once all tests are passed, the ARM template needs to be packaged for deployment.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/writing-arm-templates-in-yaml-04.png)

When this build pipeline is run, we can see the result like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/writing-arm-templates-in-yaml-05.png)

The fact that we reach this part means that all steps – build, test and creating artifacts – in the CI pipeline is done. Now, let's move onto the release pipeline.

## Deploy ARM Template

ARM template deployment is not that special. Just use the release task, [Azure Resource Group Deployment](https://github.com/Microsoft/vsts-tasks/blob/master/Tasks/AzureResourceGroupDeploymentV2/README.md).

Once the release pipeline is successfully run, you can see the screen like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/writing-arm-templates-in-yaml-06.png)

* * *

So far, I have shown the full lifecycle of the ARM template, from authoring it in YAML to deploying it to Azure. The only caveat of this approach is **no intelli-sense support** because YAML for ARM template authoring is not officially supported out-of-the-box. However, other than this, it will bring much better productivity increase due to its better readability.

> This was originally posted at [Mexia Blog](https://blog.mexia.com.au/writing-arm-templates-in-yaml).
