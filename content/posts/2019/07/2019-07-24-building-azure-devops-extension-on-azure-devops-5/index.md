---
title: "애저 데브옵스 확장 기능을 애저 데브옵스에서 개발하기 - 자동 배포편 1"
date: "2019-07-24"
slug: building-azure-devops-extension-on-azure-devops-5
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure DevOps
- Extensions
- ALM
- Publish
- Automated
- CI
- CD
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)에서는 확장 기능을 [마켓플레이스](https://marketplace.visualstudio.com/azuredevops)에 배포하기 위해 패키지를 만들고, 이 패키지를 `tfx-cli`를 이용해서 수동으로 배포해 보았다. 이 포스트에서는 이 패키지 및 배포 과정을 모두 애저 데브옵스의 CI/CD 파이프라인을 이용해서 자동화 해 보도록 한다.

## 목차

1. [애저 데브옵스 확장 기능 개발하기 - 설계편](https://blog.aliencube.org/ko/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. [애저 데브옵스 확장 기능 개발하기 - 개발편](https://blog.aliencube.org/ko/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. [애저 데브옵스 확장 기능 개발하기 - 배포편 계정 생성](https://blog.aliencube.org/ko/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. [애저 데브옵스 확장 기능 개발하기 - 수동 배포편](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. **_애저 데브옵스 확장 기능 개발하기 - 자동 배포편 1_**
6. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 2](https://blog.aliencube.org/ko/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## 사용자 케이스

개인적으로 [휴고](https://gohugo.io/)라는 정적 웹사이트 생성도구를 이용해서 웹사이트를 하나 만들어 보는 중인데, [휴고 확장 기능](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension)은 애저 데브옵스에서 찾을 수 있었지만, 이를 [Netlify](https://netlify.com)로 배포하는 확장 기능은 찾을 수 없었다. 따라서, 실제로 이 [Netlify](https://netlify.com) 확장 기능을 개발해 보도록 하자.

> 현재 Netlify 확장 기능은 [이곳](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)에 배포되었고, 실제 곧바로 사용할 수 있다. 이 포스트는 이 확장 기능을 개발하면서 실제 마주쳤던, 공식 문서에 구체적인 설명이 없지만 개발하면서 필요한 여러 가지 상황들을 기록하는 의미도 지니고 있다. 또한 이 확장 기능은 [이곳 깃헙 리포지토리](https://github.com/aliencube/AzureDevOps.Extensions)에서 관련 소스 코드를 확인할 수 있다.

## 빌드 파이프라인 생성

[이전 포스트](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)의 마지막에서도 언급했다시피 수동 배포시에는 테스트용 출판과 최종 출판을 위해 `vss-extension.json` 파일을 계속 수정해 가면서 패키지를 생성해야 했다. 하지만, 이는 처음 한 두번 정도는 괜찮을지 몰라도 반복적인 작업을 위해서는 결코 바람직한 방법은 아니다. 따라서, 전체 빌드, 테스트, 패키지, 출판의 모든 과정을 자동화하는 것이 좋은데, 이 빌드 파이프라인은 이 자동화를 위한 첫번째 단계이다.

> 현재 애저 데브옵스에서는 [멀티 스테이지 파이프라인](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/) 지원 기능이 프리뷰로 제공되고 있다. 이 포스트에서는 기존의 UI 방식을 이용해 빌드 및 릴리즈 파이프라인을 구성하기로 한다.

빌드 파이프라인 구성은 상대적으로 간단하다. 사실 테스트 코드가 있다면 그것까지 포함시켰겠지만, 현재 코드 리포지토리에서는 단위 테스트 코드가 들어있지 않으므로 이 부분이 빠져있다. 따라서 가장 단순하게

1. npm 패키지를 복원하고,
2. 타입스크립트를 자바스크립트로 컴파일한 후,
3. 마지막으로 릴리즈 파이프라인에서 사용할 수 있게끔 패키지를 생성한다.

위의 단계만 포함하면 빌드 파이프라인에서는 충분하다. 개인적으로는 개발용, PR용, 릴리즈용 파이프라인을 별도로 구성하는 것을 선호하는데, 각각 포함되는 작업 리스트가 다르기 때문이기도 하고, 관심사의 분리 관점에서도 좀 더 효율적이라고 보기 때문이다. 여기서는 릴리즈용 파이프라인만 다뤄보기로 한다.

가장 먼저 해야 할 일은 [Azure DevOps Extension Tasks](https://marketplace.visualstudio.com/items?itemName=ms-devlabs.vsts-developer-tools-build-tasks) 확장 기능을 내 애저 데브옵스 인스턴스에 설치하는 것이다. 이 확장 기능은 `tfx-cli`를 설치한 후 패키지를 생성하고 마켓플레이스에 출판하는 일련의 작업들을 포함하고 있다. 이 확장 기능을 설치한 후 아래와 같이 여러 작업들을 파이프라인에 추가하도록 하자.

### npm 패키지 복원

가장 먼저 npm 패키지들을 `npm install` 명령어를 통해 복원해야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-01.png)

### 타입스크립트 컴파일

두번째로는 모든 `.ts` 파일을 `.js` 파일로 컴파일한다. 이미 파워셸 스트립트를 통해 변환 스크립트를 만들어 둔 것이 있으므로 파이프라인 안에서는 단순히 이를 실행시키기만 하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-02.png)

실제 파워셸 스크립트는 아래와 같이 구성되어 있다.

```powershell
Param(
    [string] [Parameter(Mandatory=$true)] $SourceDirectory
)

cd $SourceDirectory

Get-ChildItem *.ts -File -Recurse | Where-Object {
    $_.FullName -notlike "*node_modules*"
} | ForEach-Object {
    tsc $_.FullName
}

```

### `tfx-cli` 설치

패키지를 만들기 위해서는 [지난 포스트](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)에서 언급한 바와 같이 가장 먼저 `tfx-cli`가 필요하므로 이를 파이프라인상에 설치하는 작업이 필요하다. 앞서 [Azure DevOps Extension Tasks](https://marketplace.visualstudio.com/items?itemName=ms-devlabs.vsts-developer-tools-build-tasks) 확장 기능을 이미 설치했으므로 이 확장 기능에 포함되어 있는 `tfx-cli` 설치 작업을 파이프라인에 추가하도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-03.png)

`tfx-cli`의 가장 최신 버전은 이 글을 쓰는 현재 `0.7.6`이다. 위 그림과 같이 `v0.7.x`로 적어두고 그 아래 `Auto Update`를 체크하면 가장 이 확장 기능 안에 캐시된 가장 최신 버전을 설치하게 된다.

### 확장 기능 패키징

가장 중요한 순서이다. 이 포스트에서 가장 중요한 부분이기도 한데, 포스트 초반에 언급했던 수동 배포시 문제점을 이 작업에서 해결할 수 있기 때문이다. 소스 코드 상에서 `vss-extension.json` 선언 파일은 최종 출판시 적용할 퍼블리셔 ID(`aliencube`)와 공개 확장 기능(`Public`, `Free`)임을 포함한다. 하지만, 이럴 경우 `aliencube-dev`로 출판할 수가 없다. 따라서, 이 패키지를 만들 때 필요한 퍼블리셔 ID와 공개 여부를 입력 변수화해서 적용한다. 아래 그림을 보면 좀 더 이해가 쉽다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-04.png)

퍼블리셔 ID 값은 `$(PublisherId)` 환경 변수 값을 이용해 지정하고, `Extension Visibility` 값은 `Private`으로, `Extension Pricing` 값은 `Free`로 지정해서 패키지를 생성한다. 사실 패키지를 생성할 때 이를 어떻게 지정할 지 여부는 정책에 근거해서 지정하면 된다. 빌드시 지정하는 값은 릴리즈 파이프라인에서 다시 조정이 가능하기 때문이다. 이는 이어서 다루도록 한다.

> `Extension Visibility` 값과 `Extension Pricing` 값 역시도 환경 변수를 통해 지정할 수 있으면 좋겠지만, 안타깝게도 현재 확장 기능에서는 지원하지 않는다.

### 패키지 업로드

이전 작업에서 생성한 패키지를 릴리즈 파이프라인에서 사용할 수 있게끔 파이프라인 상의 임시 저장소에 업로드 하는 작업이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-05.png)

이 작업까지 끝나면 릴리즈 파이프라인에서 이 패키지를 사용할 수 있는 모든 준비가 끝났다.

### 환경 변수 설정

빌드 파이프라인 상에서 사용한 환경 변수 값들은 아래와 같다. 참고만 하도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-06.png)

### 빌드 트리거 설정

CI 트리거를 위한 설정은 아래와 같다. 이 파이프라인은 릴리즈용으로 만든 것이므로, `release/netlify`라는 브랜치가 업데이트 될 때 자동으로 이 파이프라인을 실행시키게끔 해 놓았다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-07.png)

