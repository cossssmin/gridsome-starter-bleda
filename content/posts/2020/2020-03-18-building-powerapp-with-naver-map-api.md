---
title: "Building PowerApps with Naver Map API"
slug: building-powerapp-with-naver-map-api
description: "This post discusses how to integrate Naver Map API on PowerApps. It's not possible to integrate Naver Map API directly with PowerApps, but we can get through this with a small facade."
date: "2020-03-18"
author: Justin-Yoo
tags:
- azure-functions
- powerapps
- naver-map-api
- facade
cover: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/building-powerapp-with-naver-map-api-00.png
fullscreen: true
---

[Power Apps][power apps] is literally a powerful solution that requires low-code or no-code to build. To build an app, you don't need to understand how the programming language works. Instead, as long as you know how your business works, you can build an app. If you integrate [Power Automate][power automate] on top of it, one of the [Power Platform][power platform] families, it synergies even better.

A few days ago, I watched a YouTube video from an MVP [Shane Young][mvp shane]. In his post, he showed how to integrate Google Maps API with his [Power Apps][power apps]. It looked straightforward. As a first-timer of Power Apps developer, I felt even easier to make my own app!

But, I just realised that Google Maps doesn't work well in Korea due to government regulation. Instead, Naver Map is widely used for most services. Then, can I use it for [Power Apps][power apps]? In this post, I'd like to discuss how I can integrate Naver Map API with [Power Apps][power apps].


## The Limitations on Nave Map API ##

There are several APIs for Naver Map, but we're going to use the [Static Map API][naver api static map] service. We can call the API by a simple `GET` method. There are two endpoints by the way:

1. `/map-static/v2/raster`: This API requires both Client ID and Client Secret through the request header.
2. `/map-static/v2/raster-cors`: This API requires the Client ID through the querystring parameter.

We can't use the header approach on [Power Apps][power apps]. Instead, we should use the second option &ndash; querystring. However, there's a problem with this approach, as well. For the service principal of the Naver Map API, we have to declare 1) Android package name, 2) iOS bundle ID, or 3) web service URL.

![][image-01]

As it's a sort of common approach amongst all cloud service provider, it won't be an issue by itself. However, there are other types of apps not coming from either Android or iOS. Therefore, usually, the web service URL is used as an identifier. Nothing more. However, Naver Map API values more on the web service URL, which considers as a referrer. Due to this reason, we can't directly use the Naver MAP API endpoints within a Power App. If you insist, you will only be able to see the blank image.

![][image-02]

As we're a consumer of the APIs, we have to respect their API policy. Therefore, we should find a workaround. If we use [Postman][postman] and add a referrer like below, we can see the image.

![][image-03]

Therefore, in order for [Power Apps][power apps] to use Naver Map API, we should find a way to add the referrer into the header. It can't be done by [Power Apps][power apps] itself; we could combine a facade for it if it's OK to change the architecture.


## Azure Functions as a Facade ##

How can we build a facade for [Power Apps][power apps], then? The easiest way could be a serverless application like an [Azure Functions][az func] endpoint. Why [Azure Functions][az func]? We don't need to set up infrastructure but write a very simple code. The code might look like this:

https://gist.github.com/justinyoo/18966c960fa9b97fd7b264aa911f7420?file=naver-map-api-facade.cs&highlights=12,18

Nothing fancy. All the code does is to pass all the querystring parameters and the referrer header, as you can see line #18. Once you build this app, then you can call the [Azure Functions][az func] endpoint through [Postman][postman].

![][image-04]

Now, let's apply this change to [Power Apps][power apps].

![][image-05]

Now we can see the Naver Map on [Power Apps][power apps]! Once the [Azure Functions][az func] app is deployed to Azure, simply replace `localhost:7071` with the real instance name.

---

So far, we've discussed how we can leverage an [Azure Functions][az func] app as a facade, in case we can't directly access to a third-party API from [Power Apps][power apps]. In fact, I just use an [Azure Functions][az func] code, but we can use either [Power Automate][power automate] or [Logic App][az logapp]. The main idea for [Power Apps][power apps] is how to make use of a facade pattern. I'll leave either [Power Automate][power automate] or [Logic App][az logapp] facade to you.


[image-01]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/building-powerapp-with-naver-map-api-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/building-powerapp-with-naver-map-api-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/building-powerapp-with-naver-map-api-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/building-powerapp-with-naver-map-api-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/devkimchi/2020/03/building-powerapp-with-naver-map-api-05.png

[mvp cana]: https://mvp.microsoft.com/PublicProfile/5001865
[mvp shane]: https://twitter.com/ShanesCows

[youtube oms]: https://www.youtube.com/channel/UCpLJu170ddf2qnpYlvsxobA

[power platform]: https://powerplatform.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
[power automate]: https://flow.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
[power apps]: https://powerapps.microsoft.com/?WT.mc_id=devkimchicom-blog-juyoo
[power apps shane]: https://appsbuilders.org/guides/powerapps-google-maps-api-build-your-first-app/

[naver api static map]: https://apidocs.ncloud.com/en/ai-naver/maps_static_map/

[postman]: https://www.postman.com/

[az func]: https://docs.microsoft.com/azure/azure-functions/functions-overview?WT.mc_id=devkimchicom-blog-juyoo
[az logapp]: https://docs.microsoft.com/azure/logic-apps/logic-apps-overview?WT.mc_id=devkimchicom-blog-juyoo
