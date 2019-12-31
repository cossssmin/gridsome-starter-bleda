---
title: "홀로렌즈 영상 스트리밍"
date: "2016-08-19"
slug: hololens-streaming
description: ""
author: Justin-Yoo
tags:
- windows-mixed-reality
- hololens
- streaming
fullscreen: false
cover: ""
---

회사에서 홀로렌즈를 던져주는 바람에 운 좋게도 이것저것 만져볼 수 있는 기회가 생겼다. 덕분에 지난번 멜번 개발자 밋업에서 발표할 거리도 생겼으니 일석이조. 발표를 하면서 홀로렌즈 데모를 해야 하는데 실제로 내가 보는 영상이 어떤 것인지 사람들에게 보여줄 필요가 있다. 이 포스트에서는 홀로렌즈의 영상을 웹 브라우저로 스트리밍하는 방법에 대해 간단하게 정리해 보고자 한다.

## 개발자 포탈 활성화

우선, 홀로렌즈를 구동시킨 다음 개발자 모드를 활성화 시켜야 한다. 아래와 같이 `Settings` 화면으로 들어간다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-01.png)

그리고 나서 `Updates & Security` 화면으로 이동한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-02.png)

좌측 하단의 `For Developers` 메뉴를 탭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-03.png)

여기서 개발자 모드를 활성화 시킨다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-04.png)

그리고 화면 아래로 이동하면 `Device Portal` 이라는 메뉴가 생기는데 이를 활성화 시킨다. 이렇게 하면 내 컴퓨터의 웹 브라우저에서 직접 홀로렌즈로 접속할 수 있게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-05.png)

여기까지 왔다면 우선 기본적인 웹 브라우저 접속 환경 설정은 끝난 셈이다. 홀로렌즈가 사용하는 내부 IP 주소를 알면 곧바로 브라우저에서 접속할 수 있다. 다시 `Settings` 화면으로 이동해서 `Network & Internet` 메뉴를 탭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-06.png)

`Wi-Fi` 화면에서 `Advanced Options`를 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-07.png)

현재 홀로렌즈가 사용하고 있는 IP 주소를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-08.png)

이제 홀로렌즈의 IP 주소가 `192.168.1.6`라고 알아냈으니 웹 브라우저를 통해 접속해 보자. `https://192.168.1.6` 으로 접속하면 인증서 오류가 발생한다. 무시하고 진행하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-09.png)

그러면 위와 같이 홀로렌즈 웹 포탈을 확인할 수 있다. 웹 브라우저로 스트리밍을 하려면 사용자 등록을 해야 한다. 위 화면 상단의 `Security` 메뉴를 클릭해서 사용자 등록을 시작한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-10.png)

위 화면에서 볼 수 있다시피 `Request PIN` 버튼을 클릭한다. 그러면 아래와 같이 화면에 PIN 번호가 나타나는 것을 확인할 수 있다. 웹 브라우저에 PIN 번호를 적고 사용자를 등록한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-11.png)

사용자 등록이 끝났다!

> 지금까지 진행한 내용에 대해 더 자세히 알고 싶다면 [홀로렌즈 공식 문서](https://developer.microsoft.com/en-us/windows/holographic/using_the_windows_device_portal)를 참조한다.

## 홀로렌즈 영상 스트리밍

이제 사용자 등록도 끝났고 실제 스트리밍을 시도해 보도록 하자. 홀로렌즈는 [`Mixed Reality Capture (MRC)`](https://developer.microsoft.com/en-us/windows/holographic/using_mixed_reality_capture)라는 도구를 내장하고 있어서 이를 이용하면 손쉽게 웹브라우저에서 스트리밍이 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-12.png)

위와 같이 좌측에 있는 `Mixed Reality Capture` 메뉴를 클릭한다. 그리고 화면 중간의 `Live Preview` 버튼을 클릭한다. 그러면 아래와 같이 프리뷰 화면이 작게 나타나는데 브라우저의 개발자도구 모드를 이용하면 라이브 주소를 따낼 수 있다.

`api/holographic/stream/live_high.mp4?holo=true&pv=true&mic=true&loopback=true`

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-13.png)

이 API URL에 IP 주소와 앞서 생성했던 `Username`, `Password`를 이용하면 아래와 같이 직접 접속이 가능하다. IP 주소는 `192.168.1.6`이었으니 직접 접속 URL은 아래와 같다.

`https://[USERNAME]:[PASSWORD]@192.168.1.6/api/holographic/stream/live_high.mp4?holo=true&pv=true&mic=true&loopback=true`

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/08/hololens-streaming-14.png)

이를 직접 웹 브라우저 주소창에 입력하면 위와 같은 화면을 확인할 수 있다.

## 홀로렌즈 영상 인터넷 방송

지금까지 웹 브라우저를 통해 홀로렌즈의 영상을 스트리밍 받는 방법에 대해 알아 보았다. 이 브라우저 자체를 행아웃이나 스카이프 또는 [OBS](https://obsproject.com)에 연결시킨다면 실시간 인터넷 방송이 가능하다.

## 발표 자료

홀로렌즈 시연과 관련한 발표자료 및 동영상은 아래에서 확인할 수 있다.

[HoloLens Demo](https://docs.com/justinyoo/3623/hololens-demo?c=hdG1Ym "HoloLens Demo")—[Justin-Yoo](https://docs.com/justinyoo)

<iframe src="https://docs.com/d/embed/D25193094-6183-4959-0170-001214257308%7eMf910d383-aadc-c64c-94a1-34aacea1c31b" frameborder="0" scrolling="no" width="608px" height="378px" style="max-width:100%" allowfullscreen="False"></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/4y_1gyEK0TY" frameborder="0" allowfullscreen></iframe>

<iframe width="420" height="315" src="https://www.youtube.com/embed/cVKr5X1CjyU" frameborder="0" allowfullscreen></iframe>
