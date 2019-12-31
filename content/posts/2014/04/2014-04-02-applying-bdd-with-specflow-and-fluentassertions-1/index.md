---
title: "SpecFlow와 FluentAssertions를 이용하여 BDD 적용하기 #1"
date: "2014-04-02"
slug: applying-bdd-with-specflow-and-fluentassertions-1
description: ""
author: Justin-Yoo
tags:
- dotnet
- BDD
- C#
- FluentAssertions
- SpecFlow
fullscreen: false
cover: ""
---

> 알림: 이 포스트는 BDD 연작 시리즈 중 두번째입니다.
> 
> - [BDD와 TDD의 차이](http://blog.aliencube.org/ko/2014/04/02/differences-between-bdd-and-tdd)
> - SpecFlow와 FluentAssertions를 이용하여 BDD적용하기 #1
> - [SpecFlow와 FluentAssertions를 이용하여 BDD적용하기 #2](http://blog.aliencube.org/ko/2014/04/02/applying-bdd-with-specflow-and-fluentassertions-2)

[앞서의 글](http://blog.aliencube.org/ko/2014/04/02/differences-between-bdd-and-tdd)에서 BDD와 TDD의 차이를 간략하게 알아보았다. 더욱 자세한 내용은 인터넷을 뒤져보면 더 많이 나오니 생략하기로 하고, 이 글에서는 그렇다면 닷넷 애플리케이션을 개발하는 데 있어서 어떻게 BDD를 적용시킬 수 있을까에 대해 논의해 보도록 한다.

기본적으로 BDD는 TDD의 연장선 상에 있기 때문에 유닛테스트 케이스 시나리오만 제대로 짜 놓는다면 그 자체로 이미 완결된 BDD와 마찬가지이다. 하지만 B가 의미하는 Behaviour, 즉 행위에 대한 서술은 좀 더 고객 중심의 언어로 쓰일 수 밖에 없기 때문에 최대한 User Story 에서 사용하는 서술 기법을 통해 유닛테스트를 작성해야 한다. 이 부분을 좀 더 쉽게 자동화 시켜주는 비주얼 스튜디오 확장 기능 및 NuGet 패키지가 여러 종류가 있는데, 이 중에서 [SpecFlow](http://www.specflow.org/)와 [FluentAssertions](http://dennisdoomen.github.io/fluentassertions/)를 사용해 보도록 하자.

## 준비물

- SpecFlow 비주얼 스튜디오 익스텐션:
    
    - [VS 2010, VS 2012](http://visualstudiogallery.msdn.microsoft.com/9915524d-7fb0-43c3-bb3c-a8a14fbd40ee)
    - [VS 2013](http://visualstudiogallery.msdn.microsoft.com/90ac3587-7466-4155-b591-2cd4cc4401bc)
- SpecFlow NuGet 패키지:
    
    - [SpecFlow](http://www.nuget.org/packages/SpecFlow/)
    - [SpecFlow.NUnit](http://www.nuget.org/packages/SpecFlow.NUnit/)
    - [SpecFlow.NUnit.Runners](http://www.nuget.org/packages/SpecFlow.NUnit.Runners)
- FluentAssertions NuGet 패키지:
    
    - [FluentAssertions](http://www.nuget.org/packages/FluentAssertions/2.2.0)

이 글에서는 비주얼 스튜디오 2012를 이용하여 진행한다. 비주얼 스튜디오 2013도 크게 다르지 않을 것으로 예상하지만 확인해 보지는 않았다.

## 고객 요구사항

고객 요구사항이 아래와 같다고 하자.

> 이메일, 패스워드를 입력하여 로그인 한 후 대쉬보드로 이동한다.

이를 User Story로 바꿔본다면 아래와 같을 것이다.

> As a user, I want to login the website by providing my email and password So that I can access to the Dashboard page.

User Story는 고객의 요구사항을 조금 더 기술적으로 표현한 것으로 보통 이 고객 요구사항은 기능 정의서로 바뀌게 된다. 여기서는 아래와 같은 두 개의 기능 정의서를 생각할 수 있다.

- 올바른 이메일, 패스워드를 입력할 경우

> When providing correct email and password, Then the user should be redirected to the Dashboard page.

- 틀린 이메일 또는 패스워드를 입력할 경우

> When providing incorrect email or password, Then the user should remain on the same page with an error message of "Invalid email or password".

위와 같이 고객 요구사항을 분석했다면 이제 본격적으로 BDD를 적용해 보도록 하자.

## 테스트 프로젝트 만들기

빈 프로젝트를 하나 만들어보자. 위에 언급한 비주얼 스튜디오 익스텐션을 설치했다면 프로젝트에 새 아이템을 추가할 때 아래와 같은 화면을 볼 수 있을 것이다. 우리는 로그인 관련 고객 요구사항을 가지고 있으므로 이름을 `Login.feature`라고 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.01.png)

`Login.feature`, `Login.feature.cs` 이렇게 두 개의 파일이 생성된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.02.png)

`Login.feature` 파일을 열어서 기본으로 들어있는 내용을 모두 삭제하고 위에 기술한 User Story와 Functional Specification을 바탕으로 아래와 같이 입력한다.

```bat
Feature: Login
    As an existing customer
    I want to login by providing email and password
    so that I can access to the dashboard

Background: 
    Given the email and password
        | Email            | Password |
        | correct@myemail.com | Pa$$w0rd |

@LoginSuccess
Scenario: LoginSuccess
    Given I have entered "correct@myemail.com" into the email field
    And I have entered "Pa$$w0rd" into the password field
    When I press Login
    Then I should be redirected to the dashboard page

@LoginFailure
Scenario: LoginFailureIncorrectEmail
    Given I have entered "wrong@myemail.com" into the email field
    And I have entered "Pa$$w0rd" into the password field
    When I press Login
    Then I should be redirected to the login page displaying an error message of "Incorrect email or password"

@LoginFailure
Scenario: LoginFailureIncorrectPassword
    Given I have entered "correct@myemail.com" into the email field
    And I have entered "password" into the password field
    When I press Login
    Then I should be redirected to the login page displaying an error message of "Incorrect email or password"

```

- `Feature`: User Story를 입력하는 부분이다.
- `Background`: 테스트 케이스 시나리오에 공통적으로 적용이 되는 부분이다.
    
    - `Given`: 여기서는 데이터베이스에 있는 특정 사용자 값을 Mocking했다.
- `Scenario`: 실제 테스트 케이스 시나리오이다.
    
    - `Given`: 사용자가 입력한 값을 의미한다.
    - `When`: 사용자의 액션을 의미한다.
    - `Then`: 사용자가 예상할 수 있는 결과를 의미한다.

여기까지 해서 고객 요구사항을 기능 정의서(Functional Specification)으로 바꾸어 적용시켰다.

## 유닛 테스트 만들기 - 실패

최초에 `Login.feature` 파일을 생성하면 자동으로 `Login.feature.cs` 파일도 함께 생성된다. SpecFlow가 자동으로 만들어주는 파일로써, 열어보면 NUnit 형식의 유닛테스트가 자동으로 만들어져 있다. 우선 위와 같이 `Login.feature` 파일을 정리했다면 빌드후 실제로 유닛테스트를 돌려보도록 하자. 유닛테스트는 NUnit.Runners 또는 SpecFLow.NUnit.Runners를 통해서 실행시킬 수 있다.

- NUnit.Runners를 이용하여 테스트를 수행할 경우

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.03.png)

- SpecFlow.NUnit.Runners를 이용하여 테스트를 수행할 경우

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.04.png)

어느쪽이든 실행을 시키게 되면 아래와 같은 결과를 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.05.png)

에러메시지가 의미하는 `Inconclusive`의 의미는 `No matching step definition found for one or more steps.`이다. 즉, Step Definition을 찾을 수 없어서 해당 테스트를 수행할 수 없다는 뜻이다. TDD를 적용할 때 최초에는 실패하는 테스트 케이스를 만드는 것인데, BDD 역시 마찬가지로 실패한 테스트 케이스를 만들게 된다. 이제 에러메시지에서 언급한 바와 같이 Step Definition을 작성하여 테스트 케이스를 성공시키도록 하자.

## 유닛 테스트 수정하기 - Step Definition #1

`Login.feature` 파일의 아무곳에서나 마우스 오른쪽 버튼을 클릭해서 나오는 `Generate Step Definitions`라는 콘텍스트 메뉴를 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.06.png)

이어 나오는 창에서는 모든 것을 디폴트로 놓고 `Generate`를 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.07.png)

적당한 곳에 파일을 저장하면 아래와 같이 보일 것이다. 여기서는 `StepDefinitions` 디렉토리 아래에 `LoginSteps.cs`라는 이름으로 저장하였다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/SpecFlow.08.png)

이렇게 Step Definition 파일을 생성한 후 다시 테스트를 수행해도 여전히 동일한 에러메시지와 함께 테스트는 실패할 것이다. 새로 생성한 `LoginSteps.cs`를 열어보면 모든 생성된 메소드에 아래와 같은 라인만 존재하는 것을 확인할 수 있다.

ScenarioContext.Current.Pending();

이것은 일종의 `NotImplementedException`와 같은 개념이라서, 실제로 이제부터 Step Definition들을 정의하여 테스트 케이스를 모두 통과시켜야 한다. [다음 포스트](http://blog.aliencube.org/ko/2014/04/02/applying-bdd-with-specflow-and-fluentassertions-2)에서 FluentAssertions를 이용하여 테스트를 모두 통과시키도록 하자.
