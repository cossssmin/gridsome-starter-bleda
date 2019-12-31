---
title: "ASP.NET Core 팁 & 트릭 - 요청과 응답 직렬화 및 비직렬화"
date: "2016-02-21"
slug: aspnet-core-tips-and-tricks-request-response-serialisation-deserialisation
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- asp-net-core
- deserialisation
- serialisation
- web-api
fullscreen: false
cover: ""
---

> 이 포스트는 ASP.NET Core 프레임워크로 애플리케이션을 개발할 때 유용하게 쓸 수 있는 몇가지 팁과 트릭들을 소개하는 포스트들 중 두번째입니다.
> 
> - [IoC 콘테이너로써 Autofac 사용하기](http://blog.aliencube.org/ko/2016/02/20/aspnet-core-tips-and-tricks-using-autofac-as-ioc-container)
> - **Web API 요청/응답 직렬화/비직렬화**
> - [Web API Swagger 설정](http://blog.aliencube.org/ko/2016/02/22/aspnet-core-tips-and-tricks-integrating-swagger)
> - [글로벌 에러 핸들러 설정](http://blog.aliencube.org/ko/2016/03/21/aspnet-core-tips-and-tricks-global-exception-handling)
> - POCO 콘트롤러 작성

Web API 애플리케이션을 개발하다보면 반드시 고려해야 하는 사항들 중 하나가 바로 요청과 응답 객체들을 JSON 포맷으로 직렬화 혹은 비직렬화하는 것이다. Web API 2.x 까지는 내부적으로 [`JsonMediaTypeFormatter`](https://msdn.microsoft.com/en-us/library/system.net.http.formatting.jsonmediatypeformatter.aspx)를 이용해서 기본적인 JSON 객체 직렬화 및 비직렬화를 파이프라인 단계에서 수행해 왔다. 이 설정을 확장하고자 한다면, `Global.asax.cs` 혹은 `Startup.cs` 안에서 [`HttpConfiguration`](https://msdn.microsoft.com/en-us/library/system.web.http.httpconfiguration.aspx) 인스턴스를 이용해서 아래와 비슷하게 설정했다는 것을 기억할 것이다.

https://gist.github.com/justinyoo/4ff5e319b6d33969813d

위의 내용은

1. JSON 객체의 속성 이름을 `camelCase` 형태로 한다.
2. `enum` 값을 정수형이 아닌 문자열로 저장한다.
3. JSON 객체의 포맷을 적절하게 들여쓰기해서 가독성을 높인다.
4. `null` 값을 가진 속성은 직렬화/비직렬화 과정에서 에러 대신 무시한다.
5. 비슷하게 정의하지 않은 멤버들도 직렬화/비직렬화 과정에서 에러 대신 무시한다.

라는 것이다. 이를 ASP.NET Core 애플리케이션에서는 어떻게 적용시킬 수 있을까? 더이상 `HttpConfiguration` 객체가 존재하지 않기 때문에 위와 같은 방법을 사용할 수 없다. 아래 코드를 잠깐 훑어보도록 하자.

https://gist.github.com/justinyoo/58785e8e8b9f277bb690

[지난 포스트](http://blog.aliencube.org/ko/2016/02/20/aspnet-core-tips-and-tricks-using-autofac-as-ioc-container)에서와 마찬가지로 이번에도 `ConfigureServices()` 메소드를 건드린다.

1. `AddMvc()` 메소드를 호출해서 MVC 아키텍처를 이용한다는 것을 등록한다.
2. `AddMvc()` 메소드가 반환한 인스턴스는 `IMvcBuilder` 인터페이스를 구현한 것이다. 이의 확장 메소드들 중 하나인 `AddJsonOptions()` 메소드를 실행시켜 JSON 객체 직렬화 및 비직렬화 설정을 한다.

관련 샘플 코드는 아래 링크에서 확인할 수 있다.

- [https://github.com/devkimchi/ASP.NET-Core-Tips-and-Tricks-Sample](https://github.com/devkimchi/ASP.NET-Core-Tips-and-Tricks-Sample)

이렇게 해서 요청과 응답시 JSON 객체를 직렬화하고 비직렬화하는 것에 대해 간략하게 살펴보았다. [다음 포스트](http://blog.aliencube.org/ko/2016/02/22/aspnet-core-tips-and-tricks-integrating-swagger)에서는 새롭게 바뀐 Swagger 통합 방법에 대해 알아보도록 하자.
