---
title: "Performing Constructor Injections on Azure Functions V2"
date: "2019-02-22"
slug: performing-constructor-injections-on-azure-functions-v2
description: ""
author: Justin-Yoo
tags:
- dotnet
- azure-functions
- dependency-injection
- constructor-injection
- property-injection
- testability
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/getting-rid-of-static-modifier-from-azure-functions-00.png
---

> **DISCLAIMER**: This post is purely a personal opinion, not representing or affiliating my employer’s.

* * *

> **UPDATE (May 9, 2019)**: During the //Build event, [Jeff Hollan](https://twitter.com/jeffhollan) officially announced this dependency injection. Here's the official document: [https://docs.microsoft.com/en-us/azure/azure-functions/functions-dotnet-dependency-injection](https://docs.microsoft.com/en-us/azure/azure-functions/functions-dotnet-dependency-injection).

* * *

> **UPDATE (Marth 28, 2019)**: As of the current runtime version, `2.0.12353.0`, this constructor injection method has been pulled off for stabilisation purpose. Here's the conversation between myself and [Jeff Hollan](https://twitter.com/jeffhollan) from Azure Functions Team.

https://twitter.com/justinchronicle/status/1111157298737479680

https://twitter.com/jeffhollan/status/1111157642120978432

https://twitter.com/justinchronicle/status/1111159067823620096

https://twitter.com/jeffhollan/status/1111172701727551489

* * *

In January 2019, Azure Functions Team has released a new version of its runtime, `2.0.12265`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/getting-rid-of-static-modifier-from-azure-functions-01.png)

I wasn't able to believe what that meant at the first place.

> Does that mean we now can get rid of the infamous `static` modifier from both classes and methods?

In fact, [Fabio](https://twitter.com/codesapien) from Azure Functions Team showed a demo at [Ignite 2018](https://www.youtube.com/embed/9Ep6N4PtAxc?start=2506), so I wasn't that surprised at all but thought it would be a matter of time. Rather, I was more excited at the new beginning of Azure Functions runtime.

https://www.youtube.com/embed/9Ep6N4PtAxc?start=2506

Maybe it was just me who didn't pay too much attention on this. But, throughout this post, I'm going to walk through how we can chuck out the `static` modifier from the Functions code, and use a constructor for dependency injection.

> The sample code used in this post can be found at [here](https://github.com/devkimchi/Azure-Functions-Instance-Method-Sample).

## Writing Instance Method

In C#, classes, fields, properties or methods can have the `static` modifiers. If we put this, regardless the class is instantiated or not, we can directly access to those fields, properties or methods. On the other hand, without the `static` modifier, we can access to them only after the class is instantiated. We call the method of the instance as `Instance Method`. Constructors can only be useful when we define a class without the `static` modifier, with regards to dependency injections.

The problem that Azure Functions has been keeping so far is that Function classes always comes with the `static` modifier. That has forced each method in the class to have the same `static` modifier as well. This brought about a lot of headaches when considering dependency injections and, in order to sort out this issue, either property injections using a service locator or method injections using custom binding extensions was introduced and these were, in general, not very recommended unless necessary.

Now, the new Azure Functions runtime enables to get rid of the `static` modifier. Let's have a look at the code below:

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=sample-http-trigger.cs

Does it look different? Maybe not. But, when you closely look at the class definition – between `public` and `class` – and method definition – between `public async` and `Task<IActionResult>`, there's no `static` modifier any more. Wow, how does this even work? Let's run the Function app. If it runs properly, it should stop at the debugging break point:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/getting-rid-of-static-modifier-from-azure-functions-02.png)

And its result will look like `Hello [NAME]`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/02/getting-rid-of-static-modifier-from-azure-functions-03.png)

It really is the instance method! This brings up massive implication that we can inject dependencies through constructors!

## Injecting Dependencies via Property

If you use the library, [Aliencube.AzureFunctions.Extensions.DependencyInjection](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.DependencyInjection/), property injection can be used. I wrote a [blog post](https://platform.deloitte.com.au/articles/dependency-injections-on-azure-functions-v2) around this property injection a while ago.

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=sample-http-trigger-1.cs

The `static` property implements the `FunctionFactory` class through the `IFunctionFactory` interface and it accepts `AppModule` instance as its dependency, which registers all dependencies. The `AppModule` class actually looks like this:

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=app-module.cs

Throughout `AppModule`, the `GetSamplesFunction` instance is registered as `IGetSamplesFunction` and the function method invokes it. Now, let's keep the same structure but just remove the `static` modifier.

## Injecting Dependencies via Constructor

The approach that new Azure Functions runtime takes is to use `StartUp` class, which is similar to what ASP.NET Core app does. There's no longer `AppModule` necessary. Let's have a look at the code below:

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=startup.cs

The `StartUp` class implements the `IWebJobStartup` interface, which only defines one method, `Configure(IWebjobBuilder builder)`. In addition to that, it uses the decorator, [`WebJobsStartupAttribute` targeting `AttributeTargets.Assembly`](https://github.com/Azure/azure-webjobs-sdk/blob/b9c8afd097ea270f693b1f1e897c14e27b838eec/src/Microsoft.Azure.WebJobs.Host/Hosting/WebJobsStartupAttribute.cs#L12), which registers dependencies as a part of starting up the host runtime. Let's see how dependencies are registered through the constructor.

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=sample-http-trigger-2.cs

The function method still keeps the existing structure, but substitutes the existing `static` property of `IFunctionFactory` with the constructor so that we can minimise the changes on the existing code-base.

## Unit Testing with Constructor Injection

Now, we know Azure Function allows constructor injection. Why does this really matter? Let's think of unit testing code. Even before the constructor injection being enabled, we were able to perform unit testing, but it was pretty ugly. Now, we have a constructor, which means the same unit testing can be done in more beautiful way. Let's have a look at the code below:

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=get-samples-http-trigger-test.cs

As the `SampleHttpTrigger` class doesn't have the `static` modifier any more, and it accepts a dependency through the constructor, we just simply mock the dependency, `IGetSamplesFunction` here in this example. This is not different from any other unit testing approach at all. Can you see how easy the unit testing is now?

## Azure Functions Keeps Growing!

So far, we've walked through how to use constructor injection for Azure Functions, without using the `static` modifier. Like Azure WebJobs, Azure Functions, that works very well at the low level like replacing very simple workload, has now evolved to provide more sophisticated features and better development experiences. It is now 1) testable by proper dependency injection that has been dealt in this post, 2) [deployable by providing container packaging](https://www.youtube.com/watch?v=iZX1O1WSzz4), and 3) [discoverable by Open API adoption](https://devkimchi.com/2019/02/02/introducing-swagger-ui-on-azure-functions/). With these three aspects, I'm expecting there will be more use cases that we have never seen before.

> This was originally posted at [Platform Engineering Blog](https://platform.deloitte.com.au/articles/performing-constructor-injections-on-azure-functions-v2).
