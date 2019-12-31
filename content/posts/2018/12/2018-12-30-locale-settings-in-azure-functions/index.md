---
title: "애저 펑션에서 로케일 변경하기"
date: "2018-12-30"
slug: locale-settings-in-azure-functions
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- locale
- l10n
- localisation
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/12/locale-settings-in-azure-functions-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

애저 펑션과 같은 PaaS(Platform as a Service)를 이용하다 보면 기본 환경 설정 사항들 중에서 사용자가 임의로 바꿀 수 없는 것들이 있다. 그 중 하나가 로케일이다. 아래 날짜 형식 문자열을 한 번 보고 해석을 해 보도록 하자.

```json
11/12/13

```

이 문자열을 보고 어떻게 해석을 하면 될까?

- 한국어 (`ko-KR`): 2011년 12월 13일
- 영어 (`en-US`): 2013년 11월 12일
- 영어 (`en-AU`): 2013년 12월 11일

만약 신규 시스템을 개발한다면야 일반적으로 [ISO 8601 포맷](https://en.wikipedia.org/wiki/ISO_8601)을 이용해서 일반적으로 `yyyy-MM-ddTHH:mm:ss.fffzzz` 와 같은 형태로 표시를 하겠다만, 레거시 시스템은 그렇지 않은 경우가 많다. 그러다보니 시스템 통합 시나리오에서 레거시 시스템에서 보낸 데이터를 애저 펑션에서 받아 처리할 때 문제가 발생할 여지가 충분히 있다. 아래 코드를 한 번 보자.

```json
{
  "date": "11/12/13"
}

```

위와 같은 payload를 애저 펑션으로 보낸다고 가정할 때 아래 코드에서는 어떻게 처리를 할까?

https://gist.github.com/justinyoo/f98f86536560c9b99cedbdcf48cadb4c?file=locale-default.cs

만약 개발 머신의 기본 로케일이 `ko-KR` 이라면 아래와 같은 결과를 낼 것이다.

```json
Input: 2011-12-13T00:00:00.0000000+09:00

```

만약 개발 머신의 기본 로케일이 `en-AU` 이라면 아래와 같은 결과가 나올 것이다.

```json
Input: 2013-12-11T00:00:00.0000000+11:00

```

그렇다면, 애저 펑션 인스턴스에 위 코드를 배포한 후 실행시키면 어떤 결과가 나올까?

```json
Input: 2013-11-12T00:00:00.0000000+00:00

```

그렇다. 어찌 보면 당연(?)하게도 미국 로케일(`en-US`)를 따른 결과를 보여준다. 하지만 우리가 다루는 데이터는 모두 한국 로케일 (`ko-KR`)을 따르고 있다면 어떻게 해야 할까? 애저 펑션 인스턴스 자체로 로케일을 바꿀 수 있는 방법은 없다. 즉, 다른 말로 코드 상에서 이 문제를 해결해야 한다는 말이 된다. 이 때 바로 [`Thread.CurrentThread.CurrentCulture`](https://docs.microsoft.com/en-us/dotnet/api/system.threading.thread.currentculture?view=netcore-2.2) 값을 변경해 주면 된다. 아래 코드를 보도록 하자.

https://gist.github.com/justinyoo/f98f86536560c9b99cedbdcf48cadb4c?file=locale-ko-kr.cs&highlights=7

맨 위에 현재 로케일을 애저 펑션 인스턴스의 기본 설정(`en-US`)에서 한국어(`ko-KR`)로 바꿔주면 된다. 이 펑션 코드를 실행시킨 결과는 아래와 같다.

```json
Input: 2011-12-13T00:00:00.0000000+09:00

```

참 쉽죠?
