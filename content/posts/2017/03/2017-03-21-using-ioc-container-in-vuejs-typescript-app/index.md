---
title: "Vue.js + TypeScript 앱에서 IoC 컨테이너 사용하기"
date: "2017-03-21"
slug: using-ioc-container-in-vuejs-typescript-app
description: ""
author: Justin-Yoo
tags:
- front-end-web-dev
- asp-net-core
- typescript
- vue-js
- dependency-injection
- di
- inversify-js
- inversion-of-control
- ioc
fullscreen: false
cover: ""
---

애플리케이션을 개발하다보면 필연적으로 맞닥뜨릴 수 밖에 없는 상황이 몇가지가 있다. 그 중 하나가 바로 의존성 관리(Dependency Control)이다. 백엔드 애플리케이션에서는 다양한 제어 역전(IoC; Inversion of Control) 컨테이너를 이용해서 적용이 가능하다. 최신 프론트엔트 프레임워크 역시도 의존성 주입(DI; Dependency Injection)과 관련한 기능들을 포함하고 있다. 하지만 자바스크립트 언어의 특성인지는 몰라도 백엔드쪽의 IoC 컨테이너와는 다른 형식으로 DI를 구현한다. 이 포스트에서는 [타입스크립트](http://www.typescriptlang.org/)를 이용해서 [Vue.js](https://vuejs.org/) 애플리케이션을 개발할 때 적용할 수 있는 IoC 컨테이너중 하나인 [InversifyJS](http://inversify.io/)를 이용해서 백엔드 애플리케이션 개발과 거의 비슷한 개발 경험을 적용시켜 보도록 한다.

> 이 포스트에 쓰인 샘플 코드는 [이곳](https://github.com/devkimchi/Vue.js-with-ASP.NET-Core-Sample)에서 확인할 수 있다.

## VueJs 자체 제공 DI

이 [공식 문서](https://vuejs.org/v2/api/#provide-inject)에 보면 버전 2.2.0+ 부터 DI를 지원한다고 되어 있다. 아래는 공식 문서에서 제공하는 방식으로, 우선 부모 컴포넌트에서 디펜던시를 정의한다.

https://gist.github.com/justinyoo/a3b7147bae05720ec16690b5474ca2ea

그리고 부모 컴포넌트에서 주입한 디펜던시를 자식 콤포넌트에서 받아 활용할 수 있다.

https://gist.github.com/justinyoo/d9f59fe512a94fa164a6be7a7b0d87ee

위 코드를 보면 손쉽게 이해할 수 있다. 부모 컴포넌트에서 정의한 `MyDependency` 객체를 자식 컴포넌트에서 받아서 곧바로 접근이 가능한 셈이다. 하지만, 이 방식에서는 중대한 문제가 하나 있다. 백엔드 개발 경험이 있는 개발자라면 이런 식의 DI는 굉장히 제한적일 수 밖에 없다. 오직 부모 컴포넌트가 지정한 디펜던시 인스턴스만 자식 컴포넌트에서 활용할 수 있고 그 이외에는 접근이 불가능하다. 게다가 개별 디펜던시간의 의존성 역시 해결하기 쉽지 않다.

## VueJs + 타입스크립트 적용시 DI

VueJs의 주 메인테이너인 [Evan You](https://twitter.com/youyuxi)의 [코멘트](https://github.com/vuejs/vue/issues/2371#issuecomment-284052430)를 보면 오히려 VueJs의 프레임워크 디자인 철학에 가까운 것인데, 기본적으로 타입스크립트와 같은 클라스 기반 API 보다는 자바스크립트의 본래 모습에 가까운 오브젝트 기반 API를 제공하는 것을 우선으로 한다. 따라서 위의 코드는 타입스크립트 기반에서는 주입된 `MyDependency`를 활성화시킬 수 없어 정상적으로 작동하지 않는다.

> 이 부분은 `vue@2.2.2` 버전을 기준으로 언급하는 것이다. 최근 버전에서는 달라졌을 수 있다.

따라서 VueJs에 타입스크립트를 적용시킬 때 DI를 원활하게 지원하기 위해서는 객체간 상호 의존성과 기존 오브젝트 기반 DI 이 두가지를 해결해야 한다. 이 두가지는 [InversifyJS](http://inversify.io/)를 이용해서 서비스 로케이터 패턴을 적용하면 IoC 컨테이너 자체를 최상위 Vue 컴포넌트에 디펜던시로 정의하면 손쉽게 해결이 가능하다.

> 서비스 로케이터 패턴은 [안티 패턴](http://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/)으로써 그다지 환영받을만한 접근법은 아니지만 이 경우에는 다른 방법이 없으니 어쩔 수 없다. 물론 다른 더 좋은 방법이 분명히 있을텐데 찾지 못했다. 아무래도 VueJs에 좀 더 전문적인 식견을 가진 누군가가 이부분을 도와주면 더욱 좋겠다. **업데이트**: 이 포스트 하단에 VueJs에서 제공하는 `provide`/`inject` 쌍을 타입스크립트에서 제대로 활용하는 방법에 대해 언급해 놓았다.

## InversifyJS로 IoC 컨테이너 구성하기

[InversifyJS](http://inversify.io/)는 타입스크립트에서 IoC 컨테이너를 구현하기 위한 라이브러리로 [Ninject](http://www.ninject.org/)의 문법을 상당부분 차용했다. 따라서 C#으로 백엔드를 구현하면서 Ninject를 써 봤다면 쉽게 이해할 수 있다. 아래와 같이 같단한 인터페이스 타입을 정의해 보자. Ninject와 InversifyJS 개발자들이 닌자 덕후라서 아래와 같은 타입이 나온 걸 감안하고 보자.

### 인터페이스 정의

https://gist.github.com/justinyoo/a55a6ff52dd82f71522e5dbaa5207f0c

위와 같이 기본적인 `Weapon`과 `Warrior` 타입 인터페이스를 정의했다. 아래는 실제 이 인터페이스를 구현한 모델이다.

### 모델 구현

우선 InversifyJS는 `Symbol`을 이용해서 DI에 필요한 타입을 정의한다. 아래와 같이 `Warrior`와 `Weapon` 인터페이스 타입을 `Symbol`로 정의한다.

https://gist.github.com/justinyoo/ff9c8b3b1a7c795aabf5122007013ca3

`InversifyJS`는 `@injectable`과 `@inject` 데코레이터를 제공한다. 아래는 `@injectable` 데코레이터를 이용해서 클라스 타입을 정의한 코드이다.

https://gist.github.com/justinyoo/f75994e6a536d687b5938f360e651b47

`@inject` 데코레이터는 컨스트럭터 파라미터에 적용시킨다. 이 때 앞서 정의한 `SERVICE_IDENTIFIER.WEAPON`와 같은 `Symbol` 객체를 사용한다. 대신 단순히 `Symbol("Weapon")`을 사용해도 상관없다.

https://gist.github.com/justinyoo/6e3b18bbb76ab2f390986e8d837aa55e

### IoC 컨테이너 생성

앞에서 구현한 모델과 인터페이스를 통해 실제로 IoC 컨테이너를 생성할 차례이다. 아래 코드를 보자.

https://gist.github.com/justinyoo/9319b8207c935886bea1db04d8fb350e

위 코드 마지막의 `container.bind<T>(...).to(...)` 부분을 보면 C#에서 IoC 컨테이너를 구성하는 방법과 상당히 유사한 것을 볼 수 있다. 이렇게 최종적으로 만들어진 `container`를 개별 Vue 컴포넌트에서 사용하기만 하면 된다.

## Vue 컴포넌트에 DI 적용하기

[이전](http://blog.aliencube.org/ko/2017/03/03/accessing-to-camera-on-mobile-devices-from-vuejs-typescript-aspnetcore-apps/) [포스트와는](http://blog.aliencube.org/ko/2017/03/16/accessing-to-geolocation-on-mobile-devices-from-vuejs-typescript-aspnetcore-app/) 달리 `Hello.vue`에 `Ninja.vue`라는 이름의 자식 컴포넌트를 하나 추가해서 DI를 확인해 보도록 하자.

https://gist.github.com/justinyoo/77113f9810c45caf66b28ceaa80417b9

위 코드에서 볼 수 있다시피 `Hello.vue`는 자식 컴포넌트로 `Ninja.vue`를 추가한다. 이제 `Ninja.vue`를 뜯어보자.

https://gist.github.com/justinyoo/f6d6ead15501e97d2c738fdb5d5b711a

`DependencyConfigs.ts`에서 생성한 `container` 인스턴스를 직접 실행시켜 `Ninja` 인스턴스를 받아왔다. 실제로 앱을 실행시켜 보면 아래와 같은 결과를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/03/using-ioc-container-in-vuejs-typescript-aspnetcore-app-01.png)

지금까지 VueJs 앱을 개발할 때 타입스크립트를 사용하게 되면 어떤 식으로 IoC 컨테이너를 활용해서 의존성 관리를 하는지에 대해 간략하게 알아보았다. 아직까지는 VueJs 프레임워크 수준에서 DI 관련 타입스크립트 지원이 미진한 감이 있지만 조만간 [`vue-property-decorator`](https://www.npmjs.com/package/vue-property-decorator) 또는 [`vue-class-component`](https://www.npmjs.com/package/vue-class-component) 라이브러리에서 좀 더 간결한 DI 접근 방식에 대한 업데이트가 있길 기대한다. 위 내용은 서비스 로케이터 패턴을 사용한 것이고, 아래에 `provide`/`inject` 쌍을 `vue-property-decorator` 라이브러리를 이용해서 구현한 내용을 추가한다.

## 추가: `provide`/`inject` 쌍을 이용한 DI

이 포스트를 작성한 후 혹시나 해서 [`vue-property-decorator`](https://www.npmjs.com/package/vue-property-decorator) 라이브러리 개발자에게 최근 업데이트한 `@Inject` 데코레이터를 어떤 식으로 활용 가능한지 문의해 보았더니 [답을 남겨주었다](https://github.com/kaorun343/vue-property-decorator/issues/12). 따라서 이 방법을 활용해 보도록 하자.

https://gist.github.com/justinyoo/455c9c907679cbfaa109a63945dcf11e

Vue 컴포넌트의 최상단에 위치한 `App.vue`에 위와 같이 `InversifyJS` IoC 컨테이너를 주입한다. 다른 Vue 컴포넌트는 모두 이 `App.vue`의 자식 컴포넌트이기 때문에 이 컨테이너는 이제 어디서든 꺼내 쓸 수 있다. 이제 `Ninja.vue` 컴포넌트를 이에 맞추어 수정해 보자.

https://gist.github.com/justinyoo/0a6283d07b43f477387d4d1acf1f0d67

`Component` 데코레이터를 `vue-class-component` 대신 `vue-property-decorator`에서 `Inject` 데코레이터와 함께 가져온다. 앞서 `App.vue`에서 주입한 IoC 컨테이너를 이 `Ninja.vue`에서 `@Inject` 데코레이터를 이용해 직접 사용할 수 있다. 이 IoC 컨테이너는 다른 컴포넌트와 공유할 이유가 없기 때문에 `private` 스코프로 지정했다. 이렇게 해서 다시 애플리케이션을 실행시켜보면 위에 언급한 스크린샷과 동일한 결과를 얻을 수 있다.
