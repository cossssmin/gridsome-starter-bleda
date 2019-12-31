---
title: "ASP.NET Core 팁 & 트릭 - IoC 콘테이너로써 Autofac 사용하기"
date: "2016-02-20"
slug: aspnet-core-tips-and-tricks-using-autofac-as-ioc-container
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- ASP.NET Core
- Autofac
- Dependency Injection
- IoC
fullscreen: false
cover: ""
---

> 이 포스트는 ASP.NET Core 프레임워크로 애플리케이션을 개발할 때 유용하게 쓸 수 있는 몇가지 팁과 트릭들을 소개하는 포스트들 중 첫번째입니다.
> 
> - **IoC 콘테이너로써 Autofac 사용하기**
> - [Web API 요청/응답 직렬화/비직렬화](http://blog.aliencube.org/ko/2016/02/21/aspnet-core-tips-and-tricks-request-response-serialisation-deserialisation)
> - [Web API Swagger 설정](http://blog.aliencube.org/ko/2016/02/22/aspnet-core-tips-and-tricks-integrating-swagger)
> - [글로벌 에러 핸들러 설정](http://blog.aliencube.org/ko/2016/03/21/aspnet-core-tips-and-tricks-global-exception-handling)
> - POCO 콘트롤러 작성

ASP.NET Core 애플리케이션은 이미 IoC 콘테이너를 내장하고 있어서 그것을 그대로 사용하는 것에 크게 문제가 없다. 다만 이미 [Autofac](http://autofac.org)을 다른 프로젝트에서 사용하고 있었고, 동일한 개발 경험을 가져가고 싶다면 어떻게 하는 것이 좋을까? 이 포스트에서는 Autofac을 IoC 콘테이너로써 사용하는 방법에 대해 간단하게 논의해 보도록 한다.

관련 샘플 코드는 아래 링크에서 확인할 수 있다.

- [https://github.com/devkimchi/ASP.NET-Core-Tips-and-Tricks-Sample](https://github.com/devkimchi/ASP.NET-Core-Tips-and-Tricks-Sample)

## ASP.NET Core 프레임워크 사용하기

먼저 Core 프레임워크에서 제공하는 방법으로 IoC 콘테이너를 구현해 보자. 내장 IoC 콘테이너가 제공하는 오퍼레이션 타입은 총 네가지가 있다.

- `Transient`: 리퀘스트를 받을 때마다 생성됐다가 없어졌다가를 반복한다. 가장 일반적인 형태.
- `Scoped`: 요청받으면 처음 한 번 생성되고 계속 쓰인다.
- `Singleton`: 싱글톤으로 한 번 생성되고 계속 쓰인다.
- `Instance`: 처음 한번 생성된다. 서비스 레벨에서 직접 인스턴스를 생성해야 함.

뭔가 복잡한가? 그렇다면 [공식 문서](http://docs.asp.net/en/latest/fundamentals/dependency-injection.html)를 참조하도록 하자. 내장 IoC 콘테이너를 이용해서 의존성 주입을 하는 코드는 아래와 같다.

https://gist.github.com/justinyoo/4809b3de195a1ce3eed5

위 코드에서는 `ValueService` 클라스를 `IValueService` 인터페이스 타입으로 주입시킨다고 정의하고 있다. 이를 이용해서 `ValuesController`의 생성자에 의존성을 주입하는 것은 이전과 동일하다. 이런 식으로 해서 내장 IoC 콘테이너를 이용해서 의존성 주입을 할 수 있다. 이정도만 해도 사실 충분하긴 한데 Autofac 라이브러리를 써봤다면 이정도만 가지고는 뭔가 아쉽다. 그렇다면 Autofac 라이브러리는 어떻게 사용할 수 있을까?

## Autofac 라이브러리 사용하기

우선 최신 `Autofac` 라이브러리를 NuGet 에서 받아온다. 이 글을 쓰는 현재 `Autofac`의 최신 버전은 `4.0.0-rc1-177`이다. 패키지 설치후 `ConfigureServices()` 메소드 코드를 아래와 같이 수정할 수 있다.

https://gist.github.com/justinyoo/63c1bc167d3566148611

어떤 차이가 보이는가?

- `ConfigureServices()` 메소드의 리턴 타입이 `void`에서 `IServiceProvider`로 바뀌었다.
- `Populate()` 메소드를 호출하여 호출 직전 `RegisterType<T>()` 메소드로 정의해 놓았던 디펜던시들을 모두 `IServiceCollection` 인스턴스에 등록시킨다.
- `Resolve<IServiceProvider>()` 메소드를 호출하면 정의한 모든 디펜던시들을 `IServiceProvider`에 구현하고 이렇게 구현된 디펜던시들을 직접 콘트롤러에서 사용할 수 있게 된다.

이렇게 `Autofac` 라이브러리를 이용해서 의존성 관리를 하는 것에 대해 살펴보았다. [다음 포스트](http://blog.aliencube.org/ko/2016/02/21/aspnet-core-tips-and-tricks-request-response-serialisation-deserialisation)에서는 Web API 직렬화 및 비직렬화 설정에 대해 논의해 보도록 하자.
