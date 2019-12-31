---
title: "ASP.NET MVC 콘트롤러에 HttpContextBase 의존성 주입하기"
date: "2014-04-08"
slug: injecting-httpcontextbase-into-an-aspnet-mvc-controller
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- dependency-injection
- http-context-base
- mvc
fullscreen: false
cover: ""
---

ASP.NET MVC 프로젝트를 이용하여 웹 개발을 하고 있으면 반드시 최소한 한 번은 사용하게 되는 `HttpContext` 인스턴스가 있다. 이 인스턴스는 보통 [`HttpContext.Current`](http://msdn.microsoft.com/en-us/library/system.web.httpcontext.current(v=vs.110).aspx) 형태의 싱글톤으로 호출하여 사용할 수 있으며 MVC 패턴에서는 [`Controller.HttpContext`](http://msdn.microsoft.com/en-us/library/system.web.mvc.controller.httpcontext(v=vs.118).aspx) 속성이 이를 대신하고 있다. 하지만, 여기서 이 `HttpContext` 속성이 갖는 가장 큰 문제는 오로지 `get`만 지원하고 있어서, 임의의 `HttpContext` 값을 설정하는 의존성 주입을 할 수 없다는 것이다. 이를 위해 [@Paul Hadfield](http://twitter.com/Paul_Hadfield)는 자신의 [블로그 포스트](http://blog.paulhadfield.net/2010/09/injecting-httpcontextbase-into-mvc.html)에서 이 `HttpContext` 속성을 재정의하는 방법을 제시한다. [예전 포스트](http://blog.aliencube.org/ko/2013/08/07/using-httpcontextbase-instead-of-httpcontext-for-better-code/)에서 언급한 내용은 `HttpContext` 대신 `HttpContextBase`를 사용하면 유닛테스트에 유용하다 정도였지만, 여기서는 어떻게 유닛테스트에서 이것을 활용할 수 있을까에 대한 내용이 될 것이다.

## 생성자를 이용한 의존성 주입

```csharp
public abstract class BaseController : Controller
{
  public new HttpContextBase HttpContext { get; private set; }

  protected BaseController()
  {
    this.HttpContext = base.HttpContext;
  }

  protected BaseController(HttpContextBase httpContext)
  {
    if(httpContext == null)
    {
      throw new ArgumentNullException("httpContext");
    }
    this.HttpContext = httpContext;
  }
}
```

위와 같이 베이스 콘트롤러를 정의하고 그 안에서 `HttpContext`를 재정의한 후 생성자를 통해 의존성을 주입하는 방식을 쓰는 것이다. 이를 적용하면 아래와 같은 형태가 될 수 있다.

```csharp
public class HomeController : BaseController
{
  public HomeController(HttpContextBase httpContext)
    : base(httpContext)
  {
  }
}
```
실제로 [Unity](http://unity.codeplex.com/) 또는 [Autofac](http://autofac.org) 등과 같은 IoC 컨테이너들을 사용할 경우 콘트롤러는 더욱 많은 인스턴스들을 의존성 주입에 필요로 하게 되므로, 개인적으로는 이 `HttpContext`와 같은 것들은 Setter 메소드를 통해 의존성 주입을 하는 것을 권장한다. 하지만, 이것은 취향이니까 존중. 개인적으로는 아래와 같은 방법을 선호한다.

## 세터 메소드를 용한 의존성 주입

```csharp
public abstract class BaseController : Controller
{
  public new HttpContextBase HttpContext { get; private set; }

  protected BaseController()
  {
    this.HttpContext = base.HttpContext;
  }

  public void SetHttpContext(HttpContextBase httpContext)
  {
    if (httpContext == null)
      throw new ArgumentNullException("httpContext");

    this.HttpContext = httpContext;
  }
}
```

## 추가 의존성 주입

물론, 세션이나 쿠키 같은 내용들은 별도의 인스턴스를 통해 의존성을 주입해야 한다. 만약 세션 인스턴스도 의존성 주입이 필요하다면 아래와 같은 내용을 추가할 수 있다.

```csharp
public abstract class BaseController : Controller
{
  public new HttpContextBase HttpContext { get; private set; }
  public new HttpSessionStateBase Session { get; private set; }

  protected BaseController()
  {
    this.HttpContext = base.HttpContext;
  }

  public void SetHttpContext(HttpContextBase httpContext)
  {
    if (httpContext == null)
      throw new ArgumentNullException("httpContext");

    this.HttpContext = httpContext;
  }

  public void SetHttpSessionState(HttpSessionStateBase httpSessionState)
  {
    if (httpSessionState == null)
      throw new ArgumentNullException("httpSessionState");

    this.Session = httpSessionState;
  }
}
```

이렇게 의존성 주입이 가능한 HTTP 추상 클라스들의 리스트는 아래와 같다.

- `HttpContextBase`
- `HttpRequestBase`
- `HttpResponseBase`
- `HttpServerUtilityBase`
- `HttpSessionStateBase`

## 유닛테스트 예시

이렇게 콘트롤러를 만들어 놓으면 유닛테스트에서는 아래와 같은 형태로 사용이 가능하다. 여기서는 [NUnit](http://nunit.org)과 [NSubstitute](http://nsubstitute.github.io)를 사용한다고 가정한다.

```csharp
[Test]
public void Test()
{
  var httpContext = Substitute.For();
  var controller = new HomeController();
  controller.SetHttpContext(httpContext);

  // Testing logics here
}
```

물론, 필요에 따라 `httpContext`로 목킹한 인스턴스에 다양한 내용을 추가 가능하다.

## 맺으며

지금까지 간략하게 `HttpContext` 인스턴스를 ASP.NET MVC 콘트롤러에 주입하는 방법에 대해 논의해 보았다. 이 방법이 가장 옳다는 것은 아니고 이런 식으로 하면 되겠다 하는 것이다보니 언제든 이보다 더욱 효과적인 방법을 찾을 경우 이 포스트는 꾸준히 업데이트가 될 것이다.
