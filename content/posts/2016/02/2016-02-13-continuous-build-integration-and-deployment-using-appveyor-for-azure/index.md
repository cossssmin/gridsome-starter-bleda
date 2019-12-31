---
title: "AppVeyor를 이용하여 Azure에 지속적 통합 및 배포하기"
date: "2016-02-13"
slug: continuous-build-integration-and-deployment-using-appveyor-for-azure
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- AppVeyor
- asp-net-core
- Azure
- azure-website
- CB
- cd
- ci
- Continuous Build
- Continuous Delivery
- Continuous Deployment
- Continuous Integration
fullscreen: false
cover: ""
---

지난 포스트 [AppVeyor를 이용한 지속적인 통합, 빌드 및 배포](http://blog.aliencube.org/ko/2015/04/19/continuous-integration-build-and-delivery-using-appveyor)에서는 간단하게 [AppVeyor](https://appveyor.com)를 통해 소스코드를 빌드하고 테스트한 후 배포까지 하는 방법에 대해 알아보았다. 이 포스트는 그의 연장선 상에 있으며, 특히 ASP.NET Core 프레임워크로 만들어진 앱을 중심으로 좀 더 정리해 보도록 한다.

여기세 쓰인 소스코드는 아래에서 확인할 수 있다.

- [https://github.com/devkimchi/AppVeyor-Sample](https://github.com/devkimchi/AppVeyor-Sample)

## 빌드 셋업

먼저 AppVeyor 쪽에 프로젝트를 등록한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-01.png)

프로젝트를 등록하면 깃헙 쪽에는 아래와 같이 웹훅이 하나 생성된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-02.png)

프로젝트를 등록한 후 설정 화면으로 들어간다. 기본적인 사항은 [지난 포스트](http://blog.aliencube.org/ko/2015/04/19/continuous-integration-build-and-delivery-using-appveyor)를 참고하도록 하고 여기서는 ASP.NET Core 에 해당하는 부분만을 추가로 언급하도록 한다.

### `Environment` 탭

Operating System을 `Visual Studio 2015`로 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-03.png)

ASP.NET Core 부터는 .NET Version Manager (DNVM)를 통해 사용하고자 하는 닷넷 프레임워크를 설정할 수 있으므로 원하는 런타임 버전을 설치해야 한다. 아래와 같이 인스톨 스크립트를 이용해서 런타임 버전을 설치한다.

https://gist.github.com/justinyoo/8acae205e5bff37eb23d

여기서는 커맨드라인 명령어를 사용했으나, 편의에 따라서는 파워셸 스크립트를 이용할 수도 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-04.png)

> 참고: 이 글을 쓰는 현재 최신 런타임 버전은 `v1.0.0-rc2-16357`이다.

여기까지 다 했다면 잊지말고 꼭 `Save` 버튼을 눌러 저장하도록 한다. :-)

### `Build` 탭

앞서 설치한 DNVM 런타임 라이브러리를 이용해서 빌드를 진행하려면 아래와 같이 NuGet 패키지를 먼저 복원해야 한다.

https://gist.github.com/justinyoo/89b990757b4ac0efbb67

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-05.png)

일반적으로는 `dnu restore` 정도면 무난하다. 그런데, 경우에 따라서는 나이틀리 빌드 패키지를 받아와야 하는 경우도 있으므로 그를 위해 `-f https://www.myget.org/F/aspnet-contrib/api/v3/index.json`와 같이 폴백 옵션을 추가해 주는 것이 좋다.

잊지말고 `Save` 버튼을 꼭 눌러서 저장해 주도록 하자.

자, 이제 지속적인 빌드를 위한 준비는 끝났다. 실제로 빌드를 한 번 돌려보도록 하자. 빌드가 성공하면 아래와 같은 화면을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-06.png)

맨 아랫줄의 `Build success` 부분을 확인할 수 있다. 현재까지는 테스트를 붙이지 않았기 때문에 테스트 부분은 자동으로 통과했다. 이제 테스트를 붙여보도록 하자.

## 테스트 셋업

테스트 셋업을 위해 테스트 프로젝트를 리포지토리에 포함시킨다. 이후 AppVeyor에서 테스트 환경 설정을 해 주도록 하자.

### `Tests` 탭

여기서 사용한 테스트 프레임워크는 [xUnit.Net](https://xunit.github.io)인데, 역시 ASP.NET Core 환경에서는 `dnx test`라는 명령어를 통해 별도로 테스트를 수행시켜 주어야 한다.

https://gist.github.com/justinyoo/7f70bd592499351b81df

앞서 `Build` 탭에서도 `dnu restore -f ...` 명령어를 수행했는데, 테스트는 별도의 쓰레드에서 수행되므로 이를 다시 진행해야 한다. 다만 여기서는 전체 솔루션에 대한 패키지 리스토어를 하는 것이 아니라 오로지 테스트 프로젝트들에 대해서만 진행하면 되므로 `dnu restore test -f ...`와 같이 `test` 디렉토리를 명시적으로 지정한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-07.png)

