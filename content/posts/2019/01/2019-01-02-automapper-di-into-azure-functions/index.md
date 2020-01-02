---
title: "AutoMapper Dependency Injection into Azure Functions"
date: "2019-01-02"
slug: automapper-di-into-azure-functions
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- azure-functions
- asp-net-core
- automapper
- dependency-injection
- di
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/automapper-in-azure-functions-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

Handling DTO (Data Transfer Object) is one of core tasks while developing an application especially to interact with database or external APIs. As you know, using DTO is particularly good for data encapsulation. In other words, we only expose data structure we want to share. [AutoMapper](https://automapper.org) really helps those DTO transformation. AutoMapper also supports ASP.NET Core's dependency injection feature out-of-the-box, which we can utilise in [Azure Functions](https://azure.microsoft.com/en-us/services/functions/). In this post, I'm going to show how to use AutoMapper DI in Azure Functions.

> The sample codes used here in this post can be found at [here](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps).

## AutoMapper Dependency Injection

The code used here is an Azure Function code that calls secret keys from [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/). Without using AutoMapper, the whole [`SecretBundle`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.keyvault.models.secretbundle) object will be returned to the API caller, which might not be nice. Instead of returning the `SecretBundle` object, returning a customised DTO containing only necessary information would be a good idea. Let's have a look at this code. The `SecretProfile` inheriting `Profile` defines mapping details.

https://gist.github.com/justinyoo/c20b518aeef74789469c764360076e38?file=profile.cs

This `SecretProfile` is registered through the `AddAutoMapper()` extension method, which looks for an assembly. By doing so, every single class inheriting `Profile` is automatically registered into the IoC container.

https://gist.github.com/justinyoo/c20b518aeef74789469c764360076e38?file=appmodule.cs

This Azure Functions code uses [`Aliencube.AzureFunctions.Extensions.DependencyInjection`](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.DependencyInjection/) for its dependency injection management.

## Injecting `IMapper` at the Function Level

After defining the IoC container like above, each function simply loads those dependencies and use them. The `IFunctionFactory` registers all the dependencies when the trigger is called. Then within the trigger, it invokes the `IGetSecretFunction` instance to run all the business logic, which is to retrieve secret keys from Azure Key Vault.

https://gist.github.com/justinyoo/c20b518aeef74789469c764360076e38?file=httptrigger.cs

The `GetSecretFunction` instance simply loads the `IMapper` instance and use it.

https://gist.github.com/justinyoo/c20b518aeef74789469c764360076e38?file=function.cs

* * *

So far, we have walked through how we can inject AutoMapper into Azure Functions. As you can see, Azure Functions seamlessly uses the DI feature from ASP.NET Core, so there is nothing really hard for it. All you need is to define mapping details and register them before use.
