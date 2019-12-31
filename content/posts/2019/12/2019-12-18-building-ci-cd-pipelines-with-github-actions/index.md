---
title: "깃헙 액션으로 경계가 명확한 CI/CD 파이프라인 구현하기"
date: "2019-12-18"
slug: building-ci-cd-pipelines-with-github-actions
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure Blob Storage
- Azure CLI
- CI
- CD
- GitHub Actions
- Gridsome
- Static Website
- Vue.js
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/12/building-ci-cd-with-github-actions-00.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/)에서는 [깃헙 액션](https://github.com/features/actions)의 기본적인 사항들을 이용해서 [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow)를 만들어 봤다. 이 포스트에서는 이를 좀 더 응용해서 빌드와 배포를 분리시켜보자.

> 이 포스트에서 사용한 샘플 코드는 이 [깃헙 리포지토리](https://github.com/devkimchi/PWA-GitHub-Actions-Sample)에서 다운로드 받을 수 있다.

## 빌드와 배포 분리하기

[지난 포스트](https://blog.aliencube.org/ko/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/)에서 언급한 바와 같이 가장 기본적인 네 가지 개념 – [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow), [이벤트](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#event), [러너](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner), [액션](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action)만 알면 깃헙 액션을 사용할 수 있다. 그런데, 빌드와 배포를 분리하기 위해서는 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)이라는 추가적인 개념을 알아두면 좋다. [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)은 [러너](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner)와 [액션](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action)의 논리적인 묶음인데 [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow) 안에서 여러 개의 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)을 정의하고 이를 동시에 실행시키거나 연속적으로 실행시키거나 하는 등의 설정을 할 수 있다.

아래 워크플로우는 [지난 포스트](https://blog.aliencube.org/ko/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/)에서 작성한 것이다. `jobs` 속성 아래 `build_and_publish` 라는 이름으로 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)을 정의한 것이 보인다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=github-actions-workflow.yaml

### 빌드 잡 재정의

맨 마지막 액션이 `Publish app`인데, 사실 이 부분은 배포를 위한 직전 단계로서 아티팩트를 업로드하는 것으로 바꾸는 것이 좀 더 정확하다. 따라서, 이 부분을 아래와 같이 바꿔 보도록 하자. 여기서 사용한 액션은 [`upload-artifact`](https://github.com/actions/upload-artifact)이다. 아티팩트 이름을 `app`으로 지정했다.

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=action-upload-artifact.yaml

이렇게 수정한 후 워크플로우 파일을 깃헙으로 푸시하면 빌드가 돌아가고 마지막 단계에서 [애저 블롭 저장소](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=aliencubeorg-blog-juyoo)로 배포하는 대신, 아티팩트를 파이프라인상에 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/building-ci-cd-with-github-actions-01.png)

이렇게 해서 기존의 빌드에 해당하는 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)을 새로 정의했다. 이제 여기서 업로드한 아티팩트를 이용해서 배포를 하는 잡을 만들어 보자.

### 배포 잡 정의

애플리케이션 배포 시나리오는 상당히 다양하다. 아주 간략한 시나리오를 예상한다면 크게 다음과 같은 두 가지 시나리오가 가능할 것이다. 첫번째 시나리오는 빌드/테스트가 끝난 후 연속적으로 개발 환경, 테스트 환경, 라이브 환경으로 배포하는 방식이고, 두번째 시나리오는 빌드/테스트가 끝난 후 동시에 개발 환경, 테스트 환경, 라이브 환경으로 배포하는 방식이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/building-ci-cd-with-github-actions-02.png)

첫번째 시나리오에서는 개발 환경 배포 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)은 직전 단계인 빌드/테스트 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)에 의존성을 가지고, 테스트 환경 배포 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)은 개발 환경 배포 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)에, 라이브 환경 배포 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)은 테스트 환경 배포 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)에 의존성을 갖는다. 다른 말로 하면 직전 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)이 실패할 경우에는 이어지는 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)은 더이상 실행되지 않는다. 따라서 [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow)를 정의할 때 의존성 선언을 아래와 같이 정의하면 된다.

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=workflow-jobs-scenario-1.yaml

반면에 두번째 시나리오는 개별 배포 환경은 오로지 빌드/테스트 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)에만 의존성을 갖는지라 개별 배포 환경은 서로 의존성을 갖지 않는다. 따라서 [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow)를 정의할 때 의존성 선언을 아래와 같이 정의하면 된다.

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=workflow-jobs-scenario-2.yaml

이 포스트에서는 두 개의 정적 웹사이트로 배포한다. 여기서는 추가로 [`download-artifact`](https://github.com/actions/download-artifact) 액션을 사용했다.

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=action-download-artifact.yaml

이 액션을 바탕으로 아래와 같이 `deploy_to_dev`와 `deploy_to_prod`를 정의한다.

https://gist.github.com/justinyoo/b51f3a69f62bdcc7ba4e3ef5c37c204c?file=workflow-updated.yaml

여기서 명심해야 할 부분이 한가지 있는데, 개별 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)은 각자의 [러너](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner) 위에서 돌아가고 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)이 끝나면 [러너](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner) 역시 삭제된다. 이 말인 즉슨, 직전 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)에서 애저 로그인을 했다고 해서 그 로그인 상태가 다음 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)으로 이어지지 않는다. 따라서, 위 워크플로우 정의와 같이 개별 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)마다 애저 로그인 [액션](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action)을 선언해 줘야 한다.

이렇게 새롭게 정의한 워크플로우 파일을 푸시한 후 결과를 보자. 아래는 첫번째 빌드/테스트 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job) 실행 결과이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/building-ci-cd-with-github-actions-03.png)

그리고 아래는 마지막 `deploy_to_prod` [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job) 실행 결과이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/building-ci-cd-with-github-actions-04.png)

여기서는 `deploy_to_dev` [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)과 `deploy_to_prod` [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job) 안에서 오직 아티팩트를 다운로드 받고 배포하는 액션만 있지만, 상황에 따라 개별 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)마다 좀 더 다른 액션을 추가할 수도 있다. 예를 들어 통합 테스트라든가 종단간 테스트라든가 하는 것들이 될 수도 있는데, 이는 좀 더 풍부한 비지니스 요구사항과 시나리오에 따라 얼마든 추가될 수 있는 요소이기도 하다.

* * *

지금까지 깃헙 액션을 통해 단계별로 [잡](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#job)을 분리해서 CI/CD 파이프라인 안에서 명확한 책임의 경계를 만드는 방법에 대해 알아 보았다.
