---
title: ".editorconfig 파일을 활용한 정적 코드 분석"
date: "2019-09-25"
slug: static-code-analysis-with-editorconfig
description: ""
author: Justin Yoo
tags:
- .NET
- Static Code Analysis
- editorConfig
- Roslyn
- FxCop
- StyleCop
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/09/static-code-analycis-with-editorconfig-00.png
---

애플리케이션 혹은 시스템 개발 업무는 보통 혼자서 하기 보다는 여럿이서 팀으로 작업하는 경우가 대부분이다. 팀을 꾸릴 때 제일 처음으로 하는 것들 중 하나가 개발환경 설정인데, 이것은 공통의 개발환경을 맞춰서 코드 품질을 높이기 위한 것이기도 하고, "내 컴퓨터에서는 되는데요?" 와 같은 문제를 사전에 방지하기 위한 것이기도 하다. 코드 스타일의 일관성을 보장하기 위한 장치를 설정하는 것도 이 개발환경 설정 활동 중 하나이다. 이 포스트에서는 `.editorconfig` 파일을 통해 C# 정적 코드 분석 도구를 이용하고 이를 코드 스타일 일관성 유지를 위해 활용하는 방법에 대해 논의하기로 한다.

## `.editorconfig`

[EditorConfig.org](https://editorconfig.org/)에서는 스스로를 이렇게 정의하고 있다.

> EditorConfig helps maintain consistent coding styles for multiple developers working on the same project across various editors and IDEs. The EditorConfig project consists of a file format for defining coding styles and a collection of text editor plugins that enable editors to read the file format and adhere to defined styles. EditorConfig files are easily readable and they work nicely with version control systems. EditorConfig 프로젝트는 여러 명의 개발자가 같은 프로젝트에서 서로 다른 개발 에디터와 IDE를 사용한다거나 할 때 일관성있는 코딩 스타일을 유지하기 위한 도구입니다. EditorConfig 프로젝트는 코딩 스타일을 정의하는 파일 포맷과 이 파일 포맷을 다양한 텍스트 에디터에서 읽어들이고 정의된 코딩 스타일을 유지할 수 있게 해주는 다수의 플러그인을 지원합니다. EditorConfig 프로젝트에서 정의하는 파일은 가독성이 높고 다양한 버전 관리 도구에서 사용이 가능합니다.

즉, 이 `.editorconfig` 파일을 정의해서 프로젝트의 루트 디렉토리에 놓아두기만 하면 최소한 이를 통해 코딩 스타일에 일관성을 부여할 수 있게끔 해 준다는 얘기가 된다. 물론, 다양한 설정을 통해 일관성을 해치는 코드 부분을 단순히 경고로 처리할 것인지, 에러로 처리할 것인지에 대해서도 관리가 가능하다는 것이 바로 이 `.editorconfig`이 갖는 장점이라고 할 수 있겠다.

그렇다면, 이 `.editorconfig` 파일을 내 .NET 프로젝트에 어떻게 적용할 수 있을까?

## FxCop 분석기

기존의 비주얼 스튜디오를 이용해서 개발을 해봤다면 [`FxCop`](https://en.wikipedia.org/wiki/FxCop)과 [`StyleCop`](https://en.wikipedia.org/wiki/StyleCop)이라는 코드 분석 도구에 대해 들어봤을 것이다. 이 둘이 하는 일이 비슷하지만 전자는 컴파일된 바이너리를 분석하는 반면 후자는 소스코드를 분석하는 차이가 있고 따라서 서로의 관심사가 다르다. 그런데, 이제는 더이상 `FxCop`을 사용하는 대신 [`FxCop 분석기`](https://docs.microsoft.com/ko-kr/visualstudio/code-quality/fxcop-analyzers)라는 도구를 이용해 바이너리 대신 소스코드를 분석한다. 또한 [Roslyn](https://github.com/dotnet/roslyn)이라는 오픈소스 컴파일러를 이용하기 시작하면서 이 분석도구 역시도 비주얼 스튜디오에 의존하지 않고 [NuGet 패키지](https://www.nuget.org/packages/Microsoft.CodeAnalysis.FxCopAnalyzers/)를 통해 프로젝트별로 별도로 구성이 가능해졌다.

이 `FxCop 분석기`를 사용하는 방법은 굉장히 간단하다. 아래와 같이 NuGet 패키지를 해당 프로젝트에 다운로드 받으면 끝이다. 이 글을 쓰는 현재 [2.9.4 버전이 최신](https://www.nuget.org/packages/Microsoft.CodeAnalysis.FxCopAnalyzers/2.9.4)인데 상당히 자주 버전업이 되는 편이니 염두에 두면 좋겠다.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=dotnet-add-package.sh

굳이 커맨드라인이 아니더라도 직접 `.csproj` 파일을 아래와 같이 수정하면 패키지를 설치할 수 있다.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=csproj-package.xml

이렇게 다운로드 받은 후에 프로젝트를 컴파일하면 내 코드를 분석해서 빨간줄 녹색줄을 좍좍 보여준다. 그렇다면 도대체 무슨 기준으로 코드 분석을 하는 것일까? 마이크로소프트에서는 [소프트웨어 설계 가이드라인](https://docs.microsoft.com/ko-kr/dotnet/standard/design-guidelines/)이 있어서, 이 기준을 근거로 `FxCop 분석기`를 통해 코드 분석을 한다. 따라서 단순히 이 분석기만 설치한다면 기본 가이드라인대로 분석을 실행하게 된다. 하지만, 내 프로젝트에서는 살짝 변경하고 싶은 부분이 있다면 어떨까? 이럴 경우를 위해 커스텀 규칙 세트를 제공한다. 만약 NuGet 패키지를 다운로드 받아 설치했다면 해당 패키지가 다운로드되어 있는 폴더에 미리 정의된 `.ruleset` 파일이 있으니, 그 중 하나를 복사해 와서 내 프로젝트의 루트 디렉토리에 놓고 사용하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/static-code-analycis-with-editorconfig-01.png)

위와 같이 `AllRulesDefault.ruleset`을 내 프로젝트의 루트 디렉토리에 복사해 놓는다. 그리고 아래와 같이 `.csproj` 파일을 수정한다.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=csproj-ruleset.xml

이렇게 함으로써 모든 규칙 세트를 참조할 수 있게 되었다. 실제로 `AllRulesDefault.ruleset` 파일을 열어 보면 아래와 같이 생겼는데, 여기서 `Action` 어트리뷰트 값을 `None`, `Warning`, `Error` 등으로 바꾸면 컴파일하는 시점에서 이를 해석해서 코드 분석에 반영한다.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=default-ruleset.xml

이 `FxCop 분석기`는 현재 `.editorconfig` 파일에 100% 완벽하게 녹아들지 못한 상태이다. 따라서, 이 `.ruleset` 파일을 함께 사용하는 것이 좋다. `FxCop 분석기`를 지원하는 `.editorconfig` 옵션은 [여기](https://docs.microsoft.com/ko-kr/visualstudio/code-quality/fxcop-analyzer-options)에서 찾아볼 수 있다. 이 리스트는 계속해서 업데이트 되는 것 같으니 언젠가는 `.editorconfig` 파일이 `.ruleset` 파일을 완벽하게 대체할 날이 오...겠지?

## `StyleCop` 대체를 위한 `.editorconfig`

`.editorconfig` 파일은 `StyleCop`의 대용으로써 사용하는 것이 좀 더 현실적이다. 이 파일만 루트 디렉토리에 놓아두면 컴파일하면서 코딩 스타일을 자동으로 분석해서 결과를 보여준다. 또한 비주얼 스튜디오에서는 자동으로 이 `.editorconfig` 파일의 위치를 인식해서 [설정을 프로젝트에 맞게 변경해 준다](https://docs.microsoft.com/ko-kr/visualstudio/ide/create-portable-custom-editor-options#troubleshoot-editorconfig-settings).

모든 코딩 컨벤션과 관련한 `.editorconfig` 파일 옵션은 [이 페이지](https://docs.microsoft.com/ko-kr/visualstudio/ide/editorconfig-code-style-settings-reference)를 확인해 보도록 하자.

그런데, 맨 처음에 `.editorconfig` 파일을 만들어 놓으면 `.ruleset` 파일과 같이 기본값으로 제공해 주는 것이 없다. 따라서 누군가 기본값으로 만들어 둔 것을 사용하면 좋은데 다행히도 [Muhammad Rehan Saeed](https://twitter.com/RehanSaeedUK)이 [만들어둔 설정값](https://github.com/RehanSaeed/EditorConfig)을 기본으로 해서 용도에 맞게 변경하면 좋을 것이다. 아래는 기본 설정값의 한 부분이다. 해당 옵션을 `true`/`false`로 설정하고, 이를 위반한 코드를 발견할 경우 `warning`을 통해 컴파일 경고만 줄 것인지, `error`를 통해 컴파일 에러를 낼 것인지 `slient`를 통해 무시할 것인지 등을 결정하면 된다.

https://gist.github.com/justinyoo/770b5996aff3f639cd7209a82c222fc2?file=editorconfig.txt

* * *

지금까지 `.editorconfig` 파일을 이용해서 정적 코드 품질 분석을 하는 방법에 대해 알아 보았다. 현재는 코딩 스타일쪽에서는 `StyleCop`을 대체할 수 있을 만큼 성숙한 편이긴 하지만 아직까지는 `FxCop`을 완벽하게 대체할 수는 없는 상태이다. 하지만, 어느 정도 시간이 지나면 이 역시 해결될 문제로 보이니 그동안은 `.ruleset` 파일을 통해 함께 가는 것도 나쁘지 않은 선택이다.

앞으로 보다 나은 코드 품질을 위해!
