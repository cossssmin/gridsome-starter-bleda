---
title: "Building Logic App Custom Connector for Key Vault with Azure Functions V2"
date: "2019-01-05"
slug: building-logic-app-custom-connector-for-key-vault-with-azure-functions-v2
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-logic-apps
- azure-key-vault
- custom-connector
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-logic-app-custom-connector-for-key-vault-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

I wrote a [post](https://devkimchi.com/2018/10/24/accessing-key-vault-from-logic-apps-with-managed-identity/) quite a while ago, which discussed how to directly access to Azure Key Vault from Logic Apps. It's easy to build while it's only limited to Logic Apps. In [another post](https://devkimchi.com/2019/01/03/accessing-key-vault-from-azure-functions-with-managed-identity/), we discuss how to directly access to Key Vault from Azure Functions. Then what if we can access to Key Vault from Logic Apps, through Azure Functions? If we can do this, it could be more useful. Throughout this post, I'm going to build a custom connector for Logic Apps, using Azure Functions.

> The sample codes used here in this post can be found at [here](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps).

## Posts worth Reading

If you haven't read the series of my previous posts, please have a look. This is based on those posts.

- [Accessing Key Vault from Logic App with Managed Identity](https://devkimchi.com/2018/10/24/accessing-key-vault-from-logic-apps-with-managed-identity/)
- [Accessing Key Vault from Azure Functions with Managed Identity](https://devkimchi.com/2019/01/03/accessing-key-vault-from-azure-functions-with-managed-identity/)
- [AutoMapper Dependency Injection into Azure Functions](https://devkimchi.com/2019/01/02/automapper-di-into-azure-functions/)
- [Rendering Swagger Definitions through Azure Functions V2](https://devkimchi.com/2019/01/04/rendering-swagger-definitions-through-azure-functions-v2/)

## Writing ARM Templates

First of all, we need to write several ARM templates. These are Azure resources we need to use at least.

- [Azure Storage Account](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/StorageAccount.yaml)
- [Azure Key Vault](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/KeyVault.yaml)
- [Consumption Plan](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/ConsumptionPlan.yaml)
- [Azure Functions](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/FunctionApp.yaml)
- [Azure Custom API Connector](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/CustomApi-KeyVault.yaml)
- [Azure API Connection](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/ApiConnection-KeyVault.yaml)

These are optional.

- [Azure Application Insights](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/ApplicationInsights.yaml)
- [Azure Logic Apps test harness](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/LogicApp.yaml)

As it takes time to deploy all of above, this master template gives the one go.

- [Master template](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/azuredeploy.yaml)

> **NOTE**: If you are not familiar with ARM templates written in YAML, please have a look at this [post](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/).

Instead of running the master template, just simply click the button below and it will open up Azure Portal to deploy all the resources.

[![](https://camo.githubusercontent.com/8305b5cc13691600fbda2c857999c4153bee5e43/68747470733a2f2f617a7572656465706c6f792e6e65742f6465706c6f79627574746f6e2e706e67)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Faliencube%2FKey-Vault-Connector-for-Logic-Apps%2Fmaster%2Fazuredeploy.json)

Now, we've got all the Azure resources ready. Let's move on.

## Deploying Azure Functions Application

From the repository, deploy the Azure Functions application to the instance. From the previous step, if ARM templates have run properly, we should be able to check the Managed Identity feature enabled by identifying the `Object ID` value from the Portal.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-logic-app-custom-connector-for-key-vault-01.png)

## Confirming Access Policies from Azure Key Vault

Let's have a look at the access policies properly set up. Once the ARM templates have been properly deployed, all the policies should be set up.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-logic-app-custom-connector-for-key-vault-02.png)

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-logic-app-custom-connector-for-key-vault-03.png)

## Configuring Logic App Custom Connector

The custom connector ARM template should already defined Open API definition. But, in case that Swagger document has been updated, this update can be imported like below. [This post](https://devkimchi.com/2019/01/04/rendering-swagger-definitions-through-azure-functions-v2/) shows how to get Swagger definitions from the Azure Functions instance.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-logic-app-custom-connector-for-key-vault-04.png)

## Authenticating API Connection

In order to use the custom connector from Logic App, we need to authenticate the API connection. Although each endpoint uses its own access key, it would be efficient using the host key for the API connection so that all endpoints can be accessible through the API connection.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-logic-app-custom-connector-for-key-vault-05.png)

Now, all setup is done. Run the Logic App test harness to get the secrets from Key Vault through Azure Functions.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/building-logic-app-custom-connector-for-key-vault-06.png)

All good!

* * *

So far, we have built a Logic App custom connector to access to Key Vault through Azure Functions. Now we have two options for Logic Apps to access to Key Vault – another Logic App or custom connector. The choice is yours.
