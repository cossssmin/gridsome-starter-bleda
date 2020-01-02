---
title: "ARM Template Lifecycle Management: DOs and DON'Ts"
date: "2018-06-19"
slug: arm-template-lifecycle-management-dos-and-donts
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- arm-templates
- azure-logic-apps
- best-practices
- pester
- yaml
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/arm-template-best-practices-00.png
---

## Introduction

Are you an experienced DevOps engineer or managing cloud resources on Azure, or about to jump into Azure resource management?

While you are creating, updating or deleting resources on Azure, you must have worked with [Azure Resource Manager](https://docs.microsoft.com/en-us/azure/azure-resource-manager/) that keeps all resource definitions known as [ARM templates](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates). In other words, you have been using those ARM templates implicitly and/or explicitly. But are you sure you use ARM templates properly? This article is going to discuss what you should consider DOs and DON'Ts to build ARM templates.

In order to create or update Azure resources, ARM templates are used, which can be written in many different ways, but not all of them are considered as "Best Practice". ARM template is a convenient tool to manage Azure resources but, at the same time, can be very difficult and time-consuming to its author, unless it is efficiently written.

Recently, a post has been published on the MVP blog site, which is [Best Practices For Using Azure Resource Manager Templates](https://blogs.msdn.microsoft.com/mvpawardprogram/2018/05/01/azure-resource-manager/). While it contains many insights how to write ARM templates, you will be able to see more complementary DOs and DON'Ts here in this article, from the lifecycle management point of view – writing, testing, deploying and managing.

Here is a brief overview of this article:

- Writing:
    
    - [Consider YAML](#consider-yaml)
    - [Use `variables` over `parameters`](#use-variables-over-parameters)
- Testing:
    
    - [Test template behaviours with Pester](#test-behaviours-on-deployment)
- Deploying:
    
    - [Avoid linked template](#avoid-linked-template-unless-necessary)
- Managing:
    
    - [Manage deployment history with Logic Apps](#manage-deployment-history)

## Consider YAML

An ARM template is a massive size of JSON object. It consists of so many small JSON objects with various depths. As a data carrying format, JSON is very good, but it is not human readable with depths of depths.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/arm-template-best-practices-01.png)

This is a typical example of ARM template. There are many curly brackets and square brackets with different depths. As they are all closing brackets, it is very hard to find their corresponding opening brackets. Some Azure resources take more than hundred lines to define themselves so finding a bracket pair requires endless scrolling up and down over and over again.

Unfortunately, ARM templates only support JSON format. However, if you can use YAML for ARM template writing, it will make your lives easier. Why YAML over JSON? YAML is more human-readable than JSON is. YAML supports comments while JSON does not, which makes a huge difference for developers.

If you use [Visual Studio Code](https://code.visualstudio.com/), there is a great extension called, [json2yaml](https://marketplace.visualstudio.com/items?itemName=tuxtina.json2yaml).

https://twitter.com/darrel_miller/status/958901404931936256

Alternatively, you can clone this repository called [`yarm`](https://github.com/aliencube/yarm) and run it as a local [Azure Function](https://docs.microsoft.com/en-au/azure/azure-functions/) instance to convert JSON to YAML or vice versa. `yarm` is still in an alpha version, but at least it is working on your local machine, so there is no harm to use this.

> The author is the maintainer of `yarm`.

Using either `json2yaml` or `yarm` will give you much freedom from wrestling with JSON object. Once you finish writing an ARM template with YAML, simply convert it to JSON and commit to your source code control. If you deploy `yarm` to your Azure Function instance, you don't even need to store JSON ARM template to the source control. Instead, write and store ARM template in YAML then convert it to JSON within the CI/CD pipeline, when necessary, by calling the Azure Function endpoint.

## Use `variables` over `parameters`

An ARM template consists of [four different sections](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates#template-format) – `parameters`, `variables`, `resources` and `outputs`, and two metadata properties – `$schema` and `contentVersion`.

https://gist.github.com/justinyoo/7c2b6c1abb04312a7d6e413760af1cab?file=arm-template-bare-minimum.json

In the `resources` section, many DevOps engineers use both `parameters` and `variables` at the same time. There is no harm using both in the `resources` section to define Azure resources. However, from the maintainability point of view, mixing both is certainly not a good idea. The `parameters` section accepts values from outside the ARM template by interacting with users or CI/CD pipelines, while the `variables` section defines variables within itself for resource provisioning. Therefore, all `parameters` should be handled within the `variables` section and the `resources` section should only deal with the `variables` section. So should the `outputs` section.

Let's bring up an example. `webapp-sales-dev-ase` consists of four parameters – `webapp` as a resource identifier, `sales` as a business unit, `dev` as a running environment, and `ase` as a resource location (Australia Southeast). In order to enable this, your ARM template should accept at least four parameters. They can be directly used in the `resources` section, but processing them within the `variables` section and referring the `variables` section from the `resources` section results in much more consistency.

https://gist.github.com/justinyoo/7c2b6c1abb04312a7d6e413760af1cab?file=arm-template-variabled.json

If something happens during the deployment, the `variables` section is the first place to look at, rather than scrolling up to `parameters` and down to `variables` over and over again. Do all dirty jobs handling `parameters` in the `variables` section and just use the processed `variables` within the `resources` section.

## Test Behaviours on Deployment

Testing ARM templates is not that easy, but once it is done, it will be rewarding. Azure PowerShell has a cmdlet, [`Test-AzureRmResourceGroupDeployment`](https://docs.microsoft.com/en-us/powershell/module/azurerm.resources/test-azurermresourcegroupdeployment). Azure CLI has also a command like [`az group deployment validate`](https://docs.microsoft.com/en-us/cli/azure/group/deployment?view=azure-cli-latest#az-group-deployment-validate). With this, a basic ARM template testing can be covered. However, it does not capture whether an Azure resource is created with expected properties. For example, the cmdlet validates whether the ARM template can be successfully run or not. However, that does not necessarily mean the ARM template correctly deploys expected resources. Resources might be deployed with different name, different SKUs or different configurations, especially when number of parameters have been introduced.

In order to test the ARM template deployment behaviour, [Pester](https://github.com/pester/Pester) becomes handy. As it is a [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development) based test runner, once you set up acceptance criteria and translate it into test cases using Pester, the test runner will easily be able to capture whether proper configuration is set or not. Have a look at the test script below. It writes typical BDD style test cases – `when running a test, it should expect something`.

https://gist.github.com/justinyoo/3912ea5466adc31dc35d5aae5af00309

Therefore, integrate this test script in your CI/CD pipelines and your ARM template becomes more robust. The more details around [ARM template testing with Pester](https://blog.mexia.com.au/testing-arm-templates-with-pester) can be found at [our Mexia blog](https://blog.mexia.com.au/).

## Avoid Linked Template Unless Necessary

[Using linked ARM template](https://blogs.msdn.microsoft.com/mvpawardprogram/2018/05/01/azure-resource-manager/) is one of the best practices. It is true from one sense. But actually it is not true in many cases. Rather, it is recommended to avoid using the linked ARM template.

The idea behind of using linked ARM template is to split individual Azure resources into each corresponding ARM template and bunch them together, to keep single responsibility. At the same time, each ARM template should be independently working. Then why not deploying individual ARM templates within the CI/CD pipeline, rather than running as linked template?

In order to use the linked ARM template approach, all ARM templates MUST be [publicly accessible](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-linked-templates#external-template-and-external-parameters) or at least the CI/CD pipeline MUST be accessible to a [private place with access token like a SAS token](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-linked-templates#securing-an-external-template). This is the problem. When an ARM template is updated, it has to be uploaded to somewhere so that the CI/CD pipeline can pick it up during the deployment process.

Too complicating.

Why should it be uploaded to somewhere other than the repository for deployment?

Another issue that the linked ARM template approach imposes is, it only accepts either parameter URI or parameter object. There is no combination of both. However, many ARM template deployment cases use both parameter file and parameter object at the same time to handle sensitive information. In order to handle sensitive information with linked ARM template, parameter URI cannot be used, unless using a [hacky workaround](https://blog.kloud.com.au/2016/08/08/passing-parameters-to-linked-arm-templates/).

Therefore, unless you have a specific reason, it is recommended not to use linked ARM template. Instead, create individual ARM templates for each resource to increase reusability and let the CI/CD pipeline take care of them.

## Manage Deployment History

Have you been aware that each Azure Resource Group only contains the deployment history of maximum 800? If you deploy ARM template under a certain resource group more than 800 times, the deployment will fail. The number, 800, would not be enough, especially when you integrate CI/CD pipelines with your ARM template deployment. In other words, those deployment history should be constantly monitored, backed up and deleted.

Even though this is not related to ARM template itself but is related to management or monitoring activity, this should be considered when using ARM templates for your Azure resource management.

Azure PowerShell has a cmdlet, [`Remove-AzureRmResourceGroupDeployment`](https://docs.microsoft.com/en-us/powershell/module/azurerm.resources/remove-azurermresourcegroupdeployment) and Azure CLI has a command, [`az group deployment delete`](https://docs.microsoft.com/en-us/cli/azure/group/deployment?view=azure-cli-latest#az-group-deployment-delete) that delete an individual deployment history. Therefore, as soon as you complete ARM template deployment within the CI/CD pipeline, just delete the history. Nice an easy. Alternatively, you can regularly iterate the entire deployment history to delete them all at once.

There is a problem by the way. You might have to keep the deployment history for auditing purpose. Therefore, before deleting, you should copy the deployment history to somewhere like Azure Table Storage. If you use an Azure Logic App, copying each deployment history and deleting it becomes really easy. The Logic App periodically checks whether they exists or not, and if exists back them up and delete them. This blog post, [Managing Excessive ARM Deployment Histories with Logic Apps](https://devkimchi.com/2018/05/30/managing-excessive-arm-deployment-histories-with-logic-apps/) explains how to manage deployment history using [Azure Logic Apps](https://docs.microsoft.com/en-us/azure/logic-apps/).

## Conclusion

So far, you have learnt what you need to DO and DON'T writing ARM templates from four different perspectives:

- Writing:
    
    - [Consider YAML](#consider-yaml)
    - [Use `variables` over `parameters`](#use-variables-over-parameters)
- Testing:
    
    - [Test template behaviours with Pester](#test-behaviours-on-deployment)
- Deploying:
    
    - [Avoid linked template](#avoid-linked-template-unless-necessary)
- Managing:
    
    - [Manage deployment history with Logic Apps](#manage-deployment-history)

Hopefully, this article helps your ARM template experience become more robust and efficient.

> This has been originally posted at [Mexia blog](https://blog.mexia.com.au/arm-template-lifecycle-management-dos-and-donts).
