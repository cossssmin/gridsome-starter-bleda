---
title: "25일간의 서버리스 챌린지"
date: "2019-11-30"
slug: 25-days-of-serverless
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- serverless
- '25-days-of-serverless'
fullscreen: true
cover: https://s5.gifyu.com/images/advent-of-serverless.gif
---

여러분 안녕하세요!

[마이크로소프트 클라우드 아드보캇](https://developer.microsoft.com/ko-kr/advocates/?WT.mc_id=25daysofserverless-blog-cxa) 팀에서는 이번에 [#25DaysOfServerless](https://www.25daysofserverless.com/)라는 이름으로 [애저 펑션](https://azure.microsoft.com/ko-kr/services/functions?WT.mc_id=25daysofserverless-blog-cxa)을 이용해서 25일간 25개의 서버리스 애플리케이션을 만들어 보는 이벤트를 시작합니다. 오는 12월 1일부터 25일간 저희 클라우드 아드보캇 팀에서 매일 하나씩 도전 과제를 드릴텐데요, 이를 함께 풀어 보도록 하시죠!

## 규칙

규칙은 아주 간단합니다. 저희 팀에서 내는 문제를 본인이 선호하는 프로그래밍 언어를 이용해서 풀면 됩니다. 그리고, 깃헙에 본인의 해법을 올리고 트위터와 같은 SNS에 공유해 주세요! 그러면 저희가 그것들을 다 모아 모아서 매주 큐레이팅 해 드릴 겁니다.

서버리스 기술을 잘 모르신다구요? 괜찮습니다. 매일 도전 과제가 나갈 때 힌트도 함께 드립니다. 오로지 필요한 건 뭐다? 깃헙 계정과 거기에 올라가는 해법, 그리고 본인의 호기심이면 충분합니다!

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/25-days-of-serverless-01.jpg)

## 예제

> 이번에 선물을 주기 전에 우리 선물 사진을 스포일러하겠습니다. 그런데 문제는 `.png` 파일만 공유할 거예요. 이를 위해서 우리는 애저 블롭 저장소에 사진이 올라올 때마다 애저 펑션을 실행시켜 사진이 `.png` 포맷이 아닐 경우 삭제하도록 하겠습니다.

이 경우에 [애저 펑션 블롭 트리거](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-create-storage-blob-triggered-function?WT.mc_id=25daysofserverless-blog-cxa)를 만들어 볼 수 있겠죠? 아래는 간단한 C# 코드입니다.

https://gist.github.com/justinyoo/977295c0919f5e4fcd7a7eebc4455a27?file=blob-trigger.cs

사실, 여기서는 편의상 C# 코드를 사용했지만, 굳이 C# 언어를 사용하실 필요도 없어요. 본인이 편한 언어를 선택해서 코드를 작성하시면 됩니다. 심지어 굳이 애저를 사용하실 필요도 없어요. 하지만 애저를 사용하면 더욱 좋겠죠? :wink:

## 시작하기

오는 12월 1일부터 [www.25daysofserverless.com](https://www.25daysofserverless.com/)를 통해 하루에 하나씩 확인하실 수 있습니다! 트위터에서 [@AzureAdvocates](https://twitter.com/azureadvocates) 또는 [#25DaysOfServerless](https://twitter.com/search?q=%2325DaysOfServerless&src=typed_query)를 통해 다른 개발자들이 어떻게 만들었는지도 꼭 확인해 보세요!

아직 애저 계정이 없으신가요? 괜찮습니다. 12월 1일 이전에 [무료로 계정을 만들어서](https://azure.microsoft.com/ko-kr/free/?WT.mc_id=25daysofserverless-blog-cxa) 준비하세요!
