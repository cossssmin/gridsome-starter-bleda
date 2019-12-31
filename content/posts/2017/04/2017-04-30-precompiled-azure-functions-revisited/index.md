---
title: "Azure Functions 프리컴파일링 자세히 보기"
date: "2017-04-30"
slug: precompiled-azure-functions-revisited
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure Functions
- CQRS Pattern
- Precompiling
- Web API
fullscreen: false
cover: ""
---

지난 2016년 12월 초에 애저 펑션과 관련한 [Visual Studio (VS) 툴링 프리뷰 버전을 공개](https://blogs.msdn.microsoft.com/webdev/2016/12/01/visual-studio-tools-for-azure-functions/)했다. 하지만 설치 안하는 것이 차라리 나을 만큼 버그도 많을 뿐더러, 현재 [로드맵](https://blogs.msdn.microsoft.com/webdev/2017/04/14/azure-functions-tools-roadmap/)에서는 .NET Standard 2.0 을 기다리고 있는 중이라고 한다. 그래서 기다리다 못한 애저 웹 서비스 팀에서 [애저 펑션과 관련한 포스트](https://blogs.msdn.microsoft.com/appserviceteam/2017/03/16/publishing-a-net-class-library-as-a-function-app/)를 하나 올렸다. 이를 이용하면 기존의 웹 앱 프로젝트에서도 애저 펑션을 돌릴 수 있다. 처음 설정할 때 굉장히 손이 많이 가긴 하지만, 현재 VS의 모든 기능을 이용할 수 있는 유일한 방법이기 때문에 그래도 잘만 활용하면 굉장히 유용한 방법이라고 할 수 있겠다.

그런데, 저 포스트만 보고 따라가자면 딱히 친절하지 않은 설명 (혹은 개발자가 어느 정도는 알고 있다는 가정 아래 진행하는 설명) 덕분에 굉장히 혼란스러운 상황이 발생할 수가 있다. 따라서, 이 포스트에서는 원문에서 놓치고 있는 몇가지를 짚어보는 것과 동시에 좀 더 자세히 프리컴파일링 애저 펑션에 대해 알아보도록 한다.

> 이 포스트에 쓰인 샘플 코드는 [이곳](https://github.com/devkimchi/Precompiled-Azure-Functions-Revisited)에서 확인할 수 있다.

참고로:

- 이 포스트에서는 VS2015를 사용했다. VS2017에서도 동일하게 적용시키면 된다.
- 애저 펑션은 기본적으로 .NET 프레임워크 4.6 버전을 기반으로 동작하기 때문에 프리 컴파일에 쓰이는 .NET 프레임워크 역시도 반드시 4.6 버전을 사용해야 한다.

## 애저 펑션 프리컴파일링

애저 펑션을 미리 .dll 파일로 컴파일해서 사용하게 되면, 여러 잇점이 있다.

1. 인텔리센스를 포함한 VS의 모든 기능을 활용할 수 있다.
2. 단위 테스트 코드 작성이 쉽다.
3. 기존 빌드 서버에 쉽게 붙여서 CI/CD 파이프라인을 구축하기 쉽다.
4. 기존 코드베이스를 거의 수정 없이 그대로 이전할 수 있다.
5. 별도의 `project.json` 파일을 이용한 NuGet 패키지 관리를 하지 않아도 된다.

물론 단점도 있지만, 여기선 애저 펑션 만세를 외치는 포스트이니만큼 단점은 덮고 가자 (...) 이 포스트를 다 읽고 난 후 실제로 애저 펑션을 만들어 보면 앞으로는 당신도 애저 펑션 전문가!

## 상품 추가 및 조회 Web API

여기서 만들어 볼 시나리오는 상품 데이터베이스에 상품 목록을 추가하고 조회하는 Web API 엔드포인트를 만드는 것이다. 물론, 좀 더 힙한 느낌을 위해 애저 스토리지 큐를 이용해서 CQRS 패턴도 흉내내 보도록 하자.

### 엔티티 프레임워크 코드 우선 방식

우선, 데이터베이스와 통신하기 위해 엔티티 프레임워크 코드 우선 방식을 적용해 본다. 아주 간단한 상품 테이블과 그걸 둘러싼 `DbContext` 클라스이다.

https://gist.github.com/justinyoo/2e0fb0479e89d2f09d234d764dd314ba

https://gist.github.com/justinyoo/30397ecc28e432a2331b71d8b03cea65

### API 요청/응답 모델 객체

데이터베이스 객체를 노출하기 보다는 API 요청/응답을 위한 별도 데이터 수송 객체를 만드는 것이 좋으므로, 간단하게 `ProductModel.cs`를 아래와 같이 구현한다.

https://gist.github.com/justinyoo/7fbfa962bbb08edbbf5aa14ebce52a7d

### 서비스 레이어

Web API 콘트롤러에서 호출하는 서비스 레이어 클라스를 아래와 같이 작성한다. 애저 펑션에서는 콘트롤러/액션 개념이 없으므로, 펑션의 `Run` 메소드에서 직접 이 서비스 레이어 인스턴스를 호출한다.

https://gist.github.com/justinyoo/46eb2ea35eb4e4cd4d453751cbd70f72

여기까지는 기존의 Web API를 개발하는 방식과 별반 차이가 없다. 이제 실제로 펑션 코드를 작성해 보도록 하자.

## 애저 펑션 프로젝트 생성

애저 펑션은 기본적으로 애저 웹 앱 위에서 돌아가기 때문에, VS에서도 마찬가지로 비어있는 웹 앱 프로젝트를 이용해서 만들면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-01.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-02.png)

이렇게 만들어진 빈 웹 앱 프로젝트에는 정말로 아무것도 없다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-03.png)

