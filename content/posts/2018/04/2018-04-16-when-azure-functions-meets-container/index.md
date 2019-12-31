---
title: "애저 펑션과 도커 컨테이너가 만났을 때"
date: "2018-04-16"
slug: when-azure-functions-meets-container
description: ""
author: Justin Yoo
tags:
- Azure Container Services
- Azure CLI
- Azure Functions
- Container
- Cross Platform
- Docker
fullscreen: false
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-00.png
---

이전 포스트들에서 우리는 [cmder에 WSL Bash를 연결](https://blog.aliencube.org/ko/2018/04/05/wsl-bash-on-cmder/)했고, [애저 CLI](https://blog.aliencube.org/ko/2018/04/06/azure-cli-101/)도 설치하고 사용해 봤고, [애저 CLI, 도커, WSL을 모두 연동도 시켜봤고](https://blog.aliencube.org/ko/2018/04/11/running-docker-and-azure-cli-from-wsl/), [애저 컨테이너 레지스트리 (ACR)](https://blog.aliencube.org/ko/2018/04/13/azure-container-registry-101/)도 사용해 봤다. 이번 포스트에서는 이 일련의 포스트 중 마지막으로 우분투 리눅스 기반 도커 컨테이너에 애저 펑션을 설치하고, 이를 애저 펑션 인스턴스로 설치하는 방법에 대해 알아보고자 한다.

> 앞서와 마찬가지로 이번 포스트에서도 WSL과 애저 CLI를 이용한다.

## 서버리스 애플리케이션과 컨테이너 기술의 콜라보

서버리스 애플리케이션의 가장 큰 특징이라면 서버 운영 환경을 극한으로 추상화시켜 개발자는 아무 걱정 없이 비지니스 로직에만 집중하면 되게끔 만들어 주는데 있다. 반면에 컨테이너 기술은 이러한 서버 운영 환경을 제공하는 데 촛점을 맞춘다. 얼필 보면 이 둘은 상당히 다른 방향에서 진화하는 중이라 겹칠 이유가 거의 없는 것 처럼 보이는데, 어떻게 해서 서로 만나게 된 것일까?

우선 개발자마다 저마다 개발 환경이 달라지면서 생길 수 있는 문제점들을 방지한다. 개발 환경, 테스트 환경, 실서버 환경이 사실은 아무리 같게 맞춘다 하더라도 달라질 수 밖에 없다. 게다가 누구는 윈도우 OS, 누구는 맥 OS, 누구는 리눅스 OS 등 개발자마다 개발 플랫폼 자체가 다를 수 있는데, 이럴 때 컨테이너 기술은 이러한 모든 환경을 하나로 통일시켜주는 역할을 한다. 다시 말해서 개발자의 개발 환경과 개발/운영 서버의 차이 등을 하나로 통합해서 개발할 수 있게 해주는 역할을 해 준다. 이렇게 된다면 각자 코딩은 저마다의 환경에서 하겠지만, 실제 코딩 결과물을 컨테이너에 넣어 배포를 하게 되면 배포시 뭔가가 변경될 수 있는 가능성이 현저히 줄어들게 된다.

또 한가지 쓰임새는 애저 스택 환경이다. 애저 스택 환경에서는 컨테이너 기술을 통해 애저 펑션을 운영할 수 있다. 사실 애저 펑션 런타임 환경을 우리가 직접 설정할 이유는 거의 없지만 이러한 회사내 네트워크 안에서 서버리스 환경을 구성할 때 굉장히 편리하다는 장점이 있다.

사실, 이렇게 된다면 애저 펑션 환경을 AWS에서도 구현할 수도 있고, [실제로 해 본 사람도 있다](https://blog.wille-zone.de/post/run-azure-functions-in-docker/). 하나씩 차근차근 설정해 나가보자.

## 애저 펑션 CLI 설치하기

우선 WSL 안에 애저 펑션 CLI를 설치해야 한다. 애저 펑션 CLI는 npm 또는 `apt-get` 명령으로 손쉽게 설치할 수 있다. 설치하는 방법은 [이 페이지](https://github.com/Azure/azure-functions-core-tools)를 참조한다. 설치가 끝난 후 `func` 명령어를 통해 설치가 제대로 됐는지 곧바로 확인해 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-01.png)

## 애저 펑션 프로젝트 만들기

> 이 포스트에서 사용한 코드 샘플은 [여기](https://github.com/devkimchi/Azure-Functions-in-Container-Sample)에서 다운로드 받을 수 있다.

애저 펑션 CLI를 이용해서 우선 애저 펑션 프로젝트를 하나 만들어 보자. 현재 디렉토리에 바로 프로젝트를 생성하려면 `func init . --docker` 명령어를 입력하면 된다. 여기서 `--docker` 옵션을 주게 되면 도커 컨테이너 관련 `DockerFile` 파일도 함께 추가된다. 이 파일을 열어 보면 대략 다음과 같이 생겼다.

https://gist.github.com/justinyoo/6290b23a2d180c06b2f6a5ab9cfb5706#file-dockerfile-original-txt

하지만 여기서 참조하는 기본 이미지는 꽤 오래된 것이라서 최근 애저 펑션 SDK가 제대로 작동하지 않기 때문에 아래와 같이 수정해서 최신 기본 이미지를 참조하게끔 한다.

https://gist.github.com/justinyoo/6290b23a2d180c06b2f6a5ab9cfb5706#file-dockerfile-updated-txt

이제 `.dockerignore` 파일을 만들 차례이다. 이 파일을 이용하면 커스텀 도커 이미지를 만들 때 포함시키지 않아도 될 불필요한 파일을 정리할 수 있다. 이 파일의 내용은 대략 아래와 비슷하다.

https://gist.github.com/justinyoo/6290b23a2d180c06b2f6a5ab9cfb5706#file-dockerignore-txt

여기까지 애저 펑션 도커 프로젝트를 만들었다.

## 애저 펑션 코드 작성하기

이제 기본 애저 펑션 코드를 만들어 보자. 비주얼 스튜디오를 통해서도 만들 수 있지만 애저 펑션 CLI를 이용해서도 만들 수도 있다. 여기서는 애저 펑션 CLI 명령어인 `func new -l C# -t HttpTrigger -n [FUNCTION_NAME]`을 통해 기본 HTTP 트리거 펑션을 만든다. 그리고 그 결과는 대략 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-02.png)

여기서 `function.json` 파일을 열어 인풋 바인딩 섹션에 `"route": "test"` 값을 추가한다. 그리고, `authLevel` 값을 기존의 `function`에서 `anonymous`로 수정한다. 그 이유는 이유는 나중에 다시 설명하도록 한다.

https://gist.github.com/justinyoo/6290b23a2d180c06b2f6a5ab9cfb5706#file-function-json

## 도커 커스텀 이미지 생성하기

이제 기본적인 애저 펑션 소스 코드는 준비가 끝났으니, `docker build . -t [DOCKER_IMAGE_NAME]` 명령어를 통해 커스텀 도커 이미지를 생성한다. 아래와 같이 도커 이미지가 생성된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-03.png)

실제로 이 도커 이미지가 잘 돌아가는지 확인해 볼 차례이다. `docker run -it -p 8080:80 --name [CONTAINER_NAME] [DOCKER_IMAGE_NAME]` 명령어로 도커 컨테이너를 생성하고 실행시켜 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-04.png)

포스트맨을 통해 실제로 실행시켜보면 아래와 같이 예상했던 결과가 나타난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-05.png)

