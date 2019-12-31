---
title: "애저 펑션에 AutoMapper 의존성 주입 적용하기"
date: "2019-01-01"
slug: automapper-di-into-azure-functions
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- asp-net-core
- auto-mapper
- azure-functions
- dependency-injection
- ioc
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/01/automapper-in-azure-functions-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

애플리케이션 개발을 하다보면 데이터 전송을 담당하는 객체(DTO; Data Transfer Object)를 다룰 일이 많다. 특히 데이터베이스 혹은 외부 API를 호출해서 받아오는 결과를 내부적으로 사용한다든지, 반대로 외부로 노출시키기 위한 encapsulation을 위해서 DTO간 매핑은 꽤 중요한 작업인데, 이 때 [AutoMapper](https://automapper.org)를 이용하면 굉장히 편해진다. 꽤 오래 전에 [이와 관련한 포스트](https://blog.aliencube.org/ko/2015/03/24/introducing-automapper/)를 작성한 적이 있었는데, 이번에는 이 AutoMapper를 애저 펑션에 적용시켜 보도록 하자.

> 이 포스트에서 사용한 코드는 [이곳에서 확인할 수 있다](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps).

## AutoMapper 의존성 주입

ASP.NET Core 프로젝트에서 AutoMapper를 사용하기 가장 쉬운 방법은 바로 이 의존성 주입을 통해 매핑 설정을 불러오는 것이다. 애저 펑션에서도 동일하게 ASP.NET Core의 의존성 주입 메카니즘을 사용할 수 있으므로 같은 방식으로 사용하면 된다.

위에 언급한 코드는 애저 Key Vault의 비밀 키 값을 불러오는 애저 펑션 코드이다. AutoMapper 없이 Key Vault호출 결과를 반환한다면 [`SecretBundle`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.keyvault.models.secretbundle) 객체의 구조를 그대로 노출시키게 되는데, 보안 측면에서 썩 좋은 방법은 아니다. 따라서, 이 때 적당한 DTO로 매핑한 후 그 결과를 반환하는 것이 좋다. 아래 코드는 바로 이 매핑을 위한 프로파일을 작성한 것이다.

https://gist.github.com/justinyoo/c20b518aeef74789469c764360076e38?file=profile.cs

이렇게 작성한 프로파일은 아래와 같이 IoC 컨테이너를 통해 의존성 주입이 가능하게끔 만들어진다. `AddAutoMapper()` 메소드를 통해 어셈블리를 등록시켰는데, 이렇게 하면 `Profile` 클라스를 상속받은 모든 클라스들을 한꺼번에 자동으로 등록시키게 된다.

https://gist.github.com/justinyoo/c20b518aeef74789469c764360076e38?file=appmodule.cs

여기서는 애저 펑션 의존성 주입을 위해 [`Aliencube.AzureFunctions.Extensions.DependencyInjection`](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.DependencyInjection/) 패키지를 사용했다.

## 펑션 레벨에서 `IMapper` 사용

위와 같이 IoC 컨테이너 정의를 한 후 아래와 같이 펑션 코드에서 필요한 디펜던시들을 로드한 후 사용하면 된다.

https://gist.github.com/justinyoo/c20b518aeef74789469c764360076e38?file=httptrigger.cs

위에서 필요한 디펜던시들을 모두 로드하면 아래와 같이 개별 클라스에서는 그저 `IMapper` 인스턴스를 사용하기만 하면 된다.

https://gist.github.com/justinyoo/c20b518aeef74789469c764360076e38?file=function.cs

* * *

지금까지 애저 펑션에서 AutoMapper를 의존성 주입 방식을 통해 사용하는 방법에 대해 알아 보았다. 일반적인 웹 애플리케이션과 크게 다르지 않은 방식으로 애저 펑션에서도 의존성 주입 컨테이너를 사용할 수 있게 됐으므로 앞으로는 큰 어려움 없이 AutoMapper를 사용할 수 있을 것이다.
