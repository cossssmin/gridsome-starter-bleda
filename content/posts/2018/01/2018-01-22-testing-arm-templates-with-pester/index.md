---
title: "Testing ARM Templates with Pester"
date: "2018-01-22"
slug: testing-arm-templates-with-pester
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- arm-templates
- pester
- test
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/01/testing-arm-templates-with-pester-00.png
---

[ARM template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-overview) is a great tool for Azure resources deployment. However, it's very tricky to use because:

- It's a JSON object with massive number of lines,
- Its JSON structure is quite complex so that it's not that easy to read at a glance,
- It's hard to validate if there is a typo or not, and
- We only know if the resource deployment is successful at runtime.

What if we can validate and/or test the ARM template without actually deploying it? Fortunately, Azure PowerShell provides a cmdlet, `Test-AzureRmResourceGroupDeployment` for testing purpose. It allows us to verify the ARM template without actually deploying resources. In this post, we're going to walk through how we can use the `Test-AzureRmResourceGroupDeployment` cmdlet with [Pester](https://github.com/pester/Pester), the PowerShell testing and mocking framework.

## Using `Test-AzureRmResourceGroupDeployment`

Let's have a look at the ARM template below. It's a simple ARM template for [Azure Logic Apps](https://azure.microsoft.com/en-us/services/logic-apps/) deployment.

https://gist.github.com/justinyoo/65476e97d6c09b87bd656e964ec0ba23

This ARM template creates an empty Logic App instance. Deploying this with the `New-AzureRmResourceGroupDeployment` cmdlet is usually the way to validate/verify this ARM template. Using `Test-AzureRmResourceGroupDeployment` only returns messages when it has an error. Let's run the cmdlet:

https://gist.github.com/justinyoo/0437d4502b5fc03b99981323d98abdfa

As the ARM template above is valid and test is successful, which returns **NOTHING**.

### Problems

From this point, we only know that the ARM template deployment **ITSELF** will be successful. But, let's think about this. Even if the ARM template has been deployed successfully, we still can't guarantee that the deployed Azure resources are correctly configured or not. For example, with the ARM template above, the resource name is a concatenation of both parameters, `logicAppName1` and `logicAppName2`. How can we ensure this concatenation has been successful? If there are more parameters involved in those naming and other configurations, our lives would be more complicated. The `Test-AzureRmResourceGroupDeployment` doesn't give us any indication to sort out this situation. In many cases, composing ARM templates need many template functions like `concat()`, `parameters()`, `variables()`, `resourceId()` and so forth. What makes the composition worse is those template functions are nested, which possibly results in missing some of opening or closing parentheses, and single quotation marks at some stage.

Therefore, merely running `Test-AzureRmResourceGroupDeployment` won't help much for testing.

## Capturing Debug Messages

There's still a hope. If we use the debugging mode while running the cmdlet and capture those debugging messages, we might be able to get some clues. Let's change the PowerShell command:

https://gist.github.com/justinyoo/208e9f0d8a1b0677da1d727bc276e0c1

The first command is to change the debugging mode. Its default value is `SilentlyContinue`, which suppresses all the debugging messages from the screen. Therefore, we need to expose all the debugging messages while the cmdlet is running, by changing its value to `Continue`. Let's run this and we will be able to see massive lines of debugging messages. If we want to store those debugging messages to a variable, append the [output redirection operator](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_redirection), `5>&1` to the end like:

https://gist.github.com/justinyoo/103ded8b33c49407c50c946f30adea14

Now, the `$output` has all lines of debugging messages. Print out each line, `$output[INDEX]`, and we'll be able to find out the 33rd message like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/01/testing-arm-templates-with-pester-01.png)

It starts with `HTTP RESPONSE` and its response body is actually a JSON string. Therefore, let's pickup the JSON string as an object.

https://gist.github.com/justinyoo/febc9e8a8e8c72f98731c611f2d370d0

OK. Now we have a proper output message. How can we use this for testing? Let's move on.

## Testing with Pester

[Pester](https://github.com/pester/Pester) is a testing and mocking framework for PowerShell. As it contains a BDD style test runner, it's easy to use.

> If we are using Windows 10, it's already installed out-of-the-box. But, according to the [official document](https://github.com/pester/Pester/wiki/Installation-and-Update), it's strongly recommended to update it before use.

Let's write a script to test ARM template deployment.

https://gist.github.com/justinyoo/3912ea5466adc31dc35d5aae5af00309

The first Context tests whether the cmdlet throws an exception or not, when parameters are not passed. The next one tests whether the Logic App instance name is correctly set or not. With Pester, we can run the test like:

https://gist.github.com/justinyoo/100cdd39d976fbef004b7a99e9cc04b6

Now, we can confirm that all tests have been passed.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/01/testing-arm-templates-with-pester-02.png)

## Integrating CI/CD Pipelines

If we're using [VSTS](https://www.visualstudio.com/team-services/), it's pretty straightforward – use [Azure PowerShell Task](https://github.com/Microsoft/vsts-tasks/tree/master/Tasks/AzurePowerShell). It would be even easier with the [Pester extension](https://marketplace.visualstudio.com/items?itemName=petergroenewegen.PeterGroenewegen-Xpirit-Vsts-Build-Pester). If we're not using VSTS, it's doubtful that it has such feature. In this case, we must login to Azure Resource Manager first, using a service principal. Then add the PowerShell script stated right above. Now, our CI/CD pipeline picks up the change and triggers the Azure PowerShell task to run this test. Too easy!

* * *

So far, we have walked through how to test ARM template deployment without actually deploying it, using Pester, which is an awesome tool for our PowerShell scripting. With this, we can test how ARM template deployment works, and what sort of results we can expect after the run. Therefore, we might be able to build more robust ARM templates.

> ACKNOWLEDGEMENT: This post has originally been posted at [Mexia blog](https://blog.mexia.com.au/testing-arm-templates-with-pester).
