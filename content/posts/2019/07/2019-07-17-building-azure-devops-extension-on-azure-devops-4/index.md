---
title: "애저 데브옵스 확장 기능을 애저 데브옵스에서 개발하기 - 수동 배포편"
date: "2019-07-17"
slug: building-azure-devops-extension-on-azure-devops-4
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure DevOps
- Extensions
- ALM
- Publish
- Package
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)에서 확장 기능 배포를 위해 [마켓플레이스](https://marketplace.visualstudio.com/azuredevops)에 퍼블리셔를 등록하는 방법에 대해 알아보았다면, 이번에는 이를 이용해서 실제로 출판하는 방법에 대해 알아보도록 하자.

## 목차

1. [애저 데브옵스 확장 기능 개발하기 - 설계편](https://blog.aliencube.org/ko/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. [애저 데브옵스 확장 기능 개발하기 - 개발편](https://blog.aliencube.org/ko/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. [애저 데브옵스 확장 기능 개발하기 - 배포편 계정 생성](https://blog.aliencube.org/ko/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. **_애저 데브옵스 확장 기능 개발하기 - 수동 배포편_**
5. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 1](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 2](https://blog.aliencube.org/ko/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## 사용자 케이스

개인적으로 [휴고](https://gohugo.io/)라는 정적 웹사이트 생성도구를 이용해서 웹사이트를 하나 만들어 보는 중인데, [휴고 확장 기능](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension)은 애저 데브옵스에서 찾을 수 있었지만, 이를 [Netlify](https://netlify.com)로 배포하는 확장 기능은 찾을 수 없었다. 따라서, 실제로 이 [Netlify](https://netlify.com) 확장 기능을 개발해 보도록 하자.

> 현재 Netlify 확장 기능은 [이곳](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)에 배포되었고, 실제 곧바로 사용할 수 있다. 이 포스트는 이 확장 기능을 개발하면서 실제 마주쳤던, 공식 문서에 구체적인 설명이 없지만 개발하면서 필요한 여러 가지 상황들을 기록하는 의미도 지니고 있다. 또한 이 확장 기능은 [이곳 깃헙 리포지토리](https://github.com/aliencube/AzureDevOps.Extensions)에서 관련 소스 코드를 확인할 수 있다.

## 확장 기능 패키징

마켓플레이스에 확장 기능을 출판 혹은 배포하기 위해서는 일단 패키징을 해야 한다. 패키지의 포맷은 `.vsix` 확장자를 갖고 있는데, 이는 기본적으로 `.zip` 파일의 다른 형태이며 패키징을 위한 선언(manifest) 파일을 작성해야 한다. 우선 이 선언 파일을 작성해 보도록 하자.

### 선언 파일 작성

선언 파일은 `vss-extension.json` 이라는 이름으로 확장 기능이 있는 폴더의 루트에 생성한다. 이 파일을 만들고 나면 대략 아래와 같은 구조가 될 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-01.png)

이제 이 파일의 내용을 아래와 같이 입력한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=vss-extension.json

뭔가 굉장히 많은 것 같지만, 실제로는 크게 복잡하지 않다. 각각의 어트리뷰트를 하나씩 짚어보자.

- `id`: 확장 기능의 패키지 ID. 이는 마켓플레이스 전체를 통틀어 유일해야 한다. 영문자, 숫자, 하이픈 등으로 구성한다.
- `veresion`: 확장 기능의 버전. 확장 기능에 포함되어 있는 개별 작업의 버전과 굳이 같을 필요는 없다.
- `name`: 확장 기능의 이름.
- `publisher`: 이 확장 기능을 출판하려는 퍼블리셔 ID.
- `description`: 확장 기능에 대한 간략한 소개.
- `targets`: 확장 기능이 담당하는 영역. 애저 데브옵스 관련해서라면 항상 이 `Microsoft.VisualStudio.Services` 값을 유지한다.
- `categories`: 애저 데브옵스 서비스. 빌드/릴리즈 파이프라인 관련 확장 기능이므로 `Azure Pipelines`로 설정했다.
- `tags`: 이 확장 기능에 부여하는 태그들. 검색에 용이하게 정하면 된다.
- `galleryFlags`: 마켓플레이스에 배포될 때 보이는 방식. `Free`, `Paid`, `Private`, `Public`, `Preview` 값이 올 수 있다.
- `icons`: 이 확장 기능을 대표하는 아이콘. 보통은 루트 디렉토리에 `icon.png` 형식으로 놓는다.
- `content`: 이 확장 기능을 설명하는 마크다운 파일 보통은 루트 디렉토리에 `README.md` 형식으로 작성한다.
- `files`: 이 확장 기능 패키지를 구성하는 데 필요한 파일 리스트.
    
    - 만약 `README.md` 파일에 이미지들이 필요하다면 해당 이미지 폴더를 추가시킬 수 있다. 그리고 해당 이미지 폴더는 인터넷 액세스가 가능해야 하므로 `addressable` 어트리뷰트 값을 `true`로 설정했다.
    - 현재 구조상 개별 작업 기능은 `src/install`, `src/deploy` 폴더에 있는데, 패키지 안에서는 반드시 루트 바로 아래에 있어야 하므로 `packagePath` 어트리뷰트를 사용해서 위치를 조정한다.
    - 또한 각각의 작업 기능은 모두 `node_modules` 폴더와 그 하위 폴더들이 필요한데, 이를 `src/node_modules` 폴더에서 `install/node_modules`, `deply/node_modules`로 복사하기 위해 앞서와 같이 `packagePath` 어트리뷰트를 사용해서 위치를 조정한다.
- `links`: 좀 더 많은 정보를 사용자에게 제공하기 위핸 외부 링크 URL 값을 제공한다. 여기에는 주로 `overview`, `license`, `repository`, `issues` 같은 값을 제공하면 된다.
- `repository`: 이 확장 기능이 오픈소스라면 해당 소스 코드 리포지토리를 제공한다.
- `badges`: 빌드/릴리즈 관련 상태 뱃지가 있다면 이 어트리뷰르틀 통해 제공할 수 있다.
- `contributions`: 개별 작업 기능별로 하나씩 이 값을 제공해야 한다.

여기서는 아주 간단하게 설명을 했지만, 만약 이 선언 파일의 형식에 대해 좀 더 자세히 알고 싶다면 [이 페이지](https://docs.microsoft.com/ko-kr/azure/devops/extend/develop/manifest)를 참조하도록 하자.

### 확장 기능 패키징

이제 선언 파일 생성도 끝났으니, 실제로 확장 기능을 패키징 해 볼 차례이다. 패키징을 위해서는 추가로 [애저 데브옵스 확장 기능 CLI](https://github.com/microsoft/tfs-cli)를 설치해야 한다. 아래 명령어를 통해 CLI를 설치한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-install-tfx-cli.cmd

CLI 설치가 끝났다면 `vss-extension.json` 선언 파일이 있는 위치에서 아래 명령어를 실행시켜 확장 기능 패키지를 생성한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=tfx-extension-create.cmd

`tfx-cli`에는 더 많은 명령어가 있지만 우리는 이 명령어 하나면 충분하다. 만약 더 많은 명령어를 보고 싶다면 [이 페이지](https://github.com/microsoft/tfs-cli)를 참조한다.

> 이 `tfx-cli`는 애저 데브옵스 확장 기능 CLI이다. 만약 애저 데브옵스 CLI를 원한다면 이는 [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/)의 확장 기능으로 작동하고, [여기](https://github.com/Azure/azure-devops-cli-extension)에서 확인할 수 있다.

이렇게 해서 `.vsix` 패키지 파일이 만들어졌다. 선언 파일에 지정한 퍼블리셔 ID와 패키지 ID, 버전에 따라 패키지 파일 이름은 대략 `[퍼블리셔 ID].[패키지 ID]-[버전].vsix`과 같은 형식이 된다.

## 확장 기능 패키지 출판

위에 만들어 놓은 `.vsix` 파일을 이제 마켓플레이스로 출판할 차례이다. 여기서는 `aliencube-dev` 퍼블리셔를 통해 출판하기로 하자.

[퍼블리셔 관리 화면](https://marketplace.visualstudio.com/manage)으로 들어가면 현재 `aliencube-dev` 퍼블리셔에는 아직 아무런 패키지도 등록되어 있지 않았다고 나온다. 이제 아래 `+ New Extension` 버튼을 클릭해서 새 패키지를 등록한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-02.png)

그러면 패키지 파일을 업로드 하라는 팝업 창이 나타날 것이다. 여기에 방금 생성한 `.vsix` 파일을 업로드한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-03.png)

하지만 업로드에 실패한다. 왜 이럴까? 아래 에러 메시지를 보면 `aliencube` 라는 퍼블리셔로 패키징을 한 것을 `aliencube-dev` 퍼블리셔에 등록하려고 했기 때문이란다. 즉, 선언 파일에서 퍼블리셔를 제대로 주고 다시 패키징을 해서 올리라는 의미가 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-04.png)

`vss-extension.json` 선언 파일을 수정한 후 `tfx-cli`를 통해 다시 패키징해서 업로드 해 보자. 이번엔 다른 에러가 나타난다. 이 에러 메시지는 무엇을 의미하는 걸까?

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-05.png)

현재 `aliencube-dev` 퍼블리셔는 공식 인증을 받지 못했으므로 공개 확장 기능을 출판하지 못한다는 뜻이다. 이를 해결하기 위해서는 `aliencube-dev` 퍼블리셔를 인증을 받거나, 비공개 패키지를 만들어 올리면 된다. 다시 `vss-extension.json` 선언 파일을 열어 `galleryFlags` 어트리뷰트에 `Public`이라고 되어 있는 부분을 `Private`으로 바꾸고 다시 패키징한다. 그리고 다시 업로드해 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-06.png)

이제 문제 없이 업로드가 된 것을 확인할 수 있다.

## 확장 기능 패키지 공유

위 그림에 있는 메시지에서 보이다시피 현재 출판된 이 확장 기능은 비공개이므로 아무도 사용할 수가 없는 상태이다. 따라서 특정 애저 데브옵스 인스턴스에만 공개를 해서 사용할 수 있게 해야 한다. 아래 그림과 같이 점 세개 버튼을 클릭해서 `Share/Unshare` 링크를 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-07.png)

그러면 아래 그림과 같이 비공개 확장 기능을 공유할 애저 데브옵스 인스턴스를 선택하는 화면이 나타난다. 여기서는 테스트용으로 만들어 놓은 `https://dev.azure.com/aliencube-dev` 인스턴스를 선택했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-08.png)

이제 실제 애저 데브옵스 인스턴스로 접속해 보자. 환경 설정 페이지에 접속할 수 있다면 아래와 같이 `Extensions` 탭을 선택한다. 그리고 우측 상단의 `Shared` 탭을 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-09.png)

그러면 위와 같이 공유된 애저 데브옵스 확장 기능이 보일 것이다. 이를 클릭해서 설치한다. 설치가 끝났다면 아래와 같은 화면을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-10.png)

