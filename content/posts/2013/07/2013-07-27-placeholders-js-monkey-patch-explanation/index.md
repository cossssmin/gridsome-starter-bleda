---
title: "Placeholders.js Monkey Patch 해설"
date: "2013-07-27"
slug: placeholders-js-monkey-patch-explanation
description: ""
author: Justin Yoo
tags:
- Front-end Web Dev
- IE8
- IE9
- JavaScript
- jQuery
- jQuery.placeholder
- Placeholder
- placeholder.js
- Monkey Patch
fullscreen: false
cover: ""
---

이전 글인 [IE8 에서 input 태그와 textarea 태그에 placeholder 속성 적용하기](http://blog.aliencube.org/post/55867304483/ie8-input-textarea-placeholder)에서 [`Placeholders.js`](http://jamesallardice.github.io/Placeholders.js)를 이용하면 [`jquery.placeholder`](https://github.com/mathiasbynens/jquery-placeholder) 플러그인보다 여러모로 사용이 편리하다고 언급한 적이 있다.

그런데, 이 `Placeholderes.js` 역시도 다른 DOM 엘리먼트들의 이벤트들에서는 기대하는 대로 작동하지 않는 경우가 있다. 이런 경우를 보정하기 위해서 [`Placeholders.js Monkey Patch`](https://github.com/aliencube/Placeholders.js-Monkey-Patch)를 만들어서 배포하게 됐다. `Placehoders.js`는 모든 `input:text` 엘리먼트와 `textarea` 엘리먼트에 몇가지 비표준 속성을 추가하는 폴리필 (polyfill) 형태로 이루어진다. 그중에 몇가지 예를 들자면 아래와 같은 것들이 있다.

- `data-placeholder-value`
- `data-placeholder-active`
- `data-placeholder-bound`

이 세가지가 `input:text` 엘리멘트에 쓰이는 대표적인 폴리필 속성들이다. **IE8**에서 `Placeholders.js`를 적용한 페이지를 열어보면 아래와 같은 형태로 보이는 것을 알 수 있다.

```html
<input type="text" id="username" class="placehldersjs" name="username" placeholder="Username"
       data-placeholder-value="Username" data-placeholder-bound="true" data-placeholder-active="true"
       value="Username" />

```

`Placeholders.js`는 `placeholder` 속성을 사용할 수 없기 때문에, `placeholder` 속성값을 대신 `value` 속성값에 넣어주고, 그것을 `placeholdersjs` 라는 CSS 클라스를 이용해 색상을 조정한다. `placeholdersjs` 클라스의 기본값은 `#ccc`이다. 물론 해당하는 `input` 엘리먼트에 이미 값이 있다면 아래와 같은 형태로 나타나게 된다.

```html
<input type="text" id="username" name="username" placeholder="Username" value="joebloggs" />

```

그런데, 문제는 다른 DOM 엘리먼트들과 상호작용을 하면서 이 폴리필들이 제대로 작동을 하지 않는 경우가 있다. 예를 들어서 드롭다운리스트에서 값을 바꿀 때와 같은 현상들이 바로 그것인데, 그럴 때 이 몽키 패치가 역할을 하게 된다. 일반적으로 이 `Placeholders.js` 자바스크립트는 IE9 이하에서만 적용시키면 되기 때문에 아래와 같은 형태로 호출한다.

```html
<!--[if lte IE 9]>
  <script type="text/javascript" src="js/Placeholders.min.js"></script>
<![endif]-->

```

마찬가지로 몽키 패치 역시도 아래와 같은 형태로 호출을 하면 다른 브라우저 혹은 IE10 이상에서는 영향을 받지 않는다.

```html
<!--[if lte IE 9]>
  <script type="text/javascript" src="js/jquery.Placeholders.monkey.patch.js"></script>
<![endif]-->

```

### `input:text`와 `textarea` 엘리먼스 속성 재설정

이렇게 호출을 해놓은 상태에서는 몽키패치에서 선언한 함수들은 오로지 IE9 이하에서만 사용할 수 있게 된다. 몽키 패치에서 선언한 함수들은 `Placeholders.js`에서 정의한 속성과 CSS 클라스가 제대로 작동하고 있는지 검증하는 역할을 한다. 예를 들어 `#select-box`라는 id 값을 갖는 드롭다운리스트가 있다고 가정을 할 때 `$("#select-box").change()` 또는 `$("#select-box").click()`의 콜백 함수를 이용하여 검증을 하는 것이다.

```js
$("#select-box").change(function () {
  if (typeof (applyPlaceholderAttributes) == typeof (Function)) {
    $("input:text, textarea").each(function () {
      applyPlaceholderAttributes($(this));
    });
  }
});

```

이런 식으로 `applyPlaceholderAttributes()` 함수를 호출하면 알아서 보정을 해준다. 여기서 `if (typeof(applyPlaceholderAttributes) == typeof(Function)) { ... }` 블록은 IE9 이하에서 이 몽키 패치를 로드했을 경우에는 `true`, 아니면 `false` 값을 갖는다.

만약 조금 더 구체적으로 `input` 엘리먼트들의 범위를 지정하고 싶다면 몽키 패치를 호출할 때 아래와 같은 형태로 호출하면 된다.

```html
<!--[if lte IE 9]>
  <script type="text/javascript" src="js/jquery.Placeholders.monkey.patch.js"></script>
  <script type="text/javascript">
    Placeholders.For = {
      "inputs": ["input:text", "textarea"],
      "fakePasswords": ["#fake-password"],
      "forms": ["form"]
    };
  </script>
<![endif]-->

```

`Placeholders.For` 라는 JSON 객체를 선언해서 `input` 엘리먼트들의 범위를 정할 수 있다. 그렇게 한 후 드롭다운리스트의 이벤트 역시도 아래와 같이 살짝 바꿔주면 끝.

```js
if (typeof (applyPlaceholderAttributes) == typeof (Function)) {
  $.each(Placeholders.For.inputs, function (i, element) {
    $(element).each(function () {
      applyPlaceholderAttributes($(this));
    });
  });
}

```

### `input:password` 속성 재설정

`Placeholders.js`의 가장 치명적인 단점(?)은 IE8 이하에서는 패스워드 필드가 `placeholder` 값이 보이지 않고 `********`와 같이 실제로 패스워드를 입력한 것처럼 보인다는 것이다. IE9 이상에서는 `input` 엘리먼트의 `type` 속성을 바꿀 수 있어서 `Placeholders.js` 내부적으로 `password` 타입에서 `text` 타입으로 바꾸어서 `placeholder` 속성값을 보여주다가 실제 패스워드 입력을 위해 포커스를 이동시키면 다시 `text` 타입에서 `password` 타입으로 바꾸는 기능을 한다.

하지만, IE8 이하에서는 이렇게 `type`을 바꿀 수 없기 때문에 이것이 불가능하다. 몽키 패치는 IE8을 위해 `#fake-password`라는 텍스트 필드를 준비해 놓고 사용자가 패스워드 입력을 위해 포커스를 이동시키면 원래 패스워드 필드를 보여주고, 포커스를 벗어나면 패스워드 필드를 감추고 fake password 필드를 보여주는 형식으로 처리하게끔 했다. 물론, 이를 위해 다음과 같은 부가적인 마크업이 필요하다.

```html
<!--[if lte IE 8]>
  <input type="text" id="fake-password" name="fake-password" placeholder="Password"
         data-placeholder-password="password" required="required"
         style="display: none;" />
<![endif]-->

```

이렇게 해놓으면 IE8 이하의 브라우저에서만 위의 내용을 로드하게 되고 이것이 기존의 패스워드 필드를 대체하는 역할을 한다,

### `form` 전송

`Placeholders.js`의 치명적인 문제점들 중 하나는 `input` 엘리먼트의 `value` 속성을 이용하다보니, 서버로 이 `placeholder` 값들을 전송한다는 것에 있다. 따라서, 폼 전송 직전에 이러한 불필요한 `placeholder` 값들을 제거할 필요가 있다. 사실, 이부분은 `Placeholders.For` JSON 객체에 적용시키고자 하는 `form` 엘리먼트들을 지정해 놓으면 알아서 불필요한 값들을 걷어내 준다.

이렇게 `Placeholders.js Monkey Patch`의 작동원리에 대해 간단하게 설명을 해 보았다.
