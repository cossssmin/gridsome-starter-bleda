---
title: "Windows Subsystem for Linux (WSL)에서 쿠버네이티즈 CLI 사용하기"
date: "2018-06-04"
slug: running-kubernetes-on-wsl
description: ""
author: Justin-Yoo
tags:
- azure-container-services
- docker
- kubernetes
- Windows
- windows-subsystem-for-linux
- wsl
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-00.png
---

윈도우 환경에서는 Docker for Windows를 이용하면 도커 컨테이너를 손쉽게 사용할 수 있다. [이전 포스트](https://blog.aliencube.org/ko/2018/04/11/running-docker-and-azure-cli-from-wsl/)에서는 Windows Subsystem for Linux (WSL) 환경에서 도커 컨테이너를 이용하는 방법에 대해 논의해 보았다. 이번에는 쿠버네이티즈(K8S)를 WSL 환경에서 돌리고 싶다면 어떻게 해야 할까? 도커가 WSL 안에서 돌아가지 않는데 K8S가 돌아갈리가 없다. 하지만 언제나 그랬듯이 방법은 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/well-find-a-way-we-always-have.jpg)

이번 포스트에서는 WSL 안에서 K8S를 돌리는 방법에 대해 알아보도록 한다.

## Docker for Windows 엣지 채널을 이용해서 K8S 설치하기

[Docker for Windows](https://docs.docker.com/docker-for-windows/) 버전은 안정(stable) 버전과 엣지(edge) 버전이 있다. 이 중에서 엣지 버전은 K8S를 담고 있으므로 이를 설치하도록 하자. `settings > general` 메뉴로 가서 보면 현재 내 컴퓨터에서 돌아가는 도커 버전을 알 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-01.png)

위 스크린샷에서 볼 수 있다시피, 이미 필자의 컴퓨터에는 엣지 버전을 설치했다고 나와 있다. 링크를 클릭해서 들어가 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-02.png)

만약, 안정 버전을 설치한 상태라면 위의 채널 선택 화면에서 엣지 채널을 선택한다. 자동으로 설치를 하게 되고 끝나면 자동으로 도커 데몬이 실행된다. 다시 설정 화면으로 가보자. K8S 메뉴가 생긴 것을 볼 수 있다. K8S 메뉴를 클릭해서 들어간다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-03.png)

아직 K8S 서비스가 활성화 되지는 않았다. 체크 박스를 클릭해서 활성화 시키고 오케스트레이션 옵션으로 Swarm 대신 Kubernetes 를 선택한다. 그리고, `Apply` 버튼을 클릭해서 설치를 시작한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-04.png)

자, 이제 K8S 클러스터가 설치됐고, 돌아가기 시작했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-05.png)

실제로 윈도우 환경에서 잘 돌아가는지 확인해 보려면 아래 명령어를 입력해 본다.

```bat
kubectl cluster-info

```

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-06.png)

윈도우 쪽에서 할 일은 다 끝났다. 이제 WSL 환경에서 K8S를 설치하고 돌려 볼 차례이다.

## WSL에 K8S CLI 설치하기

WSL 환경 바깥에서 일단 K8S 클러스터가 돌아가긴 한다. 이걸 WSL 안으로 끌고 들어와야 하는데, 그러려면 우선 [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/)을 WSL 안에 설치해야 한다. 아래 명령어를 WSL 배시 화면에서 입력한다.

```bash
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl \
&& chmod +x ./kubectl \
&& sudo mv ./kubectl /usr/local/bin/kubectl

```

이렇게 함으로써 `kubectl` 설치가 끝났다.

## 윈도우 K8S 설정을 WSL로 복사하기

하지만 아직 K8S 환경 설정이 끝나지 않았다. 이미 윈도우에 설치한 환경 설정 파일이 있기 때문에 그것을 그대로 가져다 쓰면 된다. 아래 명령어를 입력해서 윈도우의 K8S 설정 파일을 가져온다.

```bash
mkdir ~/.kube \
&& cp /mnt/c/Users/[USERNAME]/.kube/config ~/.kube

```

> 만약 [이전 포스트](https://blog.aliencube.org/ko/2018/04/11/running-docker-and-azure-cli-from-wsl/)의 절차를 모두 마쳤다면 위 명령어와 같이 `/mnt` 부분이 필요하지 않다. 그냥 `/c/Users/...` 이렇게 시작하도록 하자.

환경 설정 파일을 복사했다면 이번엔 `kubectl`이 Docker for Windows 컨텍스트를 사용하게끔 한다.

```bash
kubectl config use-context docker-for-desktop

```

이제 모든 설정이 다 끝났다. 아래 명령어를 입력해서 확인해 보도록 한다.

```bash
kubectl cluster-info

```

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-07.png)

## WSL에서 K8S 클러스터로 앱 배포하기

`kubectl`이 잘 돌아가는 것 같긴 한데, 실제로 앱을 올려서 돌려보면 더욱 확실하게 알 수 있을 것이다. 아래 명령어를 입력해 보자. 원래 `minikube`를 설치하고 잘 작동하는지 확인해 보는 앱인데, 여기서 사용해도 상관 없다.

```bash
kubectl run hello-minikube --image k8s.gcr.io/echoserver:1.10 --port 8080
kubectl expose deployment hello-minikube --type NodePort

```

앱이 외부에서도 접근 가능하게끔 포트를 열어줬다. 이 포트는 무작위로 할당되므로 아래 명령어를 통해 포트 번호를 확인한다.

```bash
kubectl describe service hello-minikube

```

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-08.png)

여기서는 `32045` 포트 번호를 사용하는 것으로 나와 있다. 웹 브라우저를 열어 실제로 웹사이트 접근이 가능한지 확인한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/running-kubernetes-on-wsl-09.png)

웹사이트 접속 후 정보를 그대로 볼 수 있다.

* * *

지금까지 윈도우에 K8S를 설치하고 WSL에서 연결하는 방법에 대해 알아 보았다. 공식 문서에 따르면 로컬 개발 환경에서는 [`minikube`](https://kubernetes.io/docs/tasks/tools/install-minikube/)를 설치하는 것을 권장하지만, 굳이 이제는 더이상 필요 없게 된 셈이다. 개인적으로는 여전히 도커나 K8S 같은 컨테이너 기술을 배우는 중이기 때문에 이와 같이 환경 설정이 좀 더 쉬워진다면 개발 자체에 집중할 수 있어서 좀 더 수월해 질 것으로 본다.

> 만약 여전히 `minikube`를 윈도우 환경에서 사용하고 싶다면 [Dario De Bastiani](https://twitter.com/ddbastiani)가 작성한 [Install kubernetes on windows + WSL](https://medium.com/@ddebastiani/install-kubernetes-on-windows-wsl-c36f6b2571d2) 포스트를 참조하도록 하자.
