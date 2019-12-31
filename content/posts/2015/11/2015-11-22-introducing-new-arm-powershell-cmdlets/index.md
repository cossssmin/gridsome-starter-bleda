---
title: "새로와진 아주어 리소스 매니저 파워쉘 커맨들릿 소개"
date: "2015-11-22"
slug: introducing-new-arm-powershell-cmdlets
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- ARM
- Azure
- Cmdlet
- PowerShell
fullscreen: false
cover: ""
---

최근에 [Azure](https://azure.microsoft.com)에서는 리소스 관리를 위한 새로운 파워쉘 커맨들릿(cmdlet)들을 추가했다. 기존의 커맨들릿과는 완벽하게 호환되지 않기 때문에 이 포스트에서는 새로운 커맨들릿들 중 리소스 관리를 위한 몇가지를 소개하고자 한다. 아주어 리소스 관리 템플릿에 대해 익숙하지 않다면 아래 소개하는 포스트를 먼저 읽어 보는 것을 추천한다.

> [Azure Resource Group 템플릿으로 인프라스트럭처 한방에 셋업하기](http://blog.aliencube.org/ko/2015/07/13/setting-up-infrastructure-on-azure-with-azure-resource-group-template)

위의 포스트에서 사용한 파워쉘 커맨들릿은 더이상 유효하지 않다. 정확하게는 유효하지 않다기 보다는 새로운 커맨들릿과는 더이상 호환되지 않는다. [MS 웹 플랫폼 인스톨러](http://www.microsoft.com/web/downloads/platform.aspx)를 통해 새로운 버전의 아주어 파워쉘을 다운로드 받을 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/11/new-arm-cmdlets-01.png)

> 이 글을 쓰는 시점에서는 2015년 11월 9일에 릴리즈된 버전을 사용한다.

## 새로운 파워쉘 명령어 세트

새 버전의 아주어 파워쉘을 다운로드 받은 뒤 파워쉘 ISE를 실행시킨다. 그 다음에 늘 하듯이 `Update-Help` 명령어를 실행시켜 도움말을 최신 버전으로 업데이트한다. 그 이후 오른쪽에 가능한 커맨들릿 명령어 리스트가 나오는데 여기서 `AzureRM.*`으로 시작하는 것들을 찾아보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/11/new-arm-cmdlets-02.png)

만약에 보이지 않는다면 ISE를 종료하고 다시 실행시켜보면 보일 것이다. 그래도 안 보인다면 컴퓨터를 재부팅하면 된다. `AzureRM.*`으로 시작하는 모듈들 중에 우리는 `AzureRM.Resources`을 사용할 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/11/new-arm-cmdlets-03.png)

예전과 달리 어떤 차이가 느껴지는가? 커맨들릿 이름들이 모두 `AzureRm*`와 같은 식이다. 이것은 기존의 커맨들릿과 다른 식으로 작동한다는 것을 의미한다. 좀 더 자세히 샘플 템플릿을 통해 살펴보도록 한다.

## 아주어 리소스 그룹 생성하기

이제 아주어에 리소스 그룹을 생성해 보도록 하자. 아주어에 리소스 그룹을 생성하기 위해서는 먼저 로그인 후 원하는 섭스크립션을 선택해야 한다. 아래의 파워쉘 명령어를 입력하자.

```powershell
Login-AzureRmAccount
Get-AzureRmSubscription
Select-AzureRmSubscription -SubscriptionId xxxx

```

기존의 파워쉘 커맨들릿들과 어떤 차이가 있는지 보이는가?

Old Cmdlets

New Cmdlets

`Get-AzureAccount`

`Login-AzureRmAccount`

`Get-AzureSubscription`

`Get-AzureRmSubscription`

`Select-AzureSubscription`

`Select-AzureRmSubscription`

섭스크립션까지 선택했다면 이제 리소스 그룹을 생성해 보도록 하자. 리소스 그룹 이름을 정하는 베스트 프랙티스는 [이 글](https://azure.microsoft.com/en-us/documentation/articles/virtual-machines-infrastructure-services-implementation-guidelines)을 참조하면 된다. 여기서는 `ase-dev-rg-sample`로 한다.

Old Cmdlets

New Cmdlets

`New-AzureResourceGroup`

`New-AzureRmResourceGroup`

따라서, 아래와 같이 입력한다.

```powershell
New-AzureRmResourceGroup -Name ase-dev-rg-sample

```

새로운 그룹이 만들어졌다. 이제 필요한 리소스들을 설치하도록 하자.

## 템플릿을 이용해 아주어 리소스 설치하기

방금 생성한 리소스 그룹에 웹사이트 하나와 데이터베이스 서버 하나씩 설치하도록 한다. 이 설치 템플릿은 [https://github.com/Azure/azure-quickstart-templates/tree/master/201-web-app-sql-database](https://github.com/Azure/azure-quickstart-templates/tree/master/201-web-app-sql-database)를 참조한다. 신규 리소스 설치를 위한 커맨들릿은 아래와 같다.

Old Cmdlets

New Cmdlets

`New-AzureResourceGroupDeployment`

`New-AzureRmResourceGroupDeployment`

아래와 같이 입력해서 리소스를 설치한다.

```powershell
New-AzureRmResourceGroupDeployment
    -ResourceGroupName ase-dev-rg-sample
    -TemplateFile azuredeploy.json
    -TemplateParameterFile azuredeploy.parameters.json
    -Verbose

```

이렇게 하면 모든 필요한 리소스 설치가 다 끝났다. 참 쉽죠? 지금 소개한 커맨들릿 말고도 엄청나게 많은 커맨들릿들이 모두 `AzureRm.*`와 같은 형태의 이름들을 갖고 있다. 이러한 이름들은 모두 새로운 ARM을 지원하기 위한 것들이므로 꼭 익혀두도록 하자.
