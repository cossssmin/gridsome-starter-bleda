---
title: "게으른 MVP를 위한 컨트리뷰션 한 방 업로드 (feat. 애저 로직 앱)"
date: "2018-03-31"
slug: uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-logic-apps
- microsoft-mvp
fullscreen: false
cover: ""
---

전세계의 모든 MVP들은 오늘(3월 31일)까지 자신의 활동 내역을 정리해서 올려야 한다. 그러면 4월 1일부터 심사를 시작해서 7월에 갱신 여부를 알 수 있게 된다. 이제 3월도 중반을 넘어섰고, 이제 2주 정도 후면 컨트리뷰션 정리 기간이 끝난다. 아직까지 정리하지 못한 MVP를 위한 초간단 한 방 업로드! 두구둥... 말은 한 방 업로드라고는 하지만 최소한 엑셀 파일로 정리한 것은 있어야 한다.

## 미리 읽어두면 좋은 것

이 포스트는 사실 호주의 MVP인 [John Liu](https://twitter.com/johnnliu)가 쓴 [블로그 포스트](http://johnliu.net/blog/2018/3/how-to-automatically-enter-mvp-timesheets-with-microsoft-flow)를 참조했다. 원글에서는 블로그의 RSS 피드를 긁어 추가하는 내용이었는데, 이 포스트에서는 엑셀로 블로그 뿐만 아니라 다른 액티비티들도 정리한 후 한꺼번에 업로드하는 시나리오라고 생각하면 된다.

## 준비물

- 컨트리뷰션 정리한 엑셀 파일
- [마이크로소프트 원드라이브](https://onedrive.microsoft.com)
- [애저 섭스크립션](https://azure.microsoft.com)

## 엑셀 파일 정리

우선 엑셀 파일을 하나 만들어서 양식에 맞게 정리하면 편하다. 사용하기 편한 템플릿은 [여기](https://github.com/aliencube/MVP-Contributions-Update-for-Lazy-MVPs/blob/master/templates/contributions.template.xlsx)를 통해 다운로드 받을 수 있다.

양식을 다 채운 후에는 워크시트마다 하나씩 테이블을 만들어 놓는다. 엑셀 워크시트에 테이블을 지정하는 방법은 이 \[공식 문서\](https://support.office.com/ko-kr/article/excel-표-만들기-또는-삭제-e81aa349-b006-4f8a-9806-5af9df0ac664?ui=ko-KR&rs=ko-KR&ad=KR)를 참조한다.

## MVP API 등록키 받기

애저 로직 앱으로 등록하기 위해서는 컨트리뷰션 등록을 위한 API 키를 받아야 한다. [Microsoft MVP API 개발자 포탈](https://mvpapi.portal.azure-api.net/)에 접속한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-01.png)

그 다음 MVP 프로필에 접근할 수 있는 Microsoft Account를 이용해서 로그인한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-02.png)

로그인 후 `Products` 탭으로 이동해서 `MVP Production` 링크로 이동한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-03.png)

`MVP Production`으로 이동하면 API 키를 받을 수 있는 섭스크립션 메뉴가 있다. 아래 화면은 등록을 마치고 난 후에 보이는 화면이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-04.png)

아래 섭스크립션 링크를 타고 들어가면 아래 그림과 같이 섭스크립션 정보를 확인할 수 있다. 우리는 이제 Primary Key 값을 인증키로 사용할 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-05.png)

여기까지 해서 일차적으로 MVP API 섭스크립션을 마쳤다.

## 로직 앱 커스텀 커넥터 등록하기 – 첫번째

이 MVP API를 로직 앱에서 사용하기 위해서는 커스텀 커넥터를 등록해야 한다. 우선 애저 포탈로 접속해서 `Logic App Custom Connector`를 등록하기로 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-06.png)

필요한 정보를 아래와 같이 입력한다. 안타깝게도 현재 한국 리전에서는 커스텀 커넥터를 지원하지 않으므로 가장 가까운 일본 서부 쪽을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-07.png)

커스텀 커넥터를 생성하고 나면 아래와 같이 Swagger 정의 문서를 등록할 수 있다. 앞서 언급한 [John Liu](https://twitter.com/johnnliu)가 이미 만들어 둔 것이 있으니 그냥 그걸 [다운로드](https://github.com/justinyoo/flow/blob/master/MVP%20Production.swagger.json) 받아 사용하면 된다. 참고로 마지막 마무리는 내가 했음 ㅋ

다운로드 받은 후에 딱 한 줄을 아래와 같이 수정하도록 하자. 35번 라인에 보면 API 키를 입력하게 되어 있는데, 이걸 앞서 등록한 본인의 Primary Key 값으로 바꾸면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-08.png)

