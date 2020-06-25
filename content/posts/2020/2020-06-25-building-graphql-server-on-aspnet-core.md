---
title: "Building GraphQL Server on ASP.NET Core"
slug: building-graphql-server-on-aspnet-core
description: "This post shows how to implement an ASP.NET Core application as a GraphQL API server."
date: "2020-06-25"
author: Justin-Yoo
tags:
- graphql
- aspnet-core
- graphql-dotnet
- graphql-server
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/building-graphql-server-on-aspnet-core-00.png
fullscreen: true
---

[GraphQL][graphql] is a query language [led by Facebook][graphql spec], for API. Many use cases are providing GraphQL based API and [GitHub][gh api graphql] is one of them. GraphQL is useful, especially for front-end applications and mobile apps that cover most user interactions on the client-side. This post and its series discuss building GraphQL server/client using .NET Core based application, including [ASP.NET Core][aspnet core].

* ***Building GraphQL Server on ASP.NET Core***
* Building GraphQL Server on ASP.NET Core for Headless Wordpress
* Migrating GraphQL Server to Azure Functions in .NET Core
* Building GraphQL Server on Azure Functions in JavaScript
* Building Simple CMS with Blazor Web Assembly, with GraphQL and Headless Wordpress

> The sample code used in this post can be found at this [GitHub repository][gh sample].


## How Attractive Is GraphQL, Comparing to REST API? ##

If I am asked this question,

> Well, probably yes? I'm not too sure for now.

Would be my answer. One thing I noticed on GraphQL is that it solves both `over-fetching` and `under-fetching` issues that REST API has. As REST API has its fixed schema, when I call an API request to a specified endpoint, I expect that the endpoint always returns the data with the same data structure. Here's an example of REST API endpoints for a blogging system.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=01-api-list.txt

In many cases, I should call multiple endpoints to aggregate data that I want. For example, sending a request to `/posts` returns the list of posts with `authorId`, not the author details. Therefore, I should send another request to `/authors/{authorId}` with the `authorId` value multiple times. This is called `under-fetching` because of the API's flat structure. To solve this `under-fetching` issue, either [BFF (Backends for Frontends) pattern][pattern bff] or [Gateway Aggregation pattern][pattern ga], or combination of both is used. But still, there are "multiple requests" happening for aggregation.

On the other hand, if the API has nested structures, the payload might be too verbose. For example, sending a request to `/posts` doesn't only return `authorId` but also includes all author details. I only need the authors' ID and name, but other details are also returned. This is called `over-fetching`. [GitHub REST API][gh api] is a typical example of `over-fetching`. The problem of `over-fetching` is too verbose and expensive due to the high network IO consumption.

What if I can compose an API request that I want to receive? What if the front-end application has an ability to compose data request structure, rather than relying on the API server-side? I think GraphQL changes the controllability from the server-side to client-side.

So, why not building a GraphQL server then? It sounds fun!


## Building GraphQL Server on ASP.NET Core Application ##

As GraphQL is another type of API server, we can use [any programming language][graphql lang]. We're going to use [ASP.NET Core][aspnet core] and there are [several .NET implementations][graphql lang dotnet]. Let's use the most popular one, [`graphql-dotnet`][gh graphql dotnet].

> If you are not familiar with GraphQL with ASP.NET Core, I would recommend [Glenn Block][gblock twitter]'s awesome online lecture on [LinkedIn Learning][gblock linkedin learning]. I reorganised my app based on his instruction.

First of all, let's create a C# class library project. It has all the logic for GraphQL server.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=02-dotnet-new-postsql.sh

Then add a NuGet package. That's it for the project setting. The latest stable version of [`GraphQL`][nuget graphql] is `2.4.0`.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=03-dotnet-add-packages.sh


### Defining Models ###

Let's define `Post` and `Author` like below:

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=04-models.cs


### Defining Services to Data ###

Let's write a service layer to access data storage. In fact, data storage can be anything, but this time we just use a hard-coded memory DB, which is sufficient for now. As you can see, both `AuthorService` and `PostService` are nothing that special.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=05-services.cs


### Defining GraphQL Schemas ###