여기에 애저 펑션이 작동하는 데 필요한 NuGet 패키지를 아래와 같이 설치한다.

- [`Microsoft.Azure.WebJobs.Extensions`](https://www.nuget.org/packages/Microsoft.Azure.WebJobs.Extensions/)
- [`Microsoft ASP.NET Web API 2.2 Core Libraries`](https://www.nuget.org/packages/Microsoft.AspNet.WebApi.Core/)

그리고, 이 포스트에 필요한 데이터베이스 기능을 위해 아래 NuGet 패키지를 추가로 설치한다.

- [`Json.NET`](https://www.nuget.org/packages/Newtonsoft.Json/)
- [`EntityFramework`](https://www.nuget.org/packages/EntityFramework/)

여기까지 해서 애저 펑션 코드 개발을 위한 기본적인 프로젝트 작업은 끝났다. 이제 실제 코드를 작성해 보도록 하자.

## 애저 펑션 코드 작성

애저 펑션은 웹 앱의 폴더 하나가 하나의 펑션으로 작동하기 때문에 아래와 같이 폴더를 만들고 그 안에 `function.json` 파일을 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-04.png)

- `AddProductHttpTrigger`: 웹 API로 POST 요청을 받아 애저 스토리지 큐로 요청을 전달하고 자신은 202 (Accepted) 응답 코드를 반환한다.
- `AddProductQueueTrigger`: 웹 API가 애저 스토리지 큐로 전달한 요청을 큐에서 받아 데이터베이스에 입력한다.
- `GetProductHttpTrigger`: 웹 API로 GET 요청을 받아 상품 정보를 반환한다.

실제 상품 정보 생성과 관련한 데이터 처리 프로세스는 아래 도식과 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-17.png)

그렇다면 `function.json` 파일 안에는 어떤 내용이 들어갈까? 가장 쉬운 방법은 애저 펑션 인스턴스를 하나 생성하고 그 안에 펑션 코드를 작성해 보는 것이다. 어떤 내용이 들어갈지는 아래에서 자세하게 다뤄본다.

### AddProductHttpTrigger

애저 포탈에서 HTTP Trigger 펑션 코드를 하나 생성하면 아래와 같은 폴더 구조가 생긴다. 여기서 `function.json` 파일의 내용은 대략 아래와 같다.

https://gist.github.com/justinyoo/2d3a1814a10e3ec9ec2c26ba610f6a25

인풋 바인딩 타입은 `httpTrigger`, 아웃풋 바인딩 타입은 `http`인 것을 볼 수 있는데, 이 내용을 그대로 복사해서 VS 안의 `function.json`에 복사해 넣는다. 그리고 `queue` 아웃풋 바인딩을 아래와 같이 하나 더 추가한다.

https://gist.github.com/justinyoo/a31290005d5ab728af9875585c78127a

이제 VS에서 `AddProductHttpTrigger.cs` 파일을 아래와 같이 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-05.png)

애저 포탈에서 `Run.csx` 코드를 그대로 복사해서 붙여넣고 아래와 같이 살짝 수정해 보자.

https://gist.github.com/justinyoo/aba113838ded074dea58cd9b56114890

기존의 펑션 코드와 다른 점을 확인할 수 있는가?

1. 펑션 코드에서 사용하던 `#r` 디렉티브가 없다. 당연하게도 스크립트 방식이 아닌 컴파일 방식이기 때문에 기존 C# 코딩의 컨벤션을 따라가면 된다.
2. 네임스페이스 및 클라스 선언이 생겼다. 스크립트 방식에서는 펑션 코드 실행 메소드인 `Run`을 위해 네임스페이스 및 클라스 정의를 사용할 수 없다.
3. 요청 객체의 바디를 그대로 문자열로 읽어서 큐로 전송한다.
4. 그리고 동시에 HTTP 상태코드로 202 (Accepted)를 반환한다. 이 펑션이 직접 데이터 처리를 하지 않는 비동기 방식이기 때문에 200 (OK) 코드 보다는 202 (Accepted) 코드가 적절하다.

이렇게 상품정보 생성을 위한 API를 작성했다. 이것은 CQRS의 C, 즉 커맨드에 해당하는 부분이다.

### AddProductQueueTrigger

애저 포탈에서 Queue Trigger 펑션 코드를 하나 생성하면 아래와 같은 `function.json`를 볼 수 있다.

https://gist.github.com/justinyoo/8010ad32997492217bb4521c25d84de8

인풋 바인딩 타입으로 `queueTrigger`가 설정된 것을 볼 수 있다. 이를 그대로 복사해서 VS 안의 `function.json`에 복사해 넣는다. 그리고 `AddProductQueueTrigger.cs` 파일을 아래와 같이 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-06.png)

