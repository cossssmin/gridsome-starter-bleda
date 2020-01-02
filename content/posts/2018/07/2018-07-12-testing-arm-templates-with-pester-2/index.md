---
title: "Testing ARM Templates with Pester #2 - Azure CLI"
date: "2018-07-12"
slug: testing-arm-templates-with-pester-2
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- arm-templates
- azure-cli
- pester
- test
- vsts
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/07/testing-arm-templates-with-pester-2-00.png
---

In my previous post, [Testing ARM Templates with Pester #1 - PowerShell](https://blog.mexia.com.au/testing-arm-templates-with-pester), I showed how to test behaviours ARM template deployment without actual deployment. At the end of the post, I also briefly mentioned how we can integrate this testing in our CI/CD pipeline. However, I was actually asked many times how I did it on [Visual Studio Team Service (VSTS)](https://visualstudio.com). To be honest, it's not that intuitive for this, especially we need to run test before the resource deployment. This post, [Test Azure deployments in your VSTS Release Pipeline](https://pgroene.wordpress.com/2017/09/08/test-azure-deployments-in-your-vsts-release-pipeline/), talks about after resource deployment in the release pipeline, but not in the build pipeline. In this post, I'm going to show how to test ARM templates in the build pipeline.

> The code sample can be found at [Testing ARM Templates](https://github.com/devkimchi/Testing-ARM-Templates)

## Azure CLI

[Pester](https://github.com/pester/Pester) is a PowerShell-based test framework. So, it's easy to think we can use PowerShell for testing, with this cmdlet `Test-AzureRmResourceGroupDeployment`. This is somewhat true, but as you know, PowerShell is not [as good as error handling](https://blog.kloud.com.au/2016/07/24/effective-error-hanalding-in-powershell-scripting/). On the other hand, Azure CLI returns an error object, even if there is an error, which we can gracefully handle errors. In addition to that, Azure CLI can also run on PowerShell! So, this time, we're using Azure CLI for ARM template testing.

In order to validate ARM template in Azure CLI, here's the command:

https://gist.github.com/justinyoo/1e7c3e7f0e282c822c94206778557897?file=az-group-deployment-validte.txt

When we run this command, it returns a JSON object that contains the validation result. Here's the actual result that the command returns.

https://gist.github.com/justinyoo/1e7c3e7f0e282c822c94206778557897?file=az-group-deployment-validte.json

As all necessary information resides in the `validatedResources` property, we can simply parse this JSON string to JSON object and utilise it.

## Test with Pester

Here's the sample test script using Pester:

https://gist.github.com/justinyoo/1e7c3e7f0e282c822c94206778557897?file=logicapp-tests-with-cli.txt

As you can see, the `$output` variable stores the validation result converted into a JSON object, then check whether the deployment behaviour is expected or not. It looks simple because I use it for Logic App deployment, but if you deploy an Azure VM or App Service instance, or something else, it would be more complex and there would be more behaviours to test. Now, run the test script and you will see the result like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/07/testing-arm-templates-with-pester-2-01.png)

Looks all good. Now, this needs to be integrated into VSTS. Let's move on.

## VSTS Integration

There are [third-party tasks for Pester](https://marketplace.visualstudio.com/search?term=Pester&target=VSTS&category=All%20categories&sortBy=Relevance), but they are not for our purpose. One is not designed for Azure resources, and the other is only useful for the release pipeline. Also, the current version of Azure CLI task [can't install additional PowerShell module](https://github.com/Microsoft/vsts-tasks/issues/7655), that is Pester for our case. Therefore, we need to install Pester and Azure CLI in a separate PowerShell task.

### Install Pester

First of all, we need to install Pester. VSTS has a built-in Pester, but its version is 3.4.0, which is quite old. According to the official Pester repository, it's always a good idea to install the newest version of it. Therefore, install Pester from PowerShell Gallery.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/07/testing-arm-templates-with-pester-2-02.png)

### Install Azure CLI

As VSTS has already got Python runtime, we can easily install Azure CLI with the following command.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/07/testing-arm-templates-with-pester-2-03.png)

### Invoke Pester

Now, we've got Pester and Azure CLI. It's time to run the test script. Here in this post, I have two PowerShell scripts – the test script itself and the Pester runner. In the Azure PowerShell task, it calls the Pester runner and the runner calls the test script.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/07/testing-arm-templates-with-pester-2-04.png)

It looks messy in the arguments field because it needs several parameters. The actual runner is actually very simple.

https://gist.github.com/justinyoo/1e7c3e7f0e282c822c94206778557897?file=run-pester.txt

### Publish Test Results

Pester also supports test results output. Currently it only supports the [`NUnit`](http://nunit.org/) format, but that's fine anyway because VSTS supports it. In the Pester runner script above, it has already set up the output file and output format. Therefore, another task, Publish Test Results can capture those results.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/07/testing-arm-templates-with-pester-2-05.png)

## Activate Build Pipeline

Now, we're all set on VSTS! Let's run the build. Once the build is successful, the build result screen might look like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/07/testing-arm-templates-with-pester-2-06.png)

All build tasks has passed and tests results are successfully integrated into VSTS dashboard.

* * *

So far, I have worked through how to integrate ARM template testing in VSTS, with Pester and Azure CLI. Currently, the build time takes around 10 mins because it includes Peter and Azure CLI installation, which is a caveat of this approach. If there is a task integrated with Azure CLI and Pester, the user experience would be a lot better.

> This has been originally posted at [Mexia](https://blog.mexia.com.au/testing-arm-templates-with-pester-2).
