---
title: "애저 데브옵스 파이프라인에서 애저 스토리지 에뮬레이터 사용하기"
date: "2019-10-16"
slug: azure-storage-emulator-on-azure-pipelines
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure DevOps
- Azure Pipelines
- Azure Storage Emulator
- Azurite
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-storage-emulator-on-azure-pipelines-00.png
---

애저 관련 애플리케이션을 개발하다 보면 [애저 스토리지](https://azure.microsoft.com/ko-kr/services/storage/?WT.mc_id=aliencubeorg-blog-juyoo)와 연동할 경우가 종종 있다. 특히 [애저 펑션](https://azure.microsoft.com/ko-kr/services/functions/?WT.mc_id=aliencubeorg-blog-juyoo)의 경우에는 거의 애저 스토리지가 필수적으로 연결이 되어야 하는 편인데, 로컬 개발 환경에서는 애저 스토리지 에뮬레이터가 있어서 그것을 활용하면 된다. 애플리케이션의 단위 테스트 상황에서는 사실 이 에뮬레이터가 있어도 그만 없어도 그만인데 통합 테스트 혹은 종단간 테스트의 경우에는 실제 애저 스토리지 인스턴스든 에뮬레이터든 연결이 되어야 한다. 로컬 개발 환경에서는 직접 에뮬레이터를 실행시킨 후에 테스트를 돌리면 되는데, CI/CD 파이프라인에서는 이 에뮬레이터를 어떻게 해야 할까?

이 포스트에서는 [애저 파이프라인](https://azure.microsoft.com/ko-kr/services/devops/pipelines/?WT.mc_id=aliencubeorg-blog-juyoo)상에서 스토리지 에뮬레이터를 실행시키는 방법에 대해 알아본다.

## 애저 스토리지 에뮬레이터

[애저 스토리지 에뮬레이터](https://docs.microsoft.com/ko-kr/azure/storage/common/storage-use-emulator?WT.mc_id=aliencubeorg-blog-juyoo)는 [이 링크](https://go.microsoft.com/fwlink/?linkid=717179&clcid=0x409&WT.mc_id=aliencubeorg-blog-juyoo)를 통해 직접 다운로드 받을 수 있다. 또한 에뮬레이터는 애저 SDK의 한 부분이기도 해서 애저 데브옵스에서 자체적으로 제공하는 [빌드 에이전트](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/agents/hosted?WT.mc_id=aliencubeorg-blog-juyoo)에 이미 설치가 되어 있기도 하다. 따라서, 아래와 같이 순서에 맞춰 커맨드 프롬프트 타스크를 통해 실행시키도록 한다.

에이전트는 매번 빌드가 실행될 때 마다 새롭게 만들어지기 때문에 먼저 에뮬레이터가 사용할 수 있는 로컬 데이터베이스를 초기화시켜야 한다.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=storage-emulator-init.cmd

그리고 난 후 에뮬레이터를 실행시키면 된다.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=storage-emulator-start.cmd

이를 애저 파이프라인 커맨드라인 타스크에 적용하면 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-storage-emulator-on-azure-pipelines-01.png)

만약 YAML 파이프라인을 통해 적용시키고 싶다면 아래와 같이 작성해 보도록 하자.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=storage-emulator.yaml

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/that-is-easy.jpg)

그런데, 이 방법에는 문제라면 문제가 될 것이 하나 있다. 바로 이 에뮬레이터는 윈도우즈 전용이라는 것이다. 이 방식을 사용하려면 반드시 빌드 에이전트를 윈도우용 – `windows-latest`, `windows-2019`, `vs2017-win2016`, `vs2015-win2012r2` – 으로 선택해야 한다. 요즘은 애플리케이션 자체가 크로스 플랫폼을 지원하는 경우가 많아 크게 문제가 되지 않을 수도 있겠지만, 특정 플랫폼만 지원하는 애플리케이션이라면 이 때에는 문제가 될 수 있다. 이럴 땐 어떻게 해야 할까?

## Azurite

애저 팀에서는 [크로스 플랫폼 오픈소스 에뮬레이터](https://docs.microsoft.com/ko-kr/azure/storage/common/storage-use-azurite?WT.mc_id=aliencubeorg-blog-juyoo)로 [Azurite](https://github.com/azure/azurite) 역시 지원하고 있다. 공식 문서에 따르면 Azurite가 지금은 아니지만 언젠가는 애저 스토리지 에뮬레이터를 대체할 것으로 명기하고 있기 때문에 이 역시도 고려를 해야 할 것이다.

아쉽지만, Azurite는 기본적으로 설치된 에뮬레이터가 아니어서 직접 설치해야 한다. 그나마 npm 패키지 형태로 제공하고 있기 때문에 손쉽게 설치할 수 있다. 아래와 같이 애저 파이프라인상에서 먼저 npm 패키지를 설치한다.

> 이 글을 쓰는 시점에서 Azurite의 최신 버전은 [`3.2.0-preview`](https://www.npmjs.com/package/azurite)이다. 하지만 원활한 작동을 위해서라면 안정 버전인 `2.7.1`을 사용하기를 권장한다.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=azurite-install.sh

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-storage-emulator-on-azure-pipelines-02.png)

Azurite 설치가 끝나면 이를 아래와 같이 실행시킨다. 명심해야 할 부분이 하나 있다면, 아래와 같이 명령어 맨 뒤에 `&`를 붙여서 반드시 Azurite 앱을 백그라운드에서 실행시켜야 한다. 그렇지 않으면 다음 타스크로 넘어가지 않고 멈춰있을 것이다.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=azurite-run.sh

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/09/azure-storage-emulator-on-azure-pipelines-03.png)

이를 YAML 파이프라인에 적용시켜 보면 아래와 같다.

https://gist.github.com/justinyoo/ed7f480270239744e2f3e3efbe172242?file=azurite.yaml

지금까지 애저 데브옵스에서 스토리지 에뮬레이터를 실행시키는 방법에 대해 알아보았다.

## 애저 데브옵스 사용해 보기

애저 스토리지 에뮬레이터 혹은 Azurite를 사용해보고 파이프라인 상에서 사용해보고 싶다면 무료 서비스인 [애저 데브옵스](https://azure.microsoft.com/ko-kr/services/devops/?WT.mc_id=devkimchicom-blog-juyoo)에 가입해 보도록 하자!
