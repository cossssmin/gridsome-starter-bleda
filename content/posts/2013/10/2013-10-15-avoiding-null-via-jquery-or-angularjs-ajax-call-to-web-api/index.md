---
title: "ASP.NET MVC 4 Web API 에서 null값 해결하기"
date: "2013-10-15"
slug: avoiding-null-via-jquery-or-angularjs-ajax-call-to-web-api
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- AngularJs
- jQuery
- JSON
- web-api
fullscreen: false
cover: ""
---

ASP.NET MVC 4 Web API를 사용하면 RESTful 웹서비스를 손쉽게 해결할 수 있다. 그런데, 문제는 jQuery 또는 AngularJS 같은 자바스크립트 라이브러리를 통해 AJAX 콜을 이용하여 JSON 문자열을 Web API로 넘겨주게 되면, 특히 POST 혹은 PUT 메소드의 경우, Web API 콘트롤러에서 `null`값으로 떨어지는 경우를 보게 된다.

이것은 JSON 문자열을 파싱할 때 해당 자바스크립트 프레임웍이 갖는 특징으로, 약간의 부가적인 조치를 취해주면 해결할 수 있다.

```js
var data = {
    "id": 1,
    "username": "abc",
    "email": "abc@email.com"
};

```

위의 JSON 객체를 jQuery AJAX 콜을 통해 서버에 전송하는 경우와 AngularJS의 AjAX 콜을 통해 서버에 전송하는 경우를 살펴보자.

```js
// AJAX call using jQuery.
$.ajax({
    "type": "POST",
    "url": "/api/user",
    "dataType": "json",
    "data": JSON.stringify(data),
    "success": function(result) {
        // Do something
    }
});

// AJAX call using AngularJS
$http({
    "method": "POST",
    "url": "/api/user",
    "data": JSON.stringify(data)
}).success(function(result){
    // Do something.
});

```

Fiddler 또는 FireBug, 크롭 웹 개발자 도구 등을 통해 AJAX 리퀘스트 데이터를 보면 아래와 같다.

```json
{ "id": 1, "username": "abc", "email": "abc@email.com" }

```

그러나, 이 데이터는 Web API 콘트롤러를 통해 보면 `null`값으로 전송이 된다.

```csharp
public HttpResponseMessage Post([FromBody]string value)
{
    // Do something.
}

```

Web API 콘트롤러의 `Post` 메소드는 대략 위와 같은 형태가 될텐데, 이 때 `value`값이 `null`이 되는 것이다. 그 이유는 `JSON.stringify(data)`된 데이터 앞에 반드시 `=`가 있어야 하는데, 그것이 없기 때문이다. 이것을 해결하기 위해 다음과 같이 처리한다.

```js
// AJAX call using jQuery.
$.ajax({
    "type": "POST",
    "url": "/api/user",
    "dataType": "json",
    "data": { "": JSON.stringify(data) },
    "success": function(result) {
        // Do something
    }
});

```

jQuery 에서는 key 값이 없는 JSON 객체로 한 번 더 감싸주면 된다.

```js
// AJAX call using AngularJS
$http({
    "method": "POST",
    "url": "/api/user",
    "data": "=" + JSON.stringify(data),
    "headers": { "Content-Type": "application/x-www-form-urlencoded" }
}).success(function(result){
    // Do something.
});

```

AngularJS 에서는 단순히 `=`를 앞에 붙여주고, 헤더의 `Content-Type`을 기본값인 `application/json`에서 `application/x-www-form-urlencoded`으로 바꾸어준다. 그리고 나서 다시 Web API를 호출해 보면 정상적으로 JSON 스트링을 받아오는 것을 볼 수 있다.

참고: [](http://encosia.com/using-jquery-to-post-frombody-parameters-to-web-api)[http://encosia.com/using-jquery-to-post-frombody-parameters-to-web-api](http://encosia.com/using-jquery-to-post-frombody-parameters-to-web-api)
