---
title: "닷넷 MVC 앱에서 Unauthorized와 Forbidden 구분하여 에러 페이지 전송하기"
date: "2015-02-17"
slug: distinguishing-forbidden-from-unauhthorized-in-aspnet-mvc-apps
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- '401'
- '403'
- AuthorizeAttribute
- HttpStatusCode
- MVC
- Web API
fullscreen: false
cover: ""
---

ASP.NET MVC 앱을 개발하다보면 자주 쓰는 속성 클라스들이 있는데, 그들 중 하나가 [`AuthorizeAttribute`](https://msdn.microsoft.com/en-us/library/system.web.mvc.authorizeattribute(v=vs.118).aspx) 클라스이다. 이 속성 클라스가 하는 일은 해당 콘트롤러 혹은 액션으로 리퀘스트가 들어올 때 사용자가 이미 웹사이트에 로그인 했는지 아닌지, 권한은 충분한지 아닌지를 체크하고 만약 로그인하지 않았거나, 권한이 충분하지 않다면 [401 Unauthorized 에러 코드](http://ko.wikipedia.org/wiki/HTTP_%EC%83%81%ED%83%9C_%EC%BD%94%EB%93%9C)를 반환한다.

사실 로그인을 실패했을 때 반환해야 하는 에러 코드(401 Unauthorized)와 권한이 충분하지 않을 때 반환해야 하는 에러 코드(403 Forbidden)는 달라야 한다. 하지만 ASP.NET MVC에서는 이 둘을 구분짓지 않을 뿐더러 Web API에서도 동일하게 401 에러 코드만 반환한다. 즉, 사용자 입장에서는 로그인을 실패한 것인지, 로그인을 성공했지만 권한이 충분하지 않은 것인지를 확인할 수 없는 셈이다. 따라서, 이를 해결하기 위해서는 별도의 `AuthorizeAttribute` 클라스를 만들어 사용해야 한다. 이 코드는 아래 리포지토리에서 확인할 수 있다.

- [https://github.com/aliencube/AuthorizeAttribute.Extended](https://github.com/aliencube/AuthorizeAttribute.Extended)

또한, NuGet 패키지로도 제공한다.

- [https://www.nuget.org/packages/Aliencube.AuthorizeAttribute.Extended/](https://www.nuget.org/packages/Aliencube.AuthorizeAttribute.Extended/)

## 수정 사항

[`System.Web.Mvc.AuthorizeAttribute`](https://msdn.microsoft.com/en-us/library/system.web.mvc.authorizeattribute(v=vs.118).aspx) 클라스를 보면 [`OnAuthorization`](https://msdn.microsoft.com/en-us/library/system.web.mvc.authorizeattribute.onauthorization(v=vs.118).aspx) 메소드가 존재한다. 이 메소드는 내부적으로 `AuthorizeCore`라는 메소드를 호출하는데, 이 메소드는 boolean 값을 반환한다. 즉, 로그인에 성공하고 권한도 충분하면 `true`를, 로그인에 실패하거나 권한이 충분하지 않으면 `false`를 반환한다. 바로 이부분에서 조금 더 정확한 값이 필요하기 때문에 이 부분을 수정하기로 한다.

기존 `AuthorizeCore` 메소드의 형태는 대략 아래와 같다.

```csharp
protected virtual bool AuthorizeCore(HttpContextBase httpContext)
{
  ...

  if (!isAuthenticated)
  {
    return false;
  }

  if (!isAuthorised)
  {
    return false;
  }

  return true;
} 
```

이것을 아래와 같이 수정한다.

```csharp
protected virtual bool AuthorizeCore(HttpContextBase httpContext, out AuthorizationStatus authorizationStatus)
{
  ...

  if (!isAuthenticated)
  {
    authorizationStatus = AuthorizationStatus.Unauthorized;
    return false;
  }

  if (!isAuthorised)
  {
    authorizationStatus = AuthorizationStatus.Forbidden;
    return false;
  }

  authorizationStatus = AuthorizationStatus.Accepted;
  return true;
}
```

그리고, `OnAuthorization` 메소드에서 `AuthorizeCore`를 호출했을 때 `false`를 반환한다면 `authorizationStatus` 값을 체크해서 값에 따라 `401 Unauthorized` 에러 페이지 또는 `403 Forbidden` 에러 페이지를 반환하도록 한다.

```csharp
public virtual void OnAuthorization(AuthorizationContext filterContext)
{
  AuthorizationStatus authorizationStatus;
  if (this.AuthorizeCore(filterContext.HttpContext, out authorizationStatus))
  {
    ...
  }
  else
  {
    switch (this.AuthorizationStatus)
    {
      case AuthorizationStatus.Unauthorized:
        this.HandleUnauthorizedRequest(filterContext);
        break;

      case AuthorizationStatus.Forbidden:
        this.HandleForbiddenRequest(filterContext);
        break;

      default:
        throw new InvalidOperationException("Invalid authorization status");
    }
  }
}

protected virtual void HandleUnauthorizedRequest(AuthorizationContext filterContext)
{
  // Returns HTTP 401 - see comment in HttpUnauthorizedResult.cs.
  filterContext.Result = new HttpUnauthorizedResult();
}

protected virtual void HandleForbiddenRequest(AuthorizationContext filterContext)
{
  // Returns HTTP 403 - see comment in HttpForbiddenResult.cs.
  filterContext.Result = new HttpForbiddenResult();
}
```

이렇게 수정하면 로그인 실패인지, 권한 문제인지 HTTP 상태 코드를 좀 더 명확하게 알 수 있다.

## 수정 사항 적용

사용 방법은 기존의 `AuthorizeAttribute` 클라스와 동일하다.

### `FilterConfig.cs` 추가/수정

- `App_Start\FilterConfig.cs` 파일을 만들거나 기존의 파일에 이 속성 클라스를 사용한다고 정의한다.
- `using` 알리아스를 사용해서 기존의 `System.Web.Mvc.AuthorizeAttribute` 클라스와 충돌하는 것을 방지한다.

```csharp
using AuthorizeAttribute = Aliencube.AuthorizeAttribute.Extended.AuthorizeAttribute;
...

public class FilterConfig
{
  public static void RegisterGlobalFilters(GlobalFilterCollection filters)
  {
    filters.Add(new AuthorizeAttribute());
  }
}
```

### `Global.asax.cs` 추가/수정

- `Global.asax.cs` 파일을 추가/수정해서 앞서 정의한 `FilterConfig` 클라스를 활성화 시킨다. 그렇게 하면 새로 정의한 `AhthorizeAttribute` 클라스를 적용시킬 수 있다.

```csharp
// Global.asax.cs
public class MvcApplication : System.Web.HttpApplication
{
  protected void Application_Start()
  {
    AreaRegistration.RegisterAllAreas();
    FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
    RouteConfig.RegisterRoutes(RouteTable.Routes);
  }
}
```

### 콘트롤러 업데이트

- 기존 콘트롤러에 이미 `Authorize` 속성 클라스를 적용하고 있었다면 간단하게 `using` 알리아스만 추가하는 것으로 적용 가능하다.

```csharp
using AuthorizeAttribute = Aliencube.AuthorizeAttribute.Extended.AuthorizeAttribute;
...

[Authorize]
public partial class AccountController : Controller
{
  ...

  [HttpPost]
  [AllowAnonymous]
  public virtual async Task<ActionResult> Login(LoginViewModel model)
  {
    ...

    return View();
  }

  [Authorize(Roles = "User")]
  public virtual async Task<ActionResult> MyProfile()
  {
    ...

    return View();
  }

  ...
}
```

이상으로 기존의 `AuthorizeAttribute` 속성 클라스를 수정하여 우리가 원하는 에러 페이지를 좀 더 명확하게 반환할 수 있게끔 했다. 이 라이브러리는 앞서 언급했다시피 [NuGet 패키지](https://www.nuget.org/packages/Aliencube.AuthorizeAttribute.Extended/)로도 제공하니 필요하면 다운로드 받아서 곧바로 사용할 수 있다.
