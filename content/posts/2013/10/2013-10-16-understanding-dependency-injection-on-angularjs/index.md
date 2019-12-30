---
title: "AngularJS 디펜던시 인젝션(DI) 이해하기"
date: "2013-10-16"
slug: understanding-dependency-injection-on-angularjs
description: ""
author: Justin Yoo
tags:
- Front-end Web Dev
- AngularJs
- Dependency Injection
- DI
fullscreen: false
cover: ""
---

객체지향 프로그래밍에서 Dependency Injection (DI) 개념은 아주 중요한데, 개별 객체들 사이에 의존성이 줄어들어야 – 다른 말로 느슨한 결합 (loosely coupled)을 이루거나 – 유지보수 및 확장성, 그리고 테스트 가용성 측면에서 많은 이득을 볼 수 있다. 일반적으로 Java 또는 C# 프로그래밍에서는 아래와 같은 형태로 DI를 구성한다.

```
public class ProductController : ApiController
{
    public ProductController(IProductService service)
    {
        this._service = service;
    }

    private IProductService _service;

    public HttpResponseMessage Get(int id)
    {
        var product = this._service.GetProduct(id);
        return new HttpResponseMessage(200, product);
    }
}

```

위의 코드는 C#으로 구현한 간단한 Web API 콘트롤러이다. 콘트롤러 인스턴스를 초기화할 때, 생성자의 파라미터로서 `IProductService` 인터페이스를 가진 인스턴스를 주입시킨다. 이렇게 하면 저 콘트롤러는 파라미터로 들어온 인스턴스가 어떻게 내부적으로 구현이 되는지 알 필요가 없다. 따라서, `ProductService` 클라스에 변경사항이 생겨도 아무런 문제가 되질 않는다.

이런 식으로 DI를 구성하는 것이 일반적인데, AngularJS에서는 독특한 방식으로 DI를 생성한다. 아무래도 자바스크립트라는 스크립트 언어의 특성 때문이 아닐까 싶기도 한데, 이부분은 여기서 논의할 것은 아니니 다른 기회를 이용하도록 하자. AngularJS에서 DI를 구현하는 방법은 상당히 다양하다. 우선 간단한 HTML 코드를 작성해 보자.

```
<html ng-app="diSample">
    <body>
        <div ng-controller="sampleController">
            <ul>
                <li>text: {{text}}</li>
                <li>di1text1: {{di1text1}}</li>
                <li>di1text2: {{di1text2}}</li>
                <li>di2text: {{di2text}}</li>
                <li>di3text: {{di3text}}</li>
                <li>di4text: {{di4text}}</li>
                <li>di5text: {{di5text}}</li>
                <li>di6text: {{di6text}}</li>
                <li>di7text: {{di7text}}</li>
            </ul>
        </div>
    </body>
</html>

```

`diSample`이라는 모듈의 `sampleController`를 통해 총 아홉개의 데이터를 바인딩 시키는 모델이다. 저 콘트롤러를 담은 자바스크립트는 아래와 같다.

```
(function(angular) {
    var module = angular.module("diSample", []);

    module.controller("sampleController", function($scope) {
        $scope.text = "TEXT";
    });
})(angular);

```

이렇게 하면 `{{text}}` 부분이 `TEXT`로 바뀌어 나오게 된다. 여기서 DI를 적용시켜보자. 우선 `$provide` 서비스를 이용하는 방법이다.

```
module.config(function ($provide) {
    $provide.provider("di1", function(){
        this.$get = function(){
            return function($scope, text) {
                $scope.di1text2 = "DI1 TEXT 2";
                return text;
            };
        };
    });
});

```

`$provide` 서비스를 이용해서 `di1`이라는 인스턴스를 생성한다. 그리고 콘트롤러 선언부분을 아래와 같이 수정해 준다.

```
module.controller("sampleController", function($scope, di1) {
    $scope.text = "TEXT";
    $scope.di1text1 = di1($scope, "DI1 TEXT 1");
});

```

이렇게 하면 콘트롤러에서 `di1()` 인스턴스를 호출하게 되면 그 결과가 `$scope.di1text1`과 `$scope.di1text2`에 반영되어 화면에 나타난다. 하지만, 이것보다 좀 더 간단한 방법으로 동일한 결과를 얻을 수 있다. 위의 `module.config()` 안쪽에 아래와 같은 코드를 넣는다.

```
$provide.factory("di2", function(){
    return function(text) {
        return text;
    };
});

```

이것은 위의 `$provide.provider()` 펑션을 좀 더 간단하게 한 것으로 `$provide.factory()` 펑션을 쓰고 있다. 이것을 더욱 간단하게 하면 아래와 같이 `$provide.value()` 형태로도 쓸 수 있다.

