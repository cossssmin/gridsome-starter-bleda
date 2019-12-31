---
title: "서버리스 애플리케이션 테스트하기 - 애저 로직 앱"
date: "2017-07-21"
slug: testing-serverless-applications-part-2
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure Functions
- Azure Logic Apps
- Mocking
- Testability
fullscreen: false
cover: ""
---

- [서버리스 애플리케이션 테스트하기 – 애저 펑션](http://blog.aliencube.org/ko/2017/07/20/testing-serverless-applications-part-1/)
- 서버리스 애플리케이션 테스트하기 – 로직 앱

이 포스트에서는 Azure Logic Apps 애저 로직 앱을 작성할 때 어떤 방식으로 테스트를 할 수 있는지에 대해 다루어 보고자 한다.

> 이 포스트에 쓰인 예제 코드는 [이곳](https://github.com/devkimchi/Testing-Serverless-Applications)에서 다운로드 받을 수 있다.

## 미리 봐 두면 좋은 것

지난 [이모콘 2017 S/S](http://emocon.weirdx.io/2017ss/) 에서 발표했던 **마케터를 위한 Microsoft Flow** [슬라이드](https://1drv.ms/p/s!ArWHNGHxF7lB52-tz2CBaUj90xqf)와 [동영상](https://www.crowdcast.io/e/emocon-2017-ss/4)을 참조해 보면 로직 앱이 대략 어떤 형태인지 감을 잡을 수 있다. (기본적으로 로직 앱과 플로우는 동일한 서비스이다)

## 시나리오

As 데브옵스 엔지니어 I want 애저 로직 앱을 이용해 ARM 템플릿 리스트를 검색한다 So that 검색 결과에 나타난 ARM 템플릿 리스트를 다운로드 받는다

## 로직 앱 기본 속성

위의 시나리오를 로직 앱으로 구성하면 대략 아래와 같은 모습이 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/testing-serverless-applications-part-2-01.png)

1. 맨 처음 HTTP 요청이 `Request`로 들어간다.
2. `HTTP` 액션에서는 [이전 포스트](http://blog.aliencube.org/ko/2017/07/20/testing-serverless-applications-part-1/)에서 작성한 애저 펑션을 호출한다.
    
    1. 이 펑션의 응답 상태 코드가 400 이상이면 (에러) 좌측 경로를 따라서 `ErrorResponse` 응답 객체를 반환하고 종료한다.
    2. 이 펑션의 응답 상태 코드가 400 미만이면 (성공) 우측 경로를 따라서 `Condition`을 탄다.
        
        1. 응답 객체 결과가 있으면 `OkResponse`를 반환하고, 결과가 없으면 `NotFoundResponse`를 반환하고 종료한다.

즉, `HTTP` 액션에서 가정할 수 있는 예상 시나리오는 _에러_, _성공 – 결과 리스트_, _성공 – 빈 결과_, 이렇게 총 세 가지인 셈이다.

사실 위 그림은 실제로는 아래와 같은 JSON 객체 형태이다. 그리고 이 JSON 객체는 ARM 템플릿에 넣을 수 있는 형태여서 곧바로 설치 가능하다.

https://gist.github.com/justinyoo/1b20541f6e605981d801c9f0e3e9c219

그런데, 위에서 보이는 바와 같이 JSON 객체 형태라면 도대체 어느 부분을 테스트 해야 하는 것일까? 코드 한 줄 없는 상황이니 테스트를 할 수가 없다. 게다가, 로직 앱은 일단 애저 클라우드에 설치된 후에야만 사용할 수 있는 서비스라서 내 로컬 환경에서 테스트를 할 수는 없다.

그러나, 항상 테스트를 할 방법은 존재하는 법. 우리가 테스트를 해야 할 부분은 바로 API 호출 결과이다. 즉 위 그림에서 보이는 `HTTP` 액션의 세 가지 예상 시나리오를 테스트하면 된다. 이제부터 테스트를 시작해 보도록 하자.

## 실제 운영하는 로직 앱을 수동으로 테스트 하기

아래와 같이 정상적인 결과물을 내는 HTTP 요청을 포스트맨으로 날린다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/testing-serverless-applications-part-2-02.png)

이번에는 404 응답 코드가 나오게끔 쿼리를 조정해서 테스트한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/testing-serverless-applications-part-2-03.png)

마지막으로 에러 코드가 나오게끔 쿼리를 조정해서 테스트한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/testing-serverless-applications-part-2-04.png)

