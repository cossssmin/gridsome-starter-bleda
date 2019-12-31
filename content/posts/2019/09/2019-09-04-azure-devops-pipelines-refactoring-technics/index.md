---
title: "애저 데브옵스 파이프라인 리팩토링 테크닉"
date: "2019-09-04"
slug: azure-devops-pipelines-refactoring-technics
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure DevOps
- Azure Pipelines
- Refactoring
- Templates
- Stages
- Jobs
- Steps
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-00.jpg
---

애저 데브옵스에서 CI/CD 파이프라인을 구성하다보면 보통 반복적인 작업들이 많다. 이게 타스크 수준일 수도 있고, 작업 수준일 수도 있고, 스테이지 수준일 수도 있는데, 코딩을 할 때는 반복적인 부분을 리팩토링 한다지만, 파이프라인에서 반복적인 부분을 리팩토링할 수는 없을까? 물론 있다. 파이프라인을 리팩토링할 수 있는 포인트가 최소 여섯 군데 정도 있는데, 이 포스트에서는 애저 파이프라인의 YAML 템플릿을 이용해서 반복적으로 나타나는 부분을 리팩토링하는 방법에 대해 알아보자.

> 이 포스트에 쓰인 예제 파이프라인 코드는 [이 리포지토리](https://github.com/devkimchi/Azure-Pipelines-Template-Sample)에서 확인할 수 있다.

## 빌드 파이프라인

우선 일반적인 빌드 파이프라인을 한 번 만들어 보자. 아래는 그냥 빌드 `Stage`를 작성한 것이다. `Stages/Stage` 아래 `Jobs/Job` 아래 `Steps/Task`가 들어가 있다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-without-template.yaml

이 파이프라인을 실행시키면 아래와 같은 결과가 나온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-01.png)

이제 이 빌드 파이프라인을 리팩토링할 차례이다. 리팩토링은 크게 세 곳에서 가능하다. 하나는 `Steps` 수준, 다른 하나는 `Jobs` 수준, 그리고 마지막 하나는 `Stages` 수준이다.

## 빌드 파이프라인을 `Steps` 수준에서 리팩토링하기

예를 들어 node.js 기반의 애플리케이션을 하나 만든다고 가정해 보자. 이 경우 보통 순서가

1. node.js 설치하기
2. npm 패키지 복원하기
3. 애플리케이션 빌드하기
4. 애플리케이션 테스트하기
5. 아티팩트 생성하기

정도가 될 것이다. 이 때 마지막 5번 항목을 제외하고는 거의 대부분의 경우 같은 순서로, 그리고 저 네 작업을 한 세트로 해서 진행을 하게 된다. 그렇다면 이 1-4번 작업 흐름을 그냥 하나로 묶어서 템플릿 형태로 빼 놓을 수도 있지 않을까? 이럴 때 바로 `Steps` 수준의 리팩토링을 진행하게 된다. 만약 다른 작업에서는 이후 추가 작업을 더 필요로 한다고 하면 템플릿을 돌리고 난 후 추가 타스크를 정의하면 되므로 별 문제는 없다.

이제 위에 정의한 빌드 파이프라인의 `Steps` 부분을 별도의 템플릿으로 분리한다. 그렇다면 원래 파이프라인과 템플릿은 아래와 같이 바뀔 것이다. 원래 파이프라인(`pipeline.yaml`)의 `steps` 항목 아래에 `template` 라는 항목이 생기고, `parameters`를 통해 템플릿으로 값을 전달하는 것이 보일 것이다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-with-steps-template.yaml

그리고 `Steps` 수준 리팩토링 결과 템플릿인 `template-steps-build.yaml`을 보면 아래와 같이 `parameters`와 `steps`를 정의했다. `parameters` 항목을 통해 부모 파이프라인과 템플릿 사이 값을 교환할 수 있게 해 준다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-stages-build.yaml

이렇게 리팩토링을 한 후 파이프라인을 돌려보면 아래와 같은 결과 화면이 나온다. 부모 파이프라인에서 템플릿으로 넘겨준 파라미터 값이 잘 표현되는 것이 보인다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-02.png)

