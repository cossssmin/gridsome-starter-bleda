---
title: "ELMAH를 사용하여 웹사이트 에러 로그 구축하기"
date: "2014-05-07"
slug: logging-website-logs-with-elmah
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- ELMAH
- Error Log
- MVC
fullscreen: false
cover: ""
---

> 이 포스트는 `ELMAH`와 `NLog`를 이용한 웹사이트 에러 로그 시스템 구축 관련 포스트들의 시리즈입니다. 다른 포스트들은 아래 링크에서 확인할 수 있습니다.
> 
> 1. `ELMAH`를 사용하여 웹사이트 에러 로그 구축하기
> 2. [데이터베이스에 `ELMAH` 로그 데이터 저장하기](http://blog.aliencube.org/ko/2014/05/08/storing-error-logs-into-database-with-elmah)
> 3. 데이터베이스에 `NLog` 로그 데이터 저장하기 (예정)
> 4. 로그 리포트 페이지 구축하기 (예정)

[`ELMAH` (Error Logging Modules and Handlers)](https://code.google.com/p/elmah)는 웹사이트 구축시 에러 로그를 저장하기 위해 쓰이는 가장 인기있는 라이브러리 중 하나이다. 다른 유명한 것들로는 [`NLog`](http://nlog-project.org), [`log4net`](http://logging.apache.org/log4net) 등이 있다. `ELMAH`가 다른 로깅 라이브러리들과 다른 점이라면 오로지 Exception들만 잡아낸 다는 것이다. 심지어 Unhandled Exception들도 모두 로그에 기록한다.[1](#fn-193-1) 반면에 `NLog` 혹은 `log4net`은 Exception 뿐만 아니라 원하는 형태의 모든 로그를 기록 가능하다. 따라서, `ELMAH` 단독으로 로깅 시스템을 구축하기 보다는 `NLog` 또는 `log4net` 등과 함께 사용하는 것이 낫다.

그렇다면, 그냥 `NLog` 아니면 `log4net`만 쓰면 될 것을 뭐하러 `ELMAH`를 쓸까? 아무래도 모든 Exception 상황들에 대한 처리를 `ELMAH`에 맡겨두고 나머지만 신경쓰면 되기 때문일 것이다. 또한 `ELMAH`를 이용하면 추가적인 코드 작성이 필요가 없다. 여기서는 이 `ELMAH` 라이브러리를 이용해서 에러 로그 시스템을 구축하는 방법에 대해 논의해 보도록 하겠다. 관련 소스코드는 아래 링크에서 다운로드가 가능하다.

[https://github.com/aliencube/Aliencube-ELMAH](https://github.com/aliencube/Aliencube-ELMAH)

## ASP.NET MVC 5 웹사이트 구축

비주얼 스튜디오 2013을 사용한다면 상관없지만, 만약 비주얼 스튜디오 2012를 사용한다면 ASP.NET MVC 5 사이트를 구축하기 위해서는 약간의 작업이 필요하다. 이와 관련해서는 아래 포스트에서 이미 다루었으니 참고하기 바란다.

[비주얼 스튜디오 2012에서 ASP.NET MVC 5 돌리기](http://blog.aliencube.org/ko/2014/03/31/running-asp-net-mvc-5-application-in-visual-studio-2012)

물론, ASP.NET MVC 4 또는 그 이하에서도 적용이 가능하다.

## `ELMAH` 라이브러리 설치

위에서 ASP.NET MVC 웹사이트를 구축했다면, 해당 프로젝트에 `ELMAH` 라이브러리를 설치해야 한다. [http://nuget.org](http://www.nuget.org/packages/elmah)에서 다운로드 받아 설치하도록 하자. 설치가 끝나면 `Web.config` 파일에 아래와 같은 내용이 자동으로 추가된 것을 확인할 수 있다.

이로써 설치는 `ELMAH` 라이브러리 설치는 모두 끝났다. 이제 웹사이트를 실행시켜보자. 여기서는 앞서 구축한 웹사이트의 URL을 `http://elmah.aliencube.local`로 가정한다. 참고로 위의 내용 중에서 **11번 라인**의 `allowRemoteAccess`값은 무조건 `false`로 놓도록 하자. 그렇지 않으면 심각한 보안 이슈가 발생할 수도 있다.[2](#fn-193-2) 물론, `true`로 했을 경우에도 Role-based Authorisation을 이용해서 사용은 가능하지만, 굳이 위험을 감수할 필요는 없다. 저 값을 `false`로 놓았다고 하더라도 로컬호스트로 접속할 경우에는 로그 페이지에 접속이 가능하다.

## 웹사이트 로그페이지 보기

웹사이트에 `ELMAH`설치를 마쳤다면 실제로 웹사이트를 실행시켜보자. 로그 페이지는 `http://elmah.aliencube.local/elmah.axd`를 통해 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-01.png)

현재까지는 아무런 에러가 발생하지 않았기 때문에 위와 같이 보일 것이다. 이제 에러를 하나 발생시켜보자. `http://elmah.aliencube.local/not-found` 페이지를 접속해보자. 당연히 404 YSOD 페이지가 나타날 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-02.png)

이제 다시 `http://elmah.aliencube.local/elmah.axd` 페이지로 접속을 해보자. 그러면 로그가 하나 기록된 것이 보일 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-03.png)

위의 화면과 같이 에러 로그 리스트가 나타날텐데, `Details` 링크를 클릭해서 들어가보면 아래와 같이 자세한 내용을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-04.png)

앞서, `Web.config` 파일의 `<elmah>...</elmah>` 섹션에서 `<security allowRemoteAccess="false" />`로 무조건 해야 한다고 했는데, 바로 이 부분 때문이다. 이 값을 `true`로 했을 경우 웹사이트를 방문하는 모든 사람이 에러 로그를 확인할 수 있다. 심지어 위 화면에 보면 웹서버의 설정등과 같은 아주 자세한 내용들이 보이기 때문에, 이 페이지를 반드시 막아놓아야 한다. `ELMAH`는 다양한 에러 로그를 확인할 수 있는 다양한 방법을 제공하기 때문에 굳이 저 페이지를 통하지 않아도 상관없다.

## 예외 상황 발생 시키기

이번엔 실제 콘트롤러/액션에서 발생하는 에러를 확인해 보도록 하자. 아래와 같이 `HomeController`를 작성한다.

```csharp
public class HomeController : Controller
{
    public ActionResult Confused()
    {
        throw new NotImplementedException();
    }
}
```

이제 `http://elmah.aliencube.local/home/confused` 페이지로 접속하게 되면 아래와 같은 에러페이지를 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-05.png)

그리고 다시 `http://elmah.aliencube.local/elmah.axd` 페이지로 접속해 보면 아래와 같이 에러로그가 하나 추가된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-06.png)