그렇게 수정한 Swagger 정의 문서를 방금 생성한 커스텀 커넥터에 등록하도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-09.png)

그 다음에 `Security` 탭으로 넘어가 보자. 앗, 추가 인증이 필요하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-10.png)

사실 MVP API를 사용하기 위해서는 두 개의 인증 키가 필요하다. 하나는 API Management 에서 제공하는 섭스크립션 키 – 이건 위에서 받았다. 또 하나는 Microsoft Account를 이용해 로그인한 계정의 OAuth 토큰. 이걸 직접 사용할 수 없으니 서비스 애플리케이션을 하나 등록해서 그걸 사용하도록 하자.

## Microsoft 앱 등록하기 – 첫번째

애저 액티브 디렉토리를 이용해서 Service Principal을 만드는 것과 같이 Microsoft Account를 이용해서는 [https://apps.dev.microsoft.com](https://apps.dev.microsoft.com/)에 접속해서 Service Principal을 만들어야 한다. 우측 상단의 `Add an app` 버튼을 클릭해서 만들 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-11.png)

Service Principal 등록을 마치면 아래와 같이 `Client ID`, `Client Secret` 값을 받을 수 있다. 이 둘을 잘 챙겨 놓도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-12.png)

## 로직 앱 커스텀 커넥터 등록하기 – 두번째

다시 로직 앱 커스텀 커넥터 화면으로 돌아와서 `Security` 탭을 보면 `Client Id`, `Client Secret` 값을 등록하게 되어 있다. 방금 위에서 챙겨 놓았던 값을 여기에 등록한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-10.png)

그리고 난 후 상단의 `Update Connector` 버튼을 클릭하면 아래와 같이 `Redirect URL` 필드에 값이 생성된 것을 볼 수 있다. 이 값을 복사해 두도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-13.png)

## Microsoft 앱 등록하기 – 두번째

앞서 복사해 놓았던 `Redirect URL` 값을 다시 Service Principal 등록하는 화면에서 아래와 같이 붙여 넣는다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-14.png)

여기까지 해서 일차적으로 로직 앱 커스텀 커넥터를 생성하는 것 까지 끝났다. 이제 본격적으로 로직 앱을 만들어 보도록 하자.

## 컨트리뷰션 등록용 로직 앱 만들기

이제 본 게임이다. 로직 앱은 기본적으로 워크플로우 엔진이므로 순서도를 생각하면 편하다. 대략의 순서도를 그려보면 아래와 같을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-15.png)

따라서, 워크플로우를 최대한 간결하게 작성하기 위해서는 적어도 세 개의 로직 앱을 만드는 것이 좋다.

1. 엑셀에서 데이터 읽어오는 로직 앱
2. 기존 데이터 읽어오는 로직 앱
3. 데이터 추가/수정하는 로직 앱

하나씩 만들어 보도록 하자. 개별 로직 앱은 그 자체만으로 충분히 돌아갈 수 있을 만큼 의존성을 배제하기 위해 HTTP 트리거로 만들기로 한다.

## 엑셀에서 데이터 읽어오기

우선 HTTP 트리거로 설정하고 POST 요청을 통해 들어오는 payload 구조를 정의한다. 파일 이름과, 경로, 테이블명을 받아서 해당 내용을 출력해 주는 식으로 구성할 수 있다. 따라서 대략의 payload 는 대략 아래와 같은 모양이 될 것이다.

```
{
  "filepath": "/Documents/mvp/contributions",
  "filename": "contributions.template.xlsx",
  "tableName": "Blogs"
}

```

이 샘플 payload를 붙여 넣으면 로직 앱 디자이너에서 자동으로 아래와 같은 JSON 스키마를 만들어 준다.

```
{
  "properties": {
    "filename": {
      "type": "string"
    },
    "filepath": {
      "type": "string"
    },
    "tableName": {
      "type": "string"
    }
  },
  "type": "object"
}

```

이제 OneDrive에 있는 파일을 검색해야 한다. 그러기 위해서는 `OneDrive - Find files in folder` 액션을 선택한 후 아래와 같이 입력한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-16.png)

