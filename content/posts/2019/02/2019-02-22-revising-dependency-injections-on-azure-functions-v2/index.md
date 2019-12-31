---
title: "새롭게 톺아보는 애저 펑션 의존성 관리"
date: "2019-02-22"
slug: revising-dependency-injections-on-azure-functions-v2
description: ""
author: Justin-Yoo
tags:
- dotnet
- azure-functions
- dependency-injection
- instance-method
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/02/getting-rid-of-static-modifier-from-azure-functions-00.png
---

평화롭던 어느 날 애저 펑션 팀이 엄청난 것을 릴리즈 해 버렸다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/getting-rid-of-static-modifier-from-azure-functions-01.png)

아니 이게 무슨 소리요? 인스턴스 메소드라니! 그렇다면 메소드 앞에 항상 붙어다녔던 그 `static` 한정자를 떼고 그냥 쓸 수 있단 말이오?

너무나도 궁금했지만, 그동안 바빠서 들여다 보지 못하다가 얼마전에 한 번 만들어 봤다. 사실, 한첨 전에 이것이 가능해 질 것으로 예상은 했더랬다. 지난 이그나이트 2018 이벤트에서 [Fabio](https://twitter.com/codesapien)가 살짝 데모를 보여준 적이 있었기 때문이다.

<iframe width="560" height="315" src="https://www.youtube.com/embed/9Ep6N4PtAxc?start=2506" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

단지 시기의 문제였을 뿐인데, 별다른 공지 없이 슬쩍 릴리즈가 됐던지라 너무너무 궁금했다. 이 포스트에서는 이 데모를 바탕으로 실제로 어떻게 저 `static` 한정자를 떼어 버리고 애저 펑션의 메소드를 사용할 수 있는지, 또한 이를 바탕으로 생성자를 통한 의존성 주입을 곧바로 할 수 있는지에 대해 알아보도록 한다.

> 이 포스트에서 쓰인 예제 코드는 [이곳](https://github.com/devkimchi/Azure-Functions-Instance-Method-Sample)에서 찾을 수 있다.

## 인스턴스 메소드 만들기

C#에서는 클라스 안의 필드, 속성 혹은 메소드에 `static` 한정자를 붙이는 경우가 있다. 이럴 때 이것들은 클라스가 인스턴스가 되든 아니든 상관 없이 클라스 수준에서 직접 접근하고 사용할 수 있다. 반면에 `static` 한정자가 없는 경우에는 필드, 속성, 메소드는 반드시 클라스가 인스턴스로 만들어진 후에야 접근이 가능하다. 이 때 이렇게 인스턴스로 만들어진 상태에서 접근하는 메소드를 가리켜 인스턴스 메소드라고 부른다.

이렇게 인스턴스를 만들 수 있게 클라스를 정의하는 것이 일반적이다. 또한 이렇게 하면 생성자를 사용할 수 있다는 장점도 있어서 의존성 주입이라든가 하는 것들이 여러모로 편해진다.

문제는 애저 펑션에서는 지금까지 항상 `static` 한정자를 클라스 수준에서 적용시켜 왔다. 따라서 당연하게도 메소드 수준에서도 `static` 한정자를, 속성 수준에서도 `static` 한정자를 강제적으로 사용할 수 밖에 없었다. 이는 지금까지 애저 펑션에서 의존성 주입을 고려할 때 엄청난 고민 지점을 만들어 놓았고, 결국은 서비스 로케이터를 이용한 속성 주입 (Property Injection), 혹은 메소드 파라미터를 이용한 메소드 주입 (Method Injection) 과 같은 변칙적인 혹은 권장하지 않는 방법을 사용해야만 했다.

하지만, 위에 언급한 릴리즈로 인해 이제는 저 `static` 한정자를 떼어내고 직접 사용할 수 있다고 하니 한 번 만들어 보도록 하자. 우선 아래 코드를 보자.

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=sample-http-trigger.cs

별 차이가 없어 보인다. 하지만 좀 더 자세히 들여다 보면 `public`과 `class` 사이에 있어야 할 `static` 한정자가 사라졌다. 마찬가지로 `public async`와 `Task<IActionResult>` 사이에 있어야 할 `static` 한정자 역시도 사라졌다! 아니 이렇게 하고도 애저 펑션 메소드가 돌아간다고? 실제로 실행을 시켜 보도록 하자. 이 펑션이 제대로 작동한다면 아래와 같이 디버깅 브레이크 포인트에서 멈출 것이고,

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/getting-rid-of-static-modifier-from-azure-functions-02.png)

펑션 실행 결과는 단순히 `Hello [이름]` 같은 결과가 나올 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/getting-rid-of-static-modifier-from-azure-functions-03.png)

