---
title: "로직앱/플로우를 이용해서 이메일 필터링 규칙 강화하기"
date: "2019-08-21"
slug: enriching-mail-filtering-rules-by-logic-apps
description: ""
author: Justin Yoo
tags:
- Enterprise Integration
- Azure Logic Apps
- Email
- Filtering
- Office 365
- Outlook
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-00.png
---

[아웃룩](https://outlook.com)이나 [오피스365 메일](https://outlook.office.com)을 쓰다 보면 항상 고민인 것이 메일 필터링 규칙이 조금 더 나아졌으면 좋겠다는 생각이 많이 든다. 특히나 멀쩡한 이메일이 스팸메일로 분류되는 경우도 [지메일](https://gmail.com)에 비해 상당히 많아서, 이런 저런 고민을 하면서 어떻게 하면 좀 더 손쉽게 이 문제를 해결할 수 있을까 하는 방법을 찾아봤다. 개인적으로는 이메일을 받는 즉시 받은 편지함 아래 별도로 폴더를 만들어 분류하는 방법을 선호하는데, 이럴 경우 필터링 규칙을 걸어 자동으로 분류되게 하는 방법을 써 보면 대략 절반 정도만 걸러지고 나머지는 여전히 수작업으로 해결해야 했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-01.jpg)

아웃룩 혹은 오피스365 사용자에게는 [MS 플로우](https://flow.microsoft.com)이라는 서비스를 무료로 제공한다. [무료 플랜](https://flow.microsoft.com/ko-kr/pricing/?currency=KRW)의 경우 월간 750회 무료 실행시킬 수 있어서 사용하기에 편리하다. 만약 애저 구독이 있다면 [로직앱](https://azure.microsoft.com/ko-kr/services/logic-apps/)을 이용해도 좋다. 이 플로우 또는 로직앱을 이용해서 이메일 필터링 규칙을 상당한 수준으로 강화시킬 수 있다. 이 포스트에서는 아웃룩 이메일 계정으로 들어오는 메일들을 필터링해서 원하는 폴더로 이동시키는 과정을 로직앱으로 만들어 보도록 한다.

## 사용자 시나리오

마이크로소프트 MVP로서 활동을 하다보면 마이크로소프트 내 제품/서비스 개발 팀과 정보를 공유하고 피드백을 주고 받게 된다. 이 때 다양한 메일링 리스트를 사용하게 되는데, 각각의 메일링 리스트에서 도착하는 이메일들을 지정한 폴더로 분류하고 싶다. 예를 들어 애저 서비스 관련 메일링 리스트는 Azure 폴더로, 닷넷 관련 메일링 리스트는 .NET 폴더로 자동으로 분류해서 보내는 식이다.

## 가정

위에 언급한 시나리오를 로직앱에서 처리하고자 할 때 몇 가지 가정을 할 것이 있다.

1. 나는 아웃룩 (outlook.com) 무료 이메일 주소를 사용한다.
2. 나는 분류하고자 하는 이메일 주소의 리스트를 갖고 있다.
3. 나는 각 이메일 주소에 대응하는 폴더의 리스트를 갖고 있다.
4. 모든 이메일은 `받은 편지함`으로 들어온다.

## 폴더별 고유 ID 찾기

아웃룩의 폴더는 각각 고유 ID 값을 갖고 있다. 이는 주소창에서 볼 때 암호화가 되어 있는 문자열이어서 손쉽게 기억할 수가 없다. 대신, 모든 폴더는 [Microsoft 그래프](https://developer.microsoft.com/en-us/graph)를 통해 알아낼 수 있다. 또한 웹 기반의 [그래프 탐색기](https://developer.microsoft.com/en-us/graph/graph-explorer)를 이용하면 손쉽게 API를 이용할 수 있다. 여기서는 이 그래프 탐색기를 통해 필요한 폴더 ID를 찾아보기로 하자.

먼저 그래프 탐색기로 접속을 하면 아래와 같은 화면이 나타난다. 좌측 상단의 로그인 버튼을 통해 본인의 Microsoft 계정으로 접속한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-02.png)

로그인을 하면 앱을 등록한다는 화면과 함께 권한 설정 확인 창이 나타난다. 수락을 하고 나면 아래와 같이 좌측 상단이 내 프로필로 바뀐다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-03.png)

현재 그래프 API 버전은 `1.0`과 `beta`가 있다. 우리가 원하는 API는 어느 버전이든 차이가 없으니 그냥 `1.0` 버전을 선택한다. 그리고 [이 문서](https://docs.microsoft.com/en-us/graph/api/user-list-mailfolders?view=graph-rest-1.0&tabs=http)에 나온 API 엔드포인트를 이용해 내 `받은 편지함` 아래의 모든 폴더를 찾아낸다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-04.png)

> 이 API는 `받은 편지함`의 바로 아래에 있는 폴더만 찾아준다. 만약 폴더 아래의 모든 서브 폴더를 트리 구조로 찾아내려면 이 과정을 몇 번 더 반복해야 한다.

실제로 내가 필요한 값은 `id` 값 하나면 충분하지만, 편의를 위해 `id` 값과 `displayName` 값을 배열로 받아두고, 그 결과는 대략 아래와 같다.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=lookup-references.json

이 배열에 메일링 리스트의 이메일 주소를 추가해서 실제 로직앱에서 검색을 위한 기본 값으로 사용할 계획이다. 아래와 같이 `email`을 넣어 배열을 수정한다. 또한 `id` 대신 `folderId`로 알기 쉽게 수정한다.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=lookup-references-updated.json

이렇게 폴더 검색을 위한 준비는 끝났다. 이제 실제로 로직앱을 만들어 보자.

## 이메일 필터링 로직앱 작성

가장 먼저 빈 로직앱 인스턴스를 생성한다. 안타깝게도 아직까지는 로직앱이 한국 지역을 지원하지 않으므로 가장 가까운 일본 서부 (Japan West) 또는 홍콩 (East Asia), 싱가폴 (Southeast Asia) 지역을 선택한다. 그렇게 만들어진 인스턴스에 아래와 같이 `outlook.com` 트리거 중 `When a new email arrives`를 선택한다. 그리고, 폴더는 `Inbox`로 지정하고 나머지는 기본값으로 둔다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-05.png)

이제 이 로직앱이 저장되는 시점 이후로 `받은 편지함`에 도착한 모든 이메일에 대해 이 로직앱이 실행된다. 이제 워크플로우 액션을 지정해 보자. 먼저 앞서 만들어둔 참조 배열을 로직앱 내부의 변수에 저장한다. 이 예제에서 변수 이름은 `FolderLookupReferences`로 했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-06.png)