## 결론

이상으로, `ELMAH` 라이브러리를 이용하여 에러 로그 페이지를 작성해 보았다. `ELMAH`가 가진 강력한 점들 중 하나는 위에서 진행한 바와 같이 라이브러리를 추가하고 `Web.config`파일을 약간 손봐준 것 만으로도 훌륭한 로그 시스템이 만들어진다는 것이다. 하지만, 이 방법의 문제점이라면, 위의 마지막 이미지에서 볼 수 있다시피 모든 로그의 내용이 서버의 메모리에 저장된다는 것이다. 즉, 서버를 재시작한다거나, 심지어 `Web.config` 파일을 수정만 해도 기존에 저장됐던 모든 로그들이 사라지게 된다. 따라서 별도의 파일 시스템 혹은 데이터베이스를 이용하여 로그들을 저장해야 하는데, [다음 포스트](http://blog.aliencube.org/ko/2014/05/08/storing-error-logs-into-database-with-elmah)에서는 이렇게 작성된 에러 로그들을 데이터베이스에 저장하는 방법에 대해 논의해 보도록 하자.

**참고**

- [How to get ELMAH to work with ASP.NET MVC \[HandleError\] attribute?](http://stackoverflow.com/questions/766610/how-to-get-elmah-to-work-with-asp-net-mvc-handleerror-attribute)
- [Logging in MVC Part 1- Elmah](http://dotnetdarren.wordpress.com/2010/07/27/logging-on-mvc-part-1)
- [ASP.NET MVC Magical Error Logging with ELMAH](http://ivanz.com/2011/05/08/asp-net-mvc-magical-error-logging-with-elmah)
- [Logging Errors with ELMAH in ASP.NET MVC 3 – Part 1 – (Setup)](http://joel.net/logging-errors-with-elmah-in-asp.net-mvc-3--part-1--setup)
- [Securing Error Log Pages](https://code.google.com/p/elmah/wiki/SecuringErrorLogPages)

* * *

2. [What is the difference between log4net and elmah?](http://stackoverflow.com/questions/5057674/what-is-the-difference-between-log4net-and-elmah) [↩](#fnref-193-1)

4. [ASP.NET session hijacking with Google and ELMAH](http://www.troyhunt.com/2012/01/aspnet-session-hijacking-with-google.html) [↩](#fnref-193-2)
