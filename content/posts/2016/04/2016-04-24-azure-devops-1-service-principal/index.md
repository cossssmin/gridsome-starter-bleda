---
title: "Azure DevOps 시리즈 #1 - 서비스 계정 생성"
date: "2016-04-24"
slug: azure-devops-1-service-principal
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- github
- devops
- service-principal
fullscreen: false
cover: ""
---

> 이 포스트는 [Microsoft Azure](https://azure.microsoft.com)를 활용한 DevOps 시리즈입니다.

1. **배포 자동화를 위한 서비스 계정 생성 - Service Principal**
2. [애플리케이션 리소스 생성 자동화 - ARM Templates](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)
3. [애플리케이션 빌드 자동화 1 - Versioning](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)
4. [애플리케이션 빌드 자동화 2 - DNU Build](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)
5. [애플리케이션 테스트 자동화 1 - DNX Test](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)
6. [애플리케이션 테스트 자동화 2 - Chutzpah](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)
7. [애플리케이션 패키지 자동화 - DNU Publish](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)
8. [애플리케이션 배포 자동화 - MSDeploy/WAWSDeploy](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)
9. 데이터베이스 이전 자동화 1 - KUDU
10. 데이터베이스 이전 자동화 2 - azure-functions

Azure 리소스들을 사용하다보면 윈도우 환경에서는 파워셸을 사용한다거나, 리눅스 환경에서는 [xplat](https://github.com/Azure/azure-xplat-cli) 등을 사용할 수 밖에 없는데, 이럴 경우 Azure에 항상 로그인을 해야 한다. 내 계정으로 직접 로그인을 해서 사용하는 것 자체는 큰 문제가 없는데, 자동화의 관점에서 보자면 내 계정 로그인 정보를 입력하는 것은 반드시 피해야 할 일들 중 하나이다. 이런 경우에 쓰이는 방법이 바로 이 Service Principal 이라고 불리는 서비스 계정을 생성하는 것이다. 이를 이용하면 굳이 사용자 계정이 노출될 위험이 전혀 없다. 이 포스트에서는 어떻게 서비스 계정을 생성하는지에 대해 간략하게 논의해 보도록 하자.

> 관련 샘플 소스코드는 [https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample](https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample) 에서 확인할 수 있다.

## Azure Active Directory 등록

우선 Azure Active Directory(AAD)에 애플리케이션을 하나 등록하도록 한다. 등록하는 방법에 대한 내용은 이전 포스트 [오피스 365 그래프 API를 사용자 인증 없이 직접 애플리케이션에서 사용하기](http://blog.aliencube.org/ko/2015/12/17/implementing-application-with-office-365-graph-api-in-app-only-mode)를 참고하도록 하자. 앞서 링크한 포스트와는 달리 `Microsoft Graph`를 별도로 추가할 필요는 없다. 애플리케이션을 추가하면서 아래의 세가지 값을 반드시 기억해 두도록 한다.

- ClientId: `abcd-efgh-xxxxx-xxxxx`
- ClientSecret: `abcdefg==`
- TenantId: `opqr-stuv-xxxx-xxxx`

위 값은 이 포스트에서 사용하기 위해 임의로 지정한 값이고 실제로는 다르다. 이제 준비는 끝났고, 서비스 계정을 생성하도록 하자.

## Service Principal 생성

위의 세 값 – `ClientId`, `ClientSecret`, `TenantId` – 를 가지고 서비스 계정을 생성할 차례이다. 먼저 Azure Resource Manager에 로그인한다. 이 땐 당연히(!) 본인의 계정으로 로그인해야 한다.

https://gist.github.com/justinyoo/96ef87c37ee18d515ff1ba528e408bd9

해당 계정에 여러개의 섭스크립션이 물려있다면, 적절한 섭스크립션을 선택한다. 내 섭스크립션 Id를 반드시 기억해 두도록 하자. 여기서는 그냥 `wxyz-abcd-xxxx-xxxx`이라는 값을 사용하도록 한다.

https://gist.github.com/justinyoo/85e4a752673027809b9280faf6138182

이제 본격적으로 등록할 차례이다. Azure Role를 부여한다.

https://gist.github.com/justinyoo/0a24a84af03ceffc97ba95c1699a9b5a

- `ServicePrincipalName`: 앞서 기록해둔 `ClientId`값을 사용한다.
- `RoleDefinitionName`: 이 값은 항상 `Contributor`가 된다. 읽고 쓰기가 가능한 최소한의 권한이 부여된 Role이다.
- `ResourceGroupName`: 리소스 그룹 이름을 지정하여 특정 리소스 그룹에만 적용시킨다. 만약 섭스크립션 전체에 적용시키고 싶다면 생략한다.

이제 서비스 계정 생성이 끝났다. 이 계정으로 다시 로그인을 해보도록 하자.

https://gist.github.com/justinyoo/bb42587c738414e34ef60c7b66cab06a

로그인이 됐는가? 그렇다면 아래와 같은 cmdlet 명령어를 실행시켜 제대로 작동하는지 알아보자.

https://gist.github.com/justinyoo/70bf4b713fb2e0cfa2e9acbc5c27fa40

결과를 확인할 수 있는가? 이제 서비스 계정이 제대로 생성됐는지 확인했다. 이어지는 포스트에서는 이 서비스 계정을 이용해서 자동화 스크립트를 실행시킬 것이다. ARM 템플릿 관련 포스트는 아래 두 포스트를 참고하면 좋다.

- [Azure Resource Group 템플릿으로 인프라스트럭처 한방에 셋업하기](http://blog.aliencube.org/ko/2015/07/13/setting-up-infrastructure-on-azure-with-azure-resource-group-template/)
- [새로와진 아주어 리소스 매니저 파워쉘 커맨들릿 소개](http://blog.aliencube.org/ko/2015/11/22/introducing-new-arm-powershell-cmdlets/)

이를 바탕으로 [다음 포스트](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)에서는 ARM 템플릿 설치 자동화에 대해 알아보도록 하자.