이렇게 하면 OneDrive 에서 할당한 파일의 고유 파일명을 알 수 있다. 이 파일명을 이용해서 엑셀 파일에 지정된 테이블명을 찾아야 한다. 이 때 `Excel Online (One Drive) - Get tables` 액션을 이용하면 쉽게 엑셀 파일의 모든 테이블을 찾을 수 있다. 아래 그림에서 보이는 함수는 `first(body('FindFiles'))?['Id']`이다. 이 액션은 바로 이어서 설명할 액션에서 필요한 테이블의 ID값을 알아내기 위해서 필요하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-17.png)

다음으로 찾아낸 테이블에 기록된 모든 컨트리뷰션을 읽어들여야 한다. 이 때는 `Excel Online (One Drive) - List rows present in a table` 액션을 이용한다. 마찬가지로 File 필드에는 `first(body('FindFiles'))?['Id']` 펑션을, Table 필드에는 방금 찾아낸 ID 값을 `first(body('GetTable'))?['id']`와 같은 형태로 입력한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-18.png)

이렇게 한 후 마지막에 `Response` 액션으로 마무리하면 이 로직앱은 끝. 실제로 포스트맨을 통해 이 로직 앱을 실행시켜 보면 아래와 같은 응답을 얻을 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-19.png)

## 기존 데이터 읽어오기

이번에는 기존 컨트리뷰션 데이터를 읽어오는 로직 앱을 만들어 보자. MVP API의 한계상, 특정 일자 이후로만 데이터를 읽어들이는 것이 불가능하므로, 무조건 전체 컨트리뷰션을 다 읽어들여야 한다. 따라서, 먼저 전체 컨트리뷰션 수를 알아낸 후, 그걸 바탕으로 총 컨트리뷰션을 읽어내는 식으로 구성해 보도록 하자.

시작은 역시 HTTP 트리거이다. 여기서는 딱히 payload가 필요할 일이 없으므로 그냥 단순한 GET 트리거로 만들기로 하자. 다음에는 MVP API 중 `Get contributions` 액션을 호출한다. 이 때 Microsoft Account로 로그인하라는 창이 뜨니 당황하지 말고 로그인하면 된다. 그리고 offset 필드에는 `0`, limit 필드에는 `1`을 입력하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-20.png)

동일한 액션을 하나 더 추가한다. 대신, 이번에는 offset 필드에 `0`, 그리고 limit 필드에 `TotalContributions` 값을 아래와 같이 입력한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-21.png)

이렇게 함으로써, 지금까지 시스템에 입력된 모든 컨트리뷰션을 뽑아냈다. 사실, 여기서 날짜 필터링을 추가하면 이 컨트리뷰션 리스트를 바탕으로 좀 더 추려낼 수 있긴 하지만, 여기서는 고려하지 않았다. 포스트맨을 통해 테스트를 해 보면 아래와 같은 결과를 얻을 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-22.png)

## 컨트리뷰션 업로드하기

이제 앞서 작성한 모든 것을 하나로 우겨 넣는 로직 앱을 만들 차례이다. 동일하게 HTTP 트리거로 시작하면서 위에서 정의한 payload를 이용한다. 그리고 추가 HTTP 액션을 통해 앞서 작성한 로직 앱들을 호출한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-23.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-24.png)

이후 엑셀 파일에서 읽어온 컨트리뷰션 레코드를 루프로 돌리면서 기존 데이터와 중복되는 것이 있는지 검사한 후 있으면 업데이트, 없으면 추가하는 로직을 아래와 같이 작성한다. 여기서 필터링에는 `Activitytype`, `URL`, `TitleOfActivity` 값이 같으면 동일한 컨트리뷰션으로 가정했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-25.png)

그리고, 아래는 기존 레코드를 찾았을 때 업데이트, 못 찾았을 때 신규 추가하는 로직이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-26.png)

이렇게 해서 이 로직 앱을 아래와 같은 payload를 줘서 돌리면 손쉽게 컨트리뷰션을 업데이트 할 수 있다. 실제로 포스트맨을 통해 데이터를 흘려보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/03/uploading-contributions-via-logic-apps-for-super-duper-procrastinating-mvps-27.png)

이렇게 해서 모든 컨트리뷰션이 정리됐다.

완전체 소스코드를 보고 싶다면 [MVP Contributions Update for Lazy MVPs](https://github.com/aliencube/MVP-Contributions-Update-for-Lazy-MVPs) 여기를 클릭해서 읽어보면 된다.
