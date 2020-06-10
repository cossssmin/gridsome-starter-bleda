---
title: "Adding React UI Components to Blazor Web Assembly App by node.js"
slug: adding-react-components-to-blazor-webassembly-app-by-nodejs
description: "This post shows how to render React UI components on Blazor Web Assembly app, using node.js and npm package."
date: "2020-06-10"
author: Justin-Yoo
tags:
- blazor
- reactjs
- fluent-ui
- js-interop
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/adding-react-components-to-blazor-webassembly-app-by-nodejs-00.png
fullscreen: true
---

In my [previous post][post prev], I showed how to integrate [Blazor Web Assembly][blazor wasm] app with [React][reactjs]-based [Fluent UI][fluentui] components, using CDN. While it's one approach for front-end web development, many others use [node.js][nodejs] and [npm packages][npmjs] as an alternative approach. In this post, I'm going to use this way.

> The sample code used in this post can be fount at [https://github.com/devkimchi/Blazor-React-Sample][gh sample].


## Creating Blazor Web Assembly Application ##

Unlike [Blazor Server][blazor server], we MUST have the latest version of [.NET Core SDK (3.1.4 or later)][netcore sdk 3.1.4] to develop the [Blazor Web Assembly][blazor wasm] app. Once installed, follow the [Blazor Getting Started][blazor gettingstarted] page and create a simple application.

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=01-dotnet-new.sh

> We use `blazorwasm` instead of `blazorserver` as we're building a web assembly application which is purely running on the client-side.

When you run the app, using the `dotnet run` command, you will see the page like below. Navigate to the `Counter` page and click the `Click me` button to confirm the counter is increasing.

![][image-01]
![][image-02]

What we just did is the same process as documented on the [Blazor Getting Started][blazor gettingstarted] page.


## Adding React UI Component ##

> [Kedren Villena][kedren] has written an awesome [post][kedren post] about this approach.

While my [previous post][post prev] uses CDN for JavaScript libraries and deals with the [Fluent UI][fluentui] components, I'm using [node.js][nodejs] and [npm packages][npmjs] instead. Create the `JsLibraries` directory at the root of the Blazor app project. Then run the following command to initialise an npm package.

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=02-npm-init.sh

Once the basic scaffolding is done, enter the following command to install [React][reactjs]-related packages.

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=03-npm-install-save.sh

Then, install the following packages for development, not for distribution.

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=04-npm-install-save-dev.sh

Create the `src` directory and add both `index.js` and `progressbar.js` files. The `progressbar.js` file contains the component logic, and `index.js` exposes those components to [Blazor Web Assembly][blazor wasm] app. Enter the following code to the `progressbar.js` file.

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=05-progressbar.js&highlights=1-3,5

Let's compare to the following code from the [previous post][post prev]. You can find out how the code above is changed from the code below. First of all, [React][reactjs] libraries are imported (line #1-3), then export the `renderProgressBar` function (line #5). You can also notice that the exported function has yet not been directly added to the `window` object, which will discuss later in this post.

https://gist.github.com/justinyoo/e6a99fffa35d032f70e937c7ccf14ddb?file=03-add-react-component.html

The `index.js` wraps the exported function (line #3). I interpret that how the `index.js` file works looks like an IoC container that declares dependency for Blazor app to use. I like this idea.

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=06-index.js&highlights=3

I've created both `index.js` and `progressbar.js` files so far. As I installed [webpack][webpackjs], I'll use it to compile all the JavaScript files that I created. Let's create `webpack.config.js`. I also use `babel-loader` to load [babel][babeljs] that translates modern JavaScript syntax to web browser-compatible ones (line #10). All `.js` and `.jsx` files are included for that translation (line #7). After the bundling, the compiled output is copied to the `wwwroot/js` directory of the [Blazor Web Assembly][blazor wasm] app, as `bundle.js` (line #16-17). It's interesting to see both `library` and `libraryTarget` options (line #18-19). As we all know, the [Blazor Web Assembly][blazor wasm] app refers the JavaScript modules under the `window` object and, instead of being individual modules, webpack compiles all the modules under `FluentUiComponents`, which works like a namespace.

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=07-webpack-config.js&highlights=7,10,16-19

Open `package.json` and update the following (line #4). After that, we can build the progress bar through this command, `npm run build`.

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=09-package.json&highlights=4

Once completed, update two parts at the [Blazor][blazor wasm] app side. Open `index.html` and add `js/bundle.js` reference (line #2).

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=08-index.html&highlights=2

Then, `Counter.razor` calls the JavaScript function like below. Unlike the [previous post][post prev] merely calling the function, `RenderProgressBar`, this time it calls the function like `FluentUiComponents.RenderProgressBar` because webpack has bundled the package in that way (line #4).

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=10-counter.razor&highlights=4


## Building npm Packages within Blazor Project Together ##

If we want to run this app, we should build both Blazor app and npm package separately. But there's another way to build both together, by modifying the `.csproj` file. Open the `.csproj` file. Add `JsLibraryRoot` and `DefaultItemExcludes` elements to `PropertyGroup` to exclude `node_modules` (line #7-8). Then, to make sure whether the `node_modules` is properly excluded, add `ItemGroup`, `Content` and `None` elements (line #18-22). Finally, to run the npm commands, add `Target` that runs `npm install` and `npm run build` (line #24-28).

https://gist.github.com/justinyoo/224fa5fe1bfa2dca8dcdd0fc83c17251?file=11-app.csproj&highlights=7-8,18-22,24-28

Now, let's run the `dotnet build .` command. It will build both Blazor and npm package at the same time. Run the Blazor app and click the `Click me` button. We'll see the progress bar as expected.

![][image-03]

---

So far, we've built a [Blazor Web Assembly][blazor wasm] app with [React][reactjs] UI components, using npm packages. Let's deploy and run this Blazor app on [Azure Static Web App][az swa] instance in the next post.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/adding-react-components-to-blazor-webassembly-app-by-nodejs-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/adding-react-components-to-blazor-webassembly-app-by-nodejs-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/adding-react-components-to-blazor-webassembly-app-by-nodejs-03.png

[gh sample]: https://github.com/devkimchi/Blazor-React-Sample

[post prev]: /2020/06/03/adding-react-components-to-blazor-webassembly-app/

[kedren]: https://www.linkedin.com/in/kedrenvillena/
[kedren post]: https://medium.com/swlh/using-npm-packages-with-blazor-2b0310279320

[blazor]: https://docs.microsoft.com/aspnet/core/blazor/?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo
[blazor wasm]: https://docs.microsoft.com/aspnet/core/blazor/?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo#blazor-webassembly
[blazor server]: https://docs.microsoft.com/aspnet/core/blazor/?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo#blazor-server
[blazor gettingstarted]: https://docs.microsoft.com/aspnet/core/blazor/get-started?view=aspnetcore-3.1&tabs=visual-studio-code&WT.mc_id=devkimchicom-blog-juyoo
[blazor js from dotnet]: https://docs.microsoft.com/aspnet/core/blazor/call-javascript-from-dotnet?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo
[blazor dotnet from js]: https://docs.microsoft.com/aspnet/core/blazor/call-dotnet-from-javascript?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo
[blazor statemanagement]: https://docs.microsoft.com/aspnet/core/blazor/state-management?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo

[wasm]: https://webassembly.org/
[reactjs]: https://reactjs.org/
[netcore sdk 3.1.4]: https://dotnet.microsoft.com/download/dotnet-core/3.1?WT.mc_id=devkimchicom-blog-juyoo#3.1.4
[nodejs]: https://nodejs.org/
[npmjs]: https://www.npmjs.com/
[webpackjs]: https://webpack.js.org/
[babeljs]: https://babeljs.io/

[fluentui]: https://developer.microsoft.com/fluentui/?WT.mc_id=devkimchicom-blog-juyoo
[fluentui progressindicator]: https://developer.microsoft.com/fluentui?WT.mc_id=devkimchicom-blog-juyoo#/controls/web/progressindicator
[fluentui progressindicator codepen]: https://codepen.io/pen/?&editable=true=https%3A%2F%2Fdeveloper.microsoft.com%2Fen-us%2Ffluentui%3FWT.mc_id%3Ddevkimchicom-blog-juyoo

[az swa]: https://docs.microsoft.com/azure/static-web-apps/overview?WT.mc_id=devkimchicom-blog-juyoo
