---
title: "Mountebank를 이용한 애저 펑션 통합 테스팅"
date: "2019-08-07"
slug: azure-functions-integration-testing-with-mountebank
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- Azure Functions
- Availability Check
- Health Check
- Unit Test
- Integration Test
- Mountebank
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/07/mountebank-integration-testing-00.png
---

[애저 펑션](https://azure.microsoft.com/ko-kr/services/functions/)이 지난 5월부터 공식적으로 [의존성 주입 기능을 지원](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-dotnet-dependency-injection)한 이후로 단위테스팅 부분은 이제 더이상의 [꼼수 없이 자연스럽게 진행할 수 있게 되었다](https://blog.aliencube.org/ko/2019/02/22/revising-dependency-injections-on-azure-functions-v2/). 하지만 애저 펑션 자체의 엔드포인트를 테스트한다거나, 애저 펑션이 참조하는 외부 API 의존성은 어떻게 테스트해야 할까? 이 포스트에서는 [Mountebank](http://www.mbtest.org/)라는 API 목킹 도구를 이용해서 애저 펑션 엔드포인트를 포함한 통합테스팅을 구현해 보기로 한다.

> 이 포스트에서 쓰인 샘플 코드는 [이 깃헙 리포지토리](https://github.com/devkimchi/Mountebank-Integration-Testing)에서 다운로드 받을 수 있다.

## 시스템 고수준 아키텍처

지금 개발하려고 하는 애저 펑션은 외부 API를 통해 필요한 데이터를 호출한다. 따라서, 내가 만드는 애저 펑션의 가용성 체크 엔드포인트를 통해 외부 API의 가용성 체크도 동시에 진행할 예정이다. 아래 그림은 이러한 시나리오를 바탕으로 한 고수준의 아키텍처를 표현한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/mountebank-integration-testing-01.png)

그림에서 보다시피 내가 개발하는 애저 펑션은 `https://fncapp-mountebank/api/ping`이라는 엔드포인트가 있고, 이를 통해 `https://fncapp-one-api/api/ping`를 호출해서 외부 API의 가용성 체크를 동시에 진행한다.

## 엔드포인트 구현

가용성 체크 엔드포인트인 [`HealthCheckHttpTrigger`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/src/FunctionApp/HealthCheckHttpTrigger.cs)는 비즈니스 로직이 많지 않으므로 금방 아래와 같이 구현할 수 있다. 편의상 다른 부분은 생략하고 필요한 부분만 표현한다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=health-check-http-trigger.cs

그리고 이 엔드포인트의 실제 로직이 담긴 [`HealthCheckFunction`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/src/FunctionApp/Functions/HealthCheckFunction.cs) 클라스는 아래와 같이 구현한다. 이 클라스에서는 외부 API의 가용성 체크 엔드포인트를 `HttpClient`를 통해 호출하고 그 결과를 반환한다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=health-check-function.cs

> 위 코드에서 보이는 `FunctionBase<ILogger>`, `IFunction<ILogger>`과 같은 베이스 클라스와 인터페이스는 [Aliencube.AzureFunctions.Extensions.DependencyInjection](https://github.com/aliencube/AzureFunctions.Extensions/blob/dev/docs/dependency-injection.md) 패키지에서 온 것이다.

여기까지 가용성 체크에 필요한 엔드포인트를 구현했다. 이제 이를 테스트하는 로직을 구현해 보도록 한다.

## 유닛테스트 작성

기본적인 유닛테스트는 `HealthCheckHttpTrigger`와 `HealthCheckFunction`에 대해 작성한다. 각각에 대응하는 [`HealthCheckHttpTriggerTests`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/test/FunctionApp.Tests/HealthCheckHttpTriggerTests.cs)와 [`HealthCheckFunctionTests`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/test/FunctionApp.Tests/Functions/HealthCheckFunctionTests.cs)는 아래와 같다. 여기서는 편의상 [MSTest](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest)를 사용한다.

### `HealthCheckHttpTriggerTests`

더 많은 테스트들이 있지만 여기서는 하나만 예를 들어 보자.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=unit-test-http-trigger.cs

위 코드에서 볼 수 있다시피 `IHealthCheckFunction` 의존성을 목킹해서 유닛테스트를 진행한 것을 볼 수 있다. 유닛테스트는 굳이 외부와 연결할 필요 없이 독자적으로 테스트가 가능해야 하므로 이런 형태의 목킹이 일반적이다.

### `HealthCheckFunctionTests`

이번엔 좀 더 깊이 들어간 비지니스 로직을 테스트해 보도록 하자. 실제 외부 API와 연결하는 로직이 들어있는 부분이다. 마찬가지로 편의상 하나만 예를 들어보았다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=unit-test-function.cs

위 코드에서는 `HttpClient`에 `FakeMessageHandler` 인스턴스를 주입해서 외부 API 호출 결과를 목킹한 것을 볼 수 있는데, 이와 같은 식으로 해서 직접적인 외부 API 호출 없이 유닛테스트를 구현했다. 그리고 이 유닛테스트를 아래 명령어를 통해 실행시켜보자.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=unit-test-dotnet-cli.sh

이 실행 결과는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/mountebank-integration-testing-02.png)

유닛테스트가 성공적으로 실행되었다.

> 화면에 보이는 명령어의 맨 마지막 `--filter:"TestCategory!=Integration&TestCategory!=E2E"` 옵션은 잠시 후에 별도로 설명하기로 한다.

## 통합테스트 작성

유닛테스트는 펑션 앱의 외부 자원과 직접적인 연결 없이도 실행할 수 있어야 하는 반면, 통합테스트는 그렇지 않다. 외부 자원과 연결을 해야 하거나, 적어도 외부 자원의 실행 결과를 내가 관리할 수 있어야 한다. 통합테스트 환경에서는 외부 API 호출을 할 경우, 해당 API 호출 로직에 대한 목킹 없이 그대로 사용한다. 즉, 유닛테스팅에서는 내가 개발한 로직을 검증했다면, 통합테스팅에서는 실제 엔드포인트를 테스트한다. 물론, 이 엔드포인트를 관리 가능한 환경에서 호출하고 그 결과를 예측할 수 있게 해야 한다. 이를 위해서는 몇가지 추가적인 절차가 필요하다.

### Mountebank 설정

다른 여러 가지 유용한 도구들도 있겠지만 여기서는 [Mountebank](http://www.mbtest.org/)라는 크로스 플랫폼 오픈 소스 API 목킹 도구를 사용한다. 이를 사용하기 위해서는 아래와 같이 npm 패키지를 설치한다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=install-mountebank.sh

그리고 이를 실행시키려면 아래와 같은 명령어를 실행시키면 된다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=run-mountebank.sh

참 쉽죠?

이 도구에 대한 더 자세한 내용은 [Mountebank 시작하기](http://www.mbtest.org/docs/gettingStarted) 페이지를 참조한다. 여기서는 이 도구를 직접 사용하는 대신 .NET 래퍼인 [MbDotNet](https://github.com/mattherman/MbDotNet)을 사용한다. MbDotNet 사용법은 [이 문서](https://github.com/mattherman/MbDotNet/wiki/Usage-Examples-(v4))를 참조한다.

### 통합테스트 작성

통합테스트 코드 역시도 별반 다르지 않다. 위에 소개한 `MbDotNet`를 이용해서 외부 API 결과값을 목킹하는 코드이다. 전체 코드는 [`HealthCheckHttpTriggerTests`](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/test/FunctionApp.Tests/HealthCheckHttpTriggerTests.cs)에서 확인할 수 있다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-http-trigger.cs

위 코드는 실제 애저 펑션의 가용성 체크 엔드포인트를 호출해서 결과를 확인하는 것이다. 각 테스트 메소드를 보면 `TestCategory`라는 데코레이터가 보인다. 이것은 잠시 후에 설명하도록 하고, 여기서 주목해야 할 부분이 바로 `LocalhostServerFixture` 클라스인데, 이 클라스의 구현을 확인해 보자.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=mountebank-server-fixture.cs

`GetHealthCheckUrl` 메소드는 내부적으로 `Mountebank` 서버에 `8080` 포트로 외부 API 결과값을 목킹하고, 애저 펑션의 가용성 체크 URL을 반환한다. 즉 이 통합테스트의 전체적인 과정을 아래와 같은 그림으로 표현할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/mountebank-integration-testing-03.png)

### 통합테스트 실행

이제 통합테스트를 실행시킬 차례이다. 위 테스트 코드에서 확인했다시피, 이 테스트가 동작하려면 애저 펑션 엔드포인트가 실행 가능한 상태여야 한다. 또한, 외부 API 동작을 정의하기 위해 Mountebank 서버가 동작하고 있어야 한다. 이를 위해 다음 명령어를 실행시킨다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=run-services-1.sh

위 명령어는 콘솔 백그라운드에서 Mountebank 서버와 애저 펑션 서비스 런타임을 실행시키는 것이다. 만약 별도의 콘솔창에서 각자 따로 구동시키고 싶다면 개별 콘솔에서 각각 명령어를 아래와 같이 실행시키면 된다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=run-services-2.sh

위와 같이 별도의 콘솔창에서 명령어를 실행시켰다면 아래와 같은 모양이 될 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/mountebank-integration-testing-04.png)

여기까지 잘 됐다면, 이제 통합테스트 코드를 실행시킬 차례이다. 또다른 콘솔 창에서 아래 명령어를 통해 통합테스트를 실행시켜 보자.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-dotnet-cli.sh

위 명령어를 보면 맨 마지막 옵션에 `--filter:"TestCategory=Integration"`가 보인다. 앞서 테스트 메소드에 `TestCategory`라는 데코레이터를 붙였던 것이 기억날 것이다. 즉, 이번 테스트 명령어는 `TestCategory` 값이 `Integration`이라고 설정되어 있는 것만 골라 테스트를 실행시키라는 의미이다. 이렇게 실행시킨 통합테스트 결과는 아래 그램과 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/mountebank-integration-testing-05.png)

