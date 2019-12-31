---
title: "Azure DevOps 시리즈 #2 - ARM 템플릿"
date: "2016-04-24"
slug: azure-devops-2-arm-templates
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- github
- devops
- steps
fullscreen: false
cover: ""
---

> 이 포스트는 [Microsoft Azure](https://azure.microsoft.com)를 활용한 DevOps 시리즈입니다.

1. [배포 자동화를 위한 서비스 계정 생성 - Service Principal](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)
2. **애플리케이션 리소스 생성 자동화 - ARM Templates**
3. [애플리케이션 빌드 자동화 1 - Versioning](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)
4. [애플리케이션 빌드 자동화 2 - DNU Build](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)
5. [애플리케이션 테스트 자동화 1 - DNX Test](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)
6. [애플리케이션 테스트 자동화 2 - Chutzpah](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)
7. [애플리케이션 패키지 자동화 - DNU Publish](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)
8. [애플리케이션 배포 자동화 - MSDeploy/WAWSDeploy](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)
9. 데이터베이스 이전 자동화 1 - KUDU
10. 데이터베이스 이전 자동화 2 - azure-functions

이전에도 Azure Resource Manager(ARM) 템플릿 관련해서 포스트를 작성한 적이 있다. 자세한 내용은 아래를 참고한다.

- [Azure Resource Group 템플릿으로 인프라스트럭처 한방에 셋업하기](http://blog.aliencube.org/ko/2015/07/13/setting-up-infrastructure-on-azure-with-azure-resource-group-template/)
- [새로와진 아주어 리소스 매니저 파워쉘 커맨들릿 소개](http://blog.aliencube.org/ko/2015/11/22/introducing-new-arm-powershell-cmdlets/)

이 포스트에서는, [이전 포스트](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)에서 만든 서비스 계정을 이용해서 ARM 템플릿을 자동으로 배포하는 스크립트를 작성할 것이다.

> 관련 샘플 소스코드는 [https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample](https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample) 에서 확인할 수 있다.

## ARM 템플릿 작성

우선, 사용할 Azure 리소스들을 템플릿을 이용해 작성한다. 이 시리즈에서는 Azure WebApp 하나와 Azure SQL Database 하나를 사용한다. 그리고, Azure ApplicationInsights 역시 Azure WebApp에 적용시킬 것이다. 이렇게 적용시킨 템플릿은 아래 샘플 코드에서 직접 확인할 수 있다.

- [https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample/blob/master/src/AspNetCoreDevOpsSample.ResourceGroup/Templates/azuredeploy.json](https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample/blob/master/src/AspNetCoreDevOpsSample.ResourceGroup/Templates/azuredeploy.json)

이제 필요한 준비는 다 끝났고, 이를 파워셸을 이용하여 자동화 스크립트를 작성해 보도록 하자.

## 배포 스크립트 작성

이 스크립트가 딱히 어려운 부분이 있지는 않지만, 가장 중요한 부분이라고 한다면 바로 서비스 계정으로 로그인 하는 부분이 될 것이다. 이전 포스트에서도 언급한 바 있는데, 아래와 같은 스크립트를 이용한다면 손쉽게 서비스 계정으로 로그인 할 수 있다.

https://gist.github.com/justinyoo/bb42587c738414e34ef60c7b66cab06a

서비스 계정으로 로그인했다면, 이제 실제 리소스 그룹을 만들고 그 안에 리소스를 설치하는 과정이 될 것이다. 먼저 리소스 그룹을 만드는 명령어는 아래와 같다.

https://gist.github.com/justinyoo/658e3b0ccbe0e68d41bfc112ab2e12c0

이미 동일한 이름으로 동일한 지역에 리소스 그룹이 만들어져 있다면 별다른 오류 없이 기존의 정보를 보여주고 종료될 것이다. 이제 해당 리소스 그룹에 우리가 추가하고자 하는 리소스들을 템플릿을 통해 추가하는 스크립트이다.

https://gist.github.com/justinyoo/11ce16dd3916e71294f0a334d35b541b

특별한 내용은 없지만 여기서 눈여겨 봐야 할 부분은 `$ResourceGroupDeploymentName` 파라미터인데, 이 파라미터를 리소스 추가 혹은 수정시 사용한다면, 향후 동일한 작업을 반복할 때 이 이름으로 리소스 추가/수정/삭제를 할 경우 이력이 계속 남게 되어 히소토리 추적이 가능하다. 굉장히 편한 기능들 중 하나이므로 꼭 기억해 두도록 하자.

여기까지 왔다면 별 문제없이 Azure 리소스 배포는 성공한 셈이다. [다음 포스트](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)에서는 실제 애플리케이션 빌드 스크립트 작성에 대해 다루어보도록 한다.
