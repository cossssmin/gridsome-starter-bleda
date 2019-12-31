---
title: "GitHub API를 이용하여 페이지 만들기"
date: "2014-05-01"
slug: creating-github-pages-using-github-apis
description: ""
author: Justin-Yoo
tags:
- front-end-web-dev
- AJAX
- api
- gh-pages
- GitHub
- jQuery
- linq.js
fullscreen: false
cover: ""
---

깃헙 리포지토리를 만들어서 소스코드를 공유하다보면 최소한 한 번 쯤은 깃헙 페이지를 만들어서 운영할 기회가 생긴다. 보통 이렇게 페이지를 만들어 운영할 때는 리포지토리에 대한 소개라든가 하는 경우들이 많기 때문에 깃헙에서 제공하는 리포지토리 관련 API를 이용하면 조금 더 편리하게 페이지를 작성할 수 있다. 여기서는 깃헙 API를 이용하여 `README.md` 파일을 변환하는 것, 특정 디렉토리의 파일들을 나열하는 것들을 구현해 보기로 한다.

## `gh-pages` 브랜치 만들기

우선 페이지를 만들고자 하는 깃헙 리포지토리를 선택한다. 여기서는 [추억의 369 게임](https://github.com/justinyoo/ThreeSixNine) 리포지토리를 이용해 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/gh-pages-01.png)

환경 설정 페이지에 보면 위와 같이 `Automatic page generator` 라는 버튼이 있다. 이것을 이용하여 자동으로 페이지를 생성한다. 여기서는 모든 것을 기본값으로 놓고 일단 페이지를 생성하는 것으로 하자. 페이지 생성이 끝나면 아래와 같은 모양이 나타날 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/gh-pages-02.png)

이제 이 기본 페이지를 이용하여 깃헙 API를 적용시킬 것이다. 우선 이 리포지토리를 클론하여 자신의 컴퓨터에 로컬 리포지토리를 생성한 후 `gh-pages` 브랜치로 이동한다.

## `README.md` 파일로 `index.html` 페이지 구성하기

`gh-pages`에 있는 `index.html` 파일을 텍스트 에디터로 열어보면 아래와 같은 부분을 발견할 수 있다.

```html
    <!-- MAIN CONTENT -->
    <div id="main_content_wrap" class="outer">
      <section id="main_content" class="inner">
        <h3>
<a name="welcome-to-github-pages" class="anchor" href="#welcome-to-github-pages"><span class="octicon octicon-link"></span></a>Welcome to GitHub Pages.</h3>
...
      </section>
    </div>

    <!-- FOOTER  -->

```

우리는 `<section>` 태그 안쪽의 내용을 모두 `README.md`의 내용으로 바꿀 예정이다. 우선 `<section>` 태그와 `</section>` 태그 사이의 모든 내용을 삭제한다. 그리고 AJAX를 이용하여 깃헙 API 데이터를 호출하기 위해 `</body>` 태그 바로 앞에 jQuery를 로딩한다.

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="javascripts/index.js"></script>

```

그리고 `index.js` 파일에 아래의 내용을 추가한다.

```js
;"use strict";

(function ($) {
    $(document).ready(function () {
        getReadme(); // #1
    });

    // Gets the README.md.
    var getReadme = function() {
        var url = "https://api.github.com/repos/justinyoo/ThreeSixNine/readme"; // #2
        $.ajax({
                type: "GET",
                url: url,
                dataType: "json"
            })
            .done(function(data) {
                var decoded = atob(data.content); // #3
                markdownToHtml(decoded); // #4
            });
    };

    // Converts the README.md markdown to HTML and put them into the HTML element.
    var markdownToHtml = function(markdown) {
        var url = "https://api.github.com/markdown"; // #5
        var params = {
            "mode": "gfm",
            "text": markdown
        };
        $.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(params), // #6
                dataType: "html"
            })
            .done(function(data) {
                $("#main_content").html(data); // #7
            });
    };
})(jQuery);

