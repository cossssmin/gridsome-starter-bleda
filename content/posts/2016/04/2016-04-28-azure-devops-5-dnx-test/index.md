---
title: "Azure DevOps 시리즈 #5 - DNX Test"
date: "2016-04-28"
slug: azure-devops-5-dnx-test
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure
- DevOps
- ASP.NET Core
- Continuous Integration
- DNVM
- DNX
- DNX Test
fullscreen: false
cover: ""
---

> 이 포스트는 [Microsoft Azure](https://azure.microsoft.com)를 활용한 DevOps 시리즈입니다.

1. [배포 자동화를 위한 서비스 계정 생성 - Service Principal](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)
2. [애플리케이션 리소스 생성 자동화 - ARM Templates](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)
3. [애플리케이션 빌드 자동화 1 - Versioning](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)
4. [애플리케이션 빌드 자동화 2 - DNU Build](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)
5. **애플리케이션 테스트 자동화 1 - DNX Test**
6. [애플리케이션 테스트 자동화 2 - Chutzpah](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)
7. [애플리케이션 패키지 자동화 - DNU Publish](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)
8. [애플리케이션 배포 자동화 - MSDeploy/WAWSDeploy](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)
9. 데이터베이스 이전 자동화 1 - KUDU
10. 데이터베이스 이전 자동화 2 - Azure Functions

[지난 포스트](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)까지 우리는Auzre에 리소스를 생성하고, 애플리케이션을 빌드하는 방법까지 살펴보았다. 여기까지 하면 Continuous Build 단계까지가 완성이 된 셈이다. 이제 Continuous Integration을 위한 테스트 자동화에 대해 다룰 차례인데, 이 포스트에서는 C#으로 작성한 ASP.NET Core 애플리케이션을 커맨드 프롬프트 상에서 테스트하는 방법에 대해 알아보도록 한다.

> 관련 샘플 소스코드는 [https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample](https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample) 에서 확인할 수 있다.

웹 애플리케이션의 경우 테스트를 서버 사이드와 클라이언트 사이드 두 곳에서 모두 수행해야 하는데, 이 포스트는 서버 사이드 코드, 즉 C# 코드를 테스트하는 방법에 대해 알아보도록 하자. 기본적으로 ASP.NET Core 애플리케이션은 [`xUnit.net`](http://xunit.github.io)과 [`Moq`](http://www.moqthis.com)을 이용해서 테스트 코드를 작성하고, 이 테스트 코드는 `DNX`를 이용하여 확인하게 된다. 이미 [이전 포스트](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)에서 애플리케이션 빌드를 끝냈기 때문에, 여기서는 테스트를 수행하는 파워셸 스크립트를 작성하는 방법에 대해서만 언급하기로 한다.

우선 아래와 같이 DNVM 버전을 선택한다.

https://gist.github.com/justinyoo/e084f23590fc46857620a3fed9c7c50c

여기서 명심해야 할 부분은 이 애플리케이션이 돌아가는 환경에 대해서는 모두 테스트를 해 보아야 한다는 것이다. 즉 런타임 프레임워크를 `CLR`로 할 것인지 `Core CLR`로 할 것인지, 아키텍처를 `x86` 환경으로 할 것인지 아니면 `x64` 환경으로 할 것인지, 마지막으로 OS를 Windows와 Mac, 그리고 Linux 중 어느 것으로 할 것인지를 모두 고려해서 테스트를 돌려야 한다. 그렇지 않으면 특정 환경에서는 테스트가 모두 성공했지만, 다른 환경에서는 성공하지 않을 수도 있기 때문이다.

이렇게 런타임 프레임워크 버전을 선택했다면 이제 아래와 같이 테스트 프로젝트만 선택하여 테스트를 진행한다.

https://gist.github.com/justinyoo/23d7263b627909a5a191052c97e3f876

이렇게 테스트를 성공적으로 수행하고 나면 아래와 같은 화면을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/04/azure-devops-5-dnx-test-01.png)

지금까지 커맨드 프롬프트 창에서 `dnx test` 커맨드를 이용하여 테스트를 수행하는 방법에 대해 알아보았다. 앞서 언급했던 바와 같이 이 포스트는 서버 사이드 코드 테스트를 위한 것이고, [다음 포스트](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)에서 [Chutzpah](http://mmanela.github.io/chutzpah)라는 도구를 이용해 클라이언트 사이드에서의 테스트, 즉 자바스크립트 테스트를 이 빌드/테스트 파이프라인 안에서 한꺼번에 수행하는 방법에 대해 알아보도록 한다.
