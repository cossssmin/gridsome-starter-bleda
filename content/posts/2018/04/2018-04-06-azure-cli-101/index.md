---
title: "애저 CLI 시작하기"
date: "2018-04-06"
slug: azure-cli-101
description: ""
author: Justin Yoo
tags:
- ARM & DevOps on Azure
- Azure CLI
fullscreen: false
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-00.png
---

애저 리소스를 관리하는 데 있어 지금까지는 [애저 파워셸](https://docs.microsoft.com/en-us/powershell/azure/overview)이 주로 쓰였다면, 이제는 파워셸보다는 좀 더 크로스 플랫폼을 지원하는 [애저 CLI](https://docs.microsoft.com/en-us/cli/azure)를 써 볼 차례가 아닌가 한다. 물론 최근에 애저 파워셸 역시도 [오픈 소스](https://azure.microsoft.com/en-us/blog/powershell-is-open-sourced-and-is-available-on-linux/)로 [풀리면서](https://github.com/Azure/azure-powershell) 크로스 플랫폼을 지향하는 추세이다. 하지만 뭐랄까 애저 리소스들 특히 컨테이너와 같은 내용을 다루는 부분을 보고 있노라면 공식 문서에서도 애저 CLI만 사용하는 경우가 많다. 이는 애저 파워셸이 아직 지원하지 않기 때문인데, 따라서 이 포스트에서는 이 추세에 발 맞춰 간단하게 애저 CLI를 훑어보고자 한다.

## 애저 CLI 설치

애저 CLI 버전이 1.x 일 때에는 뭐랄까 애저 파워셸의 보조 기능 정도로만 여겨졌었는데, 2.0으로 올라오면서 예전에 비해 굉장히 쓰임새가 높아졌다. 당연하게도 크로스 플랫폼을 지향하다보니 [윈도우](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows) 뿐만 아니라 [맥](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-macos), 그리고 [다양한](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-apt) [배포판](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-yum)의 [리눅스](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-zypper)에서도 [설치해서 사용 가능](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux)하다. 설치 방법에 대해서는 OS별로 링크를 다 걸어뒀으니 각자 상황에 맞게 설치할 수 있다.

위의 링크 중에서 윈도우용을 다운로드 받아 설치한 후에는 커맨트 프롬프트 또는 파워셸 콘솔에서 사용할 수 있다. 이와는 별개로 [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/about)를 사용하면 윈도우 안에서 별도의 가상 머신 설치 없이 리눅스 인스턴스를 사용할 수 있다. 이 역시도 윈도우 10을 사용한다면 [마이크로소프트 스토어를 통해 설치](https://docs.microsoft.com/en-us/windows/wsl/install-win10) 가능하므로 별도의 소개는 하지 않도록 한다. 여기서는 우분투 리눅스를 설치해서 쓰는 것으로 가정하고 애저 CLI를 설치한다.

## 애저 로그인

애저 CLI를 설치하고 나면 가장 먼저 해야 할 부분이 일단 애저 리소스에 접근할 수 있어야 한다. 로그인을 해 보도록 하자. 우선 파워셸 콘솔에서 아래와 같이 `az login` 커맨드를 입력하면 사용자 인터랙티브 스크린으로 가게끔 유도하는 메시지가 나타난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-01.png)

웹 브라우저를 열고 `https://microsoft.com/devicelogin`로 이동해서 화면에 나온 코드를 입력한 후 계속 진행하면 아래와 같은 화면이 나타난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-02.png)

만약 여러 개의 계정이 물려 있다면 그 중 하나를 선택하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-03.png)

마지막으로 로그인이 끝나면 아래와 같은 화면을 볼 수 있다. 이 창은 여기서 닫도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-04.png)

다시 파워셸 화면으로 돌아오면 아래와 같은 메시지가 나타난다. 해당 계정에 물린 테넌트와 섭스크립션 리스트가 주루룩 나타나면서 로그인이 완료됐음을 알려준다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-05.png)

리눅스 배시 화면에서도 이 절차는 별반 다르지 않다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-06.png)

## 섭스크립션 선택

만약 로그인 한 계정에 여러 개의 테넌트와 섭스크립션이 물려 있다면 하나를 선택해야 한다. `az account list` 명령을 입력한다. 혹은 좀 더 간략한 정보를 테이블 형태로 보고 싶을 경우 `az account list -o table` 명령을 입력하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-07.png)

그 중에서 하나를 선택해야 하므로 `az account set --subscription [SUBSCRIPTION_ID]` 명령을 쳐 보도록 하자. 이후 `az account show` 명령으로 현재 지정된 섭스크립션 정보를 아래와 같이 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-08.png)

### 서비스 프린시플 생성

