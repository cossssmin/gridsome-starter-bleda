---
title: "웹훅 기능을 테스트 하기 좋은 도구들 소개"
date: "2017-06-02"
slug: tools-for-testing-webhooks
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- API
- Test
- Integration Test
- Webhook
fullscreen: false
cover: ""
---

마이크로서비스 환경에서는 API로 메시지를 주고 받게 마련이다. 이런 API는 단순히 요청(Request)을 던져서 응답(Response)을 기다리는 방식이 대부분이지만 좀 더 긴 처리시간을 필요로 하는 경우도 있을 수 있고, 하나의 워크플로우 안에서 특정 기간 동안 아예 멈춰있다가 특정 신호를 받으면 다시 작동하는 경우도 있다. 이런 경우는 대부분 타임아웃 때문에 HTTP 프로토콜 위에서는 요청과 응답으로 처리하기가 힘들다. 이럴 때 보통 도입하는 패턴이 두 가지가 있다. 하나는 비동기 패턴이고 다른 하나는 웹훅 패턴이다. 이 둘은 서로 비슷하기도 해서 같이 쓰이기도 하는데, 모두 전형적인 HTTP 기반의 REST API에서 겪는 타임아웃 에러를 극복하기 좋은 장점이 있다. 하지만 반대로 이 방법은 디버깅 혹은 테스트하기가 까다로운 편이다. 이 포스트에서는 REST API에서 웹훅을 구현할 때 로컬 개발 환경에서 테스트하기 좋은 도구를 두어가지 소개해 보기로 한다.

## RequestBin

[RequestBin](https://requestb.in/)은 온라인 기반의 웹훅 요청 데이터 확인 도구이다. 굉장히 간단한 사용자 인터페이스를 갖고 있어서 사용하기에도 편리하다. 사용 방법은 다음과 같다.

1. 첫 화면에서 `Create a RequestBin` 버튼을 클릭한다. ![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-01.png)
    
2. 그러면 아래와 같이 임시 URL이 하나 생긴다. ![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-02.png)
    
3. 이 임시 URL을 웹훅 URL로 사용해서 요청을 보낸다. 아래는 포스트맨을 이용해서 보내는 모습이다. ![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-03.png)
    
4. 이렇게 보낸 HTTP 요청은 위에 만든 Bin에서 아래와 같이 확인이 가능하다. 스크린샷에서 보는 바와 같이 임시 URL이 `https://requestb.in/1fbhrlf1` 이었다면 `?inspect` 쿼리스트링 파라미터를 뒤에 붙여서 확인하면 된다. 내가 보낸 HTTP 요청 데이터가 그대로 보이는 것을 확인할 수 있다. ![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-04.png)
    

이 서비스를 이용하면 좋은 점이 몇 가지가 있다. 우선 어딘가에 웹훅을 등록할 때 이 Bin URL을 이용하면 된다. 그러면 그쪽에서 이 웹훅을 통해 어떤 요청을 보내면 요청 데이터가 바로 여기에 그대로 기록된다. 이 데이터를 분석하면서 내 쪽에서 어떤 식으로 데이터를 처리해야 하는지 굳이 테스트용 애플리케이션을 만들어서 배포할 이유가 없다. 즉, 애플리케이션 개발을 위한 인력과 시간을 절약할 수 있다. 게다가 무료 서비스이다!!

물론, 단점도 있다. 무료인 만큼 해당 Bin URL의 유효기간이 있다. 웹사이트에서는 48시간 동안만 유효하다고 하는데 실제로 해보면 어쩔 땐 5분만에 사용 불가능한 URL로 바뀌기도 한다. 또한 브라우저를 닫았다 다시 열면 해당 Bin URL은 더이상 사용할 수 없다. 즉, 이 서비스를 이용하기 위해서는 빨리 체크해보고 치워 버리는 형태의 테스트만 가능하다는 게 가장 큰 단점이다. 또한 로컬 개발 환경에서 디버깅을 하기 위한 용도로는 적절하지 않다. 외부에서 요청을 받아 해당 메시지를 기반으로 내쪽에서 처리하는 로직이 분명히 있을텐데, 이 RequestBin으로는 이러한 디버깅 기능을 이용할 수 없다.

그렇다면 내 로컬 개발 환경에서 웹훅을 테스트 혹은 디버깅하기 위한 방법은 무엇이 있을까?

## ngrok

[이 포스트](https://www.sitepoint.com/accessing-localhost-from-anywhere/)에서는 외부 인터넷에서 로컬 개발 환경으로 접속할 수 있게끔 해주는 터널링 도구를 소개하고 있는데, 여기서는 그 중 [ngrok](https://ngrok.com/)이라는 도구를 이용해 보도록 하자. 무료 버전과 상용 버전이 있는데, 무료 버전만으로도 충분히 사용 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-05.png)

다양한 플랫폼을 지원하므로, 본인의 OS에 맞는 바이너리를 다운로드 받아 사용하면 된다. 윈도우의 경우에는 `ngrok.exe` 파일 달랑 하나만 있다. 이를 `C:\ngrok` 폴더에 옮겨놓고 아래와 같이 커맨드 프롬프트에서 커맨드를 입력하면 된다.

```
ngrok http 7071 -host-header=localhost

```

- `http`: HTTP 프로토콜로 들어오는 트래픽만을 검색한다.
- `7071`: 포트 번호이다. 로컬에서 디버깅하는 Azure Functions의 경우 이 포트 번호를 사용하다.
- `-host-header=localhost`: 이 옵션을 주어야 내 로컬 디버깅 환경으로 요청 데이터가 들어오는 것을 확인할 수 있다. 이 옵션이 없다면 ngrok 까지는 트래픽이 도착하지만, 내 디버깅 환경까지는 들어오지 못한다.

위와 같이 명령어를 입력해 보면 아래와 같은 결과 화면을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-06.png)

외부에서 `http://b46c7c81.ngrok.io`로 접속하면 내 로컬 개발 환경에서 현재 디버깅 모드로 돌아가는 애저 펑션 앱에 접근이 가능하게 된다. 실제로 애저 펑션 앱을 로컬 개발 환경에서 디버깅 모드로 실행시켜 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-07.png)

이제 포스트맨을 실행시켜 ngrok에서 만들어준 주소로 요청을 날려보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-08.png)

디버깅 브레이크 포인트를 걸어놓은 곳에서 정확하게 멈춘 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-09.png)

ngrok은 리플레이 기능도 제공하는데 `http://localhost:4040`으로 접속해 보면 현재까지 ngrok이 임의로 만들어 준 URL인 `http://b46c7c81.ngrok.io`로 어떤 요청이 들어왔는지를 모두 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/tools-for-testing-webhooks-10.png)

물론 ngrok 실행을 끝낸 후 다시 실행시키면 해당 주소도 바뀔 뿐더러 기존의 히스토리는 남아있지 않다. 무료 버전의 제약으로 보이지만, 큰 문제는 되지 않는다.

지금까지 웹훅 디버깅을 위한 몇 가지 도구를 살펴 보았다. 다양한 환경에서 웹훅 내지는 일반적인 형태의 API 요청이 어떤 식으로 이루어지는지 확인하기가 아주 편해지므로 여유가 된다면 꼭 사용해 보길 바란다.

> 참고: 본인은 저 서비스와 아무 관계도 없습니당~
