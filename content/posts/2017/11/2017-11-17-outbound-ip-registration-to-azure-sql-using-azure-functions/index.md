---
title: "Outbound IP Registration to Azure SQL Using Azure Functions"
date: "2017-11-17"
slug: outbound-ip-registration-to-azure-sql-using-azure-functions
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-webapp
- azure-functions
- azure-database-for-mysql
- azure-sql-database
- firewall
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2017/11/outbound-ip-registration-to-azure-sql-using-azure-functions-04.png
---

As [Azure SQL Database](https://azure.microsoft.com/en-us/services/sql-database/) is PaaS, it has its own firewall settings. Due to its white-listed nature, only traffic from registered IP addresses is allowed to access to the server instance. Of course, there is an option that the server allows all Azure resources to access to the server. However, this is not secure because there are chances that some malicious attacks come from other Azure resources. Therefore, registering only outbound IP addresses assigned to other Azure resources like Azure Web App instances is strongly recommended.

Interestingly, according to [this article](https://docs.microsoft.com/en-us/azure/mysql/howto-connect-webapp#solution-2---create-a-firewall-rule-to-explicitly-allow-outbound-ips), those outbound IP addresses, assigned to a specific Azure Web App instance, can change from time to time when the app instance is restarted or scaling happens. If those outbound IP addresses are updated, there is no way to let the Azure SQL Database server instance know unless manually updating them. I expected that Azure [Event Grid](https://azure.microsoft.com/en-us/services/event-grid/) would support this scenario, but at the time of this writing, apparently it's not yet possible. However, there is still a workaround, if we use Azure Functions. In this post, I'm going to show how to update the firewall rules on an Azure SQL Database instance, using Azure Functions and [Azure Fluent SDK](https://github.com/Azure/azure-libraries-for-net).

## Why Fluent SDK?

There is the [Azure SDK](https://github.com/Azure/azure-sdk-for-net) library and [Fluent SDK used to be a part of it](https://github.com/Azure/azure-sdk-for-net/tree/Fluent). From the functionality point of view both are the same as each other. However, Fluent SDK offers more succinct way of handling Azure resources, and provides better code readability. For example, this is how to get authenticated and authorised to access to Azure resources:

https://gist.github.com/justinyoo/f8a2df3f8bc38cc7f2fb3651fd28f8e0

Can you see how the code looks like? It looks dead simple, yeah? With this Fluent SDK, let's move on.

> The sample code used in this post can be found [here](https://github.com/devkimchi/Azure-Database-Firewall-Rules-Update-Sample).

## Building an HTTP Trigger

If I can draw a user story reflecting this scenario, it would be:

> - AS a DevOps engineer,
> - GIVEN the name of Azure Resource Group,
> - I WANT to retrieve all outbound IP addresses from Azure Web App instances and all firewall rules registered to Azure SQL Databases, from the resource group,
> - SO THAT new IP addresses are registered to the firewall rules, as well as unused ones are deleted from the firewall rule.

First of all, for local debugging purpose, it's always a good idea to start from an HTTP trigger. Let's create a simple HTTP trigger function like:

https://gist.github.com/justinyoo/8cd99c56fa7b433ab3040c54c85dbc6b

This is just a scaffolded function so it does nothing with Azure resources but leave logs onto the console. Let's put the basic authentication logic using Fluent SDK.

https://gist.github.com/justinyoo/91e1a0c4d115637961fe753049b9317c

There are a few spots noticeable.

1. Azure credentials are handled by `SdkContext` and Fluent API.
2. Azure context is handled by `Azure` and Fluent API.
3. All environment variables are converted to `Config`, a strongly-typed object.

The `Config` is a static instance that retrieves environment variables. You can still use `ConfigurationManager.AppSettings["KEY"]` for it, but the `ConfigurationManage` won't be a good idea when Azure Functions move forward to .NET Standard. So, it's much safer to use `Environment.GetEnvironmentVariable("KEY")`. Of course, this `Config` class and its properties might not need the `static` modifier, if you consider dependency injection. For the convenience sake, I'm sticking on the `static` nature, for now. Here's the code:

https://gist.github.com/justinyoo/67829ffceaee6533f9e65cdfb77e8490

Now, we need to get outbound IP addresses from web apps in a given resource group. Between the two log lines put several lines of code to retrieve all web app instances then all outbound IP addresses are fetched from there.

https://gist.github.com/justinyoo/20b333e928dedccc1d4046680b0b9ca4

Those IP addresses need to be registered to firewall settings on each Azure SQL Database instance. If there are discrepancies between outbound IP addresses and registered IP addresses, all unnecessary IPs should be removed from the firewall rules and only newly updated IP addresses should be added to the rule. Let's finish up the function code. Once all Azure SQL Database instances are populated, code loops through them. In the loop, all registered IP addresses are fetched and compared to the outbound IPs so that we know which IP addresses are to be removed and inserted.

https://gist.github.com/justinyoo/505379a4df1f071ded762f892d3e3f91

Yeah, the coding part is done. Now, let's run this on our local machine. The database instance has the following firewall rules – to allow all internal IPs from Azure resources (pointed by red arrow), one web app outbound IP (13.x.x.x) and one public IP (115.x.x.x) from my laptop.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/11/outbound-ip-registration-to-azure-sql-using-azure-functions-01.png)

Punch the F5 key and send an HTTP request through Postman. The function has run smoothly. Now we're expecting all the Azure internal IP addresses will be removed and my public IP will be removed, but the existing web app IP will remain.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/11/outbound-ip-registration-to-azure-sql-using-azure-functions-02.png)

Go back to the Azure Portal and check the firewall settings. As we expected, all internal Azure IP addresses have been blocked (pointed by red arrow), my public IP has been removed, and other outbound IPs have been registered.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/11/outbound-ip-registration-to-azure-sql-using-azure-functions-03.png)

Unfortunately, there is no SDK ready for Azure Database for MySQL at the time of this writing. Instead, in order to apply this approach for it, we should use [REST API](https://docs.microsoft.com/en-us/rest/api/mysql/) to register outbound IP addresses.

## Converting to a Timer Trigger

Once you confirm this works fine, you can simply copy and paste all the code bits into a timer trigger function so that this is triggered in a scheduled manner. The following code snippet says the timer function is triggered once a day at midnight in UTC.

https://gist.github.com/justinyoo/c0d341c96023c321367d3008d3e96ec3

* * *

So far, we have walked through how to check Azure Web App instances' outbound IP addresses regularly and register them into the firewall rules of Azure SQL Database instance. As I stated above, once Azure Event Grid is applied to Azure Web App, this would be much easier.
