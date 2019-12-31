---
title: "애저 데브옵스 확장 기능을 애저 데브옵스에서 개발하기 - 자동 배포편 2"
date: "2019-07-31"
slug: building-azure-devops-extension-on-azure-devops-6
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
- Multi-Stage
- YAML
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)에서는 확장 기능을 [마켓플레이스](https://marketplace.visualstudio.com/azuredevops)에 배포하기 위해 애저 데브옵스의 CI/CD 기능을 적극적으로 이용해 보았다. 이 포스트에서는 이 시리즈의 마지막으로 CI/CD 파이프라인 마저도 YAML 파일로 저장해서 빌드 및 릴리즈 과정 까지도 모두 소스코드로 관리할 수 있는 방법을 알아보도록 한다.

## 목차

1. [애저 데브옵스 확장 기능 개발하기 - 설계편](https://blog.aliencube.org/ko/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. [애저 데브옵스 확장 기능 개발하기 - 개발편](https://blog.aliencube.org/ko/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. [애저 데브옵스 확장 기능 개발하기 - 배포편 계정 생성](https://blog.aliencube.org/ko/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. [애저 데브옵스 확장 기능 개발하기 - 수동 배포편](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 1](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. **_애저 데브옵스 확장 기능 개발하기 - 자동 배포편 2_**

## 사용자 케이스

개인적으로 [휴고](https://gohugo.io/)라는 정적 웹사이트 생성도구를 이용해서 웹사이트를 하나 만들어 보는 중인데, [휴고 확장 기능](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension)은 애저 데브옵스에서 찾을 수 있었지만, 이를 [Netlify](https://netlify.com)로 배포하는 확장 기능은 찾을 수 없었다. 따라서, 실제로 이 [Netlify](https://netlify.com) 확장 기능을 개발해 보도록 하자.

> 현재 Netlify 확장 기능은 [이곳](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)에 배포되었고, 실제 곧바로 사용할 수 있다. 이 포스트는 이 확장 기능을 개발하면서 실제 마주쳤던, 공식 문서에 구체적인 설명이 없지만 개발하면서 필요한 여러 가지 상황들을 기록하는 의미도 지니고 있다. 또한 이 확장 기능은 [이곳 깃헙 리포지토리](https://github.com/aliencube/AzureDevOps.Extensions)에서 관련 소스 코드를 확인할 수 있다.

## 클래식 CI/CD 파이프라인

[이전 포스트](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)에서 다룬 CI/CD 파이프라인은 애저 데브옵스의 파이프라인 기능을 UI 상에서 작성한 것이다. 다른 CI/CD 도구들이 대부분 스크립트 방식만을 제공하는 반면, 애저 데브옵스에서는 이러한 시각화 과정을 통해 CI/CD를 구현할 수 있다는 점에서 굉장한 마케팅 포인트이기도 하고 또한 개발자에게 있어서 손쉽게 접근할 수 있는 방법이기도 하다.

하지만, 다른 한 편으로는 데브옵스 관점에서 볼 때, 이 시각화된 CI/CD 파이프라인이 별도의 히스토리로 애저 데브옵스 안에서 관리가 된다는 걸 고려해 본다면, 관리 포인트가 소스코드 뿐만 아니라 파이프라인이 별도의 장소에서 별도의 관리를 받아야 하는 셈이다. 어찌 보면 관리 포인트가 하나 더 늘어나는 셈인데, 그 관점에서 본다면 기존의 소스코드와 한꺼번에 같은 자리에서 관리할 수 있다면 어떨까 하는 생각이 들 법도 하다.

다행히도 애저 데브옵스는 YAML 형태의 빌드/릴리즈 파이프라인을 지원한다. 즉, 코드의 형태로 파이프라인을 생성하고 관리가 가능하다는 말과 같다.

## YAML 파이프라인

빌드 파이프라인을 YAML 포맷으로 관리하는 기능은 꽤 오래 전 부터 지원해 왔지만, 이 글을 쓰는 시점에서는 [멀티 스테이지 파이프라인](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/) 이라는 기능을 프리뷰로 제공하고 있다. 이 멀티 스테이지 기능을 이용하면 빌드 뿐만 아니라 릴리즈 단계 까지도 YAML 포맷으로 설정이 가능하다. 이 시리즈에서는 빌드 파이프라인을 세 개로 구분해 놓았다. 하나는 개발용, 다른 하나는 PR용, 마지막 하나는 릴리즈용이다. 각각의 상황마다 다른 작업들을 호출해야 하므로 이렇게 구분해 놓는 것이 좋다. 물론, 독자의 상황에서는 다르게 구분할 수도 있다.

멀티 스테이지 파이프라인 기능을 사용하기 위해서는 우선 프리뷰 기능을 활성화 시켜야 한다. 본인의 프로필 사진을 클릭해서 `Preview Features` 메뉴를 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-01.png)

그러면 프리뷰 기능 활성화 창이 나타나는데, 나에게만 적용할 것인지, 아니면 인스턴스 전체에 적용할 것인지 결정한 후 `Multi-step Pipelines` 항목을 활성화 시킨다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-02.png)

그러면 빌드 파이프라인 UI가 바뀔 것이다. 처음엔 좀 어색하긴 하지만, 몇 번 보다보면 바로 적응이 되니까 너무 걱정하지는 말자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-03.png)

### 빌드 파이프라인

먼저 빌드 파이프라인을 한 번 살펴보자. 꽤 복잡해 보이는데 사실 꼭 그렇지도 않다. 가장 기본적인 시작은 [이 페이지](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/customize-pipeline)를 참조하면 좋다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425#file-netlify-build-yaml

각각의 항목을 간단하게 다뤄보도록 하자.

- `name`: 어트리뷰트 이름과는 좀 다르게 파이프라인의 버저닝을 담당한다. 여기서 쓰인 `$(Version)` 값은 아래 언급할 환경 변수 그룹에서 참조한다.
- `variables`: 환경 변수를 설정한다. 직접 환경 변수를 설정할 경우, `name/value` 쌍으로 하고, 환경 변수 그룹을 참조할 경우 위와 같이 `groups` 어트리뷰트를 이용한다.
- `trigger`: 어떤 브랜치에서 이 파이프라인을 실행시킬지를 결정한다. 브랜치 필터(`branches`)와 경로 필터(`paths`)를 사용할 수 있다. 만약 `*`나 `?` 같은 와일드카드를 사용한다면 반드시 따옴표로 감싸주도록 한다. 빌드 파이프라인은 오로지 `dev`, `feature/*`, `hotfix/*` 브랜치에서만 반응하게끔 설정했다.
- `stages`: 싱글 스테이지의 경우에는 필요가 없지만, 멀티 스테이지를 가정할 경우에는 반드시 `stages`를 선언하고 그 아래 배열로 `stage`를 선언한다.
- `stage`: 실제 빌드가 이루어지는 스테이지이다. 스테이지는 `jobs` 어트리뷰트가 있어서 여러개의 `job`을 구성한다.
- `job`: 빌드/릴리즈 에이전트 하나당 `job` 하나가 할당 된다고 보는 것이 편하다. 하나의 `job` 아래에는 실제 빌드에 필요한 작업들이 `steps` 밑으로 선언된다.
- `steps`: 개별 작업을 설정하는 어트리뷰트이다. `steps` 아래에 `task`를 통해 개별 작업을 설정한다.
- `task`: 실제 작업 단위이다. [이전 포스트](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)에서 언급한 두 작업을 선언했다.

이렇게 해서 빌드 파이프라인 정의는 끝났다. 이 파이프라인을 리포지토리로 푸시한 후 파이프라인을 생성해 보자. 아래 그림과 같이 `New Pipeline` 버튼을 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-07.png)

