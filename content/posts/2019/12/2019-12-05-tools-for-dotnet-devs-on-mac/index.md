---
title: "맥을 쓰는 닷넷 개발자들을 위한 도구들 모음"
date: "2019-12-05"
slug: tools-for-dotnet-devs-on-mac
description: ""
author: Justin Yoo
tags:
- .NET
- .NET Core
- Cross Platform
- Developer Environments
- Developer Experience
- Developer Tools
- Mac OS
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-00.png
---

최근에 맥북을 하나 구입하면서 기존의 .NET 프로그래밍 개발 경험을 윈도우에서 맥으로 옮기는 시도를 해 보았다. 아직까지는 계속 알아가는 중이긴 하지만, 그래도 한 두 번 정도 간단한 토이 프로젝트를 맥북에서 진행해 본 결과와 함께 어떤 도구를 사용했는지, 그리고 어떻게 개발 환경을 설정했는지 정리 차원에서 적어보고자 한다.

## 기본 개발 환경 설정

맨 처음에 어디부터 시작해야 할지 몰라 막막할 때 검색해서 나온 한줄기 빛 같은 [개발 환경 설정 포스트](https://www.sangkon.com/osx-setting-for-developer/). 거의 초기 환경 설정은 이 포스트를 따라 했다. 맥 OS 카탈리나 버전부터는 zsh 를 기본 셸로 사용한다고 하니, 거기에 맞춰서 설정하기만 하면 된다.

## 키보드 설정

윈도우 환경에서 개발을 하다가 맥으로 넘어오면 가장 당황스러운 것이 바로 키보드 배열이다. 가장 확연히 다른 부분은 바로 펑션 키, 콘트롤 키, 옵션 키, 코맨드 키의 쓰임이 윈도우와 많이 다르다는 것인데, 대부분의 경우 윈도우의 콘트롤 키에 해당하는 것이 맥에서는 코맨드 키에 해당하다 보니 적응이 쉽지 않다. 지금도 적응이 쉽지 않은데, 이를 해결하기 위해 아래 도구를 설치했다.

### Karabiner-Elements

[Karabiner-Elements](https://pqrs.org/osx/karabiner/)는 무료로 제공되는 앱으로 키보드 배열을 제어하는데 탁월한 장점을 갖고 있다. 이를 이용해서 맥의 키보드 배열을 윈도우와 비슷하게 바꿨다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-01.png)

- `fn` 키: 왼쪽 `command` 키로 변경
- 왼쪽 `control` 키: `fn` 키로 변경
- 왼쪽 `command` 키: 왼쪽 `control` 키로 변경
- 오른쪽 `command` 키: `F13` 키로 변경

이렇게 해 놓으니까 왼쪽 `command` 키와 `fn` 키의 조합이 꽤 윈도우 환경과 유사하게 자연스러워져서 개발자의 생명인 복붙이 아주 자연스럽게 편리해졌다. 그런데, 다 좋은데 뜬금없이 오른쪽 `command` 키는 왜 `F13` 키로 변경을 했을까?

### 시스템 키보드 입력 소스 단축키 설정

`F13` 키는 윈도우 시스템에서는 존재하지 않는 키이다. 맥에서는 이게 어떤 용도로 쓰이는지 알 수 없으나 거의 예비용 키로 쓰이는 것 같아서 이 키를 시스템 키보드 입력 소스 단축키 설정 화면에서 한/영 전환 키로 설정했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-02.png)

이렇게 우측 `command` 키를 한/영 전환키로 바꿔놓은 덕에 한영 전환도 굉장히 윈도우와 동일하게 자연스러워졌다.

## Better Snap Tool

[Better Snap Tool](https://folivora.ai/bettersnaptool)은 화면 분할 기능을 제공한다. 단축키를 통해 화면상의 다양한 위치로 현재 화면을 분할해서 손쉽게 옮길 수 있다. 사실 맥 자체에서도 기본적인 [화면 분할 기능](https://support.apple.com/ko-kr/HT204948)을 제공하긴 하지만 제한적인 기능만 있기 때문에 이 Better Snap Tool 같은 도구가 굉장히 유용하다. 또한 아래와 같이 단축키를 원하는 대로 설정해서 사용할 수 있다. 다만, 이게 무료가 아니라 유료라는 것이 살짝 걸림돌이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-03.png)

> 만약 오픈 소스 버전을 고려한다면 [Rectangle](https://rectangleapp.com/) 같은 것도 좋다.

## .NET Core SDK

[.NET Core](https://dotnet.microsoft.com/?WT.mc_id=aliencubeorg-blog-juyoo)는 오픈 소스 기반의 크로스 플랫폼 언어이자, 프레임워크이다. 가장 최신 버전의 SDK는 [`3.1.100 (3.1.0)`](https://dotnet.microsoft.com/download/dotnet-core/3.1?WT.mc_id=aliencubeorg-blog-juyoo)이다. 이는 공식 웹사이트에서 다운로드 받아서 사용할 수도 있지만 아래와 같이 [Homebrew](https://brew.sh/) 명령어를 이용해서 설치할 수도 있다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-dotnet.sh

그런데 이렇게 Homebrew 명령어를 이용해서 SDK를 설치할 때 문제가 하나 있다. 오직 등록된 최신 버전의 SDK만 다운로드 및 설치가 가능하다는 점이다. .NET Core 를 이용해 애플리케이션을 개발하다 보면 다른 버전의 SDK가 필요한 경우가 왕왕 있다. 예를 들어 일반 애플리케이션은 .NET Core 3 으로 개발한다지만, [애저 펑션](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo) 같은 경우 현재로서는 .NET Core 2.1/2.2 버전을 사용할 수 밖에 없다. 이럴 경우 구 버전의 SDK를 별도로 다운로드 받아 설치해야 하는데, 이런 경우에는 위의 명령어로는 가능하지 않다. 이 때 .NET Core SDK 버전을 선택할 수 있게 해주는 [.NET Core SDK Versions Tap](https://github.com/isen-ng/homebrew-dotnet-sdk-versions) 을 아래와 같이 설치하면 된다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-dotnet-sdk.sh

이를 이용해 다양한 버전의 .NET Core SDK 를 설치한 후 설치된 모든 SDK 버전은 아래와 같은 명령어를 통해 확인할 수 있다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=list-dotnet-sdk.sh

## 파워셸 코어

[파워셸](https://docs.microsoft.com/ko-kr/powershell/scripting/overview?view=powershell-6&WT.mc_id=aliencubeorg-blog-juyoo)은 윈도우 기반의 강력한 콘솔 스크립팅 언어였지만, 이제는 오픈 소스로 전환되면서 크로스 플랫폼을 지원한다. 따라서, 이 파워셸을 설치하면서 기존의 윈도우 환경에서 작성했던 파워셸 스크립트 개발 경험을 계속해서 이어갈 수 있게 되었다. 파워셸을 [Homebrew](https://brew.sh/)를 통해 설치하고 싶다면 아래 명령어를 입력하면 된다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-powershell.sh

이렇게 설치를 하고 난 후 실행을 시키면 맥의 기본 터미널이 파워셸 모드로 바뀌면서 나타난다. 이 때 터미널의 색상을 파워셸과 비슷하게 파란색 계열로 바꿔주면 실제 윈도우 파워셸 느낌도 잘 살고 좋다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-04.png)

여기에 더해 [애저 파워셸 모듈](https://docs.microsoft.com/ko-kr/powershell/azure/install-az-ps?view=azps-3.1.0&WT.mc_id=aliencubeorg-blog-juyoo#install-the-azure-powershell-module-1)까지 더 설치하고 싶다면 파워셸 콘솔에서 아래 명령어를 입력하면 된다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-azure-powershell.sh

## 애저 CLI

[애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=aliencubeorg-blog-juyoo)는 [애저 파워셸](https://docs.microsoft.com/ko-kr/powershell/azure/install-az-ps?view=azps-3.1.0&WT.mc_id=aliencubeorg-blog-juyoo#install-the-azure-powershell-module-1)과 마찬가지로 크로스 플랫폼으로 작동하는 애저 관련 도구이다. 애저 기반 애플리케이션을 개발하다 보면 애저 파워셸과 애저 CLI를 함께 사용하는 경우가 많으므로 둘 다 설치해서 사용하는 것이 좋다. 아래 명령어를 통해 애저 CLI를 설치할 수 있다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-azure-cli.sh

## Azurite

[Azurite](https://docs.microsoft.com/ko-kr/azure/storage/common/storage-use-azurite?WT.mc_id=aliencubeorg-blog-juyoo)는 `npm` 기반의 크로스 플랫폼 애저 저장소 에뮬레이터이다. 이를 이용해서 [애저 펑션](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo)과 같이 애저 블롭 저장소 같은 기능이 필요한 경우 로컬 개발 환경에서 애저 저장소를 사용할 수 있다. 설치는 아래 명령어를 이용하면 된다. 이 글을 쓰는 현재 `3.3.0-preview` 버전이 나와 있지만, 프리뷰는 프리뷰인지라 아직 안정적이지 않다. 따라서 가장 최신의 안정 버전인 `2.7.1` 버전을 설치하는 것이 좋다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-azurite.sh

설치가 끝난 후에는 아래와 같은 명령어를 통해 콘솔에서 실행시키면 된다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=run-azurite.sh

## Azure Storage Explorer

[애저 저장소 탐색기](https://azure.microsoft.com/ko-kr/features/storage-explorer/?WT.mc_id=aliencubeorg-blog-juyoo)는 로컬 저장소 에뮬레이터 혹은 애저에서 서비스하는 다양한 저장소들을 마치 로컬 탐색기에서 검색하듯 도와주는 도구이다. 이 역시도 크로스 플랫폼으로 만들어져 있기 때문에 아래와 같은 명령어를 통해 설치할 수 있다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-azure-storage-explorer.sh

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-09.png)

## Docker for Mac

[Docker for Mac](https://docs.docker.com/docker-for-mac/)은 맥에서 컨테이너 서비스를 만들고 테스트하는 용도로 쓰인다. 설치하기 위해서는 아래 명령어를 입력한다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-docker.sh

설치 후에는 터미널에서 별도의 설정 없이 곧바로 도커 CLI를 사용할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-05.png)

> 만약 도커를 위해 Virtual Box를 설치해서 사용하고 있었다면, 이제는 더이상 그러지 않아도 된다.

## GitKraken

맥 OS에는 기본적으로 git CLI가 탑재되어 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-06.png)

하지만 만약 윈도우 환경에서와 같이 GUI 환경에서 git을 사용하고 싶다면 다양한 크로스 플랫폼 도구들이 있는데, 이 때 [GitKraken](https://www.gitkraken.com/)은 좋은 대안이 될 수 있다. 무료 버전과 프로 버전 둘 다 있으니 용도에 따라 필요한 것을 선택하면 좋다. 아래 명령어를 통해 GitKraken을 설치한다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-gitkraken.sh

## 통합 개발 환경 (IDE)

맥에서 닷넷 개발을 위해 사용하고자 하는 통합 개발 환경은 크게 두 가지이다. 하나는 [맥용 비주얼 스튜디오](https://visualstudio.microsoft.com/vs/mac/?WT.mc_id=aliencubeorg-blog-juyoo)이고, 다른 하나는 [비주얼 스튜디오 코드](https://code.visualstudio.com/?WT.mc_id=aliencubeorg-blog-juyoo)이다.

### Visual Studio for Mac

[맥용 비주얼 스튜디오](https://visualstudio.microsoft.com/vs/mac/?WT.mc_id=aliencubeorg-blog-juyoo)을 설치하기 위해서는 아래 명령어를 입력한다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-visual-studio.sh

그리고 난 후, 프로젝트를 열어보면 아래와 같이 뙇!

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-07.png)

근데, 아직 비주얼 스튜디오나 비주얼 스튜디오 코드 만큼의 확장 기능 생태계가 갖추어져 있지 않아서 그런지 몰라도 윈도우 환경에서 사용하던 확장 기능들의 대부분을 사용할 수 없었다. 따라서, 어느 정도 생태계가 성숙해 질 때 까지는 당분간 사용 보류!

### Visual Studio Code

그렇다면 이제 [비주얼 스튜디오 코드](https://code.visualstudio.com/?WT.mc_id=aliencubeorg-blog-juyoo)가 대안으로 남았다. 크로스 플랫폼에 다양한 확장 기능을 제공하는 개발 도구로서 완벽하게 [비주얼 스튜디오](https://visualstudio.microsoft.com/vs/?WT.mc_id=aliencubeorg-blog-juyoo)를 대체할 수는 없지만, 그래도 얼추 많은 부분을 맞춰서 사용할 수 있다. 이를 설치하기 위해서는 아래 명령어를 입력한다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-visual-studio-code.sh

사실, 닷넷 애플리케이션 개발을 위해서는 [비주얼 스튜디오 코드](https://code.visualstudio.com/?WT.mc_id=aliencubeorg-blog-juyoo) 자체만으로 충분하긴 하지만 많은 번거로운 부분들이 있어서 몇 가지 필요한 확장 기능을 설치하는 것이 좋다. 이것저것 시도를 해 본 결과 아래 리스트가 현재까지는 완벽하진 않지만 많은 부분 [비주얼 스튜디오](https://visualstudio.microsoft.com/vs/?WT.mc_id=aliencubeorg-blog-juyoo)의 기능을 채워주고 있다. 확장 기능 별로 링크를 달아두었으니 별다른 부연 설명은 생략하기로 한다.

- [C#](https://marketplace.visualstudio.com/items?itemName=ms-vscode.csharp&WT.mc_id=aliencubeorg-blog-juyoo)
- [C# Sort Usings](https://marketplace.visualstudio.com/items?itemName=jongrant.csharpsortusings&WT.mc_id=aliencubeorg-blog-juyoo)
- [C# XML Comments](https://marketplace.visualstudio.com/items?itemName=k--kato.docomment&WT.mc_id=aliencubeorg-blog-juyoo)
- [Azure Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-node-azure-pack&WT.mc_id=aliencubeorg-blog-juyoo)
- [Azure Logic App](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-logicapps&WT.mc_id=aliencubeorg-blog-juyoo)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig&WT.mc_id=aliencubeorg-blog-juyoo)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens&WT.mc_id=aliencubeorg-blog-juyoo)
- [Git History](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory&WT.mc_id=aliencubeorg-blog-juyoo)
- [Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare&WT.mc_id=aliencubeorg-blog-juyoo)
- [PowerShell](https://marketplace.visualstudio.com/items?itemName=ms-vscode.PowerShell&WT.mc_id=aliencubeorg-blog-juyoo)
- [Visual Studio IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode&WT.mc_id=aliencubeorg-blog-juyoo)
- [Visual Studio Code Icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons&WT.mc_id=aliencubeorg-blog-juyoo)
- [SVG Viewer](https://marketplace.visualstudio.com/items?itemName=cssho.vscode-svgviewer&WT.mc_id=aliencubeorg-blog-juyoo)

이렇게 해서 개발 환경 설정이 끝나면 대략 아래와 같은 형태로 해서 닷넷 프로젝트를 생성할 수 있다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=create-dotnet-project.sh

이렇게 생성한 프로젝트를 [비주얼 스튜디오 코드](https://code.visualstudio.com/?WT.mc_id=aliencubeorg-blog-juyoo)로 열어서 작업을 하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/tools-for-dotnet-developers-on-mac-08.png)

## Postman

[Postman](https://getpostman.com)은 API 개발시 거의 반드시 필요한 도구라고 할 수 있다. 다른 좋은 도구들도 대안으로 사용할 수 있으니 필요에 따라 설치하면 좋다. 포스트맨을 설치하기 위한 명령어는 아래와 같다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-postman.sh

## ngrok

[ngrok](https://ngrok.com/)은 웹훅 API를 개발하면서 로컬에서 테스트할 때 사용하기 좋은 도구이다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-ngrok.sh

> [이전 포스트](https://blog.aliencube.org/ko/2017/06/02/tools-for-testing-webhooks/)에서 ngrok 사용법과 관련한 내용을 다룬 적이 있으니 한 번 봐 두는 것도 나쁘지 않다.

* * *

아래에 소개할 몇 가지 도구들은 닷넷 개발을 위해서 필수적인 것들은 아니지만 기술문서를 작성하기 위해서 필요한 것들이다.

## Snag It

[Snag It](https://www.techsmith.com/screen-capture.html)은 스크린 캡처를 위한 도구이다. 맥 OS에서 [기본으로 제공하는 기능](https://support.apple.com/ko-kr/HT201361)도 나쁘진 않지만 뭔가 살짝 부족하다고 생각할 경우 유용하다. 유료 버전으로 구매할 수 있으니, 혹시나 무료 버전을 원한다면 다른 대안을 찾아 보는 것도 나쁘지 않다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-snagit.sh

## Camtasia

[Camtasia](https://www.techsmith.com/video-editor.html)는 동영상을 찍을 때 유용한 도구이다. 맥 OS에서 [기본으로 제공하는 기능](https://support.apple.com/ko-kr/HT208721) 역시 나쁘진 않지만, 좀 더 풍부한 기능이 필요하다면 고려해 볼 수 있다. 유료 버전으로 구매할 수 있으니, 혹시나 무료 버전을 원한다면 다른 대안을 찾아보는 것이 좋다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-camtasia.sh

## Grammarly

[Grammarly](https://www.grammarly.com/)는 영어로 기술문서를 작성할 때 문법적인 오류 혹은 적절한 어휘 선택 등을 도와주는 아주 좋은 도구이다. 영어가 모국어가 아닌 사람들이 기술 문서를 작성할 때 굉장히 유용한 도구라고 할 수 있겠다. 웹브라우저마다 확장 기능을 제공하고 있으니 그걸 사용해도 좋고, 아래 명령어를 통해 데스크탑 애플리케이션을 설치해서 써도 좋다. 무료 버전으로도 충분한 기능을 제공하긴 하는데, 좀 더 풍부한 기능을 원한다면 유료 구입도 나쁘지 않다.

https://gist.github.com/justinyoo/3bfe96fe51b3ea489b5fb25f43c2cf54?file=install-grammarly.sh

* * *

지금까지 윈도우에서 맥으로 개발 환경을 바꾸면서 최대한 윈도우 환경의 개발 경험을 유지하기 위해 설치한 도구들에 대해 논의해 봤다. 앞으로 미래의 나를 포함한 누군가는 또 비슷한 경험을 할텐데, 그 때 도움이 되길 바란다.
