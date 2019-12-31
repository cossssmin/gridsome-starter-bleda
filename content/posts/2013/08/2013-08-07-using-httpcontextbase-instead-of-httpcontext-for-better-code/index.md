---
title: "유연한 코드를 위해 HttpContext 대신 HttpContextBase 사용하기"
date: "2013-08-07"
slug: using-httpcontextbase-instead-of-httpcontext-for-better-code
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- Extendability
- Flexibility
- HttpContext.Current
- HttpContextBase
- HttpContextWrapper
- Testability
fullscreen: false
cover: ""
---

닷넷 기반 웹사이트 개발시 항상 쓰는 객체는 `HttpContext` 객체이다. 서버 요청, 서버 응답, 현재 사용자, 세션, 쿠키 등등… 이 `HttpContext` 객체가 담당하는 일은 무궁무진하다. 하지만, 이 객체는 `HttpContext.Current`의 싱글톤 인스턴스로만 사용이 가능한데, 이것은 구상 클라스(Concrete Class)여서 단위 테스트를 할 때에는 사용을 할 수가 없다. 이 문제를 해결하고자 닷넷 프레임웍 3.5부터 새롭게 나타난 것이 바로 `HttpContextBase`라는 추상 클라스(Abstract Class)이다.

이 `HttpContextBase`라는 추상 클라스를 통해 단위 테스트라든가 테스트 주도 개발 방법론(TDD)에서 주로 사용하는 Mocking을 자유롭게 구현할 수 있다. 아래 코드를 보면 대략의 감을 잡을 수 있을 것이다.

```csharp
HttpContextBase contextBase = new HttpContextWrapper(HttpContext.Current);

```

위의 예제 코드는 `HttpContextWrapper` 클라스를 이용하여 `HttpContextBase` 객체를 리턴하는 것이다. 실제 동작하는 코드는 이렇게 작성할 수 있고, 단위 테스트에서는 아래와 같이 작성할 수도 있다. `Nunit`과 `NSubstitue`를 사용한다고 가정하자.

```csharp
public class HomeControllerTest
{
    private HttpContextBase _context;

    [SetUp]
    public void Init()
    {
        this._context = Substitute.For<HttpContextBase>();
        ...
    }

    ...

    [Test]
    public void Test()
    {
        var controller = new HomeController(this._context);
        var result = controller.Index();
        ...
    }
}

```

위의 테스트 클라스를 보면 `HttpContextBase`를 mocking 하여 콘트롤러에 Dependency Injection을 시키는 것을 볼 수 있다. 만약 `Unity`라든가 `Autofac` 같은 IoC 콘테이너를 사용하게 된다면 `HttpContextBase`역시도 직접 사용하는 것보다는 `IHttpContextBaseWrapper` 같은 형태로 한 번 더 감싸서 사용하면 된다.

참고: [HttpContext vs HttpContextBase vs HttpContextWrapper](http://www.splinter.com.au/httpcontext-vs-httpcontextbase-vs-httpcontext)
