---
title: "깃헙 액션으로 ChatOps 구현하기"
slug: implementing-chatops-on-github-actions
description: "이 포스트에서는 깃헙 액션을 통해 Continuous Delivery 파이프라인에서 승인 프로세스를 추가하는 방법에 대해 논의합니다."
date: "2020-03-05"
author: Justin-Yoo
tags:
- github-actions
- chatops
- continuous-delivery
- approval-process
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/implementing-chatops-with-github-actions-00.png
fullscreen: true
---

DevOps 파이프라인을 구성하다 보면 흔히 나오는 것이 [지속적인 제공(Continuous Delivery)과 지속적인 배포(Continuous Deployment)를 구분][ci cd]해서 구현하는 부분이 항상 나온다. 이 둘의 차이는 대략 아래의 그림과 같다.

![][image-01]

회사마다 차이는 있겠지만, 상황에 따라서는 지속적인 제공 혹은 지속적인 배포 프로세스를 선택하거나 둘 다 가져갈 수도 있는데, 이 둘의 가장 큰 차이점은 중간에 승인 프로세스가 들어가는가(지속적인 제공) 또는 아닌가(지속적인 배포)의 차이가 될 것이다.

기본적으로 [깃헙 액션][gh actions]은 지속적인 배포 프로세스를 따르고 있어서 중간에 승인 절차를 구현하려면 별도의 방법론이 필요하다. 그 중 가장 유명한 것이 [GitOps][gitops]와 [ChatOps][chatops]가 있는데, 이 포스트에서는 ChatOps를 이용해서 [깃헙 액션][gh actions] 파이프라인이 좀 더 상호작용이 가능하게끔 만들어 보자.


## ChatOps를 위한 준비물 ##

ChatOps라는 이름에서 볼 수 있는 바와 같이 기본적으로 이를 위해서는 [Slack][slack]이나 [Microsoft Teams][ms teams] 등과 같은 채팅 플랫폼이 필요하다. 이 포스트에서는 [Microsoft Teams][ms teams]를 이용해서 ChatOps를 구현하기로 한다.


## 깃헙 액션에서 메시지 보내기 ##

[이전 포스트][prev post]에서는 커스텀 깃헙 액션을 만드는 방법을 통해 실제로 [Microsoft Teams 액션][gh actions teams marketplace]을 구현해 봤다. 이 액션을 이용하면 [Microsoft Teams][ms temas]로 손쉽게 메시지를 보낼 수 있다. 메시지를 보낼 때의 포맷은 여러 가지가 있는데, 보통 아래와 같은 두 가지 형식의 메시지를 자주 사용한다.

1. [Open URI 형식][ms teams openuri action]: 메시지를 통해 외부 URL로 연결할 수 있게끔 링크를 제공하는 방식
  ![][image-02]

2. [HTTP POST 형식][ms teams httppost action]: 메시지를 통해 외부 웹훅을 실행할 수 있게끔 데이터를 제공하는 방식
  ![][image-03]

위 그림에서 볼 수 있다시피 Open URI 형식은 그냥 외부 URL 링크만 던져주는 방식이어서 간단한 알림 메시지를 주기에 편리한 반면, HTTP POST 형식은 웹훅 페이로드를 같이 전송하기 때문에 그 메시지를 받는 쪽에서 간단한 처리만 해주면 메시지 처리와 관련한 응답 메시지도 함께 받아 볼 수 있어서 훨씬 더 나은 사용자 경험을 추구할 수 있다.

1번과 같이 Open URI 형식을 위해서는 [Microsoft Teams 액션][gh actions teams marketplace]을 정의할 때 터를 아래와 같이 구성해 주면 된다.

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=github-actions-teams-1.yaml

실제 위 그림과 같은 메시지를 보내기 위해서 사용한 파라미터 정의는 아래와 같다. 수많은 변수들이 보이는데, 이는 다른 액션으로부터 받은 결과 값들을 가지고 사용하는 것들이라 크게 신경 쓰지 않아도 된다.

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=github-actions-teams-2.yaml&highlights=9-10

> `sections`, `actions` 파라미터가 굉장히 복잡해 보이는데, 이는 아마도 곧 [해결할 듯][gh issue] 싶다. <strike>아님 말고</strike>

하지만, 우리가 원하는 상호작용성을 위해서는 HTTP POST 형식이 훨씬 더 바람직한데, 아래 액션 정의를 보도록 하자. 위 스크린샷의 내용을 정의한 부분이다.

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=github-actions-teams-3.yaml&highlights=9-10


## 메시지 분석 ##

