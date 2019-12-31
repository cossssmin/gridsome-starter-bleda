---
title: "애저 데브옵스 확장 기능을 애저 데브옵스에서 개발하기 - 설계편"
date: "2019-06-26"
slug: building-azure-devops-extension-on-azure-devops-1
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure DevOps
- Extensions
- ALM
- Design
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops.png
---

[애저 데브옵스](https://azure.microsoft.com/ko-kr/services/devops/)는 [애플리케이션 수명 주기 관리 (ALM; Application Lifecycle Management)](https://en.wikipedia.org/wiki/Application_lifecycle_management)를 위한 통합 솔루션을 제공하는 제품이다. 데브옵스는 바로 이 ALM에서 커다란 한 축을 담당한다. 제품명 혹은 서비스명만 놓고 보자면 마치 데브옵스 부분만을 다루는 것 같지만 사실 소프트웨어 개발에 필요한 요구사항 분석부터 제품 개발 및 테스트, 배포까지 거의 모든 부분을 자동화할 수 있는 아주 강력한 도구임에 틀림없다. 또한 애저 데브옵스는 강력한 확장성을 제공하고 [마켓플레이스](https://marketplace.visualstudio.com/azuredevops)를 통해 확장 기능을 배포하고 있다. 따라서 기본적으로 제공하는 기능 이외에 내가 더 필요한 기능이 있다면 검색을 통해 이 확장 기능을 추가할 수 있고, 만약 내가 원하는 기능이 없다면 직접 만들어 마켓플레이스에 올려 배포할 수도 있다. 이 포스트를 포함한 일련의 포스트에서는 이러한 애저 데브옵스 확장 기능을 개발하는 방법에 대해 여러 관점에서 다루어 보도록 한다.

## 목차

1. **_애저 데브옵스 확장 기능 개발하기 - 설계편_**
2. [애저 데브옵스 확장 기능 개발하기 - 개발편](https://blog.aliencube.org/ko/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. [애저 데브옵스 확장 기능 개발하기 - 배포편 계정 생성](https://blog.aliencube.org/ko/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. [애저 데브옵스 확장 기능 개발하기 - 수동 배포편](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 1](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 2](https://blog.aliencube.org/ko/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## 사용자 케이스

개인적으로 [휴고](https://gohugo.io/)라는 정적 웹사이트 생성도구를 이용해서 웹사이트를 하나 만들어 보는 중인데, [휴고 확장 기능](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension)은 애저 데브옵스에서 찾을 수 있었지만, 이를 [Netlify](https://netlify.com)로 배포하는 확장 기능은 찾을 수 없었다. 따라서, 실제로 이 [Netlify](https://netlify.com) 확장 기능을 개발해 보도록 하자.

> 현재 Netlify 확장 기능은 [마켓플레이스에 이미 배포되었고](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions), 실제 곧바로 사용할 수 있다. 이 포스트는 이 확장 기능을 개발하면서 실제 마주쳤던, 공식 문서에 구체적인 설명이 없지만 개발하면서 필요한 여러 가지 상황들을 기록하는 의미도 지니고 있다. 또한 이 확장 기능은 [이곳 깃헙 리포지토리](https://github.com/aliencube/AzureDevOps.Extensions)에서 관련 소스 코드를 확인할 수 있다.

## 애저 데브옵스 확장 기능 설계하기

애저 데브옵스 확장 기능을 개발할 때 두 가지 SDK를 사용할 수 있다. 하나는 [웹 확장 기능 SDK](https://github.com/Microsoft/vss-web-extension-sdk)이고 다른 하나는 [빌드/릴리즈 작업 확장 기능 SDK](https://github.com/microsoft/azure-pipelines-task-lib)이다. 웹 확장 기능은 보통 [애저 보드](https://azure.microsoft.com/ko-kr/services/devops/boards/)와 [애저 저장소](https://azure.microsoft.com/ko-kr/services/devops/repos/) 관련 확장 기능을 개발할 때 쓰이고, 빌드/릴리즈 작업 확장 기능은 [애저 파이프라인](https://azure.microsoft.com/ko-kr/services/devops/pipelines/) 관련 확장 기능을 개발할 때 쓰인다고 생각하면 쉽다. 여기서는 애저 파이프라인에서 사용할 빌드/릴리즈 작업 관련 확장 기능을 개발할 예정이므로 [빌드/릴리즈 작업 확장 기능 SDK](https://github.com/microsoft/azure-pipelines-task-lib)를 사용하기로 한다. 기본적인 확장 기능 개발 프로세스는 [이 문서(영문)](https://docs.microsoft.com/ko-kr/azure/devops/extend/develop/add-build-task)를 참고한다.

> [Netlify CLI](https://www.npmjs.com/package/netlify-cli)를 이용해 정적 웹사이트를 Netlify로 배포하기 위해서는 크게 두 가지 작업이 필요하다. 하나는 `netlify-cli` 설치 작업이고, 다른 하나는 `netlify-cli`를 이용해서 배포하는 작업이다. 첫번째 작업은 `install`이라는 이름으로, 두번째 작업은 `deploy`라는 이름으로 만들어 보도록 하자.

### 기본 폴더 구조 설계

우선 전체적인 폴더 구조를 정해보도록 하자. 아래 그림과 같이 `images`, `src`, `test` 폴더가 있고, `src` 폴더 아래 `install`, `deploy` 폴더를 만들어 두었다. 바로 이 `install`, `deploy` 폴더가 이 확장 기능에서 제공하는 개별 작업을 가리킨다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-1-01.png)

### `install` 작업 설계

이 작업을 통해 `netlify-cli`를 파이프라인 상에 설치한다. 작업을 설계하기 위해서는 `task.json`이라는 파일을 `install` 폴더 안에 생성하고 아래와 같이 입력한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=install-task.json

여기서 몇 가지 눈여겨 봐 두어야 할 속성은 아래와 같다.

- `id`: GUID 값을 입력한다. [여기](https://www.guidgen.com/)에서 손쉽게 GUID 값을 생성할 수 있다.
- `name`: 이 작업의 이름이다. 영문자와 숫자만 허용한다. 보통은 폴더 이름과 동일하게 하는 것이 좋다.
- `friendlyName`: 애저 데브옵스 화면에서 보이는 이름이다.
- `preview`: 이 작업이 프리뷰 기능임을 나타낸다. 보통은 `false`로 설정하면 된다.
- `showEnvironmentVariables`: 이 작업이 내부적으로 환경 변수를 사용한다면 `true`로 설정한다.
- `runsOn`: 이 작업이 작동하는 에이전트를 구분한다. 보통은 `Agent` (애저 데브옵스), `MachineGroup` (설치 그룹), `Server` (애저 데브옵스 서버) 이 세 환경 모두에서 돌아가게끔 설정하는 것이 좋다.
- `category`: 이 작업이 작동하는 애저 데브옵스 서비스를 지정한다. 여기서는 애저 파이프라인에 한해 작동하는 작업이므로 `Azure Pipelines`로 지정했다.
- `instanceNameFormat`: 이 작업을 파이프라인으로 가져올 때 초기 작업명으로 설정하는 값이다.
- `execution`: 이 작업이 실제로 어떤 파일을 실행시키는지 지정한다. 우리는 node.js를 이용해서 작업을 할 예정이므로 `Node`, `index.js`를 지정한다.
- `inputs`: 이 부분이 `task.json`의 가장 중요한 부분이다. 사용자의 입력값을 받아들이는 부분이다. 여기에 지정한 순서대로 애저 데브옵스 파이프라인 화면에 입력 필드가 나타나게 된다. 이 작업에서는 `netlify-cli` 버전을 입력하게끔 했는데, 만약 이 값이 주어지지 않는다면 최신 버전을 설치하게끔 할 예정이다.

이를 바탕으로 실제 설계된 화면은 아래와 같을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-1-02.png)

> 이 `task.json` 파일의 자세한 구조는 [`task.schema.json`](https://github.com/microsoft/azure-pipelines-task-lib/blob/master/tasks.schema.json)을 참조하도록 하자.

### `deploy` 작업 설계

이 작업을 통해 실제로 설치된 `netlify-cli`를 이용해서 정적 웹사이트를 Netlify에 설치한다. `netlify-cli`의 실제 명령어는 대략 아래와 같다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-deploy.cmd

따라서 위에 언급된 파라미터 값들을 작업 화면에서 넘겨주어야 하므로 이를 설계에 반영하도록 하자. `deploy` 폴더 아래에 `task.json` 파일을 생성하고 아래와 같이 입력한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=deploy-task.json

다른 부분은 이미 위에서 언급했으니 여기서는 `inputs` 항목에 대해서만 다루도록 한다. 앞서 `install` 작업과 달리 `deploy` 작업은 꽤 많은 사용자 입력값을 필요료 한다.

- `authToken`: **(필수)** Netlify 계정의 개별 액세스 토큰 (PAT; Personal Access Token) 값을 입력 받는 필드이다.
- `siteId`: **(필수)** Netlify에서는 웹사이트마다 고유의 ID값이 있다. 이 ID값을 입력 받는다.
- `sourceDirectory`: **(필수)** 정적 웹사이트 배포 파일이 있는 폴더 이름을 입력 받는 필드이다. 기본값으로 `$(System.DefaultWorkingDirectory)`를 가리키게끔 해 놓았다.
- `isValidationOnly`: **(선택)** 선택할 경우, 실제로 웹사이트를 배포하는 대신 배포가 제대로 되는지 검증만 한다. 선택하지 않으면 실제로 배포를 한다.
- `message`: **(선택)** 배포시 로그에 남길 메시지를 입력 받는 필드이다.
- `functionsDirectory`: **(선택)** AWS 람다 펑션도 함께 배포할 수 있는데, 이를 가리키는 폴더 이름을 입력 받는 필드이다.

이를 바탕으로 실제 설계된 화면은 대략 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-1-03.png)

### 작업별 아이콘 설정

[확장 기능 레이아웃](https://docs.microsoft.com/ko-kr/azure/devops/extend/develop/integrate-build-task#traditional-extension-layout) 페이지를 보면 각각의 작업별로 아이콘을 별도로 지정해 주어야 하는 것처럼 나와 있다. 사실 이 이상의 언급이 없어서 굉장히 애매했던 부분인데, 좀 더 자세한 내용이 [Stack Overflow](https://stackoverflow.com/questions/42050550/why-tfs-build-step-extension-icon-is-missing#42051436)에 나와있다. 이를 정리하자면,

- 아이콘 이름은 무조건 `icon.png`이어야 한다.
- 아이콘 사이즈는 무조건 `32x32`이어야 한다.
- 아이콘은 무조건 `task.json`과 동일한 위치에 있어야 한다.

이 조건이 맞지 않으면 확장 기능을 설치한 후 화면에 제대로 된 아이콘을 볼 수 없다.

* * *

이제 기본적인 작업 확장 기능 설계는 끝났다. 그리고 아래와 같은 폴더 및 파일 구조가 될 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-1-04.png)

각각의 `task.json`에 언급한 대로, 개별 작업은 최종적으로 실행시 `index.js` 파일을 호출하게 되는데, 이 부분에 대한 개발편은 [다음 포스트](https://blog.aliencube.org/ko/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)에서 다루기로 한다.

## 참고 자료

- [Hugo](https://gohugo.io/)
    
    - [Hugo Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension)
    - [Hugo Extension (Source Codes)](https://github.com/giuliov/hugo-vsts-extension)
- [Netlify](https://netlify.com/)
    
    - [Netlify Extension (Marketplace)](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)
    - [Netlify Extension (Source Codes)](https://github.com/aliencube/AzureDevOps.Extensions/tree/master/Netlify)
    - [Netlify Docs](https://www.netlify.com/docs/)
    - [Netlify CLI (Docs)](https://www.netlify.com/docs/cli/)
    - [Netlify CLI (npm Package)](https://www.npmjs.com/package/netlify-cli)
- [Develop Azure DevOps Extensions](https://docs.microsoft.com/en-us/azure/devops/extend/)
    
    - [Azure DevOps Marketplace](https://marketplace.visualstudio.com/azuredevops)
    - [Add Build or Release Task](https://docs.microsoft.com/en-us/azure/devops/extend/develop/add-build-task)
    - [Reference for Integrating Custom Build Tasks into Extensions](https://docs.microsoft.com/en-us/azure/devops/extend/develop/integrate-build-task)
    - [Why TFS Build Step Extension Icon Is Missing?](https://stackoverflow.com/questions/42050550/why-tfs-build-step-extension-icon-is-missing#42051436)
    - [Task Schema Reference](https://github.com/Microsoft/azure-pipelines-task-lib/blob/master/tasks.schema.json)
- [GUID Online Generator](https://www.guidgen.com/)
