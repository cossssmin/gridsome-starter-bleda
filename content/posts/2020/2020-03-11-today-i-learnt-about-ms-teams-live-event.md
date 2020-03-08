---
title: "MS 팀즈로 라이브 이벤트 진행할 때 알아두면 좋을 것들"
slug: today-i-learnt-about-ms-teams-live-event
description: "이 포스트에서는 Microsoft Teams를 이용해 라이브 스트리밍을 할 때 원활한 진행을 위해 알아두면 좋을 것들에 대해 정리해 봅니다."
date: "2020-03-11"
author: Justin-Yoo
tags:
- microsoft-teams
- live-events
- checklists
- til
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/today-i-learnt-about-ms-teams-live-event-00.png
fullscreen: true
---

지난 [3월 5일][live event announcement]에 [Microsoft Teams][ms teams]를 이용해서 [라이브 스트리밍][live event]을 진행했다. 어디서 듣보잡이 일주일만에 급하게 계획하고 홍보하고 진행했던 것 치고는 140명이나 참석한 이벤트여서 개인적으로는 꽤나 성공적이었다고 평가하고 싶다. 그런데, 여러 발표자가 각자의 장소에서 원격으로 붙어서 발표하는 형태의 라이브 이벤트를 처음으로 [Microsoft Teams][ms teams]를 이용해 진행하려다 보니 초기 셋업이 혼란스러웠다. 따라서 라이브 이벤트를 위해 몇 가지 알고 있으면 굉장히 도움이 될 만한 것들을 정리 차원에서 포스트를 써 볼까 한다.


## 가상 시나리오 ##

> **DISCLAIMER**: 이 포스트에서 나오는 모든 회사 및 발표자 이름은 가상입니다. 혹시 실제 이름이 겹친다고 해도 이는 우연일 뿐 의도한 것이 아닙니다.

Mallee Bulls Fitness(MBF) 라는 프랜차이즈 피트니스 클럽에서 라이브 웨비나를 열어 건강 관련 상식을 공유하려고 한다. MBF는 아주 유명한 영양사인 김지영씨를 초빙해서 발표를 하려고 하는데, 어떻게 하는 것이 가장 좋을까?

* Mallee Bulls Fitness는 Office 365 테넌트를 malleebullsfitness.com 이라는 이름으로 하나 사용중이다.
* 김지영씨는 kim@jiyeong.com 이라는 이메일 주소를 쓰고 있다.


## Microsoft Teams로 라이브 이벤트를 진행하는 방법 #

이 자체는 딱히 이 포스트에서 다루지는 않을 예정이다. 이미 [문서화][ms teams live events]가 충분히 되어 있으므로 이를 바탕으로 진행하면 된다. 다만 아래 다루는 내용은 각자의 관점에서 놓치기 쉬운 것들에 대해 정리한 것이다.


## 조정자(Producer) 관점 ##

누구나 참석해서 시청할 수 있는 [라이브 이벤트][ms teams live events]를 계획한다면 해당 이벤트는 반드시 "모든 사용자" 모드로 지정해야 한다. "모든 사용자" 모드에서만 외부인이 익명으로 라이브 이벤트에 참석할 수 있기 때문이다. 민약, 이 모드를 지정할 수 없는 상황이라면 관리자에게 이 부분에 대한 [정책을 조정][ms teams live events setup]해 달라고 요청해야 한다. 관리자는 전사 정책을 조정하든 별도의 정책을 만들고 특정 그룹 혹은 사용자에게 그 정책을 할당하든 해서 "모든 사용자" 모드를 사용할 수 있게끔 만들어 줘야 한다.

회사 입장에서 김지영씨는 손님(Guest)이다. [라이브 이벤트][ms teams live events]에서 조정자(Producer) 혹은 발표자(Presenter) 역할을 하려면 반드시 해당 테넌트에 등록이 되어 있어야 한다. 직원이야 이미 테넌트에 계정이 있으니 상관 없겠지만, 김지영씨 같은 경우는 손님이므로 반드시 김지영씨 본인 이메일을 손님으로 먼저 등록시켜 [테넌트로 인증][ms teams live events planning]시켜야만 발표자가 될 수 있다.


## 발표자(Presenter) 관점 ##

