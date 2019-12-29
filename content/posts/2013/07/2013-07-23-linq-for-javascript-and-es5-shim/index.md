---
title: "닷넷의 LINQ 기능을 자바스크립트로 이용하기"
date: "2013-07-23"
slug: linq-for-javascript-and-es5-shim
description: ""
author: Justin Yoo
tags:
- Front-end Web Dev
- ES5-Shim
- LINQ
- LINQ-to-JavaScript
- linq.js
fullscreen: false
cover: ""
---

LINQ (Language Integrated Query)는 닷넷 개발시 가장 강력한 기능들 중의 하나이다. LINQ-to-SQL, LINQ-to-XML, LINQ-to-OBJECT 등 거의 모든 상황에서 LINQ를 사용할 수 있다. LINQ는 보통 아래와 같은 형태로 많이 쓰인다.

```
var products = (from p in context.Products
                where p.ProductName.Contains("ABC")
                select p).ToList();

```

또는

```
var products = context.Products
                      .SingleOrDefault(p => p.ProductId == 123);

```

하지만 이것의 가장 큰 단점(?)이라면, 프론트엔드에서 쓰이는 자바스크립트로는 이러한 기능을 사용할 수 없다는 데 있다. 그래서 나타난 것이 바로 [linq.js](http://linqjs.codeplex.com)이다.

### `linq.js` 소개

이 자바스크립트 프레임웍을 사용하면, LINQ에서 제공하는 대부분의 기능들을 자바스크립트 상에서도 거의 동일한 문법으로 사용할 수 있다. 또한, 이 `linq.js`는 jQuery 플러그인도 제공하므로, 더더욱 편리하게 쓸 수 있다.

이 `linq.js`를 사용하기 위해서는 우선 라이브러리를 불러들여야 한다. 기왕이면 jQuery를 호출한 후에 이 `linq.js`를 호출하도록 하자.

```
<script src="/path/to/linq.js"></script>
<script src="/path/to/linq.jquery.js"></script>

```

이렇게 호출해 놓으면 그냥 사용이 가능하다. 대략의 사용 방법은 아래와 같다.

```
var jsonArray = [
  { "user": { "id": 100, "screen_name": "d_linq" }, "text": "to objects" },
  { "user": { "id": 130, "screen_name": "c_bill" }, "text": "g" },
  { "user": { "id": 155, "screen_name": "b_mskk" }, "text": "kabushiki kaisha" },
  { "user": { "id": 301, "screen_name": "a_xbox" }, "text": "halo reach" }
];

// ["b_mskk:kabushiki kaisha", "c_bill:g", "d_linq:to objects"]
var queryResult = Enumerable.From(jsonArray)
                            .Where(function (x) { return x.user.id < 200 })
                            .OrderBy(function (x) { return x.user.screen_name })
                            .Select(function (x) { return x.user.screen_name + ':' + x.text })
                            .ToArray();

```

조금 더 편하게 람다 함수를 이용한다면 아래와 같이 사용할 수도 있다. 위와 아래는 동일한 결과를 가져온다.

```
// shortcut! string lambda selector
var queryResult2 = Enumerable.From(jsonArray)
                             .Where("$.user.id < 200")
                             .OrderBy("$.user.screen_name")
                             .Select("$.user.screen_name + ':' + $.text")
                             .ToArray();

```

마찬가지로 jQuery 플러그인을 사용한다면 더욱 간결한 표현을 쓸 수 있다.

```
// $.Enumerable:
// 알럿 메시지로 짝수만 보여준다. 총 다섯번.
$.Enumerable.Range(1, 10).Where("$%2==0").ForEach("alert($)");

// TojQuery - Enumerable to jQuery
// #select1 이라고 하는 ID를 가진 드롭다운리스트에 옵션을 1부터 10까지 추가한다.
$.Enumerable.Range(1, 10)
            .Select(function (i) { return $("<option>").text(i)[0] })
            .TojQuery()
            .appendTo("#select1");

// toEnumerable - jQuery to Enumerable
// 1부터 10까지 추가한 값을 모두 더한다.
var sum = $("#select1").children()
                       .toEnumerable()
                       .Select("parseInt($.text())")
                       .Sum(); // 55

```

이렇게 쉽게 사용이 가능하다. 더 많은 레퍼런스는 [이곳](http://neue.cc/reference.htm)에서 확인할 수 있다.

### IE6 - 8 에서 `linq.js` 사용하기 – `es5-shim`

문제는 역시나 IE6, IE7, IE8 에서 발생한다. 그 이유는 기본적인 자바스크립트 처리 엔진의 버전으로, EcmaScript 5 를 지원하지 않는 브라우저이기 때문이다. 즉, 배열 처리가 상당히 제한적이라서 이 `linq.js`가 제대로 동작하지 않는다.

하지만, 이럴 때 [es5-shim](https://github.com/kriskowal/es5-shim) 이라는 자바스크립트를 추가해 주면 IE6-8 에서도 이 `linq.js`를 사용할 수 있다.

만약 `html5shiv`를 사용한다면, 바로 밑에 이 `es5-shim` 라이브러리를 추가하도록 하자. 아니라면 `modernizr` 바로 밑에 추가해도 된다.

```
<script src="/path/to/es5-shim.min.js"></script>

```

단순히 이렇게 추가하는 것 만으로 `linq.js`의 기능들을 모두 사용할 수 있게 된다.
