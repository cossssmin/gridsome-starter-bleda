---
title: "자바스크립트에서 strict mode를 사용해야 하는 이유"
date: "2014-01-02"
slug: reasons-behind-using-strict-mode-while-coding-javascript
description: ""
author: Justin Yoo
tags:
- Front-end Web Dev
- EcmaScript 5
- JavaScript
- Strict Mode
- Translation
fullscreen: false
cover: ""
---

이 포스트는 [Stack Overflow](http://stackoverflow.com)의 [What does “use strict” do in JavaScript, and what is the reasoning behind it?](http://stackoverflow.com/questions/1335851/what-does-use-strict-do-in-javascript-and-what-is-the-reasoning-behind-it)의 질문과 답변을 번역한 내용입니다.

## 자바스크립트에서 `use strict`는 뭘 하는 것이고, 왜 그걸 써야 하나요?

_질문_:

최근에 내가 짰던 자바스크립트 코드를 크록포드의 [JSLint](http://www.jslint.com)를 통해 실행시켰더니 아래와 같은 에러가 나타났습니다:

> Problem at line 1 character 1: Missing "use strict" statement.

검색을 좀 해봤는데, 몇몇 사람들이 `"use strict;"` 라인을 그들의 자바스크립트 코드에 추가했다는 것을 알아챘습니다. 저도 이것을 따라서 추가해 봤더니, 위의 에러가 더이상 나타나지 않네요. 구글에서 검색을 해 봤는데, 이것을 추가하는 이유에 대해서 딱히 찾을 수가 없더라구요. 분명히 이것을 통해 브라우저가 자바스크립트를 해석하는 데 영향을 주는 것 같은데, 이걸 사용하면 나타날 수 있는 효과에 대한 것에 대한 것을 전혀 모르겠습니다.

`"use strict";`가 도대체 무엇이고, 이것이 의미하는 것은 무엇이며, 필요하긴 한 건가요?

현재 쓰이고 있는 브라우저들이 이 `"use strict";` 문자열에 대응하는지요, 아니면 향후에 쓰일 것에 대한 대비인가요?

- [Mark Rogers](http://stackoverflow.com/users/25847/mark-rogers), 2009년 8월 26일에 질문
- [hippietrail](http://stackoverflow.com/users/527702/hippietrail), [2012년 10월 30일에 질문 수정](http://stackoverflow.com/posts/1335851/revisions)

* * *

_답변_: (가장 추천수가 높은 것만을 번역했습니다: 역자 주)

이 문서가 도움이 될 겁니다: [John Resig - ECMAScript 5 Strict Mode, JSON, and More](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more)

인상적인 부분을 살짝 인용하자면:

> Strict Mode is a new feature in ECMAScript 5 that allows you to place a program, or a function, in a "strict" operating context. This strict context prevents certain actions from being taken and throws more exceptions. `Strict Mode`는 ECMAScript 5 버전에 있는 새로운 기능으로써, 당신의 프로그램 또는 함수를 **엄격한** 운용 콘텍스트 안에서 실행시킬 수 있게끔 합니다. 이 엄격한 콘텍스트는 몇가지 액션들을 실행할 수 없도록 하며, 좀 더 많은 예외를 발생시킵니다.

이와 더불어:

> Strict mode helps out in a couple ways:
> 
> - It catches some common coding bloopers, throwing exceptions.
> - It prevents, or throws errors, when relatively "unsafe" actions are taken (such as gaining access to the global object).
> - It disables features that are confusing or poorly thought out.
> 
> `Strict Mode`는 몇가지 면에서 도움이 되는데:
> 
> - 흔히 발생하는 코딩 실수를 잡아내서 예외를 발생시킵니다.
> - 상대적으로 _안전하지 않은_ 액션이 발생하는 것을 방지하거나 그럴 때 예외를 발생시킵니다. 예를 들자면 전역객체들에 접근하려 한다거나 하는 것들이겠지요.
> - 혼란스럽거나 제대로 고려되지 않은 기능들을 비활성화시킵니다.

이 `strict mode`는 파일 전체에 적용시킬 수도 있고, 아니면 특정한 함수 안에서만 적용시킬 수도 있습니다.

```
// Non-strict code...

(function(){
    "use strict";

    // Define your library strictly...
})();

// Non-strict code...

```

위와 같은 방식으로 한다면, 예전의 레거시 코드와 새 코드가 한 파일 안에 섞여 있을 때 도움이 될 것입니다.

아마도 이 `"use strict";`는 왠지 Perl 에서 온 것 같기도 하네요. 이것을 사용함으로써 오류가 발생할 수 있는 좀 더 많은 부분을 검사할테니, 훨씬 더 적은 에러를 만들 수 있을 겁니다.

* * *

_역자 추가_:

위의 내용과 더불어 [Can I use ECMAScript 5 Strict Mode?](http://caniuse.com/use-strict) 페이지를 보면 지원하는 브라우저의 버전을 제공하고 있는데, IE는 이 **strict mode**를 버전 10부터 지원한다. 그렇다고 해서 낮은 버전의 IE를 위해서 쓰지 말아야 하는가 하면 그렇지도 않다. 위에 언급한 [John Resig의 포스트](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more)를 다시 인용하자면:

> This means that you can turn strict mode on in your scripts – today – and it'll have, at worst, no side effect in old browsers. **strict mode**를 지금 당장 활성화 시켜야 한다는 것을 의미하고, 이전 브라우저에서는 최악의 경우에라도 아무런 부작용이 없습니다.

따라서, 기존의 자바스크립트 코드에 대해 좀 더 엄격한 검사를 실행시키고 싶다면 문서의 첫 줄에 `"use strict";`를 추가하고, 기존의 것은 그대로 놔두고, 새로운 코드에 대해서만 추가하고 싶다면 각각의 함수 블록 처음에 추가하는 것이 좋겠다.
