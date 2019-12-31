---
title: "Fluent API를 사용한 Domain Specific Language (DSL) 첫걸음"
date: "2019-01-11"
slug: domain-specific-language-with-fluent-api
description: ""
author: Justin Yoo
tags:
- .NET
- DDD
- Domain Driven Development
- Domain Specific Language
- DSL
- Ubiquitous Language
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/01/domain-specific-language-101-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

시스템 개발시 도메인 주도 개발(DDD; Domain-Driven Development) 방법론을 적용하다 보면 반드시 짚고 넘어가야 할 개념이 몇가지가 있는데, 그 중에 [유비쿼터스 언어(Ubiquitous Language)](https://martinfowler.com/bliki/UbiquitousLanguage.html)와 [DSL(Domain Specific Language)](https://en.wikipedia.org/wiki/Domain-specific_language)이 있다. 한 도메인 안에서 도메인 전문가와 개발자가 동일한 용어를 사용해서 서로 혼란을 피할 수 있게 하는 것이 바로 유비쿼터스 언어의 핵심 개념이고, 꼭 정확한 대응이 되지는 않지만 DSL은 이 유비쿼터스 언어를 코드에서 구현한 것이라고도 할 수 있다. 그런데, 말은 굉장히 쉽지만 DSL을 적용하기 위해서는 고민을 많이 해야 하는 부분이기도 하다. 이 포스트에서는 최대한 간략하게 애저 펑션상의 코드 안에서 [Fluent API](https://www.martinfowler.com/bliki/FluentInterface.html)를 사용해서 DSL 겉핥기를 시도해 보도록 한다.

> [지난 포스트](https://blog.aliencube.org/ko/2019/01/07/building-xsl-mapper-with-azure-functions/)에서 소개한 애저 펑션 XSL 매퍼 앱에서 사용한 아주 거친 수준의 DSL을 바탕으로 설명한다. 실제 코드 예제는 [이곳을 참고한다](https://github.com/aliencube/AzureFunctions-XSL-Mapper).

## 왜 DSL인가?

DSL은 크게 외부 DSL과 내부 DSL의 두 종류로 구분할 수 있다. 이 둘의 차이를 구분하는 것은 다른 곳에서 충분히 하고 있으므로 넘어가기로 하고, 여기서는 내부 DSL을 의미하는 것으로 하자. 이 내부 DSL은 특정 도메인 안에서 유비쿼터스 언어와 Fluent API를 이용해서 좀 더 비지니스 로직을 손쉽게 표현하기 위해 쓰인다. 또한 비지니스 로직과 크게 상관 없는 낮은 수준의 코드를 감추는 역할을 하기도 한다. 또한 DSL을 사용하게 되면 유비쿼터스 언어를 코드 수준에서 좀 더 간결하게 표현할 수 있고, 각 메소드의 역할과 의도를 정밀하게 표현할 수 있다. 사실 도메인 관점에서는 각각의 메소드가 내부적으로 어떻게 지지고 볶는지 알 필요는 없다. 하지만, 각 메소드별 연관성을 워크플로우 레벨에서 표현할 수 있게 해주는 것이 DSL을 작성하는 장점 중 하나이다.

이 때 Fluent API(또는 Fluent Interface)는 C#의 확장 메서드를 이용하면 굉장히 손쉽게 만들 수 있다. 물론 잘못 만들면 [데메테르의 법칙(Law of Demeter)](https://blog.aliencube.org/ko/2013/12/06/law-of-demeter-explained/)을 위반하기 쉬우므로 꽤나 조심스럽게 만들어야 한다. 처음부터 제네릭을 이용한 Fluent 인터페이스를 만들기 보다는 특정 상황에 맞는 확장 메서드를 만드는 편이 쉽다.

## DSL로 도메인 논리 워크플로우 표현하기

아래 코드를 살펴 보자. 애저 펑션의 첫 엔트리 포인트에서 만나는 부분이다.

https://gist.github.com/justinyoo/faa17ab46a8990b2b2db02c0e77fa4d1?file=endpoint.cs

Fluent API의 장점중 하나는 가독성에 있다. 메소드 체이닝을 통해 워크플로우를 문자 그대로 자연스럽게(Fluently) 표현하고 있으므로, 이 메소드 체이닝을 보면 아래와 같은 워크플로우를 상상하는 것이 크게 어렵지 않다. 일단 사용자가 애저 펑션을 호출하면 1) 서비스 로케이터 팩토리를 생성하고, 2) 팩토리는 펑션 인스턴스를 생성한 후, 3) 해당 펑션 인스턴스는 지정된 메소드를 실행시켜 결과값을 받아 반환하는 아주 간단한 워크플로우이다. 이 모든 것을 Fluent API를 이용한 메소드 체이닝을 통해 구현했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/domain-specific-language-101-01.png)

여기서 사용한 메소드의 이름을 보면 `Create`, `InvokeAsync` 와 같이 상당히 직관적임을 알 수 있다. 즉, 메소드 이름을 보고 곧바로 이 메소드가 어떤 역할을 하게 되는지 유추가 가능한 데, 이걸 거창하게 얘기하면 "유비쿼터스 언어를 이용해서 DSL을 작성한 것" 이라고도 볼 수 있다.

