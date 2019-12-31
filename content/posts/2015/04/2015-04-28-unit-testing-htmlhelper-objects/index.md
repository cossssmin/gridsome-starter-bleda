---
title: "HtmlHelper 객체 유닛 테스트"
date: "2015-04-28"
slug: unit-testing-htmlhelper-objects
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- ASP.NET MVC
- HtmlHelper
- Moq
- NSubstitute
- unit-testing
fullscreen: false
cover: ""
---

ASP.NET MVC 앱을 개발하다보면 [`HtmlHelper`](https://msdn.microsoft.com/en-us/library/dd492619(v=vs.118).aspx) 객체를 Razor 스크립트 안에서 반드시 쓰게 되어 있다. 그런데, 이것은 기본적으로 웹서버 파이프라인 안에서 작동하는 것이다보니 유닛테스트를 하기가 쉽지 않다. 하지만 항상 길은 있는 법. Fake 객체를 만들어서 유닛테스트에 사용할 수 있다.

## Moq 라이브러리를 사용하여 테스트하기

이미 ASP.NET MVC 프레임워크는 오픈소스로 공개가 되어 있으니, [소스 코드](http://aspnetwebstack.codeplex.com/) 페이지에 직접 가서 확인을 해보면, MS는 내부적으로 [`Moq`](https://github.com/Moq/moq4) 이라는 목킹 라이브러리를 사용한다. 이를 이용한 테스트 코드는 아래 페이지에서 확인해 볼 수 있다.

- [http://aspnetwebstack.codeplex.com/.../MvcHelper.cs](http://aspnetwebstack.codeplex.com/SourceControl/latest#test/System.Web.Mvc.Test/Util/MvcHelper.cs)

## NSubstitute 라이브러리를 사용하여 테스트하기

개인적으로는 [`NSubstitute`](https://nsubstitute.github.io) 라이브러리를 선호하는지라 위의 `Moq` 라이브러리를 이용한 코드를 `NSubstitute` 라이브러리를 이용하여 바꿔 보았다. 관련 소스 코드는 아래 링크에서 확인해 볼 수 있다.

- [https://github.com/aliencube/HtmlHelper.Extended/.../MvcHelper.cs](https://github.com/aliencube/HtmlHelper.Extended/blob/master/SourceCodes/99_Tests/HtmlHelperExtended.Tests/MvcHelper.cs)

특히 눈여겨 봐 둬야 할 메소드는 바로 `GetHttpContext()`인데, 이 메소드가 웹서버에서 가져오는 여러가지 정보들을 목킹해주는 역할을 한다.

```csharp
public static HttpContextBase GetHttpContext(string appPath = null,
                                             string requestPath = null,
                                             string httpMethod = null,
                                             string protocol = null,
                                             int? port = null)
{
  var request = Substitute.For<HttpRequestBase>();
  if (!String.IsNullOrWhiteSpace(appPath))
  {
    request.ApplicationPath.Returns(appPath);
    request.RawUrl.Returns(appPath);
  }

  if (!String.IsNullOrWhiteSpace(requestPath))
  {
    request.AppRelativeCurrentExecutionFilePath.Returns(requestPath);
  }

  var url = String.Format("{0}://localhost{1}",
                          protocol,
                          (port.GetValueOrDefault() > 0
                               ? String.Format(":{0}", port)
                               : null));
  var uri = new Uri(url);
  request.Url.Returns(uri);
  request.PathInfo.Returns(String.Empty);

  if (!String.IsNullOrWhiteSpace(httpMethod))
  {
    request.HttpMethod.Returns(httpMethod);
  }

  var context = Substitute.For<HttpContextBase>();
  context.Request.Returns(request);

  context.Session.Returns((HttpSessionStateBase)null);

  var response = Substitute.For<HttpResponseBase>();
  response.ApplyAppPathModifier(Arg.Any<string>())
          .Returns(p => String.Format("{0}{1}", APP_PATH_MODIFIER, p.Arg<string>()));

  context.Response.Returns(response);

  var items = new Hashtable();
  context.Items.Returns(items);

  return context;
}

```

위 코드에서 확인할 수 있다시피, 기본적인 URL은 `localhost`로 가정하고 거기에 몇가지 서버에서 가져올 수 있는 값들을 fake 로 넣어주고 있다. 이렇게 가져온 `HttpContext` 객체는 아래 메소드에서처럼 `Route` 관련 fake 객체들과 함께 MVC 프레임워크에 특화된 `HtmlHelper` 객체로 포장된다.

```csharp
public static HtmlHelper<object> GetHtmlHelper(string appPath = null,
                                               string requestPath = null,
                                               string httpMethod = null,
                                               string protocol = null,
                                               int? port = null)
{
  if (String.IsNullOrWhiteSpace(appPath))
  {
    appPath = "/";
  }

  if (String.IsNullOrWhiteSpace(protocol))
  {
    protocol = Uri.UriSchemeHttp;
  }

  if (port.GetValueOrDefault() <= 0)
  {
    port = 80;
  }

  var httpContext = GetHttpContext(appPath, requestPath, httpMethod, protocol, port);

  var routeCollection = new RouteCollection();
  var route = new Route("{controller}/{action}/{id}", null)
              {
                Defaults = new RouteValueDictionary(new { id = UrlParameter.Optional }),
              };
  routeCollection.Add(route);

  var routeData = new RouteData();
  routeData.Values.Add("controller", "home");
  routeData.Values.Add("action", "index");

  var viewDataDictionary = new ViewDataDictionary();
  var viewContext = new ViewContext()
                    {
                      HttpContext = httpContext,
                      RouteData = routeData,
                      ViewData = viewDataDictionary,
                    };

  var viewDataContainer = Substitute.For<IViewDataContainer>();
  viewDataContainer.ViewData.Returns(viewDataDictionary);

  var htmlHelper = new HtmlHelper<object>(viewContext, viewDataContainer, routeCollection);
  return htmlHelper;
}

```

## 테스트 코드 작성하기

실제 테스트 코드는 아래와 같을 것이다. 여기서는 [`NUnit`](http://nunit.org) 테스트 라이브러리를 사용한다. 테스트 코드는 아래와 같다.

```csharp
[TestFixture]
public class HtmlHelperImageActionLinkExtensionsTest
{
  private System.Web.Mvc.HtmlHelper _htmlHelper;

  [SetUp]
  public void Init()
  {
    this._htmlHelper = MvcHelper.GetHtmlHelper();
  }

  [TearDown]
  public void Cleanup()
  {
    this._htmlHelper = null;
  }

  [Test]
  [TestCase("http://google.com", "TestAction", null, null)]
  [TestCase("http://google.com", "TestAction", "title=TestTitle", null)]
  [TestCase("http://google.com", "TestAction", "title=TestTitle", "class=class1 class2")]
  public void GivenSrcHrefAndAttributes_Should_ReturnHtmlTagString(string src, string actionName, string htmlAttributes, string imageAttributes)
  {
    var hAttributes = new Dictionary<string, object>();
    if (!String.IsNullOrWhiteSpace(htmlAttributes))
    {
      hAttributes.Add(htmlAttributes.Split('=')[0], htmlAttributes.Split('=')[1]);
    }

    var iAttributes = new Dictionary<string, object>();
    if (!String.IsNullOrWhiteSpace(imageAttributes))
    {
      iAttributes.Add(imageAttributes.Split('=')[0], imageAttributes.Split('=')[1]);
    }
    var link = this._htmlHelper.ImageActionLink(src, actionName, hAttributes, iAttributes);

    link.ToHtmlString().Should().Contain("><img");
    link.ToHtmlString().Should().MatchRegex("href=".+/" + actionName + """);
    link.ToHtmlString().Should().Contain("src="" + src + """);

    foreach (var attribute in hAttributes)
    {
      link.ToHtmlString().Should().Contain(attribute.Key + "="" + attribute.Value + """);
    }

    foreach (var attribute in iAttributes)
    {
      link.ToHtmlString().Should().Contain(attribute.Key + "="" + attribute.Value + """);
    }
  }
}

```

`Init()` 메소드의 안에는 달랑 `MvcHelper.GetHtmlHelper()` 메소드를 이용하여 fake `HtmlHelper` 인스턴스를 가져오는 것 하나만 있다. 이렇게 하면 사실 끝이고, 나머지는 하던 대로 하면 유닛 테스트 코드를 완성할 수 있다.

위의 테스트 코드는 아래 링크를 통해 확인해 볼 수 있다.

- [https://github.com/aliencube/HtmlHelper.Extended/.../HtmlHelperImageActionLinkExtensionsTest.cs](https://github.com/aliencube/HtmlHelper.Extended/blob/master/SourceCodes/99_Tests/HtmlHelperExtended.Tests/HtmlHelperImageActionLinkExtensionsTest.cs)

참 쉽죠?
