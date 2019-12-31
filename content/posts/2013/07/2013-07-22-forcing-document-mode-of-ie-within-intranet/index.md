---
title: "인트라넷상에서 강제로 IE 문서모드 전환하기"
date: "2013-07-22"
slug: forcing-document-mode-of-ie-within-intranet
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- IE Document Mode
- IIS Configuration
- Intranet
fullscreen: false
cover: ""
---

일반적으로 IE의 문서모드 Document Mode는 브라우저의 버전에 맞춰 자동으로 설정된다. IE8을 사용중이라면 문서모드는 IE8이고, IE9을 사용중이라면 문서모드는 자동으로 IE9이 되는 것이다.

HTML5 Boilerplate는 이 문서모드를 HTML5에 맞추기 위해 가급적이면 아래 `<meta>` 태그를 `<head>` 태그 바로 밑에 위치시키는 것을 추천하고 있다.

```html
<meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1" />

```

그런데, 문제는 웹사이트가 인트라넷 상에 존재할 때에는 IE는 [무조건 IE7 모드로 바꿔버리는 것](http://msdn.microsoft.com/en-us/library/ff955410(v=vs.110).aspx)에 있다.

아무리 저 위의 `<meta>` 태그를 넣어도 무조건 IE7 모드로 바뀌기 때문에 일반적인 방법으로는 인트라넷 상에서 IE8 이상의 문서모드를 구현할 수 없다.

![](http://media.tumblr.com/d24e849d4d383185bbe627a30c342c04/tumblr_inline_mqcc89h7T91qz4rgp.png)

따라서, HTTP Response Header 부분에 강제로 위의 내용을 삽입해야 하는데, 이것은 [웹서버에서 설정이 가능](http://blogs.msdn.com/b/mike/archive/2008/10/15/configuring-iis-to-work-around-webpage-display-issues-in-internet-explorer-8-0.aspx)하다.

![](http://media.tumblr.com/aca40c13578b78d801403a5ff123f9b0/tumblr_inline_mqccbpJK4l1qz4rgp.png)

위 이미지는 IIS 6 에서 헤더를 설정하는 방법이고, 아래 이미지는 IIS 7 또는 그 이상에서 헤더를 설정하는 방법이다.

![](http://media.tumblr.com/90d52fc10a98a3b507d06e876d4ee471/tumblr_inline_mqccd0Zs9F1qz4rgp.png)

위와 같이 웹서버에서 헤더에 정보를 설정하게 되면 아래와 같이 바뀌는 것을 볼 수 있다.

![](http://media.tumblr.com/d40a61775160633ecc5921702a98df46/tumblr_inline_mqcckjQ4vY1qz4rgp.png)

참고로, 아래 이미지는 IE가 `<meta>` 태그와 HTTP Response Header를 통해 어떻게 적절한 문서모드를 설정하는지에 대한 MSDN 공식 설명이다.

![](http://i.msdn.microsoft.com/dynimg/IC668677.jpg)

**참조**:

- [How Internet Explorer Chooses Between Document Modes](http://msdn.microsoft.com/en-us/library/ff405803(v=vs.110).aspx)
- [X-UA-Compatibility Meta Tag and HTTP Response Header](http://msdn.microsoft.com/en-us/library/ff955275(v=vs.110).aspx)
- [Compatibility View](http://msdn.microsoft.com/en-us/library/ff955410(v=vs.110).aspx)
- [!DOCTYPE Declaration](http://msdn.microsoft.com/en-us/library/ff955379(v=vs.110).aspx)
- [Configuring IIS to work around webpage display issues in Internet Explorer 8.0](http://blogs.msdn.com/b/mike/archive/2008/10/15/configuring-iis-to-work-around-webpage-display-issues-in-internet-explorer-8-0.aspx)
