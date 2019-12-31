---
title: "TypeScript 라이브러리를 이용한 Angular 앱 만들기"
date: "2015-09-05"
slug: building-angular-app-using-typescript
description: ""
author: Justin-Yoo
tags:
- front-end-web-dev
- angular-js
- typescript
fullscreen: false
cover: ""
---

[AngularJS(이하 `ng`)](https://angularjs.org)는 SPA에 쓰이는 자바스크립트 프레임워크들 중에서 가장 인기 있는 것이라고 해도 과언이 아니다. `ng`는 현재 2.x 버전이 알파 테스트 중이며 현재는 1.4.x 버전이 쓰이고 있는데, 2.x 버전은 [TypeScript (이하 ts)](http://www.typescriptlang.org)를 이용해서 만들어진다고 한다. 그렇다면, 1.4.x 버전의 `ng`에서는 `ts`를 쓸 수 없는가 하면, 또 그런 것도 아니다. 이 포스트를 비롯해 이어지는 일련의 포스트들에서는 `ts`를 이용하여 `ng` 앱을 개발하는 것에 대해 간단한 예제코드를 통해 다루어 보려고 한다.

> - **TypeScript 라이브러리를 이용한 Angular 앱 만들기**
> - [Angular 앱에 Web API 적용하기](http://blog.aliencube.org/ko/2015/09/06/applying-web-api-to-angular-app/)
> - [Web API 응답 문서에 HAL 적용하기](http://blog.aliencube.org/ko/2015/08/16/applying-hal-to-rest-api/)
> - [Swagger 및 HAL, AutoRest를 이용한 Web API 서비스 콘트랙트 자동화](http://blog.aliencube.org/ko/2015/10/25/auto-generating-rest-api-service-contract-by-swagger-hal-and-autorest)
> - [Angular 앱 상호작용 - 이벤트 소싱과 CQRS](http://blog.aliencube.org/ko/2015/11/12/building-applications-on-cloud-with-event-sourcing-pattern-and-cqrs-pattern)

## 준비물

아래 개발 도구들 및 라이브러리는 꼭 필요한 것은 아니지만 있으면 도움이 된다.

- [Visual Studio 2013](https://www.visualstudio.com)
- [TypeScript 1.5 for Visual Studio 2013](https://visualstudiogallery.msdn.microsoft.com/b1fff87e-d68b-4266-8bba-46fad76bbf22)
- [Postman Chrome Extension](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop)

위의 도구들을 활용해서 만든 예제 코드들은 아래의 리포지토리를 통해 확인할 수 있다.

- [https://github.com/devkimchi/TypeScript-WebApi-Sample](https://github.com/devkimchi/TypeScript-WebApi-Sample)

## 정적 HTML 앱 만들기

우선 기본적인 뼈대가 되는 HTML 페이지 앱을 만들어 보도록 하자. 페이지의 목적은 회원가입을 위해 타이틀, 이름, 이메일을 사용자로부터 입력 받는다. 그렇다면 대략 아래와 같은 모양이 될 것이다.

```html
<form method="POST">
  <ul>
    <li>
      Title:
      <select id="salutation" name="salutation">
        <option value="Mr">Mr</option>
        <option value="Ms">Ms</option>
        <option value="Mrs">Mrs</option>
        <option value="Mx">Mx</option>
      </select>
    </li>
    <li>
      Name:
      <input type="text" id="givenName" name="givenName" placeholder="Enter your name" />
    </li>
    <li>
      Email:
      <input type="email" id="email" name="email" placeholder="Enter your email" />
    </li>
    <li>
      <input type="submit" id="submit" name="submit" />
    </li>
  </ul>
</form>

```

이렇게 해서 보이는 모양은 대략 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/09/registration.png)

아무런 기능도 없는 대략의 모양이니, 이제 이것을 가지고 `ng` 앱으로 변환해 보도록 하자.

## Angular 앱으로 변환하기

`ng` 앱을 개발하는데 있어서 가장 핵심적인 기능이라고 감히 하나를 선택하라고 한다면 directive 가 될 것이다. 얼마나 directive 를 자유자재로 다룰 수 있는가에 따라 얼마나 손쉽게 `ng` 앱을 개발할 수 있는가가 결정된다고 할 수 있다. directive 에 대한 자세한 내용은 `ng` 공식 문서를 참조하도록 하자.

- [Creating Custom Directives](https://docs.angularjs.org/guide/directive)

### `index.html`에 `ng` 라이브러리 추가하기

이제 위의 HTML 코드가 들어있는 `index.html` 문서를 수정하여 `ng` 라이브러리를 사용할 수 있게끔 하자.

```html
<body>
  <script>
    angular.element(document).ready(function () {
      angular.bootstrap(document, ["app"]);
    });
  </script>
</body>

```

보통은 `<body ng-app>` 하는 식으로 스코프를 설정하는데, 여기서는 위와 같이 부트스트래퍼를 이용해서 설정을 했다. 이렇게 하는 이유는 좀 더 개발자가 콘트롤 할 수 있기 때문이다. 다시 말하지만 꼭 이렇게 할 필요는 없다.

그다음에 `ng` 라이브러리들을 참조하도록 하자.

```html
<body>
  <script src="Scripts/angular.js"></script>
  <script src="Scripts/angular-animate.js"></script>
  <script src="Scripts/angular-route.js"></script>

  <script>
    angular.element(document).ready(function () {
      angular.bootstrap(document, ["app"]);
    });
  </script>
</body>

```

위에 추가한 라이브러리들은 모듈 생성시 기본적으로 추가되는 것으로 생각하면 된다. 자, 이제 `ts`를 이용해서 이 `ng` 앱을 초기화 하도록 하자.

```ts
/// <reference path="../Scripts/typings/angularjs/angular.d.ts" />

"use strict";

angular.module("app", [
  // Angular modules
  "ngAnimate",
  "ngRoute"

  // Custom modules

  // Third-party modules
]);

```

`ng` 앱의 스코프를 `app`이라는 이름으로 지정해 놓았기 때문에, 모듈 추가 역시 이 `app` 스코프로 한정지을 수 있다. 앞서 추가했던 라이브러리들 `angular-animate.js`와 `angular-route`를 모듈에 위와 같이 추가한 것을 볼 수 있다. 눈여겨봐야 할 부분은 맨 윗줄의 `/// <reference ...` 부분인데 이것은 [DefinitelyTyped](http://definitelytyped.org)에서 제공하는 `ts` 정의 파일이다. 없어도 되지만 이게 있을 경우 굉장히 손쉽게 코드 작성을 할 수 있다. [NuGet](https://nuget.org)에서도 이를 제공하고 있으니 추가해서 사용하면 된다. 위에서 작성한 `ts` 파일을 `App.ts`라고 지정한 후 컴파일하면 `App.js` 파일이 생성된다. 이를 위의 `index.html` 파일에 추가하도록 하자.

```html
<body>
  <script src="Scripts/angular.js"></script>
  <script src="Scripts/angular-animate.js"></script>
  <script src="Scripts/angular-route.js"></script>

  <script src="App/App.js"></script>

  <script>
    angular.element(document).ready(function () {
      angular.bootstrap(document, ["app"]);
    });
  </script>
</body>

```

여기까지 하면 기본적인 앱 설정은 끝났다. 하지만 아직 실제 폼 데이타를 로딩하지는 않았기 떄문에, 이제부터 이를 `ng`를 이용해 로딩해 보도록 하자.

### 사용자정의 디렉티브 생성하기

아래와 같이 `<div class="main" main-content></div>`를 추가한다.

```html
<body>
  <div class="main" main-content></div>

  <script src="Scripts/angular.js"></script>
  <script src="Scripts/angular-animate.js"></script>
  <script src="Scripts/angular-route.js"></script>

  <script src="App/App.js"></script>

  <script>
    angular.element(document).ready(function () {
      angular.bootstrap(document, ["app"]);
    });
  </script>
</body>

```

눈치챘다시피 `main-content`라는 사용자 정의 디렉티브를 사용할 계획이다. 그렇다면, 이 디렉티브에 대응하는 `ng` 스크립트를 `ts`로 만들어 보도록 하자.

```ts
/// <reference path="../../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../models/registrationModel.ts"/>

"use strict";

module app.angular.Directives {
  import RegistrationModel = angular.Models.RegistrationModel;
  import Salutation = angular.Models.Salutation;

  export interface IMainContentScope extends ng.IScope {
    model: angular.Models.RegistrationModel;
  }

  export class MainContent implements ng.IDirective {
    replace = true;
    restrict = "EA";
    scope = {};
    templateUrl = "/App/components/mainContent/mainContent.html";

    controller($scope: IMainContentScope) {
      $scope.model = new RegistrationModel();
      $scope.model.salutations = [
        new Salutation("Mr", "Mr"),
        new Salutation("Ms", "Ms"),
        new Salutation("Mrs", "Mrs"),
        new Salutation("Mx", "Mx")
      ];
    }
  }
}

angular.module("app")
  .directive("mainContent", () => new app.angular.Directives.MainContent());

```

먼저 디렉티브에 쓰이는 스코프를 `IMainContentScope`라는 이름으로 `ng.IScope`라는 인터페이스를 상속 받아 정의한다. 이 스코프는 `model` 이라는 속성 하나만을 가지고 있다. 다음으로 `MainContent`라는 이름으로 디렉티브를 정의한다. 이렇게 정의한 디렉티브는 모듈에 `mainContent` 라는 이름으로 종속성 주입을 시킨다.

디렉티브를 좀 더 자세히 들여다 보자. 이 디렉티브는 템플릿 파일로 `mainContent.html` 파일을 읽어들여 사용하고, 스코프의 `model` 속성에 Mr, Mrs, Ms, Mx 와 같은 salutation 들을 추가한다. 이 `RegistrationModel`과 `Salutation` 모델은 `registrationModel.ts` 라는 별도의 파일을 이용해서 정의해 놓았다.

```ts
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />

"use strict";

module app.angular.Models {
  export class Salutation {
    constructor(text: string, value: string) {
      this.text = text;
      this.value = value;
    }

    text: string;
    value: string;
  }

  export class RegistrationModel {
    salutations: Array<Salutation>;
  }
}

```

이렇게 만들어진 `ts` 파일을 컴파일하면 `mainContent.js` 파일과 `registrationModel.js` 파일이 생성된다. 이를 `index.html`에 추가시킨다.

```html
<body>
  <div class="main" main-content></div>

  <script src="Scripts/angular.js"></script>
  <script src="Scripts/angular-animate.js"></script>
  <script src="Scripts/angular-route.js"></script>

  <script src="App/App.js"></script>
  <script src="App/models/registrationModel.js"></script>
  <script src="App/components/mainContent/mainContent.js"></script>

  <script>
    angular.element(document).ready(function () {
      angular.bootstrap(document, ["app"]);
    });
  </script>
</body>

```

이제 `ng` 앱이 다 만들어졌다! 실행을 시켜보자. 그러면 앞서와 동일한 페이지가 생성된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/09/registration.png)

이렇게 하면 `ts`를 이용해서 `ng` 앱을 만드는 예제는 다 끝났다. 참 쉽죠?

## 타입스크립트 정리

여기까지 읽어봤다면 몇가지 `ts` 문법이 쓰인 것을 볼 수 있다. 기본적으로 `ts`는 객체지향 사상을 자바스크립트에 반영시킬 수 있는 수퍼셋이기 때문에 클라스, 인터페이스, 네임스페이스 등의 개념을 적용시킬 수 있다.

- `module`: 모듈은 하나의 네임스페이스 개념으로 정리할 수 있다. 위에서는 `module app.angular.Directives` 같은 형태로 지정을 했다. 이렇게 하면 이 모듈 밖에서는 모듈 안의 내용을 볼 수 없기 때문에 모듈 밖에서 사용하고 싶은 클라스 혹은 인터페이스는 외부로 노출시켜줘야 한다.
- `export`: 모듈 내에 정의된 클라스 혹은 인터페이스를 모듈 밖으로 노출시키고 싶을 때 사용한다.
- `extends`: 인터페이스 또는 클라스를 상속할 때 사용한다.
- `implements`: 인터페이스를 클라스에 구현할 때 사용한다.
- `constructor()`: 클라스 생성자 정의시 사용한다.

여기서 사용한 `ts` 대응 문법은 대략 위와 같이 정리할 수 있다. 객체지향 개념에 익숙한 개발자라면 크게 어렵지 않게 적용할 수 있으니 이제 자바스크립트도 이렇게 개발하면 될 것이다.

[다음 포스트](http://blog.aliencube.org/ko/2015/09/06/applying-web-api-to-angular-app/)에서는 이렇게 만들어진 `ts-ng` 앱에 Web API를 적용시켜 보는 것에 대해 알아보도록 하자.
