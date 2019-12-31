---
title: "Azure DevOps 시리즈 #7 - DNU Publish"
date: "2016-04-30"
slug: azure-devops-7-dnu-publish
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- Azure
- devops
- DNU
- DNVM
- Continuous Delivery
fullscreen: false
cover: ""
---

> 이 포스트는 [Microsoft Azure](https://azure.microsoft.com)를 활용한 DevOps 시리즈입니다.

1. [배포 자동화를 위한 서비스 계정 생성 - Service Principal](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)
2. [애플리케이션 리소스 생성 자동화 - ARM Templates](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)
3. [애플리케이션 빌드 자동화 1 - Versioning](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)
4. [애플리케이션 빌드 자동화 2 - DNU Build](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)
5. [애플리케이션 테스트 자동화 1 - DNX Test](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)
6. [애플리케이션 테스트 자동화 2 - Chutzpah](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)
7. **애플리케이션 패키지 자동화 - DNU Publish**
8. [애플리케이션 배포 자동화 - MSDeploy/WAWSDeploy](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)
9. 데이터베이스 이전 자동화 1 - KUDU
10. 데이터베이스 이전 자동화 2 - azure-functions

[이전 포스트](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)에서는 [Chutzpah](https://github.com/mmanela/chutzpah)를 이용한 클라이언트 사이드 테스트, 즉 자바스크립트 테스트 자동화에 대해서 알아보았다. 지난 포스트까지 완료했다면 Continuous Build를 지나 Continuous Integration 단계까지 완성한 셈이다. 이 포스트에서는 Continuous Delivery 및 Deployment의 첫번째 단계인 애플리케이션 패키지 퍼블리싱에 대해 살펴보도록 한다.

> 관련 샘플 소스코드는 [https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample](https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample) 에서 확인할 수 있다.

ASP.NET Core 이전에는 빌드를 위해서는 `MSBuild`, 패키징을 위해서는 NuGet을 사용해야 했다. 이제는 이런 번거로움이 없이 닷넷 코어 런타임에서 제공하는 `DNU`를 이용하면 한번에 바로 패키지 퍼블리싱이 가능하다. 아래 파워셸 스크립트를 보자.

https://gist.github.com/justinyoo/9583864053375698e0e3bb874cc67ef7

솔루션 안에는 분명 수많은 프로젝트들이 있다. 하지만, 그 중에서 애플리케이션 프로젝트는 반드시 `Startup.cs` 파일을 포함한다. 따라서, 애플리케이션 프로젝트만 별도로 찾아놓고 난 후에 `foreach` 반복문으로 `dnu publish`를 수행한다. 이 때 경우에 따라 아래와 같은 에러 메시지를 접할 수도 있다.

> DNU(0,0): Error : The specified path, file name, or both are too long. The fully qualified file name must be less than 260 characters, and the directory name must be less than 248 characters.

이럴 경우에는 위 스크립트에서 `--out` 파라미터 값을 `$($pwd.Path)` 대신 `C:\Temp` 정도로 짧게 설정하면 문제 해결이 가능하다. 이렇게 해서 패키지 퍼블리싱이 끝나면 해당 폴더로 가서 어떻게 패키지가 생성됐는지 확인해 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/04/azure-devops-7-dnu-publish-01.png)

위 스크린샷과 같이 `C:\Temp\publish\` 폴더 아래 웹 애플리케이션 패키지가 생성된 것을 확인할 수 있다.

지금까지 `dnu publish`를 통해 애플리케이션 배포를 위한 패키키 퍼블리싱을 진행해 봤다. 여기까지 하면 Continuous Delivery 까지가 완성된 것이다. 여기서 수동으로 배포를 한다면 Continuous Delivery, [다음 포스트](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)와 같이 자동으로 배포를 한다면 Continuous Deployment가 된다. [다음 포스트](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)에서는 어떻게 배포 자동화를 이루는지에 대해 다루어 보도록 한다.
