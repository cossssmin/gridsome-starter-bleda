---
title: "Windows Subsystem for Linux (WSL)에서 Docker와 애저 CLI 사용하기"
date: "2018-04-11"
slug: running-docker-and-azure-cli-from-wsl
description: ""
author: Justin-Yoo
tags:
- azure-container-services
- azure-cli
- docker
- windows-subsystem-for-linux
- wsl
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-00.png
---

[지난 포스트](https://blog.aliencube.org/ko/2018/04/05/wsl-bash-on-cmder/)에서는 [cmder](http://cmder.net/) 콘솔에 [Windows Subsystem for Linux(WSL)](https://docs.microsoft.com/en-us/windows/wsl/about)을 연동시키는 방법에 대해 알아 보았다면, 이번 포스트에서는 WSL에 [도커](https://www.docker.com/) 및 [애저 CLI](https://docs.microsoft.com/en-us/cli/azure)를 설치하고 실행시키는 방법에 대해 알아보도록 하자.

## 애저 CLI 설치하기

애저 CLI를 WSL 안에서 설치하는 방법은 어렵지 않다. 그냥 [우분투 셸](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-apt)일 경우에는 링크를 따라서 설치하면 아무런 어려움 없이 금방 설치가 가능하다. 이 글을 쓰는 현 시점에서 설치에 필요한 명령어를 아래와 같이 한데 모아 보았다. 한줄 한줄 실행시키면 된다.

https://gist.github.com/justinyoo/db441bcde611e666db392bddbf3c9534

> **추가 (2018-12-27)**: 만약 우분투 18.04 LTS 버전의 WSL을 설치했다면 위의 스크립트는 Microsoft 서명 키를 가져오는 부분에서 동작하지 않는다. 이럴 땐 아래의 스크립트를 실행시키도록 하자. https://gist.github.com/justinyoo/703ceb6b3623803a68808ae63d7cc3c7

만약 이것도 귀찮다고 생각한다면 아래 명령어만 실행시키면 애저 CLI를 설치할 수 있다.

https://gist.github.com/justinyoo/57c13f9847d7ee934b53eeb14fbb5749

설치가 끝난 후 `az --version` 명령어를 실행시켜 보면 현재 설치된 애저 CLI 버전을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-01.png)

## 도커 설치하기

일단 사실관계부터 확인을 해 보자. 공식적으로 [WSL은 도커 데몬을 실행시킬 수 없다](https://blogs.msdn.microsoft.com/commandline/2017/12/08/cross-post-wsl-interoperability-with-docker/).

<iframe src="https://giphy.com/embed/SqmkZ5IdwzTP2" width="480" height="394" frameborder="0" class="giphy-embed" allowfullscreen></iframe>

[via GIPHY](https://giphy.com/gifs/reaction-what-despicable-me-SqmkZ5IdwzTP2)

> 이게 무슨 소리요! 그러면 도커를 어디에서 실행시키라는 거요?

윈도우에서 직접 도커 데몬을 실행시키고 그걸 WSL에 연결시키는 방법이 있다. 그렇다면 일단 [Docker for Windows](https://docs.docker.com/docker-for-windows/install/)를 다운로드 받아 설치하고 실행시켜 보자. 윈도우용 도커라고 해도 윈도우 컨테이너 뿐만 아니라 리눅스 컨테이너도 다 실행시킬 수 있으니 걱정하지 말고 일단 설치한다. 그리고 나면 아래와 같이 쌩쌩하게 잘 돌아가는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-02.png)

파워셸 콘솔에서 현재 실행중인 도커 버전을 아래와 같이 확인해 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-03.png)

실제로 리눅스에 node.js로 구성한 간단한 웹 서버를 돌려서 실제로 작동하는지 확인해 보도록 하자. 아래는 간단한 node.js 파일이다.

https://gist.github.com/justinyoo/52b3c1bdb38e88458155f3a7b649e754

그리고 이것을 곧바로 리눅스 기반의 node.js 도커 컨테이너에 마운트 시켜보자.

https://gist.github.com/justinyoo/733f24772fbb975db2f944e76411570b

이후 웹 브라우저에서 `http://localhost:8080`으로 접속해 보면 아래와 같이 `Hello World`를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-04.png)

## 도커와 WSL 연결하기

이제, 이렇게 WSL 밖에서 설치한 후 쌩쌩하게 돌아가고 있는 도커 데몬을 WSL에 연결시켜야 한다. 이를 위해서는 몇가지 작업이 필요한데 그 순서는 아래와 같다.

1. WSL 안에서 Docker for Windows에 직접 연결할 수 있는 포트를 하나 오픈한다.
2. WSL 안에 도커를 설치한다
3. WSL 안에서 Docker for Windows가 열어준 포트를 연결한다.
4. WSL 안엥서 Docker가 쓸 수 있게끔 디스크 볼륨 마운트를 변경한다.

> 이 내용은 [Nick Janetakis](https://twitter.com/nickjanetakis)가 작성한 [블로그 포스트](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly)의 내용을 바탕으로 재구성했다.

### 도커 연결 포트 구성

앞서 언급했다시피, WSL 안에서는 도커 데몬을 직접 실행시킬 수 없다. 그래서 윈도우용 도커 데몬에서는 WSL에서 접근할 수 있는 포트를 하나 제공한다. 아래와 같이 `2375`번 포트를 개방한다. 그러면 자동으로 도커 데몬을 재시작한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-05.png)

### 도커 클라이언트 설치

이제는 WSL 안에 도커 클라이언트를 설치할 차례이다. 우분투 배시 콘솔에서 아래 스크립트를 차례로 실행시키면 된다. 가장 최신 `stable` 버전의 도커 CE와 `1.20.1` 버전의 도커 컴포저가 설치된다.

https://gist.github.com/justinyoo/a5b3515b4768e975ea64e8f9bbe32c6c

이마저도 귀찮고 한방에 설치하고 싶다면 아래 명령어를 우분투 배시 콘솔에서 실행시킨다.

https://gist.github.com/justinyoo/df871cb740696697e9b493fda2d9aa6e

설치가 끝나면 WSL을 종료한 후 다시 시작한다. 그리고 `docker version` 명령어를 실행시키면 설치가 잘 된 것을 알 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-06.png)