```
$provide.value("di3", function(text) {
    return text;
});

```

이제 콘트롤러를 아래와 같이 바꾸어보자.

```
module.controller("sampleController", function($scope, di1, d2, d3) {
    $scope.text = "TEXT";
    $scope.di1text1 = di1($scope, "DI1 TEXT 1");
    $scope.di2text = di2("DI2 TEXT");
    $scope.di3text = di3("DI3 TEXT");
});

```

이렇게 콘트롤러를 변경한 후에 결과를 확인해 보면`di1`, `di2`, `di3` 객체가 어떻게 쓰였는지 알 수 있다. 심지어 이보다 더 간단하게 DI를 적용시킬 수도 있다. 위의 예제 코드는 모두 `module.config()` 안에 `$provide` 서비스를 포함시킨 후 그 스코프 안에서 DI를 위한 객체들을 생성시켜 놓는 것이었다면, 이것을 좀 더 간단하게 해서 `module.provider()`, `module.factory()`, `module.value()` 형태로도 사용할 수 있다. 아래 코드를 살펴보도록 하자.

```
// Using "provider" shortcut
module.provider("di4", function(){
    this.$get = function(){
        return function(text) {
            return text;
        };
    };
});

// Using "factory" shortcut
module.factory("di5", function(){
    return function(text) {
        return text;
    };
});

// Using "value" shortcut
module.value("di6", function(text) {
    return text;
});

```

차이점을 발견할 수 있는가? 이렇게 만들어 놓은 객체들을 다시 콘트롤러를 수정하여 적용시켜 보자.

```
module.controller("sampleController", function($scope, di1, d2, d3, d4, d5, d6) {
    $scope.text = "TEXT";
    $scope.di1text1 = di1($scope, "DI1 TEXT 1");
    $scope.di2text = di2("DI2 TEXT");
    $scope.di3text = di3("DI3 TEXT");
    $scope.di4text = di4("DI4 TEXT");
    $scope.di5text = di5("DI5 TEXT");
    $scope.di6text = di6("DI6 TEXT");
});

```

이렇게 콘트롤러를 수정한 후 결과를 보면 어떻게 달라졌는지 확인할 수 있을 것이다. 마지막으로 `$injector` 서비스를 이용하여 DI를 구현하는 방법이다. 위의 콘트롤러를 아래와 같이 수정하자.

```
module.controller("sampleController", function($scope, $injector, di1, d2, d3, d4, d5, d6) {
    $scope.text = "TEXT";
    $scope.di1text1 = di1($scope, "DI1 TEXT 1");
    $scope.di2text = di2("DI2 TEXT");
    $scope.di3text = di3("DI3 TEXT");
    $scope.di4text = di4("DI4 TEXT");
    $scope.di5text = di5("DI5 TEXT");
    $scope.di6text = di6("DI6 TEXT");

    var di7 = $injector.get("di6")
    $scope.di7text = di7("DI7 TEXT");
});

```

이렇게 수정한 후에 다시 결과를 확인해 보도록 하자.

정리하자면, AngularJS에서 DI는 다양한 방법 – 여기서는 총 일곱가지 방법 – 으로 구현이 가능하다. 방법은 서로 다르지만 모두 동일한 결과를 가져온다. 그 중에서 가장 간결한 방법은 `module.value()` 방법이고, 가장 복잡한 방법은 `module.config()`에 `$provide` 서비스를 이용하여 `provider` 펑션을 호출하는 것이다. 간결할 수록 개발자가 콘트롤해야 하는 부분이 줄어들고, 복잡할 수록 개발자가 관여해야 하는 부분이 늘어난다. 요구사항의 복잡도에 따라 선택해서 사용하면 될 것이다.

이상으로 간단하게 AngularJS에서 DI를 활용하는 방법에 대해 논의해 보았다. 위의 코드는

[](http://jsfiddle.net/bluemood/QC9pW/)[http://jsfiddle.net/bluemood/QC9pW/](http://jsfiddle.net/bluemood/QC9pW/)

이곳에서 테스트해 볼 수 있다.

참고:

- [](https://github.com/angular/angular.js/wiki/Understanding-Dependency-Injection)[https://github.com/angular/angular.js/wiki/Understanding-Dependency-Injection](https://github.com/angular/angular.js/wiki/Understanding-Dependency-Injection)
- 유튜브 동영상: [](http://youtu.be/1CpiB3Wk25U?t=37m)[http://youtu.be/1CpiB3Wk25U?t=37m](http://youtu.be/1CpiB3Wk25U?t=37m)