> **주의**: 현재까지 작업해 본 결과에 따르면 C# 코드를 이용해서 애저 펑션 도커 이미지를 만들 때에는 아직까지는 `.csx` 파일, 즉 C# 스크립트로만 작동하지, 컴파일된 코드, 즉 `.dll` 파일을 이용해서는 작동하지 않는다. 아직 프리뷰 상태인 점을 감안한다면 이 부분은 차후 개선될 것으로 기대한다.

## 도커 허브 이미지 업로드하기

앞서 생성한 커스텀 도커 이미지를 이제 도커 허브 리포지토리로 업로드할 차례이다.

> 안타깝게도 현재 애저 펑션 리눅스 컨테이너는 도커 허브만 지원하고 아직 애저 컨테이너 레지스트리는 지원하지 않는다. 이 역시도 곧 해결될 것으로 기대한다.

먼저 도커 허브에 업로드 하기 위해서는 커스텀 도커 이미지에 태깅을 해야 한다. `docker tag [DOCKER_IMAGE_NAME] [DOCKER_ID]/[DOCKER_IMAGE_NAME]` 명령어를 이용한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-06.png)

이렇게 만들어진 이미지를 업로드 하기 위해서는 도커 허브에 먼저 로그인 해야 한다. `docker login -u [USERNAME] -p [PASSWORD]`

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-07.png)

로그인 후 `docker push [DOCKER_ID]/[DOCKER_IMAGE_NAME]` 명령어를 통해 도커 허브로 이미지를 업로드한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-08.png)

실제 도커 허브 웹사이트에서는 이렇게 보인다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-09.png)

## 애저 펑션 컨테이너 인스턴스 생성하기

커스텀 도커 이미지도 준비가 끝났으니 이제 실제로 애저 펑션 컨테이너 인스턴스를 생성할 차례이다. 애저 CLI를 이용해서 `az functionapp create -g [RESOURCE_GROUP_NAME] -n [FUNCTION_APP_NAME] -s [STORAGE_ACCOUNT_NAME] -p [APP_SERVICE_PLAN_NAME] -i [DOCKER_ID]/[DOCKER_IMAGE_NAME]` 명령어를 사용하면 곧바로 애저 펑션 인스턴스가 하나 만들어진다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-10.png)

> 이 명령어를 실행시키기 전에 이미 스토리지 어카운트와 리눅스용 앱 서비스 플랜이 이미 준비되어 있어야 한다. 컨테이너용 애저 펑션은 **컨섬션 플랜은 아직 지원하지 않고 앱 서비스 플랜만 가능**하다.

애저 포탈에서도 이렇게 만들어진 애저 펑션 인스턴스를 곧바로 확인해 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-11.png)

애저 펑션 인스턴스 UI로 이동하면 앞서 생성한 `TestHttpTrigger`가 등록되어 있는 것이 보일 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-12.png)

마지막으로 포스트맨에서 애저 펑션 인스턴스로 요청을 날려보면 예상했던 결과를 받을 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/when-azure-functions-meets-container-13.png)

* * *

지금까지 애저 펑션 인스턴스를 커스텀 도커 이미지를 만들고 실행시키는 방법에 대해 살펴보았다. 여전히 개선해야 할 점들이 많이 보이긴 하지만, 크로스 플랫폼에서 돌아가는 ASP.NET Core 를 기반으로 애저 펑션이 어떤 식으로 돌아가는지 대략적인 그림을 그려볼 수는 있을 것이다.
