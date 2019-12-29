---
title: "IE8 에서 input 태그와 textarea 태그에 placeholder 속성 적용하기"
date: "2013-07-19"
slug: ie8-input-textarea-placeholder
description: ""
author: Justin Yoo
tags:
- Front-end Web Dev
- IE8
- jQuery
- Placeholder
- Plugin
fullscreen: false
cover: ""
---

IE8은 공식적으로 HTML5 태그들을 지원하지 않는다. 따라서, 하위 버전의 IE들을 위해 [Modernzr](http://modernizr.com) 라든가 [html5shiv](https://code.google.com/p/html5shiv) 같은 자바스크립트들을 이용하면 HTML5에서 새롭게 나타난 엘리먼트 태그들을 사용할 수 있다.

그럼에도 불구하고 `placeholder` 속성은 IE8에서 사용할 수 없는데, 이럴 때 사용할 수 있는 jQuery 플러그인이 있다. 이름하여 [jquery.placeholder](https://github.com/mathiasbynens/jquery-placeholder). 사용법도 간단하다.

```
<script src="/path/jquery.placeholder.js"></script>

```

먼저 jQuery를 로딩한 다음 `jquery.placeholder.js`를 로딩한다. 그 다음에 다음과 같이 선언하면 끝.

```
(function ($) {
  $(document).ready(function () {
    $("input, textarea").placeholder();
  });
})(jQuery);

```

참 쉽죠?

그런데, 이게 문제가 하나 있다. [Bootstrap](http://twitter.github.io/bootstrap/) 이랑 함께 쓰면 `<input type="password" ... />` 과 같은 패스워드형 `input` 엘리먼트는 레이아웃이 깨져 버린다. 그래서, 다 좋은데 이걸 쓰지 못하는 것이 참 안타까움. 결국 다른 것을 하나 더 발견했는데, 이것의 이름은 [placeholders.js](https://github.com/jamesallardice/Placeholders.js).

이건 사용방법이 더 쉽다. jQuery 플러그인이 아니기 때문에 독립적으로 작동하는데 아래와 같이 스크립트만 불러오면 끝.

```
<script src="/path/Placeholders.js"></script>

```

둘 중 하나를 사용하면 IE8 에서도 `placeholder` 속성을 사용할 수 있다.