만약 개발용 CI 트리거를 걸고 싶다면 `release/*` 브랜치 대신 `dev`, `feature/*`, `hotfix/*` 등과 같이 브랜치 필터를 걸어놓으면 된다. 또한 PR에만 적용시키고 싶다면 CI 대신 그 아래에 있는 PR 확인 트리거를 활성화 시키면 된다.

지금까지 빌드 파이프라인을 설정했다. 이제 릴리즈 파이프라인을 구성해 보자.

## 릴리즈 파이프라인 생성

릴리즈 빌드가 끝나면 자동으로 CD 파이프라인을 활성화할 수 있게끔 아래와 같이 릴리즈 파이프라인을 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-08.png)

또한 업로드된 패키지가 `release/netlify` 브랜치를 통해 만들어진 것인지 여부를 확인하는 브랜치 필터 역시 설정해 두는 것이 좋다.

## 배포 스테이지 생성

배포 자동화를 위해 우리는 크게 두 개의 퍼블리셔를 이미 만들어 두었다. 이 두 개의 퍼블리셔는 각각 다른 스테이지를 담당하게 되는데, 하나는 `DEV`, 다른 하나는 `PROD` 스테이지이다.

### `DEV` 스테이지

`DEV` 스테이지의 첫번째 작업은 `tfx-cli`를 파이프라인상에 설치하는 것이다. 이 부분은 앞서 설정했던 빌드 파이프라인과 다르지 않다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-09.png)