발표자는 자신의 발표자료를 화면으로 공유하고 싶다면, 웹 브라우저를 쓸 수 없고, 대신 데스크탑 애플리케이션을 설치해야 한다. 그리고, 애플리케이션에 로그인해야 한다. 만약 jiyeong.com 이라는 도메인도 Office 365의 테넌트라면, [Microsoft Teams][ms teams]에서 jiyeong.com 테넌트와 Mallee Bulls Fitness 테넌트 둘 다 보일텐데, 이 때 Mallee Bulls Fitness 테넌트로 들어와 있어야 한다. 그렇지 않으면 발표자 모드로 전환되지 않는다. 최초 로그인 후에는 자신의 기본 설정 테넌트로 접속하지 손님으로 설정되어 있는 테넌트에 접속하지 않는다. 따라서 이 부분을 직접 확인하게끔 조정자는 발표자에게 안내를 해 줘야 한다.

발표자는 발표가 끝난 후 자신의 손님 계정과 관련해서 두 가지 옵션 중에 하나를 선택할 수 있다.

1. **테넌트에 계속 손님 계정을 남겨둘 것인가**: 이 때는 큰 문제가 없다. 다만 회사의 정책상 개인 정보 이슈 부분이 있을 수 있으니 조정자는 보안 담당자와 상의해서 남겨둘 지 아닐지를 결정해야 한다. 만약 손님 계정을 남겨둘 수 없다면 아래 2번 항목을 참조한다.
2. **테넌트에서 탈퇴할 것인가**: 이 때 보통 조정자는 관리자가 아니기 때문에 등록된 손님 계정을 임의로 삭제할 수 없다. 따라서, 조정자는 발표자에게 [이 문서][aad guest leaving]를 안내하고 발표자는 직접 [애저 포탈][az portal]을 이용해서 탈퇴해야 한다.


## 참석자(Attendee) 관점 ##

참석자는 그다지 제약사항이 없다. 다만 데스크탑에서 링크를 통해 접속하는 경우에는 앱과 웹 둘 다 사용 가능하지만, 핸드폰이나 타블렛으로 접속하는 경우에는 웹 브라우저를 사용할 수 없고 앱을 설치해야만 한다. 앱을 사용하면 채팅에도 참여할 수 있다. 웹 브라우저를 이용할 경우 질문/답변에는 참여할 수 있지만 채팅에는 참여할 수 없다.


## 조정자와 발표자간 베스트 프랙티스 ##

* **기술 리허설**: 실제 라이브 이벤트가 진행되기 전에 충분한 시간을 들여 조정자와 발표자간 기술 리허설을 진행하는 것이 좋다. 여러 가지 이유로 장비들 간 궁합이 맞지 않는다거나 하는 경우가 발생할 수도 있고, 권한 문제라든가 하는 것들도 생길 수 있기 때문에 사전에 미리 체크해 두는 것이 바람직하다.
* **최종 리허설**: 행사 당일 시작 한 30분쯤 전에 조정자와 발표자는 이미 [Microsoft Teams][ms teams]에 모여서 최종적으로 세팅을 조정하는 것이 좋다. 라이브 이벤트의 특성상 언제 무슨 일이 일어나도 이상하지 않기 때문에 최대한 많은 부분에 대비를 해야 한다.

---

지금까지 [Microsoft Teams][ms teams]를 이용해서 [라이브 이벤트][ms teams live events]를 진행할 때 원활한 진행을 위해 알아두면 좋을 만한 내용들을 조정자, 발표자, 참석자 관점에서 살펴봤다. 어쩌면 내가 경험하지 못했던 다른 문제가 있을 수도 있다. 나중에라도 그런 부분을 찾는다면 추가하기로 하고 여기서 맺도록 한다. 향후 [라이브 이벤트][ms teams live events]를 진행하려는 분께 조금이라도 도움이 되길 바란다.

[live event]: https://aka.ms/ac/github-actions-in-30-mins/live
[live event announcement]: https://www.facebook.com/events/213280516716653/

[ms teams]: https://products.office.com/ko-kr/microsoft-teams/group-chat-software?WT.mc_id=aliencubeorg-blog-juyoo
[ms teams live events]: https://docs.microsoft.com/ko-kr/microsoftteams/teams-live-events/what-are-teams-live-events?WT.mc_id=aliencubeorg-blog-juyoo
[ms teams live events planning]: https://docs.microsoft.com/ko-kr/microsoftteams/teams-live-events/plan-for-teams-live-events?WT.mc_id=aliencubeorg-blog-juyoo
[ms teams live events setup]: https://docs.microsoft.com/ko-kr/microsoftteams/teams-live-events/set-up-for-teams-live-events?WT.mc_id=aliencubeorg-blog-juyoo

[aad guest leaving]: https://docs.microsoft.com/ko-kr/azure/active-directory/b2b/leave-the-organization?WT.mc_id=aliencubeorg-blog-juyoo

[az portal]: https://azure.microsoft.com/ko-kr/features/azure-portal/?WT.mc_id=aliencubeorg-blog-juyoo
