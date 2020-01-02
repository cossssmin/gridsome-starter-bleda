---
title: "Azure DevOps Pipelines Refactoring Technics"
date: "2019-09-04"
slug: azure-devops-pipelines-refactoring-technics
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- azure-pipelines
- multi-stage-pipelines
- refactoring
- stages
- jobs
- steps
- templates
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-00.jpg
---

Authoring YAML pipelines on Azure DevOps often tends to be repetitive and cumbersome. That repetition might happen at the tasks level, jobs level or stages level. If we do coding, we do refactoring those repetitive lines. Can we do such refactoring the pipelines? Of course, we can. Throughout this post, I'm going to discuss where the refactoring points are taken.

> The YAML pipeline used for this post can be found at [this repository](https://github.com/devkimchi/Azure-Pipelines-Template-Sample).

## Build Pipeline without Refactoring

First of all, let's build a typical pipeline without being refactored. It is a simple build `stage`, which contains a single `job` that includes one `task`.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-without-template.yaml

Here's the result after running this pipeline. Nothing is special here.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-01.png)

Let's refactor this pipeline. We use [`template`](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema#template-references) for refactoring. According to this document, we can do templating at least three places – `Steps`, `Jobs` and `Stages`.

## Refactoring Build Pipeline at the `Steps` Level

Let's say that we're building a node.js based application. A typical build order can be:

1. Install node.js and npm package
2. Restore npm packages
3. Build application
4. Test application
5. Generate artifact

In most cases, Step 5 can be extra, but the steps 1-4 are almost identical and repetitive. If so, why not grouping them and making one template? From this perspective, we do refactoring at the `Steps` level. If we need step 5, then we can add it after running the template.

Now, let's extract the steps from the above pipeline. The original pipeline has the `template` field under the `steps` field. Extra `parameters` field is added to pass values from the parent pipeline to the refactored template.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-with-steps-template.yaml

The refactored template declares both `parameters` and `steps`. As mentioned above, the `parameters` attribute gets values passed from the parent pipeline.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-stages-build.yaml

After refactoring the original pipeline, let's run it. Can you see the value passed from the parent pipeline to the steps template?

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-02.png)

Now, we're all good at the `Steps` level refactoring.

## Refactoring Build Pipeline at the `Jobs` Level

This time, let's do the same at the `Jobs` level. Refactoring at the `Steps` level lets us group common tasks while doing at the `Jobs` level deals with a bigger chunk. At the `Jobs` level refactoring, we're able to handle a build agent. All tasks under the steps are fixed when we call the `Jobs` level template.

> Of course, if we use some advanced template expressions, we can control tasks.

Let's update the original pipeline at the `Jobs` level.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-with-jobs-template.yaml

Then create the `template-jobs-build.yaml` file that declares the `Jobs` level template.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-jobs-build.yaml

Once we run the pipeline, we can figure out what can be parameterised. As we set up the build agent OS to `Windows Server 2016`, the pipeline shows the log like:

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-03.png)

## Refactoring Build Pipeline at the `Stages` Level

This time, let's refactor the pipeline at the `Stages` level. One stage can have multiple `job`s at the same time or one after the other. If there are common tasks at the `Jobs` level, we can refactor them at the `Jobs` level, but if there are common `job`s, then the `stage` itself can be refactored. The following parent pipeline calls the `stage` template with parameters.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-with-stages-template.yaml

The `stage` template might look like the code below. Can you see the build agent OS and other values passed through parameters?

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-stages-build.yaml

Let's run the refactored pipeline. Based on the parameter, the build agent has set to `Ubuntu 16.04`.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-04.png)

## Refactoring Build Pipeline with Nested Templates

We've refactored in at three different levels. It seems that we might be able to put them all together. Let's try it. The following pipeline passes Mac OS as the build agent.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-with-nested-stages-template.yaml

The parent pipeline calls the nested pipeline at the `Stages` level. Inside the nested template, it again calls another template at the `Jobs` level.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-stages-nested-build.yaml

Here's the nested template at the `Jobs` level. It calls the existing template at the `Steps` level.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-jobs-nested-build.yaml

This nested pipeline works perfectly.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-05.png)

* * *

The build pipeline has been refactored at different levels. Let's move onto the release pipeline.

## Release Pipeline without Refactoring

It's not that different from the build pipeline. It uses the `deployment job` instead of `job`. The typical release pipeline without using a template might look like:

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-without-template.yaml

Can you find out the `Jobs` level uses the `deployment` job? Here's the pipeline run result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-06.png)

Like the build pipeline, the release pipeline can also refactor at the three levels – `Steps`, `Jobs` and `Stages`. As there's no difference between build and release, I'm going just to show the refactored templates.

## Refactoring Release Pipeline at the `Steps` Level

The easiest and simplest refactoring is happening at the `Steps` level. Here's the parent pipeline.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-with-steps-template.yaml

And this is the `Steps` template. There's no structure different from the one at the build pipeline.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-steps-release.yaml

This is the pipeline run result.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-07.png)

## Refactoring Release Pipeline at the `Jobs` Level

This is the release pipeline refactoring at the `Jobs` level.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-with-jobs-template.yaml

The refactored template looks like the one below. Each `deployment job` contains the `environment` field, which can also be parameterised.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-jobs-release.yaml

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-08.png)

## Refactoring Release Pipeline at the `Stages` Level

As the refactoring process is the same, I'm just showing the result here:

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-with-stages-template.yaml

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=tmplate-stages-release.yaml

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-09.png)

## Refactoring Release Pipeline with Nested Templates

Of course, we can compose the release pipeline with nested templates.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-with-nested-stages-template.yaml

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-stages-nested-release.yaml

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-jobs-nested-release.yaml

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/08/azure-devops-pipelines-refactoring-technics-10.png)

* * *

So far, we've completed refactoring at the `Stages`, `Jobs` and `Steps` levels by using templates. There must be a situation to use refactoring due to the nature of repetition. Therefore, this template approach should be considered, but it really depends on which level the refactoring template goes in because every circumstance is different.

However, there's one thing to consider. Try to create templates as simple as possible. It doesn't really matter the depth or level. The template expressions are rich enough to use advanced technics like conditions and iterations. But it doesn't mean we should use this. When to use templates, the first one should be small and simple, then make them better and more complex. The multi-stage pipeline feature is outstanding, although it's still in public preview. It would be even better with these refactoring technics.