애저 포탈에서 생성한 `Run.csx` 코드를 그대로 복사해서 붙여넣고 아래와 같이 수정한다.

https://gist.github.com/justinyoo/48428097739603197cb81816f720d8e9

이 펑션에서 실제로 상품 정보를 입력하는 동작을 수행하게 되는데, 몇가지를 짚어보도록 하자.

1. 일반적인 웹 앱에서 데이터베이스 커넥션 스트링을 위해 `Web.config`를 참조하는데 비해 애저 펑션에서는 그 기능이 제한되어 있으므로 애저 포탈의 App Settings 블레이드에 있는 내용을 참조해야 한다. 그럼에도 불구하고 실제 코드는 동일하게 `ConfigurationManager.ConnectionStrings["이름"].ConnectionString`이다.
2. 앞서 작성한 `DbContext` 인스턴스 및 서비스 레이어 인스턴스를 생성하고 사용한다. 여기서 해당 인스턴스 생성과 관련해 의존성을 고려한다면 서비스 로케이터 패턴을 검토한다. 이와 관련해서는 [Testing Precompiled Azure Functions](https://blog.kloud.com.au/2017/01/20/testing-precompiled-azure-functions/) 포스트를 참조한다. 아직 한국어 버전의 포스트를 작성하지 않았지만, 분량이 짧고 코드 위주로 설명하고 있어서 크게 어려움은 없을 것이다.

이제 상품 정보 생성과 관련한 펑션 코드는 모두 작성했다.

### GetProductHttpTrigger

애저 포털에서 앞서 생성한 HTTP Trigger 펑션의 `function.json` 내용을 그대로 복사해서 VS의 `function.json`에 붙여 넣는다.

https://gist.github.com/justinyoo/6e0d201f987b7fdb008c2f5a6196a106

그리고, 아래와 같이 `GetProductHttpTrigger.cs` 파일을 생성한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-07.png)

아래는 실제 코드의 내용이다.

https://gist.github.com/justinyoo/ec58468adb190e94621e73f463e3bc31

마찬가지로 몇가지를 짚어보도록 하자.

1. GET 요청에 응답하기 때문에 쿼리스트링에서 `id`를 검색해서 이를 `ProductId` 값으로 활용한다.
2. 앞서와 같이 `DbContext` 인스턴스와 서비스 레이어 인스턴스를 생성하고 사용한다.
3. 상품 정보와 HTTP 상태코드 200을 함께 반환한다.

이렇게 상품정보 조회를 위한 API를 작성했다. 이것은 CQRS의 Q, 즉 쿼리에 해당하는 부분이다.

지금까지 펑션 코드를 작성해 보았다. 이렇게 작성한 코드는 아래 추가적인 설정을 이용하면 VS에서 제공하는 동일한 개발 경험으로 로컬 개발 환경에서 아주 손쉽게 디버깅이 가능하다.

## 애저 펑션 디버깅 환경 구성

애저 펑션의 로컬 디버깅 환경 구성을 위해서는 VS 이외에 아래와 같은 두가지 도구가 추가적으로 필요하다.

