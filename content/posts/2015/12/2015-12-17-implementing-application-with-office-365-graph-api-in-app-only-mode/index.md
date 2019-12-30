---
title: "오피스 365 그래프 API를 사용자 인증 없이 직접 애플리케이션에서 사용하기"
date: "2015-12-17"
slug: implementing-application-with-office-365-graph-api-in-app-only-mode
description: ""
author: Justin Yoo
tags:
- Enterprise Integration
- App-only
- ASP.NET
- ASP.NET 5
- ASP.NET MVC 6
- Graph API
- Microsoft Graph
- O365
- Office 365
- Web API
fullscreen: false
cover: ""
---

최근 MS가 발표한 [Microsoft Graph](https://graph.microsoft.com)는 오피스 365 리소스들을 단일 엔드포인트를 통해 손쉽게 접근할 수 있도록 하여 애플리케이션에 손쉽게 통합할 수 있게 했다. 기존의 수많은 엔드포인트들을 하나로 통합했다는데 굉장한 의미를 둘 수 있겠다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-00.png)

이 Graph API를 타 애플리케이션에서 사용하려면 해당 애플리케이션을 반드시 [Azure 액티브 디렉토리 (AAD)](https://azure.microsoft.com/en-us/services/active-directory)에 등록해야 한다. 이 때, 이 애플리케이션이 어떤 방식으로 아주어 리소스들을 사용할 수 있는지 선택할 수 있다. 사실, 둘 중 하나를 선택할 수 있는데 하나는 Application Permission이고, 다른 하나는 Delegate Permission이다. 이중 후자를 보통 선택하게 되는데, 이렇게 하면 애플리케이션은 먼저 AAD에 로그인해서 인증을 먼저 받고, 그렇게 사용자별로 인증 받은 액세스 토큰을 이용해서 아주어의 리소스들을 이용할 수 있다. 그런데, 항상 그런 요구사항만 있는 것은 아니어서, 어떤 애플리케이션의 경우에는 사용자 인증을 받지 않고, 직접 아주어 리소스들에 접근할 수 있도록 해야 하는 경우도 있을 수 있다. 이걸 가리켜 `app-only` 모드라고 한다. 예를 들어, 백엔드 Web API 애플리케이션 같은 경우에는 굳이 사용자의 액세스 토큰이 필요가 없다. 물론, 프론트엔드 쪽에서 액세스 토큰을 헤더에 넘겨주면 되긴 하는데, 그 액세스 토큰이 반드시 아주어 리소스에 접근 가능한 토큰일 필요는 없기 때문이다.

인터넷에 올라와 있는 여러 문서들이나 튜토리얼들은 거의 대부분 사용자 인증 토큰을 이용해서 리소스에 접근하는 것들이고, 이러한 `app-only` 모델에 대한 설명은 거의 없다. 따라서, 이 포스트에서는 어떻게 `app-only` 모드로 애플리케이션을 AAD에 등록하고, 실제로 Graph API를 해당 앱을 통해서 이용할 수 있는지에 대해 간단하게 샘플 코드를 통해 알아보도록 한다.

> 여기에 쓰인 샘플 코드는 아래 링크에서 확인할 수 있다.
> 
> - [https://github.com/devkimchi/Graph-API-App-Only-Web-API-Sample](https://github.com/devkimchi/Graph-API-App-Only-Web-API-Sample)
> 
> 또한 이 샘플은 ASP.NET 5와 ASP.NET MVC 6로 만든 앱이어서 [Visual Studio 2015](https://www.visualstudio.com) 사용을 권장한다.

## 애플리케이션 등록

먼저 애플리케이션을 등록하자. Graph API를 사용하기 위해서는 반드시 AAD에 등록을 해야 한다. 아래 순서대로 등록을 하면 된다.

### AAD에 계정 생성하기

> 이미 계정이 있다면 생략해도 됨 **주의**: @outlook.com, @hotmail.com, @live.com 등과 같은 MS 계정은 사용할 수 없다.

AAD 테넌트에 속한 오피스365 계정을 생성한다. 그리고, 생성한 계정을 아주어 섭스크립션의 공동 운영자로 등록시켜야 한다.

### AAD에 애플리케이션 등록하기

- 계정을 만들었다면 [아주어 구 포탈](https://manage.windowsazure.com)에 접속한다. 아직까지 AD 관련 기능은 구 포탈에서만 사용할 수 있다.
- 액티브 디렉토리를 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-01.png)

- 새 애플리케이션을 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-02.png)

- `Add an application my organization is developing` 옵션을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-03.png)

- 애플리케이션 이름을 지정한다. 예) `Graph API App-only Sample` 그리고 `Web Application and/or Web API` 옵션을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-04.png)

- `https://(tenant-name)/GraphApiAppOnlySample`를 두 필드 모두 입력하자. 여기서 `(tenant-name)` 부분은 `contoso.onmicrosoft.com` 같은 형식일 것이다. 이 두 필드는 물론 `app-only` 모드에서는 쓰이지 않기 때문에 사실 아무렇게나 알아볼 수 있게만 넣으면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-05.png)

쟈, 이제 애플리케이션 등록이 끝났다. 참 쉽죠?

### 애플리케이션 설정

- 위와 같이 애플리케이션 등록이 끝났다면 이제 `configure` 탭을 클릭해서 설정 메뉴로 들어간다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-06.png)

- `Client ID` 값을 복사하여 따로 보관한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-07.png)

- 시크릿 키 역시 따로 복사하여 보관한다. 이 키 값은 아래 `Save` 버튼을 눌렀을 때만 보이고, 화면이 바뀌면 다시 보이지 않으므로 주의해야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-08.png)