We've got codes for data manipulation. Let's build GraphQL schemas that convert existing data models to GraphQL types. `AuthorType` inherits the `ObjectGraphType<T>` class with `Author` (line #1) and exposes its properties.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=06-schemas-type-1.cs&highlights=1

`PostType` also inherits the `ObjectGraphType<T>` class with `Post` (line #13). We define the `PostStatusEnum` class inheriting `EnumerationGraphType` (line #1), which converts the `PostStatus` enum value (line #26). In addition to this, `AuthorType` is combined based on the `authorId` value (line #25).

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=07-schemas-type-2.cs&highlights=1,13,25,26

Let's build a query object, `PostsQuery`. It contains `posts` that returns all the list of `PostType` as an array (line #11-13). It also contains `post` that returns a single `PostType` corresponding to a specified ID (line #15-19).

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=08-schemas-query.cs&highlights=11-13,15-19

Finally, let's expose all those schemas to UI, using `PostsSchema`. It injects the `PostsQuery` instance and `IDependencyResolver` instance that resolves other instances injected.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=09-schemas-schema.cs&highlights=3

We've got all GraphQL data and service contract definitions. Let's build the server with [ASP.NET Core][aspnet core]!


### Building ASP.NET Core UI ###

Create an empty ASP.NET Core project that hosts the GraphQL UI.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=10-dotnet-new-webapp.sh

Add NuGet packages.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=11-dotnet-add-packages.sh

The installed `GraphQL.Server.Core` of version 3.4.0 contains `GraphQL-Parser` of version 3.0.0, but it doesn't get along with each other. Therefore, it should be installed separately. However, the latest version (5.x) of `GraphQL-Parser` is incompatible with the current `GraphQL.Server.Core` version of 3.4.0, which is the known issue. Therefore, we should [install the parser version 4.1.2][so answer].

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=12-dotnet-add-packages.sh

The last NuGet package is for UI. While there are other UI libraries, we use [GraphiQL][graphql ui].

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=13-dotnet-add-packages.sh

And add a reference to the `PostsQL` project.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=14-dotnet-add-references.sh

The ASP.NET Core project settings are over. Let's add dependencies to `Startup.cs`. First of all, add dependencies to the `ConfigureServices()` method (line #5-11). Make sure to add the `IDependencyResolver` instance so that other dependencies can be resolved within GrahpQL (line #13). And finally, add GraphQL schema objects (line #15-17).

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=15-startup.cs&highlights=5-11,13,15-17

We also need to configure the `Configure()` method for GraphiQL UI (line #15-18). And finally, add the default routing table to `/ui/graphql` (line #11).

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=16-startup.cs&highlights=11,15-18

Done! Let's build and run the app.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=17-dotnet-run.sh

It seems to be running! Enter the following URL to access to the UI.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=18-localhost.txt

It's automatically redirected to `https://localhost:5001/ui/graphql`. But it throws an error!

![][image-01]

> `System.InvalidOperationException: Synchronous operations are disallowed. Call ReadAsync or set AllowSynchronousIO to true instead.`

This is because one of the dependencies, `Newtonsoft.Json` doesn't support async operations. To solve this issue, add one line of code to the `ConfigureServices()` method. If you use IIS, replace `KestrelServerOptions` with `IISServerOptions` (line #3).

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=19-startup.cs&highlights=3

Compile all the project again and run the app.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=17-dotnet-run.sh

And enter the following URL through your browser.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=18-localhost.txt

Now, the GraphQL server is up and running as expected!

![][image-02]

Let's run some queries. The first query takes one post with details of `id`, `title`, `slug`, `author id` and `author name` while the second query fetches all posts with `id`, `title` and `published` values.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=20-query.txt

And here's the result.

![][image-03]

Let's recap what we defined in the `PostsQL` project &ndash; `PostType` and `AuthorType`. Although both contain everything we want, the GraphQL server only returns what client requests. That's how GraphQL works. I also wonder how the query request works in a browser. Open a developer tool, and you will find out the request details like:

![][image-04]

With this information, we don't have to rely on the UI. Let's send an API request through Postman.

https://gist.github.com/justinyoo/6ed73a24422011564015012b15cc6bd6?file=21-request.json

It works as expected.

![][image-05]

---

So far, we have built an [ASP.NET Core][aspnet core] server for GraphQL. As many libraries exist in the ecosystem, we were able to build the server easily. I hope this post will give you a high-level idea of building GraphQL server on ASP.NET Core. Let's wrap an existing REST API with GraphQL in the next post.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/building-graphql-server-on-aspnet-core-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/building-graphql-server-on-aspnet-core-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/building-graphql-server-on-aspnet-core-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/building-graphql-server-on-aspnet-core-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/06/building-graphql-server-on-aspnet-core-05.png

[gh sample]: https://github.com/devkimchi/GraphQL-Sample
[gh api]: https://developer.github.com/v3/
[gh api graphql]: https://developer.github.com/v4/
[gh graphql dotnet]: https://github.com/graphql-dotnet/graphql-dotnet

[graphql]: https://graphql.org/
[graphql spec]: http://spec.graphql.org/
[graphql lang]: https://graphql.org/code/
[graphql lang dotnet]: https://graphql.org/code/#c-net
[graphql ui]: https://github.com/graphql/graphiql

[nuget graphql]: https://www.nuget.org/packages/GraphQL

[pattern bff]: https://docs.microsoft.com/azure/architecture/patterns/backends-for-frontends?WT.mc_id=devkimchicom-blog-juyoo
[pattern ga]: https://docs.microsoft.com/azure/architecture/patterns/gateway-aggregation?WT.mc_id=devkimchicom-blog-juyoo

[aspnet core]: https://docs.microsoft.com/aspnet/core/?view=aspnetcore-3.1&WT.mc_id=devkimchicom-blog-juyoo

[gblock twitter]: https://twitter.com/gblock
[gblock linkedin learning]: https://www.linkedin.com/learning/api-development-in-dot-net-with-graphql/welcome

[so answer]: https://stackoverflow.com/questions/55442634/graphql-for-net-error-unmapped-selection-field#answer-58796801
