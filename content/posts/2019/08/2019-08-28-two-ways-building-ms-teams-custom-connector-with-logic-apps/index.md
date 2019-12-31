---
title: "로직앱으로 MS 팀즈 커스텀 커넥터 만드는 두 가지 방법"
date: "2019-08-28"
slug: two-ways-building-ms-teams-custom-connector-with-logic-apps
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-logic-apps
- custom-connector
- incoming-webhook
- microsoft-teams
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-00.png
---

얼마 전에 [MS 팀즈](https://products.office.com/ko-kr/microsoft-teams/)가 [슬랙](https://slack.com)을 제치고 기업용 협업 도구 시장의 최강자로 떠올랐다는 [신문 기사](https://news.v.daum.net/v/20190718081351828)가 있었다. 여전히 기업용 협업 도구 시장의 파이는 계속 커지는 중이므로 팀즈와 슬랙 중 어떤 것이 더 나은가에 대한 논의는 여기서는 크게 의미가 없다. 둘 다 이 파이의 크기를 키우는데 혁혁한 공을 세운 도구들이기 때문이다.

다른 기업용 협업 도구와 마찬가지로 팀즈의 주요 기능중 하나는 바로 인스턴트 메시지 기능인데, 이 메시지 채널을 통해 사람들 간 소통 뿐만 아니라 수많은 봇을 설치해서 다른 부가적인 기능을 수행하기에도 참 좋다. 팀즈가 이런 봇의 기능을 위해 제공하는 커넥터는 무수히 많은 편이긴 하지만, 그럼에도 불구하고 내가 원하는 서비스는 아직 커넥터로 제공되지 않는 경우가 있다.

이 포스트에서는 아직 원하는 MS 팀즈 커넥터가 없을 경우 애저 로직앱을 이용해 두 가지 서로 다른 방법으로 MS 팀즈에 메시지를 보내는 방법에 대해 알아보도록 한다.

## 사용자 케이스

정적 웹사이트 배포를 위해 [Netlify](https://netlify.com)를 이용할 경우 배포가 완료되면 웹훅 메시지를 보낼 수 있다. 이 웹훅 메시지를 로직앱을 통해 MS 팀즈로 보내고자 한다.

## MS 팀즈 웹훅 커넥터 등록

MS 팀즈에 커스텀 커넥터를 만드는 가장 손쉬운 방법은 바로 웹훅 커넥터를 이용하는 것이다. 커스텀 커넥터를 설치하고 싶은 채널의 우측 점 세개 버튼을 클릭해서 커넥터를 찾는다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-01.png)

수많은 커넥터 목록이 나오는데 그 중에서 `Incoming Webhook` 커넥터를 찾아 `Add` 버튼을 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-02.png)

몇가지 읽어볼 것들이 나오는데, 한 번 쭉 읽어보고난 후 `Install` 버튼을 클릭해서 채널에 설치한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-03.png)

웹훅 커넥터 설치가 끝나면 아래 그림과 같이 웹훅 링크를 생성해야 한다. 웹훅 이름을 정하고 `Create` 버튼을 클릭해서 웹훅을 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-04.png)

웹훅이 만들어지면 아래 그림과 같이 링크가 자동으로 만들어지는데, 이를 복사해 둔다. 앞으로 만들 로직 앱에서 이를 사용할 계획이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-05.png)

이 웹훅 URL로 메시지를 한 번 보내보자. 그런데 에러 메시지가 심상치 않다. 일단 `400 Bad Request` 에러를 뱉어내면서 에러 메시지는 무언가 특별한 필드 내지는 값을 요구하는 인상을 준다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-06.png)

