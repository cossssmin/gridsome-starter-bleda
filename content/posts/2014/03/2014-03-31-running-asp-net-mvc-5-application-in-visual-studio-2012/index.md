---
title: "비주얼 스튜디오 2012에서 ASP.NET MVC 5 돌리기"
date: "2014-03-31"
slug: running-asp-net-mvc-5-application-in-visual-studio-2012
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- MVC 5
- Visual Studio 2012
fullscreen: false
cover: ""
---

비주얼 스튜디오 2012는 기본적으로 ASP.NET MVC 4까지 지원한다. 따라서, 기본으로 생성해주는 템플릿을 그대로 사용한다면 아무런 문제가 없지만, NuGet 패키지를 ASP.NET MVC 5로 업그레이드한다면 아래와 같은 에러를 볼 수 있을 것이다.

> \[A\]System.Web.WebPages.Razor.Configuration.HostSection cannot be cast to \[B\]System.Web.WebPages.Razor.Configuration.HostSection. Type A originates from 'System.Web.WebPages.Razor, Version=2.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35' in the context 'Default' at location 'C:\\Windows\\Microsoft.Net\\assembly\\GAC\_MSIL\\System.Web.WebPages.Razor\\v4.0\_2.0.0.0\_\_31bf3856ad364e35\\System.Web.WebPages.Razor.dll'. Type B originates from 'System.Web.WebPages.Razor, Version=3.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35' in the context 'Default' at location 'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\Temporary ASP.NET Files\\root\\0302e1ad\\48cee172\\assembly\\dl3\\7b23cdc8\\404468a7\_784ccf01\\System.Web.WebPages.Razor.dll'.

이는 참조하는 라이브러리 파일의 버전이 올라가면서 생기는 문제이다. 기존의 `Web.Config` 파일은 구버전의 라이브러리를 포인팅하는데 실제로는 새버전의 라이브러리로 바뀌었으므로 `Web.Config`에서 몇군데만 설정을 바꾸어주면 된다. `Web.Config` 파일은 최소 두 개가 있다. 하나는 루트에, 다른 하나는 `Views` 디렉토리에 있는데, 이 둘을 모두 수정해야 한다.

## `Web.Config`

루트에 있는 `Web.Config`을 열어보면 아래와 같은 부분을 확인할 수 있다. 이 값은 원래 `2.0.0.0`이었으나, 버전업을 하면서 바뀌었으니 `3.0.0.0`으로 바꿔주어야 한다. 향후 더 높은 버전이 나타날 경우에는 아래와 같이 라이브러리 속성을 확인해서 바꿀 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/03/System.Web_.WebPages.png)

// /Web.Config
 ... 

## `~/Views/Web.Config`

`~/Views/Web.Config` 파일에서는 몇군데를 수정해야 한다. 우선 아래와 같이 라이브러리 버전을 확인해 보면 현재는 `3.0.0.0`으로 나타나니 기존에 `2.0.0.0`으로 되어 있는 부분을 모두 바꾸어 주면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/03/System.Web_.WebPages.Razor_.png)

// ~/Views/Web.Config
  

마지막으로, 동일한 `~/Views/Web.Config` 파일에서 `System.Web.Mvc` 라이브러리 버전을 변경해 주어야 한다. 기존 값은 `4.0.0.0`이었으나, 현재는 `5.1.0.0`으로 버전업 된 상태. 따라서, 아래와 같이 바꾸어 준다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/03/System.Web_.Mvc_.png)

  
 ... 

이렇게 바꾸어준 후 다시 웹브라우저를 열어 사이트를 확인해 보면 아무런 에러 없이 페이지가 나타나는 것을 확인할 수 있다.
