---
title: "Azure Functions with IoC Container"
date: "2017-11-16"
slug: azure-functions-with-ioc-container
description: ""
author: Justin-Yoo
tags:
- dotnet
- azure-functions
- dependency-injection
- service-locator
- autofac
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2017/11/azure-functions-with-ioc-container-01.png
---

I've been talking about managing dependencies and unit testing in [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) quite a few times in those articles:

- [Is Your Serverless Application Testable? – Azure Functions](https://blog.kloud.com.au/2017/07/22/is-your-serverless-application-testable-azure-functions/)
- [Precompiled Azure Functions Revisited](https://blog.kloud.com.au/2017/05/03/precompiled-azure-functions-revisited/)
- [Testing Precompiled Azure Functions](https://blog.kloud.com.au/2017/01/20/testing-precompiled-azure-functions/)
- [Debugging Azure Functions in Our Local Box](https://blog.kloud.com.au/2016/12/02/debugging-azure-functions-in-our-local-box/)
- [Managing Dependencies in Azure Functions](https://blog.kloud.com.au/2016/11/21/managing-dependencies-in-azure-functions/)
- [Testing Azure Functions in Emulated Environment with ScriptCs](https://blog.kloud.com.au/2016/09/05/testing-azure-functions-in-emulated-environment-with-scriptcs/)

Throughout my articles, the [service locator pattern](https://msdn.microsoft.com/en-us/library/ff921142.aspx) always took the centre of dependency management. The combination of [Common Service Locator](https://www.nuget.org/packages/CommonServiceLocator/) and [Autofac](https://www.nuget.org/packages/Autofac/) certainly convinced me this would be the only way to handle dependencies for Azure Functions.

A few weeks back, I was asked to take a coding test before being engaged with a client. The topic was simple – given a JSON payload as a source of truth, I need to build an application to process the payload to display an instructed result. I, of course, decided to use Azure Functions to fulfill their requirements. Because the test itself was pretty straight forward, it could be done within a couple of hours with full of spaghetti code. However, they also wanted a sort of over-engineering including dependency injections, SOLID principles, unit testing, etc.

So, I started writing an Azure Functions application for it. As soon as I started, I realised that:

> "Why can't I upgrade my Autofac version? Is it because of the common service locator locks-in the Autofac version?"

This means that Azure Functions doesn't yet support assembly binding redirects out-of-the-box. [Apparently](https://github.com/Azure/azure-webjobs-sdk-script/pull/2042), it's possible for libraries used internally. However, this is not applied to my case, if my Azure Functions app has dependencies that need binding redirects. Even though, there is an [workaround](https://codopia.wordpress.com/2017/07/21/how-to-fix-the-assembly-binding-redirect-problem-in-azure-functions/) for this concern, I was reluctant using this approach for Autofac.

What if I can use Autofac directly, without relying on Common Service Locator? Can I do this? It would be worth trying, yeah? Let's move on.

> Here's my [coding test repository](https://github.com/justinyoo/agl-coding-test) as an example.

## No More `ServiceLocatorBuilder`

In my [previous post](https://blog.kloud.com.au/2017/07/22/is-your-serverless-application-testable-azure-functions/), I introduced `ServiceLocatorBuilder` for Autofac integration like:

https://gist.github.com/justinyoo/ad11d9188b8ddc467d50b4efa2458b48

This was called within `FunctionFactory` like:

https://gist.github.com/justinyoo/fd22aac8bb6c477f25314194e65bd741

It seemed to be redundant. I wasn't happy about that, but justified myself this would be the only way to do it. Now this is the time to rewrite. Let's do it.

## New `FunctionFactory`

In the constructor of the new `FunctionFactory` class, instantiate the `Autofac.IContainer` instance directly from `Autofac.ContainerBuilder.ContainerBuilder` instance. Then, within the `Create<TFunction>()` method, the given type of function instance is resolved directly from the `Autofac.IContainer` instance. Here's the code.

https://gist.github.com/justinyoo/7c94feb6d258c451130afaec2fd3ebee

## HttpTrigger with `FunctionFactory`

The basic usage is the same as the previous version of `FunctionFactory`. Simply create an instance and use it within the function method.

https://gist.github.com/justinyoo/5990c22a51a958d6fd3d420952f5aea8

With this approach, you don't need to use service locator pattern any longer for your dependency management. Hope this helps.