이렇게 테스트를 해도 되지만 실제 API를 호출해야 하는 형태이기 때문에 바람직하지 않다. 테스트와 애플리케이션을 분리시켜야 하기 때문이다. 그렇다면 어떻게 하면 좋을까?

## API 목킹

예전에 작성한 [개발자를 위한 API 목킹](http://blog.aliencube.org/ko/2017/05/16/api-mocking-for-developers/)이라는 포스트에서 API를 손쉽게 목킹하면 실제 API를 호출하지 않아도 얼마든 작업이 가능하다는 이야기를 한 적이 있다. 언급한 포스트의 내용처럼 애저 API Management를 사용하는 것이 하나의 방법이고, 다른 하나는 애저 펑션을 이용해서 목킹을 하는 방법이다. 앞서 도출한 API 응답의 세 가지 시나리오를 바탕으로 목킹을 위한 애저 펑션을 만들면 아래와 같다.

https://gist.github.com/justinyoo/c1aecd1bed6d24459c8909342febce8a

https://gist.github.com/justinyoo/fc2ae1a96dd0f300b12ea2c53ed0aa0e

https://gist.github.com/justinyoo/ee88f64301ef7c7eb4b4921a78d9c07c

그냥 아무 로직도 없는 더미 펑션들을 위와 같이 만들어서 이용하면 된다.

## 테스트용 로직 앱 수동 테스트

이제 실제 작동하는 로직 앱을 경우의 수 만큼 (여기서는 세 가지) 복사해서 API 호출 URL을 위에서 만든 목킹 펑션으로 바꿔주면 된다. 그렇게 해서 만들어진 테스트용 로직 앱은 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/testing-serverless-applications-part-2-05.png)

세 가지 예상 시나리오에 맞춰 테스트용 로직 앱을 세 개 만들었다. 이제 이렇게 만든 테스트용 로직 앱을 포스트맨을 통해 테스트 하기만 하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/testing-serverless-applications-part-2-06.png)

이렇게 하면 로직 앱은 실제 API 엔드포인트를 호출하는 대신 목킹 API를 호출하면서 그 결과 값에 따라 예상하는 결과를 테스트할 수 있다. 하지만 여전히 수동으로 테스트를 한다. 이를 좀 더 자동화 할 수 없을까?

## 테스트용 로직 앱 자동 테스트

아래 그림에서 보는 바와 같이 자동 테스트는 기본적으로 CI 과정에서 빌드 혹은 테스트 파이프라인에서 적용할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/07/testing-serverless-applications-part-2-07.png)

[Jenkins](https://jenkins.io/), [VSTS](https://visualstudio.com/) 또는 다른 빌드 서버를 이용해서 빌드/테스트 파이프라인 중간에 파워셸을 호출한다. 파워셸이 아니더라도 테스트용 로직 앱을 호출 할 수 있는 스크립트면 상관 없다. 파워셸 스크립트가 각각의 테스트용 로직 앱을 호출해서 원하는 결과가 나왔다면 테스트를 통과한 것일테고, 원하는 결과가 나오지 않았다면 테스트를 실패한 것으로 간주할 수 있다.

참고로 위의 시나리오에 쓰인 테스트용 파워셸 스크립트는 아래와 같다.

https://gist.github.com/justinyoo/f998590e6ba3f3c6f633180c200c9b59

* * *

지금까지 애저 로직 앱을 테스트하는 방법에 대해 간략하게 다뤄보았다. 테스트용 코드가 없는 로직 앱의 특성상 API를 목킹하는 방법을 이용해 실제 애플리케이션과 API 호출간 의존성을 분리시켜 테스트를 할 수 있게 만들었다. 로직 앱으로 서버리스 애플리케이션 작성시 도움이 되길 바란다.
