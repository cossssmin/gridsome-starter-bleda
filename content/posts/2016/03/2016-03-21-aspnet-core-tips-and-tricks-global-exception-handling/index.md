---
title: "ASP.NET Core 팁 & 트릭 – 글로벌 에러 핸들러 설정"
date: "2016-03-21"
slug: aspnet-core-tips-and-tricks-global-exception-handling
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- asp-net-core
- global-exception-handling
fullscreen: false
cover: ""
---

> 이 포스트는 ASP.NET Core 프레임워크로 애플리케이션을 개발할 때 유용하게 쓸 수 있는 몇가지 팁과 트릭들을 소개하는 포스트들 중 네번째입니다.
> 
> - [IoC 콘테이너로써 Autofac 사용하기](http://blog.aliencube.org/ko/2016/02/20/aspnet-core-tips-and-tricks-using-autofac-as-ioc-container)
> - [Web API 요청/응답 직렬화/비직렬화](http://blog.aliencube.org/ko/2016/02/21/aspnet-core-tips-and-tricks-request-response-serialisation-deserialisation)
> - [Web API Swagger 설정](http://blog.aliencube.org/ko/2016/02/22/aspnet-core-tips-and-tricks-integrating-swagger)
> - **글로벌 에러 핸들러 설정**
> - POCO 콘트롤러 작성

애플리케이션을 개발하다보면 여러가지 신경써야 할 것들 중 하나가 바로 예외처리이다. 왜 예외처리를 해야 하는지에 대해서는 이미 다른 문서들에 충분히 언급이 되어 있으니 여기서 또다시 언급할 필요는 없을 것이다. 이 포스트에서는 ASP.NET Core 애플리케이션에서 어떻게 예외 처리를 하는지에 대해 간단하게 알아보도록 하자.

관련 샘플 코드는 아래 링크에서 확인할 수 있다.

- [https://github.com/devkimchi/ASP.NET-Core-Tips-and-Tricks-Sample](https://github.com/devkimchi/ASP.NET-Core-Tips-and-Tricks-Sample)

## Global Exception Filter

ASP.NET Core 애플리케이션은 기본적으로 OWIN 파이프라인을 따라 요청과 응답이 이루어진다. 따라서, 이미 에러 핸들러 미들웨어가 `UserExceptionHandler()` 라는 익스텐션 메소드가 존재하므로 이를 아래와 같이 사용하면 된다.

https://gist.github.com/justinyoo/6955a665cc6fcaa4f6c6

하지만 좀 더 세밀한 콘트롤을 하고 싶다면 별도의 `GlobalExceptionFilter`를 작성하는 편이 낫다. 아래 코드는 대강의 `GlobalExceptionFilter` 클라스이다.

https://gist.github.com/justinyoo/4c3526deee32f9358557

닷넷 코어 라이브러리에서 제공하는 `IExceptionFilter` 인터페이스를 이용하면 `OnException()` 메소드를 통해 손쉽게 커스텀 에러 핸들러를 구현할 수 있다. 이 `GlobalExceptionFilter` 클라스는 닷넷 코어에서 기본 제공하는 `ILoggerFactory` 인스턴스를 디펜던시로 받아서 에러처리를 할 때 로그를 남기게끔 한다. 이 `ILoggerFactory`를 구현하는 `log4Net`, `NLog`, `ApplicationInsights` 라이브러리도 있으니 이를 이용하면 더욱 더 편리한 로깅 기능을 이용할 수도 있다.

이렇게 만든 클라스를 `Startup.cs`의 `ConfigureServices()` 메소드에서 아래와 같이 호출한다.

https://gist.github.com/justinyoo/9e98ecbe651733a18aa9

이렇게 한 후 실제로 콘트롤러에서 예외를 발생시키면 아래와 같은 로그를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/03/global-exception-handling-01.png)

참 쉽죠?

## OWIN 파이프라인 밖의 예외 처리

위에서 확인한 내용은 OWIN 파이프라인 안에서 요청과 응답 처리시 발생하는 예외들을 처리하는 것이라면, OWIN 파이프라인 밖에서 발생하는 예외는 어떻게 처리할 수 있을까? OWIN 파이프라인 밖은 딱 세군데 뿐이다. `Startup.cs` 클라스의 `Startup()` 생성자, `ConfigureServices()` 메소드, `Configure()` 메소드 이렇게 세군데 뿐인데, 여기서 예외처리가 가능한 부분은 `Configure()` 메소드 밖에 없다. 아래 코드를 살짝 보도록 하자.

https://gist.github.com/justinyoo/269f45544ee710417353

콘트롤러라든가 콘트롤러에서 호출하는 다른 레이어에서 발생하는 예외들은 모두 `GlobalExceptionFilter` 클라스가 잡아 처리가 가능하지만 `Startup.cs` 클라스 안에서 발생하는 예외들은 처리할 곳이 여기밖에 없다. 정확하게 말하자면 예외처리를 한 후 브라우저에 적절한 메시지를 보여줄 수 있는 곳이 여기밖에 없다는 것이다. 따라서 `Configure()` 메소드 안에서 `try...catch` 구문을 사용해서 예외 처리후 응답 메시지를 작성해서 보여줘야 한다.

여기서 눈썰미가 있는 사람이라면 어째서 `Configure()` 메소드에서만 이런 처리가 가능한지 금방 알아챘을 것이다. 도대체 무엇 때문일까? 바로 `IApplicationBuilder` 인스턴스가 구현하는 `Run()` 메소드 때문이다. `Run()` 메소드는 `HttpContext` 인스턴스를 이용해서 직접 `Response` 프로퍼티를 제어할 수 있다. 하지만 나머지 두 곳은 `IApplicationBuilder` 인터페이스가 없기 때문에 이 방법을 사용할 수 없다. 대신 아래와 같이 약간의 트릭을 사용해야 한다.

https://gist.github.com/justinyoo/df11d6f4aa5e1753c30e

우선 `Startup()` 생성자와 `ConfigureServices()` 메소드 안의 코드들을 `try...catch` 구문으로 감싼다. 그리고, 내부적으로 미리 만들어 놓은 `Dictionary<string, List<Exxception>>` 필드에 에러가 생길 때마다 차곡차곡 쌓아두도록 한다. 그리고 에러를 모아둔 필드 값에 에러가 하나라도 있으면 그것을 처리하게끔 `Configure()` 메소드를 수정한다.

이렇게 하면 ASP.NET Core 애플리케이션 안에서 발생하는 모든 에러들을 처리할 수 있다. 물론 이것은 샘플 코드이므로, 실제 서비스 환경에서는 좀 더 다듬어야 할 것이다. 다음 포스트에서는 ASP.NET Core 애플리케이션에서 새롭게 도입된 POCO 콘트롤러에 대해 알아보도록 하자.
