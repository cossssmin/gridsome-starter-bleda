---
title: "Application Insights 가용성 테스트를 C# 코드로 작성하기"
date: "2016-06-20"
slug: creating-web-tests-for-application-insights-programmatically
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure
- Availability
- Application Insights
- WebTest
fullscreen: false
cover: ""
---

[Azure SDK for .NET](https://azure.microsoft.com/en-us/develop/net)는 아주어 서비스와 리소스들을 이용하는데 굉장히 유용한 기능들을 제공한다. 이러한 기능에는 Application Insights (애플리케이션 인사이트) 역시 포함되어 있는지라 이를 이용하면 손쉽게 애플리케이션 인사이트 리소스 뿐만 아니라 그에 딸린 알림 기능까지도 만들고 수정할 수 있다. 그런데 놀랍게도 웹사이트의 가용성 (Availability) 테스트 관련 부분은 굉장히 불편하게 작성해야 하게끔 되어 있다. 이 포스트에서는 이러한 웹 가용성 테스트 기능을 어떻게 프로그램 내에서 생성하고 수정할 수 있는지에 대래 일아보도록 한다.

## 아주어 포털에서 웹 테스트 생성 및 처리

일단 애플리케이션 인사이트 리소스가 만들어지면, 손쉽게 웹 테스트 리소스를 생성하고 관리할 수 있다. 이는 [웹사이트 반응정도와 가용성 모니터링하기 (영문)](https://azure.microsoft.com/en-us/documentation/articles/app-insights-monitor-web-app-availability) 문서를 읽어보면 쉽게 따라할 수 있는 부분이다. 더이상의 자세한 설명은 생략한다.

## 파워셸에서 웹 테스트 생성 및 처리

아주어 포털에서 웹 테스트를 생성하고 처리하는 방법이 아주 손쉽기는 한데, 이건 전적으로 사람 손을 타야 하는 상황이라서 뭐랄까 DevOps 관점의 자동화라는 측면에서는 바람직하지는 않다. 다행히도 파워셸 스크립트를 통해 자동화할 수 있어서 [파워셸을 이용한 애플리케이션 인사이트 웹 테스트와 알림 생성하기 (영문)](https://azure.microsoft.com/en-us/blog/creating-a-web-test-alert-programmatically-with-application-insights) 문서를 참조하면 손쉽게 진행할 수 있다. 더이상의 자세한 설명은 생략한다.

하지만, 여전히 해결되지 않은 질문이 남아있다. `C# 코드를 이용해서 웹 테스트와 알림을 생성할 수 있을까?` 이 부분은 아직 SDK에서 지원하지 않고 있다. 이제 여기서 이 질문을 해결해 보도록 하자.

> 이 포스트에서 쓰인 샘플 코드는 [https://github.com/aliencube/Application-Insights-WebTests-SDK](https://github.com/aliencube/Application-Insights-WebTests-SDK) 리포지토리에서 찾아볼 수 있습니다.

## 웹 테스트 리소스 구조 분석

[Azure Resource Explorer](https://resources.azure.com) 라는 서비스가 있다. 로그인하면 내 아주어 섭스크립션에 물려있는 리소스들을 JSON 포맷으로 한눈에 볼 수 있다:

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/web-tests-for-app-insights-01.png)

위 스크린샷은 웹 테스트 리소스가 어떻게 생겼는지 대략적으로 보여준다. 이 JSON 객체를 통해 강력한 형식의 (strongly-typed) POCO 클라스를 생성할 수 있다. 이렇게 만들어진 클라스를 `WebTestResource` 라고 부르도록 하자. 이는 [`GenericResource`](https://msdn.microsoft.com/en-us/library/microsoft.azure.management.resources.models.genericresource.aspx) 클라스를 상속받아 생성한다.

https://gist.github.com/justinyoo/40ee3814886b33504cef9230c5230ce5

위와 같이 기본 구조를 만들었다. 스크린샷의 JSON 객체에서 볼 수 있다시피 `Properties` 속성에 값을 추가해야 한다. 이 속성값에 따라 웹 테스트가 URL 핑 테스트인지 다단계 테스트인지 결정된다. 여기서는 URL 핑 테스트만 다룬다.

## 웹 테스트 리소스 속성 구현 - URL Ping

이제 `PingWebTestProperties` 클라스를 구현해 보자. 이는 `WebTestProperties` 클라스를 상속 받는다.

https://gist.github.com/justinyoo/f623ec42d7724d0bbbedf7273a0b5580

눈여겨 보아야 할 부분이 하나 있다. `GenericResource` 클라스를 상속 받는 `WebTestResource` 클라스는 `Properties` 속성값으로 문자열만 받는다. 하지만 위의 스크린샷에서 볼 수 있다시피 실제 문자열은 직렬화된 JSON 객체이다. 따라서 위에 구현한 `PingWebTestProperties` 클라스를 직렬화하여 저장해야 한다. 여기서는 암시적 연산자(implicit operator)를 사용했다. 아니면 아래 소개하는 것과 같이 `ToJson()`과 같은 확장 메소드를 이용해서 구현해도 된다.

> 암시적 연산자와 관련한 내용은 이 [MSDN](https://msdn.microsoft.com/en-us/library/85w54y0a.aspx) 문서를 확인해 보면 좋다.

비슷하게 `WebTestProperties` 클라스에는 `PingWebTestConfiguration` 타입을 갖는 `Configuration` 속성이 있는데 이는 직렬화된 XML 문자열을 반환하므로 같은 식으로 암시적 연산자를 이용해서 처리하면 된다. 아니면 아래와 같이 `ToXml()` 확장 메소드를 구현해도 좋다.

https://gist.github.com/justinyoo/73b04af15f63bc67e23913afbd5686a3

이제 웹 테스트 생성 및 수정을 위한 강한 형식의 객체를 만들었다. 다음 단계에서는 실제로 이 객체를 이용해 보도록 하자.

## 웹 테스트 리소스 생성 및 수정

아주어 SDK는 [`ResourceManagementClient`](https://msdn.microsoft.com/library/azure/microsoft.azure.management.resources.resourcemanagementclient.aspx) 클라스가 있어서 아주어 리소스들을 코드 안에서 다룰 수 있게 해준다. 이를 이용하면 위에 구현해 놓은 웹 테스트 리소스를 쉽게 생성하거나 수정할 수 있다.

https://gist.github.com/justinyoo/af93aeddf89df9627ec3ab2fa698ecce

리소스가 성공적으로 설치되면 `200 (OK)` 혹은 `201 (Created)` 코드를 반환한다. 위 코드에서 만약 `credentials` 쪽에 관심이 있다면 아래 설명할 부분을 좀 더 살펴보는 것도 좋겠다.

## `ClientCredential` 또는 `UserCredential`

회사 정책에 따라 `클라이언트 자격 증명(ClientCredential)`을 사용할 것인지 `사용자 자격 증명(UserCredential)`을 사용할 것인지 결정해야 한다. 이 결정에 따라 아주어 액티브 디렉토리(AAD)에 앱을 등록하는 방식이 달라지기 때문이다. 이 두 가지 경우에 따라 좀 더 들어가 보자.

### 클라이언트 자격 증명 `ClientCredential`

`ClientCredential`을 사용하기 위해서는 `ClientId` 값과 `ClientSecret` 값이 필요하다. 따라서, AAD에 애플리케이션을 등록할 때 반드시 `WEB APPLICATION AND/OR WEB API` 옵션을 선택해야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/web-tests-for-app-insights-02.png)

그리고 나서 `Permissions to other applications` 섹션에서 `Windows Azure Service Management API`를 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/web-tests-for-app-insights-03.png)

그리고 `Delegate Permissions` 쪽에 아래와 같이 권한을 주면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/web-tests-for-app-insights-04.png)

이렇게 하면 사용자의 로그인을 필요로 하지 않고 ADAL를 이용해서 아주어 리소스에 아래와 같이 직접 접근할 수 있다.

https://gist.github.com/justinyoo/e469c4607dcaeb68b340f0ae1e1311a9

### 사용자 자격 증명 `UserCredential`

이번에는 `UserCredential`을 이용하는 시나리오를 생각해 보도록 하자. 이 때에는 `ClientId` 값만 필요하다. 그런데, 이 때 앞서 AAD에 등록해 둔 애플리케이션을 사용하면 아래와 같은 에러를 뱉어내면서 인증에 실패한다.

> Additional information: AADSTS90014: The request body must contain the following parameter: 'client\_secret or client\_assertion'.

따라서 `UserCredential`을 위한 별도의 앱을 AAD에 등록해야 한다. 이 때 옵션은 반드시 `NATIVE CLIENT APPLICATION`을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/web-tests-for-app-insights-05.png)

그리고 나서 `Permissions to other applications` 섹션에서 `Windows Azure Service Management API`를 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/web-tests-for-app-insights-06.png)

그리고 `Delegate Permissions` 쪽에 아래와 같이 권한을 주면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/web-tests-for-app-insights-07.png)

이렇게 하면 아래와 같이 아주어 리소스에 사용자 로그인을 통해 접근할 수 있다.

https://gist.github.com/justinyoo/78a001ca0f491e08f8cca51510f89b85

지금까지 C# 코드를 이용해서 애플리케이션 인사이트의 웹 테스트 리소스를 생성하고 수정하는 방법을 살펴보았다. 사실 애플리케이션 인사이트는 아직 프리뷰 딱지를 달고 있는 상태라 계속해서 바뀔 것이고, 결국에는 이 내용이 필요없는 시점이 올 것이다. 그 때 까지는 이 포스트가 웹 테스트를 위해 유용하게 쓰이면 좋겠다. [NuGet](https://www.nuget.org/packages/Aliencube.Azure.Insights.WebTests.SDK) 패키지도 있으니 아몰랑 다 귀찮아 다운로드 받아서 쓰면 된다.