그러면 리포지토리를 선택하라고 나온다. 모두 `YAML` 뱃지가 붙어 있는데, 이를 선택하면 YAML 형식의 파이프라인을 구성한다는 의미이다. 이 시리즈에서 사용한 리포지토리는 깃헙에 있으므로 `GitHub`을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-08.png)

그러면 내가 연동시켜 놓은 깃헙 계정으로 접근 가능한 리포지토리들을 주욱 볼 수 있다. 연동하고자 하는 리포지토리를 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-09.png)

이제 미리 정해진 YAML 파이프라인을 쓸 것인가, 내가 직접 만든 파이프라인을 쓸 것인가를 선택해야 한다. 우리는 이미 파이프라인을 다 만들어 뒀으므로 `Existing Azure Pipelines YAML File` 항목을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-10.png)

그러면 현재 푸시해 놓은 파이프라인의 위치를 입력하라고 하는데 정확하게 지정하면 오른쪽 아래 `Continue` 버튼이 활성화된다. 클릭해서 다음 화면으로 넘어가 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-11.png)

여기서 이미 작성한 파이프라인을 최종적으로 검토할 수 있다. 필요하다면 수정도 가능하다. 확인이 끝났으면 우측의 `Run` 버튼을 클릭해서 최초 수동 실행을 통해 실제 파이프라인이 제대로 작동하는지 검증한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-12.png)

