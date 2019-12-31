---
title: "HTML5 Media Capture API와 Azure Cognitive Services를 이용한 OCR 구현"
date: "2017-03-28"
slug: implementing-ocr-using-azure-cognitive-services-with-html5-media-capture-api
description: ""
author: Justin-Yoo
tags:
- front-end-web-dev
- asp-net-core
- typescript
- vue-js
- azure-cognitive-services
- vision-api
- html-media-capture
- ocr
fullscreen: false
cover: ""
---

모바일 애플리케이션 구현에서 핸드폰의 카메라에 접근하는 방법은 여러가지가 있다. [이전 포스트](http://blog.aliencube.org/ko/2017/03/03/accessing-to-camera-on-mobile-devices-from-vuejs-typescript-aspnetcore-apps/)에서는 HTML5의 `getUserMedia` API를 이용해 핸드폰의 카메라에 접근해 봤다. 하지만 이 API는 모바일 장치의 모든 브라우저에서 작동하는 것이 아니어서 이를 위한 폴백을 제공해야 한다. 반면에 [HTML5 Media Capture](https://www.w3.org/TR/html-media-capture/) API는 거의 모든 모던 브라우저에서 지원하기 때문에 모바일 장치에서 쉽게 구현이 가능하다. 이번 포스트에서는 [Vue.js](https://vuejs.org/)와 [타입스크립트](http://www.typescriptlang.org/), 그리고 ASP.NET Core를 기반으로 한 Single Page Application(SPA)에서 HTML Media Capture 기능을 이용해 [Azure Cognitive Service](https://azure.microsoft.com/en-us/services/cognitive-services/)의 [OCR 기능](https://www.microsoft.com/cognitive-services/en-us/computer-vision-api)을 구현해 보기로 한다.

> 이 포스트에 쓰인 샘플 코드는 [이곳](https://github.com/devkimchi/Vue.js-with-ASP.NET-Core-Sample)에서 확인할 수 있다.

## Vision API – Azure Cognitive Services

[Cognitive Services](https://www.microsoft.com/cognitive-services)는 Azure의 강력한 머신 러닝 리소스를 활용한 인공 지능 서비스이다. 이 서비스에서 제공하는 API중 하나가 사진 또는 비디오 분석과 관련한 [Vision API](https://www.microsoft.com/cognitive-services/en-us/computer-vision-api)이다. Vision API는 다양한 이미지 자료 분석을 통해 이미지에 등장하는 사람 혹은 사물의 종류 및 나이, 감정 등을 파악한다거나 이미지에 들어있는 텍스트를 추출한다거나 하는 용도에 쓰인다. 이 포스트에서는 Vision API의 기능 중 이미지에서 텍스트를 추출하는 OCR 기능을 이용한다. 예전에는 [Project Oxford](https://blogs.microsoft.com/next/2015/05/01/microsofts-project-oxford-helps-developers-build-more-intelligent-apps/#sm.0001qbfhdg17w0equsvd68m5cymsp) 라는 이름으로 알려져 있었다가 실제 서비스 론칭시 Cognitive Services 라는 정식 명칭을 부여받은 것으로 보인다. 덕분에 [NuGet 패키지](https://www.nuget.org/packages/Microsoft.ProjectOxford.Vision/)는 여전히 `ProjectOxford`라는 이름을 달고 있다.

## HTML Media Capture API

HTML5에서는 다양한 멀티미디어 장치에 접근할 수 있는 API를 제공한다. Media Capture API를 이용하면 모바일 장치의 카메라 또는 마이크에 직접 접근해서 사용할 수 있는 장점이 있다. [w3.org 에서 제공하는 공식문서](https://www.w3.org/TR/html-media-capture/)에 따르면 이 API는 기존 `input` 태그의 `type="file"` 속성을 확장한 것이라고 한다. `input` 태그에 아래와 같이 `accept="image/*"`와 `capture="camera"` 속성을 추가하기만 하면 곧바로 Media Capture API를 사용할 수 있다.

https://gist.github.com/justinyoo/cb59e956cf3fbb662709ba09a07fb672

물론 데스크탑 브라우저에서는 이전과 동일하게 파일을 선택할 수 있는 창이 열린다. 실제로 [이 링크](https://mobilehtml5.org/ts/?id=23)를 데스크탑 브라우저와 모바일 브라우저로 접속해 보면 어떤 차이가 있는지 확인할 수 있다.

## ASP.NET Core Web API

ASP.NET Core 백엔드에서는 프론트엔드에서 넘긴 파일을 [`IFormFile`](https://docs.microsoft.com/en-us/aspnet/core/api/microsoft.aspnetcore.http.iformfile) 인터페이스를 통해 아래와 같이 직접 접근이 가능하다.

https://gist.github.com/justinyoo/2fe469b9abc9590e98431719e36f4139

기능 구현과 관련한 기본적인 정리는 이정도로 하고 실제 애플리케이션을 구현해 보도록 하자.

## 사전 준비 사항

- [지난 포스트](http://blog.aliencube.org/ko/2017/02/23/running-vuejs-with-typescript-on-aspnet-core-apps/)에서 만들어 본 ASP.NET Core 앱
- 카메라 사용이 가능한 스마트폰 또는 타블렛

## Vue 컴포넌트 구현 – `Ocr.vue`

우선 OCR을 위한 Vue 컴포넌트를 작성해 보자. 간단하게 사진을 받을 수 있는 `input` 태그 하나, `button` 태그 하나, 이미지 프로세싱 후 보여줄 `img` 태그 하나, OCR 결과를 보여줄 수 있는 `textarea` 태그 하나면 충분하다.

https://gist.github.com/justinyoo/45ad73af4bb30f6ec02989ac96d190e9

참고로 `ref` 속성을 통해 Vue 컴포넌트에서 직접 해당 HTML 엘리먼트를 참조할 수 있게 처리한다. 버튼 태그에는 `onClick` 이벤트에 `getText`라는 이벤트 핸들러를 바인딩한다. 이제 실제 OCR 처리 로직이 들어있는 `Ocr.ts`를 작성해 보자.

https://gist.github.com/justinyoo/0575c558999e912a7d98866adbc0d34f

우선 [Dependency Injection(DI)](http://blog.aliencube.org/ko/2017/03/21/using-ioc-container-in-vuejs-typescript-app/)를 위해 심볼 객체를 `Symbols.ts`에서 생성하고 DI에서 해당 심볼 객체를 사용한다. 뒤에서 다시 언급하겠지만 최상위 컴포넌트인 `App.vue`에서 `provide` 속성을 통해 `axios` 인스턴스를 주입하는 것을 확인할 수 있다.

다음으로 `input` 태그에 담겨있는 이미지 파일을 AJAX 요청에 필요하게끔 추출해서 [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) 인스턴스에 밀어 넣는다. 마지막으로 `axios`를 통해 POST 요청을 Web API로 보내면 백엔드 API에서 이미지를 Cognitive Services Vision API를 통해 처리하고 그 결과를 반환하게끔 해 놓았다.

## Vue 컴포넌트 추가 – `Hello.vue`

앞서 구현해 놓은 `Ocr.vue` 컴포넌트는 아래와 같이 `Hello.vue` 컴포넌트에 자식 컴포넌트로 등록해서 쓸 수 있다.

https://gist.github.com/justinyoo/f637886ed651165b9a47ef1eb12c5d58

## 의존성 주입 – `App.vue`

앞서 `axios` 인스턴스를 최상위 컴포넌트인 `App.vue`에서 주입하고 그 아래 자식 컴포넌트에서 사용할 수 있게 한다고 했다. 어떻게 구현하는지 살펴보도록 하자.

https://gist.github.com/justinyoo/9feb495ce38577ac8128810fdc13993e

심볼을 키로 활용해서 `axios` 인스턴스를 주입하겠다고 선언한 것을 확인할 수 있다.

이렇게 해서 프론트엔드 쪽의 구현은 다 끝났다. 이제 백엔드 API를 구현해 볼 차례이다.

## Azure Cognitive Service 등록

우선 Azure Cognitive Service 계정을 하나 만들어야 한다. 애저 포탈에 로그인해서 Cognitive Services API 서비스를 등록한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/azure-cognitive-services-with-html5-media-capture-01.png)

현재 Cognitive Services는 프리뷰 상태이므로 지역은 `West US`만 선택 가능하다. API Type은 `Computer Vision API (preview)`를 선택하고 가격 정책은 `F0`, 즉 무료 티어를 선택한다. 동일 섭스크립션 안에서는 API 하나당 무료 티어 하나만 선택이 가능한지라 아래 스크린샷에서는 `F0` 선택이 비활성화 되었다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/azure-cognitive-services-with-html5-media-capture-02.png)

이렇게 해서 계정을 생성하면 API 키를 받을 수 있는데, 이는 최초 생성 후 약 10분 정도 후에 사용이 가능하다. 아래 Web API 코드를 구현하다 보면 대략 10분 정도는 지날테니 큰 걱정은 하지 않아도 된다.

## Web API 구현 - ProjectOxford Vision API

Web API 구현은 상당히 간단하다. [`HttpClient`](https://docs.microsoft.com/de-de/dotnet/core/api/system.net.http.httpclient) 클라스를 이용해서 REST API를 직접 호출하면 된다. 또는 아예 [ProjectOxford - vision-api](https://www.nuget.org/packages/Microsoft.ProjectOxford.Vision/) NuGet 패키지를 이용하면 더 쉽게 Vision API를 이용할 수 있다. 아래 코드는 간단히 구현한 Web API이다.

https://gist.github.com/justinyoo/a3088d9a0f85dacf3ec94c109c8138ac

우선 프론트엔드에서 보낸 [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) 인스턴스를 [`IFormFile`](https://docs.microsoft.com/en-us/aspnet/core/api/microsoft.aspnetcore.http.iformfile) 인터페이스를 통해 받아온다. 하지만 이 값이 `null`이 되는 경우가 있기 때문에 확인해 보고 `Request.Form.Files` 인스턴스에서 다시 받아온다. 다음으로는 앞서 애저 포탈에서 받아온 Vision API 토큰 값을 `VisionServiceClient` 인스턴스 생성시 넣어준다. 이 인스턴스를 이용해서 이미지를 넘기고 그 결과값을 받아온다. 마지막으로 JSON 직렬화 결과를 반환한다.

여기까지 해서 프론트엔드와 백엔드 모두 구현이 끝났다. 실제로 이 웹앱을 실행시켜 모바일 장치에서 접속한 후 결과를 확인해 보도록 하자. 아이폰에서 웹사이트에 접속한 후 카메라 API를 이용해 사진을 찍고 서버로 전송해서 결과를 받아오는 것을 확인할 수 있다.

<iframe width="853" height="480" src="https://www.youtube.com/embed/XkbdDXoOEao" frameborder="0" allowfullscreen></iframe>

지금까지 Azure Cognitive Services – Vision API를 이용해서 OCR을 구현해 보았다. 이 OCR은 사실 원본 이미지의 품질에 상당히 영향을 받게 마련이다. 위 동영상에서는 굉장히 깔끔하게 인식을 하지만, 글자와 배경 사이 채도가 크지 않다면 인식률이 상당히 떨어진다. 또한 글자 주위에 테두리가 있다거나 하면 또한 인식률이 떨어진다. 그리고 아직까지는 캡챠(CAPTCHA) 스타일의 이미지 인식률은 그다지 높지 않다. 하지만, 이것은 모든 인공지능 프로그램이 그러하듯 좀 더 많은 샘플들을 학습한다면 곧 나아질 것이다.
