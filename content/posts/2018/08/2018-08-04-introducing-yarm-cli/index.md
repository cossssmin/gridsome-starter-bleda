---
title: "Introducing YARM CLI"
date: "2018-08-04"
slug: introducing-yarm-cli
description: ""
author: Justin-Yoo
tags:
- dotnet
- arm-templates
- yarm-cli
- yarm
- yaml
- json
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/introducing-yarm-cli-00.png
---

In my [previous post](https://devkimchi.com/2018/06/19/arm-template-lifecycle-management-dos-and-donts/), I briefly introduced [yarm](https://github.com/aliencube/yarm). It is a simple Azure Function app to convert ARM template in JSON format to YAML and vice versa. However, it wasn't that useful in a CI/CD pipeline. So, I have also created another app called, [`yarm cli`](https://github.com/TeamYARM/YARM-CLI), which is a cross-platform tool, written in C# on .NET Core runtime. In this post, I'm going to introduce `yarm cli` and how to use it for your local dev machine and CI/CD pipeline.

## Why YAML for ARM Templates?

As I mentioned in my [previous post](https://devkimchi.com/2018/06/19/arm-template-lifecycle-management-dos-and-donts/), YAML is a superset of JSON and much more human-readable while authoring complex objects like ARM templates. Have a look at the picture below.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2018/08/introducing-yarm-cli-01.png)

The left-hand side of the picture is the original ARM template for Azure Virtual Machine. Can you easily find out where the square brackets are, amongst all curly braces? I know. It is very hard to spot them. On the other hand, at the right-hand side, the same ARM template is written in YAML format. Does it look easier to read? Of course it does.

Therefore, it will be fantastic, if I write the ARM template in YAML and can easily convert it to JSON which [Azure PowerShell](https://docs.microsoft.com/en-us/powershell/azure/overview) or [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) understands.

## Exploring to Existing Tools

From this in mind, I started looking for tools that I wanted to easily convert YAML to JSON. There is a Visual Studio Code plugin, [json2yaml](https://marketplace.visualstudio.com/items?itemName=tuxtina.json2yaml), which is very handy. However, it only converts format **WITHIN** a file, rather than generating a new one.

There are some tools written in JavaScript (node.js), Python or Ruby, etc, but they need to install npm package or language runtime.

I wanted a different one:

- It should run on cross-platform
- It should require no runtime installation
- It should be easy for maintenance – To me, it's C# code

From this in mind, I wrote a [self-contained .NET Core console application](https://docs.microsoft.com/en-us/dotnet/core/deploying/#self-contained-deployments-scd), which is called [`yarm cli`](https://github.com/TeamYARM/YARM-CLI).

## What Does YARM CLI Do?

The purpose of `yarm cli` is very simple.

- It converts existing ARM templates (in JSON format) from the Internet to YAML format.
- It converts ARM templates written in YAML to JSON.
- It runs on any platform including Windows, Linux and Mac.
- It doesn't require any runtime installation.

This is it.

The basic command looks like:

```bat
yarm -i [INPUT_FILE_NAME] -o [OUTPUT_FILE_NAME]

```

There are two possible scenarios – authoring ARM template in YAML, and publishing it in JSON.

### JSON to YAML

In order to start authoring an ARM template, usually [Azure Quickstart Templates](https://github.com/Azure/azure-quickstart-templates) is the best starting point. `yarm cli` takes an ARM template file like:

```bat
yarm -i https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/101-function-app-create-dynamic/azuredeploy.json

```

Alternatively, I can use my own one like:

```bat
yarm -i [JSON_FILE_NAME]

```

Then, `yarm cli` will generate a new ARM template written in YAML and I can start from there.

### YAML to JSON

Once I finish authoring ARM template in YAML, it needs to be converted to JSON so that Azure can understand. This is also simply run the command like:

```bat
yarm -i [YAML_FILE_NAME]

```

Once JSON ARM template is generated, Azure PowerShell or Azure CLI take care of them.

* * *

The current version of `yarm cli` is 0.1.0, which means it will have more features soon. But, its basic feature, conversion between YAML and JSON, works really well. So, if you're interested in writing ARM templates in YAML, or sick of writing complex JSON object, try this, and you will be happy with this.

- Repository: [YARM CLI](https://github.com/TeamYARM/YARM-CLI)
- Release: [![GitHub release](https://img.shields.io/github/release/TeamYARM/YARM-CLI.svg)](https://github.com/TeamYARM/YARM-CLI/releases)
- Download: [![](https://img.shields.io/github/downloads/TeamYARM/YARM-CLI/latest/total.svg)](https://github.com/TeamYARM/YARM-CLI/releases)