> 만약 이 `--filter` 관련해서 좀 더 알아보고 싶다면 [이 문서](https://docs.microsoft.com/ko-kr/dotnet/core/testing/selective-unit-tests)와 [이 문서](https://github.com/microsoft/vstest-docs/blob/master/docs/filter.md)를 읽어보는 것이 좋다.

아래 비디오 클립은 별도의 필터 없이 모든 테스트 케이스를 한 번에 실행시키는 모습이다.

https://www.youtube.com/embed/R-Uw3nkPKvo

* * *

지금까지 애저 펑션 인스턴스를 로컬에서 유닛테스트와 통합테스트 모두 실행시킬 수 있는 방법에 대해 알아 보았다. 통합테스트를 위해서는 먼저 로컬에 외부 API를 목킹할 수 있는 환경이 설치되어야 하고, 또한 테스트 전에 애저 펑션 인스턴스가 로컬에서 작동하고 있어야 한다는 점을 잊지 않는다면, 어렵지 않게 테스트를 수행할 수 있을 것이다.

또한 이 포스트에서는 비지니스 로직을 먼저 구현하고 그 이후 유닛테스팅 코드와 통합테스팅 코드를 작성하는 것 처럼 보이지만, TDD 혹은 BDD 방법론을 사용한다면 테스트 코드를 작성하는 것과 동시에 비지니스 로직이 완성되는 것을 알고 있을 것이다.

다음 포스트에서는 여기서 조금 더 나아가 종단간 테스팅까지 실행시켜 보기로 하고 이를 애저 데브옵스 파이프라인에 통합시켜 모든 테스트를 통과시켜 보기로 하자.

## 더 읽어보기

- [.NET 애저 펑션에서 종속성 주입 사용](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-dotnet-dependency-injection)
- [MSTest 및 .NET Core를 사용한 C# 유닛 테스트](https://docs.microsoft.com/ko-kr/dotnet/core/testing/unit-testing-with-mstest)
- [선택적 단위 테스트 실행](https://docs.microsoft.com/ko-kr/dotnet/core/testing/selective-unit-tests)
- [TestCase filter](https://github.com/microsoft/vstest-docs/blob/master/docs/filter.md)
- [Aliencube.AzureFunctions.Extensions.DependencyInjection](https://github.com/aliencube/AzureFunctions.Extensions/blob/dev/docs/dependency-injection.md)
- [Mountebank](http://www.mbtest.org/)
- [Mountebank npm 패키지](https://www.npmjs.com/package/mountebank)
- [MbDotNet](https://github.com/mattherman/MbDotNet)
- [MbDotNet 사용법 v4](https://github.com/mattherman/MbDotNet/wiki/Usage-Examples-(v4))
