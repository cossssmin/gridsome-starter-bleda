---
title: "Terraforming Azure PaaS"
date: "2019-01-21"
slug: terraforming-azure-paas
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- arm-templates
- azure-functions
- azure-logic-apps
- azure-paas
- terraform
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/terraforming-azure-ipaas-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

[Terraform](https://www.terraform.io/) is a cloud infrastructure automation tool made by [HashiCorp](https://www.hashicorp.com/). Each cloud vendor has their own tool for infrastructure provisioning, and [Azure Resource Manager](https://docs.microsoft.com/en-us/azure/azure-resource-manager/) is the Azure-specific tooling by writing templates. But this is valid only for Azure. If we need to provision the same resource on AWS or GCP, we should use their proprietary toolings. Using each vendor's own tooling does make sense in one aspect, but this is clearly a repeating job. Why do we do the same infrastructure provisioning with different approach? Terraform shows an answer for this question. Terraform has vast number of providers from different cloud vendors that use the same script and syntax. This is the selling point of Terraform.

Unfortunately, most Terraform examples are targeting AWS. In other words, there are not many resource, other than the official documents, focusing on Azure. Even for Azure PaaS? It's hardly found. In this post, we're going to discuss how to provision Azure PaaS instances including Azure Functions and Logic Apps, using Terraform, and compare it to ARM templates.

> You can find the sample code at [this repository](https://github.com/devkimchi/Terraform-for-Azure-iPaaS-Sample).

## Writing Terraform Scripts

Terraform provides a very easy [Getting Started](https://learn.hashicorp.com/terraform/getting-started/install.html) document. Although this targets AWS VM provisioning, we can refer to [Azure provider](https://www.terraform.io/docs/providers/azurerm/index.html) as a starting point.

### Modularising Azure Resources

In order to create resources, it's always a good idea to modularise for each resource so that they are reusable. As we provision both Azure Functions and Logic Apps throughout this post, those resources are required at least:

- Resource Group
- Storage Account
- Consumption Plan
- Functions
- Logic Apps

In other words, we can split the provisioning scripts into five different modules. Each module is independently used whenever a new resource is requested. Also each module consists of `resource.tf` for resource definition, `variables.tf` for external variable definition, and `outputs.tf` for internal variable definition, for our convenience.

### Module: Resource Group

First of all, let's have a look at the module for Resource Group. It has three distinctive sessions – `provider`, `locals` and `resource`.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=resourcegroup.tf

- `provider` sets the version of Azure provider to provision Azure resources. Credentials can also be set here, but for now we only set the version.
- `locals` defines variables internally used in the module. External variables, `variables` are passed to `locals` and manipulate them for `resource` to use.
- `resource` defines actual Azure resource. This module defines a Resource Group. Note how variables are used. This section only uses `local.xxx` instead of `var.xxx`. There's no harm using `var.xxx`, but semantically using `looal.xxx` is more appropriate than `var.xxx`. Have a read of [this post](https://devkimchi.com/2018/06/19/arm-template-lifecycle-management-dos-and-donts/) that how `parameters` and `variables` in ARM templates are semantically used. The same rules apply.

Let's have a look at `variables.tf`. It only defines external variables, `variable`, that gets values from outside.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=variables.tf

In the Terraform world, there are only three different types of variables, `string`, `list`, `map`. All string, numeric and boolean values are defined as `string`. Then, they are internally converted to its appropriate types respectively. The `map` type is basically a collection of key-value pairs and the value always assumes `string` type. In other words, the `map` type doesn't support complex object as its value type.

Let's have a look at `outputs.tf`. In order to use module, the module should define several output values to return so that other modules can have reference to it. This is how the `outputs.tf` file is defined:

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=outputs.tf

Those `id`, `name`, and `location` values are referred by other resources, so the `outputs.tf` defines like above.

Now, we have resource group module defined. As other resources like Storage Account and Consumption Plan are very similar to the resource group definition, I'm not going further for them. But make sure that the module for Storage Account should define the output value for connection string and the module for Consumption Plan should have a definition for its resource ID value to return, which are referred by Function App module.

### Module: Azure Functions App

Let's define the Azure Function App resource. There's not much difference from the one for Resource Group.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=functionapp.tf

First of all, it defines the `provider` section, followed by the `locals` section, then the `resource` section. However, unlike the Resource Group definition, it has a bit more to define such as `site_config` and `app_settings`.

If you've been using ARM templates, you might be able to find the difference here. Web config and app settings are considered as another resource in ARM template, but Terraform doesn't think of that way. I'm not sure whether this is intentional, but this kind of discrepancy might bring about confusions to users at some stage.

> **NOTE**: If Azure Functions is hosted under Consumption Plan, the `always_on` value is always `true`. Therefore, it doesn't have to set up. But if you explicitly set this up, [it throws an error](https://github.com/terraform-providers/terraform-provider-azurerm/issues/1560#issuecomment-453724892). The official document says it's possible to set up, but it's not true. If you use App Service Plan, instead of Consumption Plan, it doesn't throw an error, by the way.

### Module: Azure Logic App

Let's define the Azure Logic App resource. Like the Resource Group module, the Logic App instance definition is relatively simple.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=logicapp.tf

This defines the Logic App instance. Of course this is a blank instance - no workflow definitions yet. Where should I define the workflow including a trigger and actions? For a trigger, we can use [`azurerm_logic_app_trigger_http_request`](https://www.terraform.io/docs/providers/azurerm/r/logic_app_trigger_http_request.html), [`azurerm_logic_app_trigger_recurrence`](https://www.terraform.io/docs/providers/azurerm/r/logic_app_trigger_recurrence.html), or [`azurerm_logic_app_trigger_custom`](https://www.terraform.io/docs/providers/azurerm/r/logic_app_trigger_custom.html), and for actions, we can use [`azurerm_logic_app_action_http`](https://www.terraform.io/docs/providers/azurerm/r/logic_app_action_http.html), or [`azurerm_logic_app_action_custom`](https://www.terraform.io/docs/providers/azurerm/r/logic_app_action_custom.html). As you can see there are only two pre-defined triggers – HTTP and Recurrence. However, there are more triggers than that, like API triggers. For those triggers, we have to use the custom trigger one. Here's a simple code using the custom trigger.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=logicapp-custom-trigger.tf

As you can see above, we either hard-code JSON string into the `body` attribute, or read a JSON file and assign it to the `body` attribute. Even if we set it up to read JSON from a file, the number of JSON file should be the number of actions. Now, I don't see any value using Terraform by importing JSON files.

Another issue that I observed is that there's no API connection definition on Terraform. In other words, we can't define those triggers through Terraform. Same rules apply to actions. The only pre-defined action is HTTP action. There are much more actions using API connections. We can't define them. Even worse, controllers such as `condition`, `switch`, `for-each` loop, `while` loop and `scope` definitions are not possible either.

Therefore, defining Logic App workflow through Terraform is simply not possible. Instead, define a Logic App instance through Terraform and define its workflow through PowerShell or Azure CLI. My post, [Separation of Concerns: Logic App from ARM Template](https://devkimchi.com/2018/06/14/separation-of-concerns-logic-app-from-arm-template/), briefly explains how to achieve this.

There are a few more things that Terraform can't define Logic App at this time of writing:

1. It's not possible to define Managed Identity,
2. It's not possible to define custom API connection, and
3. It's not possible to define Integration Account.

These are critical for Logic App workflow definition, but Terraform can't do this.

### Master Orchestrator

We've now got modules for Resource Group, Storage Account, Consumption Plan, Function App and Logic App. Let's define an orchestrator to deploy those modules at once.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=orchestrator.tf

- `locals` section creates new internal variables by composing `variables`. Those `local` variables are used within many `module` sections. As mentioned above, using `locals` instead of `variables` is much more semantic.
- Each `module` has the `source` attribute and it points to local directory. One of benefits using Terraform is this local resource reference because ARM template can't do this. For local development, this is particularly important. We don't need to upload modules to somewhere on the Internet. Of course for production deployment on the cloud, URL is better and more secure.
- All attributes other than `source` in each `module` are variables defined in each module.
- Each resource has a dependency on Resource Group. Therefore, the resource group name is referred as `module.resgrp.name`. Also, Function App instance has dependencies on Consumption Plan and Storage Account. Therefore, `module.csplan.id` and `module.st.connection_string` provides relevant information to the Function App.
- Due to these dependency relations, the Resource Group module is executed first, then Storage Account and Consumption Plan modules are run next, and finally Function App module is run at the last.
- The Logic App module has only one dependency onto the Resource Group, so it's run after the Resource Group.

Once the orchestrator is defined, run the command below:

```bash
terraform init

```

This download Azure Provider related execution file and stores it under the `.terraform/plugins` directory. Also all modules are downloaded and stored under the `.terraform/modules` directory. Run the following command:

```bash
terraform plan -var "resource_name=[RESOURCE_NAME]"

```

This verifies the resource definitions and what sort of changes are made before actually deploying resources. Once this is done, run the following command:

```bash
terraform apply -var "resource_name=[RESOURCE_NAME]" -auto-approve

```

This actually deploys resources onto Azure through Terraform. By adding the last `-auto-approve` option, this doesn't ask confirmation. Once it's run properly, you can find out those resources in the Resource Group.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/terraforming-azure-ipaas-01.png)

You might be finding an interesting fact. There's no deployment history! ARM template leaves logs in this `Deployments` blade, but Terraform doesn't. It can be a big benefits because [the number of deployment histories can't exceed 800](https://devkimchi.com/2018/05/30/managing-excessive-arm-deployment-histories-with-logic-apps/).

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/01/terraforming-azure-ipaas-02.png)

## Terraform vs ARM Template

So far, an Azure Functions app instance and Logic App instance have been created through Terraform. From this experience, what would you choose for your Azure PaaS infrastructure setup?

### Merits of Terraform

|                      | Terraform | ARM Template |
| -------------------- | --------- | ------------ |
| Readability          | High      | Low &ndash; It can be increased with [YAML and YARM CLI](https://devkimchi.com/2018/08/04/introducing-yarm-cli/) |
| Local File Reference | Possible  | Impossible |

### Demerits of Terraform

|                      | Terraform        | ARM Template         |
| -------------------- | ---------------- | -------------------- |
| Deployment History   | Need extra setup | Stored automatically |
| Provider Support     | Azure Provider update relatively slow | |
| PaaS Support         | Not matured enough |                    |
| Testing              | TerraTest &ndash; Go language only | PowerShell and Azure CLI |

I've listed up some merits and demerits using Terraform over ARM Template. If I am asked to use Terraform for Azure PaaS, I wouldn't definitely recommend it because of its immaturity with various reasons. Still disadvantages dominate advantages, from the Azure PaaS point of view. If you're setting up Azure IaaS like virtual machines, networks, etc, it **might** be a good choice, but certainly it's not for PaaS.
