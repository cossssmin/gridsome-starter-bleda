---
title: "Separation of Concerns: Logic App from ARM Template"
date: "2018-06-14"
slug: separation-of-concerns-logic-app-from-arm-template
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- arm-templates
- azure-logic-apps
- separation-of-concerns
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/separation-of-concerns-logic-app-from-arm-template-00.jpg
---

Azure Logic App is a set of workflow definitions, which is written in JSON format. The nature of JSON object results in this being tightly bound with ARM template. In other words, the Logic App has a dependency on an ARM template. Due to this characteristics, when any update is made on the workflow, the entire ARM template should be deployed over and over again. As we all know, an ARM template defines Azure resources as infrastructure, while the Logic App is an application defines a set of workflow.

One of software design principles, [Separation of Concerns (SoC)](https://en.wikipedia.org/wiki/Separation_of_concerns), depicts that individual software components take one responsiblity (or concern) so that each component should not impact on each other. From this point of view, a Logic App workflow definition and a Logic App instance defined by an ARM template are two different concerns. Therefore, they should be separated. In this post, I am going to show how to separate Logic App workflow from ARM template and deploy them respectively.

> The sample Logic App used for this post can be found at [here](https://github.com/devkimchi/Separating-Logic-App-from-ARM-Template).

## Anatomy of Logic App

A Logic App and its wrapping ARM template looks like this:

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=logic-app.json

The big JSON object mapped to the `properties` attribute is the very Logic App. It contains two major fields – `parameters` and `definition`. The `parameter` field works as a gateway to pass values from ARM template to Logic App. The `definition` field defines the actual workflow. Therefore, if we can extract these two fields from the ARM template, the problem will be solved. Let's do it.

## Writing Logic App

Here's the scenario. This Logic App is triggered by an HTTP request, then gets all the list of ARM template deployment history of the given resource group and returns the result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/separation-of-concerns-logic-app-from-arm-template-01.png)

The ARM template including the Logic App workflow might look like this:

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=azuredeploy-full.json

## Separating Logic App

From the ARM template above, extract the `parameters` and `definition` attributes and save them into separate files respectively.

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=parameters.json

When we look at `parameters.json` above, it contains some braced texts like `{subscriptionId}`, `{resourceGroup}`, `{connectorName}` and `{apiVersion}`. This is a placeholder for substitution so that each CI/CD pipelines can replace them with their own values.

Here is `definition.json` that defines the workflow. Mak sure that we cannot use `parameters` or `variables` from ARM template because this is no longer depending on the ARM template. But we can refer to the `parameters.json`.

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=definition.json

As a result, the existing ARM template will become like this:

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=azuredeploy.json

Now, the ARM template only takes care of deploying the Logic App instance. After getting this ARM template deployed, it will only have a blank Logic App. In fact, this is the screenshot of this ARM template deployment.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/separation-of-concerns-logic-app-from-arm-template-02.png)

We now have separated Logic App from ARM template.

## Deploy Logic App

This time, we need to deploy the Logic App workflow. `Set-AzureRmResource` is the cmdlet we should use for this. Let's see the PowerShell script below. First of all, it defines all the necessary variables, reads `parameters.json` and substitutes the placeholders with defined variables, and reads `definition.json`. Then it gets the existing Logic App details, updates its `parametres` and `definition` with values just read from the files, and saves the resource back to Azure.

https://gist.github.com/justinyoo/0f1bf2d5776717afdb0afc2278b949d7

Once completed, check the Logic App through the Azure Portal. It has been updated. We can also confirm that the Logic App works as expected.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/06/separation-of-concerns-logic-app-from-arm-template-03.png)

## Considerations

As mentioned above, `definition.json` only accepts values defined by itself or from `parameters.json`. However, in most cases, `parameters.json` should interact with ARM template, but there is no way for now. In order to sort this out, we can use the `outputs` property from the ARM template. After the ARM template deployment, it returns whatever we defined in the `outputs` section.

* * *

So far, we have walked through how to extract Logic App workflow from ARM template to achieve the SoC design principle. By doing so, the existing ARM template only focuses on deploying infrastructure and we can only focus on the Logic App workflow in a separate file so that CI/CD pipelines can only pick up changes from the extracted ones.

As Logic Apps does not currently support this separating feature out-of-the-box, for now this would be the best approach. I hope this can be done within the Logic App sooner rather than later.

> This has been originally posted at [Mexia blog](https://blog.mexia.com.au/separation-of-concerns-logic-app-from-arm-template).
