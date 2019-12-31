---
title: "애저 컨테이너 레지스트리 기초"
date: "2018-04-13"
slug: azure-container-registry-101
description: ""
author: Justin Yoo
tags:
- Azure Container Services
- Azure Container Instances
- Azure Container Registry
- ACI
- ACR
- Container
- Docker
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-00.png
---

[도커](https://docker.com)와 같은 컨테이너 기술을 쓰다보면 이러한 컨테이너 이미지를 저장해둘 저장소가 필요하다. [도커 허브](https://hub.docker.com/)는 바로 이러한 저장소를 제공하는 서비스이다. 반면에 기업용 시장에서는 아무래도 자체적인 저장소를 갖고 싶어하기 마련인데, 이를 위해서 도커는 자체적으로 프라이빗 저장소를 제공하고 애저는 [애저 컨테이너 레지스트리 Azure Container Registry (ACR)](https://docs.microsoft.com/en-us/azure/container-registry/) 서비스를 제공한다. ACR은 [도커 레지스트리 2.0](https://docs.docker.com/registry/)을 기반으로 한 모든 종류의 프라이빗 컨테이너를 저장할 수 있는 저장소이다. 이 서비스 역시도 제대로 사용하려면 꽤 이것저것 들여다 봐야 하지만, 이 포스트에서는 기본적으로 어떻게 ACR을 사용해서 [애저 컨테이너 인스턴스 (ACI)](https://docs.microsoft.com/en-us/azure/container-instances/) 서비스와 연동시킬 수 있는지 알아보도록 하자.

> [지난 포스트](https://blog.aliencube.org/ko/2018/04/11/running-docker-and-azure-cli-from-wsl/)에서 우리는 이미 Windows Subsystem for Linux(WSL)과 애저 CLI, 도커를 연동시키는 방법에 대해 알아보았다. 이 포스트에서도 계속해서 WSL과 도커, 애저 CLI를 이용한다.

## 애저 컨테이너 레지스트리 생성

우선 애저 서비스에 로그인한다. [애저 CLI 시작하기](https://blog.aliencube.org/ko/2018/04/06/azure-cli-101/) 포스트를 보면 어떻게 서비스 프린시플을 이용해서 로그인 할 수 있는지 알 수 있으므로 여기서도 계속 같은 방법을 사용한다. 로그인 후 `az acr create -g [RESOURCE_GROUP_NAME] -n [ACR_NAME] --sku [Basic|Standard|Premium] --admin-enabled true` 명령어를 입력한다. 이렇게 하면 아래와 같이 ACR 인스턴스가 하나 만들어질 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-01.png)

ACR 인스턴스가 만들어지고 난 후 아웃풋 화면에 보이는 `loginServer` 값을 잘 기억해 두자. 이 값은 항상 `[ACR_NAME].azurecr.io`가 된다.

## 도커 이미지 생성 및 저장

이번에는 ACR에 저장할 도커 이미지를 만들어 보자. 샘플 node.js 앱은 [https://github.com/Azure-Samples/aci-helloworld](https://github.com/Azure-Samples/aci-helloworld)에서 클론 받아 사용할 수 있다. 다운로드 받은 샘플 코드의 `DockerFile` 파일을 열어보면 알파인 리눅스에 노드 서버를 얹어서 노드 기반 웹 애플리케이션을 실행시키는 것으로 되어 있다. 우선 해당 저장소의 루트 디렉토리로 이동한 후 `docker build . -t aci-sample-app` 명령어를 통해 도커 이미지를 빌드해 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-02.png)

알파인 리눅스 바탕에 노드 서버가 올라가고 그 위에 샘플 애플리케이션이 올라간 `aci-sample-app`이라는 이름의 도커 이미지가 하나 만들어진 것을 확인할 수 있다. 실제로 작동을 잘 하는지 여부를 로컬에서 아래와 같이 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-03.png)

웹 브라우저로 확인해 보면 로컬에서는 잘 작동하는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-04.png)

이제 이 이미지를 바탕으로 ACR에 올릴 이미지를 만들어 보자 `docker tag aci-sammple-app [ACR_SERVERNAME]/aci-sample-app` 명령어를 통해 ACR에 등록할 수 있는 태그를 붙여본다. 그리고 다시 `docker images` 명령어로 결과를 확인해 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-05.png)

두 이미지의 ID값은 같지만 태그가 다르게 붙은 것을 확인할 수 있다. 이제 ACR 서버 태그가 붙은 도커 이미지를 업로드 할 차례이다. 먼저 ACR에 `az acr login -n [ACR_RNAME]` 명령어를 이용해 로그인한다. 별 탈 없이 로그인을 하게 되면 `Login Succeeded` 라는 짤막한 한 줄 메시지를 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-06.png)