```

- `#1`: `getReadme()` 함수를 호출한다.
- `#2`: `README.md` 파일을 읽어들이는 깃헙 API를 호출한다[1](#fn-177-1).
    
    ![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/gh-pages-03.png)
    
    Fiddler를 이용하여 데이터를 확인해 보면 위와 같은 결과를 확인할 수 있는데, `content` 값이 바로 우리가 이용할 `README.md` 파일이다.
    
- `#3`: 위에서 확인한 바와 같이 `content` 값은 Base64 인코딩된 결과이므로, 이를 디코딩해야만 한다. 자바스크립트에서 Base64 인코딩/디코딩을 위한 함수에는 `atob()`, `btoa()`들이 있다.[2](#fn-177-2) 여기서는 `atob()` 함수를 사용하도록 한다. 함수 이름만으로는 ASCII to Base64 같은데, 실제로는 Base64 인코딩된 문자열을 ASCII 문자열로 변환시켜주는 역할을 하므로 주의하도록 한다. 변환 결과는 우리가 원하는 마크다운 문자열이다.
    
- `#4`: 위에서 얻어낸 마크다운 문자열을 이제 HTML 문서로 변환시켜야 한다. `markdownToHtml()` 함수를 이용한다.
- `#5`: 마크다운 문자열을 HTML 문자열로 변환시키는 깃헙 API를 호출한다[3](#fn-177-3).
- `#6`: POST 방식으로 AJAX 호출시 데이터는 반드시 시리얼라이징하여 전송해야 한다. 따라서 `JSON.stringify()` 함수를 이용하여 `params` 객체를 시리얼라이징한다.
- `#7`: AJAX 호출로 받아온 결과는 HTML로 변환된 문서이다. 이 변환 결과를 HTML 문서에 반환한다.

이렇게 해서 `index.html` 페이지의 내용을 `README.md` 파일의 내용으로 채워넣었다.

## `images.html` 페이지 만들기

`gh-pages` 브랜치를 만들게 되면 기본적으로 들어있는 이미지 파일이 몇 개 있다. 이들 이미지 파일을 리스트로 표현하는 `images.html` 페이지를 만들어 보자. 앞서 작성한 `index.html` 파일을 복사하여 `images.html` 파일을 하나 준비한다. 그리고 `images.html` 파일의 `</body>` 태그 바로 앞에 있는 자바스크립트 호출 구문을 아래와 같이 수정한다.

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/linq.js/2.2.0.2/linq.min.js"></script>
<script src="javascripts/images.js"></script>

```

그리고 `images.js` 파일에 아래의 내용을 추가한다.

```js
;"use strict";

(function ($) {
    $(document).ready(function () {
        getSha(); // #1
    });

    // Gets the latest commit ID of the gh-pages branch.
    var getSha = function() {
        var url = "https://api.github.com/repos/justinyoo/ThreeSixNine/git/refs/heads/gh-pages"; // #2
        $.ajax({
                type: "GET",
                url: url,
                dataType: "json"
            })
            .done(function(data) {
                getImages(data.object.sha); // #3
            });
    };

    // Gets the list of image files and put them into HTML elements.
    var getImages = function(sha) {
        var url = "https://api.github.com/repos/justinyoo/ThreeSixNine/git/trees/" + sha; // #4
        $.ajax({
                type: "GET",
                url: url,
                data: { "recursive": 1 },
                dataType: "json"
            })
            .done(function(data) {
                var ul = $("<ul></ul>");

                Enumerable.From(data.tree) // #5
                    .Where("$.type == \"blob\"")
                    .OrderByDescending("$.path")
                    .Select("$.path")
                    .Where(function(p) {
                        return p.match(/^images/.+\.png$/i) // #6
                    })
                    .ForEach(function(image, index) { // #7
                        $(ul).append(
                            $("<li></li>").append(
                                $("<img />").attr("src", image)
                        ));
                    });

                $("#main_content").append(ul); // #8
            });
    };
})(jQuery);

```

- `#1`: getSha() 함수를 호출한다. 이는 `gh-pages` 브랜치에서 가장 최근의 커밋을 찾는 역할을 한다.
- `#2`: `gh-pages` 브랜치에서 가장 최근의 커밋을 찾는 API를 호출한다[4](#fn-177-4). 피들러를 통해 이 결과를 살펴보면 아래의 그림과 같다.
    
    ![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/gh-pages-04.png)
    
    여기서 우리가 필요한 값은 `sha` 값이다.
    
- `#3`: 앞서 구한 `sha`값을 이용하여 이미지 파일들의 리스트를 구하는 함수를 호출한다.
    
- `#4`: 현재 브랜치의 모든 파일들의 리스트를 구하는 API를 호출한다[5](#fn-177-5). 피들러를 통해 결과를 살펴보면 아래의 그림과 같다.
    
    ![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/gh-pages-05.png)
    
    위의 그림에서 확인할 수 있다시피, 우리가 찾고자 하는 이미지 파일들 말고도 다른 파일들이 모두다 JSON 객체 안에 배열로 포함되어 있다.
    
- `#5`: 위에서 구한 파일들의 리스트들을 닷넷의 LINQ와 같은 기능을 하는 [linq.js](http://linqjs.codeplex.com)를 이용하여 걸러낸다.
    
- `#6`: 람다식을 이용하여 `images` 디렉토리 안의 `.png` 파일들만 골라낸다. 필터링에는 정규표현식을 이용했다.
- `#7`: 필터링해서 걸러낸 이미지 파일들을 루프로 돌려 리스트로 만든다. 이 부분은 `linq.js`의 jQuery 플러그인을 통한다면 더욱 간결하게 변환시킬 수도 있다.
- `#8`: 앞서 만들어 놓은 리스트를 HTML 문서에 포함시킨다.

이렇게 해서 `images.html` 페이지를 현재 브랜치에 있는 이미지 파일들을 리스트로 표현했다.

## 결과

이렇게 하여 만든 GitHub 페이지는 [http://369.justinchronicles.net](http://369.justinchronicles.net)에서 직접 확인이 가능하다.

지금까지 깃헙 API를 이용하여 자신이 운영하거나 참여하는 깃헙 리포지토리의 페이지를 만드는 작업을 해 보았다. 깃헙이 제공하는 API는 상당히 다양하고, 문서화도 잘 되어 있으므로 이들을 참고한다면 손쉽게 페이지들을 여러 형태로 응용하여 제작할 수 있을 것이다.

* * *

2. [Get the README](https://developer.github.com/v3/repos/contents/#get-the-readme) [↩](#fnref-177-1)

4. [Base64 encoding and decoding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding) [↩](#fnref-177-2)

6. [Render an arbitrary Markdown document](https://developer.github.com/v3/markdown/#render-an-arbitrary-markdown-document) [↩](#fnref-177-3)

8. [Get a Reference](https://developer.github.com/v3/git/refs/#get-a-reference) [↩](#fnref-177-4)

10. [Get a Tree](https://developer.github.com/v3/git/trees/#get-a-tree) [↩](#fnref-177-5)
