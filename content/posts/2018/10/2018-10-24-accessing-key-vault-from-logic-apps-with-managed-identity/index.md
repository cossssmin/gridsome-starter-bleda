---
title: "Accessing Key Vault from Logic App with Managed Identity"
date: "2018-10-24"
slug: accessing-key-vault-from-logic-apps-with-managed-identity
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-key-vault
- azure-logic-apps
- managed-identity
- managed-service-identity
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-00.png
---

> DISCLAIMER: This post is purely a personal opinion, not representing or affiliating my employer's.

While using [Azure Logic Apps](https://docs.microsoft.com/en-gb/azure/logic-apps/), one of challenges is `how to manage secret values`, and most of time this can be handled by passing them through the [ARM template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/) parameters. The ideal(?) approach might be through an API connector to [Azure Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/) so that we don't need to worry about passing those secrets. Logic Apps has many API connectors to access Azure resources, but Azure Key Vault connector doesn't exist at this time of writing, unfortunately. Actually [there is a request for this feature on UserVoice](https://feedback.azure.com/forums/287593-logic-apps/suggestions/19658167-connector-for-azure-keyvault) and many users support it, though.

But actually, we can make this happen through a few steps, using [Managed Identity](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview#how-can-i-use-managed-identities-for-azure-resources) and an HTTP action. In this post, I'll walk through how we can make use of Key Vault connection with [Managed Identity from Logic Apps](https://docs.microsoft.com/en-us/azure/logic-apps/create-managed-service-identity).

## Logic App Key Vault Connector vs Key Vault REST API

As mentioned earlier, Logic Apps doesn't provide the API connector to Key Vault. Fortunately instead, we can access to Key Vault through [REST API](https://docs.microsoft.com/en-us/rest/api/keyvault/), [PowerShell](https://docs.microsoft.com/en-us/powershell/module/azurerm.keyvault) and [Azure CLI](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-manage-with-cli2). In this post, we're using the REST API.

## Logic App Instance

Let's create a Logic App instance with the name of `mylogicapp201810`. Once created, open the `Workflow Settings` blade and enable the `Managed Service Identity` option.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-01.png)

That's it from the Logic App configuration. Easy, huh?

## Key Vault Instance

Let's create a Key Vault instance this time. Once created, we need to give direct access to the Logic App instance. Open the `Access Policies` blade and register the Logic App instance. In this example, as the name of the Logic App instance is `mylogicapp201810`, we can easily find it. We don't have to give all permissions to the Logic App, but `Get` and `List` permissions on `Secret` would be sufficient.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-02.png)

Now, create a secret called `hello` and `world` for its secret value by following [this page](https://docs.microsoft.com/en-us/azure/key-vault/quick-create-portal#add-a-secret-to-key-vault).

## HTTP Action in Logic Apps

As we discussed above, we're using the REST API. Therefore, the HTTP action is the right choice here. Add the action and give it a URL of `https://<mykeyvault>.vault.azure.net/secrets`. In this post, I use `mykeyvault201810`. We also need to provide the API version through the querystring. Use `api-version=2016-10-01` as a part of the URL or part of the `Queries` field.

And this is the important part. Select `Managed Service Identity` at the `Authentication` field and give the `Audience` URL of `https://vault.azure.net`.

> **NOTE**: If you enter the audience URL with a trailing slash like `https://vault.azure.net/`, it will return either `400 Bad Request` error or `401 Unauthorized` error.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-03.png)

## Putting Altogether

All settings are done! We've created a Logic App instance, activated Managed Identity, created a Key Vault instance, registered the Logic App instance, and written the Logic App workflow. When we run this Logic App, we can get the list of secrets like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-04.png)

If we provide the secret name, it will return the actual secret value, too. Now, we can use Key Vault directly from the Logic App. Until the Key Vault connector is ready, we can utilise this approach.

## Considerations

However, we still need to consider a few things:

- As you can see above, Logic App Run History contains the secret value. We can't hide it at this stage. Therefore, we need to setup access permissions to Logic Apps very carefully; otherwise we might be in trouble.
- As the official documentation says, we can only register up to ten Logic Apps in one subscription to Azure AD. Therefore, instead of letting every Logic App enable Managed Identity feature, it is recommended to create a separate Logic App instance as a sub-workflow, which purely works as a Key Vault connection and other Logic App instance should call the sub-workflow.

* * *

So far, we've walked through how to access Key Vault secret from the Logic App instance by enabling Managed Identity. I used Azure Portal for all this works for a demo-ing purpose, but usually DevOps scenarios don't do this way. If you want to use it through ARM template, this repository, [https://github.com/devkimchi/Key-Vault-from-Logic-Apps](https://github.com/devkimchi/Key-Vault-from-Logic-Apps) might help.
