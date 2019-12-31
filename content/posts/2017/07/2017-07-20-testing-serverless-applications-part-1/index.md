---
title: "서버리스 애플리케이션 테스트하기 - 애저 펑션"
date: "2017-07-20"
slug: testing-serverless-applications-part-1
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- design-patterns
- unit-testing
- testability
fullscreen: false
cover: ""
---

- 서버리스 애플리케이션 테스트하기 – 애저 펑션
- [서버리스 애플리케이션 테스트하기 – 로직 앱](http://blog.aliencube.org/ko/2017/07/21/testing-serverless-applications-part-2/)

이 포스트에서는 C# 코드로 Azure Functions 애저 펑션을 작성할 때 테스트 가능성을 충분히 고려해서 도입할 수 있는 몇가지 디자인 패턴에 대해 언급해 보고자 한다.

> 이 포스트에 쓰인 예제 코드는 [이곳](https://github.com/devkimchi/Testing-Serverless-Applications)에서 다운로드 받을 수 있다.

## 시나리오

As 데브옵스 엔지니어 I want 애저 펑션을 이용해 ARM 템플릿 리스트를 검색한다 So that 검색 결과에 나타난 ARM 템플릿 리스트를 다운로드 받는다

## 기본 펑션 코드

우선 기본적인 펑션 코드를 한 번 들여다 보자. 대략 아래와 같은 모습일 것이다.

https://gist.github.com/justinyoo/b5b66a3f5c3277aad09c497355d09fa5

모든 의존성 인스턴스를 펑션 메소드 안에서 생성해서 사용하고 있다. 일단 작동은 하는 코드니까 크게 문제가 없다고 볼 수도 있지만, 이 펑션은 유닛 테스트를 전혀 할 수 없는 펑션이다. 그렇다면 이 코드를 어떻게 바꿔야 유닛 테스트를 할 수 있을까?

이제부터 필요한 디자인 패턴을 하나씩 적용시켜 나가보도록 하자. 여기 소개하는 디자인 패턴은 워낙 널리 쓰이는 것들이라서 특별히 부차적인 설명을 하지는 않도록 한다.

## 서비스 로케이터 패턴

위의 예제 코드에서 볼 수 있다시피 애저 펑션은 기본적으로 `static` 한정자가 붙어 다닌다. 따라서, 일반적인 방법으로 의존성을 주입할 수는 없기 때문에 [서비스 로케이터 패턴](https://msdn.microsoft.com/en-us/library/ff921142.aspx)을 사용한다. 서비스 로케이터 패턴을 이용하면 대략 아래와 같은 형태로 리팩토링을 할 수 있다.

https://gist.github.com/justinyoo/835a482a72f744d0a869531b4f63899b

가장 먼저 `IServiceLocator` 프로퍼티를 `static` 한정자를 이용해서 정의한다. 그리고 펑션 메소드 안에서 서비스 로케이터를 이용해서 필요한 인스턴스를 호출한 후 사용한다. 이렇게 리팩토링을 하게 되면 일단 애저 펑션 코드는 완전히 유닛 테스트를 할 수 있게 된다. 참 쉽죠? 아래는 이를 이용한 간단한 유닛 테스트 코드이다.

https://gist.github.com/justinyoo/8a35161ee5c82a232a03fccbc07e345a

코드에서 볼 수 있다시피 `Mock<IServiceLocator>`와 같은 형태로 서비스 로케이터 인스턴스를 목킹한 후 곧바로 펑션의 `static` 프로퍼티에 주입했다. 그 이후에 `Run` 메소드를 호출해서 테스트를 하면 된다. 이로써 서비스 로케이터 인스턴스를 이용한 테스트를 완성했다. 하지만, 여기에 문제가 하나 있다.

[Mark Seemann](https://twitter.com/ploeh)은 꽤 오래 전에 자신의 [블로그 포스트](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/)에 이미 서비스 로케이터 패턴은 안티 패턴이라고 선언했다. 그 이유는 의존성이 있는 인스턴스들을 사용하기 전에 미리 등록해 놔야 하는데, 그걸 보장할 수 없다는 것이다. 서비스 로케이터를 이용해서 리팩토링을 마친 코드를 다시 한 번 살펴보자.

https://gist.github.com/justinyoo/835a482a72f744d0a869531b4f63899b

지금 이 코드야 양이 적으니 금방 `IGitHubService` 인스턴스가 등록된 것인지 아닌지 알 수 있다지만, 만약 굉장히 많은 수의 인스턴스들이 의존성 객체로서 미리 등록을 해야 한다면, `var service = ServiceLocator.GetInstance<IGitHubService>();` 구문에서 `service` 변수가 `null`이 되지 않는다는 보장을 할 수 있겠는가? 그렇지 않다. 따라서, 서비스 로케이터 패턴을 사용할 수 밖에 없긴 하지만, 이 서비스 로케이터를 멀리하고 자동으로 모든 의존성 객체를 등록시켜서 아무 걱정 없이 사용할 수 있어야 한다.

> 서비스 로케이터를 사용하되 서비스 로케이터를 사용하지 말자

말도 안되는 소리긴 한데, 실제로 이렇게 해야 한다. 그렇다면 어떤 디자인 패턴을 적용시켜 볼 수 있을까?

## 전략 패턴 Strategy Pattern

[전략 패턴 Strategy Pattern](http://www.dofactory.com/net/strategy-design-pattern)은 가장 기본적인 디자인 패턴으로서, 모든 펑션 트리거에 공통적으로 적용시킬 수 있는 부분을 추상화 시킨다. 먼저 `IFunction` 인터페이스를 아래와 같이 정의해 보자.

https://gist.github.com/justinyoo/c21d4dc9b46163aacc093de1c3a00f81

모든 펑션은 이제 이 `IFunction` 인터페이스를 구현하고, 모든 로직은 `InvokeAsync()` 메소드 안에서 돌아가게 된다. 이제 이를 구현한 `FunctionBase` 추상 클라스를 살펴보도록 하자.

https://gist.github.com/justinyoo/05c89f488956e1b1f56724d879ef1367

`FunctionBase` 클라스는 추상 클라스로서 `IFunction` 인터페이스를 구현하면서 `InvokeAsync()` 메소드에 `virtual` 한정자를 붙여 이를 상속받는 클라스에서 오버라이딩을 가능하게 만들었다. 이제 실제 펑션 로직이 들어가는 클라스를 아래와 같이 작성해 보자.

https://gist.github.com/justinyoo/9ef909bc84965df1c24a84d4a74f60c3

`GetArmTemplateDirectoriesFunction` 펑션 클라스에서는 `InvokeAsync()` 메소드를 오버라이딩하고 그 안에서 실제로 모든 일이 벌어진다. 그런데, 여기 보면 `TOptions` 라는 제너릭 타입이 보인다. 이건 뭘까? 다음에 설명할 [옵션 패턴 Options Pattern](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration#options-config-objects)이다.

## 옵션 패턴 Options Pattern

애저 펑션의 경우 라우팅 변수들이 들어오는 경우가 있다. 예를 들어 HTTP 트리거의 엔드포인트 URL을 `/api/products/{productId}` 라고 지정해 놓았다면 `productId` 값이 계속 바뀌게 되고 이를 `Run` 메소드에서는 `Run(HttpRequestMessage req, int productId, ILogger log)`와 같은 형태로 파라미터로 받아들이게 된다. 이럴 때 이 `productId`를 옵션 인스턴스 안으로 밀어 넣어 사용하면 한결 깔끔한 상태의 코드를 유지할 수 있다. 아래 코드를 보자.

https://gist.github.com/justinyoo/f2e2ac56a4071aca190d35d8b811c333

먼저 `FunctionParameterOptions` 라는 추상 클라스를 생성하고 `GetArmTemplateDirectoriesFunctionParameterOptions` 라는 클라스에서 이를 상속 받는다. 그리고 `Query`라는 프로퍼티를 하나 추가한다. 프로퍼티에서 예상할 수 있다시피 HTTP 요청시 쿼리스트링 값을 저장하는 용도로 사용할 예정이다.

## 빌더 패턴 Builder Pattern

아래 펑션 코드를 다시 보자. 생성자에 `IGitHubService` 인스턴스가 의존성으로 주입되는 것을 확인할 수 있다.

https://gist.github.com/justinyoo/9ef909bc84965df1c24a84d4a74f60c3

그렇다면 이런 수많은 의존성 객체들은 어디서 관리해야 할까? 이 때 필요한 것이 바로 [빌더 패턴 Builder Pattern](http://www.dofactory.com/net/builder-design-pattern)이다. 빌더 패턴을 이용해서 [Autofac](https://autofac.org/)과 같은 IoC 컨테이너와 서비스 로케이터를 조합하면 손쉽게 의존성 객체들을 등록할 수 있다. 아래 코드를 보면 대략의 감을 잡을 수 있을 것이다.

https://gist.github.com/justinyoo/ad11d9188b8ddc467d50b4efa2458b48

`Autofac`의 의존성 등록 기능을 이용해 `RegisterModule()` 메소드 안에서 모든 의존성 객체들을 등록한 후 이를 `Autofac`으로 래핑해서 빌드한다. 그러면 등록된 모든 의존성 객체들을 곧바로 `IServiceLocator` 인스턴스를 이용해 사용할 수 있다.

## 팩토리 메소드 패턴 Factory Method Pattern

이제 위에서 적용했던 모든 패턴의 결과물을 여기 [팩토리 메소드 패턴 Factory Method Pattern](http://www.dofactory.com/net/factory-method-design-pattern)을 이용해 한방에 정리하도록 하자. 아래 코드를 보면 좀 더 이해가 쉬울 수 있다.

https://gist.github.com/justinyoo/fd22aac8bb6c477f25314194e65bd741

우선 생성자를 통해 `ServiceLocatorBuilder`를 호출해서 모든 의존성 객체들을 등록한다. 여기에는 `IFuction` 인터페이스를 구현한 모든 펑션 메소드들 역시 포함되어 있다. 이후 `Create<TFunction>()` 메소드를 호출할 때 서비스 로케이터 인스턴스에서 필요한 펑션 인스턴스를 받아 반환시킨다. 마지막으로 아래와 같이 펑션 트리거를 다시 한 번 리팩토링한다.

https://gist.github.com/justinyoo/375343f0fbd34c00183f08674129af62

앞서와 달리 `IServiceLocator` 프로퍼티 대신 `FunctionFactory` 프로퍼티를 선언한다. 그리고 `Run` 메소드 안에서 플루언트 디자인을 통해 `Create<TFunction>()` 메소드와 `InvokeAsync()` 메소드를 연달아 호출하면 된다. 그 과정에서 쿼리스트링은 `GetArmTemplateDirectoriesFunctionParameterOptions` 인스턴스를 통해 `InvokeAsync()` 메소드로 전달된다.

여기까지 구현하면 모든 펑션 트리거들이 이제 모두 유닛 테스트가 가능해졌을 뿐더러, 서비스 로케이터 패턴을 사용하지만 실제로는 어디 있는지 알 필요가 없을만큼 충분히 캡슐화를 해 놓아서 신경 쓰지 않아도 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/testing-serverless-applications-part-1-01.png)

이렇게 위 그림과 같이 모든 유닛 테스트를 끝마칠 수 있다.

* * *

지금까지 애저 펑션을 효과적으로 테스트할 수 있는 방법에 대해 알아 보았다. 이 글에 쓰인 것과 같이 기본적인 디자인 패턴만으로 리팩토링을 구현한다면 충분히 가능한 일이다. 물론, 본문의 방법이 최선은 아닐 수도 있다. 만약 더 효율적인 방법이 있다면 [깃헙의 리포지토리](https://github.com/devkimchi/Testing-Serverless-Applications)에 PR 고고!

[다음 포스트](http://blog.aliencube.org/ko/2017/07/21/testing-serverless-applications-part-2/)에서는 애저 로직 앱을 테스트할 수 있는 방법에 대해 알아보도록 한다.