하지만 도커 CE 버전은 도커 데몬과 CLI를 함께 설치하는 것인데, 사실상 데몬 부분은 작동하지 않으니 필요가 없다. 따라서, 만약 CLI 부분만 별도로 설치를 하고 싶다면 [Ben Coleman](https://twitter.com/BenCodeGeek)이 쓴 [이 포스트](https://azurecitadel.github.io/guides/docker/#1-install-the-docker-client-tools)를 참조하면 된다.

### 도커 연결 포트 설정

이제 도커 데몬과 도커 클라이언트를 연결해 줄 차례이다. 앞서 도커 데몬에서 `2375`번 포트를 개방했다. 이제 WSL 안의 도커 클라이언트가 이 포트를 인식할 수 있게끔만 해주면 된다. `.bashrc` 파일을 열어 맨 아래쪽에 아래 내용을 입력한 후 저장한다.

https://gist.github.com/justinyoo/cc3ed26714abd7cabfef6382224b374b

이후 `source ~/.bashrc` 명령어를 통해 다시 실행시키면 된다. 여기까지 하면 WSL 밖에 있는 도커 데몬과 WSL 안에 있는 도커 클라이언트가 제대로 연결됐다. 직접 확인해 보도록 하자. 아래 명령어를 배시 콘솔에서 실행시켜본다. 이는 WSL 밖에서 앞서 만들어 놓았던 node.js 용 도커 웹서버 이미지이다.

https://gist.github.com/justinyoo/62fb9077f3260e38e6647f23ddadc9f1

실제로 도커 컨테이너가 잘 실행이 된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-07.png)

그리고 `http://localhost:8080` 주소를 웹 브라우저로 접속해보면 동일한 `Hello World`를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/running-docker-and-azure-cli-from-wsl-04.png)

### 도커 디스크 마운팅

마지막 하나가 더 남았다. 도커의 디스크 마운팅은 `/c/...`로 시작하는 반면에 WSL에서는 `/mnt/c/...`와 같이 시작한다. 리눅스를 주 용도로 쓰는 게 아니라서 어떤 것이 일반적인 것인지는 모르겠으나, 이 둘이 맞지 않는 것은 확실하고, WSL의 볼륨 마운팅을 도커와 맞춰줘야 문제가 없다는 것은 잘 알겠다. 이를 위해서는 우선 `sudo mkdir /c` 명령어를 통해 `/c` 드라이브를 먼저 만들고, 다시 `.bashrc` 파일에 아래의 내용을 추가해 줘야 한다.

https://gist.github.com/justinyoo/567533cb8516802fe826ac707a637b79

이후 `source ~/.bashrc` 명령어를 통해 다시 실행시키면 된다. 하지만 이 `sudo mount` 명령어를 위해 매번 WSL 인스턴스를 시작할 때 마다 패스워드를 치는 것은 바람직하지 않다. 이를 회피하기 위해 `sudo visudo` 명령으로 아예 이부분을 지나쳐버리면 된다.

https://gist.github.com/justinyoo/8e1acc44fe5a8bd5861cc6db4a1b37ec

여기서 `[YOUR_WSL_USERNAME]` 부분은 본인의 WSL 유저네임으로 바꿔주면 된다.

* * *

여기까지 한 후 WSL 인스턴스를 종료시키고 다시 실행시키면 모든 작업이 끝났다. 사실 리눅스 개발 환경에 익숙하지 않은 개발자라면 이 과정이 굉장히 직관적이지 않고 어려울 수 있다. 어떻게 보면 굉장히 간단한 것들인데, 어떤 원리로 돌아가는지를 모르니 삽질을 많이 했더랬다. 이제 윈도우 환경에서 나같은 초보 개발자들도 별도의 리눅스 가상 환경 없이 WSL을 이용해서 도커와 애저 CLI를 다룰 수 있게 됐다.