파이프라인 실행이 끝나면 아래와 같은 화면을 볼 수 있다. 단일 스테이지 파이프라인이므로 화면 중간에 녹색 체크 마크가 하나만 보인다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-04.png)

### PR 파이프라인

현재로써는 PR 파이프라인과 빌드 파이프라인은 동일하다. 향후 테스트라든가 기타 다른 몇 가지가 추가될 경우 달라질 수도 있다. PR 파이프라인에서 현재 확인할 수 있는 유일한 차이는 `trigger` 대신 `pr` 어트리뷰트를 사용한다는 것이다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425#file-netlify-pr-yaml

이렇게 `pr` 어트리뷰트를 설정해 놓으면 PR 파이프라인은 같은 `dev` 브랜치 필터를 사용하지만, 평소에는 반응하지 않다가 누군가 `dev` 브랜치로 PR을 날릴 경우에만 반응하게 된다.

### 릴리즈 파이프라인

위에 정의한 빌드 및 PR 파이프라인의 경우 빌드 단계에서 끝나기 때문에 멀티 스테이지라고 부르긴 어렵다. 하지만, 릴리즈 파이프라인의 경우에는 빌드 이후 출판을 위한 패키지를 생성하고 이를 다양한 퍼블리셔 환경 (`aliencube-dev`, `aliencube`)을 통해 출판하기 때문에 멀티 스테이지 빌드 환경을 구성할 수 있게 된다. 아래 코드를 살펴 보도록 한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425#file-netlify-release-yaml

위에 언급한 빌드 파이프라인과 큰 틀에서는 거의 차이가 없다. 다만 트리거 브랜치가 `release/netlify`로 바뀌었을 뿐이고, 빌드 파이프라인 상에서 확장 기능 패키지를 만들어 파이프라인에 올리는 작업이 추가되었다.

그런데, 그 아래에 보면 또다른 `stage`가 보일 것이다. 하나는 `DEV`라고 이름 붙어있고, 다른 하나는 `PROD`라고 이름이 붙어있다. 이 부분이 바로 멀티 스테이지 파이프라인이다. 잠시만 짚고 넘어가 보도록 한다.

- `jobs` 아래에 빌드 스테이지에서는 `job`을 선언했다면, 릴리즈 단계에서는 `jobs` 아래에 `deployment`를 선언한다. 그리고 그 아래에 `strategy`, `runOnce`, `deploy` 단계를 거쳐 실제 릴리즈를 위한 `steps`, `task`를 선언한다. 이 부분이 가장 큰 차이점이라고 할 수 있다.
- `task` 이름을 보면 써드파티 확장 기능을 사용할 경우 `[퍼블리셔 ID].[확장 기능 ID].[작업 이름]@[메이저 버전]`의 형식으로 풀 네임을 사용하도록 권장한다.

> 이 글을 쓰는 현재 이 풀 네임이 `job`으로 선언하는 빌드 파이프라인에서는 제대로 인식을 하는데 비해 `deployment`로 선언하는 릴리즈 파이프라인에서는 에러가 생긴다. 따라서 풀 네임 대신 `[작업 이름]`으로만 선언을 했는데, 이는 임시 방편일 뿐 완벽한 해결책은 아니다. 곧 해결되기를 기대한다.