이는 MS 팀즈 웹훅은 [실행형 메시지 카드 (Actionable Message Card) 포맷으로 된 메시지가 들어오기를 기대하고 있기 때문이다](https://docs.microsoft.com/ko-kr/outlook/actionable-messages/message-card-reference).

## 실행형 메시지 카드 (Actionable Message Card)

앞서 언급했다시피 MS 팀즈에서 사용하는 웹훅은 실행형 메시지 카드 포맷을 사용해야 한다. 이 메시지 카드 포맷을 하나하나 언급할 수는 없고 여기서는 간단한 [예시만 링크](https://docs.microsoft.com/ko-kr/outlook/actionable-messages/message-card-reference#card-examples)하도록 한다. 아래는 로직앱의 `HTTP` 액션을 통해 곧바로 MS 팀즈의 웹훅 URL로 메시지를 보내기 위한 메시지 카드 포맷이다.

https://gist.github.com/justinyoo/4030dd4fa2f2875905c770d8013d6856?file=actionable-message-card.json

이 메시지 카드 포맷을 직업 웹훅 URL을 통해 보내면 대략 아래와 같은 메시지가 팀즈 채널로 보내진다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-07.png)

## 적응형 카드 (Adaptive Card)

그런데, 로직앱은 자체적으로 MS 팀즈 커넥터를 제공하고 있고, 이 커넥터는 적응형 카드 (Adaptive Card) 포맷을 요구한다. 적응형 카드 포맷은 실행형 메시지 카드 포맷의 후속 버전인데, 웹훅 자체는 아직 레거시 실행형 메시지 카드 포맷을 요구하지만, 로직앱 커넥터는 적응형 카드 포맷을 사용하기를 강제하고, 아마도 추측컨대 내부적으로 이를 실행형 메시지 카드 포맷으로 바꾸는 작업을 하는 것 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-08.png)

물론 위 그림에서 보다시피 다른 형식으로도 메시지를 보낼 수 있기는 한데, 이는 뭔가 봇이 메시지를 보내는 게 아니라 그냥 대충 보내는 느낌이어서 예쁘지 않다. 따라서 적응형 카드 포맷으로 보내는 것이 가장 깔끔하다. 그렇다면, 이 적응형 카드 포맷은 어떻게 생겼을까? 적응형 카드 [스키마](https://adaptivecards.io/explorer/)를 여기서 소개하기에는 너무 방대하고, [스키마 디자이너](https://adaptivecards.io/designer/)를 이용하면 굉장히 손쉽게 적응형 카드를 만들 수 있다. 이를 이용해 로직앱에 들어갈 적응형 카드를 만들어 보면 대략 아래와 같다.

https://gist.github.com/justinyoo/4030dd4fa2f2875905c770d8013d6856?file=adaptive-card.json

위의 실행형 메시지 카드 포맷보다 훨씬 더 풍부한 표현력을 보여준다. 다르게 말하면 장황하다고도 할 수 있겠지만, 적응형 카드 포맷이 좀 더 나은 메시지 표현력을 갖는다는 것은 충분한 강점이라고 생각한다. 이렇게 만들어진 적응형 카드 포맷을 로직앱에 추가한 후 실행시키면 아래와 같은 메시지가 나타난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/two-ways-building-ms-teams-custom-connector-with-logic-apps-09.png)

앞서와 같이 웹훅을 직접 이용하는 것이 아니라 로직앱의 MS 팀즈 커넥터를 이용하는 것이라서 아이콘 모양이 달라졌고 메시지 하단에 봇에 관련한 추가적인 내용이 들어간 것이 보인다.

* * *

지금까지 로직앱을 통해 MS 팀즈로 메시지를 보내는 두 가지 방법에 대해 알아 보았다. 먼저 MS 팀즈의 커스텀 커넥터를 이용하면 레거시 포맷을 사용해야 하지만 내가 만든 봇이라는 것을 확실하게 알 수 있는 반면에, 커스텀 커넥터를 설정하지 않고 로직앱의 MS 팀즈 커넥터를 이용하게 되면 커스텀 커넥터를 만들 필요도 없고, 최신의 메시지 포맷을 사용할 수 있지만 내가 만든 봇을 사용할 수 없다는 단점도 있다.

또한 인증이나 보안 측면에 있어서 웹훅을 사용하게 될 경우 URL만 알면 누구나 해당 URL로 실행형 메시지 카드 포맷에 맞춰 메시지만 보내면 되기 때문에 만약의 경우 해당 URL이 노출되면 스팸 메시지 폭탄을 받을 확률이 생기는 반면, 로직앱 커넥터를 사용하게 되면 커넥터 연결시 인증을 하기 때문에 인가받지 않은 메시지는 보낼 수가 없으므로 보안의 측면에서는 훨씬 더 안전하다는 점도 있다.

이 두 가지 방법 중에 어떤 것을 선택할 지는 여러분의 몫이다.

## 읽어보기

- [레거시 실행형 메시지 카드 레퍼런스](https://docs.microsoft.com/ko-kr/outlook/actionable-messages/message-card-reference)
- [적응형 카드 스키마 레퍼런스](https://adaptivecards.io/explorer/)