하지만, 이 방법을 이용하기 위해서는 굉장히 조심해야 할 부분이 한 가지가 있다. 바로 앞서 언급한 데메테르의 법칙을 위반한 것이다. 이것이 위험한 이유는, 메소드 체이닝에서 다른 인스턴스의 메소드를 호출할 경우 항상 `NullReferenceException` 에러가 발생할 소지가 다분히 있고, 이를 방어적으로 구현하지 않는 이상 이 코드는 언제든 냄새가 날 가능성을 내포한다.

그렇다면, 데메테르의 법칙을 위반하지 않으면서도 Fluent API를 이용한 DSL을 작성할 수 있는 방법에는 무엇이 있을까? 위 코드에서 생성한 `IXmlToXmlMapperFunction` 인스턴스가 호출하는 `InvokeAsync` 메소드는 아래와 같은 워크플로우를 구현해야 한다. 1) 먼저 XSLT 파일을 로드하고, 2) XSLT 파일이 참조하는 외부 DLL을 로드한 후, 3) 변환하고자 하는 XML을 호출하면 4) 변환된 XML 파일을 반환한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/domain-specific-language-101-02.png)

이 모든 워크플로우는 이 샘플에서는 `IXmlTransformHelper` 인터페이스에 1) `LoadXslAsync` 메소드, 2) `AddArgumentsAsync` 메소드, 3) `TransformAsync` 메소드로 정의해 놓았기 때문에 아래와 같은 코드를 예상하면 된다.

https://gist.github.com/justinyoo/faa17ab46a8990b2b2db02c0e77fa4d1?file=function.cs

여기서 주목해야 할 부분은 모든 메소드들은 결과값을 반환하는 것이 아닌 인스턴스 자신, 즉 `IXmlTransformHelper` 인스턴스를 반환한다는 점이다. 따라서, 메소드 체이닝을 하는 경우에도 메소드가 수행하는 결과와 상관없이 동일한 리턴값을 갖게 되고 해당 객체의 스코프를 벗어나지 않으므로 데메테르의 법칙을 위반하지 않게 된다. 또한 메소드 이름 자체가 충분히 자신의 역할을 설명하고 있으므로 가독성도 떨어지지 않는다. 동일한 인스턴스를 반환하는 형태로 구현하는 것의 장점은 계속해서 추가적인 메소드가 필요할 경우 굉장히 자연스럽게 이전 메소드에 붙어서 메소드 체이닝이 가능해진다는 데 있다. 만약 반환하는 값이 계속 변한다면 메소드 체이닝시 앞서 언급한 바와 같이 작은 변화에도 코드가 쉽게 깨질 수 있다는 점을 고려하도록 하자.

그런데, 여기서 문제가 하나 있다. 각각의 메소드는 모두 `async`/`await`를 지원하기 때문에 실제 반환하는 값은 `IXmlTransformHelper`가 아니라 사실 `Task<IXmlTransformHelper>`이다. 하지만, 각각의 메소드는 실제로 이 `Task<IXmlTransformHelper>` 인스턴스를 파라미터로 받지 않는다. 이것은 어떻게 구현한 것일까? 이 때 C#의 확장 메서드 기능이 꽤 유용하게 쓰인다. 아래 코드는 `AddArgumentsAsync` 메소드를 확장한 것이다.

https://gist.github.com/justinyoo/faa17ab46a8990b2b2db02c0e77fa4d1?file=extension-method.cs

이 확장 메소드는 `IXmlTransformHelper.AddARgumentsAsync()` 메소드를 래핑한 것으로 `Task<IXmlTransformHelper>` 인스턴스를 받아들여 `Task`를 벗겨낸 후 실제 메소드를 호출한 결과를 반환한다. 이런 식으로 확장 메소드를 만들어 두면 메소드 체이닝에서 다양한 상황에 대한 대비를 충분히 할 수 있게 된다.

## DSL은 장미칼인가?

지금까지 Fluent API를 이용해서 DSL을 작성하는 방법에 대해 알아보았다. 여기까지만 보면 DSL은 마치 코드를 꽤 간결하게 작성할 수 있는 장미칼처럼 보인다. 하지만, DSL이 처음부터 완벽하게 나올 수는 없다. 또한 모든 상황에서 DSL이 들어맞지는 않는다. 도메인 내 유비쿼터스 언어 정의가 끝난 후 그에 따라 일단은 기존의 방식대로 객체와 그 안의 속성, 메소드를 정의하고 사용하다 보면, 어느 정도 코드 리팩토링이 필요해지는 시점에서 이 DSL이 빛을 발하기 시작한다.

위에 예제로써 제시한 DSL 역시도 사실은 완벽한 것은 아니다. 끊임없이 DSL을 개선해서 다양한 상황에 적용시킬 수 있게 될 때 그 때가 되면 쓸만해질 것이고, 도메인 로직이 바뀌는 것에 대응하여 이 DSL 역시도 그에 맞춰 유연하게 변할 수 있게끔 제네릭을 사용할 수 있게 된다면 더할 나위 없이 좋을 것이다.

모쪼록 이 포스트를 통해 DSL을 작성하는 것에 대한 약간의 이해가 생겼기를 희망한다.
