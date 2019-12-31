---
title: "Azure DevOps 시리즈 #8 - MSDeploy/WAWSDeploy"
date: "2016-05-01"
slug: azure-devops-8-msdeploy-wawsdeploy
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure
- DevOps
- MSDeploy
- WAWSDeploy
- Continuous Deployment
fullscreen: false
cover: ""
---

> 이 포스트는 [Microsoft Azure](https://azure.microsoft.com)를 활용한 DevOps 시리즈입니다.
> 
> 1. [배포 자동화를 위한 서비스 계정 생성 - Service Principal](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)
> 2. [애플리케이션 리소스 생성 자동화 - ARM Templates](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)
> 3. [애플리케이션 빌드 자동화 1 - Versioning](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)
> 4. [애플리케이션 빌드 자동화 2 - DNU Build](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)
> 5. [애플리케이션 테스트 자동화 1 - DNX Test](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)
> 6. [애플리케이션 테스트 자동화 2 - Chutzpah](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)
> 7. [애플리케이션 패키지 자동화 - DNU Publish](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)
> 8. **애플리케이션 배포 자동화 - MSDeploy/WAWSDeploy**
> 9. 데이터베이스 이전 자동화 1 - KUDU
> 10. 데이터베이스 이전 자동화 2 - Azure Functions

[이전 포스트](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)에서는 애플리케이션 배포를 위한 패키지 퍼블리싱 자동화에 대해 알아보았다. 이 단계까지 왔다면 이제 Continuous Delivery 까지는 완성된 것인데, 이 패키지 배포 마저도 자동화 시킨다면 이제 Continuous Deployment가 된다. 이 포스트에서는 바로 이 Continuous Deployment를 위한 배포 자동화에 대해 알아보도록 한다.

Azure 웹 앱에 자동 배포를 하기 위한 방법은 몇가지가 있다.

1. [깃헙](https://github.com)이나 [빗버킷](https://bitbucket.org) 등의 리포지토리에 웹훅을 연결시켜 푸시가 생기면 자동으로 배포하는 방법
2. Azure 웹 앱에 연결된 [KUDU](https://github.com/projectkudu/kudu)의 git 리포지토리에 직접 푸시하여 자동으로 배포하는 방법
3. `MSDeploy`를 이용하여 배포하는 방법

이 외에도 몇가지가 더 있지만 이 포스트에서는 `MSDeploy`를 이용하는 방법에 대해 알아보도록 한다. `MSDeploy`를 이용하게 되면 보통 아래와 같은 커맨드를 이용한다.

https://gist.github.com/justinyoo/c017a2e912fc96b6eb37d39993d5422b

그런데, 이 커맨드에 쓰이는 여러 값들은 모두 Azure 웹 앱의 퍼블리시 설정 파일을 다운로드 받아 보면 알 수 있는 값들이다. 파일을 다운로드 받은 후, 그 안의 XML 안에서 위의 값들을 모두 찾아내야 하는데, 여간 번거로운 것이 아니다. 이미 이런 번거로움을 느낀 [한 MS 직원](http://blog.davidebbo.com/2014/03/WAWSDeploy.html)이 [WAWSDeploy](https://github.com/davidebbo/WAWSDeploy)라는 이름의 배포 도구를 만들었다. 이 도구를 이용하면 퍼블리시 설정 파일을 직접 이용하여 배포를 할 수 있다.

우선 [서비스 계정을 이용하여 Auzre에 로그인](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)한다. 그리고 난 후 아래 파워셸 스크립트를 실행시킨다.

https://gist.github.com/justinyoo/fecae47954228cbf2e36c064db57434b

배포할 애플리케이션 패키지는 `C:\Temp\publish\MyWebApp`에 준비되어 있다고 가정한다. 먼저 퍼블리시 설정 파일을 `Get-AzureRmWebAppPublishingProfile` 커맨들릿을 이용해서 다운로드 받는다. 그리고 `WAWSDeploy`를 이용하여 Azure 웹 앱으로 배포한다. 이 때, `/t "D:\home\site"` 옵션을 꼭 주어야 하는데, 이는 Azure 웹 앱의 경로로써, 바뀌지 않는다. 마지막으로 `/d` 옵션을 주면 기존에 배포되었던 모든 파일들을 우선 삭제한 후 진행한다. 추가로 `/v` 옵션을 붙이면 배포 과정을 좀 더 자세히 확인할 수 있다.

이렇게 해서 ASP.NET Core 애플리케이션의 배포 자동화까지 진행해 보았다. 여기까지 모두 문제 없이 진행했다면, 애플리케이션 리소스 설치부터, 빌드, 테스트, 패키징을 거쳐 배포까지 모든 절차를 자동화할 수 있다고 볼 수 있을 것이다. 다음 포스트에서는 추가로 애플리케이션 배포 후 필요한 데이터베이스 마이그레이션 관련한 자동화까지 다루어 보도록 하겠다.
