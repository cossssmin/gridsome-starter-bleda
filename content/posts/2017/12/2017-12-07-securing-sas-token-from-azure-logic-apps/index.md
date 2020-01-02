---
title: "Securing SAS Token from Azure Logic Apps"
date: "2017-12-07"
slug: securing-sas-token-from-azure-logic-apps
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-api-management
- azure-functions
- azure-logic-apps
- sas-token
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-00.png
---

> ACKNOWLEDGEMENT: This has been originally posted on [https://blog.mexia.com.au/securing-sas-token-from-azure-logic-apps](https://blog.mexia.com.au/securing-sas-token-from-azure-logic-apps/)

When we are using Azure Logic Apps, especially HTTP trigger, their endpoint URLs are overwhelmingly long. Here is an example:

https://gist.github.com/justinyoo/a30b856b427cca7d4f4bc67cbab3d8e0?file=logic-app-endpoint.txt

The purpose of the SAS token used in the Logic Apps is for authentication and authorisation, which is good. But the problem is that this SAS token belongs to querystring. In other words, a bad guy out there can easily take the token and send requests for inappropriate purposes. Querystring itself is secure as long as we use HTTP connection. However, [the querystring can always be logged](http://blog.httpwatch.com/2009/02/20/how-secure-are-query-strings-over-https/), [regardless of the secure connection or not](https://stackoverflow.com/questions/893959/if-you-use-https-will-your-url-params-will-be-safe-from-sniffing). Therefore, it's always a good practice to hide sensitive information from the querystring as much as we can. Instead, it should be passed through request header.

Unfortunately, Azure Logic Apps currently doesn't support request header feature yet. Therefore, we might have to find a workaround to give more protection to Logic Apps. In this post, I'm going to show how to secure the SAS token using Azure API Management and Azure Functions Proxies.

## Preparing Logic App Instance - HTTP Trigger

First of all, we need a Logic App instance - an HTTP trigger. As this is just an example, it has a relatively simple workflow – whatever it receives through request body, it just returns the payload.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-01.png)

When we send an HTTP request through Postman, we will expect to see the result like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-02.png)

Nothing special, huh? Now, let's hide the SAS token from querystring.

## Using Azure API Management

Azure API Management offers policy management feature for comprehensive control over many registered APIs. Therefore, we can remove Logic Apps' SAS token from their querystring and put the token value into their request header through the policy management. It sounds somewhat complicating, but actually is not that hard. Let's have a look. In API Management, we can easily import Logic App HTTP trigger.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-03.png)

Select a Logic App instance you want to import, enter other details, URL suffix and products. Then click the _Create_ button. It's now imported. How easy!

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-04.png)

This import job does every dirty job for us. All we need to do now is to setup policy for the Logic App instance. Let's get into the API structure screen. We're only interested in both _Frontend_ and _Inbound processing_ tiles. Click the pencil icon of the _Frontend_ tile.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-05.png)

In the Headers tab, we need define a header key that accepts the SAS token value. You can call it whatever you think it's meaningful. Let's call it as `X-Sas-Token` for now. As this header key is mandatory for this API call, we must get the `required` box ticked. We don't need the actual value because we'll send it over HTTP request. Once everything is done, save it.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-06.png)

Now, we need to actually setup the inbound request processing policies. Click another pencil icon of the _Inbound processing_ tile. Actually, click the little triangle right next to the pencil and select the _Code editor_ menu.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-07.png)

Then we'll be able to see a set of policies written in XML. Look at the `rewrite-uri` node. It has the `template` attribute that the API request coming through API Management will eventually redirected to the Logic App instance. When you have a look at the `template` value, it's a querystring that we need to work on.

https://gist.github.com/justinyoo/a30b856b427cca7d4f4bc67cbab3d8e0?file=rewrite-uri.xml

it contains a liquid template markup surrounded by two curly braces like `{{lamanual5a27d3ff5eec5fd4fc847565}}`. This is actually the SAS token we're looking to replace. The `lamanual5a27d3ff5eec5fd4fc847565` is a key defined within API Management instance.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-08.png)

This is not the one we're using, but the one we're replacing with the request header. Let's get back to the policy editor. Remove the liquid template part from the `template` attribute of the `request-uri` node.

https://gist.github.com/justinyoo/a30b856b427cca7d4f4bc67cbab3d8e0?file=rewrite-uri-modified.xml

Now, we need to get the SAS token value from the request header. Add another policy node called `set-variable` and give it a name of `sasToken`. For its value, we can use [policy expression](https://docs.microsoft.com/en-us/azure/api-management/api-management-policy-expressions) to access to the request header. The policy expression is pretty much C# compliant. Therefore, if you're used to C# language, you can easily pick that up.

https://gist.github.com/justinyoo/a30b856b427cca7d4f4bc67cbab3d8e0?file=set-variable.xml

Now, we've got the SAS token value from the request header. We now need to append it to querystring. Let's add another policy node called, `set-query-parameter`. We put the parameter name of `sv` because, the SAS token always consist of `sv`and `sig`.

> Of course the `sp` parameter is a part of the SAS token, but it's already the part of the template which won't be changing. We're not considering that.

Set the parameter value like below and save it.

https://gist.github.com/justinyoo/a30b856b427cca7d4f4bc67cbab3d8e0?file=set-query-parameter.xml

Now, we're all set. Let's send a request through Postman. Send a request to API Management URL with a header of `X-Sas-Token` and this is what we expected, yeah?

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-09.png)

That's how Azure API Management can secure Azure Logic App instance's SAS token. By doing so, we can keep the SAS token part at a secure and separate place.

## Using Azure Functions Proxies

I know. API Management is not cost-effective only for this purpose. Unless we're heavily using API Management, it wouldn't be a good choice. There's an alternative, fortunately – Azure Functions. With Azure Functions Proxies, we can achieve the same goal. Let's have a look. Open an Azure Functions instance, go to the Proxies blade, and create a new proxy.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-10.png)

Here is the interesting part. When we put the Logic App instance's endpoint URL into the _Backend URL_ field, we need to access to the request header and get the SAS token value from there. Fortunately, Azure Function Proxies allow us to use [request and response parameters](https://docs.microsoft.com/en-us/azure/azure-functions/functions-proxies#using-variables). Therefore, in order to get the SAS token value from the header, we replace the SAS token part with `{request.headers.x-sas-token}`. By doing so, the Azure Function Proxy can directly read the header value and append it into the querystring of the Logic App instance.

Now we all set. Send an HTTP request through Postman to the function proxy endpoint with `X-Sas-Token` header value.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2017/12/securing-token-from-logic-apps-11.png)

That's how Azure Function Proxies can secure Azure Logic App instance's SAS token. This approach is far much easier than using API Management, isn't it?

## Which One to Choose?

So far, we have looked at both Azure API Management and Azure Functions Proxies to secure SAS token for Azure Logic App instances. Both provides a very great way of securing Azure Logic Apps. If you want to look for much simpler and easier way, Azure Functions Proxies is good for you. On the other hand, if you want to look for much more controlled and integrated way, Azure API Management will be your good fit.
