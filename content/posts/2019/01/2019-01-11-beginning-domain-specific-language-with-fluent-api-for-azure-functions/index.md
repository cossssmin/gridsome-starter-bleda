---
title: "Beginning Domain Specific Language with Fluent API for Azure Functions"
date: "2019-01-11"
slug: beginning-domain-specific-language-with-fluent-api-for-azure-functions
description: ""
author: Justin-Yoo
tags:
- dotnet
- ddd
- domain-driven-development
- dsl
- domain-specific-language
- ubiquitous-language
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/domain-specific-language-101-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

Applying DDD (Domain-Driven Development) methodology to your project requires several concepts. [Ubiquitous Language (UL)](https://martinfowler.com/bliki/UbiquitousLanguage.html) and [Domain-Specific Language (DSL)](https://en.wikipedia.org/wiki/Domain-specific_language) are only a few of them. For all members in a domain context, including domain experts and developers, using the same language (and terminology) to avoid getting confused from each other is one of the key concepts of UL and, in spite of not exactly corresponding concept, DSL is a "sort of" implementation of achieving UL within the domain context. It sounds very easy but applying DSL is pretty tricky and needs a lot of helps from experts. In this post, I'm going to discuss how to write DSL using [Fluent API/Interface](https://www.martinfowler.com/bliki/FluentInterface.html) in an Azure Functions code. Very briefly.

> **NOTE**: I wrote a [blog post](https://devkimchi.com/2019/01/07/building-xsl-mapper-with-azure-functions/) about an XSL mapper function using DSL in a very rough level. If you want to see the complete code, please refer to the [repository](https://github.com/aliencube/AzureFunctions-XSL-Mapper).

## Why DSL?

There are two types of DSL – external and internal. As many articles have already covered what the differences between both, I'm not repeating here, but we use the term DSL here pointing to the internal DSL. DSL is used to describe business logic, within the domain context, by using UL. Fluent API helps write DSL quite easily. Also, DSL expresses the business logic, not the code implementations – it's useful for encapsulation. In addition to this, DSL simplifies UL at the code level, and describes roles and intentions of each method precisely. In fact, from the domain perspective, it doesn't have to know how each method works internally, but it needs to know how those methods are related to each other, to build up a workflow.

I mentioned Fluent API (or Fluent Interface) a few times above. In the C# world, using extension methods really helps build the Fluent API. Of course, abusing this will result in violating [Law of Demeter (LoD)](http://www.blackwasp.co.uk/LawOfDemeter.aspx), so it should be carefully taken. It's also a good idea to start from a very specific situation to cover, rather than building it with lots of generics.

## DSL for Domain Logic Workflow

OK. It's coding time. Let's have a look at the code below. Whenever you see my Function code, you always see this part as the first entry point.

https://gist.github.com/justinyoo/faa17ab46a8990b2b2db02c0e77fa4d1?file=endpoint.cs

One of benefits using Fluent API is readability. It literally describes the workflow "fluently" by method chaining. Therefore, you can easily imagine what will happen when you run the code, just by reading the code. First of all, when the function is called, 1) it creates the service locator factory instance, `IFunctionFactory`, 2) the factory creates the function instance, `IXmlToXmlMapperFunction`, and 3) the function instance invokes the `InvokeAsync` method to process the request and return the response, which is a simple workflow. As you can see, Fluent API has implement all the workflow.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/domain-specific-language-101-01.png)

Also, the method names used here are like `Create` and `InvokeAsync`, which is pretty intuitive to understand their roles and responsibilities. I can darely say I have implemented UL by writing DSL. However, this approach has a rabbit hole. It may violate LoD. Within the method chaining, moving one from the other might result in the `NullReferenceException` error and this should really require defensive coding; otherwise the code might smell.

How can we write DSL, not violating LoD, with Fluent API? Let's have another example below. The `InvokeAsync` method of the `XmlToXmlMapperFunction` class contains the workflow – 1) it loads an XSLT file, 2) it loads DLL files that the XSL file refers to, 3) it loads the XML document to transform, and 4) it returns a transformed XML document.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/domain-specific-language-101-02.png)

The function class has the `IXmlTransformHelper` instance that contains 1) `LoadXslAsync`, 2) `AddArgumentsAsync`, and 3) `TransformAsync` methods. The code looks like:

https://gist.github.com/justinyoo/faa17ab46a8990b2b2db02c0e77fa4d1?file=function.cs

All those methods actually returns the instance itself, `IXmlTransformHelper`. Therefore, regardless of what happens inside the method, it returns the same return value and doesn't go out of scope, which satisfies LoD. It also keeps readability by having self-descriptive method names. If another method chaining is required, due to the business logic changes, it still conforms OCP (Open-Closed Principle) as each method returns the instance itself. This is one of considerations for DSL. If any small changes breaks DSL and/or method chaining, it will really be frustrating.

Here's another consideration. Each method here supports `async`/`await`. In other words, each method actually returns `Task<IXmlTransformHelper>` instead of `IXmlTransformHelper`. However, each method actually takes `IXmlTransformHelper` inatance. How can it be done? Here's the trick. Let's have a look at the extension method, `AddArgumentsAsync` below:

https://gist.github.com/justinyoo/faa17ab46a8990b2b2db02c0e77fa4d1?file=extension-method.cs

This extension method wraps the `IXmlTransformHelper.AddARgumentsAsync()` method. It gets the `Task<IXmlTransformHelper>` instance as a primary parameter and rips the `Task<>` part and invokes the actual method. Writing extension methods like this way brings much easier ways when constructing method chaining and we can get prepared for different situations with flexibility.

## Is DSL Silver Bullet?

So far, we've briefly looked how we can build DSL using Fluent API, in Azure Functions. Someone may understand that DSL solves all the problems by making code succinct and simple. However, that's not true. DSL can't be coming out this easy way. Also not all situations does DSL works well. All we can do in the domain context is to, first of all, define UL, and build objects based on that UL. When the time comes, you will find out DSL becomes necessary and start refactoring your code.

The DSL code above are also not perfect. DSL should be continuously improving to get such flexibility. I hope this post gives a little bit of idea about using DSL in your domain.
