---
title: "로직 앱에서 인라인 스크립트를 이용해 배열의 가장 최근 값을 받아오기"
date: "2019-11-14"
slug: getting-the-latest-array-item-with-inline-script-in-logic-app
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-logic-apps
- array
- sort
- integration-account
- inline-javascript
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-with-inline-script-in-logic-app-00.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/11/06/getting-the-latest-array-item-in-logic-app/)에서는 배열 안의 날짜 데이터를 이용해 최근 데이터를 찾는 방법을 [로직 앱](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo)의 [`Select` 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=aliencubeorg-blog-juyoo#select-action)과 [`Filter` 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=aliencubeorg-blog-juyoo#query-action)을 조합하는 방식으로 알아 보았다. 사실 이 방법은 특정 사용자 케이스에 대해서만 적용할 수 있는 방법이기도 하고, 꼼수같은 방법이기도 해서 일반적인 경우에 적용하기엔 한계가 있다. 하지만, [인라인 자바스크립트 코드 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=aliencubeorg-blog-juyoo)을 이용하면 이 모든 것을 손쉽게 해결할 수 있다. 이번 포스트에서는 [인라인 자바스크립트 코드 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=aliencubeorg-blog-juyoo)을 이용해서 배열을 정렬한 후 가장 최근값을 받아오는 로직 앱을 작성해 보기로 하자.

## 통합 어카운트

로직 앱에서 인라인 자바스크립트 코드 액션을 사용하기 위해서는 먼저 [통합 어카운트](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-enterprise-integration-create-integration-account?WT.mc_id=aliencubeorg-blog-juyoo)가 있어야 한다. 통합 어카운트는 현재 무료(Free), 기본(Basic), 표준(Standard)의 [세가지 가격 정책](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-pricing?WT.mc_id=aliencubeorg-blog-juyoo#integration-accounts)을 갖고 있는데, 이 포스트를 위해서는 무료 티어를 사용해도 상관없다.

통합 어카운트 인스턴스를 생성한 후 이를 로직 앱에 아래와 같이 연결시켜 주면 이와 관련한 준비는 끝난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-with-inline-script-in-logic-app-03.png)

## 자바스크립트 버전

로직 앱의 인라인 자바스크립트 코드 액션은 현재 node.js `8.11.1`버전을 지원한다. 그리고 이 버전 자바스크립트의 [빌트인 펑션](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects)들만 지원할 뿐이고, 외부 라이브러리를 이용한 추가적인 설치는 지원하지 않는다고 한다. 따라서 별도의 [`require()`](https://nodejs.org/docs/latest-v8.x/api/modules.html#modules_require) 구문 없이도 모든 기능들이 작동하게끔 해야 한다.

## 인라인 코드

우선 아래와 같은 자바스크립트 코드를 살펴보자. 이 코드는 로직 앱과는 상관 없는 순수한 자바스크립트 코드이다. 이 코드를 node.js 콘솔 창에서 실행시켜 보면 가장 최근의 파일인 `20191104.json`이 반환되는 것을 확인할 수 있다. [자바스크립트에서 객체의 배열을 정렬](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)하려면 별도의 콜백 펑션 API를 이용해서 원하는 형태로 만들 수 있다.

https://gist.github.com/justinyoo/9fe349aed14085321eaf48b14338dc9b?file=sort.js

이 때 알아 두어야 할 부분은 이 콜백 펑션이 반환하는 값은 `-1`, `0`, `1`의 세 가지인데, `-1`은 배열의 두 값 `a`와 `b` 중 `a`를 낮은 인덱스로 보낸다는 의미이고, `1`은 배열의 두 값 `a`와 `b` 중 `b`를 낮은 인덱스로 보낸다는 의미이다. 따라서, 이 콜백 펑션을 거쳐 배열을 정렬하게 되면 `Name` 속성에 할당된 값에서 `.json`을 떼 내고, 두 값을 비교해서 좀 더 최근 날짜를 위로 올리는 (낮은 인덱스로 보내는), 즉 내림차순으로 정리가 된다.

> 이와 관련해서 좀 더 자세히 알고 싶다면 [이 페이지](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#설명)를 참조한다.

그러면 이를 실제로 로직 앱에 적용시켜 보자.

## 로직 앱 인라인 자바스크립트 코드 액션

먼저 아래와 같이 [인라인 자바스크립트 코드 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=aliencubeorg-blog-juyoo)을 추가한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-with-inline-script-in-logic-app-01.png)

이렇게 액션을 추가한 후 아래 자바스크립트 코드를 추가한다. 위에 작성한 코드와 별반 다르지 않지만 두 부분이 바뀌었다.

https://gist.github.com/justinyoo/9fe349aed14085321eaf48b14338dc9b?file=sort-action.js

- `items` 변수에 배열값을 이전에 실행시켰던 `List Backups` 액션의 결과값을 통해 할당한다.
- 마지막 줄에 보면 `return` 구문을 통해 이 액션의 실행 결과를 `outputs`으로 반환한다.

이렇게 반환된 값은 다음에 이어지는 액션들 사이에서 `outputs('ACTION_NAME')?['body']`를 통해 사용할 수 있다.

## 비교

이 액션 하나로 배열의 정렬이 한방에 정리가 됐다. 그러면 지난 포스트에서 정리했던 결과와 비교를 해 보도록 하자. 아래 그림을 보면 좀 더 확실하게 눈에 들어올 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-with-inline-script-in-logic-app-02.png)

우측의 워크플로우는 [지난 포스트](https://blog.aliencube.org/ko/2019/11/06/getting-the-latest-array-item-in-logic-app/)에서 작성한 것이다. 다른 것은 다 제껴두고라도 원하는 결과를 얻기 위해서 최소한 `Select Filename from Backups` 액션과 `Take Latest Backup` 액션 두 개를 실행시켜야 한다. 그리고 조금 더 깔끔한 결과를 원한다면 그림과 같이 추가적인 액션을 앞뒤로 배치한다.

반면에 [인라인 자바스크립트 코드 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=aliencubeorg-blog-juyoo)을 이용하면 한방에 깔끔하게 결과를 받아볼 수 있다. 하지만 여기서도 문제가 하나 있는데, 이 액션을 사용하기 위해서는 반드시 [통합 어카운트](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-enterprise-integration-create-integration-account?WT.mc_id=aliencubeorg-blog-juyoo)를 사용해야 한다. 사용한 만큼 가격을 지불하는 방식이 아니라 월별 정액제로 비용을 지불하는 방식이다. 이 비용이 [한달 30일 기준 33.3만원 (기본) 혹은 111만원 (표준)](https://azure.microsoft.com/ko-kr/pricing/details/logic-apps/?WT.mc_id=aliencubeorg-blog-juyoo) 정도로 꽤 비싸기 때문에 이미 회사에서 통합 어카운트를 사용하고 있다면 문제가 없지만, 그렇지 않다면 신중히 고려를 해 봐야 할 수도 있다.

* * *

지금까지 [인라인 자바스크립트 코드 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=aliencubeorg-blog-juyoo)을 통해 로직 앱 워크플로우 상에서 배열을 정렬하는 방법에 대해 알아 보았다. 굉장히 강력한 기능이긴 하지만, 앞서 언급한 바와 같이 비용에 대한 충분한 고려 후 적용시켜야 한다.
