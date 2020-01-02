---
title: "6 Ways Passing Secrets to ARM Templates"
date: "2019-04-24"
slug: 6-ways-passing-secrets-to-arm-templates
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- arm-templates
- linked-templates
- yarm-cli
- azure-devops
- azure-pipelines
- azure-key-vault
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/04/6-ways-passing-secrets-to-arm-templates-00.png
---

> **DISCLAIMER**: This post is purely a personal opinion, not representing or affiliating my employer’s.

Whenever you deal with ARM templates, you always face to handle some sensitive information. This is mainly for API keys handling. How can you cope with those values other than hard-code them into the templates? There are six different ways to handle them we're going to discuss in this post.

## 1. Use ARM Template Functions to Pass Values Internally

Some Azure resources generate their access keys after they are provisioned. Here are some examples: [Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview), [Azure SQL Database](https://azure.microsoft.com/en-au/services/sql-database/), [Cosmos DB](https://azure.microsoft.com/en-au/services/cosmos-db/), [Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview), [Service Bus](https://azure.microsoft.com/en-au/services/service-bus/), [Functions](https://azure.microsoft.com/en-au/services/functions/), and [Logic Apps](https://azure.microsoft.com/en-au/services/logic-apps/). They can be directly accessible within the ARM templates, without knowing them, as long as we know their resource IDs. As I wrote the relevant post a while ago, here in this post, I'm not going further but leave the link of the post.

> [List of Access Keys from Output Values after ARM Template Deployment](https://devkimchi.com/2018/01/05/list-of-access-keys-from-output-values-after-arm-template-deployment/)

- **Pros**
    
    - Keys don't need to be stored anywhere
    - Keys can be directly accessible via ARM template functions within the templates
- **Cons**
    
    - Keys from outside Azure can't be accessible
    - ARM template functions are not consistent. eg) `listKeys` for Storage Account, `listSecrets` for Azure Functions and `reference` for Application Insights

Those ARM template functions internally use ARM REST APIs, which means resources not on Azure can't use them. In addition to this, inconsistency on the ARM function names and signatures have made this useful feature not very popular, which is a bit sad. But when you start using this, it will be powerful.

## 2. Use `SecureString` to Pass Values via Parameters

This is the most common and popular way of handling secrets. ARM template parameters have data type of `string`, `int`, `bool`, `securestring`, `secureobject`. Using the `securestring` data type only accepts the encrypted value. Therefore no one can recognise the value. In fact, an ARM template uses the `securestring` data type like this way:

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=serviceprincipaltenantid.yaml

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=serviceprincipaltenantid.json

> **NOTE**: I've deliberately written ARM templates in both YAML and JSON. As you know YAML is not officially supported yet, but is very powerful to use. If you're interested in YAML authoring, have a look at [this post](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/).

If you setup the ARM template like above, values are encrypted and passed directly to the template or through CI/CD pipelines. Here's how values are encrypted in PowerShell and passed it to the cmdlet.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=new-azurermresourcegroupdeployment.txt

If you use Azure CLI, this is the command.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=az-cli.txt

- **Pros**
    
    - `SecureString` value can be easily generated and used straight away.
    - Environment variables in CI/CD pipeline can have encrypted value and are passed to the template.
- **Cons**
    
    - In a rare case, while the plain text value is stored into the CI/CD pipeline, it might be compromised before being encrypted by the pipeline.
    - While encrypting those values within PowerShell environment, they might be compromised on the screen.

I can't say this type of compromising won't happen.

## 3. Integrate Azure Key Vault with ARM Templates Directly

Now, we know Azure Key Vault is used for this type of practice. First of all, we can directly integrate Azure Key Vault with ARM templates. If you use a parameter file, Azure Key Vault can be referenced within the parameter file. The following code snippet describes how to set up parameters for Azure Logic App.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=parameters.yaml

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=parameters.json

In the parameter file like below, you can introduce Azure Key Vault reference.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=parameters-kv.yaml

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=parameters-kv.json

- **Pros**
    
    - Existing ARM templates are not changed.
    - Only parameter files are changed to include Azure Key Vault references.
- **Cons**
    
    - Within the parameter file, Azure Key Vault resource ID must be hard-coded.
    - The hard-coded resource ID includes the subscription ID, which might be considered as a sensitive data.

Is there any other way to avoid that hard-coded value? Of course there is.

## 4. Integrate Azure Key Vault with ARM Templates Indirectly

Without needing to hard-code Azure subscription ID, we can still reference to Azure Key Vault instance. In order to achieve this, we should use the linked templates. In other words, we need to write another linked template for this purpose.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=resources.yaml

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=resources.json

The [`resourceId` function](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-functions-resource#resourceid) is the key for this approach.

- **Pros**
    
    - There is no hard-coded value required.
- **Cons**
    
    - Additional linked templates should be written.

If your organisation has already been using those linked template approach, that wouldn't be an issue; otherwise your organisation will start worrying about extra maintenance efforts on those linked templates.

## 5. Integrate Azure Key Vault Task with Each CI/CD Pipeline

Instead of referencing Azure Key Vault within ARM templates, you can also let your preferred CI/CD pipeline handle them. Here in this post, I'm using [Azure Pipelines](https://azure.microsoft.com/en-au/services/devops/pipelines/) in [Azure DevOps](https://azure.microsoft.com/en-au/services/devops/). First of all, the secret name stored in Azure Key Vault looks like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/04/6-ways-passing-secrets-to-arm-templates-01.png)

This Azure Key Vault instance can be referenced by the Key Vault task in each pipeline.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/04/6-ways-passing-secrets-to-arm-templates-02.png)

Setup the Azure Subscription and Key Vault instance, then enter the secret name.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/04/6-ways-passing-secrets-to-arm-templates-03.png)

