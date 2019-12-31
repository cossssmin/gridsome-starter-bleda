---
title: "SpecFlow와 FluentAssertions를 이용하여 BDD 적용하기 #2"
date: "2014-04-02"
slug: applying-bdd-with-specflow-and-fluentassertions-2
description: ""
author: Justin-Yoo
tags:
- dotnet
- bdd
- csharp
- fluent-assertions
- spec-flow
fullscreen: false
cover: ""
---

> 알림: 이 포스트는 BDD 연작 시리즈 중 세번째입니다.
> 
> - [BDD와 TDD의 차이](http://blog.aliencube.org/ko/2014/04/02/differences-between-bdd-and-tdd)
> - [SpecFlow와 FluentAssertions를 이용하여 BDD적용하기 #1](http://blog.aliencube.org/ko/2014/04/02/applying-bdd-with-specflow-and-fluentassertions-1)
> - SpecFlow와 FluentAssertions를 이용하여 BDD적용하기 #2

[앞서의 글](http://blog.aliencube.org/ko/2014/04/02/applying-bdd-with-specflow-and-fluentassertions-1)에서 SpecFlow를 이용하여 BDD를 적용시켜 실패한 테스트 케이스를 작성하였다. 여기서는 FluentAssertions를 이용하여 이 테스트 케이스를 모두 통과시키도록 하자.

> `Login` 액션은 `HomeController`에 이미 구현되어 있다고 가정한다.

## 유닛 테스트 수정하기 - Step Definition #2

우선 아래와 같이 private field를 세 개 생성한다.

```csharp
private HomeController _home;
private ActionResult _login;
private NameValueCollection _form;
```

그 다음 아래와 같이 각각의 테스트 메소드를 정리한다.

```csharp
[Given(@"the email and password")]
public void GivenTheEmailAndPassword(Table table)
{
    this._home = new HomeController();
}

[Given(@"I have entered ""(.*)"" into the email field")]
public void GivenIHaveEnteredIntoTheEmailField(string email)
{
    if (this._form == null)
        this._form = new FormCollection();
    this._form.Add("email", email);
}

[Given(@"I have entered ""(.*)"" into the password field")]
public void GivenIHaveEnteredIntoThePasswordField(string password)
{
    if (this._form == null)
        this._form = new FormCollection();
    this._form.Add("password", password);
}

[When(@"I press Login")]
public void WhenIPressLogin()
{
    this._login = this._home.Login(this._form as FormCollection);
}

[Then(@"I should be redirected to the dashboard page")]
public void ThenIShouldBeRedirectedToTheDashboardPage()
{
    this._login.Should().NotBeNull();
    this._login.Should().BeOfType();
    this._login.As().Url.Should().BeEquivalentTo("/dashboard");
}

[Then(@"I should be redirected to the login page displaying an error message of ""(.*)""")]
public void ThenIShouldBeRedirectedToTheLoginPageDisplayingAnErrorMessageOf(string errorMessage)
{
    this._login.Should().NotBeNull();
    this._login.Should().BeOfType();
    AssertionExtensions.ShouldBeEquivalentTo((object) this._login.As().ViewBag.ErrorMessage, errorMessage);
} 
```

- `Given` 메소드들에서는 각각의 private field들에 대한 인스턴스를 생성하여 필요한 값을 적용시킨다.
- `When` 메소드에서는 `HomeController`의 `Login` 액션을 실행시킨다.
- `Then` 메소드들에서는 `Login` 액션이 성공했을 경우와 실패했을 경우에 어떤 결과를 예상할 수 있는지를 FluentAssertions 라이브러리를 이용하여 정리한다.

이렇게 테스트 메소드들을 정리한 후 빌드하여 다시 실행시키면 모든 테스트들이 통과한 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.09.png)

## 맺으며

이상으로 SpecFlow와 FluentAssertions 라이브러리를 이용한 BDD 적용 사례를 연구해 보았다. 물론, 이것은 아주 간단한 예제여서 모든 경우의 수를 다루지는 않았다. 여기에서도 실제 데이터베이스 연결이라든가 하는 여러가지 상황들을 고려하여 더더욱 리팩토링을 해야 한다. 그런 일들은 이 글을 읽는 여러분들이 실제로 실무에 적용을 시켜가면서 충분히 구현할 수 있을 것으로 확신한다.
