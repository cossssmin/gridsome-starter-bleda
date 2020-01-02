---
title: "Backup & Restore Key Vault Secrets via Azure Functions"
date: "2019-11-26"
slug: backup-restore-key-vault-secrets-via-function-apps
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-key-vault
- azure-blob-storage
- backup
- restore
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-with-function-apps-00.png
---

In my [previous post](https://devkimchi.com/2019/11/21/backup-restore-key-vault-secrets-via-logic-apps/), we used [Azure Logic App](https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo) to backup and restore secrets in [Azure Key Vault](https://docs.microsoft.com/azure/key-vault/key-vault-overview?WT.mc_id=devkimchicom-blog-juyoo). Logic App is really easy to achieve the goal with bare minimum codes, or even without codes. On the other hand, there are clear requirements to build an application for the same feature. Therefore, in this post, I'm going to use [Azure Functions](https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo) to backup and restore Azure Key Vault secrets.

> The sample codes used in this post can be fount at this [GitHub repository](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample).

## Activating Managed Identity against Azure Function App

For easy access to the Azure Key Vault instance from Azure Functions app, it's crucial to enable the [Managed Identity](https://docs.microsoft.com/azure/app-service/overview-managed-identity?tabs=dotnet&WT.mc_id=devkimchicom-blog-juyoo) feature. As I wrote another [blog post](https://devkimchi.com/2019/01/03/accessing-key-vault-from-azure-functions-with-managed-identity/) about this, I'm not going to discuss further here.

## Workflow to Backup Secrets from Azure Key Vault

The workflow for Key Vault backup is the same as the [previous post](https://devkimchi.com/2019/11/21/backup-restore-key-vault-secrets-via-logic-apps/):

1. Get the list of secrets
2. Run the `for...each` loop and backup each secret within the loop
3. Generate an array containing the backup result
4. Serialise the array and upload it to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo)

Based on the workflow descrived above, the first method is to get the list of secrets. As you can see, the method returns the list of secret names.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=get-secrets.cs

The next method is to backup each secret, using the list of secrets. At the time of this writing, there's no bulk backup feature supported yet. Therefore, we need to run the loop like below:

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=backup-secrets.cs

We get the backup result as a list. Serialise the list and upload it to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo).

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=upload.cs

We got the whole working code bits. Let's put them all together in an HTTP trigger as a workflow.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=backup-trigger.cs

Let's verify whether the function endpoint works or not. In our local development environment, to use the [Managed Identity](https://docs.microsoft.com/azure/app-service/overview-managed-identity?tabs=dotnet&WT.mc_id=devkimchicom-blog-juyoo) feature, we need to [log in](https://docs.microsoft.com/samples/azure-samples/app-service-msi-keyvault-dotnet/keyvault-msi-appservice-sample/?WT.mc_id=devkimchicom-blog-juyoo#step-5-run-the-application-on-your-local-development-machine) through [Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=devkimchicom-blog-juyoo) first. Once logged in, run the debugging mode on the VS Code and check the result through [Postman](https://getpostman.com/). The expected result might be:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-with-function-apps-01.png)

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-with-function-apps-02.png)

The backup has been successfully stored into the local storage emulator, [Azurite](https://docs.microsoft.com/azure/storage/common/storage-use-azurite?WT.mc_id=devkimchicom-blog-juyoo).

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-with-function-apps-03.png)

So far, we've walked through how to backup [Azure Key Vault](https://docs.microsoft.com/azure/key-vault/key-vault-overview?WT.mc_id=devkimchicom-blog-juyoo) secrets into [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo), using [Azure Functions](https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo).

## Workflow to Restore Secrets to Azure Key Vault

The workflow described in the [previous post](https://devkimchi.com/2019/11/21/backup-restore-key-vault-secrets-via-logic-apps/) gets the whole list of backup files and picks up the latest one, then restore it to Key Vault. This time in this post, we specify the specific backup file for restore. Here's the workflow.

1. Get the timestamp to restore a backup file
2. Download the backup file from Azure Blob Storage
3. Deserialise the downloaded content
4. Restore the content to Azure Key Vault

The timestamp has the format of `yyyyMMdd`, and it's passed through the endpoint URL. The code that downloads the backup file, corresponding to the timestamp looks like:

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=download.cs

After deserialising the downloaded content, the method below loops through the content, which is basically a list.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=restore-secrets.cs

We've got the basic restoration logic. Let's build another HTTP trigger to embrace this workflow.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=restore-trigger.cs

When the trigger is run in [Postman](https://getpostman.com/), here's the result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-with-function-apps-04.png)

Those secrets are perfectly restored to the new Azure Key Vault instance.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-with-function-apps-05.png)

* * *

So far, we've discussed how to backup and restore Azure Key Vault secrets, and store them into or fetch them from Azure Blob Storage. The code snippets above are working example, but many parts were omitted for better readability. As we can download the sample source code [here in this repository](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample), let's practice them with your [Free Azure Account](https://azure.microsoft.com/free/?WT.mc_id=devkimchicom-github-juyoo).