이후 `docker push [ACR_SERVERNAME]/aci-sample-app` 명령어로 업로드한다. 기존의 도커 허브 명령어와 동일하다. 다만 업로드 서버가 도커 허브가 아닌 ACR이라는 점만 다를 뿐이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-07.png)

업로드가 끝났다면 실제로 올라가 있는지 `az acr repository list -n [ACR_NAME]` 명령어를 통해 확인할 수 있다. 또한 해당 저장소의 버전 태그 역시도 `az acr repository show-tags -n [ACR_NAME] --repository [REPOSITORY_NAME]` 명령어를 통해 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-08.png)

여기까지 해서 도커 이미지를 ACR에 업로드 하는 작업까지 완료했다.

## 애저 컨테이너 인스턴스 서비스 생성 및 운영

이제 ACR에 올라간 도커 이미지를 불러다 쓸 차례이다. [애저 컨테이너 인스턴스](https://azure.microsoft.com/en-us/services/container-instances/) 서비스는 도커 이미지만 있으면 언제든 불러다 컨테이너를 만들고 직접 서비스 할 수 있게 해준다. 여기서는 간단하게 ACR에 올라간 도커 이미지를 불러와서 쓰는 용도로만 사용한다.

우선 ACR에 올라간 이미지를 불러와서 사용하기 위해서는 ACR 접근 패스워드를 알고 있어야 한다. 패스워드는 `az acr credential show --name [ACR_NAME] --query "passwords[0].value"` 명령어를 통해 받아낼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-09.png)

앗, 그런데 뭔가 이상하다. 패스워드 앞뒤에 따옴표가 붙어있네? 불필요한 따옴표는 떼 낼 필요가 있다. 명령어를 살짝 바꿔보자. `az acr credential show --name [ACR_NAME] --query "passwords[0].value" | tr -d \"`

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-10.png)

이제 제대로 된 패스워드가 나타났다. 하지만 여전히 패스워드가 화면에 보이는 상황이 썩 좋지만은 않다. 따라서 `passwd=$(az acr credential show --name [ACR_NAME] --query "passwords[0].value" | tr -d \")`와 같은 명령어를 통해 `passwd` 변수에 패스워드를 저장해 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-11.png)

이제 애저 컨테이너 인스턴스를 만들어 볼 차례이다. 컨테이너 인스턴스는 애저 포탈에서도 생성할 수 있지만 여기서는 애저 CLI에서 생성해 보기로 한다. `az container create -g [RESOURCE_GROUP_NAME] -n [CONTAINER_NAME] -l [LOCATION] --image [ACR_SERVERNAME]/aci-sample-app --dns-name-label [DNS_NAME] --registry-password $passwd` 명령어를 실행시켜 보자.

현재 애저 컨테이너 서비스는 모든 리전이 아닌 몇군데에서만 제공되므로 만약 리소스 그룹이 해당 지역에서 만들어진 것이 아니라면 지역을 반드시 포함시켜야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-12.png)

또한 DNS 이름은 공개적으로 접근하기 위해서는 필요한 것이므로 포함시키는 것이 좋다. 마지막으로 도커 허브에 공개된 저장소에서 도커 이미지를 가지고 올 때는 상관 없지만, ACR과 같은 프라이빗 저장소에서 가져올 때는 패스워드를 입력해야 한다. 따라서, 저 명령어를 실행시킨 결과는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-13.png)

위 이미지에서 볼 수 있다시피 현재 상태는 컨테이너 인스턴스를 생성하는 중이다. 컨테이너 생성은 보통 금방 끝나므로 `az container show -g [RESOURCE_GROUP_NAME] --n [CONTAINER_NAME] --query "{ status: instanceView.state, serverName: ipAddress.fqdn }"` 명령어를 통해 컨테이너 인스턴스 생성 결과를 알 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-14.png)

해당 컨테이너 인스턴스는 실제 작동하고 있으므로 이제 저 웹사이트 주소로 들어가 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-container-registry-101-15.png)

제대로 작동하는 웹사이트를 확인할 수 있다!

* * *

지금까지 애저 컨테이너 레지스트리 (ACR)과 애저 컨테이너 인스턴스 (ACI) 서비스를 이용해서 프라이빗 도커 이미지 저장소를 만들고 서비스 하는 방법에 대해 간략하게 알아 보았다. 좀 더 복잡하게 구성하자면 한도 끝도 없겠지만, 가장 기본적인 내용에 대해서는 훑었으니 앞으로 손쉽게 사용할 수 있기를 바란다.
