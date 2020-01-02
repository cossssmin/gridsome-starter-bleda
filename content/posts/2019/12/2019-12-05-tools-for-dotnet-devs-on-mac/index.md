---
title: "Tools for .NET Developers on Mac"
date: "2019-12-05"
slug: tools-for-dotnet-devs-on-mac
description: ""
author: Justin-Yoo
tags:
- dotnet
- dotnet-core
- cross-platform
- developer-environments
- developer-experience
- developer-tools
- mac-os
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-00.png
---

As a heavy Windows-centric developer, I recently bought a new Macbook Pro (just before the new 16" was launched!). It was my second time using Mac. The first time, I used only Windows through Bootcamp. This time, I'm trying to migrate my development experience to Mac from Windows as a .NET developer. It's still on-going, but I wrote a couple of toy projects on Mac OS. I think it's good to share my personal experience of how I did the transition from Windows to Mac.

## Basic Development Environment Setup

I had no idea where to start to set-up the development environment, for the first time. But I found a [good post (in Korean)](https://www.sangkon.com/osx-setting-for-developer/) for the initial setup. Therefore, I just followed most of the setup instructions from the post.

## Keyboard Remapping

One of the most frustrating moments when switching to Mac from Windows could be the keyboard layout. The layout of the Control key, Option key and Command key is completely different, and I don't think I'm going to be used to the layout anytime soon. Therefore, I have to remap those keys to continue my Windows development experience.

### Karabiner-Elements

[Karabiner-Elements](https://pqrs.org/osx/karabiner/) is a completely free app. It is really excellent for key remapping. I used this for my keyboard layout realignment.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-01.png)

- `Fn` Key: Changed to Left `Command` Key
- Left `Control` Key: Changed to `Fn` Key
- Left `Command` Key: Changed to Left `Control` Key
- Right `Command` Key: Changed to `F13` Key

After this remapping, both the left `command` key and `fn` key combination gets pretty similar to the one in Windows. Therefore, the `Command` + `C` and `Command` + `V` sequence have become really natural. By the way, what's the purpose of the right `Command` Key mapping to `F13` Key?

### System Keyboard Input Source Shortcut

The `F13` key doesn't exist on Windows. I don't know how this key is used on Mac, either, but it seems to be a reserved key for another purpose. As a bilingual developer, I switch both Korean and English every 5 to 10 mins. And this IME switching on Windows is the right `Alt` key. Therefore, I remapped the right `Command` key to `F13` and changed the input source switch shortcut to `F13` like below:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-02.png)

Now, I have the exactly the same experience as Windows to change the input language source.

## Better Snap Tool

Mac OS provides the [screen split view](https://support.apple.com/HT204948) feature, but it's fairly basic. If I want more, I need to look for a third-party tool. [Better Snap Tool](https://folivora.ai/bettersnaptool) is precisely for this purpose. It doesn't only provide a screen split view from many different perspectives but also provides shortcut features for each split view. The only downside of this tool is that you have to buy this.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-03.png)

> Of course, there's an open-source-based tool doing the same thing, like [Rectangle](https://rectangleapp.com/). If you're cost-sensitive, it's worth considering.

## .NET Core SDK

[.NET Core](https://dotnet.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo) has now been older than three years as a cross-platform and open-source language and framework. The latest version of .NET Core SDK is [`3.1.100 (3.1.0)`](https://dotnet.microsoft.com/download/dotnet-core/3.1?WT.mc_id=devkimchicom-blog-juyoo) at the time of this writing. You can download it from the official website. If you prefer to using [Homebrew](https://brew.sh/), type the following command to install the latest version of .NET Core SDK.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-dotnet.sh

But, there's a slight issue using Homebrew to install .NET Core SDK. The Cask only contains the latest version of SDK. It's common to target a different version of SDK when developing .NET Core applications. For example, We can write a console app with .NET Core 3.1.0, but at the same time, we might need to develop an [Azure Functions](https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo) app that currently has a target to .NET Core 2.1/2.2. In this case, we have to download and install manually, not through Cask. Fortunately, there's a Tap, called [.NET Core SDK Versions](https://github.com/isen-ng/homebrew-dotnet-sdk-versions). Follow the command below to install multiple version of SDK.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-dotnet-sdk.sh

With this Tap, the following command will show up the list of installed .NET Core SDK.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=list-dotnet-sdk.sh

## PowerShell Core

[PowerShell](https://docs.microsoft.com/powershell/scripting/overview?view=powershell-6&WT.mc_id=devkimchicom-blog-juyoo) used to be a scripting language, only running on Windows. It's now open-source and supports cross-platform. Therefore, you can continue the existing PowerShell scripting experience on Mac. Use the [Homebrew](https://brew.sh/) command to install PowerShell on your Mac.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-powershell.sh

Once installed, your default Terminal app turns into the PowerShell mode. If you change the theme of Terminal, it will really give you the same PowerShell console look and feel.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-04.png)

In addition to that, installing [Azure PowerShell Module](https://docs.microsoft.com/powershell/azure/install-az-ps?view=azps-3.1.0&WT.mc_id=devkimchicom-blog-juyoo#install-the-azure-powershell-module-1) will give more seamless integration by typing the command below:

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-azure-powershell.sh

## Azure CLI

Like [Azure PowerShell](https://docs.microsoft.com/powershell/azure/install-az-ps?view=azps-3.1.0&WT.mc_id=devkimchicom-blog-juyoo#install-the-azure-powershell-module-1), [Azuer CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=devkimchicom-blog-juyoo) is a cross-platform tool that manages Azure products and services. While developing applications running on Azure, both [Azure PowerShell](https://docs.microsoft.com/powershell/azure/install-az-ps?view=azps-3.1.0&WT.mc_id=devkimchicom-blog-juyoo#install-the-azure-powershell-module-1) and [Azuer CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=devkimchicom-blog-juyoo) are necessary because they complement each other. Therefore installing both would be a good idea. To install Azure CLI, run the following command:

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-azure-cli.sh

## Azurite

[Azurite](https://docs.microsoft.com/azure/storage/common/storage-use-azurite?WT.mc_id=devkimchicom-blog-juyoo) is an emulator for Azure Storage, and an `npm` package that running on multiple platforms. If we develop an [Azure Functions](https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo) app, we mostly need Azure Storage account. On Windows, we can use [Azure Storage Emulator](https://docs.microsoft.com/azure/storage/common/storage-use-emulator?WT.mc_id=devkimchicom-blog-juyoo) for local development, but we can't use it on the other platform. Therefore, [Azurite](https://docs.microsoft.com/azure/storage/common/storage-use-azurite?WT.mc_id=devkimchicom-blog-juyoo) is really a useful tool running on cross-platform. At the time of this writing, its latest version is `3.3.0-preview`, but it's not stable yet. So, I would recommend using `2.7.1` instead.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-azurite.sh

Once installed, run the following command in the console.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=run-azurite.sh

## Azure Storage Explorer

[Azure Storage Explorer](https://azure.microsoft.com/features/storage-explorer/?WT.mc_id=devkimchicom-blog-juyoo) helps navigate both local and cloud storage services like [Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-introduction?WT.mc_id=devkimchicom-blog-juyoo), [Cosmos DB](https://docs.microsoft.com/azure/cosmos-db/introduction?WT.mc_id=devkimchicom-blog-juyoo) and [Azure Data Lake](https://docs.microsoft.com/azure/storage/blobs/data-lake-storage-introduction?WT.mc_id=devkimchicom-blog-juyoo). It's also running on multiple platforms. Enter the following command for install.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-azure-storage-explorer.sh

Once installed, you can see the screen like this:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-09.png)

## Docker for Mac

[Docker for Mac](https://docs.docker.com/docker-for-mac/) runs dockerised containers natively on Mac OS. Run the following command to install.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-docker.sh

Once installed, you can run the Docker CLI straight away in the console.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-05.png)

> If you've been using Virtual Box for Docker, it's time to switch.

## GitKraken

Mac OS contains the git CLI out-of-the-box.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-06.png)

But, if you prefer to using GUI, there are many cross-platform tools for it. [GitKraken](https://www.gitkraken.com/) is one of them. It offers a both free and paid version. In most cases, the free version would be sufficient. Run the following command to install GitKraken.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-gitkraken.sh

## IDE

There are roughly two IDEs on Mac for .NET application development. One is [Visual Studio for Mac](https://visualstudio.microsoft.com/vs/mac/?WT.mc_id=devkimchicom-blog-juyoo), and the other is [Visual Studio Code](https://code.visualstudio.com/?WT.mc_id=devkimchicom-blog-juyoo).

### Visual Studio for Mac

To install [Visual Studio for Mac](https://visualstudio.microsoft.com/vs/mac/?WT.mc_id=devkimchicom-blog-juyoo), run the following command with Homebrew.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-visual-studio.sh

Once installed, open a solution and you'll be able to see code like that:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-07.png)

However, it's still lack of extensions and has a little mature eco system yet. Therefore, it's tough to catch up with the developer experience that I used to do on Windows. It takes more time to get enough extensions.

### Visual Studio Code

Alternatively, we can use [Visual Studio Code](https://code.visualstudio.com/?WT.mc_id=devkimchicom-blog-juyoo). It's built for cross-platform and has large extensions pool. Admittedly it can't fully replace [Visual Studio](https://visualstudio.microsoft.com/vs/?WT.mc_id=devkimchicom-blog-juyoo), but with many extensions, it can keep up most things. Let's run the following command to install [Visual Studio Code](https://code.visualstudio.com/?WT.mc_id=devkimchicom-blog-juyoo).

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-visual-studio-code.sh

In fact, [VS Code](https://code.visualstudio.com/?WT.mc_id=devkimchicom-blog-juyoo) itself is enough for .NET applications. But installing several extensions will give you much relief. Here is the list that I've installed and been using so far. I know the list is not perfect, and it's purely based on my personal experiences. It really has helped me a lot. I wouldn't touch further on each extension here, but add links for them.

- [C#](https://marketplace.visualstudio.com/items?itemName=ms-vscode.csharp&WT.mc_id=devkimchicom-blog-juyoo)
- [C# Sort Usings](https://marketplace.visualstudio.com/items?itemName=jongrant.csharpsortusings&WT.mc_id=devkimchicom-blog-juyoo)
- [C# XML Comments](https://marketplace.visualstudio.com/items?itemName=k--kato.docomment&WT.mc_id=devkimchicom-blog-juyoo)
- [Azure Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-node-azure-pack&WT.mc_id=devkimchicom-blog-juyoo)
- [Azure Logic App](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-logicapps&WT.mc_id=devkimchicom-blog-juyoo)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig&WT.mc_id=devkimchicom-blog-juyoo)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens&WT.mc_id=devkimchicom-blog-juyoo)
- [Git History](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory&WT.mc_id=devkimchicom-blog-juyoo)
- [Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare&WT.mc_id=devkimchicom-blog-juyoo)
- [PowerShell](https://marketplace.visualstudio.com/items?itemName=ms-vscode.PowerShell&WT.mc_id=devkimchicom-blog-juyoo)
- [Visual Studio IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode&WT.mc_id=devkimchicom-blog-juyoo)
- [Visual Studio Code Icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons&WT.mc_id=devkimchicom-blog-juyoo)
- [SVG Viewer](https://marketplace.visualstudio.com/items?itemName=cssho.vscode-svgviewer&WT.mc_id=devkimchicom-blog-juyoo)

Once these tools are ready, we can create a .NET Core project by running the following commands.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=create-dotnet-project.sh

We've now got a new .NET Core project from dotnet CLI. Open the project with [Visual Studio Code](https://code.visualstudio.com/?WT.mc_id=devkimchicom-blog-juyoo) to put more codes.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/tools-for-dotnet-developers-on-mac-08.png)

## Postman

[Postman](https://getpostman.com) is still widely used for API development and testing. There are other useful tools as its alternatives. So, feel free to choose the right one for your purpose. The following command allows you to install Postman.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-postman.sh

## ngrok

[ngrok](https://ngrok.com/) is a handy tool to test webhook APIs on the local machine.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-ngrok.sh

> In my [previous post](https://blog.kloud.com.au/2017/06/07/tools-for-testing-webhooks/), I dealt with how to use `ngrok`. It's nice to have a read the post.

* * *

The tools introducing below are not for .NET application development but for writing technical documentations.

## Snag It

[Snag It](https://www.techsmith.com/screen-capture.html) helps for screenshots. If you think that the [default feature](https://support.apple.com/HT201361) on Mac OS is not enough, this will be useful. But make sure that this requires payment. If you are seeking for a free version, you better find out alternatives.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-snagit.sh

## Camtasia

[Camtasia](https://www.techsmith.com/video-editor.html) helps for screen recording. Mac OS [default feature](https://support.apple.com/HT208721) is still OK, but if you need more features, then consider this tool. Not free.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-camtasia.sh

## Grammarly

[Grammarly](https://www.grammarly.com/) is particularly useful for developers who speak English as their second language. It picks up grammatical errors or suggests appropriate words by analysing sentences and contexts. If you are writing some technical documents, Grammarly really will be your best friend.

This supports most modern web browsers, including Microsoft Edge, Mozilla Firefox, and Google Chrome, by providing browser extensions. Alternatively, you can download and install the desktop application,

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-grammarly.sh

* * *

So far, I've discussed several tools running on Mac, to help or improve developer experiences. I hope this document will help myself and others in the future.