`actions` 파라미터에 정의한 JSON 객체를 보기 좋게 바꿔보자. 이 JSON 객체의 형식은 위에 링크한 [HTTP POST 형식][ms teams httppost action]을 따른 것이다.

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=actionable-message-card.json&highlights=3,8-9,13

위에서 볼 수 있는 바와 같이 HTTP POST 요청으로 어딘가에 웹훅 메시지를 날리고 있다. 깃헙으로 직접 웹훅 이벤트를 보내도 되지만 여기서는 [애저 펑션][az func]을 중간에 넣었는데, 이 부분에 대해서는 아래에서 다시 다뤄 보기로 한다. 어쨌거나, 이 웹훅 이벤트는 자체적인 페이로드를 갖고 있다. 이 역시도 좀 더 이쁘게 재구성 해 보자.

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=repository-dispatch.json&highlights=2-3

이 메시지 형식은 GitHub에서 정의한 [`Repository Dispatch`][gh events dispatch] 이벤트 페이로드의 형식으로, 이 글을 쓰는 현재에는 프리뷰 기능이어서 형식은 언제든지 바뀔 수 있다.

* `event_type`: `enum` 타입이 아니라 문자열 타입이다. 따라서 미리 정의된 이벤트 형식 값이 아닌 아무 문자열이나 다 받아들인다. 따라서, 회사 내부적으로 미리 정의한 값을 사용하면 된다.
* `client_payload`: `object` 타입이다. 따라서, 회사 내부적으로 정의한 아무 객체나 보낼 수 있다.

따라서, [깃헙 액션][gh actions]을 통해 [Microsoft Teams][ms teams]로 메시지를 보낼 때 위와 같이 메시지를 구성한다면, [Microsoft Teams][ms teams]에서 메시지를 클릭할 경우 [애저 펑션][az func]을 통해 GitHub으로 [`Repository Dispatch`][gh events dispatch] 이벤트를 보내는 셈이 된다. 즉, 이 이벤트가 바로 승인 절차가 된다.


## 깃헙 액션으로 ChatOps 구현 ##

그렇다면, [Microsoft Teams][ms teams]에서 보낸 이벤트 메시지를 GitHub이 받았을 때 이 이벤트를 [깃헙 액션][gh actions]에서 받을 수 있을까? 당연히 받을 수 있다. 깃헙 액션을 발동시키는 [이벤트][gh actions events]에는 단지 코드 푸시나 PR 뿐만 아니라 다양한 것들이 있는데 그 중 하나에 바로 이 [`Repository Dispatch`][gh actions events dispatch] 이벤트도 있다. 따라서, 이 이벤트를 받아 작동하는 워크플로우를 만들어 사용하면 된다. 아래 워크플로우 정의 문서를 살펴보자.

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=workflow.yaml&highlights=3,8

위와 같이 새로운 워크플로우를 `repository_dispatch` 이벤트에만 반응하게끔 만들어 놓고, 이 안에 릴리즈와 관련한 워크플로우를 정의해 놓으면 [Microsoft Teams][ms teams]에서 승인 버튼을 클릭했을 때 이 워크플로우가 작동하게 된다.

> **NOTE**: 여기서 주의해야 할 부분이 한가지 있다. 위와 같이 `if` 파라미터를 통해 이 `repository_dispatch` 이벤트가 정말 내가 원하는 것인지 아닌지를 필터링해야 한다. 그렇지 않으면 `repository_dispatch` 이벤트로 들어오는 모든 페이로드에 다 반응을 하기 때문에 불필요한 낭비가 발생할 것이다.


## 애저 펑션이 하는 역할 ##

앞서 [Microsoft Teams][ms teams]에서 정의한 웹훅 페이로드를 살펴보면 우선 [애저 펑션][az func]으로 이벤트를 보낸 것을 볼 수 있었다. 사실 깃헙으로 직접 보내도 상관 없지만, 굳이 이렇게 한 이유가 있을까? 물론 있다. 깃헙으로 직접 보냈을 경우에는 `204 No Content` 응답을 받는다. 이벤트라는 것의 특성상 [Microsoft Teams][ms teams]에서는 이벤트를 발생시킬 뿐 이를 어떻게 처리하는 지는 이 이벤트를 받는 쪽이 알아서 하는 부분이라, 이 이벤트가 제대로 보내졌는지 아닌지 알 수 있는 방법이 없다. 이럴 경우 보통 이벤트 처리 무결성을 보장하기 위해 여러 방법을 사용한다. 예를 들어 [이벤트 그리드][az eventg], [로직 앱][az logapp], [애저 펑션][az func] 등의 이벤트에 대응하는 서비스를 사용하게 되는데, 여기서는 간단하게 [애저 펑션][az func]으로 구현했다.

