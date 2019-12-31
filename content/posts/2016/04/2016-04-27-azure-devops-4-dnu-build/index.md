---
title: "Azure DevOps 시리즈 #4 - DNU Build"
date: "2016-04-27"
slug: azure-devops-4-dnu-build
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure
- DevOps
- ASP.NET Core
- Continuous Build
- DNU
- DNVM
fullscreen: false
cover: ""
---

> 이 포스트는 [Microsoft Azure](https://azure.microsoft.com)를 활용한 DevOps 시리즈입니다.

1. [배포 자동화를 위한 서비스 계정 생성 - Service Principal](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)
2. [애플리케이션 리소스 생성 자동화 - ARM Templates](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)
3. [애플리케이션 빌드 자동화 1 - Versioning](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)
4. **애플리케이션 빌드 자동화 2 - DNU Build**
5. [애플리케이션 테스트 자동화 1 - DNX Test](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)
6. [애플리케이션 테스트 자동화 2 - Chutzpah](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)
7. [애플리케이션 패키지 자동화 - DNU Publish](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)
8. [애플리케이션 배포 자동화 - MSDeploy/WAWSDeploy](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)
9. 데이터베이스 이전 자동화 1 - KUDU
10. 데이터베이스 이전 자동화 2 - Azure Functions

[지난 포스트](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)에서는 빌드를 위한 준비절차로서 각각의 라이브러리 버전에 빌드 번호를 자동으로 포함시키는 방법에 대해 알아봤다면, 이 포스트에서는 실제로 어떻게 ASP.NET Core 애플리케이션을 커맨드 프롬프트 상에서 빌드할 수 있는지 알아보도록 한다.

> 관련 샘플 소스코드는 [https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample](https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample) 에서 확인할 수 있다.

닷넷 코어 이전까지는 프로젝트 라이브러리를 빌드하기 위해서는 반드시 [MSBuild](https://msdn.microsoft.com/en-US/library/dd393574.aspx)를 사용해야 했다. 당연하게도 이 툴은 윈도우 환경에서만 작동한다. 하지만 닷넷 코어로 넘어오면서부터는 어느 플랫폼에서건 애플리케이션을 만들 수 있어야 하고, 이는 빌드, 테스트, 배포까지 모두를 포함하는 개념이 되었다. 따라서, 닷넷 코어에서는 `MSBuild` 대신 `DNU`를 이용해서 애플리케이션을 컴파일한다.

컴파일 결과물도 완전히 달라졌다. 예전에는 해당 프로젝트 아래의 `/bin` 폴더 밑에 `/Debug` 혹은 `/Release` 폴더가 생기고 그 안에 NuGet 패키지 라이브러리를 포함한 모든 `.dll` 파일들이 생겨났다면, 이제는 더이상 그렇지 않다. 이제는 별도의 `/artifacts` 폴더 아래 프로젝트별로 `.dll` 파일들이 생겨나게 되며, 이 때 NuGet 패키지 라이브러리 파일들은 전혀 복사되지 않는다. 즉, 이것이 함축하는 의미는 `/artifacts` 폴더 아래 생기는 컴파일된 라이브러리 파일들은 애플리케이션 실행과는 전혀 상관이 없다는 것일 게다.

실제로 솔루션을 컴파일하면서 결과를 살펴보도록 하자. 가장 먼저 해야 할 일은 닷넷 런타임 라이브러리 버전을 선택하는 것이다.

https://gist.github.com/justinyoo/e084f23590fc46857620a3fed9c7c50c

이렇게 하면 `1.0.0-rc1-update1` 버전 닷넷 프레임워크 중에서 `clr` 런타임의 `x64` 아키텍처, `win` 운영체제에 해당하는 것을 선택할 수 있다. 다음으로는 모든 NuGet 패키지 라이브러리를 복원해야 한다.

https://gist.github.com/justinyoo/b6e18a90fc0323d54845dd6a10b3293f

뒤에 특별히 솔루션 폴더나 프로젝트 폴더를 언급하지 않으면 현재 폴더를 기준으로 하위 모든 프로젝트의 `project.json` 파일을 참조하여 NuGet 패키지 라이브러리를 복원하겠다는 것을 의미한다. 이제 실제로 솔루션 내의 모든 프로젝트들을 컴파일해 보도록 하자.

https://gist.github.com/justinyoo/5488410c3fc3a8a49b43797989da07f4

위의 내용은 `.\src`와 `.\test` 폴더 아래에 있는 프로젝트들 중에서 `project.json` 파일을 갖고 있는, 즉 닷넷 코어 라이브러리만 선택해서 컴파일을 하라는 것이다. 이렇게 컴파일이 끝나고 나면 아래와 같이 `artifacts` 폴더가 생성된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/04/azure-devops-4-dnu-build-01.png)

지금까지 닷넷 코어 애플리케이션을 커맨드라인에서 빌드하는 과정에 대해 살펴보았다. [다음 포스트](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)에서는 빌드가 끝난 애플리케이션들에 대해 자동으로 테스트를 실행시키는 스크립트를 작성하는 것에 대해 살펴보도록 한다.
