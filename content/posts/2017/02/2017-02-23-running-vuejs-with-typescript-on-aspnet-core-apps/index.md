---
title: "Vue.js + TypeScript 조합으로 ASP.NET Core 애플리케이션 개발하기"
date: "2017-02-23"
slug: running-vuejs-with-typescript-on-aspnet-core-apps
description: ""
author: Justin-Yoo
tags:
- front-end-web-dev
- asp-net-core
- azure-website
- typescript
- vue-js
- webpack
fullscreen: false
cover: ""
---

[지난 포스트](http://blog.aliencube.org/ko/2017/02/13/running-vuejs-on-aspnet-core-apps/)에서는 ASP.NET Core 애플리케이션 위에서 [Vue.js](https://vuejs.org/) 프레임워크를 결합하는 것에 다뤘다. VueJs는 자체적으로 [타입스크립트](http://www.typescriptlang.org/)를 지원하므로 손쉽게 타입스크립트의 장점을 이용해서 웹 애플리케이션을 개발할 수 있다. 하지만 최근 VueJs를 이용한 앱 개발에 필수 요소라 할 수 있는 [WebPack](http://webpack.github.io/) 라이브러리가 2.x 대로 버전업을 했음에도 불구하고 인터넷에 있는 [많은](https://herringtondarkholme.github.io/2016/10/03/vue2-ts2/) [예제들](http://www.mindissoftware.com/Vue-Sample-in-Typescript/)은 여전히 WebPack 1.x 버전을 기준으로 언급하고 있다. 게다가 [vue-cli](https://github.com/vuejs/vue-cli)를 이용해 설치할 수 있는 [기본 템플릿](https://github.com/vuejs-templates)으로 설명한 예제는 도저히 찾을 수 없다. 따라서, 이 포스트는

- 기본 템플릿을 이용하면서,
- 웹팩 2.x 버전을 기준으로,
- vue-js 2.x 버전과 TypeScript 2.x 버전을 이용한,
- asp-net-core 웹 애플리케이션을 만들어 보려고 한다.

> 이 포스트에서 사용한 예제 코드는 [이곳](https://github.com/devkimchi/Vue.js-with-ASP.NET-Core-Sample)에서 확인할 수 있다.

## 사전 준비사항

- [지난 포스트](http://blog.aliencube.org/ko/2017/02/13/running-vuejs-on-aspnet-core-apps/)에서 만들어 본 ASP.NET Core 앱
- [TypeScript 2.1.6+](http://www.typescriptlang.org/index.html#download-links)

## npm 패키지 설치

### TypeScript

타입스크립트는 설치할 때 이 애플리케이션에만 적용시킬 수도 있고,

https://gist.github.com/justinyoo/a72a28a0657d7eeb43bed883c14629c5

아니면 내 개발 머신 전체에 적용시킬 수도 있다.

https://gist.github.com/justinyoo/d75e768d1b11a36487073dc751c30d36

만약 위와 같이 글로벌 설치를 했다면 아래와 같이 링크를 시켜주도록 하자.

https://gist.github.com/justinyoo/15ba24a4ec8d62f7e469dac0e0e7eecf

### `ts-loader`

타입스크립트 설치가 끝났다면 웹팩에서 이 타입스크립트를 자동으로 로드할 수 있는 라이브러리인 [`ts-loader`](https://www.npmjs.com/package/ts-loader)를 설치한다.

https://gist.github.com/justinyoo/8bc729d416b75955abe7c6343c71c9f7

### `vue-class-component` & `vue-property-decorator`

이번엔 Vue 인스턴스를 클라스로 만들 때 쓸 수 있는 데코레이터 라이브러리인 [`vue-class-component`](https://www.npmjs.com/package/vue-class-component)를 설치한다

https://gist.github.com/justinyoo/d5d8cdf6bc9f08dd4a28461d636e2632

필요하다면 [`vue-property-decorator`](https://www.npmjs.com/package/vue-property-decorator) 설치도 고려해 볼 수 있다. 이 포스트에서는 다루지 않는다.

https://gist.github.com/justinyoo/da24bb21b9b38169030dc3e7e7a44045

### `vue-typescript-import-dts`

마지막으로 타입스크립트에서 `*.vue` 파일을 타입스크립트처럼 인식할 수 있게 하는 타입 정의 라이브러리가 필요하다.

https://gist.github.com/justinyoo/507640fadd3bbadff5b8d0599973d7e8

이제 필요한 npm 패키지 설치는 다 끝났다. 본격적으로 타입스크립트로 변환시켜보자.

## TypeScript 변환을 위한 환경 설정

### `tsconfig.json`

우선 타입스크립트 컴파일시 참조할 환경 설정을 해야 한다. 이는 `tsconfig.json` 파일을 생성하면 된다. 이와 관련해서 더 자세한 내용은 [타입스크립트 환경설정 페이지](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html)를 참조하도록 한다. 여기서는 가장 최소한으로 작동할 수 있는 만큼만 설정해 놓았다.

https://gist.github.com/justinyoo/41d817be562def872354c1e5e31db8b1

기본적으로 VueJs는 ECMAScript 5를 지원하므로 타입스크립트 컴파일 역시도 `es5`로 타겟팅한다. 그리고, 이런 이유에서 컴파일에 쓰이는 모듈은 `CommonJs`를 사용한다. 또한 `lib` 항목도 `es5` 타겟팅에 맞춰 `dom`, `es2015`, `es2015.promise`를 선택한다.

`types` 항목은 타입 정의 항목을 지정하는 부분인데, 앞서 `vue-typescript-import-dts`라는 라이브러리를 추가했으므로 이를 여기에 적용시킨다. 이로써 `*.vue` 파일들을 타입 정의할 수 있게 됐다. 그리고 바로 이 `experimentalDecorators` 속성이 굉장히 중요한데, 이는 타입스크립트 안에서 클라스 지정시 데코레이터를 사용할 수 있는지 여부를 결정하는 것이다. 값을 `true`로 지정한다. VueJs에서 타입스크립트를 쓰려면 이 데코레이터를 활용하는 것을 [공식 문서](https://vuejs.org/v2/guide/typescript.html#Class-Style-Vue-Components)에서도 강력하게 추천하고 있다.

모든 `.ts` 파일들이 `src` 디렉토리 아래에 존재하므로 컴파일을 위해 들여다보는 위치를 위와 같이 지정한다.

### `.eslintignore`

타입스크립트를 이용해 개발하다 보면 자바스크립트 파일은 자동으로 컴파일시 만들어지는 것에 불과하다. 따라서, 이 파일이 어떤 모양이 될지는 예상할 수 없으므로 `ESLint`를 거칠 필요가 없다. `ESLint`를 거쳐봤자 오류를 낼 것이 명확하므로 아예 `.eslintignore` 파일에 `src/**/*.js` 항목을 추가하여 생성된 자바스크립트가 `ESLint` 검증 과정에서 발생하는 오류를 무시한다.

여기까지 해서 타입스크립트 컴파일을 위한 기본 환경 설정을 끝냈다.

## TypeScript 변환

이제 기본 템플릿에 포함되어 있는 파일들을 수정할 차례이다. 기본 템플릿으로 VueJs 애플리케이션을 설치했다면 `build`, `src` 등의 폴더를 볼 수 있다. 이 폴더에 있는 여러 파일들을 타입스크립트에 맞게 수정해야 한다.

### `build/webpack.base.conf.js`

애플리케이션의 첫 진입로를 `main.js` 에서 `main.ts`로 수정한다.

https://gist.github.com/justinyoo/dfd9b2582a223625676f516ebad22090

그 다음에 위에서 추가한 `ts-loader` 라이브러리를 규칙에 추가한다.

https://gist.github.com/justinyoo/1312203169f6a99841cb8e0703ab98bf

`ts-loader`를 규칙에 추가하면 확장자가 `.ts`일 경우 이 `ts-loader`를 거쳐서 처리를 하게 된다. `appendTsSuffixTo` 라는 옵션이 중요한데, 이 옵션을 사용하면 `*.vue` 파일도 마치 `.ts` 파일인 것 처럼 처리한다. Vue 콤포넌트는 [Single File Component (단일 파일 콤포넌트)](https://vuejs.org/v2/guide/single-file-components.html) 라는 형식을 사용하는데, 이것은 파일 하나에 HTML 영역, 자바스크립트 영역, 그리고 CSS 영역을 구분해 놓았다. 따라서 이 파일 안의 자바스크립트 영역을 타입스크립트로 간주해서 처리하게끔 해야 할 필요가 있다.

이제 본격적으로 기존 자바스크립트 파일을 타입스크립트 파일로 수정해 보자.

### `src/main.js` – `src/main.ts`

기존의 자바스크립트를 타입스크립트 문법에 맞게 아래와 같이 수정한다.

https://gist.github.com/justinyoo/bda07ec08656ccf2fb7e15ffa4c40a2d

`new Vue({ ... })` 부분을 주목하자. `render` 함수를 추가하고 대신 `template`, `components` 속성이 빠졌다. 타입스크립트를 이용해 이미 모든 것들이 컴파일 되어 있는 상태이므로 여기서는 간단히 렌더링만 하면 된다. 결국 `template`과 `components` 속성 대신 `render` 함수로 교체하는 것으로 이해하면 좋다 (최소한 나는 그렇게 이해했다). 좀 더 자세한 사항은 [공식 문서](https://vuejs.org/v2/guide/render-function.html)를 참조하도록 하자.

### `src/router/index.js` – `src/router/index.ts`

라우터 파일은 크게 수정할 부분이 없다. 다만 `import ...` 부분을 신경써서 수정해 주면 된다.

https://gist.github.com/justinyoo/61c47a5afd905aceb4f732a9f515b600

### `src/App.vue` – `src/App.ts`

우선 기존의 `App.vue` 파일 안에 있는 자바스크립트 부분을 별도로 빼서 `App.ts` 파일로 만든다. 이렇게 함으로써, 타입스크립트의 잇점을 완벽하게 활용할 수 있다. 우선 `App.ts` 부분을 보면 이렇게 바뀐다.

https://gist.github.com/justinyoo/287d98d7b01b239bff7b2036b24ace13

코드가 좀 더 훨씬 많아졌다! 지금 이것은 기본 템플릿에서 간단한 클라스만 작성하는 문법이라 그렇게 보이지만, 실제 실무에서 적용할 때에는 타입스크립트 문법이 훨씬 더 간결해 질 것이다. 클라스 이름은 `@Component` 데코레이터에 정의한다.

이렇게 `App.ts`를 작성하고 난 다음에 원래 `App.vue` 파일은 아래와 같이 수정한다. `script` 태그에 `lang="ts"` 속성을 추가하는 것을 잊지 말자.

https://gist.github.com/justinyoo/5b911b04d12208d8cc4ecbc9e080c837

### `src/components/Hello.vue` – `src/components/Hello.ts`

`Hello.vue` 파일 안의 자바스크립트 부분을 `Hello.ts` 파일로 빼낸다. 어떻게 바뀌는지 살펴보자.

https://gist.github.com/justinyoo/0206339fe2e57f005e020a0835cfeace

마찬가지로 클라스 이름을 `@Component` 데코레이터에서 정의하는 형태로 바꾸었다. 또한, Vue 인스턴스에서 필드는 모두 `data` 함수 안에 정의해야 하는데, 타입스크립트로 바꾸면서 좀 더 익숙한 형태의 클라스 속성으로 바뀌었다. 펑션은 그대로 메소드 형태로 바꾸면 된다.

> 눈썰미가 있는 사람이라면 [이전 포스트](http://blog.aliencube.org/ko/2017/02/13/running-vuejs-on-aspnet-core-apps/)와 비교해서 바뀐 점이 하나 있는 것을 알아챘을 것이다. AJAX 콜을 위해 [`vue-resource`](https://www.npmjs.com/package/vue-resource) 대신 [`axios`](https://www.npmjs.com/package/axios)를 사용하는 것으로 바꾸었다. [VueJs 공식 블로그 포스트](https://medium.com/the-vue-point/retiring-vue-resource-871a82880af4#.5i9h45v0r)에서는 더이상 `vue-resource`는 VueJs의 공식 라이브러리로 지원하지 않고 대신 기능이 훨씬 풍부한 `axios`를 추천한다고 한다. 이외에도 `vue-resource` 라이브러리와 달리 `axios`는 타입스크립트도 잘 지원한다. 그렇다면 굳이 지원이 끊어진 `vue-resource`를 고집할 이유가 없다. 기본적인 사용방법은 거의 동일하므로 큰 혼동은 없다.

이렇게 `Hello.ts`를 생성한 후 기존의 `Hello.vue`는 아래와 같이 수정하면 된다.

https://gist.github.com/justinyoo/8822dcc01f6b76a808b7010b3e7d4333

여기까지 해서 타입스크립트 변환을 위한 모든 작업이 끝났다! 뭔가 굉장히 복잡한 것 처럼 보이는데, 기본 템플릿이 자바스크립트용으로 작성된 것이어서 그걸 타입스크립트 환경에 맞춰 바꾸는 작업에 불과하다. 모든 설정이 끝났으니, 앞으로 작성하는 모든 코드는 타입스크립트로 하면 된다. 참 쉽죠?

이제 로컬 환경에서 비주얼 스튜디오의 F5 키를 눌러 실행시켜보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/vuejs-with-typescript-on-aspnet-core-01.png)

> 위 그림 우측에 보이는 창은 [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)라는 크롬 익스텐션이다. 설치한 후 개발자도구를 통해 사용할 수 있다.

## One More Thing ...

여기까지 해서 VueJs를 위한 모든 변환이 끝났다. 하지만 위와 같은 변경은 로컬 개발 환경을 위한 것이다. 이제 실제 배포를 위한 환경을 마지막으로 구성해 보도록 하자. 배포를 위해서는 아래와 같은 순서를 따라야 한다.

1. 타입스크립트 파일을 컴파일해서 자바스크립트 파일을 생성한다.
2. 웹팩을 통해 빌드해서 모듈화 및 번들링을 한다.
3. ASP.NET Core 라이브러리를 빌드한다.
4. 애저 혹은 IIS로 배포하기 위한 아티팩트를 생성한다.
5. 배포한다.

1번-3번 항목은 `package.json` 파일과 `project.json` 파일을 수정하면 된다.

### `package.json`

`package.json` 파일을 열어 보면 아래와 같이 `scripts` 항목이 있다. 이부분이 원래는 아래와 같았다.

https://gist.github.com/justinyoo/b792d50d09076afbe7ce895f50281c08

여기에 타입스크립트 컴파일 항목을 추가해야 한다. 아래와 같이 바꾸도록 하자.

https://gist.github.com/justinyoo/e6e865afe5f1128dec12c3696836157e

`build:ts` 항목을 추가하여 타입스크립트 컴파일을 담당하게 하고 `build:main` 항목을 추가하여 기존의 웹팩 빌드를 담당하도록 한다. 그리고 원래 `build` 항목은 이 둘을 호출하는 것으로 바꾸도록 하자. `--no-deprecation` 옵션이 궁금할 수도 있는데, 이는 컴파일시 `ts-loader` 부분에서 deprecation 관련 경고를 내뱉기 때문이다. 비주얼 스튜디오에서는 이 경고를 에러로 처리해서 배포를 할 수 없다. 따라서 저 `--no-deprecation` 옵션을 주면 해당 경고를 없앨 수 있다.

### `project.json`

마지막으로 `project.json` 파일을 열어 아래 부분을 확인해 보도록 하자.

https://gist.github.com/justinyoo/54fef91bde8c83ac58e4320f5d7de779

모든 설정이 끝났다! 비주얼 스튜디오를 통해 Azure로 배포하면 아래와 같은 화면을 만날 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/vuejs-with-typescript-on-aspnet-core-02.png)

비주얼 스튜디오가 아닌 CI/CD 환경이라면 `dotnet publish` 기능을 이용하면 된다.

지금까지 Vue.js 프레임워크를 타입스크립트로 작성하고 ASP.NET Core 웹 애플리케이션에 얹어서 Azure로 배포하는 일련의 작업을 해 보았다. 앞서도 언급했다시피 최초 설정만 조금 복잡해 보일 뿐 그 다음부터는 여타 타입스크립트를 이용해서 개발하는 것과 다르지 않다. 다음 포스트에서는 실제로 이를 이용해서 모바일 웹 앱을 개발해 보도록 하자 (언제가 될련지는 모르겠지만).
