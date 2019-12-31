---
title: "OWIN 기반 Web API 서비스 만들기"
date: "2014-08-04"
slug: developing-owin-based-web-api-service
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- OWIN
- web-api
fullscreen: false
cover: ""
---

> 알림: [@haruair](https://twitter.com/haruair)님께서 공유해주신 [OWIN 기반 웹사이트 만들기](http://haruair.com/blog/2294)에 덧붙여 작성해 보는 포스트.

기본적인 OWIN 프로젝트를 어떻게 시작하는지에 대해서는 위의 포스트에 다 나와 있으니 생략하기로 하고, 거기서 좀 더 발전된 형태로 실제 돌아가는 ASP.NET Web API 서비스를 만들어 보도록 하자. ASP.NET MVC와 ASP.NET Web API는 서로 다른 콘텍스트에서 돌아가므로, 서로 영향을 주고 받지 않는다. 물론 서로 영향을 주고 받으려면 [Katana 라이브러리](http://www.nuget.org/packages/Microsoft.Owin.Host.SystemWeb)를 설치하면 된다. 이와 관련된 논의는 [Migrate Global.asax to Startup.cs](http://stackoverflow.com/questions/25032284/migrate-global-asax-to-startup-cs/25080611#25080611)을 참고하도록 하자. (딱히 내 답변이 채택되어서 자랑하려는 의도는 아니다. 사실이다. 믿어주라.)

이 포스트에 사용된 소스코드는 아래 리포지토리에서 확인할 수 있다.

- [WindowsServicesMonitoring](https://github.com/aliencube/WindowsServicesMonitoring)

추가로 더 확인할 마음이 있다면 아래 두 리포지토리도 참고할 만 하다.

- [WindowsServicesMonitoring.Core](https://github.com/aliencube/WindowsServicesMonitoring.Core)
- [Aliencube.Owin.Page404](https://github.com/aliencube/Aliencube.Owin.Page404)

## `Startup.cs` 구성하기

전통적인 ASP.NET 웹사이트에서 `Global.asax.cs` 파일이 하는 역할을 OWIN 기반 웹 어플리케이션에서는 바로 이 `Startup.cs`가 담당한다. `Global.asax.cs` 안의 `MvcApplication.Application_Start()` 메소드가 하는 일을 `Startup.cs`의 `Startup.Configuration()` 메소드가 담당하므로, 최대한 비슷한 개발 경험을 공유하기 위하여 비슷한 형태로 만들어 보도록 한다.

최초로 프로젝트를 구성하게 되면 아래와 같이 아무것도 없는 빈 프로젝트가 만들어진다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.01.png)

최대한 기존의 ASP.NET Web API 프로젝트 구조와 비슷하게 작성하기 위하여 아래와 같이 디렉토리를 구성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.02.png)

이제 `Startup.cs` 파일을 열고 아래와 같이 입력한다.

```csharp
public class Startup
{
    public void Configuration(IAppBuilder app)
    {
        WebApiConfig.Register(app);
    }
}
```

여기서 주목해야 할 부분은 `WebApiConfig.Register(app)` 부분이다. 기존의 `Global.asax.cs` 안에서 설정했던 라우팅 부분을 바로 `WebApiConfig.Register(app)` 에서 담당한다. 이것은 정적 메소드로서 `App_Start` 폴더 안에 작성한다.

## `WebApiConfig.Register(IAppBuilder)` 작성하기

`App_Start` 폴더 아래에 `WebApiConfig.cs` 라는 파일을 열고 그 안에 아래와 같이 코드를 작성한다.

```
public static class WebApiConfig
{
    public static void Register(IAppBuilder app)
    {
        var config = new HttpConfiguration();
        config.MapHttpAttributeRoutes(); // #1

        config.Formatters.JsonFormatter.UseDataContractJsonSerializer = true;
        config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver(); // #2

        app.UseWebApi(config); // #3

        config.EnsureInitialized(); // #4
    }
}

```

- `#1`: URL 라우팅을 위해서 `AttributeRouting`을 사용한다. 기존의 `RouteCollection` 객체는 OWIN 콘텍스트 상에서 사용할 수 없다.
- `#2`: JSON 직렬화를 설정한다.
- `#3`: Web API 미들웨어를 사용한다고 선언한다.
- `#4`: 이 메소드를 실행시키는 것으로 모든 `HttpConfiguration` 설정이 초기화 됐음을 확인한다.

지금까지 기본적인 환경 설정을 끝마쳤다. 이제 본격적으로 Web API 콘트롤러를 작성해 보도록 하자.

## `ServiceController` 작성하기

`ServiceController`는 아래와 같은 형태로 작성할 수 있다. 원래대로라면 실제로 구현된 서비스가 들어가야 하나, 편의상 간단한 내용만을 출력하는 것으로 바꿔보도록 한다.

```
[Route("services")] // #1
public class ServiceController : ApiController
{
    public HttpResponseMessage Get() // #2
    {
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("{"value": "services"}") // #3
        };
        return response;
    }
}

```

- `#1`: Web API URL을 결정하는 부분이다. 즉 `http://localhost:12345/services` 라고 입력하면 곧바로 아래와 같은 결과를 확인할 수 있다.

```
    { "value": "services" }

```

- `#2`: `GET` 메소드를 정의한다.
- `#3`: 리턴 값을 정의한다. 여기서는 가장 간단한 JSON 포맷의 문자열을 리턴한다.

## 서비스 확인하기

여기까지 문제가 없었다면 바로 F5 키를 눌러서 서비스를 확인해 볼 수 있다. 참고로 Self-host 웹서버를 구동시키는 방법은 두가지가 있는데, 하나는 [Self-host NuGet 패키지 라이브러리](http://www.nuget.org/packages/Microsoft.AspNet.WebApi.OwinSelfHost/)를 통해 직접 구현하는 방식이고 다른 하나는 [OWIN Host NuGet 패키지 라이브러리](http://www.nuget.org/packages/OwinHost/)를 통해 구동하는 방식이다. 편의성은 후자가 낫지만 이는 Visual Studio 2013 이후 버전에서만 작동한다. 여기서는 후자인 `OwinHost`를 이용한다.

F5키를 눌러서 웹페이지를 열면 아무것도 없는 빈 페이지가 나타난다. 당황하지 말자. 의도한 바이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.03.png)

이제 `http://localhost:12345/services`를 주소창에 쳐보자. 그러면 아래와 같은 결과를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.04.png)

## 정적 페이지 다루기

앞서 확인했다시피 `http://localhost:12345`라고 입력했을 경우에 아무것도 나타나지 않는다. 이는 페이지 이름을 명시하지 않을 경우 기본적으로 `index.html` 페이지를 불러와야 하는데 이부분에 대하여 정의한 적이 없기 때문이다. 이것은 아래와 같이 OWIN 미들웨어를 추가해줌으로써 해결할 수 있다. 다시 `Startup.cs` 파일을 열어보도록 하자.

```
public class Startup
{
    public void Configuration(IAppBuilder app)
    {
        WebApiConfig.Register(app);
        StaticFilesConfig.Register(app);
    }
}

```

위와 같이 `StaticFilesConfig.Register(app);` 메소드를 추가한다. 이 내용은 `App_Start` 디렉토리에 정의되어 있다.

## `StaticFilesConfig.Register(IAppBuilder)` 작성하기

`App_Start` 폴더 아래에 `StaticFilesConfig.cs` 라는 파일을 열고 그 안에 아래와 같이 코드를 작성한다.

```
public static class StaticFilesConfig
{
    public static void Register(IAppBuilder app)
    {
        RegisterHtmlPages(app);  // #1
        RegisterImageFiles(app); // #2
    }

    private static void RegisterHtmlPages(IAppBuilder app)
    {
        var options = new FileServerOptions
                      {
                          RequestPath = PathString.Empty,
                          FileSystem = new PhysicalFileSystem(@"."),
                          EnableDefaultFiles = true,
                          EnableDirectoryBrowsing = false,
                      };
        options.StaticFileOptions.DefaultContentType = "text/html";
        options.StaticFileOptions.FileSystem = new PhysicalFileSystem(@".");
        app.UseFileServer(options);
    }

    private static void RegisterImageFiles(IAppBuilder app)
    {
        var options = new StaticFileOptions()
                      {
                          DefaultContentType = "image/png",
                          FileSystem = new PhysicalFileSystem(@".images")
                      };
        app.UseStaticFiles(options);
    }
}

```

- `#1`: 정적 HTML 페이지를 등록하는 메소드이다. 여기서 디렉토리만 지정했을 경우 디폴트 페이지를 찾는 부분까지 포함되어 있다. 이를 위해서는 `UseFileServer()` 미들웨어를 사용한다. 디폴트 페이지는 `default.htm`, `default.html`, `index.htm`, `index.html` 의 순서로 찾을 수 있고, 원한다면 사용자가 더 추가시킬 수도 있다.
- `#2`: 이미지 파일들을 등록하는 메소드이다. 특정 디렉토리 안의 이미지 파일들을 등록한다. 여기서는 `/images` 디렉토리 아래의 이미지 파일들을 보여줄 수 있게끔 설정해 놓았다. 이를 위해서 `UseStaticFiles()` 미들웨어를 사용했다. 이와 동일한 방식으로 자바스크립트 및 CSS 파일을 등록시킬 수도 있다.

여기까지 해서 만들어진 디렉토리 구조는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.05.png)

이렇게 한 후 다시 F5키를 눌러 디폴트 페이지 및 정적 페이지가 나오는지 확인해 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.06.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.07.png)