- `Microsoft Graph` 애플리케이션을 추가한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-10.png)

- `Microsoft Graph`에 `"Read directory data"` 권한만 추가한다. 샘플 앱을 실행시키는 데는 이 권한이면 충분하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-11.png)

> 실제 서비스 환경에서는 **반드시** 적정한 수준의 권한만 주어야 한다. 그렇지 않으면 예상하지 못한 보안상의 결함이 발생할 수 있다.

이제 애플리케이션 설정이 끝났다.

### 샘플 애플리케이션 설정값 업데이트

이제 AAD에 등록한 애플리케이션의 설정이 모두 끝났고, 이 설정값을 샘플 Web API 애플리케이션에 적용할 차례이다. 우선 `appsettings.json` 파일을 열어 아래와 같이 수정한다.

https://gist.github.com/justinyoo/6cf1a84889c954bf84bd

- `Tenant`: `contoso.onmicrosoft.com` 값을 내 테넌트 이름으로 수정한다.
- `ClientId`: 아까 따로 저장해 놓은 Client ID 값으로 수정한다.
- `ClientSecret`: 아까 따로 저장해 놓은 시크릿 키 값으로 수정한다.
- `AppId`: `contoso.onmicrosoft.com` 값을 내 테넌트 이름으로 수정한다.

이제 샘플 애플리케이션 설정도 끝났다.

### IIS 또는 IIS Express에 루트 자가 서명 인증서 적용하기

> - 이 샘플 앱을 아주어에 직접 올려서 실행한다면 생략해도 좋다.
> - 자신의 컴퓨터에 자가서명 인증서가 이미 존재한다면 생략해도 좋다.

애플리케이션과 Graph API 사이의 모든 커뮤니케이션은 SSL/TLS 채널을 통해 이루어지기 때문에 샘플 앱은 **반드시** 루트 인증서로 서명 받아야 한다. 하지만, 개발자의 컴퓨터에서는 자가 서명 루트 인증서만으로도 충분하다. 만약 인증서가 없다면 아래와 같은 에러 메시지를 만나게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/graph-api-app-only-sample-12.png)

자가 서명 인증서를 적용하는 방법은 이전 포스트 [파워쉘을 이용하여 IIS 또는 IIS Express에 자가서명 루트 인증서 적용하기](http://blog.aliencube.org/ko/2015/12/11/applying-self-signed-certificate-for-iis-or-iis-express-with-powershell)를 참고하도록 한다.

### 샘플 애플리케이션 실행하기

이제 모든 설정이 끝났다. 비주얼 스튜디오 2015를 열어서 디버그 모드로 실행시켜 보도록 하자. 아무런 문제가 없다면 테넌트에 대한 정보가 JSON 포맷으로 보일 것이다. 어떻게 구현이 됐는지 코드 쪽을 살펴보도록 하자.

## ADAL을 이용한 액세스 토큰 취득

AAD로부터 액세스 토큰을 받아오기 위해서는 우선 `AuthenticationContext` 인스턴스를 만들어서 그 안의 메소드를 호출해야 한다. 해당 코드 스니펫은 아래에서 확인할 수 있다.

https://gist.github.com/justinyoo/40b18d2a61aef293db81

위에서 보는 바와 같이 `graphApp` 인스턴스는 `appsettings.json`에서 비직렬화 과정을 거쳐 만들어진 것이다. 이 `garphApp` 인스턴스를 통해서 `AuthenticationContext` 인스턴스와 `ClientCredential` 인스턴스가 만들어졌다. 여기서 눈여겨 보아야 할 부분은 이 `ClientCredential` 인스턴스가 오로지 `clientId` 값과 `clientSecret` 값만을 이용했을 뿐, 사용자의 인증 정보를 이용하지 않았다는 점이다. 다시 말하자면, 이 애플리케이션은 사용자의 인증 정보를 전혀 필요로 하지 않는다는 점이다. 이것이 이번 포스트의 핵심이 되겠다. 이제 실제 `GET` 메소드를 구현하는 부분을 들여다 보도록 하자.

https://gist.github.com/justinyoo/52c28375b1867b24f650

위의 코드 스니펫이 바로 액세스 토큰을 발급 받는 부분이다. `AuthenticationContext` 인스턴스가 `ClientCredential` 인스턴스를 사용해서 액세스 토큰을 받아온다. 이제 `authResult` 인스턴스가 만들어졌는데, 이는 액세스 토큰에 대한 정보를 담고 있다.

## 액세스 토큰을 이용한 Graph API 호출

이제 마지막 단계까지 왔다. 액세스 토큰을 확보한 상태이므로 이를 어떻게 Graph API 호출에 이용하는지 확인해 보도록 하자.

https://gist.github.com/justinyoo/913586550283cb6519fb

리퀘스트 헤더에 액세스 토큰을 담는다. 샘플 앱에서는 `organization`을 호출한다. 만약 [Fiddler](http://www.telerik.com/fiddler)를 사용한다면 요청과 응답에 대한 자세한 내용을 확인할 수 있다.

지금까지 샘플 Web API 애플리케이션을 이용해서 어떻게 `app-only` 모드로 등록하는지에 대해 알아 보았다. 또한 `app-only` 모드로 등록한 애플리케이션이 어떻게 사용자 인증 없이 직접 아주어 리소스들을 다루는지도 확인해 보았다. 앞서 언급한 바와 같이 이 샘플 애플리케이션은 오로지 필요한 권한만 최소한도로 허용해 놓았기 때문에 이를 수정해서 실제 서비스 코드로 활용하려면 반드시 적절한 권한을 부여해야 한다.