## 빌드 파이프라인을 `Jobs` 수준에서 리팩토링하기

이번에는 `Jobs` 수준에서 리팩토링을 한 번 해보자. 앞서 연습해 봤던 `Steps` 수준 리팩토링은 공통의 Task들을 묶어주는 정도였다면, `Jobs` 수준의 리팩토링은 그보다 큰 덩어리를 다룬다. 이 덩어리에는 빌드 에이전트의 종류까지 결정할 수 있고, 템플릿 안의 모든 Task를 동일하게 가져갈 수 있다.

> 물론 조건 표현식과 같은 고급 기능을 사용하면 좀 더 다양한 시나리오에서 다양한 Task들을 활용할 수 있다.

아래와 같이 부모 파이프라인을 수정해 보자.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-with-jobs-template.yaml

그리고 난 후 아래와 같이 `template-jobs-build.yaml` 파일을 작성한다. 파라미터로 `vmImage`와 `message`를 넘겨 템플릿에서 어떻게 사용하는지 살펴보자.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-jobs-build.yaml

`Jobs` 수준에서 사용하는 빌드 에이전트의 종류까지도 변수화시켜 사용할 수 있는 것을 알 수 있다. 부모 템플릿에서 에이전트를 `Windows Server 2016` 버전으로 설정했으므로 실제 이를 파이프라인으로 돌려보면 아래와 같은 결과가 나타난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-03.png)

## 빌드 파이프라인을 `Stages` 수준에서 리팩토링하기

이번에는 `Stages` 수준에서 파이프라인 리팩토링을 시도해 보자. 하나의 스테이지에는 여러개의 `Job`을 동시에 돌리거나 순차적으로 돌릴 수 있다. `Job` 수준에서 돌아가는 공통의 작업들이 있다면 이를 `Job` 수준에서 묶어 리팩토링 할 수 있겠지만, 아예 공통의 `Job`들 까지 묶어서 하나의 `Stage`를 만들고 이를 별도의 템플릿으로 빼낼 수 있는데, 이것이 이 연습의 핵심이다. 아래 부모 파이프라인 코드를 보자. `stages` 아래에 곧바로 템플릿을 지정하고 변수를 보낸다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-with-stages-template.yaml

위에서 언급한 `template-stage-build.yaml` 파일은 아래와 같이 작성할 수 있다. 부모에서 받아온 파라미터를 통해 빌드 에이전트에 쓰일 OS와 다른 값들을 설정할 수 있는게 보이는가?

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-stages-build.yaml

이렇게 해서 파이프라인을 실행해 본 결과는 대략 아래와 같다. 변수를 통해 전달한 값에 따라 빌드 에이전트가 Ubuntu 16.04 버전으로 설정이 되었고 글로벌 변수 값을 별도로 재정의하지 않았으므로 아래 그림과 같이 `G'day, mate`라는 글로벌 변수 값을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-04.png)

## 빌드 파이프라인을 다단계 템플릿으로 리팩토링하기

이렇게 `Steps` 수준, `Jobs` 수준, `Stages` 수준에서 모두 리팩토링을 해 봤다. 그렇다면 리팩토링의 결과물인 템플릿을 다단계로 걸쳐서 사용할 수는 없을까? 물론 당연히 된다. 아래와 같이 부모 파이프라인을 수정해 보자. 이번에는 맥OS를 에이전트로 선택해 봤다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-build-with-nested-stages-template.yaml

`Stage` 수준에서 다단계 템플릿을 만들어서 붙여봤다. 이 템플릿 안에서 또다시 `Jobs` 수준의 다단계 템플릿을 호출한다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-stages-nested-build.yaml

`Jobs` 수준의 다단계 템플릿은 대략 아래와 같다. 그리고, 이 안에서 또다시 앞서 만들어 둔 `Steps` 수준의 템플릿을 호출한다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-jobs-nested-build.yaml

이렇게 다단계로 템플릿을 만들어 붙여놓은 후 파이프라인을 돌려보면 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-05.png)

