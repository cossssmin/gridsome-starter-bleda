---
title: "Building Azure DevOps Extension on Azure DevOps - Implementation"
date: "2019-07-03"
slug: building-azure-devops-extension-on-azure-devops-2
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- extensions
- alm
- implementation
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops.png
---

In my [previous post](https://devkimchi.com/2019/06/26/building-azure-devops-extension-on-azure-devops-1/), we completed designing [Azure DevOps](https://azure.microsoft.com/en-us/services/devops/) extension. This post continues implementing the extension from there.

## Table of Contents

This series consists of those six posts:

1. [Building Azure DevOps Extension - Design](https://devkimchi.com/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. **_Building Azure DevOps Extension - Implementation_**
3. [Building Azure DevOps Extension - Publisher Registration](https://devkimchi.com/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. [Building Azure DevOps Extension - Manual Publish](https://devkimchi.com/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. [Building Azure DevOps Extension - Automated Publish 1](https://devkimchi.com/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. [Building Azure DevOps Extension - Automated Publish 2](https://devkimchi.com/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## Use Case Scenario

I'm interested in using a static website generator, called [Hugo](https://gohugo.io/), to publish a website. There's [an extension](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension) already published in the marketplace so that I'm able to install it for my Azure DevOps organisation. To publish this static website, I wanted to use [Netlify](https://netlify.com/). However, it doesn't yet exist, unfortunately. Therefore, I'm going to build an extension for Netlify and at the end of this series, you will be able to write an extension like what I did.

> Actually, this Netlify extension has already been [published](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions), which you can use it straight away. This series of posts is a sort of reflection that I fell into situations – some are from the official documents but the others are not, but very important to know during the development. The source code of this extension can be found at [this GitHub repository](https://github.com/aliencube/AzureDevOps.Extensions).

## Implementing Azure DevOps Extension

Based on the design from my [previous post](https://devkimchi.com/2019/06/26/building-azure-devops-extension-on-azure-devops-1/), the `task.json` invokes the `index.js` file. Therefore, I'm going to write it.

In addition to this, [TypeScript](https://www.typescriptlang.org/) is required for this implementation. If you don't have it yet, install it using the command below:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-install-typescript.cmd

### Scaffolding Task Structure

Each task uses node.js, as defined in `task.json`. As both `install` and `deploy` need node.js modules, create the `package.json` file under the `src` folder. You can create the `package.json` file individually for each task if you like.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-init.cmd

Once `package.json` is created, run the following commands to install [`azure-pipelines-task-lib`](https://github.com/microsoft/azure-pipelines-task-lib) and type definitions.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-install-packages.cmd

Finally, create `tsconfig.json` by running the following command:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=tsc-init.cmd

Once created, open it and update the compile option from `ES5` to `ES6`. Now we've got all scaffolding done for implementation. Your files and folder structure might look like this with `package.json`, `package-lock.json`, `tsconfig.json` and `node_modules`:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-2-01.png)

Don't worry about the content in `package.json` for now, because it's not relevant to our extension itself. We don't even publish this to npm, anyway.

### Implementing `install` Task

It's time for the implementation! First of all, create the `index.ts` file under the `install` folder and enter the following code:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=bolierplate-index.ts

This is the easiest and simplest boilerplate template. Of course, you can create a more sophisticated one, but this is beyond our topic for now. What it describes is:

1. To import all necessary modules,
2. To declare the `run()` function, and
3. To call the `run()` function.

All we need to do is just to put all logics into the `run()` function. Let's write the logic. Enter the following snippet into the `run()` function.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=install.ts

The purpose of this task is to install `netlify-cli` in the pipeline so that the next task can run it. More specifically, this task runs the following command through this `index.js` file.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-install-netlify-cli.cmd

As the version number is the only information we need to know for this task, we got the version value from `task.json`, according to my [previous post](https://devkimchi.com/2019/06/26/building-azure-devops-extension-on-azure-devops-1/). This version number is passed through the function, `getInput('version', false)`. The first argument, `version` is the input field name from `task.json`. Both value **MUST** be the same as each other in both `index.ts` and `task.json`; otherwise, it will throw an error.

At the last line in the `try` block, it invokes the function, `exec('npm', args)`, which installs the `netlify-cli` npm package to the pipeline. The second argument value, `args` is an array created a few lines above the `exec()` function.

> This task only uses `getInput()` and `exec()` functions, but there are many other functions worth having a look. [This document](https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/docs/azure-pipelines-task-lib.md) is the official reference.

And finally, if there's any error occurs, the entire process stops and throws the error back to the pipeline so that the pipeline itself can handle this error, by using the `try...catch` block.

### Implementing `deploy` Task

This time, let's implement the `deploy` task. The overall process is the same as the `install` task writing. First of all, create the `index.ts` file under the `deploy` folder and enter the boilerplate code in it. Then fill up the `run()` function with the following:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=deploy.ts

This task will eventually run the command:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-deploy.cmd

Therefdore, the `task.json` receives many values from the UI and they will be used in this function. You can focus a few functions here in this task snippet – `getInput()` for string input, `getPathInput()` for path input, and `getBoolInput()` for boolean input.

### Testing on Local Machine

All implementations have completed! Now it's time for testing the extension locally. I'm not covering unit test bits and pieces here in this post, but covering to confirm whether the extension works or not. Run the following command at the `src` folder, as there is `tsconfig.json`.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=tsc-compile.cmd

Now all `.ts` files have been compiled to `.js` files. Check whether both `install/index.js` and `deploy.index.js` exist. By the way, we need to pass the `version` value to the `install` task. But the `run()` function doesn't accept any parameter. How can we pass the value, then? As the `getInput()` function passes the value, we need to prepare the value for it to identify. According to the [official document](https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task#run-the-task), those values are set to the environment variables. Therefore run the following command, depending on your platform.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=set-environment-variable.cmd

Once it's set, run the following command to run the `install` task.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=node-run.cmd

Now we can confirm that the `install` task has been run in your local machine. Likewise, `deploy/index.js` can be run in the same way.

* * *

So far, we've implemented the Azure DevOps extension. Once everything is done, the folder structure might look like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/06/building-azure-devops-extension-on-azure-devops-2-02.png)

As we complete development, we need to publish this extension to Marketplace. Let's discuss how to register a publisher for the extension in the [next post](https://devkimchi.com/2019/07/10/building-azure-devops-extension-on-azure-devops-3/).

## More Readings

- [Add Build or Release Task](https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task)
- [Azure Pipelines Task SDK](https://github.com/microsoft/azure-pipelines-task-lib)
- [Azure Pipelines Task SDK for node.js](https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/README.md)
- [Azure Pipelines Task SDK - TypeScript API](https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/docs/azure-pipelines-task-lib.md)
- [Azure Pipelines Tasks](https://github.com/microsoft/azure-pipelines-tasks)
- [Netlify CLI (Docs)](https://www.netlify.com/docs/cli/)
- [Netlify CLI (npm Package)](https://www.npmjs.com/package/netlify-cli)
- [Netlify Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)
- [Netlify Extension (Source Codes)](https://github.com/aliencube/AzureDevOps.Extensions/tree/master/Netlify)
