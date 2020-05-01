---
title: "3 Ways Referencing Azure Key Vault from Azure Functions"
slug: 3-ways-referencing-azure-key-vault-from-azure-functions
description: "This post shows how to get references to Azure Key Vault from Azure Functions in a few different ways and discuss their pros and cons."
date: "2020-04-30"
author: Justin-Yoo
tags:
- azure-functions
- azure-keyvault
- pro-tips
- local-dev
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/3-ways-referencing-azure-key-vault-from-azure-functions-00.png
fullscreen: true
---

Almost of all time, [Azure Functions][az func] or [Azure App Service][az appsvc] uses sensitive information like API auth key or database connection strings. [Azure Key Vault][az kv] helps to store that confidential information safely. Throughout this post, I'm going to show three different ways to get references to [Azure Key Vault][az kv] from [Azure Functions][az func] and discuss their pros and cons.

> You can download the sample code from [KeyVault Reference Sample][gh sample].


## How Key Vault Reference Works on Azure Functions Instance ##

First of all, let's have a look at how an [Azure Functions][az func] instance gets a reference to [Azure Key Vault][az kv].

* [Azure Functions][az func] instance should enable the [Managed Identity][az func mi] feature so that [Azure Key Vault][az kv] can be access directly from the app instance. I wrote a [blog post][post azfunc mi] about this.
* The [App Settings][az func appsettings] blade of the [Azure Functions][az func] instance sets the reference to [Azure Key Vault][az kv]. The reference format is `@Microsoft.KeyVault(...)`.

![][image-01]

As you can see the image above, the values set by reference shows `Key Vault Reference` at the `Source` column.

By the way, the [Azure Functions][az func] app instance recognises those [Configuration values as environment variables][az appsvc appsettings]. Therefore, within the code, we use the `Environment.GetEnvironmentVariable()` method to get the configuration values.

> We can get those values [by deserialisation][az appsvc envvar], but this is beyond the topic of this post.

How can the secret values from [Key Vault][az kv] be converted into environment variables? Our application doesn't know whether it is the reference value or environment variables. It is because the [App Service][az appsvc] instance internally refers to the [Key Vault][az kv] values and converts them into environment variables. As the logic around this is all encapsulated, we don't know how it works. We just set the reference and use the value. Full stop.


## Key Vault Reference #1 ##

The [official document][az kv fncapp] recommends the following two ways for reference.

https://gist.github.com/justinyoo/a6557ce58fb28e526744d85941404e75?file=01-kv-reference-1.txt

https://gist.github.com/justinyoo/a6557ce58fb28e526744d85941404e75?file=02-kv-reference-2.txt

![][image-02]

Although we use the reference like above, our code doesn't change. We still call `Environment.GetEnvironmentVariable("Hello")` or `Environment.GetEnvironmentVariable("Hello2")`.

***This approach has a caveat***. When we update a secret, its version is also changed. Whenever the version changes, we have to update the reference like `SecretUri` or `SecretVersion` as the version is a part of the reference. We can use [Azure Event Grid][az evtgrd] because [Azure Key Vault][az kv] raises an event when the secret changes, which [can be captured and handled][az kv evtgrd]. But this requires extra coding for event handling.


## Key Vault Reference #2 ##

The second approach for referencing without needing extra coding is to use this recipe. When we put the secret identifier URL to `SecretUri`, simply omit the secret version like below. Make sure that the URI **MUST** end with the trailing slash (`/`).

https://gist.github.com/justinyoo/a6557ce58fb28e526744d85941404e75?file=03-kv-reference-3.txt

![][image-03]

With this approach, the reference always takes the latest version of the secret from [Key Vault][az kv].

***There is a caveat on this approach***. As we discussed above, the reference is converted to environment variables. As the environment variables are cached, they won't change until the app instance is refreshed. Updating app settings blade results in the app instance being refreshed. But, the `SecretUri` value without the secret version won't have a chance to get the app instance refreshed. Therefore, the old value still remains. Of course, it is refreshed, but we can't control it unless we refresh the instance.


