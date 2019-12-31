---
title: "Visual Studio Code 에서 깃헙 스타일 마크다운 사용하기"
date: "2016-07-06"
slug: markdown-in-visual-studio-code
description: ""
author: Justin Yoo
tags:
- Visual Studio Extensibility
- GFM
- GitHub Flavoured Markdown
- Markdown
- Visual Studio Code
fullscreen: false
cover: ""
---

최근까지 마크다운 에디터로 [MarkdownPad 2 Pro](http://markdownpad.com)를 유료 버전으로 사용하고 있었다. 그런데, 2014년 12월에 2.5 버전이 나온 이후 전혀 업데이트가 되질 않는데다가 윈도우 10 에서는 고해상도 지원이 제대로 되질 않아서 약간의 핵을 통해서 쓰고 있었다. 그러다가 이번에 [Visual Studio Code (`코드`)](http://code.visualstudio.com) 에서 마크다운을 제대로 지원한다는 소식을 듣고 정리할 겸 포스트를 남겨본다.

## 기본 기능

먼저 `코드`는 자체적으로 마크다운을 지원한다. 따라서, 마크다운으로 문서를 작성한 후 에디터 화면 우측 상단의 미리보기 버튼을 클릭하면 현재까지 작성한 마크다운 문서를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/markdown-in-vs-code-01.png)

만약 실시간으로 마크다운 변환을 확인하고 싶다면 `Ctrl + K V`(윈도우) 또는 `Cmd + K V`(맥) 키보드 단축키를 통하면 본문을 반으로 나눠 왼쪽에서는 마크다운 문서가 오른쪽에서는 HTML 변환 문서를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/markdown-in-vs-code-02.png)

이정도만 해도 사실 마크다운 에디터로 충분한 기본 기능을 가졌다고 할 수 있다. 하지만 인간의 욕심은 끝이 없는 법. 몇가지 익스텐션을 추가하면 좀 더 쾌적한 마크다운 문서 작성 환경을 즐길 수 있다.

## 익스텐션

마크다운 문서 작성을 위해 몇가지 필요한 익스텐션들을 소개한다.

- [**Spelling and Grammar Checker**](https://marketplace.visualstudio.com/items?itemName=seanmcbreen.Spell) 마크다운 문서를 작성하는 동안 오탈자 체크를 해준다. 한국어는 아직 안된다는 것은 함정. 어디 웹서비스 공개된 것 있으면 만들어 보련만...
    
- [**Auto-Open Markdown Preview**](https://marketplace.visualstudio.com/items?itemName=hnw.vscode-auto-open-markdown-preview) 실시간 미리보기 화면을 보기 위해서는 `Ctrl + K V`(윈도우) 또는 `Cmd + K V`(맥) 키보드 단축키를 사용해야 하는데, 이 익스텐션을 설치하면 마크다운 파일을 여는 것과 동시에 미리보기 창이 옆에 자동으로 나타난다.
    
- [**markdownlint**](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) 마크다운 문서 작성시 문서 포맷에 일관성을 줄 수 있게끔 화면에 이런저런 표시를 해 준다.
    

이것들 말고도 더 있긴 한데, 이정도만 해도 충분히 쾌적한 마크다운 문서 작성 환경을 누릴 수 있다.

## 미리보기 문서 스타일시트 적용

기본적으로 미리보기 화면은 에디터와 같은 시커먼 배경색을 갖고 있다. `코드`의 마크다운은 [GitHub Flavourd Markdown(`GFM`)](http://github.github.com/github-flavored-markdown)을 지원하므로 기왕 지원하는 거 깃헙 스타일로 미리보기 화면을 바꿔보도록 하자.

처음에 언급했던 Markdownpad 는 `GFM`을 지원하는데, 거기에 쓰인 CSS 파일은 [여기](https://github.com/nicolashery/markdownpad-github)에서 찾을 수 있다. 하지만, 이것은 한글폰트를 지원하지 않아서 이를 바로 포크 떠서 한글폰트를 넣었다. [이 리포지토리](https://github.com/aliencube/markdownpad-github)를 참조하면 동일한 CSS에 한글 `맑은고딕`을 적용시킨 것을 알 수 있다. 이 CSS 파일을 다운로드 받아 `코드`가 참조하는 사용자 설정 폴더에 저장한다.

https://gist.github.com/justinyoo/b84bd7f45b8a16709137d476bf458ca9

그다음에 아래와 같이 사용자 설정 화면에서 CSS 파일을 지정한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/markdown-in-vs-code-03.png)

https://gist.github.com/justinyoo/878c7194b7eb441eb43de126db2cadc5

그러면 이렇게 깃헙 스타일로 마크다운 문서를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/markdown-in-vs-code-04.png)

여기까지 해서 `코드`에서 마크다운 문서를 쾌적하게 작성하는 몇가지 팁들에 대해 살펴보았다. `코드`에서 마크다운 문서를 좀 더 하드코어하게 다루고 싶다면 [이 공식 문서](https://code.visualstudio.com/Docs/languages/markdown)를 읽어보면 좋다.