지금까지 애저 리소스에 로그인하는 방법에 대해 알아 보았다. 하지만, 이 방법은 불편한 점이 하나 있는데, 무조건 웹 브라우저를 열어서 별도의 인증 절차를 거쳐야 한다. 로컬 개발 머신에서야 크게 상관은 없지만, DevOps 자동화 관점에서는 결코 좋은 점이 아니다. 이런 경우를 위해 애저 CLI 명령어를 이용해서 Service Principal (서비스 프린시플)을 만들어 두고, 그걸 이용해서 로그인 하는 방법을 알아보자.

우선 서비스 프린시플 생성을 위해서 `az ad sp create-for-rbac --name [SERVIE_PRINCIPAL_NAME] --password [PASSWORD]` 명령어를 입력해 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-09.png)

여기서 주의해야 할 부분이 하나 있다. 패스워드를 입력할 때 특수문자 이스케이핑 방식이 어떤 콘솔에서 사용하는가에 따라 다르다는 점이다. 예를 들어 파워셸에서 사용한다면 이스케이핑 문자로 `` ` `` 을 사용하는 반면, bash에서는 `\`을 사용한다는 점이다. 위 스크린샷은 bash 환경에서 찍은 것이므로 `\`을 사용했다.

자, 이제 이렇게 생성한 서비스 프린시플을 이용해서 애저에 다시 로그인을 해 보도록 하자. `az login --service-principal -u [SERVICE_PRINCIPAL_NAME_OR_APP_ID] -p [PASSWORD] -t [TENANT_ID]`와 같이 명령어를 입력해 보면 이 서비스 프린시플로 로그인 한 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-10.png)

이렇게 하면 굳이 웹 브라우저를 열어 코드 값을 넣고 다시 콘솔 화면으로 돌아가는 등의 번잡스러움을 피할 수 있으므로 DevOps 환경에서 자동화를 하는데 꽤 도움이 된다.

### 리소스 그룹

지금까지 애저 CLI를 이용해서 로그인하고 섭스크립션을 선택하는 방법에 대해 알아봤다. 이렇게 로그인 한 후에 실제로 하는 일은 리소스를 관리하는 일이 될 것이고, 그것을 위해서는 우선 리소스 그룹을 관리해야 한다. 우선 `az group list` 명령어를 통해 현재 섭스크립션 아래 생성된 리소스 그룹들의 리스트를 뽑아 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-11.png)

새로 리소스 그룹을 만들고 싶다면 `az group create --name [RESOURCE_GROUP_NAME] --location [LOCATION]` 명령어를 입력해 보도록 하자. 아래와 같은 결과를 확인할 수있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-12.png)

### ARM 템플릿

리소스 그룹을 만들었다면 이제 리소스를 생성할 차례이다. 리소스를 하나하나 만들 수도 있겠지만, 여기서는 DevOps 친화적인 ARM 템플릿을 이용해서 리소스를 추가하는 방식을 알아보도록 한다. `az group deployment create -n [DEPLOYMENT_NAME] -g [RESOURCE_GROUP_NAME] --template-file [TEMPLATE_FILE_NAME] --parameters @[TEMPLATE_PARAMETER_FILE_NAME]` 명령어를 입력해 보자. 만약 파라미터를 JSON 파일 형태로 제공한다면 반드시 `@` 기호를 붙여서 쓰는 것을 명심해야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-13.png)

이번엔 그렇다면 파라미터를 오버라이딩해 보자. 이 때는 `--parameters` 옵션을 두 번 주면 된다. 이 때 나중에 오는 파라미터가 앞의 파라미터를 덮어쓰므로 `--parameters @parameters.json --parameters key1=value1 key2=value2`와 같은 순서를 지켜주면 문제 없다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-14.png)

### JMESPath를 이용한 쿼리

마지막으로 리소스 리스트를 조회하다 보면 너무 많아서 필터링을 하고 싶을 때가 종종 있다. 이럴 때를 위해 애저 CLI 에서는 [JMESPath](http://jmespath.org/)라는 JSON 객체 특화된 필터링 규칙을 적용하고 있다. JMESPath 문법과 관련한 자세한 내용은 링크를 확인해 보도록 하고 여기서는 이 JAMESPath 쿼리를 어떻게 애저 CLI에서 활용할 수 있는지 간단하게 알아보기만 한다. 기본적으로 `--query` 옵션을 통해 필터링을 하게 된다. 예를 들어 이름에 특정 문자열이 들어간 리소스 그룹을 검색한다고 하면 대략 `az group list --query "[?contains(name, '[문자열]')]"`과 같은 명령어가 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/azure-cli-101-15.png)

* * *

지금까지 애저 CLI를 사용하는 방법에 대해 필요한 부분만 간략하게 알아보았다. 사실 이것 말고도 더 많은 사용예가 있겠지만, DevOps 관점에서 CI/CD를 구성한다면 이정도면 충분하지 싶다. 애저 파워셸과 애저 CLI, 상황에 따라 자유자재로 사용할 수 있기를 바란다.
