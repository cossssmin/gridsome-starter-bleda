---
title: "애저 펑션에서 Managed Identity를 이용해 애저 키 저장소에 접근하기"
date: "2019-01-03"
slug: accessing-key-vault-from-azure-functions-with-managed-identity
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure Functions
- Azure Key Vault
- Managed Identity
- Managed Service Identity
- Dependency Injection
- DI
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/01/accessing-key-vault-from-azure-functions-with-managed-identity-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

[지난 포스트](https://blog.aliencube.org/ko/2018/10/24/accessing-key-vault-from-logic-apps-with-managed-identity/)에서는 [애저 로직 앱](https://azure.microsoft.com/en-us/services/logic-apps/)에서 키 저장소로 직접 접근하는 방법에 대해 알아 보았다면, 이번 포스트에서는 [애저 펑션](https://azure.microsoft.com/en-us/services/functions/)에서 키 저장소로 직접 접근하는 방법에 대해 알아보도록 한다. 로직 앱과 펑션 앱 모두 [Managed Identity](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview) 기능을 지원하기 때문에 앱 자체가 [서비스 프린시플](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals)의 역할을 하게 되어 직접 키 저장소에 대한 접근 권한을 지정할 수 있다.

> 이 포스트에서 사용한 코드 예제는 [이곳](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps)에서 찾을 수 있다.

## 애저 펑션의 Managed Identity 기능 활성화 하기

이 기능을 활성화 하는 방법은 굉장히 간단하다. 이미 [애저 앱서비스 관련 문서](https://docs.microsoft.com/en-us/azure/app-service/overview-managed-identity)에서 자세히 다루고 있으므로 여기서는 더이상 언급하지 않도록 한다.

## 애저 펑션에서 키 저장소에 접근하기

앞서 언급한 공식 문서에 따르면 키 저장소에 접근하는 코드는 아래와 같다.

https://gist.github.com/justinyoo/3ae0b1e3d47454b9ed6f9fb4290e1cae?file=get-secret.cs

이후 `secret` 값을 이용해서 뭔가를 하면 된다. 참 쉽죠?

## 의존성 주입 활용하기

사실, 위와 같이 하면 그게 전부이다. 하지만, 의존성 주입 컨테이너를 이용해서 좀 더 모듈화를 시켜 보자. 기본적으로 위의 코드는 `KeyVaultClient` 클라스를 통해 키 저장소에 접근하는데 이 때 내부적으로는 `HttpClient` 인스턴스를 이용한다. 애저 펑션이나 웹 앱에서는 이 `HttpClient` 인스턴스는 싱글톤으로 만들어 놓는 것이 좋으므로 IoC 컨테이너에 아예 `KeyVaultClient`를 등록해 놓고 필요할 때 불러와서 쓰는 것이 낫다.

애저 펑션을 위한 [IoC 컨테이너 패키지](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.DependencyInjection/)를 사용하면 아래와 같이 싱글톤 인스턴스로 등록시킬 수 있다.

https://gist.github.com/justinyoo/3ae0b1e3d47454b9ed6f9fb4290e1cae?file=appmodule.cs

이후 이 IoC 컨테이너를 `IFunctionFactory`를 이용해 초기화 시킨 후 실제 펑션 레벨에서 아래와 같이 사용하기만 하면 된다.

https://gist.github.com/justinyoo/3ae0b1e3d47454b9ed6f9fb4290e1cae?file=get-secret-function.cs

* * *

지금까지 Managed Identity를 이용해서 별다른 인증 없이 애저 펑션에서 직접 키 저장소로 접근하는 방법에 대해 알아보았다. 공식 문서에서 제공하는 기본적인 코드에 의존성 주입 모듈을 이용해 좀 더 의미있는 모듈화 시킬 수 있다면 이전 포스트, [애저 펑션에 AutoMapper 의존성 주입 적용하기](https://blog.aliencube.org/ko/2019/01/02/automapper-di-into-azure-functions/), 와 함께 적용시켜 좀 더 유연한 개발을 할 수도 있을 것이다.
