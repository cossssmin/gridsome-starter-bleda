---
title: "Publishing Static Website to Azure Blob Storage via GitHub Actions"
date: "2019-12-13"
slug: publishing-static-website-to-azure-blob-storage-via-github-actions
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- github
- github-actions
- static-website
- vue-js
- gridsome
- azure-cli
- ci-cd
- azure-blob-storage
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/publishing-static-website-to-azure-blob-storage-via-github-actions-00.png
---

GitHub announced that [GitHub Actions](https://github.com/features/actions) has been [generally available](https://github.blog/changelog/2019-11-11-github-actions-is-generally-available/) in November. Since that, there have already been a huge number of Actions on the [marketplace](https://github.com/marketplace?type=actions). As the usage of Actions is pretty simple and straight forward, as long as you know a few key concepts, you can easily get on-board. Throughout this post, I'm going to build a simple static web app and deploy it to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo), through [GitHub Actions](https://github.com/features/actions).

> You can download the sample codes used in this post at this [GitHub repository](https://github.com/devkimchi/PWA-GitHub-Actions-Sample).

## Provisioning Azure Blob Storage

First things first. Let's provision an [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo) to host a static website. You can create the instance through [Azure Portal](https://azure.microsoft.com/features/azure-portal/?WT.mc_id=devkimchicom-blog-juyoo), or [Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=devkimchicom-blog-juyoo) or [Azure PowerShell](https://docs.microsoft.com/powershell/azure/new-azureps-module-az?view=azps-3.1.0&WT.mc_id=devkimchicom-blog-juyoo) commands. I'm going to use [Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=devkimchicom-blog-juyoo) for it. The commands below create an [Azure Resource Group](https://docs.microsoft.com/azure/azure-resource-manager/resource-group-overview?WT.mc_id=devkimchicom-blog-juyoo#resource-groups) and an [Azure Storage Account](https://docs.microsoft.com/azure/storage/common/storage-account-overview?WT.mc_id=devkimchicom-blog-juyoo) instance.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-create.sh

Then, inside the storage account, we need to create a special container for static website hosting. The special container is called `$web`, which is the only container of each Azure Blob Storage. In other words, one Azure Blob Storage can only host one static website. The command below creates the `$web` container automatically by enabling the static website option.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-blob-activate.sh

Now, we need to know the website URL. Let's run the command below:

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-show.sh

After running the command, it returns a massive JSON object that includes:

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-endpoints.json

As you can see, the `web` attribute has the URL of `https://<STORAGE_ACCOUNT_NAME>.<ARBITRARY_VALUE>.web.core.windows.net/`. This is the website URL that we're going to access.

## Generating Static Website

There are many awesome tools for static website generation. It's totally up to your choice, but I'm going to use [gridsome](https://gridsome.org/), based on [Vue.js](https://vuejs.org/). First of all, install the `gridsome` CLI and create a sample project with the following commands.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=gridsome-create.sh

Now we have a very simple web app displaying `Hello World`. I'm not going to dive too deep, as static website generation is not the main topic here. If you want to know more about `gridsome` follow the [official website](https://gridsome.org/). In order to check the website on my local, run the following command:

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=gridsome-run.sh

If you're happy with the result, let's deploy it to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo). Artifacts are located in the `/dist` directory.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=gridsome-build.sh

Please note that both `develop` and `build` command can be run through the `npm run` command. This is particularly important to know because we're going to use both commands later in this post, through [GitHub Actions](https://github.com/features/actions).

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=gridsome-npm.sh

## Manual Publishing Static Website

Both web app and Azure Blob Storage are ready. Let's publish the app manually from the local first. We can use [Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=devkimchicom-blog-juyoo) to publish the website with this following command:

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-blob-upload.sh

If you haven't logged into Azure yet, through [Azure CLI](https://docs.microsoft.com/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=devkimchicom-blog-juyoo), additional parameters like `--account-key`, `--connection-string` or `sas-token` should be provided.

## Automated Publishing Static Website through GitHub Actions

There are [core concepts on GitHub Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions). As a first timer, not all of them need to know, but these four concepts are the most fundamental ones – [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow), [Event](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#event), [Runner](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner) and [Action](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action).

- [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow): The automated process definition to build, test and deploy codes. It contains [Event](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#event), [Runner](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner) and [Action](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action).
- [Event](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#event): It's an event to trigger [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow). For example, events can be code push, pull request, and so on.
- [Runner](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner): It's an operating system to run [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow). GitHub offers pre-configured runners. You can also build a self-hosted runner and use it.
- [Action](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action): [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow) orchestrates many actions inside. Through these actions, the workflow builds, tests and deploy codes, as well as many other tasks under many different scenarios.

The basic structure of [Workflow](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow) looks like:

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=github-actions-workflow-structure.yaml

- `WORKFLOW_NAME`: Name of the workflow. It shows on the GitHub Actions tab. One repository can have multiple workflows.
- `EVENT`: Event to trigger the workflow. For example, the event can be `push`, `pull_request`, `schedule`, and so on.
- `RUNNER`: Operating system to run the workflow. GitHub provided runners are Windows, Linux (Ubuntu) and Mac OS. You can also use your own self-hosted runner.
- `ACTION_NAME`: Name of each action. Usually, it's a short description of the action. eg) `Login to Azure`, `Build App`
- `ACTION`: Action reference.

Now, based on this understanding, let's build the workflow. We used four actions once or multiple times in this workflow.

- [`checkout`](https://github.com/actions/checkout): Download repository into the workflow.
- [`run`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idstepsrun): This is a built-in shell action that does npm package restore, build and test.
- [`azure login`](https://github.com/Azure/login): Login to Azure.
- [`azure cli`](https://github.com/Azure/CLI): Publish the website to Azure Blob Storage through this action.

With a combination of those actions above, here's the sample workflow:

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=github-actions-workflow.yaml

- `on: push`: Only the `push` event triggers this workflow.
- `runs-on`: Linux (Ubuntu) runner is assigned. `ubuntu-latest` means Ubuntu 18.04 LTS at the time of this writing.
- `name: Checkout the repo`: This action downloads the repo into the workflow. This action **MUST** come the very first.
- `name: Login to Azure`: This action logs into Azure. Security credentials are encrypted and stored at the repository settings with the name of `AZURE_CREDENTIALS`, and it's referred to `${{ secrets.AZURE_CREDENTIALS }}`.
- `name: Install npm packages`: This action restores the npm packages. Make sure that the directory traversing **MUST** be considered to find the `packages.json` file; otherwise, it will throw an unexpected consequence.
- `name: Build app`: This action builds the website. Again, make sure the directory traversing first to run the `npm run build` command.
- `name: Test app`: This action tests the web app. Don't forget the directory traversing to run the command, `npm run test:unit`.
- `name: Publish app`: This action publishes the application to Azure Blob Storage. The storage account name is passed from the repository settings and referenced to `${{ secrets.STORAGE_ACCOUNT_NAME }}`.

Save this workflow to the `main.yml` file and locate it into the `.github/workflows` directory. GitHub Actions look for the workflow files under the `.github/workflows` directory. Let's push your code to GitHub, and you'll find the successful result!

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/publishing-static-website-to-azure-blob-storage-via-github-actions-01.png)

Open the Azure Blob Storage URL, and you'll see the static website just published!

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/12/publishing-static-website-to-azure-blob-storage-via-github-actions-02.png)

* * *

So far, we've used [GitHub Actions](https://github.com/features/actions) to publish static website to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=devkimchicom-blog-juyoo). Let's discuss GitHub Actions further down on the following posts.
