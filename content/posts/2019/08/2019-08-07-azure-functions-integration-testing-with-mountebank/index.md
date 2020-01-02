---
title: "Azure Functions Integration Testing with Mountebank"
date: "2019-08-07"
slug: azure-functions-integration-testing-with-mountebank
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- azure-functions
- mountebank
- unit-testing
- integration-testing
- mocking
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/mountebank-integration-testing-00.png
---

In May at the [**//Build** event](https://www.microsoft.com/en-us/build), [Azure Functions](https://azure.microsoft.com/en-us/services/functions/) Team announced [supporting dependency injection feature](https://docs.microsoft.com/en-us/azure/azure-functions/functions-dotnet-dependency-injection). This was one of the long-waited features on Azure Functions, and we don't have to use some dodge way for dependency injections any longer. I wrote [a blog post about this](https://devkimchi.com/2019/02/22/performing-constructor-injections-on-azure-functions-v2/) in a few months back.

However, we still need more testing bits and pieces on Azure Functions like API endpoint testing that includes integration testing and external API connectivity testing. How can we achieve this, without having to deploy Azure Functions instance onto Azure? There are a few API mocking tools to make use of, and [Mountebank](http://www.mbtest.org/) is one of them. Throughout this post, I'm going to discuss an integration testing strategy with Mountebank, in our local development environment.

> You can find the sample codes used in this post at [this GitHub repository](https://github.com/devkimchi/Mountebank-Integration-Testing).

## System High-level Architecture

In this post, I'm going to develop an API application using Azure Functions. This API calls an external API to process data. As its first step, I'm going to create a health-check endpoint to validate API availability, as well as the external API's availability. Here's the high-level diagram describing this API application.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/mountebank-integration-testing-01.png)

My Azure Function API has the endpoint of `https://fncapp-mountebank/api/ping`, which calls the external API endpoint of `https://fncapp-one-api/api/ping` to confirm its availability.

## Implementing Endpoints

First of all, let's create our API health-check endpoint, [`HealthCheckHttpTrigger`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/src/FunctionApp/HealthCheckHttpTrigger.cs). As it doesn't have much business logic, we can write the code like below. For clarity, I only included the core logic here.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=health-check-http-trigger.cs

This trigger only calls the [`HealthCheckFunction`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/src/FunctionApp/Functions/HealthCheckFunction.cs) class that contains all the business logic. This trigger sends a request to the external API through the `HttpClient` instance and returns a response based on the API request.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=health-check-function.cs

> If you're interested in the `FunctionBase<ILogger>` class or the `IFunction<ILogger>` interface, they're from [Aliencube.AzureFunctions.Extensions.DependencyInjection](https://github.com/aliencube/AzureFunctions.Extensions/blob/dev/docs/dependency-injection.md) package.

So, we've got the endpoint for the health-check. Now, let's move onto the testing logic.

## Writing Unit Tests

I've got both [`HealthCheckHttpTriggerTests`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/test/FunctionApp.Tests/HealthCheckHttpTriggerTests.cs) and [`HealthCheckFunctionTests`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/test/FunctionApp.Tests/Functions/HealthCheckFunctionTests.cs) to unit-test against `HealthCheckHttpTrigger` and `HealthCheckFunction` respectively. I also used the [MSTest](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest) framework.

### `HealthCheckHttpTriggerTests`

In the sample codes, there are more than one tests, but I'm just putting only one unit-test code as an example.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=unit-test-http-trigger.cs

As you can see above, I mocked the `IHealthCheckFunction` interface to control dependencies. The trigger doesn't need to know how `HealthCheckFunction` works but is only interested in what it returns. Therefore mocking the interface like this is very common.

### `HealthCheckFunctionTests`

Now, `HealthCheckFunction` is the main player of my Azure Functions API. It contains the logic that directly talks to the external API. For convenience, I put only one test case here.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=unit-test-function.cs

Although we need to talk to the external API, at the unit-testing level, we don't need to worry about the external service connectivity. Instead, we also can mock the behaviour like above. I put the `FakeMessageHandler` instance into the instance of `HttpClient` to mock its response. Now we've got complete isolated unit-test cases. Let's run them.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=unit-test-dotnet-cli.sh

And we've got the successful test result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/mountebank-integration-testing-02.png)

> If you're curious of the option, `--filter:"TestCategory!=Integration&TestCategory!=E2E"`, I'll explain it later in this post.

## Writing Integration Tests

Unlike unit-tests that runs without connectivity to external resources, integration-tests need connectivity. In other words, the test codes should have control over the connection to external resources. While unit-tests manipulates the results from the external resources by mocking the codes, integration-tests doesn't change the code but manipulates the responses from the external API. Therefore, I should be able to call my Azure Functions API endpoint and mock the external API response payloads. It requires a few additional steps beforehand, by the way.

### Mountebank Setup

[Mountebank](http://www.mbtest.org/) is a cross-platform API mocking tool and installed via [`npm`](https://www.npmjs.com/package/mountebank). To install, run the following command.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=install-mountebank.sh

And to run Mountebank, execute the following command.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=run-mountebank.sh

If you want to know more about Mountebank, read [this page – getting started](http://www.mbtest.org/docs/gettingStarted). Fortunately, there's the .NET wrapper called, [MbDotNet](https://github.com/mattherman/MbDotNet). So, we can run Mountebank within our integration-testing code. Comprehensive usage can be found at [this document](https://github.com/mattherman/MbDotNet/wiki/Usage-Examples-(v4)).

### Writing Integration Tests

Integration-testing code is relatively simple, comparing to the unit-testing codes because there's no mocking at the code level. We can mock the API response payload, using `MbDotNet` Here's the entire testing codes: [`HealthCheckHttpTriggerTests`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/test/FunctionApp.Tests/HealthCheckHttpTriggerTests.cs).

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-http-trigger.cs

As you can see above, the test code calls the Azure Functions API endpoint, not external API. We should pay attention to the `MountebankServerFixture` class. Let's have a look.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=mountebank-server-fixture.cs

In the fixture class, the `GetHealthCheckUrl` method mocks the API responses and returns the Azure Functions API endpoint. You may notice that the integration-test method diverts the endpoint to the external API to the mocked API endpoint like the image below:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/mountebank-integration-testing-03.png)

### Running Integration Tests

The test code is ready. It's time to run the integration tests. To run the tests, the Azure Functions must be up and running, and so must the Mountebank server. Run the following command to run both Mountebank and Azure Functions instance in the local environment:

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=run-services-1.sh

The command above runs both Mountebank and Azure Functions runtime in the background. If you want to run both in their console respectively, open two consoles and run the command in each console.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=run-services-2.sh

Once running both services in separate console windows, here's the screenshot:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/mountebank-integration-testing-04.png)

All preps are done. Let's run the integration tests. Open another console window and run the following command for the tests.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-dotnet-cli.sh

You may pick up the option, `--filter:"TestCategory=Integration"`. We put the `TestCategory` decorator on a few test methods. With this filter, we only execute test methods having the category of `Integration`. Once they're run, we'll be able to see the screen below:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/mountebank-integration-testing-05.png)

> If you're keen on more reading for the `--filter` option, [this document](https://docs.microsoft.com/en-us/dotnet/core/testing/selective-unit-tests) and [this document](https://github.com/microsoft/vstest-docs/blob/master/docs/filter.md) would be worth checking.

The video clip below shows all the tests running without being filtered out.

<iframe width="560" height="315" src="https://www.youtube.com/embed/R-Uw3nkPKvo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

* * *

So far, we've discussed a few ways to run unit tests and integration tests in our local development environment. For integration testing, we need to have the environment ready for API mocking and run the Azure Function instance before the tests run.

The post shows the implementation first, followed by test codes. It might give you a different impression of why test codes are written later. But this depends on your approach. If you prefer either TDD or BDD, test codes come first, or at least at the same time of writing logics.

In the next post, I'm going to discuss running Azure Functions end-to-end tests and how it's possible in the Azure DevOps pipelines.

## More Readings

- [Use dependency injection in .NET Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-dotnet-dependency-injection)
- [Unit testing C# with MSTest and .NET Core](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest)
- [Running selective unit tests](https://docs.microsoft.com/en-us/dotnet/core/testing/selective-unit-tests)
- [TestCase filter](https://github.com/microsoft/vstest-docs/blob/master/docs/filter.md)
- [Aliencube.AzureFunctions.Extensions.DependencyInjection](https://github.com/aliencube/AzureFunctions.Extensions/blob/dev/docs/dependency-injection.md)
- [Mountebank](http://www.mbtest.org/)
- [Mountebank npm package](https://www.npmjs.com/package/mountebank)
- [MbDotNet](https://github.com/mattherman/MbDotNet)
- [MbDotNet usage v4](https://github.com/mattherman/MbDotNet/wiki/Usage-Examples-(v4))
