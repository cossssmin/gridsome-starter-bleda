---
title: "Hosting Blazor Web Assembly App on Azure Static Web App"
slug: hosting-blazor-web-assembly-app-on-azure-static-webapp
description: "This post shows how to deploy Blazor Web Assembly app to Azure Static Web App instance, as well as integrate Azure Functions as a proxy API."
date: "2020-06-17"
author: Justin-Yoo
tags:
- blazor
- azure-static-web-app
- github-actions
- azure-functions-proxy
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-00.png
fullscreen: true
---

* [Adding React UI Components to Blazor Web Assembly App][post series 1]
* [Adding React UI Components to Blazor Web Assembly App by node.js][post series 2]
* ***Hosting Blazor Web Assembly App on Azure Static Web App***

In my [previous post][post prev], we developed a [Blazor Web Assembly][blazor wasm] app on our local machine. Throughout this post, I'm going to discuss how to deploy the app to [Azure Static Web Apps][az swa].

> The sample code used here can be found at [https://github.com/devkimchi/Blazor-React-Sample][gh sample].


## Building Blazor Web Assembly App ##

Please refer to my [previous post][post prev] about how to build a [Blazor Web Assembly][blazor wasm] app. This post rather focuses on the deployment of the app. The [`BlazorNpmSample` project][gh sample blazor] contains the Blazor app. Build and run this app on your local machine first.

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=01-dotnet-run.sh

Open your web browser, go to the website, `https://localhost:5001`, and navigate to the `Counter` page, then click the `Click me` button. You'll be able to find out the screen like below. Don't worry about the error message. It's expected. The error will be sorted out at the end of this post.

![][image-01]


## Deploying Blazor Web Assembly App to Azure Static Web Apps ##

At [Build 2020][build 2020], a new [Azure Static Web Apps][az swa] service was announced as a public preview. This service means a lot to front-end development because the front-end applications take responsibilities for user interactions more than ever. Only if necessary, it calls back-end API for data or messages. Especially [JAM Stack][jamstack] has become more popular for over the last few years. Therefore, to host those JAM Stack applications, this [Azure Static Web App][az swa] service has been launched. At the time of this writing, it predominantly supports JavaScript-based applications. In order to deploy the [Blazor Web Assembly][blazor wasm] application to the [Azure Static Web Apps][az swa] instance, we need a few extra steps. Let's find them out.

> My colleague [Tim Heuer][tim twitter] wrote an awesome [post][tim post] about this. My post extends his one.

Please refer to the [page][az swa build] to deploy an app to [Azure Static Web App][az swa] instance. At the time of this writing, the deployment, in fact, fails.

![][image-02]

This is because the action used for deployment, [Azure/static-web-apps-deploy@v0.0.1-preview][az swa action], uses [Oryx][oryx]. Currently, the latest version of .NET Core SDK that [Oryx][oryx] supports is 2.2, which doesn't support Blazor Web Assembly yet. Therefore, we can't 100% rely on the action. The auto-generated GitHub Actions workflow should be accommodated to sort out this issue. Add the following action right after the `actions/checkout@v2` action. We need to set the SDK version to `3.1.300` for Blazor Web Assembly (line #4).

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=02-action-dotnet.yaml&highlights=4

Then, build the Blazor app outside the Oryx action and create the artifact to the `published` directory (line #4). Of course, we can add more steps before this step, like testing, but let's hold this for now.

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=03-action-dotnet-publish.yaml&highlights=4

We've got the Blazor app. Let's update the existing `Build And Deploy` step. Change the values of `app_location`, `api_location` and `app_artifact_location` properties (line #6-8).

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=04-action-build-deploy.yaml&highlights=6-8

Save the workflow and push it back to the repository. Then the workflow will successfully run, and the Blazor app will be deployed successfully. But there's still the same error occurs. As I mentioned earlier, it's OK for now.

![][image-03]


## Deploying Proxy API to Azure Static Web Apps ##

One of the biggest challenges for all static web app hosting services, including [Azure Static Web Apps][az swa] is to communicate with the back-end APIs with no trouble. There are several ways for front-end apps to talk to the back-end APIs. OAuth is one way and API auth key is another. The auth key should be stored in a safe place and used, if necessary. But a static web app is not the place to store the key because it's exposed. [Azure Static Web App][az swa] offers the [API proxy feature][az swa api]. With this feature, the auth key is securely stored at rest.


### Building External API ###

First of all, let's build a simple app representing an external API, which is running independently. For now, it's the [Azure Functions][az func] app written in C#. It takes the `count` parameter and returns the result. As the [`BlazorApiSample` project][gh sample api] contains the source code, build it and run the app with the following command.

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=05-api-func-start.sh

Then, call the API through the web browser.

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=06-api-run.txt

You will be able to see the result like this:

![][image-04]


### Building Proxy API ###

Let's build the proxy API for the [Azure Static Web Apps][az swa] instance. As it's still a preview, there are several constraints to consider.

* It only runs on the node.js runtime.
* It only supports the HTTP binding.

> If you want to know more constraints, please refer to the [Constraints][az swa api constraints] page.

Therefore, based on those restrictions, we should build the proxy API. Here's the sample code, [`BlazorProxySample`][gh sample proxy], which is a really simple one. The following function explains how it works. The proxy API calls the external API (line #9-11) using environment variables of `API__BASE_URI`, `API__ENDPOINT` and `API__AUTH_KEY` (line #4-6). They are not exposed, of course.

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=07-proxy-http-trigger.js&highlights=4-6,9,11

Those environment variables are stored to `local.settings.json` (line #5-7).

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=08-proxy-local-settings.json&highlights=5-7

Now, all the basic setup is done. Let's run the proxy API. As the external API has already taken the `7071` port, this API should use another port. Here in this post, I use `7072` instead.

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=09-proxy-func-start.sh

You can find out both function instances are running locally at the same time.

![][image-05]

If you send a request to the proxy API, it returns the following:

![][image-06]


### Integrating Blazor App to Proxy API ###

There is one big difference to consider while working on the local machine. Both [Azure Static Web App][az swa] and the proxy API live in the same instance. Therefore, the deployed app itself has no problem, but they are two different instances at local. The Blazor app runs on `https://localhost:5001`, and the proxy API runs on `http://localhost:7072`. To talk to each other, we should set the CORS enabled. Update the `local.settings.json` file for CORS (line #6-8).

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=10-proxy-local-settings-cors.json&highlights=6-8

Run the Azure Functions app, proxy API and Blazor app individually (from the right-hand side in the picture).

![][image-07]

Navigate the Blazor app to the `Counter` page and click the `Click me` button. There's no error! Yay!

![][image-08]


### Deploying Both Blazor App and Proxy API Altogether ###

We've got all local development done. Before deployment, we need to adjust the GitHub Actions workflow again. Add the following action straight after the `actions/setup-dotnet@v1` action to update `appsettings.json` that the Blazor app refers to (line #4).

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=11-action-appsettings.yaml&highlights=4

And update the `Azure/static-web-apps-deploy@v0.0.1-preview` to add the proxy API (line #6).

https://gist.github.com/justinyoo/fcba3e387d240a057e76a28f233fec82?file=12-action-build-deploy.yaml&highlights=6

Push the change to the GitHub repository, and the change will be published to the [Azure Static Web App][az swa] instance. Run the app, and you will still see the error. That's still fine! Let's fix it.

![][image-09]

The error occurs because we haven't set up the environment variables for the proxy API. Add the following environment variables at the `Configuration` blade.

![][image-10]

Refresh the app and click the button. No error! We made it!

![][image-11]

---

So far, we have walked through how the [Blazor Web Assembly][blazor wasm] app is deployed to [Azure Static Web App][az swa] instance. Deploying Blazor app itself only requires a few tweaks on the GitHub Actions workflow. But deploying the proxy API requires more than that, which is a bit complicating. As [Azure Static Web App][az swa] is still in preview, there are a lot of spaces to get improved until becoming GA. I hope, by the time of GA, it will be a lot easier to deploy Blazor Web Assembly app to Azure Static Web App.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-05.png
[image-06]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-06.png
[image-07]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-07.png
[image-08]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-08.png
[image-09]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-09.png
[image-10]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-10.png
[image-11]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/hosting-blazor-web-assembly-app-on-azure-static-webapp-11.png

[gh sample]: https://github.com/devkimchi/Blazor-React-Sample
[gh sample blazor]: https://github.com/devkimchi/Blazor-React-Sample/tree/master/BlazorNpmSample
[gh sample api]: https://github.com/devkimchi/Blazor-React-Sample/tree/master/BlazorApiSample
[gh sample proxy]: https://github.com/devkimchi/Blazor-React-Sample/tree/master/BlazorProxySample

[post series 1]: /2020/06/03/adding-react-components-to-blazor-webassembly-app/
[post series 2]: /2020/06/10/adding-react-components-to-blazor-webassembly-app-by-nodejs/
[post series 3]: /2020/06/17/hosting-blazor-web-assembly-app-on-azure-static-webapp/

[post prev]: /2020/06/10/adding-react-components-to-blazor-webassembly-app-by-nodejs/

[blazor wasm]: https://docs.microsoft.com/aspnet/core/blazor/?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo#blazor-webassembly

[az swa]: https://docs.microsoft.com/azure/static-web-apps/overview?WT.mc_id=devkimchicom-blog-juyoo
[az swa build]: https://docs.microsoft.com/azure/static-web-apps/getting-started?tabs=vanilla-javascript&WT.mc_id=devkimchicom-blog-juyoo
[az swa action]: https://github.com/Azure/static-web-apps-deploy
[az swa api]: https://docs.microsoft.com/azure/static-web-apps/apis?WT.mc_id=devkimchicom-blog-juyoo
[az swa api constraints]: https://docs.microsoft.com/azure/static-web-apps/apis?WT.mc_id=devkimchicom-blog-juyoo#constraints

[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo

[build 2020]: https://mybuild.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
[jamstack]: https://jamstack.org/
[oryx]: https://github.com/microsoft/Oryx

[tim twitter]: https://twitter.com/timheuer
[tim post]: https://timheuer.com/blog/hosting-blazor-in-azure-static-web-apps/
