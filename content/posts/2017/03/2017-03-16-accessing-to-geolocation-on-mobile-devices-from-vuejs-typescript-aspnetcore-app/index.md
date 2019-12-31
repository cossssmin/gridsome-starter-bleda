---
title: "Vue.js + TypeScript + ASP.NET Core 앱에서 핸드폰의 GPS 정보 이용하기"
date: "2017-03-16"
slug: accessing-to-geolocation-on-mobile-devices-from-vuejs-typescript-aspnetcore-app
description: ""
author: Justin-Yoo
tags:
- front-end-web-dev
- asp-net-core
- typescript
- vue-js
- html5
- geo-location
fullscreen: false
cover: ""
---

[지난 포스트](http://blog.aliencube.org/ko/2017/03/03/accessing-to-camera-on-mobile-devices-from-vuejs-typescript-aspnetcore-apps/)에서 [HTML5 getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) API를 이용해서 핸드폰의 카메라에 접근하는 방법에 대해 논의해 보았다. 이번에는 핸드폰의 GPS를 이용한 위치 정보(geolocation)에 접근하는 방법에 대해 알아보도록 하자.

> 이 포스트에 쓰인 샘플 코드는 [이곳](https://github.com/devkimchi/Vue.js-with-ASP.NET-Core-Sample)에서 확인할 수 있다.

## `navigator.geolocation` API

`getUserMedia()` API와 달리 `geolocation` API는 거의 모든 브라우저에서 사용 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-geolocation-on-mobile-devices-with-vuejs-typescript-and-aspnet-core-01.png)

따라서 간단한 타입스크립트 코드를 이용하면 손쉽게 이용할 수 있다.

> **참고**: `geolocation` API를 이용하기 위해서는 반드시 인터넷에 연결되어 있어야 한다. 또한 각 브라우저 제조사마다 동일한 데이터를 이용하지 않기 때문에 오차가 생길 수 있다. 좀 더 자세한 내용은 이 [블로그 포스트](http://www.andygup.net/html5-geolocation-api-%E2%80%93-how-accurate-is-it-really/)를 참고하도록 하자.

## 사전 준비 사항

- [지난 포스트](http://blog.aliencube.org/ko/2017/02/23/running-vuejs-with-typescript-on-aspnet-core-apps/)에서 만들어 본 ASP.NET Core 앱
- Wi-Fi 또는 무선 인터넷망에 접속 가능한 컴퓨터 혹은 스마트폰

> **참고 1**: 이 포스트에서는 VueJs 버전 2.2.2, 타입스크립트 버전 2.2.1을 사용한다. 이전과 달리 타입스크립트를 이용해서 코드를 작성할 때 많은 부분이 바뀌었으므로 반드시 이 [공식 문서](https://vuejs.org/v2/guide/typescript.html)를 참조하도록 한다. **참고 2**: 이 포스트에 사용한 코드 샘플은 [MDN의 Using Geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)을 타입스크립트에 맞게 수정했다.

## `Hello.vue` 수정

우선 `geolocation` API가 받아오는 위도, 경도를 표현하게끔 `Hello.vue` 파일을 아래와 같이 수정한다.

https://gist.github.com/justinyoo/6afc687c7dc5f304411a78d7c7c5b6e1

`Get Location` 버튼을 클릭하거나 탭하면 모바일 브라우저에서 위치 정보를 받아오게끔 지정했다. 이제 화면은 준비됐으니 실제 코딩 부분을 살펴보도록 하자.

## `Hello.ts` 수정

기존 `Hello.ts`에 `getLocation()` 이벤트 핸들러를 아래와 같이 추가한다.

https://gist.github.com/justinyoo/03c2e1b4e882ea81d1f5dca275410005

우선 템플릿에 바인딩할 `latitude`, `longitude`, `altitude` 속성을 정의했다. 그 다음에 `getLocation()` 메소드를 정의했는데, 그 안을 살펴보면 아래와 같다.

- `navigator.geolocation` 인스턴스를 확인해서 브라우저가 `geolocation` API를 지원하는지 확인한다.
- `getCurrentPosition()` 메소드를 통해 현재 위치를 불러온다. 이 메소드는 두 개의 콜백 메소드와 옵션을 파라미터로 받는다.
- `success()` 콜백 메소드는 현재 위치 정보를 담은 `position` 인스턴스를 인자로 삼아 현 위치를 브라우저에 출력한다.
- `error()` 콜백 메소드는 에러 핸들링을 위해 추가한다.
- `options` 인스턴스는 `geolocation` API를 위한 추가적인 옵션을 정의한다.

> 각 콜백 메소드는 타입 정의에 따라 리턴 타입이 있다. 하지만 이는 쓸 일이 없으므로 그냥 `null` 값을 반환시킨다.

위의 코드에 보면 `options` 인스턴스는 `PositionOptions` 라는 인터페이스 타입이지만 이를 실제로 구현한 클라스는 없다. 따라서 아래와 같이 직접 구현해야 한다.

https://gist.github.com/justinyoo/99379235de41a5708c200ec4a9c288f4

이렇게 해서 타입스크립트 코딩 부분이 끝났다. 실제로 작동을 시켜보도록 하자.

## 결과

우선 개발 컴퓨터의 웹 브라우저에서 접속을 해 본다. `Get Location` 버튼을 클릭하면 아래와 같이 `geolocation` API 사용과 관련한 권한 취득에 대해 물어본다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-geolocation-on-mobile-devices-with-vuejs-typescript-and-aspnet-core-02.png)

`Allow`를 클릭하면 아래와 같이 현재 위치를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-geolocation-on-mobile-devices-with-vuejs-typescript-and-aspnet-core-03.png)

이번엔 모바일 브라우저에서 접속해 보자. 아이폰으로 접속해서 마찬가지로 `Get Location` 버튼을 탭하면 아래와 같이 `geolocation` API 사용허가 팝업이 나타난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-geolocation-on-mobile-devices-with-vuejs-typescript-and-aspnet-core-04.png)

`OK` 버튼을 탭한 후 결과를 보면 아래와 같이 나타나는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/accessing-geolocation-on-mobile-devices-with-vuejs-typescript-and-aspnet-core-05.png)

지금까지 웹 브라우저의 `geolocation` API를 이용해서 현재 위치를 파악하는 방법에 대해 알아보았다.

대부분의 모바일 웹 앱에서는 사실 이 정도만 해도 충분하다. 하지만 요구사항이 좀 더 복잡해진다거나, 좀 더 정확한 위치정보가 필요하다거나 또는 항상 위치 정보를 확인해야 한다거나 하면 이 때에는 네이티브 앱을 이용하는 것이 좀 더 정확한 결과를 얻기에 좋다. 이와 관련해서 잘 정리된 [포스트](http://www.andygup.net/how-accurate-is-html5-geolocation-really-part-2-mobile-web/)를 소개하는 것으로 이 포스트를 마치고자 한다.
