---
title: "25 Days of Serverless (Day 22): Winter Solstice - Protect Secrets from Grim Reaper!"
date: "2019-12-23"
slug: 25-days-of-serverless-day-22-winter-solstice-protect-secrets-from-grim-reaper
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- 25-days-of-serverless
- azure-functions
- azure-key-vault
- azure-blob-storage
- backup
- restore
- serverless-challenges
fullscreen: true
cover: https://res.cloudinary.com/jen-looper/image/upload/v1575489111/images/challenge-22_glk8t3.jpg
---

This article is part of [#25DaysOfServerless](https://25daysofserverless.com). New challenges will be published every day from Microsoft Cloud Advocates throughout the month of December. Find out more about how Microsoft Azure enables your [Serverless functions](https://docs.microsoft.com/azure/azure-functions/?WT.mc_id=25days_devto-blog-cxa).

Have an idea or a solution? Share your thoughts on [Twitter!](https://twitter.com/intent/tweet?text=I'm joining the @azureadvocates %2325DaysOfServerless challenge!! Learn more at https://aka.ms/25daysofserverless or see solutions at https://dev.to/search?q=25DaysOfServerless! Join me!)
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

* * *

## Challenge

Welcome to Korea in this festive season! It's Winter Solstice today. Traditionally in Korea, it's the day that many grim reapers are seeking for young kids to take their souls. But they won't be able to find out our children who eat red-bean porridge before going to sleep.

![porridge](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/red-bean-porridge.png)

Oh no! Cheol-soo missed the porridge tonight. He's in danger to get caught by the grim reaper! We need to keep him in a safe place and lock the door until the next day; the Sun is rising. His best friend Young-hee locked the door and got the secret code to open it.

![memo](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/memo.png)

Then she managed to store the secret into Azure Key Vault, but how smart the grim reaper is!! The grim reaper is trying to destroy the Key Vault so that Cheol-soo can't get out of the safe place forever! If Young-hee can't find out how to backup and restore the Key Vault, he will die in there!

She needs to back it up before the grim reaper destroys it. And she also needs to restore it even if the grim reaper demolishes the Key Vault. How can we help Young-hee backup and restore Key Vault secret?

## Prerequisites

### Azure Account

Do you have an Azure account yet? Let's create the one [free of charge](https://azure.microsoft.com/free/?WT.mc_id=25days_devto-blog-cxa). As this free account is offered with USD 200, it would be more than enough to complete this challenge.

### Azure CLI

[Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=25days_devto-blog-cxa) as a cross-platform tool helps manage Azure resources in a console terminal. Use [this link](https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest&WT.mc_id=25days_devto-blog-cxa) to install Azure CLI.

## Sample Solution Code

The sample solution used in this post can be found at [this GitHub repository](https://github.com/justinyoo/25-days-of-serverless).

## Resource Provisioning

In order to solve this challenge, first of all, you need to provision resources on Azure. Click the link below for provisioning.

[![Deploy to Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fjustinyoo%2F25-days-of-serverless%2Fmaster%2Fweek-4%2Fchallenge-22%2Fsrc%2FResources%2Fazuredeploy.json)

If you prefer to using [Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=25days_devto-blog-cxa), run the following command.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=az-group-deployment.sh

Once completed, you can find out all the resources correctly provisioned on Azure Portal.

![resource provisioning result](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-01.png)

## Azure Functions Managed Identity

In order to directly access Azure Key Vault from Azure Functions without performing explicit authentication/authorisation, check whether the `Managed Identity` feature is activated or not.

![managed identity](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-02.png)

## Azure Key Vault Access Policy

In order to manage secrets directly on the portal, with my account, the Access Policy needs to be updated. Go into the `Access policies` blade and click the `+ Add access policy` link.

![access poliocy blade](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-03.png)

Choose `Select all` for `Secret permissions`.

![secrets](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-04.png)

Enter your account name for `Select principal`.

![user](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-05.png)

Then click the `Add` button followed by the `Save` button on the screen. Now the Azure Key Vault instance allows my account for access.

## Secrets to Azure Key Vault

When Young-hee locked the door to hide Cheol-soo, she received a secret code.

> `DoYouKnow,soN,Bts,&pSy?`

We need to store it to the Azure Key Vault. Click the `Secrets` blade and the `+ Generate/Import` button.

![create secret](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-06.png)

Let's put `cheolsoo` into the `Name` field and the secret code into the `Value` field. Click the `Create` button at the bottom. Now, we've stored the secret into Azure Key Vault.

![secret created](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-07.png)

## Azure Function for Azure Key Vault Secret Backup

Here's the workflow to backup secrets from Azure Key Vault.

1. Get the list of secrets
2. Iterate the list and backup each secret individually
3. Create an array containing all the backup result
4. Serialise the array and upload it to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=25days_devto-blog-cxa)

Let's create the first workflow item – get the list of secrets. This method returns the list of secret names.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=secrets-get.cs

This method loops the list of secret names and backup each secret individually. At the time of this writing, as there is no bulk backup feature offered yet, we should run the loop. Once every secret is backed up, the method returns a list of backup results.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=secrets-backup.cs

This method serialises the backup results and uploads it to Azure Blob Storage. Spot on the backup filename of this format, `<yyyyMMdd>.json`.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=blob-upload.cs

Now, we've got all the workflow features. Let's create an HTTP trigger function and put the workflow inside.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=trigger-backup.cs

We're ready to run the HTTP trigger. Let's run this on our local development environment. In order to use the [Managed Identity](https://docs.microsoft.com/azure/app-service/overview-managed-identity?tabs=dotnet&WT.mc_id=25days_devto-blog-cxa) feature on the local, we need to, first of all, [login to Azure](https://docs.microsoft.com/samples/azure-samples/app-service-msi-keyvault-dotnet/keyvault-msi-appservice-sample/?WT.mc_id=25days_devto-blog-cxa#step-5-run-the-application-on-your-local-development-machine) via [Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=25days_devto-blog-cxa). Once logged in, run the debugging mode on Visual Studio Code.

![debug backup](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-08.png)

Use [Postman](https://getpostman.com/) to call the endpoint, and it will show the result.

![postman backup](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-09.png)

And this result can also be found on Azure Blob Storage.

![storage explorer backup](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-10.png)

We managed to help Young-hee backup Azure Key Vault before the grim reaper destroys it. Time is running out! Let's move on! The grim reaper is storming in!

## Azure Function for Azure Key Vault Secret Restore

Here's the workflow to backup secrets to Azure Key Vault.

1. Get the timestamp of the backup
2. Download backup from Azure Blob Storage with the timestamp
3. Deserialise the backup
4. Restore the backup to a new Azure Key Vault instance

We know the timestamp format, `yyyyMMdd`. It is passed through the URL of the HTTP trigger. This method downloads the backup with the timestamp and deserialises it to a list, and return the list.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=blob-download.cs

This method iterates the list of backup secrets, and each backup secret is restored individually within the loop. Similar to the backup, there is no bulk restore feature supported, at this time of the writing.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=secrets-restore.cs

Now, we got the whole workflow for restore. Let's create the HTTP trigger to run them all.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=trigger-restore.cs

We have the HTTP trigger for restore. Let's run it locally. With the debug mode of Visual Studio Code, calling the endpoint through [Postman](https://getpostman.com/) shows the result.

![postman restore](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-11.png)

The new Azure Key Vault instance show the restored result.

![keyvault restore](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/challenge-12.png)

Phew! We got this! Young-hee has now been able to backup and restore Azure Key Vault. The grim reaper can no more take Cheol-soo, nor scrap the Key Vault. Soon the Sun is rising, the grim reaper must leave, and Young-hee can now go to sleep. So can you. We will see you tomorrow with another challenge!

* * *

Want to submit your solution to this challenge? Build a solution locally and then [submit an issue](https://github.com/microsoft/25-days-of-serverless/issues/new?assignees=&labels=challenge-submission&template=challenge-solution-submission.md&title=%5BCHALLENGE+SUBMISSION%5D+). If your solution doesn't involve code, you can record a short video and submit it as a link in the issue description. Make sure to tell us which challenge the solution is for. We're excited to see what you build! Do you have comments or questions? Add them to the comments area below.

* * *

Watch for surprises all during December as we celebrate 25 Days of Serverless. Stay tuned here on dev.to as we feature challenges and solutions! Sign up for a [free account on Azure](https://azure.microsoft.com/free/?WT.mc_id=25days_devto-blog-cxa) to get ready for the challenges!
