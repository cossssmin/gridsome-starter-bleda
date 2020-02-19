---
title: "Building Custom GitHub Action with .NET Core"
slug: building-custom-github-action-with-dotnet-core
description: "This post discusses how to build a custom GitHub Action using .NET Core console app."
date: "2020-02-19"
author: Justin-Yoo
tags:
- github-actions
- custom-actions
- docker
- dotnet-core
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/02/building-custom-github-action-with-dotnet-core-00.png
fullscreen: true
---

Previously, I wrote [several][prev post 1] [blog][prev post 2] [posts][prev post 3] about [GitHub Actions][gh actions], and I'm going to continue it in this post. We've been using ready-made GitHub Actions so far. However, there might not be Actions available, which I'm looking for, or I can't use the open-sourced Actions for various reasons. In this instance, we need to build our own [Custom GitHub Action][gh actions custom]. Throughout this post, I'm going to discuss when to use Custom GitHub Actions and how to build it, with a very simple [.NET Core][.net core] console application.


## Why Custom GitHub Actions? ##

All GitHub Actions available on the [marketplace][gh actions marketplace] are open-sourced. Anyone who agrees with the owner's license policy can use them. At the same time, someone can't use them because of the license policy. Maybe their organisation doesn't allow to use open-source libraries unless it's fully endorsed. In this case, instead of using the existing Actions, they should build their own Actions. Let's think about other cases. What if there's no Action that I'm looking for? I should wait for the Action published by someone else or build it by myself. If I decide to make it, the Custom GitHub Action is the answer.


## Types of Custom GitHub Actions ##

There are two types of building Custom Actions. One is to [use Docker container][gh actions docker], and the other is to [use JavaScript][gh actions nodejs]. Both have their own pros and cons. Here are some:

|                                        | Docker Action                           | JavaScript Action                     |
|----------------------------------------|-----------------------------------------|---------------------------------------|
| [Runner][gh actions runner] Dependency | [Runner][gh actions runner] independent | [Runner][gh actions runner] Dependent |
| Performance                            | Slow                                    | Fast                                  |
| Multi-platform Support                 | Ubuntu [runner][gh actions runner] only | All [runners][gh actions runner]      |
| Language Support                       | All languages available                 | JavaScript only                       |

The reason why the Docker Action is slower than the JavaScript one is that it takes time to build a container before use, while the JavaScript one runs directly on the runner. With this regards, the JavaScript one looks way better, but multi-language support is the killing point of using the Docker Action. If you want to use your preferred language, like C#, Java, Python, Go, or PHP, the Docker Action is yours.

As we're building a .NET Core console application written in C#, we're going to use the Docker one.


## Building a .NET Core Console Application ##

First of all, let's write a .NET Core console app. Instead of a simple `Hello World` style one, we're building a more practical one. The code below takes inputs and send a message to a [Microsoft Teams][ms teams] channel. Here's the code:

> [This post][prev post 4] shows more detailed logic, used for [Azure Functions][az fncapp].

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=program.cs

Once completing the console app, let's move onto the custom action part.


## `action.yml` &ndash; Custom Action Metadata ##

`action.yml` declares how the custom action work by defining input and output values and how it runs. At the root directory of the repository, create the `action.yml` file and fill the code like below. For more details of the metadata, please visit the [Metadata syntax for GitHub Actions][gh actions metadata] page.

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=action.yml

Both `using` and `image` parameters are the core of this declaration. `using` MUST be `docker` and `image` SHOULD be `Dockerfile`. It can be a reference from outside of the repository, but it's better to stay within the repo.

> If you use the extension of `.yaml`, like `action.yaml`, it can't read the secrets from the repository settings, which is a BUG at the time of this writing. Therefore, keep using the `.yml` extension for now. Of course, the main workflow can use both `.yaml` and `.yml`.


## `Dockerfile` &ndash; Container Definition ##

In the previous section, the `action.yml` refers to `Dockerfile`. As we're building a .NET Core application, we need a base image containing [.NET Core 3.1 SDK][.net core sdk], which is [`mcr.microsoft.com/dotnet/core/sdk:3.1`][.net core docker]. Then copy the source code into the container image. Finally copy the `entrypoint.sh` file that executes the Docker container image.

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=dockerfile.txt


## `entrypoint.sh` &ndash; Container Runner ##

We copied the `entrypoint.sh` file into `Dockerfile`. How does it look like? In the `Dockerfile`, there is nothing but copying the source code. Therefore, the `entrypoint.sh` should build the app and run it with the arguments passed. Here's the code:

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=entrypoint.sh


Now, we've got the basic structure of a Custom Action. Let's have a test!


## Build Private Workflow ##

If I want to know whether my Action works OK or not, I should create a workflow and run it. Create a workflow, `.github/workflows/main.yaml` like:

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=workflow.yaml

Once running the workflow, I'll have a message on my [Microsoft Teams][ms teams] channel.

![][image-01]


## `README.md` &ndash; Usage Instruction ##

If you want to open your custom action, everyone should be able to know how to use it. Write a `README.md` file so that potential users can understand how to use your Action. It should at least contain the followings:

* A detailed description of what the Action does.
* Required input and output arguments.
* Optional input and output arguments.
* Secrets the Action uses.
* Environment variables the Action uses.
* An example of how to use your Action in a workflow.

Once you publish yours to [marketplace][gh actions marketplace], you'll be able to see like this:

![][image-02]

And here's the actual link of the Custom Action:

* [Marketplace][gh actions teams marketplace]
* [Repository][gh actions teams repo]

---

So far, we've walked through how to build a custom action with a real-world scenario. If you have your use case, why not creating a one? It's your turn now.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/02/building-custom-github-action-with-dotnet-core-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/02/building-custom-github-action-with-dotnet-core-02.png

[prev post 1]: https://devkimchi.com/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/
[prev post 2]: https://devkimchi.com/2019/12/18/building-ci-cd-pipelines-with-github-actions/
[prev post 3]: https://devkimchi.com/2020/01/03/migrating-wordpress-to-gridsome-on-netlify-through-github-actions/
[prev post 4]: https://devkimchi.com/2020/01/15/building-ms-teams-custom-connector-with-azure-functions/

[gh actions]: https://github.com/features/actions
[gh actions custom]: https://help.github.com/en/actions/building-actions
[gh actions marketplace]: https://github.com/marketplace?type=actions
[gh actions docker]: https://help.github.com/en/actions/building-actions/creating-a-docker-container-action
[gh actions nodejs]: https://help.github.com/en/actions/building-actions/creating-a-javascript-action
[gh actions runner]: https://help.github.com/en/actions/getting-started-with-github-actions/core-concepts-for-github-actions#runner
[gh actions metadata]: https://help.github.com/en/actions/building-actions/metadata-syntax-for-github-actions

[gh actions teams marketplace]: https://github.com/marketplace/actions/microsoft-teams-generic
[gh actions teams repo]: https://github.com/aliencube/microsoft-teams-actions

[.net core]: https://dotnet.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
[.net core sdk]: https://dotnet.microsoft.com/download/dotnet-core/3.1?WT.mc_id=devkimchicom-blog-juyoo
[.net core docker]: https://hub.docker.com/_/microsoft-dotnet-core-sdk

[ms teams]: https://products.office.com/microsoft-teams/group-chat-software?WT.mc_id=devkimchicom-blog-juyoo
[az fncapp]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