- [Azure Functions CLI](https://www.npmjs.com/package/azure-functions-cli)
- [Azure Storage Emulator](https://docs.microsoft.com/en-us/azure/storage/storage-use-emulator)

애저 펑션 CLI는 `npm install --global azure-functions-cli` 명령어를 통해 설치할 수 있다. 설치가 끝났다면 VS의 프로젝트 속성을 참조한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-08.png)

`Web` 탭으로 이동해서 아래와 같이 필요한 내용을 수정한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-09.png)

이 웹 앱 프로젝트를 디버깅할 때 Azure Functions CLI를 이용한다고 설정하는 것인데, 몇가지 유념해 두어야 할 사항이 있다.

- `node.js`를 설치한 경로가 다를 수 있다.
    
    - 만약 [`https://nodejs.org`](https://nodejs.org/en/download/)에서 다운로드 받았다면 애저 펑션 CLI의 경로는 `C:\Users\[USERNAME]\AppData\Roaming\npm\node_modules\azure-functions-cli\bin\func.exe`가 될 것이다.
    - 만약 [NVM](https://github.com/coreybutler/nvm-windows)을 이용해 설치했다면 애저 펑션 CLI의 경로는 `C:\Program Files\nodejs\node_modules\azure-functions-cli\bin\func.exe`가 될 것이다.
- WebJobs 호스트를 로컬 환경에서 실행시켜야 하므로 `host start` 파라미터를 `Command line arguments` 값에 대입한다.
- `Working directory` 값은 현재 애저 펑션 코드가 있는 웹 앱 프로젝트를 지정한다.

> 안타깝게도, `%`를 이용한 환경 변수 값을 여기서는 사용할 수 없다. 따라서, 절대 경로를 지정해야 한다. 일해라 MS!

마지막으로 두 개의 `.json` 파일을 추가한다. 하나는 `appsettings.json`이고 다른 하나는 `host.json` 파일이다. 별다른 설정이 없는 한 `host.json` 파일에는 아무런 내용이 없다. 다만, `appsettings.json` 파일에 몇가지 추가해야 할 내용이 있는데 아래와 같다.

https://gist.github.com/justinyoo/b1863036eab461110b3e7d2bef9c7724

위 설정에서 보는 바와 같이 애저 스토리지 에뮬레이터를 사용하기 위해 `UseDevelopmentStorage=true` 값을 지정했다. 그리고, 데이터베이스 커넥션 스트링을 이곳에 지정한 것을 확인할 수 있다. 이 값이 실제 애저 펑션에서 사용하는 값이다.

지금까지 로컬 디버깅 환경 구성도 끝마쳤다. 실제로 디버깅을 해보도록 하자. 웹 앱을 시작 프로젝트로 구성한 후 `F5` 키를 눌러 디버깅 모드로 들어가면 아래와 같은 커맨드 프롬프트 창을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-10.png)

이제 Postman과 같은 REST API 테스트 도구를 이용해 실제로 로컬 애저 펑션을 호출해 보자 위 그림에서 보는 바와 같이 상품 정보 생성을 위한 API 엔드포인트는 `http://localhost:7071/api/AddProductHttpTrigger`이므로 해당 엔드포인트를 이용해 요청을 아래와 같이 보내보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-11.png)

그러면 VS에서 디버깅 브레이크 포인트를 걸어놓은 곳에서 아래와 같이 멈출 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-12.png)

기존의 VS 개발 환경에서 누리던 개발 경험을 그대로 이용할 수 있다. 이제 지금까지 개발한 애플리케이션을 애저 펑션으로 배포할 차례이다.

## 애저 펑션 배포

지금까지 개발한 애저 펑션은 기본적으로 웹 앱 프로젝트를 기반으로 개발했기 때문에, 웹 앱 프로젝트를 VS에서 배포할 때의 개발 경험을 그대로 유지한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-13.png)

아래와 같이 직접 애저 웹 앱을 선택할 수도 있고,

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-14.png)

아니면 아래와 같이 퍼블리시 프로필을 다운로드 받아서 사용할 수도 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-15.png)

이렇게 배포를 마치고 나면 애저 포탈에서 펑션 코드가 제대로 설치된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-16.png)

실제로 `AddProductHttpTrigger` 펑션의 엔드포인트 URL로 POST 요청을 날려보자. 앞서 언급한 프로세스를 타고 데이터가 흘러갈 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-17.png)

애저 펑션의 로그와 데이터베이스 조회 결과는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-18.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-19.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/04/precompiled-azure-functions-revisited-20.png)

지금까지 애저 펑션을 프리컴파일 방식으로 기존의 웹 앱 프로젝트를 이용해서 개발 및 디버깅, 배포까지 하는 방법에 대해 알아보았다.
