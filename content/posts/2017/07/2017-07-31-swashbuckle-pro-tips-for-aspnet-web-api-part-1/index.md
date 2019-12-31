---
title: "Swashbuckle 이용시 알아두면 좋을 소소한 팁 #1"
date: "2017-07-31"
slug: swashbuckle-pro-tips-for-aspnet-web-api-part-1
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- web-api
- open-api
- swagger
- swashbuckle
fullscreen: false
cover: ""
---

- Swashbuckle 이용시 알아두면 좋을 소소한 팁 #1
- [Swashbuckle 이용시 알아두면 좋을 소소한 팁 #2](http://blog.aliencube.org/ko/2017/08/03/swashbuckle-pro-tips-for-aspnet-web-api-part-2/)
- [Swashbuckle 이용시 알아두면 좋을 소소한 팁 #3](http://blog.aliencube.org/ko/2017/08/21/swashbuckle-pro-tips-for-aspnet-web-api-part-3/)

ASP.NET Web API 애플리케이션을 개발하면 빠지지 않는 것이 바로 [Swagger 문서](https://swagger.io) 생성이다. [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle)을 사용하면 이 작업을 굉장히 손쉽게 할 수 있다. 하지만, 이 라이브러리는 Swagger 스펙을 100% 구현하지 않았다. 필수적으로 쓰여야 하는 부분들을 제외하고는 크게 중요치 않은 부분은 확장 기능으로 보완할 수 있게끔 확장 인터페이스를 제공한다. 이 포스트에서는 바로 이 Swashbuckle 라이브러리를 사용할 때 필요한 확장 기능에 대해 다뤄 보도록 한다.

> 이 포스트에 사용된 코드 샘플은 [이곳](https://github.com/devkimchi/Swashbuckle-Tips-Sample-for-ASP.NET-Web-API)에서 확인할 수 있다.

## 참고사항

이 포스트에 사용한 애플리케이션은 아래 스펙으로 만들어졌다:

- [ASP.NET Web API](https://docs.microsoft.com/en-us/aspnet/web-api/)
- [Swagger (Open API) Spec 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)

## Operation 객체 내 `consumes`, `produdes` 정의

API 각각의 엔드포인트는 `GET`, `POST`, `PUT`, `PATCH`, `DELETE` 등의 다양한 메소드를 제공한다. 이를 Swagger에서는 [operation](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#operationObject)이라고 부르는데, 각각의 operation 마다 HTTP 요청시 어떤 문서 타입을 지정할 수 있는지 (`consumes`), 응답 객체 반환시 어떤 문서 타입으로 반환할 지 (`produces`) 지정할 수 있다. 따라서, Swashbuckle을 이용해 Swagger 문서를 만들면 아래와 같은 페이지를 만나게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/swashbuckle-pro-tips-for-aspnet-web-api-part-1-01.png)

즉, Swashbuckle은 요청 객체의 문서 타입을 별도로 지정하지 않는 이상 Web API 초기 설정인 `application/json`, `text/json`, `application/xml`, `text/xml`, `application/x-www-form-urlencoded`의 다섯 가지 형태를 가정한다. 또한 응답 객체의 문서 타입 역시 초기 설정 값인 `application/json`, `text/json`, `application/xml`, `text/xml`의 네 가지를 지정한다. 아래 자동으로 생성된 문서를 보면 이 사실을 좀 더 정확하게 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/swashbuckle-pro-tips-for-aspnet-web-api-part-1-02.png)

다른 관점에서 말하자면, Swashbuckle이 자동으로 지정해주는 문서 타입 대신 개발자가 문서 타입을 직접 지정해야 하는 상황에서는 별도 확장 클라스를 지정해야 하는 셈이다. Swashbuckle은 이 확장 기능을 위해 `IOperationFiler` 인터페이스를 제공한다. 따라서, 이를 이용해 해당 기능을 확장시켜 보도록 한다.

## `SwaggerConsumesAttribute` 데코레이터 구현

먼저 Web API 액션에 적용할 간단한 데코레이터를 하나 작성한다. 이 데코레이터를 이용해 가능한 문서 타입을 정의한다.

https://gist.github.com/justinyoo/6051590292813dc6c8ab1917caaff046

이 데코레이터가 하는 일은 그저 `application/json`, `text/html` 등과 같은 컨텐츠 타입을 정의해서 `consumes` 필드에 전달해 주는 것에 불과하다. 이제 실제로 Swashbuckle 라이브러리에 통합시켜 보도록 하자.

## `Consumes` 필터 구현

앞서 언급한 바와 같이 `Consumes` 필터 클라스를 `IOperationFilter` 인터페이스를 이용해서 아래와 같이 구현한다.

https://gist.github.com/justinyoo/eba32f6fc804f7d4a9c4a93a79b6b271

위에서 구현한 `SwaggerConsumerAttribute` 데코레이터를 우선 확인하고 거기에 정의된 모든 컨텐츠타입을 `operation.consumes` 필드로 넘겨준다. 이를 바탕으로 Web API의 액션 메소드에 아래와 같이 적용시켜 보도록 하자.

https://gist.github.com/justinyoo/71b1b4006b97e425cca326eb9d98b46b

이제 Web API를 실행시켜 보면 아래와 같은 결과를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/swashbuckle-pro-tips-for-aspnet-web-api-part-1-03.png)

## `SwaggerProducesAttribute` 데코레이터 및 `Produces` 필터 구현

같은 방법으로 `SwaggerProducesAttribute` 데코레이터와 `Produces` 필터 클라스를 아래와 같이 구현한다.

https://gist.github.com/justinyoo/028b1646a66ad5e61e16fd90d54f2838

https://gist.github.com/justinyoo/16f6d0f49cd1334a25f44e4004e4bbac

그리고 Web API 액션 메소드에 적용시켜 보면 아래와 같다.

https://gist.github.com/justinyoo/9590b21cd0bdb84296a67c37cf053135

Web API 애플리케이션을 실행시켜 Swagger 정의를 확인해 보면 아래와 같이 원하는 대로 설정된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/swashbuckle-pro-tips-for-aspnet-web-api-part-1-04.png)

지금까지 Swashbuckle 라이브러리를 사용할 때 간단한 확장 필터 기능을 이용해 Swagger 정의 문서 스펙에서 빠진 부분을 보충하는 방법에 대해 알아 보았다. 다음 포스트에서는 또다른 확장 기능에 대해 알아보도록 한다.
