---
title: "Azure DevOps 시리즈 #6 - Chutzpah"
date: "2016-04-29"
slug: azure-devops-6-chutzpah
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure
- DevOps
- JavaScript
- Chutzpah
- Test
fullscreen: false
cover: ""
---

> 이 포스트는 [Microsoft Azure](https://azure.microsoft.com)를 활용한 DevOps 시리즈입니다.

1. [배포 자동화를 위한 서비스 계정 생성 - Service Principal](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)
2. [애플리케이션 리소스 생성 자동화 - ARM Templates](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)
3. [애플리케이션 빌드 자동화 1 - Versioning](http://blog.aliencube.org/ko/2016/04/26/azure-devops-3-versioning)
4. [애플리케이션 빌드 자동화 2 - DNU Build](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)
5. [애플리케이션 테스트 자동화 1 - DNX Test](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)
6. **애플리케이션 테스트 자동화 2 - Chutzpah**
7. [애플리케이션 패키지 자동화 - DNU Publish](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)
8. [애플리케이션 배포 자동화 - MSDeploy/WAWSDeploy](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)
9. 데이터베이스 이전 자동화 1 - KUDU
10. 데이터베이스 이전 자동화 2 - Azure Functions

[지난 포스트](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)에서 우리는 서버 사이드 테스트 자동화에 대해 알아 보았다. 웹 애플리케이션의 경우 클라이언트 사이드의 테스트, 즉 자바스크립트 역시도 테스트를 해야 한다. 다양한 자바스크립트 테스트 라이브러리들 중에는 [QUnit](http://qunitjs.com/), [Jasmine](http://jasmine.github.io/), [Mocha](https://mochajs.org/), [Chai](http://chaijs.com/) 등이 있고, 이 테스트를 돌리기 위한 테스트 러너들도 다양해서 [Karma](https://karma-runner.github.io), [AVA](https://github.com/sindresorhus/ava), [Chutzpah](https://github.com/mmanela/chutzpah), [Wallaby](https://wallabyjs.com/) 등이 있다. 다양한 자바스크립트 테스트 프레임워크 및 테스트 러너들에 대해서는 [스택오버플로우의 이 글](http://stackoverflow.com/questions/300855/javascript-unit-test-tools-for-tdd)을 참고하도록 하자. 또한 [@haruair](https://twitter.com)님의 [커피 세 잔으로 BDD하기 – CoffeeScript, Mocha, Chai](http://haruair.com/blog/2621) 포스트를 읽어볼 것을 추천한다.

기본적으로 테스트 라이브러리를 이용해서 자바스크립트 테스트 코드를 작성하면 테스트 러너를 통해 테스트를 수행하게 되는데, 테스트 자동화를 위해서는 아무래도 테스트 러너가 필요할 것이다. 이 포스트에서는 앞서 언급한 테스트 러너들 중 Chutzpah(헛츠파)에 대해 알아보도록 한다.

> 관련 샘플 소스코드는 [https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample](https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample) 에서 확인할 수 있다.

## Chutzpah – Visual Studio, 테스트 러너

헛츠파는 다양한 자바스크립트 테스트 프레임워크를 지원하는 테스트 러너이다. 특히나 Visual Studio와 궁합이 잘 맞아서, 비주얼 스튜디오의 테스트 윈도우에서도 직접 확인이 가능하다. 헛츠파를 비주얼 스튜디오에 통합하기 위해서는 아래 두 익스텐션을 설치하면 된다.

- [Chutzpah Test Runner Context Menu Extension](https://visualstudiogallery.msdn.microsoft.com/71a4e9bd-f660-448f-bd92-f5a65d39b7f0)

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/04/azure-devops-6-chutzpah-01.png)

- [Chutzpah Test Adapter for the Test Explorer](https://visualstudiogallery.msdn.microsoft.com/f8741f04-bae4-4900-81c7-7c9bfb9ed1fe)

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/04/azure-devops-6-chutzpah-02.png)

또한 헛츠파는 테스트 러너를 NuGet 패키지 형태로도 제공하고 있다. 아래 링크를 이용해서 원하는 테스트 프로젝트에 설치하면 된다.

- [Chutzpah - A JavaScript Test Runner](https://www.nuget.org/packages/Chutzpah)

## Chutzpah – 테스트 자동화 스크립트 작성

이렇게 설치가 끝났다면 이제 실제로 테스트 자동화 스크립트를 작성할 차례이다. 여기서는 테스트 라이브러리로 Jasmine을 사용한다고 가정하자. 그렇다면 테스트 자동화 스크립트는 대략 아래와 비슷하게 될 것이다.

https://gist.github.com/justinyoo/2e614ff450a138ace65f0ef706972a85

1. ASP.NET Core 애플리케이션에서는 NuGet 패키지가 프로젝트별로 저장되는 것이 아니라 사용자 프로필에 한꺼번에 통합되어 저장된다. 따라서, 첫번째와 같이 우선 헛츠파 러너의 위치를 찾아놓아야 한다.
2. 그 다음으로는 Jasmine을 설치하기 위한 npm용 `package.json` 파일이 있는 테스트 프로젝트를 찾는다.
3. 마지막으로 해당 프로젝트 아래의 모든 자바스크립트 파일을 찾아서 헛츠파로 테스트를 수행한다.

이렇게 한 후 커맨드라인에서 테스트를 수행하고 나면 아래와 같은 화면을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/04/azure-devops-6-chutzpah-03.png)

지금까지 헛츠파를 이용한 테스트 자동화를 확인해 보았다. 여기까지 하면 Continuous Integration이 완성된 것이다. [다음 포스트](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)에서는 여기서 더 나아가 Continuous Delivery를 위한 패키지 자동화에 대해 알아보도록 하자.
