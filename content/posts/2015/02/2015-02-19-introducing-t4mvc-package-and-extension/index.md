---
title: "T4MVC 패키지 및 확장 기능 소개"
date: "2015-02-19"
slug: introducing-t4mvc-package-and-extension
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- MVC
- Razor
- T4 Template
- T4MVC
fullscreen: false
cover: ""
---

ASP.NET MVC 웹 앱을 개발하다보면 Razor 스크립트에서 흔히 볼 수 있는 코드는 아래와 같은 것들이 있다.

```razor
// for <form ...></form>
@using (Html.BeginForm("Login", "Account", FormMethod.Post))
{
   ...
}

// for <a ...></a>
@Html.ActionLink("My Profile", "MyProfile", "Account", new { id = Model.Id }, null)
```

딱히 문제가 될 것은 없다. 하지만, ActionName 또는 ControllerName 파라미터를 `string` 값으로 직접 하드코딩해야 하는 부분에서 오타가 난다면 에러가 나지 않을까? 이런 점에 착안해서 `strongly-typed` 콘트롤러명, 액션명을 아예 부여하면 어떨까 하는 아이디어에서 나온 NuGet 라이브러리 패키지가 바로 [T4MVC](http://www.nuget.org/packages/T4MVC/)이다. 이 패키지와 더불어 VS 확장 기능인 [AutoT4MVC](https://visualstudiogallery.msdn.microsoft.com/8d820b76-9fc4-429f-a95f-e68ed7d3111a)를 사용하면 손쉽게 아래와 같은 형태로 위의 Razor 코드를 변경해서 사용할 수 있다.

```razor
// for <form ...></form>
@using (Html.BeginForm(MVC.Account.ActionNames.Login, MVC.Account.Name, FormMethod.Post))
{
   ...
}

// for <a ...></a>
@Html.ActionLink("My Profile", MVC.Account.MyProfile(Model.Id))
```

아주 간편하다. 특히나 오타가 날 일도 없다.

이 외에도 더 많은 기능들이 있지만, 그건 [이 문서](https://github.com/T4MVC/T4MVC/wiki/Documentation)를 참고하도록 하자. 위의 두 가지만으로도 이 패키지는 충분히 쓸모가 있다.
