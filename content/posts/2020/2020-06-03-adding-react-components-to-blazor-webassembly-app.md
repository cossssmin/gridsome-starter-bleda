---
title: "Adding React UI Components to Blazor Web Assembly App"
slug: adding-react-components-to-blazor-webassembly-app
description: "This post shows how to render React UI components into a Blazor WebAssembly app."
date: "2020-06-03"
author: Justin-Yoo
tags:
- blazor
- reactjs
- fluent-ui
- js-interop
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/adding-react-components-to-blazor-webassembly-app-00.png
fullscreen: true
---

* ***Adding React UI Components to Blazor Web Assembly App***
* [Adding React UI Components to Blazor Web Assembly App by node.js][post series 2]
* [Hosting Blazor Web Assembly App on Azure Static Web App][post series 3]

There were literally a lot of services and technologies announced at [Build 2020][build]. [Blazor Web Assembly][blazor wasm] was one of them, which I believe it may put a significant impact on the front-end development experiences. For those who are not familiar with the term, [Web Assembly][wasm], it's technology to run binaries on web browsers, which is written in high-level languages such as C#, C, Java, Go, and so forth. [Blazor][blazor] uses this technology to run .NET .dll files on web browsers directly. If you want to know more about [Blazor Web Assembly][blazor wasm], I would recommend watching this [video at Build][build blazor].

Like any other web front-end frameworks, as [Blazor Web Assembly][blazor wasm] has completeness by itself, it might be tricky to mix with other frameworks. However, we can do a workaround if we're using a component-based web framework. Throughout this post, I'm going to show how to integrate [React][reactjs]-based [Fluent UI][fluentui] components with a [Blazor Web Assembly][blazor wasm] web application.

