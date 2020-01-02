---
title: "Static Code Analysis with .editorconfig"
date: "2019-09-25"
slug: static-code-analysis-with-editorconfig
description: ""
author: Justin-Yoo
tags:
- dotnet
- static-code-analysis
- fxcop
- stylecop
- editorconfig
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/static-code-analycis-with-editorconfig-00.png
---

Generally speaking, either an application or a system is built mostly by a team or a group of people. One of the first exercises building a dev team is to set up a standard development environment and configuration. It is because the whole team needs to have the same standard to avoid situations like "It works on my machine!". One of the activities of the typical development environment setup is "coding conventions". To achieve this, adding the `.editorconfig` file to the development source code is a good approach. Throughout this post, I'm going to discuss how we use the `.editorconfig` for C# static code analysis and coding style conventions.

## `.editorconfig`

According to [EditorConfig.org](https://editorconfig.org/), they define themselves like:

> EditorConfig helps maintain consistent coding styles for multiple developers working on the same project across various editors and IDEs. The EditorConfig project consists of a file format for defining coding styles and a collection of text editor plugins that enable editors to read the file format and adhere to defined styles. EditorConfig files are easily readable, and they work nicely with version control systems.

In other words, we define the `.editorconfig` file and simply put it into the root directory of the project. Then it provides indications of how consistently we keep our coding style. Of course, we can have the control that the project cannot be compiled if there are any coding style violations found. How can we apply the `.editorconfig` into our .NET project?

## FxCop Analyzer

If you have been developing your applications through Visual Studio, you might have heard of code analysis tools like [`FxCop`](https://en.wikipedia.org/wiki/FxCop) and [`StyleCop`](https://en.wikipedia.org/wiki/StyleCop). Both seem to do similar jobs. The former performs analysis against the compiled binaries while the latter does against the source codes. However, since the [Roslyn](https://github.com/dotnet/roslyn) was introduced, instead of `FxCop`, the `FxCop Analyzers` is used. It doesn't even rely on Visual Studio, but can be downloaded as a [NuGet package](https://www.nuget.org/packages/Microsoft.CodeAnalysis.FxCopAnalyzers/) per project.

Using the `FxCop Analyzers` is really simple and easy. Run the following command to download the NuGet package into your project. Full stop. At the time of this writing, the latest version is [2.9.4](https://www.nuget.org/packages/Microsoft.CodeAnalysis.FxCopAnalyzers/2.9.4).

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=dotnet-add-package.sh

Alternatively, you can directly modify the `.csproj` file to install the NuGet package.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=csproj-package.xml

Once the package is installed into your project and compile it, it analyses your code and shows underlines in red (error) and green (warning). Some of you may wonder where the analysis standards come. Microsoft publishes the [.NET Framework Software Design Guidelines](https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/), which is the ground rule of the analysis. Therefore, based on these guidelines, `FxCop Analyzers` perform analysis of our codes. What if our project has slightly different standards? In this case, we can apply custom rule sets. There are pre-defined `.ruleset` files as templates in the NuGet package directory. Copy one of them from there and paste it into our project root.

![](https://sa0blogs.blob.core.windows.net/devkimchi/2019/09/static-code-analycis-with-editorconfig-01.png)

Like the screenshot above, copy the `AllRulesDefault.ruleset` file into our root directory of the project, and update the `.csproj` file.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=csproj-ruleset.xml

Now, our `.csproj` file has the reference to `AllRulesDefault.ruleset`. It looks like the following code snippet. If we change the `Action` attribute to `None`, `Warning` or `Error`, the `FxCop Analyzers` detects the changes and reflects it for analysis.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=default-ruleset.xml

Unfortunately, this `FxCop Analyzers` can't replace `.editorconfig`, so this `.ruleset` file is recommended to use as a complement to it. The complete list of options for `.editorconfig` that supports `FxCop Analyzers` can be found at [this page](https://docs.microsoft.com/en-us/visualstudio/code-quality/fxcop-analyzer-options). As `FxCop Analyzers` keeps continuously being updated, this page is also updated regularly. I hope `.editorconfig` will replace `FxCop Analyzers` sooner rather than later.

## `.editorconfig` as the Alternative of `StyleCop`

The more realistic approach using `.editorconfig` is to replace `StyleCop`. If it is located at the root directory, it automagically analyses the coding style. In addition to this, Visual Studio detects the file and [overrides existing settings specific to the project](https://docs.microsoft.com/en-us/visualstudio/ide/create-portable-custom-editor-options#troubleshoot-editorconfig-settings). You can find the complete list of `.editorconfig` settings at [this page](https://docs.microsoft.com/en-us/visualstudio/ide/editorconfig-code-style-settings-reference).

One of the downsides of this `.editorconfig` is that there is no pre-defined set. Fortunately, [Muhammad Rehan Saeed](https://twitter.com/RehanSaeedUK) opens the [pre-configured `.editorconfig`](https://github.com/RehanSaeed/EditorConfig) file, so you can use this as the starting point. Here are a part of the default settings. You can change the option value to either `true` or `false` and severity to `silent` for ignore, `warning` for warning, or `error` for compile error.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=editorconfig.txt

* * *

So far, we have discussed the way of static code analysis with `.editorconfig`. For coding conventions, it's mature enough to replace `StyleCop`. Although it's not there yet to replace `FxCop Analyzers`, it's just a matter of time. Therefore, in the meantime, the `.ruleset` file should be used to fill the gap.
