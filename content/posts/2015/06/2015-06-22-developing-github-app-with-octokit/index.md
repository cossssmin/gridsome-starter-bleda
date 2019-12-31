---
title: "Octokit을 이용하여 GitHub 앱 만들기"
date: "2015-06-22"
slug: developing-github-app-with-octokit
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- github
- oauth
- octokit
fullscreen: false
cover: ""
---

웹 앱 혹은 네이티브 앱을 개발하다보면 보통 트위터, 페이스북 혹은 다른 웹 서비스와 연동을 고려하게 된다. 그럴 때 보통 해당 웹 서비스와 연동을 위해 OAuth 인증을 하게 되는데, 개념은 간단하지만 해당 서비스의 API 제공 수준에 따라 구현하기가 생각보다 쉬운 곳도 있고, 까다로운 곳도 있다. 이 포스트에서는 개발자에게 친숙한 [GitHub](https://github.com)의 OAuth 인증을 통해 앱을 개발하는 방법에 대해 알아보도록 할 것이다. 이와 관련된 소스코드 샘플은 아래에서 확인할 수 있다.

- [https://github.com/devkimchi/GitHubApp-Sample](https://github.com/devkimchi/GitHubApp-Sample)

참고로, 이 글은 Phil Haack의 포스트, [Using Octokit.net to authenticate your app with GitHub](http://haacked.com/archive/2014/04/24/octokit-oauth/)를 바탕으로 했다.

## Octokit - GitHub API Wrapper

깃헙은 아무래도 개발자들의 소스코드를 관리해주는 서비스이다보니 개발자 후렌들리한 API를 잘 만들어 놓았다. 모든 API 관련 레퍼런스는 이곳에서 확인할 수 있다.

- [GitHub API](https://developer.github.com/v3/)

하지만, 어떤 의미에서 이 API 문서는 API 요청 형식이 어떻게 되고, 그에 따른 응답 형식이 어떻게 되는지에 대해 정의한 문서들에 불과한 것이다. 따라서, 이를 구현하려면 앱 안에서 해당 요청/응답 처리를 직접 처리해야 하고, 그에 따른 결과들은 [Fiddler](http://www.telerik.com/fiddler) 혹은 [WireShark](https://www.wireshark.org/) 같은 도구들을 이용하여 실제 요청 및 응답 내용을 확인해야 한다. 다행스럽게도 깃헙은 [Octokit](http://octokit.github.io)이라 불리는 API 래퍼를 직접 개발하고 관리한다. 이 래퍼는 현재 [Ruby](https://github.com/octokit/octokit.rb), [Objective-C](https://github.com/octokit/octokit.objc), 그리고 [.NET](https://github.com/octokit/octokit.net)의 세 가지 버전으로 만들어져 있다. 여기서는 바로 이 [Octokit.NET](https://github.com/octokit/octokit.net)을 사용하기로 한다. 기본적인 사용법은 다른 래퍼들도 크게 다르지 않을 것이다. 확인한 바 없다

## GitHub 앱 등록하기

우선, GitHub 사이트에 앱을 등록해야 한다. 자신의 계정으로 로그인 한 후 [https://github.com/settings/applications/new](https://github.com/settings/applications/new) 링크를 클릭하게 되면 아래와 같이 앱을 등록할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/06/github-webapp-01.png)

이렇게 필요한 정보를 입력하고 등록하게 되면 아래와 같이 `ClientID` 와 `Client Secret` 키를 부여 받는다. 이 정보는 다른 사람들이 가로챌 수 없도록 잘 안전한 곳에 잘 보관해 놓도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/06/github-webapp-02.png)

물론 이 예제에서는 이미 노출이 되어 있겠지만, 이미 유효하지 않은 키 값들인지라 크게 상관은 없다.

## GitHub 앱 인증 받기

이제, 본격적으로 앱을 개발할 차례이다. 우리는 이 앱을 통해 인증받은 사용자의 `username`과 해당 사용자가 속해있는 `organization`의 리스트를 받아올 것이다. 아래는 ASP.NET MVC 웹 앱의 `HomeController`의 일부분이다.

```csharp
public partial class HomeController : Controller
{
  private const string CLIENT_ID = "2b09ada4c97ab1b398c4"; #1
  private const string CLIENT_SECRET = "9e155a3038c3fba80f48e1411df555f509dd9be1"; #2

  private const string REDIRECT_URL = "http://localhost:14083/Home/Authorise"; #3

  private static readonly GitHubClient github = new GitHubClient(new ProductHeaderValue("GitHubAppSample")); #4

  ...
}

```

- `#1`: GitHub에서 등록한 앱의 `ClientID` 키 값을 설정한다.
- `#2`: GitHub에서 등록한 앱의 `Client Secret` 키 값을 설정한다.
- `#3`: GitHub 사이트에서 인증받고 난 후 돌아올 앱의 URL을 설정한다.
- `#4`: Octokit.NET 래퍼를 통해 GitHub 프록시 객체를 생성한다.

물론 실제 앱 개발에 있어서 위의 `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URL`은 별도의 안전한 장소에 저장시켜 놓아야 한다는 것을 잊지 말자.

## `Index` 액션 구현

이제 `Index()` 액션을 만들어보자. `Index()`에서는 이미 인증 정보가 사용자의 쿠키에 저장되어 있을 경우, 이 인증 정보를 이용하여 곧바로 사용자 정보와 조직 정보를 받아오고, 인증 정보가 없을 경우 GitHub의 인증 페이지로 넘겨서 인증을 받게끔 한다.

```csharp
public virtual async Task<ActionResult> Index()
{
  var gitHubCookie = Request.Cookies["gitHubOauth"]; #1
  if (gitHubCookie == null)
  {
    var gitHubLoginUrl = this.GetGitHubLoginUrl(); #2
    return this.Redirect(gitHubLoginUrl.ToString());
  }

  var token = gitHubCookie.Value;
  github.Credentials = new Credentials(token); #3

  var user = await github.User.Current(); #4
  IList<string> organisations;
  try
  {
    var orgs = await github.Organization
                           .GetAllForCurrent(); #5
    organisations = orgs.Select(p => p.Login)
                        .ToList();
  }
  catch
  {
      organisations = new List<string>();
  }

  var vm = new HomeIndexViewModel()
               {
                 Username = user.Login,
                 Organisations = organisations
               };
  return View(vm);
}

```

- `#1`: 쿠키에서 GitHub의 OAuth 토큰 정보를 갖고 온다. 이 부분은 세션을 이용해서 진행할 수도 있으나, 보안상 세션은 추천하지 않는다.
- `#2`: 쿠키에서 토큰 정보를 확인할 수 없다면, GitHub의 인증 페이지로 리디렉션 시킨다.
- `#3`: 쿠키에서 가져온 토큰 정보를 통해 인증을 진행한다.
- `#4`: 현재 접속한 사용자의 사용자 정보를 가져온다.
- `#5`: 현재 접속한 사용자가 속한 조직의 정보를 모두 가져온다.

이렇게 간단하게 인증후 사용자 정보 및 사용자 소속 조직 정보를 가져오는 앱을 만들었다. 하지만, 아직 몇가지 작업이 더 필요하다.

## GitHub 사용자 인증 페이지 리디렉션

위의 코드 `#2`에서 확인할 수 있다시피 인증 토큰을 확인할 수 없을 경우 GitHub의 사용자 인증 페이지로 리디렉션 시켜서 인증 정보를 받아와야 한다. 여기서는 `GetGitHubLoginUrl()` 메소드를 이용했는데, 이 메소드는 아래와 같이 구현할 수 있다.

```csharp
private Uri GetGitHubLoginUrl()
{
  string state;
  using (var rng = new RNGCryptoServiceProvider())
  {
      var data = new byte[32];
      rng.GetBytes(data);
      state = Convert.ToBase64String(data); #1
  }

  var stateCookie = new HttpCookie("gitHubState") { Value = state };
  Response.SetCookie(stateCookie); #2

  var request = new OauthLoginRequest(CLIENT_ID)
                    {
                      State = state,
                      Scopes = { "user", "read:org" } #3
                    };
  var loginUrl = github.Oauth.GetGitHubLoginUrl(request); #4
  return loginUrl;
}

```

- `#1`: CSRF 공격을 예방하기 위해 임의로 만들어주는 문자열이다. 이를 인증시 GitHub으로 같이 넘겨주게 된다.
- `#2`: `#1`에서 생성한 임의의 문자열을 쿠키에 저장한다. 인증 직후 이 정보를 활용해 유효한 요청값인지 확인한다.
- `#3`: 이 앱을 사용하는데 필요한 권한을 설정한다. 이 역시도 위와 같이 하드 코딩하기 보다는 별도의 설정 파일에 넣고 따로 호출하는 것을 권장한다. 위의 내용은 사용자 정보와 사용자 소속 조직 정보에 접근한다는 내용이다.
- `#4`: GitHub 인증 페이지의 URL과 그에 필요한 별도의 인증 정보를 쿼리스트링 형식으로 생성한다.

이제 이렇게 만들어진 URL을 통해 인증 페이지로 이동한다. 인증 페이지는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/06/github-webapp-03.png)

여기서 이 앱이 실제로 접근하는 GitHub의 리소스를 확인하면 패스워드를 입력하는 절차를 거쳐 인증 절차를 완료하게 된다. 인증 완료후 사용자는 다시 앱의 `/Home/Ahthorise` 액션으로 리디렉션 되므로, 이제 `Authorise()` 액션을 구현해 보도록 하자.

## `Authorise` 액션 구현

`Authorise()` 메소드는 `code`와 `state` 두 개의 파라미터를 받는다. 여기서 `code` 값은 실제 인증 코드를 의미하고, `state` 값은 앞서 생성했던 임의의 문자열과 동일하다. 즉, 인증 과정에서 동일한 앱이 인증을 시도했는지, 동일한 앱이 인증 이후 절차를 마무리하는지에 대해 확인하는 것이다. `Authorise()` 메소드의 구현은 아래와 같다.

```csharp
public virtual async Task<ActionResult> Authorise(string code, string state)
{
  if (String.IsNullOrWhiteSpace(code))
  {
      var gitHubLoginUrl = this.GetGitHubLoginUrl();
      return this.Redirect(gitHubLoginUrl.ToString());
  } #1

  var stateCookie = Request.Cookies["gitHubState"];
  if (stateCookie == null)
  {
      var gitHubLoginUrl = this.GetGitHubLoginUrl();
      return this.Redirect(gitHubLoginUrl.ToString());
  } #2

  var expectedState = stateCookie.Value;
  if (state != expectedState)
  {
      throw new InvalidOperationException("Validation fail!!");
  } #3

  stateCookie.Expires = DateTime.Now.AddSeconds(-1); #4
  Response.SetCookie(stateCookie);

  var request = new OauthTokenRequest(CLIENT_ID, CLIENT_SECRET, code)
                    {
                      RedirectUri = new Uri(REDIRECT_URL)
                    };
  var token = await github.Oauth.CreateAccessToken(request); #5

  var gitHubCookie = new HttpCookie("gitHubOauth")
                         {
                           Value = token.AccessToken
                         }; #6
  Response.SetCookie(gitHubCookie);

  return RedirectToAction(MVC.Home.ActionNames.Index); #7
}

```

- `#1`: `code` 값이 없을 경우 앱을 인증 받지 못했으므로 다시 GitHub의 인증 페이지로 이동한다.
- `#2`: 최초 인증 페이지 이동시 생성해 두었던 임의의 문자열에 대한 쿠키 값이 존재하지 않으므로 다시 GitHub의 인증 페이지로 이동한다.
- `#3`: 최초 생성한 임의의 문자열 값과, 인증 이후 다시 받아온 문자열 값이 일치하지 않으므로 인증 자체가 유효하지 않다는 예외를 발생시킨다.
- `#4`: 유효한 인증 정보임을 확인하면 더이상 임의의 문자열은 필요하지 않으므로 쿠키에서 삭제한다.
- `#5`: `code` 값을 이용하여 액세스 토큰을 생성한다.
- `#6`: 생성한 액세스 토큰을 쿠키에 저장시킨다. 이로써 인증 절차는 모두 완료되었다.
- `#7`: 인증 이후 다시 최초 페이지로 이동한다. 이후 인증받은 액세스 토큰을 이용하여 원하는 결과를 확인할 수 있다.

이렇게 클라이언트에서 인증이 끝나면 최초 페이지로 이동하여 원하는 결과를 아래와 같이 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/06/github-webapp-04.png)

이상과 같이 GitHub API가 제공하는 OAuth 기능을 이용하여 웹 앱을 개발하는 것에 대해 간단하게 알아 보았다. 실무에서는 좀 더 복잡한 비즈니스 로직이 필요할 수도 있겠지만, 기본적으로 여기서 크게 벗어나지는 않으리라 본다. 또한 이를 응용한다면 트위터나 페이스북 같은 다른 서비스들이 제공하는 OAuth API를 이용해서도 비슷한 앱을 개발할 수 있을 것이다.