이렇게 해서 릴리즈 파이프라인 구성이 다 끝났다. 실제로 파이프라인을 실행시켜 보면 아래와 같이 보일 것이다. 아래 그림은 DEV 까지만 구성해 놓은 모습이어서 녹색 체크 마크가 두 개만 보인다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-05.png)

이 화면을 클릭해서 들어가 보면 좀 더 자세한 빌드 내용을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/building-azure-devops-extension-on-azure-devops-6-06.png)

## 파이프라인 리팩토링

여기까지 하면 모든 멀티 스테이지 파이프라인을 완성했다. 그런데, 가만히 보면 빌드, PR, 릴리즈 모두 공통의 작업들이 있다. 빌드 파이프라인 상에서 보이는 `npm` 패키지 인스톨 작업과 타입스크립트 컴파일 작업이 바로 그것들인데, 그렇다면 이 공통의 작업들을 매번 파이프라인을 생성할 때 마다 반복해서 선언해 줘야 할까?

물론, 그렇지 않다. [에이전트 및 작업 템플릿](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/process/templates?view=azure-devops) 페이지를 보면 공통 작업 부분을 별도의 템플릿으로 빼 내서 선언한 후 본 파이프라인에 참조를 시키는 방식을 선택하면 된다고 한다. 아래는 이렇게 리팩토링한 템플릿이다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425#file-npm-build-steps-yaml

위 템플릿은 `npm-build-steps.yaml`이라는 이름으로 작성한 것이고, 공통의 `npm` 패키지 리스토어 작업과 타입스크립트 컴파일 작업을 포함시켰다. 이 템플릿에서 눈여겨 보아야 할 부분은 바로 `parameter` 어트리뷰트인데, 이 템플릿을 호출하는 부모 파이프라인에서 파라미터 값을 건네주면 이 템플릿은 그 값을 받아서 `${{ parameters.[어트리뷰트] }}`와 같은 형태로 파싱해서 사용한다. 여기서는 `${{ parameters.extensionName }}`이 쓰인 것을 볼 수 있다.

이렇게 템플릿을 만들어 놓으면 원래 파이프라인의 구성은 아래와 같이 바뀌게 된다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425#file-netlify-build-templated-yaml

즉, `steps` 아래에 원래 있어야 할 `task` 객체들이 다 사라지고 대신 `template` 객체를 통해 템플릿을 불러오는 식이다. 그리고, 이 객체에는 `parameters` 어트리뷰트가 있어서 이를 통해 값을 템플릿으로 보내주게 된다.

이번에는 릴리즈 파이프라인에서 빌드 스테이지 구성을 살펴 보도록 하자. 빌드 스테이지에 추가적인 작업이 더 있는데 그들과는 아래와 같이 구성하면 된다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425#file-netlify-release-templated-yaml

즉, 템플릿으로 리팩토링한 부분을 불러오고 나머지 템플릿과 상관 없는 작업은 템플릿에 이어서 그대로 사용하면 된다. 굉장히 편리한 기능이라고 할 수 있다.

하지만, 이 글을 쓰는 현재, 이 템플릿 기능은 현재 빌드 스테이지에만 적용이 된다. 아직 릴리즈 스테이지는 적용이 안 됐기 때문에 해당 릴리즈 파일에 공통으로 들어있는 부분은 아쉽게도 리팩토링을 할 수가 없다.

* * *

지금까지 YAML 파일을 이용해서 파이프라인을 구성하는 방법에 대해 살펴보았다. 앞서 언급했다시피, 이렇게 코드 형태로 파이프라인을 구성하게 되면, 관리 부담이 줄어들게 되어 여러모로 데브옵스 관점에서 편리해진다. 아직 멀티 스테이지 파이프라인 기능이 프리뷰 단계여서 완벽하지는 않지만, 그럼에도 불구하고 이 YAML 기능을 통해 CI/CD 전체적인 과정을 한 번에 구성하는 접근은 꽤 일관성을 줄 수 있다고 확신한다.

## 참고 자료

- [멀티 스테이지 YAML 파이프라인 지원(프리뷰)](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/)
- [YAML을 이용한 파이프라인 구성](https://docs.microsoft.com/en-us/azure/devops/pipelines/customize-pipeline?view=azure-devops)
- [에이전트 및 작업 템플릿](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/templates?view=azure-devops)