이렇게 해서 테스트 설정이 끝났다. 다시 리포지토리 변경사항을 깃헙으로 푸시해서 실제로 테스트를 포함한 빌드가 성공하는지 확인해 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-08.png)

이제 테스트를 통과했고 모든 빌드도 성공한 것을 확인할 수 있다. 이제 이 빌드를 Azure 웹사이트로 설치하는 과정까지 진행해 보도록 하자.

## 디플로이 셋업

### `Build` 탭

Azure 웹사이트 디플로이를 위해서는 빌드시 아티팩트를 생성해야 한다. 따라서 위에 지정한 빌드 설정을 살짝 수정할 필요가 있다. 아래와 같이 수정을 해 보도록 하자.

https://gist.github.com/justinyoo/1f879b73e7d91974a1a6

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-09.png)

`dnu publish ...` 명령어를 추가했는데 이에 대한 간략한 설명은 아래와 같다.

- `"src\AppVeyorSample"`: 퍼블리시할 프로젝트 폴더명.
- `--out DeployPackage`: 패키지명. 다음에 설명할 `Artifacts` 탭에서 사용한다.
- `--configuration Release`: 빌드 설정.
- `--runtime dnx-clr-win-x86.1.0.0-rc1-update1`: 런타임 라이브러리 버전. `clr` 대신 `coreclr`로 바꿀 수 있고 `win` 대신 `mac` 또는 `linux`로 바꿀 수 있다. `x86` 대신 `x64`로 바꿀 수도 있다.
- `--wwwroot-out "wwwroot"`: 퍼블리시할 디렉토리명.
- `--quiet`: 콰이엇 모드.

### `Artifacts` 탭

앞서 퍼블리시 명령어에 있던 `--out DeployPackage` 옵션이 바로 이 아티팩트를 지정하는 것이다. 이 이름을 아래와 같이 지정한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-10.png)

### Azure 웹사이트 퍼블리시 프로파일 다운로드

이제 디플로이를 위해서는 퍼블리시 프로파일을 Azure 웹사이트에서 가져와야 한다. 먼저 Azure 포탈에 접속해서 해당 정보를 다운로드 받는다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-11.png)

위와 같이 Azure 포탈의 웹사이트에서 `Get publish profile` 링크를 클릭하면 `*.PublishSettings`라는 확장자를 갖는 XML 파일을 다운로드 받을 수 있다. 이 안에 우리가 필요한 모든 정보들이 다 들어있다. 이 파일 안에서 확인해야 할 내용은 다음과 같다.

- `publishUrl`: `<sitename>.scm.azurewebsites.net:443`
- `method`: `MSDeploy`
- `msdeploySite`: `<sitename>`
- `userName`: `$<sitename>`
- `userPWD`: `<encrypted password>`

여기서 `<sitename>`은 Azure 웹사이트 이름이다. `publishUrl`은 포트번호에서 알 수 있다시피 `HTTPS` 커넥션임을 명심하자. 또한 디플로이 핸들러 이름이 `MSDeploy`라는 것도 기억해 두도록 한다.

이제 AppVeyor의 `Deployment` 탭 설정을 시작하자.

### `Deployment` 탭

아래 그림과 같이 설정하도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-12.png)

- `Deployment Provider`: `Web Deploy`
- `Server`: `https://<sitename>.scm.azurewebsites.net:443/MSDeploy.axd?site=<sitename>`
- `Website name`: `<sitename>`
- `Username`: `$<sitename>`
- `Password`: `<encrypted password>`

그리고 아래 항목에 체크한다.

- `ASP.NET Core application`
- `Force restarting ASP.NET Core application on deploy`
- `Remove additional files at destination`
- `Take ASP.NET application offline during deployment`

이렇게 해서 디플로이 설정이 끝났다. 실제로 디플로이가 되는지 확인해 보도록 하자. 디플로이 이전의 웹사이트는 아래와 같았다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-13.png)

페이지를 수정하고 깃헙 리포지토리에 푸시하면 자동으로 빌드 및 배포를 시작한다. 결과는 아래와 같다. 테스트에 성공했고, `DeployPackage.zip` 파일이라는 디플로이 패키지를 생성했으며, 이를 Azure 웹사이트에 전송했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-14.png)

그리고, 바뀐 웹사이트는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/02/appveyor-15.png)

이렇게 해서 지금까지 AppVeyor를 이용해서 지속적인 빌드, 통합, 배포를 관리하고 이를 Azure 웹사이트에 적용시켜 보았다. 다음 포스트에서는 Azure 웹사이트 대신, 빌드 패키지를 깃헙으로 릴리즈하는 방법에 대해 알아보도록 한다.