와우! 정말로 인스턴스 메소드를 실행시킬 수 있게 되었다! 그렇다면 이제는 정말로 편하게 생성자를 통해서 의존성 주입을 할 수 있게 된 셈이다.

## 속성을 통한 의존성 주입

기존 방식대로 `static` 한정자를 사용한 애저 펑션 코드라면 아래와 같은 식으로 `static` 속성을 이용해서 의존성 주입을 해결했을 것이다. 여기서는 [Aliencube.AzureFunctions.Extensions.DependencyInjection](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.DependencyInjection/) 라이브러리를 이용해서 의존성 주입 문제를 해결했다.

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=sample-http-trigger-1.cs

`static` 속성은 `IFunctionFactory` 인터페이스를 통해 `FunctionFactory`를 구현하고, 이는 `AppModule`을 통해 의존성을 해결한다. 실제로 `AppModule` 클라스를 열어보면 아래와 같이 생겼다.

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=app-module.cs

즉, `IGetSamplesFunction` 인스턴스는 `AppModule`을 통해 IoC 컨테이너에 등록이 되고, 이를 애저 펑션 메소드 안에서 받아 해결하는 형식이 된 것이다. 이제 이 구조를 거의 동일하게 유지한 채로 `static` 한정자를 떼어 내 보도록 하자.

## 생성자를 통한 의존성 주입

이제 굳이 `AppModule`과 같은 중간단계를 거칠 필요 없이 ASP.NET Core 애플리케이션에서 하듯 곧바로 IoC 컨테이너를 다룰 수 있게 됐다. 아래 코드를 한 번 보자. 애저 펑션 코드도 이제 `StartUp`과 같은 클라스를 이용하는 길이 생겼다.

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=startup.cs

우선 `StartUp` 클라스는 `IWebjobStartup` 인터페이스를 구현한다. 이 인터페이스는 `Configure(IWebjobBuilder builder)`와 같은 메소드 하나만 정의되어 있고, 이는 실제 애저 펑션 런타임 구동시 네임스페이스 위에 등록한 것과 같이 어셈블리를 등록하는 방식으로 실행된다. 이렇게 함으로써 IoC 컨테이너 안에 의존성 객체들을 모두 등록할 수 있다. 이제 실제로 생성자를 통해 의존성이 어떻게 주입되는지 살펴보자.

https://gist.github.com/justinyoo/fcfaf0922513c661b63623eb04cccebd?file=sample-http-trigger-2.cs

기존에 구현해 놓았던 `IGetSamplesFunction` 인스턴스는 그대로 이용할 수 있도록 하면서 단순히 `static` 속성이었던 부분만을 생성자로 바꿔치기한 후 사용하게 해 놓았다. 즉 기존의 코드에 대한 수정을 최소화 하면서도 원하는 인스턴스 메소드 형식으로 의존성을 관리할 수 있게 된 것이다.

* * *

지금까지 애저 펑션의 메소드를 구현할 때 더이상 `static` 한정자를 붙일 필요 없이 손쉽게 구현할 수 있는 방법에 대해 알아 보았다. 애저 펑션이 예전에는 단순한 작업을 담당하는 API를 교체하는 수준에서 활약을 했다면 (물론 현재도 그 역할을 훌륭하게 수행하고 있다), 이제는 좀 더 다양한 방식으로 사용자에게 좀 더 나은 개발 경험을 주는 쪽으로 발전해 나가고 있다고 본다. [컨테이너를 이용한 다양한 배포 가능성 (Deployability)](https://blog.aliencube.org/ko/2018/04/16/when-azure-functions-meets-container/), 이 글에서 다룬 향상된 의존성 관리를 통한 테스트 가능성 (Testability), 그리고 [Open API 문서 렌더링을 이용한 API 발견 가능성 (Discoverability)](https://blog.aliencube.org/ko/2019/02/02/introducing-swagger-ui-on-azure-functions/)까지 이제 모두 갖춰진 셈이므로, 앞으로는 더욱더 다양하고 무궁무진한 사용 예시가 나오지 않을까 예상한다.
