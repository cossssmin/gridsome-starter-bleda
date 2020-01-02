---
title: "Azure Functions SRE on Azure DevOps, The First Cut"
date: "2019-08-14"
slug: azure-functions-sre-on-azure-devops-the-first-cut
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- azure-functions
- devops
- sre
- walking-skeleton
- unit-testing
- integration-testing
- end-to-end-testing
- site-reliability-engineering
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-00.png
---

You may have heard of the term, "Walking Skeleton" if you work with the agile methodology. [Alistair Cockburn](http://alistair.cockburn.us/Walking+skeleton) defines the term "Walking Skeleton" in his article:

> A Walking Skeleton is a tiny implementation of the system that performs a small end-to-end function. It need not use the final architecture, but it should link together the main architectural components. The architecture and the functionality can then evolve in parallel.

This concept is very important, from the DevOps or [SRE (Site Reliability Engineering)](https://en.wikipedia.org/wiki/Site_Reliability_Engineering) point of view, because we experience fail-fast and fail-often while building the system and testing it, before going live. Throughout this, we can also secure the system's stability and reliability.

Let me interpret the quote above in a different way. The concept of "Walking Skeleton" is to build a system/application first in a working condition, no matter it is all hard-coded or not. When the Walking Skeleton is ready, it has to be running in the entire ALM process. And it includes unit tests, integration tests and end-to-end tests with CI/CD pipelines. Once everything is OK in the pipelines, then the Walking Skeleton gets more "Flesh" by "Continuous Improvement". It sounds straightforward. In fact, it doesn't go well unless other supporting parties have everything ready for us. For example, setting up CI/CD pipelines requires system access permissions, service principal impersonations, cloud resource access permissions, etc. Although we have our system/application developed and ready, without those non-functional requirements, our delivery can't be done. Therefore, to minimise these hassles, all the DevOps/SRE related requirements have to be sorted out with the Walking Skeleton at the very early stage of the delivery.

As stated above, the first step of running the Walking Skeleton is to run different testing environments consistently in the CI/CD pipelines. This post shows how to build the Walking Skeleton of Azure Functions app with all testing scenarios, set up CI/CD pipelines on Azure DevOps, and complete the first cut of SRE requirements.

> Sample codes used in this post can be downloaded from [this GitHub repository](https://github.com/devkimchi/Mountebank-Integration-Testing).

## System High-level Architecture

In my [previous post](https://devkimchi.com/2019/08/07/azure-functions-integration-testing-with-mountebank/), we've already developed an Azure Function app and performed unit tests and integration tests. Here's the high-level architecture diagram of the Azure Functions app.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-01.png)

## Writing Unit Tests and Integration Tests

I showed both unit tests and integration tests in my [previous post](https://devkimchi.com/2019/08/07/azure-functions-integration-testing-with-mountebank/). Unit testing uses the dependency injection feature from Azure Functions library and integration testing uses [Mountebank](http://www.mbtest.org/) to perform tests. I'm not going to repeat here. Let's move onto the end-to-end (E2E) testing.

## Writing End-to-End Tests

Generally speaking, E2E testing comes with functional testing. Functional testing validates the acceptance criteria by manually running the application. If we can capture the functional testing scenarios in a coded way, they become a part of E2E testing, and we run them in the CI/CD pipelines. If we can mock external API dependencies, this E2E testing scenario can be a part of integration testing, too.

Now, here's the question. It sounds we re-use the same code base for both integration testing and E2E testing without modifying them. How can we achieve this? Let's have a look at the code below. `HealthCheckHttpTrigger` uses `LocalhostServerFixture` for integration testing.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-http-trigger.cs

Let's have a look at the `LocalhostServerFixture` class.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=mountebank-server-fixture.cs

As you can see the code above, it only works in the integration testing scenario. If we want to re-use this code for both integration and E2E testing, we need to refactor the `LocalhostServerFixture` class.

### `ServerFixture`

I use a simple [factory method pattern](https://en.wikipedia.org/wiki/Factory_method_pattern) for the refactoring exercise. Let's create a `ServerFixture` class. It declares the method, `CreateInstance(serverName)`, to create an instance, based on the server name passed.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=server-fixture.cs

Let's refactor the existing `LocalhostServerFixture` class.

### `LocalhostServerFixture`

`LocalhostServerFixture` now inherits `ServerFixture`. The existing `GetHealthCheckUrl()` method now has the `override` modifier.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=localhost-server-fixture-revised.cs

We've just completed refactoring `LocalhostServerFixture`. It's time to create another fixture class for the E2E tests.

### `FunctionAppServerFixture`

Let's create the `FunctionAppServerFixture` class that inherits `ServerFixture`, and implement the `GetHealthCheckUrl()` method to only return the endpoint URL. As you can see, the relevant information to compose the endpoint URL comes from the environment variables.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=functionapp-server-fixture.cs

Now, we've got `FunctionAppServerFixture` for E2E testing. Refactor the test code!

### `HealthCheckHttpTriggerTests`

First of all, we need to modify the `Init()` method of the `HealthCheckHttpTriggerTests` class. It gets the server name from the environment variable, which decides to create either `LocalhostServerFixture` for integration testing or `FunctionAppServerFixture` for E2E testing. In addition to that, we add another decorator, `TestCategory("E2E")`, on the test method for E2E testing.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=health-check-http-trigger-tests-revised.cs

Now, we've got the test code that is used for both integration tests and E2E tests. Let's run the tests in our local development environment.

## Run Integration Tests

Based on the instruction from my [previous post](https://devkimchi.com/2019/08/07/azure-functions-integration-testing-with-mountebank/), run the Mountebank server and the Azure Functions runtime locally, then execute the command below for integration tests.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-dotnet-cli.sh

Our refactored integration works just fine and here's the result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-02.png)

## Run End-to-End Tests

This time, we're running the E2E tests from our local machine. To do this, we assume that the Azure Functions app has already been deployed to Azure. Set up the environment like below. Don't get bothered of these key and name as they are not real.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=e2e-test-environment-variables.sh

The following command is to run the E2E tests.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=e2e-test-dotnet-cli.sh

As we implemented above, the E2E tests use `FunctionAppServerFixture` and here's the result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-03.png)

Now, we've got the `LocalhostServerFixture` class refactored, and both integration tests and E2E tests successfully run on our local machine.

## Compose Azure DevOps CI/CD Pipelines

Based on our successful local test runs, we're going to compose Azure CI/CD pipelines, as the last step of building the Walking Skeleton. Both unit tests and integration tests are placed within the build stage, and the E2E tests are placed within the release stage. The pipeline written in YAML uses the [Azure DevOps Multi-Stage Pipelines](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/) feature. You can see the whole pipeline structure from the [source code](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/build/build.yaml). I'm extracting some bits and pieces here for discussion.

### Unit Tests

This is the extraction of the unit tests steps from `build.yaml`.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=unit-test-build.yaml

1. `Unit Test Function App` task looks overwhelming. In overall, it's not that different from the test command above. Instead, it comes with a few more options.
    
    - `--filter`: This option filters out all tests not having either `TestCategory` of `Integration` nor `E2E`. In other words, with this filter, this task only performs unit tests.
    - `--logger`: This option has a value of `trx`, which exports the test results in the `.trx` format, which is used in Visual Studio.
    - `--results-directory`: This option sets the output directory of the test result.
    - `/p:CollectCoverage`: This option enables the code coverage analysis.
    - `/p:CoverletOutputFormat`: This option has a value of `cobertura`, which defines the output format of the code coverage.
    - `/p:CoverletOutput`: This option sets the output directory of the code coverage analysis result.
    
    In addition to this, this task has another attribute of `continueOnError` and its value of `true`. It forces the pipeline to continue, although this task fails (test fails).
    
2. `Save Unit Test Run Status` task stores the previous task status, whether it `Succeeded`, `Failed` or `SucceededWithIssues`, to `UnitTestRunStatus`.
3. `Publish Unit Test Results` task uploads the test result. As `trx` is used for the test result format, this task should select `VSTest` for the `testResultsFormat` attribute.
4. `Publish Code Coverage Results` task uploads the code coverage analysis report. As it uses the `cobertura` format, the `codeCoverageTool` attribute gets `cobertura` as its value.

That's it for the unit test pipeline setup. Let's move on to the integration test jobs on the pipeline.

### Integration Tests

This is the extraction of the integration test steps from `build.yaml`.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-build.yaml

1. `Integration Test Function App` task is the same as the one for unit tests, except all the code coverage analysis options. It also has the filter of `TestCategory=Integration` so that this task only takes care of integration test methods.
2. `Save Integration Test Run Status` task stores the integration test status to `IntegrationTestRunStatus`.
3. `Publish Integration Test Results` task uploads the test result to the pipeline.
4. `Cancel Pipeline on Test Run Failure` task is important. It looks for the value of `UnitTestRunStatus` and `IntegrationTestRunStatus`. If both unit tests and integration tests are successful, it lets the pipeline continue so that all artifacts are generated for release. If either unit tests or integration tests fail, it lets the pipeline stop and mark the pipeline as `Failed`.

Now we've got the integration test pipeline setup. E2E test is coming up.

### End-to-End Tests

E2E tests are performed after the application is deployed to Azure. Here are the steps for the E2E testing extracted from the pipeline. To use YAML for the release in the pipeline, [Multi-Stage Pipelines](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/) feature **MUST** be turned on. If you're interested in this feature, please have a look at my [the other post](https://devkimchi.com/2019/07/31/building-azure-devops-extension-on-azure-devops-6/).

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=e2e-test-build.yaml

1. `Run E2E Tests` task is similar to the other two test steps. Within the build stage, as tests are performed against the `.csproj` projects, we use `dotnet test ...` command, while in the release stage, we test against `.dll` files. Therefore, we should use the `dotnet vstest ...` command. Because of the command change, the options are also changed, even though they do the same thing.
    
    - `--testCaseFilter`: It's the same option as `--filter`. Set up the value to `TestCategory=E2E` so that only E2E tests are performed.
    - `--resultsDirectory`: It's the same option as `--results-directory`.
    
    Let's have a look at the environment variables part. For E2E testing, extra environment variables are required. Therefore, this task includes a few attributes under the `env` attribute.
    
2. `Save Test Run Status` task stores the test run status to the `TestRunStatus` variable.
3. `Publish E2E Test Results` task uploads the E2E test results to the pipeline.
4. `Cancel Pipeline on Test Run Failure` tasks checks the `TestResultStatus` value to determine the release stage has succeeded or not. If this value is `Failed` or `Canceled`, the pipeline itself is failed or cancelled respectively.

Now we've got all the pipeline details, including three different test runs. Let's run the pipeline. Once it's done, you can find out the high-level result view with each stage on the Summary tab.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-04.png)

This Tests tab articulates the test results from unit tests, integration tests and E2E tests.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-05.png)

This Code Coverage tab shows the code coverage analysis results. From this analysis, more unit tests need to be written (oops).

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-06.png)

* * *

So far, we've composed the Walking Skeleton for Azure Functions API through Azure DevOps. As mentioned at the beginning of this post, the Walking Skeleton is the minimal set as the working condition. In addition to this, in the automated CI/CD pipeline, all testing scenarios are running. Therefore, when we add more "Flesh" onto the Walking Skeleton over time, it only requires minimal efforts for the growth of the system/application, with extra testing scenarios. From the SRE perspective, automation is essential, and that automation should comprise almost everything. Now, our Walking Skeleton has got everything.

In fact, SRE is not only about automation, but also about the broader practice including monitoring, scaling and resiliency. But they are beyond this post. Once I have another chance, I'll discuss those topics too. I hope this post would help you start thinking of SRE experiences.

## What's Next?

- [Site Reliability Engineering](https://en.wikipedia.org/wiki/Site_Reliability_Engineering)
- [Book Review: Site Reliability Engineering](https://www.amazon.com.au/Site-Reliability-Engineering-Production-Systems-ebook/dp/B01DCPXKZ6)
- [What is Walking Skeleton?](https://devops.stackexchange.com/questions/712/what-is-a-walking-skeleton)
- [Factory Method Pattern](https://en.wikipedia.org/wiki/Factory_method_pattern)
- [.NET Core CLI – Test](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-test?tabs=netcore21)
- [.NET Core CLI – Test Configuration](https://github.com/microsoft/vstest-docs/blob/master/docs/configure.md)
- [.NET Core CLI – Test Filtering](https://github.com/microsoft/vstest-docs/blob/master/docs/filter.md)
- [.NET Core CLI – Test Reporting](https://github.com/microsoft/vstest-docs/blob/master/docs/report.md)
- [Azure DevOps Multi-Stage Pipelines](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/)
- [Azure Pipelines Conditions](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/conditions?view=azure-devops&tabs=yaml)
- [Azure Pipelines Expressions](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/expressions?view=azure-devops)