Then reference the secret name in the ARM Template Deployment task.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/04/6-ways-passing-secrets-to-arm-templates-04.png)

- **Pros**
    
    - Existing ARM templates are not touched.
    - There is no dependency on the CI/CD environment variables.
    - All secrets are managed by Azure Key Vault.
- **Cons**
    
    - Each pipeline has to set up the Key Vault task to access to Key Vault, which is cumbersome.

## 6. Integrate Azure Key Vault with Common Library in CI/CD Pipeline

If your CI/CD pipeline supports common libraries, like Azure Pipelines, we can integrate Azure Key Vault instance with the common library. Create a common library and enable Azure Key Vault integration.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/04/6-ways-passing-secrets-to-arm-templates-05.png)

Once Azure Key Vault is linked to the library, register the library in the variable groups tab.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/04/6-ways-passing-secrets-to-arm-templates-06.png)

Then give the reference in the ARM Template Deployment task.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/04/6-ways-passing-secrets-to-arm-templates-07.png)

- **Pros**
    
    - Existing ARM templates are not touched.
    - There is no dependency on the CI/CD environment variables.
    - All secrets are managed by Azure Key Vault.
    - Each pipeline doesn't need to set up Azure Key Vault integration.
- **Cons**
    
    - The common library might get bigger, as all necessary secrets need to be registered up-front.

## Conclusion

To sum up, we've walked through six different ways handling secrets around ARM templates. As each approach has its own pros and cons, we can't tell which way is better than the others. It really depends on the situation and requirements, nonetheless.

## What's Next?

- ARM Template Sample Code: [https://github.com/devkimchi/Handling-Secrets-around-ARM-Templates](https://github.com/devkimchi/Handling-Secrets-around-ARM-Templates)
- Azure DevOps Pipeline: [https://fairdincom.visualstudio.com/Handling-Secrets-around-ARM-Templates](https://fairdincom.visualstudio.com/Handling-Secrets-around-ARM-Templates/_release)
- Blog Post: [List of Access Keys from Output Values after ARM Template Deployment](https://devkimchi.com/2018/01/05/list-of-access-keys-from-output-values-after-arm-template-deployment/)
- Blog Post: [Writing ARM Templates in YAML](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/)

> This was originally posted at [Platform Engineering Blog](https://platform.deloitte.com.au/articles/6-ways-passing-secrets-to-arm-templates).
