---
title: "로직 앱을 이용해서 Tick 또는 유닉스 타임스탬프 값을 식별 가능한 시간 값으로 변경하기"
date: "2018-11-04"
slug: converting-tick-or-epoch-to-timestamp-in-logic-app
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-logic-apps
- epoch
- ticks
- timestamp
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/11/converting-tick-or-epoch-to-timestamp-in-logic-app-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

로직 앱을 사용하면서 수시로 벌어지는 일들 중 하나는 바로 날짜 및 시간 값의 포맷 변경에 대한 것이다. 로직앱 안에서는 이 날짜/시간 값을 다루는 데 있어 두 가지 방법이 공존하는데 하나는 바로 [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html) 스타일을 이용한 문자열 값이고, 다른 하나는 64비트 정수 스타일을 이용한 `tick` 값이다. 여기에 더해 [유닉스 타임스탬프로 더 잘 알려진 `epoch`](https://en.wikipedia.org/wiki/Epoch_(reference_date)) 값이 API를 호출하는 와중에 쓰일 수 있다. 이러한 tick 값 혹은 epoch 값들은 사람이 한 눈에 알아보기에는 힘든 숫자로 구성되어 있으므로 보통 ISO8601 포맷으로 바꿔주면 알아보기도 쉽고 편하다. 하지만 로직 앱에서는 이러한 변환 방법이 그다지 직관적이지 않기 때문에, 이 포스트에서는 어떻게 이러한 날짜/시간 값을 ISO8601 포맷에서 epoch 혹은 tick 값으로, 또는 반대 방향으로 바꾸는 방법에 대해 알아보고자 한다.

## Epoch 유닉스 타임스탬프

[위키피디아](https://en.wikipedia.org/wiki/Epoch_(reference_date)#Notable_epoch_dates_in_computing)에서는 epoch가 문맥에 따라 굉장히 다른 형태를 갖는 걸로 나오는데, 보통은 유닉스 타임스탬프를 의미한다. 여기서도 마찬가지로 유닉스 타임스탬프 값을 의미하는 것으로 이해하고 글을 작성하기로 한다. 어쨌든, 이 epoch 값은 유닉스 시간에서는 32비트 정수 값을 사용하는데, `1970-01-01T00:00:00Z` 시각을 기준시각, 즉 0으로 계산하고 매 초마다 1씩 늘려나가는 것으로 정의한다. 예를 들어 `2018-09-10T12:34:56+11:00`은 epoch 값으로 변환하면 `1536543296`이 된다. 이러한 값들을 [온라인](https://www.epochconverter.com/)에서도 손쉽게 변환 가능하니 궁금하면 꼭 찾아가 보도록 하자. 하지만 유닉스 타임스탬프는 기준시각 이전의 날짜/시간 값을 표현할 수 없을 뿐더러, 32비트 정수값을 사용하기 때문에 [2038년 1월 19일 이후](https://www.epochconverter.com/)의 날짜/시간 값 역시 표현할 수 없다.

## Ticks

반면에 ticks 값은 64비트 정수값을 사용하고 0, 즉 시작일시는 `0001-01-01T00:00:00Z`을 가리킨다. 게다가 1초는 1천만 tick 을 의미하므로 날짜/시간 값을 굉장히 정밀하게 표현할 수 있다. 앞서와 같은 날짜/시간 값인 `2018-09-10T12:34:56+11:00`을 tick 값으로 환산하게 되면 `636721400960000000`이 된다.

## 타임스탬프를 tick 값으로 변경하기

이 변환은 로직앱에서 자체 제공하는 함수인 [`ticks()`](https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference#ticks)를 쓰면 쉽게 해결할 수 있다. 따라서 아래와 같이 함수를 구성해 보도록 하자:

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=get-timestamp-in-ticks.yaml

이 액션의 실행 결과 값은 `636721400960000000`이 될 것이다.

> **NOTE**: 이 포스트를 통틀어 로직앱 워크플로우를 작성할 때 의도적으로 YAML를 사용할 것이다. 이는 로직앱 자체가 ARM 템플릿의 한 부분으로 작동하기 때문이기도 한데, ARM 템플릿 작성을 하는데 있어서 YAML을 어떻게 활용하는지에 대해서는 [YAML을 이용해서 ARM 템플릿 작성하기(영문)](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/) 라는 포스트를 참조하도록 한다.

## 타임스탬프를 유닉스 시간값 epoch 로 변경하기

이건 조금 복잡하다. epoch 값은 일단 0에서 시작하는데, 이 날짜는 `1970-01-01T00:00:00Z`이다. 문제는 로직 앱 안에서 epoch 값을 다루는 함수가 없다는 데 있다. 하지만 tick 값을 다룰 수는 있으므로, 아래와 같은 트릭을 이용하도록 한다:

1. 주어진 타임스탬프 값을 tick 값으로 변환한다.
2. `1970-01-01T00:00:00Z` 날짜를 tick 값으로 변환한다. 이 변환 값은 `621355968000000000`이다.
3. 이 두 tick 값의 차이를 계산한다.
4. 이 차이 값을 1천만(1000 0000)으로 나누어 초 단위로 변경한다.

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=get-timestamp-in-epoch.yaml

위 로직 앱 워크플로우의 마지막 액션이 반환하는 결과는 `1536543296`이다.

## 유닉스 시간값 epoch 에서 타임스탬프로 변경하기

많은 API들이 날짜/시간 값을 유닉스 타임스탬프 값으로 반환하는 경우가 많다. 예를 들어서 애저 AD를 OAuth 서버로 사용할 때 액세스 토큰 값을 요청하면 그 응답 객체는 만료 시각을 유닉스 타임스탬프 형태로 반환한다:

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=aad-response.json

이 `expires_on` 값과 `not_before` 값은 epoch 형식을 나타내는데, 사실 이 값은 그다지 사람이 한 눈에 읽기 편한 값은 아니다. 따라서 이 값들을 읽기 편하게 포맷을 바꿔달라는 요청이 왕왕 있는 편이다. 이를 위한 직접적인 로직 앱 액션 또는 내장 함수가 없으므로 직접 변환하기 보다는 [`addToTime()`](https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference#addToTime) 또는 [`addSeconds()`](https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference#addSeconds)와 같은 내장 함수를 이용하면 편하다. 사실 epoch 값은 `1970-01-01T00:00:00Z` 이래로 몇 초나 흘렀는지를 알아볼 수 있다. 따라서 `addSeconds()` 혹은 `addToTime()` 함수를 이용해서 로직 앱을 직접 만들 수 있다:

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=convert-epoch-to-timestamp.yaml

이 변환 결과에 따르면 타임스탬프 값은 바로 `2018-09-10T12:34:56+11:00`이 된다.

> **NOTE**: epoch 값은 항상 UTC를 가리킨다. 따라서 만약 Korean Standard Time(KST) 같은 로컬 시간 값을 원한다면 [`convertTimeZone()`](https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference#convertTimeZone) 함수를 별도로 적용시켜줘야 한다. 하지만 이 함수는 타임존에 따른 오프셋 값을 타임스탬프에 포함시키지 않는다.

## Tick 값에서 타임스탬프로 변경하기

로직 앱 내장 함수인 `addToTime()`, `addSeconds()` 같은 함수는 날짜/시간 값을 표현하는 데 있어 초단위 까지만 변환 가능하다는 단점(?)이 있다. 반면에 tick 값은 1초를 1천만회 쪼개서 사용하므로 이 부분에 대한 조심만 하면 크게 문제될 것은 없다. tick 값에서 타임스탬프로 변경하는 방법은 위에 서술한 두 가지 방법을 조합하면 된다. 먼저 tick 값에서 epoch 값으로, 이어서 epoch 값에서 타임스탬프로 바꾸면 된다. 이미 우리는 `1970-01-01T00:00:00Z`에 대한 tick 값이 `621355968000000000` 라는 것을 알고 있다. 이를 바탕으로 `636721400967890200` 와 같이 아무런 tick 값이라도 주어진다면 아래와 같이 바꿀 수 있다:

https://gist.github.com/justinyoo/8d3dcf352682ca73c34d98d7601f1145?file=convert-ticks-to-timestamp.yaml

위 로직 앱 워크플로우에서 마지막 액션이 반환하는 타임스탬프 값은 `2018-09-10T01:34:56.0000000Z`이 된다. 정확하게는 `636721400967890200` 값은 로컬 타임스탬프로 `2018-09-10T12:34:56.789012+11:00`, UTC로 `2018-09-10T01:34:56.789012Z` 을 나타내지만, 이 변환의 결과로 소수점 이하 자리는 놓치게 된다. 이것은 로직 앱 함수가 갖는 치명적(?)인 단점이라 할 수 있다. 하지만, 그 정도까지 정확성이 필요하지 않다면 이 변환 방법은 굉장히 유용할 것이다.

* * *

지금까지 로직 앱 안에서 epoch 값, tick 값을 어떻게 ISO8601 포맷에 맞는 읽기 가능한 타임스탬프 값으로 바꿀 수 있는지에 대해 알아 보았다. 이것이 그다지 중요한 것은 아닐 수도 있지만 알아두면 꽤 쓸모 있는 것이라고 할 수 있겠다.

만약 로직 앱 전체 워크플로우가 궁금하다면 이 리포지토리를 참조하도록 하자. [https://github.com/devkimchi/DateTime-Conversions-in-Logic-App](https://github.com/devkimchi/DateTime-Conversions-in-Logic-App).