> 만약 이 이벤트가 정말 미션 크리티컬한 것이라면 [이벤트 그리드][az eventg]를 이용해서 [DLQ(Dead Letter Queue)][az eventg dlq]까지 처리하는 것이 좋다.

또 하나 [애저 펑션][az func]을 이용한 이유는 [Microsoft Teams][ms teams]에 좀 더 풍부한 사용자 경험을 제공하기 위해서이다. [HTTP POST][ms teams httppost action]을 사용할 때 응답 헤더에 [`CARD-ACTION-STATUS`][ms teams httppost action status]를 이용해서 응답 메시지를 담아두면 위의 스크린샷과 같이 댓글로 액션이 성공적으로 수행이 됐는지 아닌지 여부를 확인할 수 있기 때문이다. 만약 GitHub으로 직접 메시지를 보낸다면 단순히 `204 No Content` 혹은 `400 Bad Request` 응답 코드만 받기 때문에 제대로 액션이 수행됐는지 알기 어렵지만, 지금과 같이 [애저 펑션][az func]을 한 번 거치게 하면 이렇게 풍부한 사용자 경험을 제공할 수 있다. 예를 들자면 이런 식이다.

https://gist.github.com/justinyoo/5d12d5df5c569df921ff614001bb48d2?file=function.cs&highlights=27,31

깃헙으로 이벤트를 보냈을 때 성공했을 경우와 실패했을 경우 `CARD-ACTION-STATUS` 응답 헤더에 값을 다르게 줌으로써, [Microsoft Teams][ms teams]에서 승인 프로세스가 제대로 작동이 됐는지 아닌지 여부를 손쉽게 알 수 있다.

---

지금까지 [Microsoft Teams][ms teams]를 이용해 [깃헙 액션][gh actions]으로 ChatOps를 구현하는 방법에 대해 알아 보았다. 여기서는 굉장히 간단한 예제를 통해 알아봤지만, 회사마다 다양한 사용자 케이스를 통해 좀 더 풍부한 결과물을 만들어 낼 수 있을 것이다. 여기까지 읽어 봤다면 이 포스트에서 사용한 [애저 펑션][az func] 이외에 [이벤트 그리드][az eventg] 또는 [로직 앱][az logapp]을 이용해서 한 번 자신의 상황에 맞게 구현해 볼 수도 있지 않을까? 그것은 여러분의 몫으로 남겨두기로 한다.


[image-01]: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/implementing-chatops-with-github-actions-01-ko.png
[image-02]: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/implementing-chatops-with-github-actions-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/implementing-chatops-with-github-actions-03.png

[ci cd]: https://www.redhat.com/ko/topics/devops/what-is-ci-cd
[gitops]: https://www.weave.works/technologies/gitops/
[chatops]: https://searchitoperations.techtarget.com/definition/ChatOps

[slack]: https://slack.com/

[ms teams]: https://products.office.com/ko-kr/microsoft-teams/group-chat-software?WT.mc_id=aliencubeorg-blog-juyoo
[ms teams openuri action]: https://docs.microsoft.com/ko-kr/outlook/actionable-messages/message-card-reference?WT.mc_id=aliencubeorg-blog-juyoo#openuri-action
[ms teams httppost action]: https://docs.microsoft.com/ko-kr/outlook/actionable-messages/message-card-reference?WT.mc_id=aliencubeorg-blog-juyoo#httppost-action
[ms teams httppost action status]: https://docs.microsoft.com/ko-kr/outlook/actionable-messages/message-card-reference?WT.mc_id=aliencubeorg-blog-juyoo#reporting-an-actions-execution-success-or-failure

[prev post]: https://blog.aliencube.org/ko/2020/02/19/building-custom-github-action-with-dotnet-core/

[gh actions]: https://github.com/features/actions
[gh actions teams marketplace]: https://github.com/marketplace/actions/microsoft-teams-generic
[gh actions teams repo]: https://github.com/aliencube/microsoft-teams-actions
[gh actions events]: https://help.github.com/en/actions/reference/events-that-trigger-workflows
[gh actions events dispatch]: https://help.github.com/en/actions/reference/events-that-trigger-workflows#external-events-repository_dispatch

[gh issue]: https://github.com/aliencube/microsoft-teams-actions/issues/4

[gh events dispatch]: https://developer.github.com/v3/repos/#create-a-repository-dispatch-event

[az eventg]: https://docs.microsoft.com/ko-kr/azure/event-grid/overview?WT.mc_id=aliencubeorg-blog-juyoo
[az eventg dlq]: https://docs.microsoft.com/ko-kr/azure/event-grid/manage-event-delivery?WT.mc_id=aliencubeorg-blog-juyoo

[az logapp]: https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az func]: https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo
