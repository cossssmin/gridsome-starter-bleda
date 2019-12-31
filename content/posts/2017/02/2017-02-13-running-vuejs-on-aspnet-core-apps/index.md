---
title: "ASP.NET Core 애플리케이션에서 Vue.js 통합하기"
date: "2017-02-13"
slug: running-vuejs-on-aspnet-core-apps
description: ""
author: Justin-Yoo
tags:
- front-end-web-dev
- asp-net-core
- azure-website
- vue-js
- webpack
fullscreen: false
cover: ""
---

[Vue.js](https://vuejs.org)는 최근에 나온 프론트엔드 프레임워크로서 다른 프론트엔드 프레임워크에 비해 굉장히 가볍고 상대적으로 러닝커브가 낮은 편이다. ASP.NET Core 애플리케이션은 다양한 프론트엔드 프레임워크 – Angular2, Aurelia, React, Knockout 등 – 를 지원하지만 안타깝게도 이 Vue.js 는 지원하지 않는다. [최근](http://mgyongyosi.com/2016/Vuejs-server-side-rendering-with-aspnet-core/) [몇몇](https://blog.iridiumion.xyz/2016/12/asp-net-core-with-vue-js-webpack-and-hot-module-reloading-part-1/) [포스트](https://github.com/MarkPieszak/aspnetcore-Vue-starter)에서 이를 다루었으나 Vue.js 에서 기본적으로 제공하는 템플릿과는 거리가 있어 처음 접하는 사람이 다루기에는 무리가 있다. 이 포스트에서는 ASP.NET Core 애플리케이션을 기반으로 Single Page Application(SPA)을 제작할 때 Vue.js와 통합하는 방법에 대해 알아보도록 한다.

> 이 포스트에 쓰인 샘플 코드는 [이곳](https://github.com/devkimchi/Vue.js-with-ASP.NET-Core-Sample)에서 확인할 수 있다.

## `Microsoft.AspNetCore.SpaServices`

ASP.NET Core 애플리케이션은 프론트엔드 라이브러리 지원을 위해 [bower](https://bower.io/)를 채택했다. 하지만, 급변하는 프론트엔드 개발환경에서 요즘에는 [webpack](https://webpack.js.org/)과 같은 번들링, 모듈링 라이브러리를 많이 활용하는 편인데, ASP.NET Core 에서도 이를 내부적으로 지원하는 라이브러리를 제공한다. 이 [`Microsoft.AspNetCore.SpaServices`](http://www.nuget.org/packages/Microsoft.AspNetCore.SpaServices/) 라이브러리를 사용하면 ASP.NET Core 애플리케이션과 프론트엔드 라이브러리를 손쉽게 통합할 수 있다.

## 사전 준비사항

이 작업을 위해 미리 준비해야 할 것들이 있다.

- [비주얼 스튜디오 2015 Update 3 (비주얼 스튜디오)](https://www.visualstudio.com/downloads/)
- [.NET Core SDK 1.1](https://www.microsoft.com/net/download/core#/current)
- [vue-cli](https://www.npmjs.com/package/vue-cli)

[비주얼 스튜디오 Code (코드)](https://code.visualstudio.com/)를 사용할 수도 있지만, 이 글에서는 코드 대신 비주얼스튜디오를 기준으로 진행하도록 한다.

## ASP.NET Core 웹 애플리케이션 생성

비주얼 스튜디오를 실행시켜 ASP.NET Core 웹 애플리케이션 프로젝트를 하나 생성한다. 생성하고 나면 기본적으로 설치되는 닷넷 코어 버전은 1.0.1이므로 이를 1.1로 업데이트해야 한다. 업데이트를 위해서는 우선 `global.json` 파일을 1.1 버전의 SDK를 사용하는 것으로 바꾸어야 한다.

https://gist.github.com/justinyoo/bbf0651a0332756511123391b33452e7

이후 `project.json` 파일을 아래와 같이 수정한 후 NuGet 패키지들을 모두 업데이트한다.

https://gist.github.com/justinyoo/58517ef66c766311edd0faca86a4800a

우리는 bower 대신 webpack을 사용할 예정이므로 bower와 관련한 아래 설정 파일은 다 삭제하도록 한다.

- `.bowerrc`
- `bower.json`
- `bundleconfig.json`

마지막으로 `wwwroot` 디렉토리 안의 모든 하위 디렉토리와 파일도 삭제하도록 한다. 여기까지 해서 ASP.NET Core 웹 애플리케이션은 준비가 다 끝났다. 이제 여기에 Vue.js 프론트엔드 프레임워크를 끼얹어보자.

## Vue.js 설치

Vue.js의 강력한 기능을 사용하기 위해서는 Webpack과 같은 번들링 도구를 사용하는 것이 좋다. 이를 위해서는 `vue-cli`를 아래 명령어를 통해 설치해야 한다. 당연하게도 node.js와 npm이 설치되어 있어야 한다.

https://gist.github.com/justinyoo/5a36c075a87334740f48353d2b83a97b

vue-cli 설치가 끝났다면 아래 명령어를 통해 기본 템플릿을 설치하도록 한다.

https://gist.github.com/justinyoo/30bb164756bde80d47e7c644c0ede210

몇가지 문답을 거치고 나면 기본 템플릿 설치가 끝난다. 이제 아래와 같은 명령어를 통해 실제 Vue.js 가 제대로 작동하는지 확인해 보자.

https://gist.github.com/justinyoo/fb9eec7a1e8abab686984b519390d083

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/vuejs-with-aspnet-core-01.png)

기본 포트가 `8080`으로 지정되어 있기 때문에 예상한 바와 같이 잘 나온다. 하지만 ASP.NET Core 애플리케이션과는 무관하게 독립적으로 작동하는 상태이기 때문에 이를 통합시켜야 한다.

## Vue.js 와 ASP.NET Core 통합

ASP.NET Core 쪽과 Vue.js 양쪽의 설정을 살짝 건드려 줘야 한다.

### Vue.js 설정 수정

우선 ASP.NET Core 애플리케이션과 통신할 수 있게 해 주는 [`aspnet-webpack`](https://www.npmjs.com/package/aspnet-webpack)이라는 npm 패키지를 설치해야 한다.

https://gist.github.com/justinyoo/096083474eb890abdb2019c7adb779cf

설치가 끝났다면 `config/index.js` 파일을 열어 아래 부분을 수정하도록 한다.

https://gist.github.com/justinyoo/6584a851582ad396309ae96d8a1c7fc8

마지막으로 아래와 같이 `webpack.config.js` 파일을 생성해서 프로젝트의 루트 디렉토리에 저장한다.

https://gist.github.com/justinyoo/c78e8e4b1af0ae264cd50202aa1aa6fd

이상으로 Vue.js 쪽의 설정 변경을 마쳤다.

### ASP.NET Core 설정 수정

Vue.js 쪽에 `aspnet-webpack` 패키지를 설치했다면 ASP.NET Core 쪽에도 이에 대응하는 [`Microsoft.AspNetCore.SpaServices`](http://www.nuget.org/packages/Microsoft.AspNetCore.SpaServices/) 패키지를 하나 설치해야 한다. 그리고, 이를 `Startup.cs` 파일에 등록시켜 주어야 한다.

https://gist.github.com/justinyoo/674a14c338a4f182164db7bb13e4a63b

여기까지 해서 모든 설정을 마쳤다. 이제 F5 키를 눌러 웹앱을 작동시켜 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/vuejs-with-aspnet-core-02.png)

앞서 Vue.js 템플릿 설치 직후 앱을 실행시켰을 때 보이던 포트 번호가 아닌 ASP.NET Core 앱의 포트번호가 물려있는 것을 확인할 수 있다. 그렇다면 실제로 ASP.NET Core 앱과 AJAX 통신을 해서 데이터를 주고받는지 확인해 보도록 하자. 이를 위해서는 몇가지 추가적인 수정사항이 필요하다.

### AJAX 통신

먼저 [`vue-resource`](https://www.npmjs.com/package/vue-resource) 패키지를 설치해서 AJAX 통신을 가능하게 만들어야 한다.

https://gist.github.com/justinyoo/dd7c1339d18aba6acdfc394f2750bdee

설치가 끝나면 이 패키지를 사용할 수 있게끔 해야 한다. `src/main.js` 파일을 아래와 같이 수정한다.

https://gist.github.com/justinyoo/573e49fe4140ea5635e77cedee66ebe6

패키지 등록이 끝났다면, 이제 실제로 API 호출을 해야 하는 시점이다. `/src/components/Hello.vue` 파일을 열어 아래와 같이 수정한다.

https://gist.github.com/justinyoo/acb5f377064a961aa38c4a9efd5eef7f

이렇게 AJAX 요청을 주고 받았다면 현재 `Welcome to Your Vue.js App` 이라는 표현이 `res.body.message` 결과 값으로 바뀔 것이다. 이제 ASP.NET Core 쪽에서 API를 개발할 차례이다. 아래와 같이 API 콘트롤러를 하나 생성한다.

https://gist.github.com/justinyoo/a8d49594556e0afd53da7eec10488d86

이제 끝이다. 앱을 빌드한 후 F5 키를 눌러 결과를 다시 확인해 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/vuejs-with-aspnet-core-03.png)

webpack의 핫 모듈 교체 기능 덕분에 만약 Vue.js 단에서 뭔가를 수정했다면 그자리에서 곧바로 변경 결과를 확인할 수도 있다.

## Azure로 배포하기

이렇게 만든 Vue.js 애플리케이션을 이제 애저의 웹앱 인스턴스로 배포할 차례이다. 우리는 `wwwroot/index.html` 파일을 이용하지 ASP.NET Core에서 제공하는 View를 사용하지 않는다. 로컬 개발 환경에서는 자동으로 이를 인식하지만 애저로 배포를 하게 되면 이를 인식할 수 없다. 따라서, 기본 파일명을 아래와 같이 `Startup.cs` 파일을 수정하여 지정해야 한다.

https://gist.github.com/justinyoo/97722a8f7c559e3937703e471b54d9ee

마지막으로 `project.json` 파일의 배포 관련 설정을 아래와 같이 수정한다.

https://gist.github.com/justinyoo/35a9adf121c3f4755a090db910cdc2a4

이제 모든 설정이 다 끝났다! 애저 웹 앱 인스턴스로 배포를 해 보도록 하자. 배포가 끝난 후 접속을 해 보면 아래와 같은 결과를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/vuejs-with-aspnet-core-04.png)

지금까지 Vue.js 프레임워크를 ASP.NET Core 웹 애플리케이션에 통합하고 애저 웹 앱 인스턴스로 배포하는 절차까지 살펴보았다. 어떻게 보면 간단한 작업은 아닐 수도 있겠으나 최근 각광받고 있는 Vue.js 프레임워크를 다양한 환경에서 실행시킬 수 있다는 측면에서 볼 때 새로운 선택지가 생겼다고 볼 수 있겠다. [다음 포스트](http://blog.aliencube.org/ko/2017/02/23/running-vuejs-with-typescript-on-aspnet-core-apps/)에서는 [타입스크립트](http://www.typescriptlang.org/)로 VueJs 앱을 개발하는 것에 대해 알아보도록 하자.
