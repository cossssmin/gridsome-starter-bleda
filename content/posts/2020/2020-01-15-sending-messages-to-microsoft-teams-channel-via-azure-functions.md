---
title: "애저 펑션으로 MS 팀즈 커스텀 커넥터 만들기"
slug: building-ms-teams-custom-connector-with-azure-functions
description: "이 포스트에서는 애저 펑션을 이용해 마이크로소프트 팀즈 채널로 메시지를 보내는 커스텀 커넥터를 만드는 방법에 대해 다뤄봅니다."
date: "2020-01-15"
author: Justin-Yoo
tags:
- microsoft-teams
- azure-functions
- custom-connector
- incoming-webhook
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/01/sending-messages-to-microsoft-teams-via-azure-functions-00.png
fullscreen: true
---

[지난 포스트][prev post]에서는 [애저 로직 앱][az log app]으로 [마이크로소프트 팀즈][ms teams]에 메시지를 보낼 수 있는 커스텀 커넥터를 만드는 방법에 대해 소개했었다. 많은 경우에는 [로직 앱][az log app]을 사용해도 크게 문제가 되진 않지만, 만약 메시지 구조가 복잡해진다거나 하면 [애저 펑션][az func]을 쓰면 좀 더 효과적일 수도 있다. 이 포스트에서는 [애저 펑션][az func]을 통해 [MS 팀즈][ms teams]에 메시지를 보낼 수 있는 [커스텀 커넥터][ms teams cus con]를 만드는 방법에 대해 알아본다.


## 커스텀 커넥터 등록 ##

우선 원하는 [MS 팀즈][ms teams] 채널에 커스텀 커넥터를 등록한다. [지난 포스트][prev post]와 마찬가지로 이번에도 [Incoming Webhook][ms teams webhook] 커넥터를 사용하기로 한다. 이 커넥터를 생성하는 방법은 [지난 포스트][prev post]를 참고하고, 여기서는 더 설명하지는 않기로 한다. 커넥터를 만들고 나면 웹훅 URL이 생기므로 이를 복사해 둔다.


## 실행형 메시지 카드 (Actionable Message Card) 작성 ##

[지난 포스트][prev post]에서 언급한 바와 같이 현재 [MS 팀즈][ms teams]의 커넥터는 [적응형 카드(Adaptive Card)][ms teams ac] 포맷 대신 여전히 레거시 포맷인 [실행형 메시지 카드(Actionable Message Card)][ms teams amc]를 사용한다. 어느 쪽이든 기본적으로 커다란 JSON 객체 형태인데, 이를 코드로 짜기에는 상당히 손이 많이 가는 편이다. 다행히도 이미 누군가 [NuGet 패키지][nuget amc]를 만들어서 제공하므로 그냥 가져다 쓰면 된다. 메시지 카드를 만드는 부분의 코드는 대략 아래와 비슷할 것이다.

https://gist.github.com/justinyoo/f5208618f8a06d8b15e048094b8bafcb?file=build-message-card.cs

위 코드에서 볼 수 있다시피, `webhookUri`와 `summary`를 제외하고 나머지는 모두 선택적 파라미터이다. `sections`, `actions` 파라미터는 JSON 배열 형태의 문자열을 직접 받아서 비직렬화를 시키게끔 했다. 이 부분은 사용자 케이스마다 워낙 천차만별이어서 각자의 상황에 맞게 적용하면 될 것이다.

> 보통은 이 `sections`과 `actions` 부분의 구조는 조직마다 어느 정도는 정형화 되어 있는 편일테니, 실제로 상황에 따라 변하는 값을 제외하고 나머지는 템플릿 형태로 미리 만들어서 제공하는 것이 일반적이다.


## 애저 펑션을 통해 메시지 보내기 ##

위 코드는 상당히 일반론적인 것이어서, 사실 애저 펑션이 아니더라도 어디든 적용시킬 수 있다. 다만, 애저 펑션을 통해서 진행한다면 대략 아래와 같은 모양이 된다.

https://gist.github.com/justinyoo/f5208618f8a06d8b15e048094b8bafcb?file=function-app.cs


## 콘솔 앱을 통해 메시지 보내기 ##

그렇다면 만약 콘솔 앱과 같은 형태로 메시지를 보낸다면 어떤 식이 될까? 만약 [CommandLineParser][nuget clp]와 같은 라이브러리를 사용한다면 좀 더 직관적으로 멋지게 콘솔 앱을 작성할 수도 있겠지만, 여기서는 대략의 아이디어만 공유하자면 아래와 같은 모양과 비슷해진다.

https://gist.github.com/justinyoo/f5208618f8a06d8b15e048094b8bafcb?file=console-app.cs

---

지금까지 [애저 펑션][az func]을 이용해서 [MS 팀즈][ms teams] 채널로 메시지를 보내는 방법에 대해 논의해 보았다. 이렇게 만든 애저 펑션 앱은 결국 메시지를 쉽게 보내기 위한 웹훅 껍데기에 불과한 것이므로, 어딘가에서 이벤트가 발생했을 때 이를 빠르게 캡쳐해서 채널로 보내는 상황이라면 어디든 적용시킬 수 있을 것이다.



[prev post]: https://blog.aliencube.org/ko/2019/08/28/two-ways-building-ms-teams-custom-connector-with-logic-apps/

[az log app]: https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az func]: https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo

[ms teams]: https://products.office.com/ko-kr/microsoft-teams/group-chat-software?WT.mc_id=aliencubeorg-blog-juyoo
[ms teams cus con]: https://docs.microsoft.com/ko-kr/microsoftteams/office-365-custom-connectors?WT.mc_id=aliencubeorg-blog-juyoo
[ms teams webhook]: https://docs.microsoft.com/ko-kr/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?WT.mc_id=aliencubeorg-blog-juyoo
[ms teams ac]: https://docs.microsoft.com/ko-kr/outlook/actionable-messages/adaptive-card?WT.mc_id=aliencubeorg-blog-juyoo
[ms teams amc]: https://docs.microsoft.com/ko-kr/outlook/actionable-messages/message-card-reference?WT.mc_id=aliencubeorg-blog-juyoo

[nuget amc]: https://www.nuget.org/packages/MessageCardModel/
[nuget clp]: https://www.nuget.org/packages/CommandLineParser/
