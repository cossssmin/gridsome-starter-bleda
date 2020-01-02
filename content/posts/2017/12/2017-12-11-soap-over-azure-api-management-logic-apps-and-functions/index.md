---
title: "SOAP over Azure API Management, Logic Apps and Functions"
date: "2017-12-11"
slug: soap-over-azure-api-management-logic-apps-and-functions
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-api-management
- azure-functions
- azure-logic-apps
- soap
- wsdl
- wcf
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/soap-over-azure-api-management-logic-apps-and-functions-00.png
---

> ACKNOWLEDGEMENT: This has been originally posted on [Mexia blog](https://blog.mexia.com.au/soap-over-azure-api-management-logic-apps-and-functions)

When we work for a service integration project for a customer's information systems, not all systems use cutting-edge technologies. Rather, still many information systems use legacy ways to get integration works done. For example, some legacy applications still drop files to a designated folder so that other applications pick up those files periodically. On the other hand, other legacy applications support SOAP (Simple Object Access Protocol) based webservices. In .NET world, we can easily handle those SOAP webservices through WCF by creating service references. Now, everything has changed. We use Azure [API Management](https://azure.microsoft.com/en-us/services/api-management/), [Logic Apps](https://azure.microsoft.com/en-us/services/logic-apps/) and [Functions](https://azure.microsoft.com/en-us/services/functions/) for service integration more than ever.

## SOAP over API Management and Logic Apps

API Management supports [SOAP out-of-the-box using WSDL](https://docs.microsoft.com/en-us/azure/api-management/import-soap-api). However, we have to know that [API Management has some restrictions](https://docs.microsoft.com/en-us/azure/api-management/api-management-api-import-restrictions#wsdl) of using WSDL. In other words, some SOAP-based webservices having complex structure might not be suitable for using API Management.

![APIM - ??? - SOAP](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/soap-over-azure-api-management-logic-apps-and-functions-01.png)

What about Logic Apps? If we [create a custom connector and import WSDL through it](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-soap-connector-create-register), we can use SOAP webservices directly from the Logic App instances. However, there are still concerns around Logic Apps using SOAP-based webservices. As it uses API Management behind the scene, it has same restrictions that API Management has. Moreover, Logic Apps' [customer connector itself has limitations](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-limits-and-config#custom-connector-limits). Therefore, this also needs to be considered, when we design our integration architecture.

![LOGIC APPS - ??? - SOAP](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/soap-over-azure-api-management-logic-apps-and-functions-02.png)

Then we have the last one standing – Azure Functions. It's basically C# code, so we can easily refer to service references, which looks perfect. Let's have a look.

> The sample code used for this post can be found [here](https://github.com/devkimchi/Azure-Functions-SOAP-Sample).

## Analysing Service References

When we create a service reference proxy, it contains service client class inheriting [ClientBase](https://docs.microsoft.com/en-us/dotnet/api/system.servicemodel.clientbase-1). It also has several constructors taking no parameter, string parameters and instance parameters.

https://gist.github.com/justinyoo/7acc53954cc1a9960732a5634d7413a5

Except the first and last constructors, all other constructors take string parameters for binding and endpoint information, which are stored at `Web.config` or `App.config`. In fact, the configuration file looks like:

https://gist.github.com/justinyoo/5e4a2fac0a59bb93ce85312798a81675

Both `basicHttpBinding` and `endpoint` nodes are used for setting up the WCF service client. That's actually not possible for Azure Functions, because it doesn't have `Web.config` file! Wow, that's a kind of critical to use WCF in our Azure Function code, yeah?

Fortunately, the last constructor of the service client accepts both [`Binding`](https://docs.microsoft.com/en-us/dotnet/api/system.servicemodel.channels.binding) instance and [`EndpointAddress`](https://docs.microsoft.com/en-us/dotnet/api/system.servicemodel.endpointaddress) instance for its parameters. In other words, as long as we can create both instances and pass them to the service client as dependencies, we can still use WCF service references without the `Web.config` file.

## SOAP over Azure Functions

Let's have a look a the function code. We should note that there are `binding` and `endpoint` instances to instantiate WCF service client. This doesn't require the `system.serviceModel` node at `Web.config`, but only needs the actual endpoint URL that is defined in the application settings blade of the Azure Functions instance (equivalent to `local.settings.json` at our local development environment).

https://gist.github.com/justinyoo/dc7a6911de595db7f8d2453955354bd8

Based on the connection type, both binding instance and an appropriate [`BasicHttpSecurityMode`](https://docs.microsoft.com/en-us/dotnet/api/system.servicemodel.basichttpsecuritymode) value should be carefully chosen. In addition to this, if necessary, user credentials like username and password should be provided from app settings.

Once we implement this and run it, we can get an expected result like:

![REQUEST to AF through POSTMAN](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/soap-over-azure-api-management-logic-apps-and-functions-03.png)

## Service Client as Singleton Dependency

Now, we can send requests to SOAP webservices through Azure Functions. There's one more thing to keep in mind, from the implementation design perspective. As we can see, the WCF service client is just a proxy and majority of SOAP applications are monolithic. In other words, the service client is reusable over time so that it's always a good idea to register it within an IoC container, as a singleton instance. I have written many posts for dependency management in Azure Functions and [this is the most recent one](https://devkimchi.com/2017/11/16/azure-functions-with-ioc-container/) that is worth checking. Therefore, with this approach, the service client instance can be registered as a singleton and injected to functions, if necessary.

## Which One to Choose?

So far, we have discussed which Azure service is good to handle SOAP webservices. Here's a simple chart for comparison:

|                           | Logic Apps | API Management | Functions |
|---------------------------|:----------:|:--------------:|:---------:|
| Connector Limit           | x          | o              | o         |
| Complex Message Structure | x          | x              | o         |

- **Azure Logic Apps** has a connector limitation – number of connectors and number of requests per connector. So frequent access to SOAP webservice through Logic App wouldn't be ideal.
- **Azure API Management** has restrictions on complex SOAP message structure. As **Azure Logic Apps** relies on API Management, it also has the same restrictions.
- **Azure Functions** doesn't have a concept of connector and can directly use WCF proxy libraries, so it has virtually no limitation but requires heavy-lifted coding efforts.

From these perspective, we can choose an appropriate one for our integration application structure. So, have you decided what to choose?

* * *

After posting this, [Darrel Miller](https://twitter.com/darrel_miller) from Microsoft left comments worth noting:

https://twitter.com/justinchronicle/status/939997227069476865

https://twitter.com/darrel_miller/status/940000611835269120

https://twitter.com/justinchronicle/status/940009668235030529

https://twitter.com/darrel_miller/status/940010464272175104

https://twitter.com/darrel_miller/status/940010869496471552

Therefore, hopefully in January 2018, we might be able to expect something very exciting stuff around API Management and Logic Apps!