이제 실제로 파이프라인에서 적용시켜 보도록 하자.

## 파이프라인 적용

빌드 혹은 릴리즈 파이프라인에서 작업 항목을 검색해보면 아래 그림과 같이 현재 애저 데브옵스 인스턴스에 설치된 확장 기능을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-4-11.png)

* * *

지금까지 해서 애저 데브옵스 확장 기능을 패키지로 만들고 실제 애저 데브옵스 인스턴스에 수동으로 설치해서 사용하는 방법을 살펴보았다.

그런데, 처음에 몇 번 에러가 생겼던 부분을 기억한다면 이게 과연 효과적인 방법일까 하는 것에 대한 의구심이 들 수 있다. 내가 만든 이 확장 기능을 최종적으로 공개하기 전에 분명 내부적으로 테스트를 하는 단계를 거쳐야 할텐데, 그러기 위해서는 `vss-extension.json` 선언 파일을 테스트 상황, 실제 공개 상황마다 계속 수정해야 한다. 이게 과연 올바른 방법일까? 좀 더 효과적으로 이를 제어할 수 있는 방법은 없을까?

수동으로 출판하는 방법에서는 분명히 한계가 있기 마련이라서, 이제는 이 출판 과정 자체도 자동화 할 수 있는 방법을 찾아야만 한다. [다음 포스트](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)에서는 이 배포/출판 과정을 자동화하는 방법에 대해 논의해 보도록 하자.

## 참고 자료

- [애저 데브옵스 확장 기능 선언 파일](https://docs.microsoft.com/ko-kr/azure/devops/extend/develop/manifest)
- [애저 데브옵스 확장 기능 CLI (`tfx-cli`)](https://github.com/microsoft/tfs-cli)
- [애저 CLI를 위한 애저 데브옵스 CLI 확장](https://github.com/Azure/azure-devops-cli-extension)
- [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/)
