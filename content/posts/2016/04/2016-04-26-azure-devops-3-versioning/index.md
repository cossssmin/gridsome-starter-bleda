---
title: "Azure DevOps 시리즈 #3 - Versioning"
date: "2016-04-26"
slug: azure-devops-3-versioning
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure
- DevOps
- ASP.NET Core
- Continuous Build
- Versioning
fullscreen: false
cover: ""
---

> 이 포스트는 [Microsoft Azure](https://azure.microsoft.com)를 활용한 DevOps 시리즈입니다.

1. [배포 자동화를 위한 서비스 계정 생성 - Service Principal](http://blog.aliencube.org/ko/2016/04/24/azure-devops-1-service-principal)
2. [애플리케이션 리소스 생성 자동화 - ARM Templates](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)
3. **애플리케이션 빌드 자동화 1 - Versioning**
4. [애플리케이션 빌드 자동화 2 - DNU Build](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)
5. [애플리케이션 테스트 자동화 1 - DNX Test](http://blog.aliencube.org/ko/2016/04/28/azure-devops-5-dnx-test)
6. [애플리케이션 테스트 자동화 2 - Chutzpah](http://blog.aliencube.org/ko/2016/04/29/azure-devops-6-chutzpah)
7. [애플리케이션 패키지 자동화 - DNU Publish](http://blog.aliencube.org/ko/2016/04/30/azure-devops-7-dnu-publish)
8. [애플리케이션 배포 자동화 - MSDeploy/WAWSDeploy](http://blog.aliencube.org/ko/2016/05/01/azure-devops-8-msdeploy-wawsdeploy)
9. 데이터베이스 이전 자동화 1 - KUDU
10. 데이터베이스 이전 자동화 2 - Azure Functions

[지난 포스트](http://blog.aliencube.org/ko/2016/04/24/azure-devops-2-arm-templates)에서는 ARM 템플릿을 이용해서 리소스들을 자동으로 설치하는 방법에 대해 알아보았다. 이제 실제로 애플리케이션을 Azure Web App에 배포해야 하는데, 배포 전에 반드시 수행해야 할 작업들이 빌드, 테스트, 패키징 등이 있다. 일반적으로 빌드 서버에서 이런 작업들이 이루어지면서 매번 빌드할 때 마다 빌드 번호를 부여받는다. 이 포스트에서는 이 빌드 번호를 애플리케이션의 버저닝에 포함시키는 스크립트를 작성해 보도록 한다.

> 관련 샘플 소스코드는 [https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample](https://github.com/devkimchi/ASP.NET-Core-DevOps-Sample) 에서 확인할 수 있다.

각각의 프로젝트에 있는 `project.json` 파일은 일종의 메타 데이타 파일로, 이전의 `packages.config` 파일과 `.nuspec` 파일의 역할을 담당한다고 볼 수 있다. 애플리케이션 프로젝트의 경우에는 좀 더 많은 내용들을 다룰 수 있는데, `prebuild`, `postbuild`, `prepublish`, `postpublish` 등의 매크로를 수행할 수도 있고, 각종 npm 모듈들을 실행시킬 수도 있다. `project.json` 파일 덕분에 ASP.NET Core 라이브러리는 그 자체로 NuGet 패키지가 될 수 있다. 이 때 참조하는 속성이 바로 `version`이다. 즉, 패키징시 이 `version` 값을 바탕으로 패키지 버저닝을 하게 된다.

우선 `project.json` 파일이 있는 모든 프로젝트 파일을 찾는다.

https://gist.github.com/justinyoo/4aba5a62e6e46e5cfa8109e0e024effa

여기서 굳이 `.\src` 폴더만 확인하는 이유는 테스트 프로젝트는 버저닝이 필요없기 때문이다. 또한, `.\src` 폴더 아래에 ASP.NET Core 라이브러리 프로젝트와 상관 없는 프로젝트는 굳이 버저닝이 필요하지 않기 때문에 제외시켰다. 이렇게 필요한 모든 프로젝트 폴더 정보를 가져왔으면 아래와 같은 스크립트를 실행시켜 버저닝을 마무리한다.

https://gist.github.com/justinyoo/e4355510c15aa8a9c0c9339bfb05b415

현재 빌드넘버가 10이라고 가정한다면, 위에서 구한 모든 프로젝트를 루프에 넣고 돌려서 `project.json` 파일을 읽어들인 후, 버전 넘버에 빌드 넘버를 통합한 후 다시 `project.json` 파일로 저장시키는 과정을 확인할 수 있다. 일반적인 semantic 버저닝의 경우 맨 마지막 숫자가 빌드 넘버에 해당하기 때문에 정규식을 통해 맨 마지막 숫자 부분을 바꿔치기 한 것도 확인이 가능하다.

위 스크립트를 실행시킨 후 각각의 `project.json` 파일을 다시 열어 보면 빌드 넘버가 제대로 업데이트 된 것을 확인할 수 있다.

지금까지 버저닝에 대해 알아보았다. [다음 포스트](http://blog.aliencube.org/ko/2016/04/27/azure-devops-4-dnu-build)에서는 실제로 빌드를 돌리는 과정에 대해 알아보도록 하자.
