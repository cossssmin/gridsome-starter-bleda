---
title: "Dependency Injections on Azure Functions V2"
date: "2018-04-07"
slug: dependency-injections-on-azure-functions-v2
description: ""
author: Justin-Yoo
tags:
- dotnet
- azure-functions
- v2
- dependency-injection
- ioc-container
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/04/dependency-injections-on-azure-functions-v2-00.png
---

Dependency Injections on Azure Functions is not that quite intuitive. I've written many blog posts about dependency management on Azure Functions to improve testability and [this was my latest one](https://devkimchi.com/2017/11/16/azure-functions-with-ioc-container/). However, they are mostly about V1, which supports .NET Framework. Azure Functions V2 is now on public preview and I'm going to write another post for DI on Azure Functions V2, by taking advantage of the simple dependency injection feature that ASP.NET Core provides out-of-the-box.

## The Problem

Due to the `static` nature of Azure Function triggers, it's not that easy to manage dependencies. If we can inject an IoC container itself, when an Azure Function instance is being loaded, this will be ideal. I am pretty sure that Azure Functions Team at Microsoft currently works hard to make this happen. In the meantime, we need to find out a workaround. One of the easiest and most popular workarounds is to use a `static` property on each trigger. This `static` property is basically an instance of an IoC container. Once the property gets instantiated, each function trigger resolves dependencies within the function.

## The Workaround – IoC Container from ASP.NET Core

When an ASP.NET Core application is up and running, it bootstraps all dependencies at first within the `StartUp` class using the `IServiceCollection` instance. This instance also has [some DI functions](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection) like `AddTransient()`, `AddScoped()`, and `AddSingleton()`. As Azure Functions V2 comes with ASP.NET Core, we can directly make use of this feature. The only difference is that, in Azure Functions, we have to bootstrap dependencies by ourselves. Let's have a look.

