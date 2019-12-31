---
title: "크로스 브라우징을 위한 HTML5 Boilerplate + 추가 스크립트"
date: "2013-07-28"
slug: html5-boilerplate-and-more-for-seamless-cross-browsing
description: ""
author: Justin Yoo
tags:
- Front-end Web Dev
- CSS3
- EcmaScript 5
- ES5-Shim
- H5BP
- HTML5
- HTML5 Boilerplate
- linq.js
- Modernizr
- Normalize
- Placeholder
- placeholder.js
- Monkey Patch
fullscreen: false
cover: ""
---

[HTML5 Boilerplate (H5BP)](http://html5boilerplate.com)는 프론트엔드 개발자들이 웹페이지를 제작하는데 필요한 베스트 프랙티스들을 모아놓은 템플릿이다. 다양한 브라우저 환경, 특히 구버전의 인터넷 익스플로러(IE)에서 HTML5 + CSS3 조합의 풍부한 기능을 이용하기를 원한다면 이 H5BP의 사용은 필수불가결하다 할 수 있다.

하지만, H5BP가 만능은 아닌 것이, 다양한 브라우저를 지원하는 웹페이지를 제작하는데 꼭 필요한 최소한의 장치들만을 포함하고 있기 때문에 개발 환경에 따라 몇가지를 추가해야 하는 것은 분명하다. 따라서, 이 포스트에서는 H5BP에 추가적으로 어떤 것들이 더 필요한지에 대해 논의해 보기로 한다.

### HTML 문서 기본 골격 구조

우선, 기본적인 H5BP에서 제안하는 HTML 문서의 골격구조부터 살펴보자. 아래의 내용은 H5BP 리포지토리의 `index.html`이다. ([](https://raw.github.com/h5bp/html5-boilerplate/master/index.html)[https://raw.github.com/h5bp/html5-boilerplate/master/index.html](https://raw.github.com/h5bp/html5-boilerplate/master/index.html))

```html
<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

        <link rel="stylesheet" href="css/normalize.css">
        <link rel="stylesheet" href="css/main.css">
        <script src="js/vendor/modernizr-2.6.2.min.js"></script>
    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->

        <!-- Add your site or application content here -->
        <p>Hello world! This is HTML5 Boilerplate.</p>

        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script>window.jQuery || document.write('<script src="js/vendor/jquery-1.10.2.min.js"></script>')</script>
        <script src="js/plugins.js"></script>
        <script src="js/main.js"></script>

        <!-- Google Analytics: change UA-XXXXX-X to be your site's ID. -->
        <script>
            (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
            function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
            e=o.createElement(i);r=o.getElementsByTagName(i)[0];
            e.src='//www.google-analytics.com/analytics.js';
            r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
            ga('create','UA-XXXXX-X');ga('send','pageview');
        </script>
    </body>
</html>

```

짧은 지식으로는 `<meta>` 태그와 `<link>` 태그 들은 자체적으로 닫는 태그를 갖고 있어야 하는 것으로 알고 있다. 따라서, 이부분은 `<meta ... />`, `<link ... />` 형태로 바꾸어 주는 것이 좋다.

### 기본 문자셋

```html
<meta charset="utf-8" />

```

유니코드 문자셋으로 웹페이지를 제공하는 것이 좋다.

### IE 호환성 모드 메타 태그

```html
<meta http-equiv="X-UA-Compatible" content="IE=edge" />

```

이 내용은 사용자가 IE를 사용해서 페이지를 열었을 때, 해당 IE가 지원할 수 있는 최신의 호환성 모드로 페이지를 렌더링하게끔 하는 것이다. 하지만, 이 메타 태그는 인트라넷 상에서는 해석할 수가 없기 때문에 웹서버에서도 자체적으로 커스텀 헤더 안에 위의 호환성 모드를 뿌려주는 것이 좋다. 이에 덧붙여 만약 사용자가 IE 크롬 익스텐션을 사용할 경우에는 아래와 같이 수정하여 크롬 익스텐션으로 렌더링하는 것을 강제하게끔 할 수도 있다.

```html
<meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1" />

```

### 파비콘

다양한 사이즈의 파비콘을 준비해 두면 다양한 디바이스에서 파비콘들의 모양이 깨지는 현상을 방지할 수 있다. H5BP의 목적에 맞게끔 다양한 사이즈의 파비콘을 생성해 주는 사이트는 [](http://iconifier.net)[http://iconifier.net](http://iconifier.net)과 같은 것들이 있다.

### CSS 정규화

```html
<link rel="stylesheet" href="css/normalize.css" />

```

웹브라우저들마다 저마다의 방식으로 기본 렌더링 모드를 제공하고 있다. 따라서, 가급적이면 브라우저 고유의 렌더링 모드 대신 이렇게 정규화시킨 CSS를 이용하여 브라우저에 상관없이 동일한 렌더링을 제공하는 것이 좋다. 참고로, 트위터 부트스트랩과 동시에 사용하는 경우에는 이미 동일한 내용의 정규화 CSS가 들어 있기 때문에 필요없다.

### Modernizr – HTML5 엘리먼트 폴리필

IE8 이하 버전에서는 HTML5에서 새롭게 제공하는 태그들을 인식할 수 없다. 따라서, 이를 인식시키는 작업이 필요한데, 이것을 이 `modernizr`가 담당한다. `html5shiv.js`로도 충분히 가능하지만, `modernizr`는 이를 포함한 다양한 기능들을 포함하고 있으므로 이것을 사용하는 것이 좋다. 참고로, `modernizr`는 `<head>` 태그 안에서 로딩하는 유일한(?) 자바스크립트이다.

이상으로 H5BP에서 제공하는 템플릿에 대해 간략하게 확인해 봤다. 이어서 아래에 언급하는 부분은 H5BP에 부가적으로 추가하면 좋을 내용들이다.

### jQuery

자바스크립트 프레임웍의 대표주자. 굳이 없어도 괜찮지만, 어지간하면 로드하는 것이 좋다. IE9 이하 버전을 지원하기 위해서는 `jQuery 1.x` 버전을 사용한다. 만약 트위터 부트스트랩을 사용한다면, `jQuery` 로딩은 필수.

### Placeholders.js

IE9 이하의 브라우저에서는 HTML5에서 새롭게 제공하는 `<input>` 태그의 `placeholder`를 제대로 인식하지 못한다. 이를 위해 `Placeholders.js`([](http://jamesallardice.github.io/Placeholders.js)[http://jamesallardice.github.io/Placeholders.js](http://jamesallardice.github.io/Placeholders.js)) 라는 폴리필을 로드한다. 이와 더불어 `Placeholders.js`의 기능을 보완해주는 `Placeholders.js Monkey Patch`([](https://github.com/aliencube/Placeholders.js-Monkey-Patch)[https://github.com/aliencube/Placeholders.js-Monkey-Patch](https://github.com/aliencube/Placeholders.js-Monkey-Patch))도 함께 로드한다. 참고로 `Placeholders.js Monkey Patch`는 `jQeury`가 있어야만 실행 가능하다.

### EcmaScript 5 지원

```html
<!--[if lte IE 8]>
    <script type="text/javascript" src="js/es5-shim.min.js"></script>
<![endif]-->

```

IE8에서 사용하는 자바스크립트 엔진은 오래된 것이라서 EcmaScript 5를 지원하지 못한다. EcmaScript 5에서는 Array와 관련해서 향상된 기능을 제공하므로 이를 인식시켜주는 확장 라이브러리가 필요한데, 이 때 `es5-shim.js`([](https://github.com/kriskowal/es5-shim)[https://github.com/kriskowal/es5-shim](https://github.com/kriskowal/es5-shim))가 필요하다.

### linq.js

```html
<script type="text/javascript" src="js/linq.min.js"></script>

```

만약 .NET의 LINQ에 익숙하다면 `linq.js`([](http://linqjs.codeplex.com)[http://linqjs.codeplex.com](http://linqjs.codeplex.com))를 설치해 보는 것도 좋다.

이상으로 H5BP 템플릿에 덧붙여 함께 사용하면 좋을만한 자바스크립트 라이브러리들을 나열해 봤다. 이는 물론 최소한으로 필요한 것들이고 프로젝트의 성격마다 더 많은 것들을 추가할 수 있을 것이다.
