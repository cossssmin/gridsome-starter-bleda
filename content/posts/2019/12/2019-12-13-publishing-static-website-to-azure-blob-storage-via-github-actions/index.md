---
title: "깃헙 액션을 사용해서 애저 블롭 저장소에 정적 웹사이트 배포하기"
date: "2019-12-13"
slug: publishing-static-website-to-azure-blob-storage-via-github-actions
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- azure-blob-storage
- azure-cli
- ci
- cd
- github-actions
- gridsome
- static-website
- vue-js
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/12/publishing-static-website-to-azure-blob-storage-via-github-actions-00.png
---

지난 11월 [깃헙 액션](https://github.com/features/actions)이 [공식적으로 사용 가능해졌다는 발표](https://github.blog/changelog/2019-11-11-github-actions-is-generally-available/)를 한 이후 이미 엄청난 양의 액션들이 [마켓플레이스](https://github.com/marketplace?type=actions)에 올라와 있다. 사용법도 굉장히 간단한 편이어서 몇가지 요령만 알아두면 금방 사용할 수 있다. 이 포스트에서는 간단한 정적 웹사이트를 개발한 후 이를 [애저 블롭 저장소](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=aliencubeorg-blog-juyoo)에 깃헙 액션을 통해 배포하는 과정에 대해 알아보기로 한다.

> 이 포스트에서 사용한 샘플 코드는 이 [깃헙 리포지토리](https://github.com/devkimchi/PWA-GitHub-Actions-Sample)에서 다운로드 받을 수 있다.

## 애저 블롭 저장소 생성 및 준비

정적 웹사이트를 호스팅할 [애저 블롭 저장소](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=aliencubeorg-blog-juyoo)를 프로비저닝해 보자. [애저 포탈](https://azure.microsoft.com/ko-kr/features/azure-portal/?WT.mc_id=aliencubeorg-blog-juyoo)에서 생성해도 되고, [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=aliencubeorg-blog-juyoo) 명령어 또는 [애저 파워셸](https://docs.microsoft.com/ko-kr/powershell/azure/new-azureps-module-az?view=azps-3.1.0&WT.mc_id=aliencubeorg-blog-juyoo) 명령어를 통해 생성해도 된다. 여기서는 애저 CLI를 이용해서 생성해 보도록 하자. 아래와 같이 명령어를 실행하면 리소스 그룹과 애저 저장소 계정이 만들어진다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-create.sh

이제 정적 웹사이트 호스팅을 위한 특별 컨테이너를 생성할 차례이다. 정적 웹사이트는 별도의 `$web`이라는 컨테이너에 저장이 되는데, 다른 말로 하면 블롭 저장소 하나에는 정적 웹사이트를 하나만 호스팅 할 수 있다는 말과 같다. 아래 명령어를 통해 정적 웹사이트 호스팅용 컨테이너를 생성한다. 아래 명령어를 실행시키면 자동으로 `$web`이라는 이름의 컨테이너가 만들어진다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-blob-activate.sh

그리고, 이렇게 설정이 끝나고 나면 실제로 접속할 웹사이트 주소를 알아내야 한다. 아래 명령어를 실행시켜 보자.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage.show.sh

이 명령어를 실행시킨 결과는 대략 아래와 같다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-endpoints.json

여기서 `web` 속성에 할당되어 있는 `https://<STORAGE_ACCOUNT_NAME>.<ARBITRARY_VALUE>.web.core.windows.net/` 부분이 우리가 접속할 정적 웹사이트 주소이다.

## 정적 웹사이트 생성

정적 웹사이트를 만드는 데 다양한 도구들이 있다. 어떤 도구들을 써도 상관 없지만, 여기서는 [Vue.js](https://vuejs.org/) 기반의 정적 웹사이트 생성기인 [gridsome](https://gridsome.org/)이라는 도구를 이용해 만들어 보기로 하자. 먼저 `gridsome` CLI를 다운로드 받고 이를 이용해 기본 웹사이트를 생성한다. 아래 명령어를 이용하면 된다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=gridsome-create.sh

이렇게 해서 `Hello World`가 들어 있는 기본 웹사이트를 만들었다. 이 포스트는 웹사이트 개발이 목적이 아니므로 여기까지만 하기로 한다. 만약 `gridsome`에 대해 더 궁금하다면 [해당 웹사이트를 방문](https://gridsome.org/)해 보자. 이렇게 만들어진 웹사이트를 로컬에서 확인해 보려면 아래와 같은 명령어를 콘솔창에서 입력한다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=gridsome-run.sh

이 웹사이트에 만족했다면 아래 명령어를 통해 배포 준비를 한다. 배포를 위한 파일은 `/dist` 디렉토리에 별도로 저장이 된다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=gridsome-build.sh

이 두 명령어는 `npm run` 명령어를 통해서도 실행 가능하다. 이 부분이 굉장히 중요한데, 이 포스트에서 다룰 [깃헙 액션](https://github.com/features/actions)을 통해 이 npm 명령어를 실행시키기 때문이다. 잘 기억해 두도록 한다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=gridsome-npm.sh

## 정적 웹사이트 수동 배포

이제 준비는 다 됐으니 실제로 배포를 해 보도록 하자. 우선 로컬 개발 환경에서 [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=aliencubeorg-blog-juyoo)를 이용해서 직접 배포하는 과정은 아래와 같다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=az-storage-blob-upload.sh

만약 [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=aliencubeorg-blog-juyoo)를 통해 이미 로그인하지 않은 상태라면 추가적으로 `--account-key`, `--connection-string` 또는 `sas-token` 값을 지정해 줘야 한다. 여기서는 이미 [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=aliencubeorg-blog-juyoo)를 통해 로그인 한 상태라고 가정한다.

## 깃헙 액션을 통한 정적 웹사이트 자동 배포

[깃헙 액션에서 알아 놓아야 할 몇 가지 개념](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions)이 있는데, 이 중에서 [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow), [이벤트](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#event), [러너](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner), [액션](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action)의 네 가지 개념이 가장 기본적이기도 하고 중요하다.

- [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow): 코드가 리포지토리에 올라갔을 때 빌드, 테스트 및 배포를 실행하기 위한 자동화된 프로세스를 구성하는 것이다. 이는 아래 설명할 [이벤트](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#event)와 [러너](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner), [액션](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action)을 포함한다.
- [이벤트](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#event): [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow)를 실행시키기 위한 전제 조건이다. 코드를 리포지토리에 푸시한다든가, PR을 생성한다든가 하는 이벤트들이 있다.
- [러너](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#runner): [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow)를 실행시키기 위한 운영제체 환경을 의미한다. 깃헙이 제공하는 러너를 사용할 수도 있고, 직접 만들어서 사용할 수도 있다.
- [액션](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#action): [워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow)안에 정의된 개별 작업을 의미한다. 이를 통해 빌드, 테스트 및 배포 뿐만 아니라 다양한 시나리오의 다양한 작업을 실행시킬 수 있다.

[워크플로우](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/core-concepts-for-github-actions#workflow)의 기본적인 구조는 대략 아래와 같다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=github-actions-workflow-structure.yaml

- `WORKFLOW_NAME`: 워크플로우의 이름을 지정한다. 한 리포지토리에는 여러 워크플로우를 동시에 등록해서 사용할 수 있다.
- `EVENT`: 워크플로우를 실행시키기 위한 이벤트이다. `push`, `pull_request`, `schedule` 등 여러 가지 이벤트들이 있다.
- `RUNNER`: 워크플로우를 실행시키기 위한 운영체제 환경이다. 깃헙 자체 제공 러너는 윈도우, 리눅스(우분투) 및 맥OS가 있고, 이와 별개로 직접 러너를 만들어서 붙일 수도 있다.
- `ACTION_NAME`: 워크플로우 안에 정의된 개별 작업의 이름이다. 주로 이 작업이 어떤 일을 하는지에 대한 간단한 설명이다. 예) `Login to Azure`, `Build App`
- `ACTION`: 워크플로우 안에 정의된 개별 작업이다.

이를 바탕으로 워크플로우를 작성해 보자. 여기서 사용한 액션은 크게 네 가지가 있다.

- [`checkout`](https://github.com/actions/checkout): 워크플로우 안으로 리포지토리를 다운로드 받는다.
- [`run`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idstepsrun): 내장된 쉘 액션으로 여기서는 npm 패키지 다운로드, 빌드, 테스트 등을 담당한다.
- [`azure login`](https://github.com/Azure/login): 애저 CLI로 로그인한다.
- [`azure cli`](https://github.com/Azure/CLI): 애저 CLI를 통해 웹사이트를 배포한다.

이 네 가지 액션을 적절히 조합하면 정적 웹사이트를 애저 블롭 저장소로 손쉽게 배포할 수 있다. 아래와 같이 워크플로우를 작성한다.

https://gist.github.com/justinyoo/babbc243f01051ca36d419d26e31fce6?file=github-actions-workflow.yaml

- `on: push`: 코드 푸시 이벤트에만 이 워크플로우가 작동하도록 설정했다.
- `runs-on`: 리눅스(우분투) 러너를 지정했다. 여기서 `ubuntu-latest`는 이 글을 쓰는 현재 Ubuntu 18.04 LTS 버전을 의미한다.
- `name: Checkout the repo`: 이 워크플로우에서는 가장 먼저 리포지토리에서 코드를 다운로드 받아야 하므로, 이 액션을 가장 먼저 배치했다.
- `name: Login to Azure`: 이 액션을 통해 애저에 로그인한다. 여기서 로그인과 관련한 민감한 정보는 리포지토리 설정 화면에 별도로 저장하고 여기서는 `@{{ secrets.AZURE_CREDENTIALS }}`를 통해 가져온다.
- `name: Install npm packages`: npm 패키지를 복원한다. 여기서 명심해야 할 부분은 `packages.json` 파일이 있는 디렉토리로 먼저 이동한 후 `npm install` 명령을 실행시켜야 한다는 점이다.
- `name: Build app`: 정적 웹사이트를 빌드한다. 여기서 명심해야 할 부분은 `packages.json` 파일이 있는 디렉토리로 먼저 이동한 후 `npm run build` 명령을 실행시켜야 한다는 점이다.
- `name: Test app`: 애플리케이션을 테스트한다. 여기서 명심해야 할 부분은 `packages.json` 파일이 있는 디렉토리로 먼저 이동한 후 `npm run test:unit` 명령을 실행시켜야 한다는 점이다.
- `name: Publish app`: 애플리케이션을 애저 블롭 저장소에 배포한다. 애저 로그인 액션과 마찬가지로 저장소 이름은 `${{ secrets.STORAGE_ACCOUNT_NAME }}`을 통해 가져온다.

이렇게 해서 만들어진 워크플로우 파일을 `main.yml`로 저장해서 `.github/workflows` 디렉토리 안에 저장한다. 깃헙 액션은 이 `.github/workflows` 디렉토리를 체크하기 때문에 항상 이곳에 워크플로우 파일들을 저장해야 한다. 이제 이 코드를 푸시해 보자. 그러면 아래와 같이 워크플로우가 성공적으로 실행된 것이 보일 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/publishing-static-website-to-azure-blob-storage-via-github-actions-01.png)

그리고, 애저 블롭 저장소 URL을 통해 웹사이트를 열어보면 아래와 같이 성공적으로 배포가 된 것을 알 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/publishing-static-website-to-azure-blob-storage-via-github-actions-02.png)

* * *

지금까지 [깃헙 액션](https://github.com/features/actions)을 통해서 정적 웹사이트를 [애저 블롭 저장소](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=aliencubeorg-blog-juyoo)에 배포하는 일련의 과정에 대해 알아 보았다. 이어지는 포스트에서는 이를 이용해 다양한 운영 환경으로 배포해 보기로 하자.