## Key Vault Reference #3 ##

The [Key Vault][az kv] reference syntax, `@Microsoft.KeyVault(...)` only applies when the app is deployed to Azure. In other words, it does not apply to the local dev environment. Therefore, if you want to use this reference for your local debugging, we need some extra coding. Let's have a look at the code below. First of all, declare the regular expression instances for the reference syntax pattern.

https://gist.github.com/justinyoo/a6557ce58fb28e526744d85941404e75?file=04-appsettings-handler-1.cs

Write the `GetValueAsync(string key)` method to check environment variables. If the environment variable doesn't follow the [Key Vault][az kv] reference format, return the value.

https://gist.github.com/justinyoo/a6557ce58fb28e526744d85941404e75?file=05-appsettings-handler-2.cs

If the variable follows the reference format, then use the regular expression to check `SecretUri` and parse the reference URL.

https://gist.github.com/justinyoo/a6557ce58fb28e526744d85941404e75?file=06-appsettings-handler-3.cs

If the variable follows the `VaultName` format, then use the other regular expression to parse `VaultName`, `SecretName` and `SecretVersion` to get the secret value.

https://gist.github.com/justinyoo/a6557ce58fb28e526744d85941404e75?file=07-appsettings-handler-4.cs

If none of the above works, return `null`.

https://gist.github.com/justinyoo/a6557ce58fb28e526744d85941404e75?file=08-appsettings-handler-5.cs

Then replace the existing `Environment.GetEnvironmentVariable()` methods with this `AppSettingsHandler.GetValueAsync()` methods so that we can use the reference expression in our local development.

***This approach also has a caveat***. It works perfectly **WITHIN** the function method, but not within the [triggers and bindings][az func bindings] because both triggers and bindings directly access to the environment variables, not through the handler above.

---

So far, we've looked three different ways to get [Azure Key Vault][az kv] references from [Azure Functions][az func]. As all three approaches have their own pros and cons, I can't say which one you should use. I'll leave that to you to make the right decision for your organisation.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/3-ways-referencing-azure-key-vault-from-azure-functions-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/3-ways-referencing-azure-key-vault-from-azure-functions-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/04/3-ways-referencing-azure-key-vault-from-azure-functions-03.png

[post azfunc mi]: /2019/01/03/accessing-key-vault-from-azure-functions-with-managed-identity/

[gh sample]: https://github.com/devkimchi/KeyVault-Reference-Sample

[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
[az func mi]: https://docs.microsoft.com/azure/app-service/overview-managed-identity?tabs=dotnet&WT.mc_id=devkimchicom-blog-juyoo
[az func appsettings]: https://docs.microsoft.com/azure/azure-functions/functions-how-to-use-azure-function-app-settings?WT.mc_id=devkimchicom-blog-juyoo
[az func bindings]: https://docs.microsoft.com/azure/azure-functions/functions-triggers-bindings?WT.mc_id=devkimchicom-blog-juyoo

[az appsvc]: https://docs.microsoft.com/azure/app-service/?WT.mc_id=devkimchicom-blog-juyoo
[az appsvc appsettings]: https://docs.microsoft.com/azure/app-service/configure-common?WT.mc_id=devkimchicom-blog-juyoo
[az appsvc envvar]: https://docs.microsoft.com/azure/app-service/containers/configure-language-dotnetcore?WT.mc_id=devkimchicom-blog-juyoo#access-environment-variables

[az kv]: https://docs.microsoft.com/azure/key-vault/general/overview?WT.mc_id=devkimchicom-blog-juyoo
[az kv fncapp]: https://docs.microsoft.com/azure/app-service/app-service-key-vault-references?WT.mc_id=devkimchicom-blog-juyoo
[az kv evtgrd]: https://docs.microsoft.com/azure/key-vault/general/event-grid-overview?WT.mc_id=devkimchicom-blog-juyoo

[az evtgrd]: https://docs.microsoft.com/azure/event-grid/overview?WT.mc_id=devkimchicom-blog-juyoo
