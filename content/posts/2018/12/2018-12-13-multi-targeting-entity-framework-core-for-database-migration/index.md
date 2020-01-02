---
title: "Multi-Targeting Entity Framework Core for Database Migration"
date: "2018-12-13"
slug: multi-targeting-entity-framework-core-for-database-migration
description: ""
author: Justin-Yoo
tags:
- dotnet
- dotnet-core
- dotnet-standard
- database-migration
- entity-framework-core
- multi-targeting
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2018/12/entityframeworkcore-on-netcoreapp-and-netstandard-00.png
---

[Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) basically supports [.NET Standard 2.0](https://www.nuget.org/packages/Microsoft.EntityFrameworkCore/). Therefore, when you write codes for database, we can simply target `netstandard2.0` in the `.csproj` file like below:

```xml
<TargetFramework>netstandard2.0</TargetFramework>

```

On the other hand, it will become a different story when we attempt the code-first approach for database migration using our code. It has to target `netcoreapp2.1` in the `.csproj` like below:

```xml
<TargetFramework>netcoreapp2.1</TargetFramework>

```

Once we setup the project like this, all other projects referencing this has to target `netcoreapp2.1`; otherwise it won't be compiled. But, are we really sure we should target `netcoreapp2.1` for libraries, other than `netstandard2.0`? As .NET Core is one of the implementations of .NET Standard, unless we're building a end-user applications like web apps or console apps, targeting .NET Standard is the recommended practice and future-proof. In fact, the library containing all database migration details acts as an end-user application. At the same time, it works as a library referenced by other libraries or applications.

In this case, what can we do?

The best practice will be to create a separate project only for database migrations. By doing so, only this migration project targets `netcoreapp2.1` and the other project containing `DbContext` implementation can remain targeting to `netstandard2.0`. But, you know, life is not that easy. In general, those database migration snapshots and `DbContext` implementations live together in one project. In this case, we can use multi-targeting. Let's see this:

```xml
<TargetFrameworks>netstandard2.0;netcoreapp2.1</TargetFrameworks>

```

Like above, modify the `.csproj` file to target both `netstandard2.0` and `netcoreapp2.1` at the same time. Once it's done, the project is compiled for multi-targeting. Then run the dotnet CLI command like this:

```
dotnet ef migrations add ThisMigration --framework netcoreapp2.1
dotnet ef database update --framework netcoreapp2.1

```

Usually the `--framework ***` option is omitted because the project only has one target framework. But, by adding this option with specific framework, `netcoreapp2.1`, the database migration can be done with no issue. As well as, this library can be reference by other project targeting .NET Standard.

Easy huh?
