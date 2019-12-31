---
title: "앱에서도 Server.MapPath() 메소드 사용하기"
date: "2015-04-06"
slug: using-server-mappath-method-in-apps
description: ""
author: Justin-Yoo
tags:
- dotnet
- http-server-utility
- map-path
fullscreen: false
cover: ""
---

[`HttpServerUtility.MapPath()`](https://msdn.microsoft.com/en-us/library/system.web.httpserverutility.mappath(v=vs.110).aspx) 메소드는 닷넷 웹 애플리케이션을 개발할 때 가장 자주 쓰이는 메소드들 중 하나이다. 특히나 파일 입출력 관련해서는 없어서는 안될 메소드들 중 하나인데, 웹 상의 주소를 실제 서버의 물리적인 주소로 바꿔주는 역할을 하기 때문이다. 하지만, 이 메소드는 클라스명을 보면 알 수 있겠지만, 웹 애플리케이션에서만 사용할 수 있다. 일반적인 콘솔 앱이나 윈도우 앱에서는 이를 사용할 수 없는데, 이런 앱에서도 파일 입출력과 관련해서 비슷한 경우를 자주 접할 수 있기 때문에 그때그때 코드를 작성하는 편이다.

아래 소개할 라이브러리는 이러한 불편을 해소하기 위해 만들어진 것으로서 윈도우 앱과 웹 앱 양 쪽에서 모두 사용할 수 있고, 특히나 웹 앱에서는 [HttpContext](https://msdn.microsoft.com/en-us/library/system.web.httpcontext(v=vs.110).aspx) 객체의 의존성을 없애주어서 유용하게 쓰일 수 있다.

## 라이브러리

- 소스코드: [https://github.com/aliencube/AlienUtility](https://github.com/aliencube/AlienUtility)
- nuget: [https://www.nuget.org/packages/Aliencube.AppUtilities/](https://www.nuget.org/packages/Aliencube.AppUtilities/)

## 코드 소개

코드는 기존의 `Server.MapPath()` 메소드와 동일하게 사용할 수 있다.

```csharp
public virtual async Task<ActionResult> Index(HomeIndexViewModel vm)
{
  using (var appUtil = new AppUtility())
  {
    try
    {
      var fullpath = appUtil.MapPath(vm.Directory);
      vm.FullPath = fullpath;
    }
    catch (Exception ex)
    {
      vm.FullPath = String.Format("FAIL!!: {0}", ex.Message);
    }
  }
  return View(vm);
}

```

위의 코드는 웹 앱에서 사용한 방법이다. 마찬가지로 콘솔 앱에서는 아래와 같은 식으로 사용할 수 있다.

```csharp
private static void Run(IList<string> args)
{
  if (args == null || !args.Any())
  {
    throw new ArgumentNullException("args");
  }

  if (args.Count() > 1)
  {
    throw new ArgumentException("Too many arguments");
  }

  using (var appUtil = new AppUtility())
  {
    try
    {
      var fullpath = appUtil.MapPath(args.First());
      Console.WriteLine("{0} => {1}", args.First(), fullpath);
    }
    catch (Exception ex)
    {
      Console.WriteLine("{0} => FAIL!!: {1}", args.First(), ex.Message);
    }
  }
}

```

오히려 기존의 `MapPath()`보다 예외처리에 덜 민감하게끔 `TryMapPath()` 메소드도 제공한다.

```csharp
using (var appUtil = new AppUtility())
{
  string fullpath;
  var result = appUtil.TryMapPath("~/Test", out fullpath);
}

```

위의 코드에서 볼 수 있다시피 만약 `~/Test` 디렉토리의 물리적인 주소를 반환하면서 그 디렉토리가 유효하면 `true`를, 유효하지 않으면 `false`를 반환한다. 만약 유효하지 않은 디렉토리 값이라면 물리적인 주소는 `null`이 된다. 이에 실제 반환한 물리적인 주소가 실제로 존재하는지 여부도 체크하는데, 존재하지 않는 디렉토리라면 `false`와 `null`값을 반환한다.

이상으로 알찬 간단한 `MapPath()` 메소드 소개를 끝마친다.
