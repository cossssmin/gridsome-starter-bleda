---
title: "AppVeyor를 이용한 지속적인 통합, 빌드 및 배포"
date: "2015-04-19"
slug: continuous-integration-build-and-delivery-using-appveyor
description: ""
author: Justin Yoo
tags:
- ARM & DevOps on Azure
- AppVeyor
- CB
- CD
- CI
- Continuous Build
- Continuous Delivery
- Continuous Deployment
- Continuous Integration
fullscreen: false
cover: ""
---

요즘과 같은 애자일 개발 환경에서는 Contiunuos Integration (CI), Continuous Build (CB), 그리고 Continuous Delivery (CD)라는 개념이 꽤 중요하다. 이를 위해 여러 솔루션들도 나와 있다. 대표적인 것들로 [TeamCity](https://www.jetbrains.com/teamcity/)와 [Jenkins](https://jenkins-ci.org/), 그리고 [Travis](https://travis-ci.org/)가 있다. 각각 장단점이 있는데 간단하게 나열하자면 TeamCity와 Jenkins는 설치형이어서 이를 위한 서버가 반드시 필요하다. 반면에 Travis는 서비스형이어서 설치가 필요없다. 하지만 오로지 GitHub에 올라간 오픈소스 프로젝트만 사용할 수 있어서 [BitBucket](https://bitbucket.org) 또는 [CodePlex](https://codeplex.com)과 같은 다른 리포지토리 서비스들에서는 이용할 수 없다는 단점이 있다.

지금 소개하고자 하는 [AppVeyor](http://appveyor.com)는 Travis와 같은 서비스형이면서 다양한 리포지토리 서비스에 연결 가능하고, 오픈 소스 프로젝트에는 무료로 서비스를 제공하는 장점이 있다. 단점이라면 오로지 닷넷 프로젝트만 사용할 수 있다는 것. 아무튼 이 포스트에서는 이 AppVeyor 서비스를 이용해 오픈 소스 닷넷 라이브러리를 빌드하고 [NuGet](https://nuget.org)에 패키지를 배포하는 것까지 일련의 과정을 간단하게 다루어 보도록 한다.

## `AppVeyor` 계정 생성

당연하겠지만, `AppVeyor`를 사용하기 위해서는 계정을 생성해야 한다. 오픈 소스 프로젝트는 무료로 사용이 가능하니 부담없이 하나 만들어 보자. 직접 생성하거나 본인의 GitHub 계정, BitBucket 계정 혹은 Visual Studio Online 계정을 이용할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/04/appveyor.01.png)

## 프로젝트 생성

계정 생성후 가장 먼저 할 일은 CI/CD를 위한 프로젝트를 만드는 것이다. 자신의 GitHub 계정으로 로그인했다면 본인의 계정에 들어있는 수많은 리포지토리들을 확인할 수 있다. 그 중 원하는 프로젝트를 하나 골라보도록 하자. 여기서는 [ReCaptcha.NET](https://github.com/aliencube/ReCaptcha.NET)을 이용한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/04/appveyor.02.png)

제목을 클릭해서 들어가보면 아래와 같이 가장 최근 빌드 결과가 나타난다. 물론 최초 생성시에는 보이지 않는다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/04/appveyor.03.png)

## 프로젝트 환경 설정

`Settings` 링크를 클릭해서 들어가보면 여러 가지 설정 사항들을 볼 수 있다.

### `General` 탭

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/04/appveyor.04.png)

`General` 탭에서는 기본적인 리포지토리 세팅을 할 수 있다. 나머지는 디폴트로 상관 없고, 왼쪽의 `Build` 탭과 `Deployment` 탭에 주목하도록 하자. 먼저 `Build` 탭을 클릭하면 아래와 같다.

### `Build` 탭

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/04/appveyor.05.png)

다른 내용은 디폴트로 해도 상관 없는데, 많은 오픈 소스 닷넷 프로젝트의 경우 NuGet 패키지를 이용하게 마련이므로 위의 그림과 같이 `Before build script` 항목에 `nuget restore` 혹은 `nuget restore PATH\TO\SOLUTION.sln` 형태로 빌드 직전 NuGet 패키지 복원 명령을 지정해 준다. 이 상태에서 프로젝트 최초 화면으로 돌아가면 `NEW BUILD`라는 버튼이 보이는데, 이걸 클릭해서 수동으로 빌드한다거나 아니면 브랜치에 푸시한다거나 하면 자동으로 빌드가 돌아가게 된다.

사실 여기까지 하면 기본적인 AppVeyor의 사용법은 다 끝난 거나 마찬가지이다. 참 쉽죠? 만약 NuGet 패키지를 [https://nuget.org](https://nuget.org)에 올리려고 한다면 아래의 한 단계를 더 추가하면 된다.

### `Deployment` 탭

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/04/appveyor.06.png)

우선 `Deployment provider` 항목을 `NuGet`으로 선택하고 `NuGet server URL`과 `API key` 항목을 설정한다. `NuGet server URL`을 빈 칸으로 남겨둘 경우에는 기본적으로 `http://nuget.org`가 선택된다. NuGet 패키지 업로드를 할 경우에는 보통 특정 브랜치에 커밋이 있을 경우 업로드를 하는 편인데 이 때 특정 브랜치를 지정한다. 이것은 [Git Flow](http://nvie.com/posts/a-successful-git-branching-model/)와 관련이 있는 설정이기도 하다.

이 상태에서 `release` 브랜치로 푸시를 할 경우 해당 내용은 자동으로 빌드후 NuGet 패키지 업로드가 이루어진다.

이렇게 해서 AppVeyor 서비스에 대한 간략한 리뷰를 진행해 보았다. 좀 더 자세하게 설정을 하고 싶다면 이 [레퍼런스](http://www.appveyor.com/docs)를 참고해 보도록 하자. 개인적으로 AppVeyor를 통해 CI/CD를 진행해 본 결과 앞서 언급했던 Git Flow 모델에 대한 내용을 좀 더 정확하게 이해할 수 있었다. 예전에는 그냥 하라니까 따라하는 느낌이었다면, 이 서비스를 이용한 후에는 제대로 따라서 해야만 온전히 빌드 및 배포가 이루어질 수 있다는 것을 알게 된 점이라고나 할까...

본인이 닷넷 관련 오픈 소스 프로젝트를 운영한다면 AppVeyor는 꼭 써보는 것이 좋겠다. 꼭 써라 두번 써라