이제 도착한 이메일의 수신자를 배열로 만들 차례이다. 수신자는 수신자(To)와 참조자(Cc) 모두 포함하므로 아래와 같이 액션을 추가한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-07.png)

위 그림의 실제 수식은 대략 이렇다. 각 함수에 대해서는 별도로 설명하지 않겠지만, 아래 액션 코드를 보면 대략 어떤 식으로 수신인 이메일 주소를 배열로 변환하는지에 대해 알 수 있을 것이다.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=get-all-recipients.json

이제 레퍼런스 배열에서 실제 이메일 수신자를 가려내는 액션을 추가한다. 아래 필터 액션은 `From` 필드에 레퍼런스 배열을 넣고 수신자 메일 주소가 레퍼런스 배열에 포함되어 있는지 여부를 체크한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-08.png)

위 액션의 코드 부분은 대략 아래와 같다.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=filter-recipients.json

만약 필터링을 한 결과 찾는 이메일이 없을 경우에는 더이상 이 워크플로우를 실행시킬 필요가 없으므로 여기서 끝내게 한다. 이는 `If` 액션과 `Terminate` 액션의 조합으로 아래와 같이 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-09.png)

위 액션에 대응하는 코드는 대략 아래와 같다.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=stop-processing-if-filter-returns-empty.json

이 조건문을 통과했다면 방금 도착한 이메일이 실제 내가 구독하는 메일링 리스트에 포함된다는 뜻이므로 이제 해당하는 메일링 리스트와 폴더를 걸러내야 한다. 앞서 필터링한 액션은 배열을 반환하므로 아래 액션을 통해 첫번째 배열값을 가려낸다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-10.png)

위 코드는 대략 아래와 같다.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=take-the-first-recipient.json

이메일 주소에 대응하는 폴더 값을 알았으니 이제 실제로 받은 이메일을 해당 폴더로 이동시켜보자. 이것이 이 워크플로우의 마지막 액션이다. 아래와 같이 `Message ID` 필드와 `Folder` 필드를 지정한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-11.png)

위 액션은 아웃룩 커넥터를 통한 API 호출이므로 대략 아래와 같은 코드 모양이 될 것이다.

https://gist.github.com/justinyoo/b0865f6d2b7c42645e2e8a2058a0de1f?file=move-email-to-designated-folder.json

이렇게 로직앱 워크플로우 구성을 끝마쳤다. 이제 이 워크플로우는 자동으로 이메일이 `받은 편지함`에 들어오는 순간 작동해서 지정한 폴더로 모든 이메일을 보내거나 등록한 이메일이 아닐 경우 그냥 처리하지 않고 그대로 두거나 할 것이다. 실제로 실행시킨 결과는 대략 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-12.png)

그리고 내 메일 계정의 `받은 편지함`은 참 깨끗해졌다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/enriching-mail-filtering-by-logic-apps-13.png)

* * *

지금까지 로직앱을 이용해서 이메일 필터링 규칙을 좀 더 보강하고, 그 결과에 따라 받은 이메일들을 원하는 폴더로 이동하는 방법에 대해 알아 보았다. 사실 이런 부분들이 어찌 보면 별 것 아닌 것 같지만 굉장한 생산성 향상에 도움이 된다. 이 포스트에서는 로직앱을 사용했지만, 이 모든 것은 플로우에서도 동일하게 적용시킬 수 있다.

만약 이메일 정리에 어려움을 느끼고 뭔가 자동화할 필요성을 느낀다면 위에 논의한 방법을 한 번 적용해 보는 것도 나쁘지 않을 것이다.