## 404 페이지 다루기

여기까지 했다면, 이제 이런 궁금증이 생길 수도 있겠다. 만약 `http://localhost:12345/nopage.html`과 같이 실제로 존재하지 않는 페이지에 접근한다면 현재는 아무것도 보여주지 않지만 조금 더 명확하게 404 에러 페이지를 보여주는 것이 좋지 않을까? 물론 이것도 가능하다. 다시 `Startup.cs` 파일을 열어 아래와 같이 수정해 보자.

```
public class Startup
{
    public void Configuration(IAppBuilder app)
    {
        WebApiConfig.Register(app);
        StaticFilesConfig.Register(app);
        Page404Config.Register(app);
    }
}

```

위와 같이 `Page404Config.Register(app);` 메소드를 추가한다. 이것 역시도 `App_Start` 디렉토리에 정의되어 있다.

## `Page404Config.Register(IAppBuilder)` 작성하기

`App_Start` 폴더 아래에 `Page404Config.cs` 라는 파일을 열고 그 안에 아래와 같이 코드를 작성한다.

```
public static class Page404Config
{
    public static void Register(IAppBuilder app)
    {
        Register404Page(app);
    }

    private static void Register404Page(IAppBuilder app)
    {
        var options = new Page404Options()
                      {
                          FileSystem = new PhysicalFileSystem(@"."),
                          IsLastMiddleware = true,
                          UseCustom404Page = true,                               // #1
                          Custom404PagePath = new PathString("/error/404.html"), // #2
                          Custom404PageDir = new PhysicalFileSystem(@".");       // #3
                      };
        app.UsePage404(options);                                                 // #4
    }
}

```

