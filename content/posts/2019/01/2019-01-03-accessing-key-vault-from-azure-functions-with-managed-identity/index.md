---
title: "Accessing Key Vault from Azure Functions with Managed Identity"
date: "2019-01-03"
slug: accessing-key-vault-from-azure-functions-with-managed-identity
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-key-vault
- dependency-injection
- di
- managed-identity
- managed-service-identity
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/accessing-key-vault-from-azure-functions-with-managed-identity-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

In my [previous post](https://devkimchi.com/2018/10/24/accessing-key-vault-from-logic-apps-with-managed-identity/), we discussed how [Azure Logic App](https://azure.microsoft.com/en-us/services/logic-apps/) can access to [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/). Now in this post, I'm going to talk about how [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) can access to Key Vault directly using [Managed Identity](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview).

> All sample codes used in this post can be found at [here](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps).

## Enabling Managed Identity on Azure Functions

Both Logic Apps and Functions supports Managed Identity out-of-the-box. In other words, instance itself works as a [service principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals) so that we can directly assign roles onto the instance to access to Key Vault. This is very simple. Just follow this [official document](https://docs.microsoft.com/en-us/azure/app-service/overview-managed-identity) and you will be able to enable Managed Identity feature. Here in this post, I'm not going to discuss too much on this.

## Accessing to Key Vault from Azure Functions

According to the document previously mentioned, the code snippet for Key Vault might look like:

https://gist.github.com/justinyoo/3ae0b1e3d47454b9ed6f9fb4290e1cae?file=get-secret.cs

Once you get the `secret`, you can do whatever you need. That's easy. Actually this is it. But we can do some more. Let's have a look.

## Adding Dependency Injection

As you can see, basically we use `KeyVaultClient` class that internally uses `HttpClient` class. Therefore, we can register this as a singleton instance through IoC container. If you want to use IoC container in Azure Functions, you better to use [this package library](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.DependencyInjection/). Here's how we can register singleton instance.

https://gist.github.com/justinyoo/3ae0b1e3d47454b9ed6f9fb4290e1cae?file=appmodule.cs

Then, use the `IFunctionFactory` instance to manage all dependencies. Here's the code at the function level.

https://gist.github.com/justinyoo/3ae0b1e3d47454b9ed6f9fb4290e1cae?file=get-secret-function.cs

`IKeyVaultClient` has been registered as a singleton instance and this is simply used in each function level.

* * *

So far, we have walked through how we can directly access to Key Vault from Azure Functions using Managed Identity, as well as how we can make use of dependency injection for this feature. In fact, we don't have to use dependency injection as mentioned earlier. However, usually business doesn't only require Key Vault access itself, but also has other requirements like this post, [AutoMapper Dependency Injection into Azure Functions](https://devkimchi.com/2019/01/02/automapper-di-into-azure-functions/). Therefore, using dependency injection for `KeyVaultClient` would be very handy. It also gives much flexibility for testing and modularising. In the next post, let's discuss how we can create more value with this Key Vault access from Azure Functions.
