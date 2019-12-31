---
title: "ASP.NET Core 팁 & 트릭 - Swagger 통합"
date: "2016-02-22"
slug: aspnet-core-tips-and-tricks-integrating-swagger
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- API Management
- ASP.NET Core
- Swagger
fullscreen: false
cover: ""
---

> 이 포스트는 ASP.NET Core 프레임워크로 애플리케이션을 개발할 때 유용하게 쓸 수 있는 몇가지 팁과 트릭들을 소개하는 포스트들 중 세번째입니다.
> 
> - [IoC 콘테이너로써 Autofac 사용하기](http://blog.aliencube.org/ko/2016/02/20/aspnet-core-tips-and-tricks-using-autofac-as-ioc-container)
> - [Web API 요청/응답 직렬화/비직렬화](http://blog.aliencube.org/ko/2016/02/21/aspnet-core-tips-and-tricks-request-response-serialisation-deserialisation)
> - **Web API Swagger 설정**
> - [글로벌 에러 핸들러 설정](http://blog.aliencube.org/ko/2016/03/21/aspnet-core-tips-and-tricks-global-exception-handling)
> - POCO 콘트롤러 작성

API 개발을 하다보면 다른 애플리케이션에서 쉽게 참조를 할 수 있게끔 만들어야 한다. [예전 포스트: Swagger 및 HAL, AutoRest를 이용한 Web API 서비스 콘트랙트 자동화](http://blog.aliencube.org/ko/2015/10/25/auto-generating-rest-api-service-contract-by-swagger-hal-and-autorest)에서도 언급했더랬는데, API 엔드포인트는 개발자 혹은 기계들에게 좀 더 쉬운 접근성 및 가독성을 제공해야 한다는 것이 포인트이다. 이러한 것을 가능하게 하는 것들이 여러가지가 있지만 그들 중 하나가 [Swagger](http://swagger.io)이다. Swagger는 Azure 서비스 내부적으로는 일종의 de facto 표준처럼 쓰이고 있기도 하기 때문에 Azure 에서 서비스를 하려면 꼭 알아두는 것이 좋다.

관련 샘플 코드는 아래 링크에서 확인할 수 있다.

- [https://github.com/devkimchi/ASP.NET-Core-Tips-and-Tricks-Sample](https://github.com/devkimchi/ASP.NET-Core-Tips-and-Tricks-Sample)

## Web API 2.x 에서 Swagger 설정

이전 버전의 Web API 에서는 Swagger 통합을 아래와 같이 구현한다.

https://gist.github.com/justinyoo/8029b36c6787b4d6f590

설정에 대한 간략한 설명은 아래와 같다.

- `SingleApiVersion()`: API 버전 및 타이틀 설정
- `IgnoreObsoleteActions()`: Obsolete 엔드포인트는 포함시키지 않음
- `IgnoreObsoleteProperties()`: Obsolete 속성은 포함시키지 않음
- `IncludeXmlComments()`: 소스코드에 있는 XML 코멘트들을 엔드포인트 문서화를 위해 포함시킴
- `DescribeAllEnumsAsStrings`: `enum` 값들을 정수형 대신 문자열로 변환시킴
- `UseFullTypeNameInSchemaIds()`: Swagger.json 스키마 파일에 클라스 타입 이름을 Short name 대신 Full name으로 작성함
- `DocExpansion(DocExpansion.List)`: Swagger UI 화면에서 API 엔드포인트를 리스트 형태로 보여줌

## ASP.NET Core 에서 Swagger 설정

[지난 포스트](http://blog.aliencube.org/ko/2016/02/21/aspnet-core-tips-and-tricks-request-response-serialisation-deserialisation)와 마찬가지로 `HttpConfiguration` 클라스는 더이상 존재하지 않고 대신 미들웨어 형태로 Swagger 서비스가 주입되므로, 위와 동일한 설정을 위해서는 `ConfigureServices()` 메소드를 수정해야 한다. 우선 최신 버전의 [`Swashbuckle`](https://www.nuget.org/packages/Swashbuckle) 라이브러리를 NuGet으로부터 다운로드 받는다. 이 글을 쓰는 현재 ASP.NET Core에서 사용할 수 있는 `Swashbuckle`의 최신 버전은 `6.0.0-rc1-final`이다.

NuGet 패키지를 인스톨하고 나면 `Startup.cs` 파일의 `ConfigureServices()` 메소드를 아래와 같이 수정한다.

https://gist.github.com/justinyoo/a6f584a0a8b3ea256909

또한 `Configure()` 메소드를 통해 Swagger를 사용할 수 있게끔 미들웨어를 등록해 주어야 한다.

https://gist.github.com/justinyoo/2f6cf1a3674f38804133

몇가지 눈여겨 봐두어야 할 포인트가 있다.

- `Configure()` 메소드 안에 `UseSwaggerGen()` 미들웨어와 `UseSwaggerUi()` 미들웨어를 별도로 등록한다. 이는 향후 `swagger.json` 스키마 생성과 Swagger UI 문서 생성을 따로 가져가겠다는 의미로 보인다.
- 이와 더불어 `ConfigureServices()` 메소드에서는 스키마 생성과 관련한 옵션과 UI 관련 옵션을 따로 설정할 수 있다. 이전 버전에 가능했던 UI의 자바스크립트 또는 CSS 설정을 커스터마이징할 수 있는 부분은 아직 API가 오픈되지 않았지만 곧 정식 버전이 나오면 가능해질 것으로 예상한다.

이렇게 설정이 끝나고 나면 친숙한 Swagger UI 페이지를 아래와 같이 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/swagger-in-aspnet-core-01.png)

지금까지 ASP.NET Core 애플리케이션에서 Swagger 도큐먼트를 설정하는 방법에 대해 간략하게 논의해 보았다. [다음 포스트](http://blog.aliencube.org/ko/2016/03/21/aspnet-core-tips-and-tricks-global-exception-handling)에서는 에러 핸들링을 위한 `ExceptionFilter` 설정에 대해 논의해 보도록 한다.