- `#1`: 커스텀 404 페이지를 사용하려면 이 값을 `true`로 놓는다. 라이브러리에서 주어지는 빌트인 404 페이지를 쓰고 싶다면 이 값을 `false`로 놓으면 된다.
- `#2`: 커스텀 404 페이지 URL을 설정한다.
- `#3`: 커스텀 404 페이지의 실제 물리적 파일 주소이다. 일반적으로 `@"."`으로 설정하면 된다.
- `#4`: `Page404` 미들웨어를 사용하겠다는 선언이다.

이렇게 설정한 후 만들어진 디렉토리 구조는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.08.png)

이제 다시 F5키를 눌러 웹사이트를 실행시킨 후 실제 존재하지 않는 주소인 `http://localhost:12345/nopage.html`을 호출해보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.09.png)

만약 `UseCustom404Page` 옵션 값을 `false`로 한 후 다시 확인해 보면 아래와 같은 기본 404 페이지를 볼 수 있을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/08/windows.services.monitoring.10.png)

## 다른 미들웨어 추가하기

앞서와 같은 방식으로 계속 미들웨어를 추가함으로써 콘텍스트를 마음껏 다룰 수 있다. 예제 코드에 있다시피 `ErrorConfig.Register(app)`을 추가한다면 500 에러 페이지를 보여줄 수도 있고, `DependencyConfig.Register(app)`을 추가한다면 다양한 IoC 콘트롤러를 이용한 의존성 주입을 구현할 수도 있다.

## 마치며

기존의 ASP.NET이 IIS에 의존할 수 밖에 없는 웹 서비스였다면, OWIN을 이용한다면 이제는 더이상 IIS에 의존할 이유가 없다. 다시 말해서 ASP.NET이 윈도우 종속적인 서비스일 수 밖에 없었다면, 이제는 OWIN을 이용하여 윈도우를 벗어나 다양한 운영체제 및 다양한 웹서버에서 돌아갈 수 있다는 것을 의미한다. 아직까지 ASP.NET MVC는 IIS 의존성을 완전하게 버리지 못했다. 하지만 곧 출시될 [ASP.NET vNext](http://www.asp.net/vnext) 부터는 완벽하게 IIS 독립적인 서비스가 가능하리라고 감히 예상한다.