> The source code used in this post can be found [here](https://github.com/devkimchi/Azure-Functions-V2-Dependency-Injection-Sample).

### Scenario

I am asked to write an Azure Function code, given a username or organisation name on GitHub, to return the list of repositories. Let's simplify the user story here:

> AS a user, when I give a GitHub username or organisation name, I WANT TO see the list of GitHub repositories

In order to achieve this user story, I need to write an HTTP trigger function to send an HTTP request to a GitHub API. OK, first things first.

### HTTP Trigger Function

This is the HTTP trigger function, with all dependencies inside.

https://gist.github.com/justinyoo/d45286fcfae5dc440761a42faf0afe73

No good. I am not happy with that because the `HttpClient` should be injected from outside and there are a few things to be injected outside. This needs to be refactored. Let's change it. First of all, I need to add a static property of `IServiceProvider` to the trigger, which acts as an IoC container. By the way, the `IServiceProvider` should be instantiated by `IServiceCollection`. Therefore, it's a good idea to create a `ContainerBuilder` class to build it.

### Container Builder

This is the interface design. It accepts a module from outside, `RegisterModule()`, which contains all dependencies then build a container, `Build()`, to return `IServiceProvider`.

https://gist.github.com/justinyoo/ee49da835d29103060da5f0d02becaf8

Therefore, its implementation creates a new `IServiceCollection` instance, loads all dependencies from the `IModule`, then builds `IServiceProvider` instance, like below:

https://gist.github.com/justinyoo/1b6dc3f68ff6fda34ac73a9a878416d6

### Module

Then, how does the `IModule` works? From one trigger to another, they don't have the same dependencies at all. In order to keep the collection of dependencies as light as possible, modularising dependencies is a better practice. Let's have a look. The `IModule` interface defines one method, `Load()` and it takes one parameter of `IServiceCollection`.

https://gist.github.com/justinyoo/97d95098ba6755f3cf20903353372dc0

The `Module` class implements `IModule` and does nothing but works as a placeholder. This is a sort of base module which can be used, in case there is no suitable module found.

https://gist.github.com/justinyoo/a635df278a986a9116b018050e220f96

Another implementation of `IModule` is `CoreAppModule`, which loads an instance of `HttpClient` as a singleton. The reason why it should be registered as a singleton can be found [here](https://aspnetmonsters.com/2016/08/2016-08-27-httpclientwrong/).

https://gist.github.com/justinyoo/c7c32871f7bd170fd9355626063f8bbe

I've created the `ContainerBuilder` class above and it's ready to play. Let's refactor the existing trigger.

### HTTP Trigger Function – Refactored #1

The trigger function now needs to have a static property of `IServiceProvider` like:

https://gist.github.com/justinyoo/fce7529f4bd2bfd2d4afeae5e713cf12

Now, I can inject `HttpClient` instance into the trigger, which has become more testable. But I'm still not happy with the result. Why? Let's see the `requestUrl` variable. It's hard-coded. What if the endpoint URL is changed for some reason? It should be configurable by reading from either an environment variable or a separate settings files like `appsettings.json` which is a similar way to how an ASP.NET Core application does.

### Configurations

I have a `config.json` file that looks like:

https://gist.github.com/justinyoo/167ed5fdb9ed1da542c6618c6ed0abef

Its corresponding POCO class looks like:

https://gist.github.com/justinyoo/6fb1a22fd46ac28ba2ff259332ee7200

### Module – Refactored #1

ASP.NET Core supports a configuration builder OOTB, so I can just use it in the module class.

https://gist.github.com/justinyoo/3ea0365d7d3024ea78857017dff9b0fe

In this example, I just use the `AddJsonFile()` method, but other methods like `AddXmlFile()` or `AddEnvironmentVariables()` can be used depending on your preferences. Even I can [use YAML file](https://blog.kloud.com.au/2017/01/25/adding-yaml-settings-into-aspnet-core-apps/) for configuration settings. Now, the GitHub endpoint URL is all configurable.

### HTTP Trigger Function – Refactored #2

With this in mind, let's do another refactoring and this is the result:

https://gist.github.com/justinyoo/87b71ac2e6a5773f7325aa9067bf4dc2

For now it's a sort of working code with full testability. Therefore, the test code for this function might look like:

https://gist.github.com/justinyoo/1ed0f1033ea86e5d8bc4b1c723c7da0c

As you can see above, the static property has got a mocked instance, and the function parameters also have received the mocked ones for testing. This is how dependency injection approach is used for Azure Function triggers.

### Service Locator

However, this approach still imposes an issue – Service Provider Pattern, which is known as an [anti-pattern](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/). In the function trigger code refactored above, I explicitly resolved two instances.

https://gist.github.com/justinyoo/2d71040b736832330e34d8583a6d5916

From the caller's point of view, the function trigger in this case, it's not necessary to know which dependencies I need to resolve, but just run them. With this point, the function trigger needs more refactoring to hide dependency resolutions. This is also a good practice for encapsulation of features that should be hidden.

### Function Factory

Let's have a look at the interface design of `IFunctionFactory`.

https://gist.github.com/justinyoo/8723f00b107cce0cec7e9184b54907a1

It returns a function implementing the `IFunction` interface, which is also registered into the IoC container. What does `IFunction` do? All logics in the function trigger move into there. For example,

https://gist.github.com/justinyoo/dec45c3ddc6642d06a0cd84f1737714a

As you can see, all the logics resided in the function trigger has moved into the `CoreGitHubRepositoriesFunction` class. Now the implementation of the `IFunctionFactory` might look like:

https://gist.github.com/justinyoo/7eb150485b86d60969a5a28525f89529

This factory class firstly loads dependencies, then resolves a function with the given type when it's called.

### Module – Refactored #2

Now, I need to update the `CoreAppModule` class to register the `IFunction` instance.

https://gist.github.com/justinyoo/ea68d349fc3955154d71ce6b28d3144a

By doing so, all necessary dependencies have been registered into the IoC container.

### HTTP Trigger Function – Refactored #3

With these changes, let's refactor the function trigger again. Instead of directly using the `IServiceProvider` as a static property, it uses the `IFunctionFactory` this time.

https://gist.github.com/justinyoo/10abe76f492183df1b68d7fdc12455a5

What the function trigger needs to do is to pass parameters and invoke the function that contains all the logics. It doesn't have to know what's going on inside the function. Testing the function trigger gets much easier.

https://gist.github.com/justinyoo/bd395d00a24fd828e8be51575d01a877

Of course, all the logics also need to be tested, but it's much easier because they are **NOT** `static` classes any longer. I'm not going to show how to test the rest here. Instead, I'll let you test them.

### More Complex Dependency Injection Scenarios

Someone having hawk's eyes might have been wondering why I used `IGitHubRepositoriesFunction`, instead of `IFunction`. The dependency injection feature that ASP.NET Core provides is very simple. There is no control over multiple implementations with a same interface. For example, there might be multiple functions implementing the same `IFunction` interface like:

https://gist.github.com/justinyoo/014481a6d653ae89e9b2a8825b2e65cd

If I need to differentiate them from each other, the current workaround is to create another interfaces like `IFunctionABC`, `IFunctionPQR` and `IFunctionXYZ` inheriting `IFunction` and pass them, instead of directly using `IFunction`. Alternatively, I can write a custom logic around them.

There is another scenario. Functions tend to live in a same assembly, ie. a same `.dll` file. If I can scan a .dll file and automatically register all functions, it would be much easier. Unfortunately, this is not supported by ASP.NET Core either. If you really want to use those features, a 3rd-party library like [Autofac](https://autofac.org) needs to be considered. However, also unfortunately, it doesn't seem to get along with V2 yet.

Therefore, here's the suggestion. If you want to use the IoC container from the 3rd-party library, stay on V1. If you want to use the IoC container provided by ASP.NET Core, use V2.

* * *

So far, I've walked through how dependency injections are working on Azure Functions V2, with ASP.NET Core's DI feature. Obviously this is not an ideal solution yet and I know Azure Functions Team works [really hard](https://github.com/Azure/azure-webjobs-sdk/issues/1559) to [enable this feature](https://github.com/Azure/azure-webjobs-sdk/issues/1560) sooner rather than later. I hope this feature is released soon.

> ACKNOWLEDGEMENT: This post has originally been posted at [Mexia blog](https://blog.mexia.com.au/dependency-injections-on-azure-functions-v2).