다음으로는 패키지를 `aliencube-dev` 퍼블리셔를 통해 출판하는 작업이다. 빌드 파이프라인에서 생성한 패키지가 어떻든지간에 `aliencube-dev` 퍼블리셔를 위해서는 `Private`, `Free` 속성으로 바꿔야 하고, 퍼블리셔 ID도 바꿔야 하므로 아래 그림과 같이 `Publisher ID` 필드와 `Extension Visibility`, `Extension Pricing` 필드 값을 조정한다. 마지막으로 이 비공개 확장 기능을 공유하기 위한 애저 데브옵스 인스턴스를 `$(Organisation)` 값을 통해 가져온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-10.png)

### `PROD` 스테이지

앞서 설정한 `DEV` 스테이지와 거의 동일하다. 다만 `Extension Visibility` 필드와 `Extension Pricing` 필드 값만 `PROD` 스테이지에 맞게 바꿔주면 된다. 최대한 `DEV` 스테이지의 설정값을 그대로 유지하기 위해서 환경 변수 자체는 그대로 유지하고 해당 값만 `DEV`, `PROD` 스테이지에 맞게 바꿔주기만 하면 된다. 아래는 실제 환경 변수에 스테이지별로 할당한 값이다. 스코프가 `Release`인 경우에는 `DEV`, `PROD` 모두에 적용되는 것이고 `DEV`로 되어 있으면 오직 `DEV` 스테이지에만, `PROD`로 되어 있으면 `PROD` 스테이지에만 적용된다. 또한 동일한 환경 변수 값이 `Release`와 `DEV`에 있다면 `DEV`에 있는 환경 변수값을 우선적으로 가져오게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-11.png)

여기까지 해서 모든 CI/CD 설정이 다 끝났다. 이제 실제로 코드를 `release/netlify` 브랜치로 푸시해 보자. 그러면 빌드/릴리즈 파이프라인이 모두 작동하면서 확장 기능 패키지가 자동으로 빌드, 패키징, 퍼블리시되는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-12.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-5-13.png)

* * *

지금까지 애저 데브옵스 확장 기능에 대한 설계, 구현, 출판의 전 과정을 훑어보았다. 여기서 예로 든 [Netlify 확장 기능](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)은 꽤 간단하게 만들 수 있는 것이었지만, 이 글을 읽는 독자들의 상황에서는 좀 더 복잡해 질 수도 있는 것들이기도 하다. 그럼에도 불구하고 전체적인 자동화 프로세스는 동일하다고 생각한다. 향후 애저 데브옵스 확장 기능을 개발하는 데 있어서 이 시리즈가 도움이 될 수 있기를 희망한다.

[다음 포스트](https://blog.aliencube.org/ko/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)에서는 이번에 다룬 CI/CD 기능을 UI에서 해결하는 대신, YAML 파일을 이용해서 [멀티 스테이지](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/) 빌드/릴리즈를 시도해 보기로 한다.

## 참고 자료

- [멀티 스테이지 YAML 파이프라인 지원(프리뷰)](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/)
- [Azure DevOps Extension Tasks](https://marketplace.visualstudio.com/items?itemName=ms-devlabs.vsts-developer-tools-build-tasks)