> The sample code used in this post can be found at [https://github.com/devkimchi/Blazor-React-Sample][gh sample].


## Creating Blazor Web Assembly Application ##

Unlike [Blazor Server][blazor server], we MUST have the latest version of [.NET Core SDK (3.1.4 or later)][netcore sdk 3.1.4] to develop the [Blazor Web Assembly][blazor wasm] app. Once installed, follow the [Blazor Getting Started][blazor gettingstarted] page and create a simple application.

https://gist.github.com/justinyoo/e6a99fffa35d032f70e937c7ccf14ddb?file=01-dotnet-new.sh

> We use `blazorwasm` instead of `blazorserver` as we're building a web assembly application which is purely running on the client-side.

When you run the app, using the `dotnet run` command, you will see the page like below. Navigate to the `Counter` page and click the `Click me` button to confirm the counter is increasing.

![][image-01]
![][image-02]

What we just did is the same process as documented on the [Blazor Getting Started][blazor gettingstarted] page.


## Adding React UI Component ##

[Fluent UI][fluentui] is a UI framework applied to all [Microsoft 365][m365] applications. Fluent UI uses [React][reactjs], and it's really easy to integrate into web applications or web-based widgets. Here in this post, we're using the [Progress Indicator][fluentui progressindicator] control so that the control shows progress when we click the `Click me` button. As there's a [CodePen][codepen] example on the document page, we simply use that.

> This exercise initially came from the [YouTube video][hassan video] by [Hassan Habib][hassan], which uses [Blazor Server][blazor server]. I converted it for [Blazor Web Assembly][blazor wasm] application.

Open the `index.html` file and add the [React][reactjs] related JavaScript references.

https://gist.github.com/justinyoo/e6a99fffa35d032f70e937c7ccf14ddb?file=02-add-react-library.html

Web Assembly has the concept of JS interoperability so that [Blazor Web Assembly][blazor wasm] can [call JavaScript functions from C# codes][blazor js from dotnet] and [vice versa][blazor dotnet from js]. Write a JavaScript snippet like below. When Blazor calls the `RenderProgressBar` function with the parameter of `count`, the function creates the `ProgressIndicator` component and render it to the `reactProgressBar` area.

> **NOTE** All JavaScript functions called by Blazor should be global-scoped under the `window` object.

https://gist.github.com/justinyoo/e6a99fffa35d032f70e937c7ccf14ddb?file=03-add-react-component.html

All JavaScript part is done. Now let's modify the `Counter.razor` page. In the page, we should call the JavaScript function declared above. In order to call a JavaScript method, `IJSRuntime` instance is required. Within a `.razor` page, it can be injected by the `@inject` directive (line #2). Then change the `IncrementCount()` method to be `async` (line #15) that calls the `InvokeVoidAsync()` method. The `InvokeVoidAsync()` method calls the `RenderProgressBar` function (line #19). Finally, put a `div` placeholder with the ID of `reactProgressBar` so that the React UI component is rendered (line #10).

https://gist.github.com/justinyoo/e6a99fffa35d032f70e937c7ccf14ddb?file=04-update-razor-page.razor&highlights=2,10,15,19

Let's rerun the application and punch the `Click me` button. You'll be able to see the Progress Indicator component right below the button.

![][image-03]

---

So far, we have walked through the way to add [React][reactjs] UI components into the [Blazor Web Assembly][blazor wasm] application. There are a few caveats that this post hasn't covered, though:

* It always renders the component every time the counter value changes. As [Blazor][blazor] has the [state management feature][blazor statemanagement], it may be worth considering. But make sure that it also increases the complexity of the app.
* We used CDN to import [React][reactjs] libraries. We can also consider the npm packages, which will be covered in the [next post][post next].


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/adding-react-components-to-blazor-webassembly-app-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/adding-react-components-to-blazor-webassembly-app-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/adding-react-components-to-blazor-webassembly-app-03.png

[post series 1]: /2020/06/03/adding-react-components-to-blazor-webassembly-app/
[post series 2]: /2020/06/10/adding-react-components-to-blazor-webassembly-app-by-nodejs/
[post series 3]: /2020/06/17/hosting-blazor-web-assembly-app-on-azure-static-webapp/

[post next]: /2020/06/10/adding-react-components-to-blazor-webassembly-app-by-nodejs/

[gh sample]: https://github.com/devkimchi/Blazor-React-Sample

[build]: https://mybuild.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
[build blazor]: https://mybuild.microsoft.com/sessions/420ccd3f-6570-4c58-91da-cd760c511171?source=sessions&WT.mc_id=devkimchicom-blog-juyoo

[blazor]: https://docs.microsoft.com/aspnet/core/blazor/?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo
[blazor wasm]: https://docs.microsoft.com/aspnet/core/blazor/?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo#blazor-webassembly
[blazor server]: https://docs.microsoft.com/aspnet/core/blazor/?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo#blazor-server
[blazor gettingstarted]: https://docs.microsoft.com/aspnet/core/blazor/get-started?view=aspnetcore-3.1&tabs=visual-studio-code&WT.mc_id=devkimchicom-blog-juyoo
[blazor js from dotnet]: https://docs.microsoft.com/aspnet/core/blazor/call-javascript-from-dotnet?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo
[blazor dotnet from js]: https://docs.microsoft.com/aspnet/core/blazor/call-dotnet-from-javascript?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo
[blazor statemanagement]: https://docs.microsoft.com/aspnet/core/blazor/state-management?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo

[wasm]: https://webassembly.org/
[reactjs]: https://reactjs.org/
[m365]: https://www.office.com/
[netcore sdk 3.1.4]: https://dotnet.microsoft.com/download/dotnet-core/3.1?WT.mc_id=devkimchicom-blog-juyoo#3.1.4
[codepen]: https://codepen.io/

[fluentui]: https://developer.microsoft.com/fluentui/?WT.mc_id=devkimchicom-blog-juyoo
[fluentui progressindicator]: https://developer.microsoft.com/fluentui?WT.mc_id=devkimchicom-blog-juyoo#/controls/web/progressindicator
[fluentui progressindicator codepen]: https://codepen.io/pen/?&editable=true=https%3A%2F%2Fdeveloper.microsoft.com%2Fen-us%2Ffluentui%3FWT.mc_id%3Ddevkimchicom-blog-juyoo

[hassan]: https://twitter.com/HassanRezkHabib
[hassan video]: https://youtu.be/E4xUCxOL_PI
