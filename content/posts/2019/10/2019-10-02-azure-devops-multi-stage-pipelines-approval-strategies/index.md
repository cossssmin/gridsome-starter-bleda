---
title: "애저 데브옵스 다단계 파이프라인 승인 전략"
date: "2019-10-02"
slug: azure-devops-multi-stage-pipelines-approval-strategies
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-devops
- azure-pipelines
- approval
- environment
- yaml
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/09/approval-correct-diverse-1282270.jpg
---

[애저 릴리즈 파이프라인](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/release/?view=azure-devops&WT.mc_id=aliencubeorg-blog-juyoo)을 사용하는 방법은 두 가지가 있다. 하나는 UI를 통해 파이프라인을 직접 구성하는 방법이 있고, 다른 하나는 YAML 파이프라인에 통합시켜 사용하는 방법이다. 여전히 전자의 방법이 후자의 방법보다는 훨씬 더 강력하고 많은 기능을 포함한다. 후자의 경우는 아직 [퍼블릭 프리뷰 기간](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/?WT.mc_id=aliencubeorg-blog-juyoo)이어서 제한된 기능만을 제공한다. 그런 제한된 기능 중에 최근 한가지 가능해진 것이 있는데, 바로 스테이지별 승인 기능이다. [지난 포스트](https://blog.aliencube.org/ko/2019/09/04/azure-devops-pipelines-refactoring-technics/)에서는 템플릿을 이용해 파이프라인 리팩토링을 하는 방법에 대해 알아봤다면, 이번 포스트에서는 YAML 파이프라인을 통해 어떻게 개별 스테이지마다 승인기능을 추가할 수 있는지 알아보기로 한다.

> 이 포스트에 사용한 파이프라인 샘플은 이곳 [깃헙 리포지토리](https://github.com/devkimchi/Azure-Pipelines-Template-Sample)에서 찾아볼 수 있다.

## 사전 준비물

이 포스트를 읽으면서 실제로 따라해 보려면 아래와 같은 준비물이 필요하다.

- [Microsoft 계정 (무료)](https://account.microsoft.com/account?lang=ko-kr&WT.mc_id=aliencubeorg-blog-juyoo) 혹은 [Office 365 계정 (유료)](https://www.office.com/?omkt=ko-KR&WT.mc_id=aliencubeorg-blog-juyoo)
- [애저 데브옵스 계정 (무료)](https://azure.microsoft.com/ko-kr/services/devops/?WT.mc_id=aliencubeorg-blog-juyoo)
- [비주얼 스튜디오 코드](https://code.visualstudio.com/?WT.mc_id=aliencubeorg-blog-juyoo)

## YAML 릴리즈 파이프라인 체크인

UI 방식의 릴리즈 파이프라인 구성은 파이프라인 안에서 스테이지 별로 다양한 설정을 할 수가 있다. [사전/사후 승인 포인트](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/release/approvals/approvals?view=azure-devops&WT.mc_id=aliencubeorg-blog-juyoo)라든가, [사전/사후 게이트 체크인](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/release/approvals/gates?view=azure-devops&WT.mc_id=aliencubeorg-blog-juyoo) 기능이라든가 하는 것들인데, YAML 파이프라인에서는 이 무엇도 자체적으로는 불가능하다. 다만 YAML 릴리즈 스테이지에서 사용하는 [`deployment job`](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/process/deployment-jobs?view=azure-devops&WT.mc_id=aliencubeorg-blog-juyoo)은 [`environment`](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/process/environments?view=azure-devops&WT.mc_id=aliencubeorg-blog-juyoo)라는 속성이 있어서 이를 이용해서 [수동 승인 기능](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/process/approvals?view=azure-devops&WT.mc_id=aliencubeorg-blog-juyoo#approvals)을 활성화 시킬 수 있다. 우선 아래와 같은 파이프라인 구성을 살펴보자. 위 리포지토리에 보면 첫번째와 두번째 스테이지에는 `deployment job`에서 `environment` 속성값으로 `release`라는 이름을 주었다.

https://gist.github.com/justinyoo/653068f01485a332324614daec4b011f?file=stages.yaml

다시 말하자면, 이 서로 다른 두 스테이지는 `release`라는 `enviornment` 속성을 공유하는 셈이다. 수동 승인 기능은 이 `environment` 단위에서 설정이 가능한데, 방법은 아래와 같다. 우선 `Environment` 탭을 클릭해서 이동한다.

![Highlighting the Environments tab](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-01.png)

이후 내가 설정하고자 하는 environment 항목을 선택한다. 여기서는 `release`를 선택한다.

![Choosing an environment](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-02.png)

`release` environment에 들어갔으면 우측 상단의 점 세개 버튼을 클릭해서 `Checks` 옵션을 선택한다.

![Highlighting the Checks option](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-03.png)

현재는 아무런 수동 승인 절차가 없을테니 아래와 같은 화면이 보일 것이다. 가운데 `Create` 버튼을 클릭한다.

![Showing empty screen with the Create button](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-04.png)

결재자를 개별로 하나씩 모두 선택하거나 결재자의 그룹을 선택할 수 있다. 개별로 하나씩 모두 선택해서 넣을 경우에는 모든 결재자가 승인해야만 하고, 그룹을 선택할 경우에는 그룹의 멤버 중 한사람만 승인하면 된다.

![Finding approvers in a modal](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-05.png)

결재자를 지정하면 아래와 같이 리스트가 보일 것이다.

![Displaying approvers on the Checks screen](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-06.png)

이렇게 결재자를 선택한 후 다시 파이프라인을 실행시켜 보자. 아래와 같이 `Release without Template` 스테이지에 승인 대기중인 표시가 나타난다. 중간의 `Review` 버튼을 클릭해서 들어간다.

![Highlighting the Review area and Stage waiting](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-07.png)

그러면 아래와 같은 화면이 나타나면서 승인을 할 것인지 반려를 할 것인지 옵션이 나타난다. 여기서 `Approve` 버튼을 클릭해서 승인을 해 보도록 하자.

![Choosing the Approve option](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-08.png)

그러면 해당 스테이지 릴리즈가 수행될 것이고, 다음 스테이지인 `Release with Steps Template`에서 다시 한 번 승인 대기중인 모습이 보일 것이다.

![Highlighting another Review area and Stage waiting](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-09.png)

다시 한 번 승인을 하고 기다려 보자. 그런데, 이번에는 다음 스테이지에서는 별다른 승인 절차가 없이도 그냥 곧바로 릴리즈가 진행된다.

![Bypassing the rest stages](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-10.png)

다음 스테이지 부터는 다른 `environment` 이름을 사용했기 때문에 `release`라는 이름에 설정한 승인 절차가 적용되지 않은 것이다.

* * *

여기서 굉장히 중요한 포인트를 하나 알아낼 수 있다. 각각의 스테이지에 `environment` 값을 어떻게 지정하는가에 따라, 하나의 environment에서 모두를 관리할 수도 있고, 여러 개의 environment에서 나눠서 관리할 수도 있다.

아래 그림을 한 번 보면 `release`라는 하나의 environment를 모든 스테이지가 공유하고 있다. 그리고 이 environment는 결재자를 QA로 지정해 놓은 상태이다. 따라서 매 스테이지마다 QA가 승인을 해야지만 배포를 할 수 있고, 다음 스테이지에서 동일한 QA가 승인을 해야 한다. 만약 DEV 스테이지는 별도의 결재자 없이 곧바로 배포를 하고 싶다면 이 구조에서는 불가능하다. 만약 PROD 스테이지에서 다른 결재자를 지정하고 싶다면 이 또한 불가능하다.

![Showing one environment dictating all stages](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-11.png)

반면에 아래 그림을 보면 스테이지별로 다른 environment를 지정해 두었고, 각 environment 마다 서로 다른 결재자를 지정한다거나, 아니면 결재자를 지정하지 않는다거나 하는 식으로 유연함을 부여할 수 있다.

![Showing multiple environments looking after their stage only](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-devops-yaml-pipelines-approval-strategy-12.png)

이렇게 적어두고 보니 마치 스테이지마다 각각 environment를 부여하는 것이 좀 더 합리적인 선택인 것 처럼 보이는데, 너무 많은 environment가 생긴다면 그들에 대한 관리 문제 역시 고려해 봐야 한다. 반면에 한 environment로 모든 것을 해결한다면 좀 더 단단한 통제가 가능하다.

위의 두 가지 방법을 섞어서 사용하는 방법도 가능하다. 예를 들어 non-production 환경만 담당하는 environment와 production 환경만 담당하는 environment를 별도로 두고 production 환경에서만 승인 절차를 적용시킬 수 있게끔 하는 식으로 응용이 가능할 것이다.

* * *

지금까지 애저 데브옵스 YAML 파이프라인에서 수동 승인 절차를 추가하는 방법에 대해 알아보았다. 만약 이 포스트를 보면서 아직 따라해 보지 않았다면, 어렵지 않으니 한 번 해 보는 것은 어떨까?
