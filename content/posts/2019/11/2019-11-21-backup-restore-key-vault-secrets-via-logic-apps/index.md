---
title: "Backup & Restore Key Vault Secrets via Logic Apps"
date: "2019-11-21"
slug: backup-restore-key-vault-secrets-via-logic-apps
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-logic-apps
- azure-key-vault
- azure-blob-storage
- backup
- restore
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-00.png
---

There are always chances to backup and restore an [Azure Key Vault](https://docs.microsoft.com/azure/key-vault/key-vault-overview?WT.mc_id=devkimchicom-blog-juyoo) instance. At this time of writing, Key Vault doesn't support the bulk back-up of the whole keys/secrets/certificates in an instance, but only supports back-up individual keys/secrets/certificates. Generally speaking, one Key Vault instance stores multiple secrets. The individual back-up feature doesn't fit this case. With [Azure Event Grid](https://docs.microsoft.com/azure/event-grid/overview?WT.mc_id=devkimchicom-blog-juyoo), we can monitor [status change](https://docs.microsoft.com/azure/key-vault/event-grid-overview?WT.mc_id=devkimchicom-blog-juyoo) of each Key Vault secret. However, it's good for backup, not for restore. In this post, I'm going to use the [Azure Logic App](https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo) workflow and the [Managed Identity](https://docs.microsoft.com/azure/logic-apps/create-managed-service-identity?WT.mc_id=devkimchicom-blog-juyoo) feature, to backup and restore secrets stored in an Azure Key Vault instance.

> ARM Templates used in this post can be found at this [GitHub repository](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample).

## Workflow to Backup Secrets from Key Vault

Let's assume that a Key Vault instance to run back-up stores four secrets. Of course, in the real-world scenario, there will be a lot more than four, but as an example, the four secrets would be sufficient. As each secret keeps the change history, the Key Vault back-up/restore includes all the histories.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-01.png)

Let's create the workflow to back-up those secrets. First of all, we need a Logic App instance. Once it's created, activate the [Managed Identity](https://docs.microsoft.com/azure/logic-apps/create-managed-service-identity?WT.mc_id=devkimchicom-blog-juyoo) feature so that Key Vault instance can allow direct access to the Logic App instance.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-02.png)

After enabling the Managed Identity feature on the Logic App instance, it generates the `ObjectId` value. Use this value to apply the access policy onto the Logic App instance.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-03.png)

The first part of the workflow is the HTTP trigger. For now, we use the HTTP trigger, but if you want to run this workflow regularly, then change the trigger to Scheduler.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-04.png)

Let's add other actions to complete the workflow. As we're aiming to back-up all secrets in the Key Vault instance, each back-up secret should be added to an array object. Add the `InitializeVariable` action, give it the name of `BackupItems` and assign its data type to `Array`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-05.png)

The following action calls a RESTful API for Key Vault. There is a connector for Key Vault, but it doesn't support back-up and restore. Therefore, it would be a good idea to call the endpoint through the HTTP action directly. If you want to know more about this, please have a look at my other post, [Accessing Key Vault from Logic App with Managed Identity](https://devkimchi.com/2018/10/24/accessing-key-vault-from-logic-apps-with-managed-identity/).

- `URI`: The endpoint to fetch the list of secrets from Key Vault. Generally it looks like `https://[KEY_VAULT_NAME].vault.azure.net/secrets`.
- `Queries`: API version to call the API. The latest version we're using here is `7.0`.
- `Authentication`: Select `Managed Identity`.
- `Audience`: Enter `https://vault.azure.net`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-06.png)

The action above gets the list of secrets from Key Vault as an array. Therefore, loop the array with the `ForEach` action.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-07.png)

Within the loop, add another HTTP action to run back-up on each secret item. The result of the action is the response of the back-up.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-08.png)

The result of the action is added to the variable initially declared at the beginning.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-09.png)

Now, we got all the secrets backed up and added to the array. Let's run the following action to confirm the array.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-10.png)

Finally, store the array into the [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo) instance.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-11.png)

All the secrets from the Key Vault have now been stored to Azure Blob Storage.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-12.png)

So far, we've discussed the way to back-up Key Vault secrets to Azure Blob Storage in bulk.

## Workflow to Restore Secrets to Azure Key Vault

