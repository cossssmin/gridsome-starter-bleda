---
title: "Azure Functions를 이용해서 GitHub과 Slack 연동하기"
date: "2016-05-16"
slug: slack-github-integration-with-azure-functions
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure Functions
- GitHub
- Integration
- Slack
- Webhook
fullscreen: false
cover: ""
---

Azure Functions 서비스는 지난 3월 말 [Build 2016](https://channel9.msdn.com/Events/Build/2016/B858) 행사에서 처음으로 소개되었다. 스스로를 AWS Lambda 서비스(이하 `람다`)의 경쟁자로 포지셔닝하는 만큼 기능들이 거의 비슷하다. 다만 후발주자로서 더 많은 언어들을 지원하고 조금 더 손쉽게 만들 수 있어서 여러모로 편리하다. 때마침 [@totuworld](https://twitter.com/totuworld)님께서 [Azure Functions로 Slack Bot 만들기](http://totuworld.github.io/2016/04/14/azure-functionapp) 포스트를 작성해 주셨기 때문에 따라하는 차원에서 다시금 슬랙봇을 깃헙과 연동시켜 본다.

[지난 포스트](http://blog.aliencube.org/ko/2016/05/15/slack-github-integration-with-aws-lambda)에서는 람다를 이용해서 Slack과 GitHub을 연동시키는 방법에 대해 알아 보았다. 이 포스트에서는 이를 [Azure Functions](https://azure.microsoft.com/en-us/services/functions)로 구현해 보도록 한다.

이 포스트에서는 아래와 같은 내용을 다루고자 한다:

- Slack 수신 웹훅 생성
- Azure Functions에 펑션 생성
- GitHub 송신 웹훅 연결

> 관련 소스 코드는 [Azure Functions & AWS Lambda Sample](https://github.com/devkimchi/Azure-Functions-AWS-Lambda-Sample)에서 찾을 수 있다.

## Slack 수신 웹훅

[이전 포스트](http://blog.aliencube.org/ko/2016/05/15/slack-github-integration-with-aws-lambda)의 Slack 수신 웹훅 섹션을 참고한다. 방법은 동일하다.

## Azure Functions 펑션 생성

먼저 아래와 같이 사용하고자 하는 언어를 선택한다. 현재 Azure Functions에서 지원하는 언어의 종류는 자바스크립트, C#, F#, 파이썬, PHP이고, 이에 더하여 배치파일, Bash 스크립트, 파워셸 스크립트도 지원한다. 훨씬 더 많은 종류의 언어를 제공하는 것이 Azure Functions 서비스의 장점들 중 하나라고 할 수 있다.

`node.js`를 사용하기로 하고, 아래 그림과 같이 `HTTP Trigger` 템플릿을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-azure-functions-01.png)

펑션의 이름을 `SlackBotIncomingWebhook`으로 하고 인가 수준을 펑션 레벨로 설정한 후 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-azure-functions-02.png)

그렇게 생성된 펑션은 기본 자바스크립트 코드를 아래와 같은 형태로 갖고 있다.

https://gist.github.com/justinyoo/b4d8f1cb4fff53094f92803043a82419

이것을 직접 사용할 수는 없으므로 아래와 같이 약간의 수정을 하도록 한다.

https://gist.github.com/justinyoo/2bbf70cd40b683fac94f03b641ad66cd

펑션 내에서 슬랙으로 HTTP 요청을 보내야 하므로 `options`와 `data` JSON 객체를 생성하고 이를 `https` 객체에 담아 요청을 보낸다는 내용이다. 이렇게 코드를 수정한 후 화면 하단의 `Run` 섹션에서 `Run` 버튼을 누르면 곧바로 이 펑션이 작동되고, 그 로그가 바로 위에 있는 `Logs` 섹션에 저장되는 것을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-azure-functions-03.png)

이제 Azure Functions 서비스에 펑션을 추가하는 작업이 끝났다. 음? 벌써? 이제 깃헙에 웹훅을 만들어 연결시켜 보도록 한다.

## GitHub 송신 웹훅 연결

웹훅의 생성 및 설정 방법은 [지난 포스트](http://blog.aliencube.org/ko/2016/05/15/slack-github-integration-with-aws-lambda)와 동일하다. 다만 아래와 같이 Payload URL 값이 Azure Functions에 생성한 펑션으로 지정되어야 한다는 점만 달라질 뿐이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-azure-functions-04.png)

이렇게 펑션을 생성한 후 실제 작동을 확인하기 위해 테스트 커밋을 푸시해 본다. 아래와 같이 메시지가 전달되는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-azure-functions-05.png)

메시지를 조금 더 의미있게 만들기 위해 아래와 같이 `data`의 메시지 문구를 살짝 수정한다.

https://gist.github.com/justinyoo/313cb024a24d7523bda8f37d2ed2579e

그리고 다시 코드를 푸시해 보자. 그러면 아래와 같이 슬랙봇이 새롭게 의미있는 메시지를 채널에 뿌리는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-azure-functions-06.png)

지금까지 우리는 Azure Functions 서비스를 사용해서 슬랙과 깃헙을 통합시키는 방법에 대해 알아보았다. [이전 포스트](http://blog.aliencube.org/ko/2016/05/15/slack-github-integration-with-aws-lambda)에서 사용한 람다와 비교해 봤을 때 굉장히 간결해졌다. 몇가지 단계가 줄어들어서 훨씬 더 빠르게 서비스를 생성할 수 있다는 것이 Azure Functions의 최대 장점이라고 할 수 있다.

지금까지 모두 `node.js`를 사용했다면, 다음에 이어질 포스트에서는 양 서비스에서 모두 C# 코드를 사용해 보도록 하자.
