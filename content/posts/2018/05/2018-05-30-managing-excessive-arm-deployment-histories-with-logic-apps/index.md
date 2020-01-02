---
title: "Managing Excessive ARM Deployment Histories with Logic Apps"
date: "2018-05-30"
slug: managing-excessive-arm-deployment-histories-with-logic-apps
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- arm
- arm-templates
- azure-logic-apps
- backup
- ci-cd
- deployment
- table-storage
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-00.jpg
---

When deploying Azure resources through ARM templates, you might be able to see the error message like below:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-01.png)

> New-AzureRmResourceGroupDeployment : Creating the deployment '[DEPLOYMENT\_NAME]' would exceed the quota of '800'. The current deployment count is '800', please delete some deployments before creating a new one. Please see https://aka.ms/arm-deploy for usage details.

In other words, each Azure Resource Group can only have up to 800 deployment history. This symptom is not unusual when the CI/CD pipeline is integrated into Azure Resource Groups. Therefore, when you face this situation, you must delete deployment histories. In this post, I'm going to show how you can remove all the deployment history programmatically, using Azure Logic Apps.

## Using Azure PowerShell

The typical approach to delete those deployment histories is to use Azure PowerShell. If you want to delete specific deployments, try this:

```powershell
Remove-AzureRmResourceGroupDeployment `
    -ResourceGroupName [RESOURCE_GROUP_NAME] `
    -Name [DEPLOYMENT_NAME] `
    -Verbose

```

But, this approach is only useful when you know the deployment name. If you don't know them, you can still try in this way:

```powershell
$deployments = Get-AzureRmResourceGroupDeployment -ResourceGroupName [RESOURCE_GROUP_NAME]

foreach ($deployment in $deployments) { `
    Remove-AzureRmResourceGroupDeployment `
        -ResourceGroupName [RESOURCE_GROUP_NAME] `
        -Name $deployment.DeploymentName `
        -Verbose `
}

```

As each deletion takes about 30 seconds to 1 minute, deleting the entire deployment history may take more than 6 hours. Yes, **6 HOURS**. It doesn't make sense to me at all. It is because the `foreach` loop in PowerShell takes care of each item in sequence order. If you use workflow, [the `foreach` loop can be run in parallel](https://docs.microsoft.com/powershell/module/psworkflow/about/about_foreach-parallel?view=powershell-5.1&WT.mc_id=devkimchicom-blog-juyoo). But it's still not convenient.

## Using Azure Logic Apps

Azure Logic Apps offers the [ARM connector](https://docs.microsoft.com/connectors/arm/?WT.mc_id=devkimchicom-blog-juyoo). With this, we can easily loop through all deployment histories and take further actions. Let's have a look.

First of all, we need to fetch all deployment histories. The image shows that this action gets all the list of deployment histories from the given subscription and resource group.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-02.png)

Now we have all deployment histories. Use the `ForEach` loop delete all histories. The `ForEach` loop natively runs items in parallel, which is very good for us. The default number of concurrency is 5, but we can change the number up to 50.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-03.png)

In the `ForEach` loop, put an action to delete deployment history from the give subscription and resource group.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-04.png)

That's basically it! Easy, huh? Let's run the Logic App.

## Observation

It runs really well. It deletes the deployment histories. By the way, when we run the logic app, you might be able to find out an interesting result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-05.png)

When we get all deployment histories, we expect 800 records. But it actually fetches only 86 - 90 results. I think it's intentional to avoid some performance downgrade. Therefore, in order to delete entire histories, fetching deployment histories needs to be run several times. Let's modify the Logic App.

## Updating Logic Apps - `Until` Loop

In order to get all the deployment histories, we need to run the fetching action several times. This can be done with the `Until` loop. First of all, implement the following action to initialise an indicator variable.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-06.png)

Then, add the `Until` loop and include the fetching action. The loop runs until the indicator value becomes `false`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-07.png)

The deleting action should be executed only if there are records. In addition to this, if there is no record populated, the indicator value should be set to `false`. The `Condition` action can do this. Right after the fetching action, add the condition that checks whether the result of the fetching action contains records or not. If there is no record (`false`), the indicator value is set to `false`. If there are records, loop through the records and delete them all as we did above.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-08.png)

This is it! Let's run the Logic App again and see what's happening. It runs really well. So, is it over? Of course not! We have one more thing to consider.

## Updating Logic Apps - Table Storage

Deleting itself works really well. But, should we just delete them all without backing them up? It's also a good idea to copy the deployment history to somewhere before deleting, for future auditing purpose. In order to achieve this scenario, let's introduce an Azure Table Storage. Before deleting each history, it needs to be stored to the Table Storage so that we can access the data later on.

Add a `Compose` action before the deleting action. This is merely to set up an object for Table Storage. As you can see the image below, each property, `partitionKey`, `rowKey` and `entity` represents each column of Table. The `entity` property is actually an object, and each property of the object becomes an individual column, which doesn't take an object type. Therefore, make sure that the `details` property takes a stringified JSON object, not the JSON object itself.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-09.png)

Once the dataset is ready, add another action to insert the data. It takes all the properties from the previous compose action.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-10.png)

It assumes that there is a table where the history data is backed up. In order to be more defensive, add extra a few actions to check whether the table exists or not, and, if it doesn't, create it.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-11.png)

That's all done now! Run the updated Logic App and see the result. It returns the empty array, which means there is no more deployment history left.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-12.png)

Also, there are back-up deployment histories found in Azure Table Storage.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-13.png)

More importantly, comparing to running PowerShell, it took only 15 to 16 minutes! **YES 16 MINUTES**. From 6 hours to 16 minutes!! How amazing!

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/05/managing-arm-deployment-histories-14.png)

* * *

So far, we have looked up how to back up the Azure resource deployment history and delete them not to exceed the maximum number of 800. This Logic App can be easily deployed by clicking this button below:

 [![](https://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Faliencube%2FARM-Deployment-History-Cleaner%2Fmaster%2Fazuredeploy.json) 

If you want to see the full ARM template source code, visit this repository, [ARM Deployment History Cleaner](https://github.com/aliencube/ARM-Deployment-History-Cleaner).
