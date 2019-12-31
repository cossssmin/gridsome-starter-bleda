---
title: "BDD와 TDD의 차이"
date: "2014-04-02"
slug: differences-between-bdd-and-tdd
description: ""
author: Justin Yoo
tags:
- .NET
- BDD
- TDD
fullscreen: false
cover: ""
---

> 알림: 이 포스트는 BDD 연작 시리즈 중 첫번째입니다.
> 
> - BDD와 TDD의 차이
> - [SpecFlow와 FluentAssertions를 이용하여 BDD적용하기 #1](http://blog.aliencube.org/ko/2014/04/02/applying-bdd-with-specflow-and-fluentassertions-1)
> - [SpecFlow와 FluentAssertions를 이용하여 BDD적용하기 #2](http://blog.aliencube.org/ko/2014/04/02/applying-bdd-with-specflow-and-fluentassertions-2)

[BDD(Behaviour-Driven Development)](http://en.wikipedia.org/wiki/Behavior-driven_development)와 [TDD(Test-Driven Development)](http://en.wikipedia.org/wiki/Test-driven_development)는 애자일 소프트웨어 개발 방법론에서 가장 널리 쓰이는 것들이다. 사실 xDD(X-Driven Development)라고 해서 수많은 X가 있긴 하지만 이들 중 거의 대부분은 TDD를 기반으로 한다. 그렇다면 BDD와 TDD는 어떤 차이가 있을까?

StackExchange의 [이 질문과 대답](http://programmers.stackexchange.com/questions/135218/what-is-the-difference-between-bdd-and-tdd#135246)에 따르면, BDD와 TDD는 거의 차이가 없다. 차이가 있다면 TDD는 테스트 자체에 집중하여 개발하는 반면, BDD는 비즈니스 요구사항에 집중하여 테스트 케이스를 개발한다는 것이다. [Dan North](https://twitter.com/tastapod)의 글 [Introducing BDD](http://dannorth.net/introducing-bdd/)는 BDD에 대한 충분한 설명을 볼 수 있다. 이 글은 [이홍주](http://blog.jaigurudevaom.net/)님이 [한국어](http://blog.jaigurudevaom.net/319)로도 번역해 놓았다.

좀 더 간략하게 BDD에 대해 설명을 하자면, BDD는 테스트 케이스를 작성함에 있어서 좀 더 자연어에 가깝게 작성한다는 것이다. 대표적인 것이 바로 [User Story](http://en.wikipedia.org/wiki/User_story) 기법이 있다. [여기](http://stackoverflow.com/questions/2509/what-are-the-primary-differences-between-tdd-and-bdd#2548)글을 참고하여 아래 User Story를 살펴보도록 하자.

```bat
Story: User logging in
  As a user
  I want to login with my details
  So that I can get access to the site

```

위와 같이 User Story를 작성한다고 하면 전형적인 `As a ...`, `I want ...`, `So that ...` 구문을 따르고 있다. 이렇게 비즈니스 요구사항이 만들어진다면 이것을 바탕으로 시나리오를 아래와 같이 만들 수 있다.

```bat
Scenario: User uses wrong password

  Given a username &#039;jdoe&#039;
  And a password &#039;letmein&#039;

  When the user logs in with username and password

  Then the login form should be shown again

```

이렇게 만들어진 시나리오를 바탕으로 유닛테스트를 작성하면 그것이 바로 BDD를 적용한 소프트웨어 개발이 될 것이다. [이어지는 포스트](http://blog.aliencube.org/ko/2014/04/02/applying-bdd-with-specflow-and-fluentassertions-1)에서는 어떻게 이 User Story가 유닛테스트로 변환이 되는지에 대해 설명한다.