아주 문제 없이 다단계 템플릿이 잘 돌아가는게 보인다.

* * *

지금까지 빌드 파이프라인을 리팩토링해 봤다. 이제 릴리즈 파이프라인으로 들어가 보자.

## 릴리즈 파이프라인

릴리즈 파이프라인은 빌드 파이프라인과 크게 다르지 않다. 다만 `job` 대신 `deployment job`을 사용한다는 차이가 있다. 이 둘의 차이에 대해 얘기하는 것은 이 포스트의 범위를 벗어나니 여기까지만 하기로 하고, 실제 릴리즈 파이프라인의 구성을 보자. 템플릿 리팩토링 없는 전형적인 릴리즈 스테이지는 아래와 같다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-without-template.yaml

`Jobs` 수준에 `deployment`를 사용해서 작업 단위를 정의한 것을 볼 수 있다. 이를 실행시킨 결과는 대략 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-06.png)

이제 이 릴리즈 파이프라인을 동일하게 세 곳, `Steps`, `Jobs`, `Stages` 수준에서 리팩토링을 할 수 있다. 각각의 리팩토링 방식은 크게 다르지 않으므로 아래 리팩토링 결과만을 적어놓도록 한다.

## 릴리즈 파이프라인을 `Steps` 수준에서 리팩토링하기

우선 `Steps` 수준에서 릴리즈 템플릿을 만들어 보도록 하자. 부모 템플릿은 아래와 같다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-with-steps-template.yaml

그리고 템플릿으로 빼낸 `Steps`는 아래와 같다. 앞서 빌드 파이프라인에서 사용한 템플릿과 구조가 다르지 않다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-steps-release.yaml

그리고 그 결과를 보면 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-07.png)

## 릴리즈 파이프라인을 `Jobs` 수준에서 리팩토링하기

이번에는 릴리즈 파이프라인을 `Jobs` 수준에서 리팩토링해 보자.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-with-jobs-template.yaml

그리고 리팩토링한 템플릿은 아래와 같다. 여기서 눈여겨 봐야 할 부분은 바로 `environment` 이름도 파라미터로 처리가 가능하다는 데 있다. 즉 거의 대부분의 설정을 부모 파이프라인에서 파라미터로 내려주면 템플릿에서 받아 처리가 가능하다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-jobs-release.yaml

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-08.png)

## 릴리즈 파이프라인을 `Stages` 수준에서 리팩토링하기

더 이상의 자세한 설명은 생략한다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-with-stages-template.yaml

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=tmplate-stages-release.yaml

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-09.png)

## 릴리즈 파이프라인을 다단계 템플릿으로 리팩토링하기

릴리즈 파이프라인 역시 다단계 템플릿으로 구성이 가능하다.

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=pipeline-release-with-nested-stages-template.yaml

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-stages-nested-release.yaml

https://gist.github.com/justinyoo/41e3c56debe1eaa0bb1d0ac062bb38b9?file=template-jobs-nested-release.yaml

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/08/azure-devops-pipelines-refactoring-technics-10.png)

* * *

이렇게 빌드 및 릴리즈 파이프라인을 모든 `Stages`, `Jobs`, `Steps` 수준에서 템플릿을 이용해 리팩토링을 해 보았다. 분명히 파이프라인 작업을 하다 보면 분명히 리팩토링이 필요한 순간이 생긴다. 그리고 어느 수준에서 템플릿을 만들어 써야 할 지는 전적으로 상황마다 다르다고 할 수 있다.

다만 한 가지 고려해야 할 것은 템플릿은 가급적이면 단순한 작업을 할 수 있게끔 만드는 것이 좋다. 템플릿 표현식을 보면 조건문도 있고 반복문도 있고 굉장히 고급 기능을 사용할 수 있지만, 우선은 단순하게 시작해서 템플릿을 다듬어 나가는 것이 좋을 것이다. 아무쪼록 애저 데브옵스 파이프라인의 다중 스테이지 파이프라인 기법을 통해 다양한 템플릿 기법을 도입해 보기를 기원한다.
