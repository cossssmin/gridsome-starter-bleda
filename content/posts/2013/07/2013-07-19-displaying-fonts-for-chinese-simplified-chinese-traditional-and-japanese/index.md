---
title: "웹사이트에서 중국어(간체), 중국어(번체) 및 일본어 글꼴 표현하기"
date: "2013-07-19"
slug: displaying-fonts-for-chinese-simplified-chinese-traditional-and-japanese
description: ""
author: Justin Yoo
tags:
- Front-end Web Dev
- Fonts
- Chinese
- Japanese
fullscreen: false
cover: ""
---

웹사이트에서 한글 글꼴을 표현할 때에는 요즘은 구글에서 제공하는 웹폰트를 사용하는 경우가 많다. 이것이 가능한 이유는 영문 폰트에 비해서는 용량이 크지만 상대적으로 그렇게 크지 않기 때문이기도 하다.

이에 비해서 일본어 글꼴과 중국어 글꼴을 웹폰트로 사용하기에는 워낙에 한자들이 많기 때문에 거의 불가능하다고 한다. 따라서, 일본어 또는 중국어로 운영하는 웹사이트는 시스템 기본 글꼴을 사용하는 경우가 많다고 한다.

그렇다면, 그나마 웹사이트에 어울리는 중국어 글꼴과 일본어 글꼴은 어떤 것들이 있을까?

### 중국어 글꼴

시스템에서 기본적으로 제공하는 중국어 글꼴은 가장 이쁘지 않다. 그래서 보통은 영문 글꼴을 먼저 제공하고, Fallback 글꼴로써 중국어 글꼴을 제공하는 경우가 많다.

```
font-family: Helvetica, Arial, "Microsoft MingLiU", 新細明體, sans-serif;

```

위는 중국어(번체) 글꼴을 선언하는 방법이다.

```
font-family: Helvetica, Arial, "Microsoft Yahei","微软雅黑", STXihei, "华文细黑", sans-serif;

```

그나마 중국어(간체) 글꼴들은 사정이 조금 나아서 몇가지 더 추가를 할 수 있다. 하지만, 영문 글꼴을 먼저 보여주는 것이 그래도 나은 선택.

### 일본어 글꼴

일본어 글꼴 역시도 중국어 글꼴 보다는 용량이 작지만, 그래도 큰 편이기 때문에 시스템 글꼴을 사용하는 편인데, 그래도 중국어 글꼴들 보다는 이쁜 것들이 많다.

```
font-family: "Hiragino Kaku Gothic Pro", "ヒラギノ角ゴ Pro W3", Osaka, Meiryo, "メイリオ", "MS PGothic", "ＭＳ Ｐゴシック", sans-serif;

```

이정도로 글꼴들을 선언해 주면 일본어 페이지쪽은 충분히 안전하다. 다만, 일본어 글꼴은 아래위 픽셀이 1px 작은 관계로 CSS 에서 레이아웃을 조정해 주지 않으면 문제가 생길 수 있다.

**참고**

- [Web safe font for Chinese similar to Trebuchet?](http://graphicdesign.stackexchange.com/questions/3403/web-safe-font-for-chinese-similar-to-trebuchet)
- [Chinese language tips for web design](http://yukikodesign.com/orangutangy/?p=191)
- [Chinese Standard Web Fonts: A Guide to CSS Font Family Declarations for Web Design in Simplified Chinese](http://www.kendraschaefer.com/2012/06/chinese-standard-web-fonts-the-ultimate-guide-to-css-font-family-declarations-for-web-design-in-simplified-chinese/)
- [Japanese standard web fonts](http://stackoverflow.com/questions/14563064/japanese-standard-web-fonts)
