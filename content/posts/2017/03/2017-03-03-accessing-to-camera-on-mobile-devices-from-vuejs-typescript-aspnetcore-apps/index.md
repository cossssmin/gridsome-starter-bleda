---
title: "Vue.js + 타입스크립트 + ASP.NET Core 앱에서 핸드폰의 카메라 API에 접근하기"
date: "2017-03-03"
slug: accessing-to-camera-on-mobile-devices-from-vuejs-typescript-aspnetcore-apps
description: ""
author: Justin Yoo
tags:
- Front-end Web Dev
- ASP.NET Core
- TypeScript
- Vue.js
- HTML5
- GetUserMedia
- WebCam
fullscreen: false
cover: ""
---

[지난 포스트](http://blog.aliencube.org/ko/2017/02/23/running-vuejs-with-typescript-on-aspnet-core-apps/)에서는 [Vue.js](https://vuejs.org/)와 [TypeScript](http://www.typescriptlang.org/)를 ASP.NET Core 애플리케이션에서 작동시키는 예제를 진행해 보았다. 이제 실제로 모바일 웹 앱을 개발해 볼 차례이다. HTML5를 지원하는 모던 웹 브라우저는 컴퓨터 혹은 스마트폰의 멀티미디어 장치에 접근이 가능하다. 대표적인 것이 바로 카메라와 마이크이다. 여러 방법으로 카메라와 마이크에 접근할 수 있으나 가장 핫한 방식은 [`Navigator.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia) API를 이용하는 방법이다. 이 포스트에서는 VueJs와 타입스크립트를 통해 모바일 웹 앱을 구현해 보고 모바일 장치의 카메라를 사용하는 예제를 작성해 보도록 한다.

## `getUserMedia()` API

HTML5를 지원하는 대부분의 모던 웹 브라우저는 이 기능을 지원한다. 특히 최초 버전인 [`Navigator.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia) API는 전통적으로 콜백을 지원하는 반면 새롭게 나온 [`MediaDevices.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)는 [프로미스 패턴](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)을 지원하므로 [콜백 지옥](http://callbackhell.com/)에서 벗어나서 조금 더 편하게 개발을 할 수 있다는 장점이 있다. 이 두 API를 웹 브라우저에서 모두 지원하지는 않기 때문에 가능한 한 `MediaDevices.getUserMedia()`를 먼저 지원하고, 지원하지 않을 경우 `Navigator.getUserMedia()`를 지원하는 형태로 사용한다. 이와 관련한 자바스크립트 예제 코드는 [이 MDN 문서](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Using_the_new_API_in_older_browsers)를 참조하도록 하자.

> 이 포스트에 쓰인 샘플 코드는 [이곳](https://github.com/devkimchi/Vue.js-with-ASP.NET-Core-Sample)에서 확인할 수 있다.

## 사전 준비 사항

- [지난 포스트](http://blog.aliencube.org/ko/2017/02/23/running-vuejs-with-typescript-on-aspnet-core-apps/)에서 만들어 본 ASP.NET Core 앱
- 웹캠이 달린 컴퓨터 혹은 스마트폰

> **참고 1**: 이 포스트에서는 VueJs 버전 2.2.1, 타입스크립트 버전 2.2.1을 사용한다. 이전과 달리 타입스크립트를 이용해서 코드를 작성할 때 많은 부분이 바뀌었으므로 반드시 이 [공식 문서](https://vuejs.org/v2/guide/typescript.html)를 참조하도록 한다. **참고 2**: 이 포스트에 사용한 카메라 접근 코드 샘플은 [@smronju](https://github.com/smronju)가 배포한 [`vue-webcam`](https://github.com/smronju/vue-webcam/blob/master/VueWebcam.js)을 참조해서 타입스크립트 형식에 맞게 변환했다.

## `Hello.vue` 수정

우선 카메라 스트리밍을 위한 자리를 깔아야 한다. `Hello.vue` 파일의 템플릿 섹션에 아래 내용을 추가한다.

https://gist.github.com/justinyoo/ccb5dfa4b0968bcefef82797b85fc828

- `video` 태그는 실제 카메라 입력을 받아들이는 장소이다. 카메라 입력 소스(`src`)와 크기(`width`, `height`), 자동재생 옵션(`autoplay`)은 별도의 데이터 바인딩으로 처리한다. 그리고 컴포넌트에서 직접 이 엘리먼트를 다룰 수 있게끔 `ref` 속성도 추가한다.
- `img` 태그는 카메라 입력을 받아 사진을 찍고 그 결과를 출력해 주는 장소이다. 이미지 소스(`photo`)는 별도의 데이터 바인딩으로 처리한다.
- `button` 태그는 실제 마우스 클릭 혹은 손가락 탭 이벤트를 `takePhoto` 이벤트로 받아 처리하게끔 한다.

이렇게 사용자 입력을 받아들일 준비는 끝났다. 다음으로 사용자 입력을 처리하는 부분을 확인해 보자.

## `Hello.ts` 수정

기존의 `Hello.ts`는 상당히 간단했다면 이번에 카메라 API를 추가하면서 조금 복잡해졌다. 아래 내용을 확인해 보자.

https://gist.github.com/justinyoo/487aeb50b6a78b4beab257a4eaf0939b

상당히 많은 데이터 필드를 추가했다. 이는 양방향 바인딩을 위한 필드로써 사용자 입력 혹은 내부 처리 결과에 따라 값이 바뀐다. 아래 `private` 한정자가 붙은 것들은 이 컴포넌트 내부적으로만 사용할 값들이다. 몇몇 필드들은 초기값을 지정해 둬서 별도의 처리가 없는 한은 초기값으로 사용하게 된다.

https://gist.github.com/justinyoo/db7b9e5bd7b1405fc5ef7f42330213bd

- `takePhoto()` 이벤트는 가상의 `canvas` DOM을 생성해서 `video` 태그로 입력 받은 영상 신호를 사진으로 변환한 후 `img` 태그로 내보내는 역할을 한다.

https://gist.github.com/justinyoo/a277ae55ccab65a95bb8ad3160d0e1dd

- `mounted()` 이벤트는 이 `Hello.ts` 컴포넌트가 마운트되고 난 후 발생하는 이벤트로 `getUserMedia()` API를 이용해서 `video` 태그에 카메라 스트리밍 소스를 바인딩하는 역할을 한다.
- `this.$refs.video`를 통해 접근하는 `video` 태그는 `Hello.vue` 안의 템플릿 섹션에서 `ref` 속성으로 지정한 엘리먼트이다. `ref` 속성을 지정하지 않는다면 컴포넌트에서 접근할 수 없다.

> `this.$refs` 인스턴스의 원래 타입은 `{ [key: string]: Vue | Element | Vue[] | Element[] }`인데 위 코드에서는 `any` 타입으로 형변환 한 것을 볼 수 있다. 원래 타입을 그대로 써서 `this.$refs.video`에 접근하려면 린팅 에러 때문에 빌드에 실패한다. 원래 타입을 그대로 쓰려면 `this.$refs["video"]`의 형식으로 접근해야 한다.

여기까지 코딩 부분은 끝났다. 이제 빌드해서 웹서버를 올린 후 `http://localhost:포트번호`로 접속해 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-01.png)

이번에는 `localhost` 대신 IP 주소로 접속해 보자. 원격에서 내 로컬 개발장비의 웹사이트를 접속하는 방법은 [이 포스트](http://blog.aliencube.org/ko/2017/02/25/remote-access-to-aspnet-core-apps-from-mobile-devices/)를 참고한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-02.png)

카메라를 사용할 수 없다. 대신 위 그림의 우측에 나오는 에러메시지를 볼 수 있는데, 이는 로컬 환경이 아닌 외부 접근시 `getUserMedia` API를 사용하기 위해서는 사생활 침해 이슈 때문에 [HTTPS 커넥션이 필요하다고 한다](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins). 사실 이 에러는 구글 크롬에서만 나오는 것이고 파이어폭스나 엣지 같은 다른 브라우저에서는 이와 상관없이 접속이 가능하다. 보안과 관련해서는 개인적으로 구글 크롬의 정책을 지지한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-03.png)

이제는 IP 주소로 접속해도 카메라를 사용할 수 있다. 카메라 접근을 허용하면 아래와 같이 내 PC의 웹캠을 곧바로 이용할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-04.png)

이제 모바일 장치에서 접속을 해보자. 첫번째는 안드로이드 폰, 두번째는 윈도우즈 폰, 마지막은 아이폰이다. (feat. 보리스 the 직장동료)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-08.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-09.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-05.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-06.png)

어어엇? 아이폰에서는 사용할 수 없다니 이게 도대체 무슨 소리요!

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/cat-puzzled.jpg)

그렇다. 모바일 웹 앱의 경우 모든 브라우저가 HTML5의 모든 기능을 골고루 지원하지 않는 브라우저 호환성 이슈가 생긴다.

## `getUserMedia` 브라우저 호환성

아래 스크린샷을 보자. [http://mobilehtml5.org/](http://mobilehtml5.org/)을 참고한 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-camera-on-mobile-devices-with-vuejs-typescript-aspnet-core-07.png)

`getUserMedia` API는 아직 iOS 계열에서는 [사용할 수](http://iswebrtcreadyyet.com/#getUserMedia) [없다](http://stackoverflow.com/questions/23374806/webapp-using-webrtc-for-cross-platform-videochat-in-ios-browser-and-android-chro/#23391401). 따라서, 이를 위해서는 다른 대안도 같이 제시해 주어야 한다. 이는 `HTML Media Capture` API를 통해 극복할 수 있다. 이 API는 `input type="file"` 태그를 이용한 것으로 모바일 기기에서는 곧바로 저장된 사진 혹은 카메라에 접근이 가능하다고 한다. 다음 포스트에서는 이 내용에 대해 다뤄보도록 하자.
