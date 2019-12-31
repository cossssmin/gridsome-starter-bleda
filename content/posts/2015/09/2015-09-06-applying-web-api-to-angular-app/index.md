---
title: "Angular 앱에 Web API 적용하기"
date: "2015-09-06"
slug: applying-web-api-to-angular-app
description: ""
author: Justin-Yoo
tags:
- front-end-web-dev
- angular-js
- typescript
- web-api
fullscreen: false
cover: ""
---

[지난 포스트](http://blog.aliencube.org/ko/2015/09/05/building-angular-app-using-typescript)에 이어 이번에는 Web API를 `ng`에 통합시키는 예제를 보기로 한다.

> - [TypeScript 라이브러리를 이용한 Angular 앱 만들기](http://blog.aliencube.org/ko/2015/09/05/building-angular-app-using-typescript)
> - **Angular 앱에 Web API 적용하기**
> - [Web API 응답 문서에 HAL 적용하기](http://blog.aliencube.org/ko/2015/08/16/applying-hal-to-rest-api)
> - [Swagger 및 HAL, AutoRest를 이용한 Web API 서비스 콘트랙트 자동화](http://blog.aliencube.org/ko/2015/10/25/auto-generating-rest-api-service-contract-by-swagger-hal-and-autorest)
> - [Angular 앱 상호작용 - 이벤트 소싱과 CQRS](http://blog.aliencube.org/ko/2015/11/12/building-applications-on-cloud-with-event-sourcing-pattern-and-cqrs-pattern)

`ng` 앱은 기본적으로 [MVVM (Model-View-ViewModel) 패턴](https://msdn.microsoft.com/en-us/library/hh848246.aspx)을 지원하는데, 이는 다른 말로 하면 디렉티브가 MVVM의 VM, 즉 ViewModel을 담당하고 이전 포스트에서 선보였던 템플릿이 View, 스코프가 Model의 역할을 담당한다고 할 수 있다. MVVM 패턴은 WPF 앱, UWP 앱, Xamarin 앱 등 여러 앱 개발시 굉장히 널리 쓰이는 패턴이므로 충분히 알아둘 필요가 있다. MVVM는 MVC 패턴 또는 MVP 패턴과 비슷하면서도 다르기 때문에 그 공통점과 차이점들은 [여기](http://www.codeproject.com/Articles/100175/Model-View-ViewModel-MVVM-Explained)를 보면 좀 더 이해가 빠를 것이다. 조금 더 자바스크립트 특화된 MVVM 패턴에 대한 설명은 [이곳](http://addyosmani.com/blog/understanding-mvvm-a-guide-for-javascript-developers/)을 참조하면 더욱 좋다. `ng` 얘기는 없다는 것이 함정

## API 콘트롤러 작성하기

`index.html`의 salutation 부분을 Web API를 통해 받아오는 시나리오를 생각할 수 있다. 따라서, 아래와 같이 API 콘트롤러를 만들어 보도록 하자.

```csharp
public class SalutationsController : ApiController
{
  public virtual async Task<List<Salutation>> Get()
  {
    var salutations = new List<Salutation>();
    await Task.Run(() =>
                   {
                     salutations = new List<Salutation>()
                               {
                                 new Salutation("Mr", "Mr"),
                                 new Salutation("Mrs", "Mrs"),
                                 new Salutation("Ms", "Ms"),
                                 new Salutation("Mx", "Mx"),
                               };
                   });

    return salutations;
  }
}

```

이렇게 만든 API 콘트롤러를 Postman을 통해 호출해 보면 아래와 같은 결과를 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/09/api-response-01.png)

이제 이 결과를 `ng` 앱에서 불러오면 된다.

## Angular 앱 팩토리 서비스 작성하기

앞서 디렉티브가 VM의 역할을 담당한다고 했는데, 이는 그 안에 콘트롤러를 제어하는 부분이 있기 때문이다. 이 콘트롤러에 필요한 몇가지 디펜던시가 있는데, 그 중 하나인 팩토리 서비스를 만들어 보기로 한다.

```ts
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />

"use strict";

module app.angular.Factories {
  export class SalutationsFactory {
    private _baseUrl: string = "/api/salutations";

    constructor(private $http: ng.IHttpService) {
    }

    getResponse(): ng.IHttpPromise<Array<angular.Models.Salutation>> {
      return this.$http.get<Array<angular.Models.Salutation>>(this._baseUrl);
    }
  }
}

angular.module("app")
  .factory("salutationsFactory", [
    "$http",
    ($http) => new app.angular.Factories.SalutationsFactory($http)
  ]);

```

- 우선 `module` 키워드를 이용해서 `app.angular.Factories` 라는 네임스페이스를 작성한다
- 그 안에 `SalutationsFactory`라는 팩토리 서비스를 구현한다.
- 이 팩토리 서비스는 내부적으로 `$http` 라는 인스턴스를 생성자 파라미터로 받아들여 초기화한다.
- API 호출 엔드포인트는 `private _baseUrl` 값을 통해 지금은 하드코딩 된 상태이긴 하지만 다른 식으로 지정할 수도 있다.
- `getResponse()` 메소드는 프로미스 패턴을 리턴하는데, 이는 `$http.get()` 메소드를 호출하게 된다. 눈여겨 봐야 할 부분은 앞서 작성한 API가 반환하는 JSON 결과값을 내부적으로 `ng` 앱에서 정의해 놓은 `angular.Models.Salutation` 모델로 deserialisation 시켜 반환한다는 것이다.
- 이렇게 구현한 팩토리 메소드는 마지막 줄에서 `angular.module("app").factory("salutationsFactory", ...)` 로 호출하여 앱에 등록시킨다.

이렇게 팩토리 서비스 인스턴스를 구현해 보았다. 이제 앞서 구현해 놓았던 디렉티브를 이에 맞게 수정해 보자.

## Angular 앱 디렉티브에 팩토리 서비스 주입하기

아래 디렉티브 코드를 살펴 보자. 기본적인 구조는 동일한데, 어느 부분이 이전과 비교하여 달라졌는지 찾을 수 있겠는가?

```ts
/// <reference path="../../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../models/registrationModel.ts" />
/// <reference path="../../factories/salutationsFactory.ts" />

"use strict";

module app.angular.Directives {
  import RegistrationModel = angular.Models.RegistrationModel;

  export interface IMainContentScope extends ng.IScope {
    model: angular.Models.RegistrationModel;
  }

  export class MainContent implements ng.IDirective {
    replace = true;
    restrict = "EA";
    scope = {};
    templateUrl = "/App/components/mainContent/mainContent.html";

    controller($scope: IMainContentScope, salutationsFactory: angular.Factories.SalutationsFactory) {
      $scope.model = new RegistrationModel();

      salutationsFactory.getResponse()
        .success((salutations: Array<angular.Models.Salutation>) => {
          $scope.model.salutations = salutations;
        });
    }
  }
}

angular.module("app")
  .directive("mainContent", () => new app.angular.Directives.MainContent());

```

바로 콘트롤러 부분이다. 이전 디렉티브에서는 `controller($scope: IMainContentScope) { ... }` 형태였다면, 지금은 앞서 구현해 놓은 `salutationsFactory`를 추가 디펜던시로 지정해 놓았다는 점이다. 또한 `$scope.model.salutations` 속성에 값을 지정하는 부분을 보면 `salutationsFactory.getResposne()` 메소드를 통해 API를 호출하여 salutation 배열값을 지정할 수 있다.

## 결과

이렇게 해서 팩토리 서비스 인스턴스를 디렉티브에 주입시킨 후 앱을 실행시켜 보면 당연하겠지만 아래와 같은 화면을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/09/registration.png)

그리고, 크롬의 개발자 도구를 이용하면 실제로 API를 통해 값이 들어온 것 역시도 확인이 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/09/api-response-02.png)

지금까지 `ng` 앱과 Web API를 통합하여 MVVM의 VM을 구현하는 방법에 대해 알아보았다. [다음 포스트](http://blog.aliencube.org/ko/2015/08/16/applying-hal-to-rest-api/)에서는 조금 더 백엔드 쪽에 치중하여 API의 discoverability를 구현할 수 있는 HAL 패턴을 도입해 보도록 한다.
