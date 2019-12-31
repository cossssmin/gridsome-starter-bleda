---
title: "HtmlHelper.ActionLink()에 이미지 삽입하기"
date: "2015-04-29"
slug: adding-image-to-html-actionlink
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- action-link
- html-helper
- image
- image-action-link
- image-link
- link
- mvc
fullscreen: false
cover: ""
---

[`HtmlHelper`](https://msdn.microsoft.com/en-us/library/system.web.mvc.htmlhelper.aspx) 클라스는 상당히 많은 익스텐션 메소드들을 제공하는데, 그중 하나가 [`ActionLink()`](https://msdn.microsoft.com/en-us/library/system.web.mvc.html.linkextensions.actionlink.aspx)이다. 이 `ActionLink()` 메소드도 받아들이는 파라미터의 종류와 갯수에 따라 굉장히 여러 가지 종류가 있는데, 가장 대표적인 것은 아래와 같다.

```razor
@Html.ActionLink("linkText", "actionName")

```

이것은 지정된 액션을 하이퍼 링크로 하고, `<a>...</a>` 사이의 텍스트로는 `linkText`를 갖는 하나의 완결된 HTML 앵커 태그를 생성한다. 따라서, 위와 같이 작성한 Razor 스크립트는 실제로 HTML 렌더링을 거치고 나면 아래와 같다.

```html
<a href="/controllerName/actionName">linkText</a>

```

굉장히 유용한 익스텐션 메소드인데, 이것의 가장 큰 단점은 저 `linkText` 대신 이미지를 지정할 수 없다는 것이다. 이런 경우에는 보통 아래와 같은 방식으로 `@Url.Action()` 메소드를 이용하여 Razor 스크립트를 작성하는 편이다.

```razor
<a href="@Url.Action("actionName")"><img src="http://image.resource" /></a>

```

하지만, 뭔가 다른 방법이 없을까? 결론적으로 말하자면 일단 기존의 `ActionLink()` 메소드로는 원하는 기능을 구현할 수 없고, 아래와 같은 식의 새로운 확장 메소드를 제작해야 한다.

```razor
@Html.ImageActionLink("src", "actionName")

```

이렇게 작성한 결과는

```html
<a href="/controllerName/actionName"><img src="src" /></a>

```

이런 결과를 기대할 수는 없을까? 그래서 만들었다. 이름하여 [**HtmlHelper.Extended**](https://github.com/aliencube/HtmlHelper.Extended). 이 라이브러리를 이용하면 아래 네 가지 익스텐션 메소드들을 사용할 수 있다.

## `HtmlHelper.Link()`

`@Html.Link()` 메소드는 아래와 같이 여러 가지 형태로 변형해서 사용할 수 있다.

```razor
@Html.Link("Link Text", "http://link.url");
@Html.Link("Link Text", "http://link.url", new { title = "Link Title" });

```

위의 결과는 아래와 같다.

```html
<a href="http://link.url">Link Text</a>
<a href="http://link.url" title="Link Title">Link Text</a>

```

## `HtmlHelper.Image()`

`@Html.Image()` 메소드는 아래와 같이 여러 가지 형태로 변형해서 사용할 수 있다.

```razor
@Html.Image("http://image.source");
@Html.Image("http://image.source", new { alt = "Alternative Text" });

```

위의 결과는 아래와 같다.

```html
<img src="http://image.source" />
<img src="http://image.source" alt="Alternative Text" />

```

## `HtmlHelper.ImageLink()`

`@Html.ImageLink()` 메소드는 아래와 같이 여러 가지 형태로 변형해서 사용할 수 있다.

```razor
@Html.Image("http://image.source", "http://link.url");
@Html.Image("http://image.source", "http://link.url", new { title = "Link Title" }, new { border = 0 });

```

위의 결과는 아래와 같다.

```html
<a href="http://link.url"><img src="http://image.source" /></a>
<a href="http://link.url" title="Link Title"><img src="http://image.source" border="0" /></a>

```

## `HtmlHelper.ImageActionLink()`

`@Html.ImageActionLink()` 메소드는 아래와 같이 여러 가지 형태로 변형해서 사용할 수 있다.

```razor
@Html.ImageActionLink("http://image.source", "Action Method Name");
@Html.ImageActionLink("http://image.source", "Action Method Name", new { title = "Link Title" });
@Html.ImageActionLink("http://image.source", "Action Method Name", new { title = "Link Title" }, new { border = 0 });
@Html.ImageActionLink("http://image.source", "Action Method Name", new { id = 1 }, new { title = "Link Title" }, new { border = 0 });

@Html.ImageActionLink("http://image.source", "Action Method Name", "Controller Name");
@Html.ImageActionLink("http://image.source", "Action Method Name", "Controller Name", new { title = "Link Title" });
@Html.ImageActionLink("http://image.source", "Action Method Name", "Controller Name", new { title = "Link Title" }, new { border = 0 });
@Html.ImageActionLink("http://image.source", "Action Method Name", "Controller Name", new { id = 1 }, new { title = "Link Title" }, new { border = 0 });

```

위의 결과는 아래와 같다.

```html
<a href="/home/action"><img src="http://image.source" /></a>
<a href="/home/action" title="Link Title"><img src="http://image.source" /></a>
<a href="/home/action" title="Link Title"><img src="http://image.source" border="0" /></a>
<a href="/home/action/1" title="Link Title"><img src="http://image.source" border="0" /></a>

<a href="/controller/action"><img src="http://image.source" /></a>
<a href="/controller/action" title="Link Title"><img src="http://image.source" /></a>
<a href="/controller/action" title="Link Title"><img src="http://image.source" border="0" /></a>
<a href="/controller/action/1" title="Link Title"><img src="http://image.source" border="0" /></a>

```

꼭 써보도록 하자. 두 번 쓰자.
