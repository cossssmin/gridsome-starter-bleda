---
title: "로직 앱에서 배열의 가장 최근 값을 받아오기"
date: "2019-11-06"
slug: getting-the-latest-array-item-in-logic-app
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-logic-apps
- array
- sort
- wdl
- workflow-definition-language
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-in-logic-app-00.png
---

예전 고객사에서 프로젝트를 할 때 한 개발자와 아래와 같은 대화를 나눈 적이 있다.

> Q: 로직 앱에서 배열에 대한 정렬을 할 수 있나요? A: 로직 앱은 워크플로우 엔진이기 때문에 데이터 조작에 대한 부분은 아주 기본적인 사항을 제외하고는 지원하지 않습니다. 따라서, 배열의 정렬과 같은 문제는 별도의 애저 펑션 앱을 통해 하셔야 해요. Q: 그렇다면 제가 백업 데이터 중에서 가장 최근의 파일을 받아 오려면 어떻게 해야 할까요? A: 좋은 질문이네요! 파일 이름이 날짜 형식으로 되어 있으니 이를 활용해서 가장 큰 값을 가진 파일을 받아오면 되겠군요.

이 정도의 대화였다. 대화에서 언급한 바와 같이 [애저 로직 앱](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo)은 [워크플로우 정의 언어(Workflow Definition Language; WDL)](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-workflow-definition-language?WT.mc_id=aliencubeorg-blog-juyoo)를 이용하고 이와 관련한 [함수 레퍼런스](https://docs.microsoft.com/ko-kr/azure/logic-apps/workflow-definition-language-functions-reference?WT.mc_id=aliencubeorg-blog-juyoo)를 제공하지만, 아쉽게도 배열 정렬과 관련한 함수는 없다. 따라서, 위와 같은 사용자 요구사항에 있어서는 로직 앱 자체적으로 할 수 있는 것들이 마땅치 않은 편이다. 하지만, 언제나 방법은 있는 법. 최대한 외부 애플리케이션을 이용하지 않고 로직 앱 내에서 처리할 수 있는 방법은 없을까? 이 포스트에서는 간략하게 [애저 블롭 스토리지](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-overview?WT.mc_id=aliencubeorg-blog-juyoo)에서 최신 백업 파일을 가져오는 방법에 대해 알아보기로 하자.

## 가정

우선, 이 문제를 해결하기 위해서는 몇 가지 가정이 필요하다.

- [애저 블롭 스토리지](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-overview?WT.mc_id=aliencubeorg-blog-juyoo)에 백업 파일이 저장되어 있다.
- 백업 파일은 일단위로 저장되며, 파일 이름은 `yyyyMMdd.json`와 같은 포맷이다. 즉, `20191104.json`과 같은 형태라고 가정한다.

이러한 가정을 바탕으로 로직 앱의 [액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=aliencubeorg-blog-juyoo#actions-overview)을 만들어 보도록 하자.

## 파일 리스트

가장 먼저 해야 할 일은 애저 블롭 스토리지에서 백업 파일의 리스트를 가져오는 일이다. 이건 [커넥터](https://docs.microsoft.com/ko-kr/connectors/azureblobconnector/?WT.mc_id=aliencubeorg-blog-juyoo)를 이용하면 금방 되는 부분이라 크게 어렵지는 않다. 아래는 커넥터를 UI에서 정의하는 부분과 코드 부분을 보여준다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-in-logic-app-01.png)

https://gist.github.com/justinyoo/a04b468a7a0790ff6e0b531a69161aff?file=api-connection.json

이렇게 가져온 리스트의 결과는 대략 아래 그림과 같은 모양이 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-in-logic-app-02.png)

## 파일 이름 변환

위 결과 화면에서 볼 수 있다시피 기본적으로 파일 이름이 날짜 형식으로 되어 있으므로 아래와 같은 형태로 파일 이름에서 `.json` 부분을 떼 내고 정수형으로 변환해서 배열로 만든다. [`Select` 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=aliencubeorg-blog-juyoo#select-action)을 사용하면 이 작업을 손쉽게 할 수 있다. 아래는 로직 앱 디자이너에서 보이는 부분과 코드 부분이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-in-logic-app-03.png)

https://gist.github.com/justinyoo/a04b468a7a0790ff6e0b531a69161aff?file=select.json

이렇게 해서 받아온 결과는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-in-logic-app-04.png)

## 최신 파일 선택

이제 파일 이름이 모두 리스트로 만들어졌으니, 앞에 받아온 리스트와 날짜 배열 변환 결과를 비교해서 가장 큰 값을 가져오면 된다. 이 때 사용한 액션은 [`Filter`](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-workflow-actions-triggers?WT.mc_id=aliencubeorg-blog-juyoo#query-action)이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-in-logic-app-05.png)

https://gist.github.com/justinyoo/a04b468a7a0790ff6e0b531a69161aff?file=query.json

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/getting-the-latest-array-item-in-logic-app-06.png)

이렇게 얻어낸 최신 파일 정보를 통해 실제 파일을 다운로드 받아 이용하면 된다.

* * *

지금까지 로직 앱의 배열 안에서 값을 정렬하지 않고 두 개의 액션을 통해 최대값을 받아오는 방법에 대해 알아 보았다. 숫자만 들어있는 배열값을 이용해서 최대값을 뽑아내는 것이다보니, 실제 배열값의 정렬과는 거리가 있다. 하지만, 원하는 결과를 이끌어 낼 수 있었으니, 어떻게 보면 로직 앱이 배열의 정렬 기능을 제공하지 않기 때문에 볼 수 있는 일종의 꼼수라고도 할 수 있다. 이런 방식을 통한다면 아마도 다른 사용자 케이스에서도 비슷한 방식으로 다양하게 적용할 수 있는 방법이 있지 않을까?

다음 포스트에서는 이 방식을 이용해서 실제로 현업에 적용한 사례를 알아보기로 한다.