As we built the back-up workflow above, let's have a look at the restore workflow, which is not much different from the previous one. The main difference of restoration workflow is to consider how to take the latest back-up file from the list. I'm not going to discuss it further because the selection process has already been explained in my [previous post](https://devkimchi.com/2019/11/14/getting-the-latest-array-item-with-inline-script-in-logic-app/).

Like the Logic App instance for the back-up, once the instance is provisioned, the first thing would be to activate the [Managed Identity](https://docs.microsoft.com/azure/logic-apps/create-managed-service-identity?WT.mc_id=devkimchicom-blog-juyoo) feature. The second thing to do is to connect [Integration Account](https://docs.microsoft.com/azure/logic-apps/logic-apps-enterprise-integration-create-integration-account?WT.mc_id=devkimchicom-blog-juyoo) with the Logic App instance. Only after the Integration Account connection, we can use the [Inline JavaScript Code Action](https://docs.microsoft.com/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=devkimchicom-blog-juyoo).

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-13.png)

Let's add the workflow. First of all, add the HTTP Trigger.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-14.png)

The first action would be to fetch the list of back-up files from Azure Blob Storage, which is an array.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-16.png)

Then, this is the most crucial part of this workflow. From the back-up file list as an array, we need to pick up the latest one via the \[Inline JavaScript Code\] action. Here's the code snippet:

https://gist.github.com/justinyoo/9fe349aed14085321eaf48b14338dc9b?file=sort-action.js

How it works can be found at my [previous post](https://devkimchi.com/2019/11/14/getting-the-latest-array-item-with-inline-script-in-logic-app/).

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-17.png)

Once we get the latest back-up file, download the content from Azure Blob Storage through this action.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-18.png)

The downloaded content is encoded in base-64. Therefore, we should decode and convert it to a JSON object for the next action.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-19.png)

The converted JSON is an array of all secrets. Add the `ForEach` loop action for the array.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-20.png)

Inside the loop, add another HTTP action with the following details:

- `URI`: The URI to restore each secret item. It's generally `https://[KEY_VAULT_NAME].vault.azure.net/secrets/restore`.
- `Queries`: API version for request. The latest version for this call is `7.0`.
- `Authentication`: Select `Managed Identity`.
- `Audience`: Enter `https://vault.azure.net`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-21.png)

After restoring all the secrets, run the following action against the new Key Vault instance to fetch the restored secrets.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-22.png)

Now, we can confirm the secrets are all restored from Azure Blob Storage.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/11/backup-restore-key-vault-secrets-via-logic-apps-23.png)

So far, we've built a Logic App workflow to restore secrets from the back-up file stored in Azure Blob Storage.

## ARM Templates for Provisioning

If you want to quickly have a look at the complete resources used for this practice, there's an easy way. Download ARM templates from the [GitHub repository](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample) and run them in the following order.

1. Integration Account: [`integrationAccount.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/integrationAccount.json)
2. Azure Storage Account: [`storageAccount.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/storageAccount.json)
3. Azure Blob Storage Connector: [`connection.azureblob.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/connection.azureblob.json)
4. Azure Logic App for Backup: [`logicApp.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/logicApp.json)
5. Azure Logic App for Restore: [`logicApp.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/logicApp.json)
6. Azure Key Vault for Backup: [`keyVault.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/keyVault.json)
7. Azure Key Vault for Restore: [`keyVault.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/keyVault.json)

Use the following PowerShell script for the ARM template deployment.

https://gist.github.com/justinyoo/352b643439878367a9a3d44f1b808b07?file=new-azresourcegroupdeployment.txt

Once everything is provisioned, there's one more step. The Logic App instances are blank. Therefore, run the following PowerShell script again to add the workflow for both back-up and restore.

1. Backup: [`backup.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/LogicApps/backup.json)
2. Restore: [`restore.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/LogicApps/restore.json)

https://gist.github.com/justinyoo/352b643439878367a9a3d44f1b808b07?file=set-logicappworkflow.txt

* * *

So far, we've walked through how we can back-up secrets from an Azure Key Vault instance and restore them into another Key Vault instance, through a Logic App workflow. As it's not that complex, it would be really great if you have a run with your [free Azure account](https://azure.microsoft.com/free/?WT.mc_id=devkimchicom-github-juyoo) for your own time for practice.
