---
title: "애저 펑션을 위한 SRE 첫걸음"
date: "2019-08-14"
slug: azure-functions-sre-on-azure-devops-the-first-cut
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- sre
- devops
- azure-functions
- azure-devops
- azure-pipelines
- multi-stage
- unit-testing
- integration-testing
- end-to-end-testing
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-00.png
---

아마도 애자일 개발 방법론에서 얘기하는 "동작 뼈대 (Walking Skeleton)"에 대해 들어봤을 것이다. [Alistair Cockburn](http://alistair.cockburn.us/Walking+skeleton)은 이 "동작 뼈대"를 아래와 같이 정의한다.

> A Walking Skeleton is a tiny implementation of the system that performs a small end-to-end function. It need not use the final architecture, but it should link together the main architectural components. The architecture and the functionality can then evolve in parallel. "동작 뼈대"는 최소한의 종단간 기능을 수행하는 아주 작은 시스템의 구현체이다. 굳이 최종 아키텍처를 따를 필요까지는 없지만, 최소한 아키텍처상 주요 콤포넌트를 모두 연결해 놓아야 한다. 이후 아키텍처와 기능을 동시에 점차로 붙여나가게 된다.

이것은 DevOps 또는 SRE (Site Reliability Engineering; 사이트 신뢰성 엔지니어링) 관점에서 볼 때 아주 중요한데, 시스템과 이를 테스트하는 과정에서 우선 실패 (Fail Fast) 및 잦은 실패 (Fail Often)를 통해 시스템의 안정성을 확보하는 과정이라고 할 수 있기 때문이다.

위 인용문을 다른 식으로 해석을 해 보자면, 하드 코딩이건 어쨌건 일단 작동하는 시스템을 만들어 놓고 이를 전체 ALM 프로세스에 연동을 시켜야 한다는 것이 바로 이 "동작 뼈대"의 요지이다. 물론 여기에는 단위 테스트, 통합 테스트, 종단간 테스트 등이 들어있는 CI/CD 파이프라인 까지도 전체적으로 문제 없이 작동해야 하는 것 까지 포함한다. 일단 이렇게 해서 파이프라인 상에서 빌드와 배포까지 완벽하게 작동하는 "뼈대"를 만들어 놓은 후에, 점차로 "지속적인 개선 (Continuous Improvement)"을 통해 "살 (Flesh)"을 붙여나가는 것이 이 방법이 추구하는 것이기도 하다.

이 "동작 뼈대"를 위한 첫 관문이 다양한 테스트 환경에서 시스템을 안정적으로 돌리는 것이고, 이를 CI/CD 파이프라인 상에서 구현하는 것이다. 이 포스트에서는 애저 펑션으로 애플리케이션을 개발할 때 "동작 뼈대"를 만들어 보고 이를 애저 데브옵스를 통해 CI/CD 파이프라인을 구현함으로써, SRE의 첫 단계를 구성해 보기로 한다.

> 이 포스트에서 쓰인 예제 코드는 [이곳 깃헙 리포지토리](https://github.com/devkimchi/Mountebank-Integration-Testing)에서 다운로드 받을 수 있다.

## 시스템 구성

[지난 포스트](https://blog.aliencube.org/ko/2019/08/07/azure-functions-integration-testing-with-mountebank/)에서 이미 우리는 애저 펑션을 하나 개발했고, 이를 단위테스트, 통합테스트까지 수행했다. 아래 그림은 이 애저 펑션 API의 고수준 구성도이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-01.png)

## 단위테스트 및 통합테스트 구현

이미 지난 포스트에서 단위테스트와 통합테스트를 구현했다. 단위테스트는 애저 펑션의 의존성 주입 기능을 이용해서, 통합테스트는 [Mountebank](http://www.mbtest.org/)라는 API 목킹 도구를 이용해서 이미 구현하고 잘 작동했다.

다시 한 번 리뷰를 해 보자면, 단위테스트는 각 메소드 단위별로 제대로 작동하는지 여부를 체크하는 것으로서 외부 의존성 자체보다는 그 결과값만 있으면 되기 때문에 코드 수준에서 의존성 목킹을 한 후 테스트를 진행했다. 반면에 통합테스트는 외부 의존성 결과값을 목킹하기 위해 코드 수준이 아닌 API 수준에서 의존성 목킹을 하고 테스트를 진행했다.

## 종단간 테스트 구현

통합테스트를 위해서 애저 펑션 런타임을 로컬에서 실행시킨 후, 외부 API는 결과값을 목킹해서 사용했다면, 종단간 테스트는 실제로 애저 펑션 인스턴스에 설치한 후 `localhost`가 아닌 진짜 엔드포인트를 이용해서 테스트를 하는 것이다. 통합테스트와 동일한 코드를 사용하지만 실제로 존재하는 엔드포인트를 이용해 테스트를 하는 것이 다르다.

어떻게 하면 동일한 코드를 두 가지 상황에 동시에 사용할 수 있을까? 아래 코드를 잠시 들여다 보자. 통합테스트를 위해 우리는 `LocalhostServerFixture`를 이용했다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-http-trigger.cs

그리고 이 `LocalhostServerFixture`는 아래와 같이 생겼다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=mountebank-server-fixture.cs

즉, 이 테스트 코드는 통합테스트에서만 작동한다는 얘긴데, 동일한 코드를 종단간 테스트에서 사용하고자 한다면 `LocalhostServerFixture`를 다양한 시나리오에서 사용할 수 있게끔 리팩토링하는 것이 좋다.

### `ServerFixture`

여기서는 간단한 [팩토리 메소드 패턴](https://ko.wikipedia.org/wiki/팩토리_메서드_패턴)을 사용해서 리팩토링을 한 번 해 보도록 하자. 먼저 `ServerFixture` 클라스를 아래와 같이 작성한다. `CreateInstance(serverName)` 메소드는 입력 받은 `serverName` 값을 바탕으로 인스턴스를 생성해서 반환한다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=server-fixture.cs

이를 바탕으로 기존에 구현했던 `LocalhostServerFixture` 클라스를 리팩토링해 보자.

### `LocalhostServerFixture`

`LocalhostServerFixture` 클라스는 아래와 같이 `ServerFixture` 클라스를 상속받게끔 리팩토링한다. 그리고 기존에 작성했던 `GetHealthCheckUrl()` 메소드는 `override` 한정자를 추가해서 `ServerFixture` 클라스에서 선언한 메소드를 오버라이딩하게 한다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=localhost-server-fixture-revised.cs

이렇게 해서 `LocalhostServerFixture` 클라스는 리팩토링을 끝냈다. 이제 종단간 테스트를 위한 새 Fixture 클라스를 생성해 보자.

### `FunctionAppServerFixture`

아래와 같이 `FunctionAppServerFixture` 클라스를 생성한다. 역시 이 클라스도 `ServerFixture` 클라스를 상속 받는다. 그리고 오버라이딩한 `GetHealthCheckUrl` 메소드는 별다른 것 없이 실제 접속해야 하는 엔드포인트 URL만 반환하게 한다. 그리고, 해당 펑션 앱 엔드포인트 구성을 위한 정보는 환경 변수를 통해 전달 받는다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=functionapp-server-fixture.cs

이렇게 해서 종단간 테스트를 위한 `FunctionAppServerFixture` 클라스 구현도 끝났다. 이제 실제 테스트 코드를 리팩토링해 보자.

### `HealthCheckHttpTriggerTests`

기존 `HealthCheckHttpTriggerTests` 클라스의 `Init()` 메소드를 수정한다. 환경 변수로부터 `ServerName` 값을 전달 받아 이를 바탕으로 통합테스트용 `LocalhostServerFixture` 인스턴스를 생성할 수도 있고, `FunctionAppServerFixture` 인스턴스를 생성할 수도 있게끔 변경했다. 그리고, 종단간 테스트에 사용할 테스트 메소드에 `TestCategory("E2E")` 데코레이터를 추가했다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=health-check-http-trigger-tests-revised.cs

이렇게 해 놓으면 환경 변수를 어떻게 세팅해 놓는가에 따라 통합테스트를 수행할 수도 있고, 종단간 테스트를 수행할 수도 있다. 실제로 이를 로컬 개발 환경에서 실행시켜 보도록 하자.

## 통합테스트 실행

지난 포스트에서 이미 통합 테스트를 실행하기 위한 사전 작업에 대해 설명했으므로 별도의 설명은 생략한다. 곧바로 Mountebank 서버와 애저 펑션 로컬 런타임을 실행시키고 아래 테스트 명령어를 통해 통합테스트를 수행한다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-dotnet-cli.sh

그리고 그 결과는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-02.png)

## 종단간 테스트 실행

이번에는 로컬에서 종단간 테스트를 실행시켜 보도록 하자. 이를 위해서는 펑션 앱을 애저 인스턴스에 이미 배포해 놓았어야 한다. 이미 펑션 앱이 배포되었다고 가정하고, 아래와 같이 환경 변수를 설정한다. 물론 아래 키 값이나 펑션 앱 이름은 예시일 뿐 실제 값은 아니다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=e2e-test-environment-variables.sh

그리고 테스트 명령어를 실행시켜 종단간 테스트를 수행한다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=e2e-test-dotnet-cli.sh

그리고 그 결과는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-03.png)

이제 우리는 `LocalhostServerFixture` 클라스를 리팩토링했고, 그 결과를 통해 로컬에서 통합테스트와 종단간 테스트를 성공적으로 수행했다.

## 애저 파이프라인 구성

이제 SRE를 위한 "동작 뼈대" 구성의 마지막 단계로써 애저 파이프라인을 구성할 차례이다. 단위테스트와 통합테스트는 빌드 파이프라인에, 종단간 테스트는 릴리즈 파이프라인에 추가한다. 아래 YAML 파이프라인 코드를 살펴보도록 하자. 멀티 스테이지 파이프라인 구성을 통해 빌드와 릴리즈 모두 하나의 YAML 파일에서 수행된다. 전체 파이프라인은 [소스 코드](https://github.com/devkimchi/Mountebank-Integration-Testing/blob/master/build/build.yaml)에서 확인하도록 하고, 여기서는 테스트와 관련된 부분만 발췌해서 살펴보도록 한다.

### 단위테스트

아래는 `build.yaml` 파일의 단위테스트 부분만을 발췌한 것이다. 한 번 찬찬히 들여다 보자. 자세한 설명은 아래에서 한다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=unit-test-build.yaml

1. `Unit Test Function App` 작업 명령어를 보면 굉장히 복잡해 보인다. 전체적으로는 앞서 언급했던 테스트 명령어와 큰 차이는 없다. 대신 몇가지 옵션이 추가됐다. 더불어 `continueOnError` 어트리뷰트 값을 `true`로 설정했는데, 이는 이 작업이 실패하더라도 (단위테스트가 실패하더라도) 계속 파이프라인을 진행시키라는 의미이다.
    
    - `--filter`: 이 옵션에 보면 `TestCategory` 값이 `Integration` 또는 `E2E`가 아닌 것만 골라서 테스트하라고 되어 있다. 즉, 순수한 단위테스트 메소드들만 실행한다는 의미이다.
    - `--logger`: 이 옵션 값은 `trx`인데, 이는 테스트 결과물을 `.trx` 포맷으로 저장하라는 얘기이다.
    - `--results-directory`: 이 옵션을 통해 테스트 결과물, 즉 `.trx` 파일을 저장할 디렉토리를 설정한다.
    - `/p:CollectCoverage`: 이 옵션을 통해 코드 커버리지 분석 결과물도 저장하게끔 한다.
    - `/p:CoverletOutputFormat`: 이 옵션값은 `cobertura`로 되어 있는데, 코드 커버리지 결과물의 저장 포맷을 결정한다.
    - `/p:CoverletOutput`: 이 옵션을 통해 커버리지 테스트 결과물을 저장할 디렉토리를 설정한다.
2. `Save Unit Test Run Status` 작업은 앞서 실행시킨 단위테스트가 성공했는지 (Succeeded), 실패했는지 (Failed), 실패했어도 계속 진행했는지 (SucceededWithIssues) 여부를 `UnitTestRunStatus`라는 변수에 저장한다.
3. `Publish Unit Test Results` 작업을 통해 앞서 테스트한 결과 리포트를 애저 데브옵스 파이프라인으로 업로드한다. 테스트 결과 리포트 포맷을 `.trx`로 지정했으므로 `testResultsFormat` 값을 `VSTest` 라는 값으로 선택했다.
4. `Publish Code Coverage Results` 작업을 통해 코드 커버리지 결과 리포트를 애저 데브옵스 파이프라인으로 업로드한다. 앞서 `cobertura` 포맷으로 저장했으므로 여기서도 `codeCoverageTool` 값을 `cobertura`로 선택했다.

단위테스트와 관련한 파이프라인 작업 설정을 살펴봤다. 이제 통합테스트 설정으로 넘어가 보자.

### 통합테스트

아래는 `build.yaml` 파일에서 통합테스트 부분만을 발췌한 것이다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=integration-test-build.yaml

1. `Integration Test Function App` 작업은 단위테스트와 변함이 없다. 다만 코드 커버리지 옵션 부분이 빠졌고, `--filter` 옵션 부분이 통합테스트만 골라내도록 `TestCategory=Integration`로 바뀌었다.
2. `Save Integration Test Run Status` 작업은 이전과 마찬가지로 통합테스트 작업의 성공여부를 `IntegrationTestRunStatus` 변수에 저장한다.
3. `Publish Integration Test Results` 작업은 통합테스트 결과를 애저 데브옵스에 업로드한다.
4. `Cancel Pipeline on Test Run Failure` 작업이 중요한데, 이 작업을 통해 앞서 `UnitTestRunStatus` 변수와 `IntegrationTestRunStatus` 변수에 저장해 놓았던 값을 사용한다. 단위테스트 및 통합테스트가 모두 성공했다면 이 작업 이후 산출물을 만들어 릴리즈 파이프라인으로 전달하는 작업을 진행하게 되고, 두 테스트 중 하나라도 실패했다면 이 작업을 통해 전체 파이프라인을 중단시킨다.

이렇게 통합테스트까지 파이프라인상에서 실행시켜 보았다. 이제 종단간 테스트로 넘어가 보자.

### 종단간 테스트

종단간 테스트는 릴리즈 파이프라인상에서 애저 펑션 앱을 배포한 후에 진행한다. 아래는 종단간 테스트 부분만을 파이프라인에서 발췌한 것이다. 릴리즈 파이프라인을 YAML 상에서 구현하기 위해서는 반드시 "멀티 스테이지 파이프라인" 기능이 활성화 되어 있어야 한다. 이 부분은 [이전 포스트](https://blog.aliencube.org/ko/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)에서 다룬 바 있다.

https://gist.github.com/justinyoo/c06c3b4df77d4fc6075f924e19ec0d6a?file=e2e-test-build.yaml

1. `Run E2E Tests` 작업은 앞서의 테스트 명령어와 거의 비슷하지만 살짝 다르다. 빌드 파이프라인에서는 `.csproj` 프로젝트를 대상으로 테스트를 실행했기 때문에 `dotnet test ...` 라는 명령어를 사용했다면, 여기서는 이미 만들어진 `.dll` 파일을 대상으로 테스트를 실행하기 때문에 `dotnet vstest ...` 라는 명령어를 사용한다. 또한 같은 옵션이긴 하지만 이름이 살짝 달라진다.
    
    - `--testCaseFilter`: 이 옵션은 `--filter` 옵션과 동일하다. 값을 `TestCategory=E2E`로 지정해서 종단간 테스팅으로 명시한 테스트만 골라 테스트를 진행한다.
    - `--resultsDirectory`: 이 옵션은 `--results-directory` 옵션과 동일하다.
    
    환경 변수 부분을 살펴보자. 종단간 테스트를 위해서는 추가적인 환경 변수 세팅이 필요하다고 앞에서 이미 언급한 바 있다. 따라서, 환경 변수를 `env` 어트리뷰트 아래에 설정했다.
    
2. `Save Test Run Status` 작업은 앞서 실행시킨 테스트의 결과를 `TestRunStatus` 변수에 저장한다.
3. `Publish E2E Test Results` 작업을 통해 종단간 테스트 결과를 파이프라인에 업로드한다.
4. `Cancel Pipeline on Test Run Failure` 작업을 통해 테스트 결과가 성공했다면 파이프라인 자체도 성공, 테스트 결과가 실패했다면 파이프라인 자체도 실패로 규정한다.

이렇게 해서 애저 파이프라인을 설정한 후 실행시켜 보면 아래와 같은 결과를 얻을 수 있다. 먼저 파이프라인 스테이지별 진행 상황을 한눈에 확인이 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-04.png)

그리고 단위테스트, 통합테스트, 종단간 테스트 결과를 일목요연하게 보여준다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-05.png)

마지막으로 코드 커버리지를 그래프로 보여준다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/07/azure-functions-sre-on-azure-devops-the-first-cut-06.png)

* * *

지금까지 애저 펑션 API 개발을 위한 "동작 뼈대"를 구성해 보았다. 이 포스트의 처음에 언급했다시피 이 "동작 뼈대"는 내가 개발하고자 하는 애플리케이션이 작동할 수 있게끔 하는 최소한도의 장치이다. 또한 이 최소한의 기능만 가진 애플리케이션이 CI/CD 파이프라인 상에서 단위, 통합, 종단간 테스트를 모두 통과할 수 있게끔 자동화 설정을 해 놓았기 때문에 향후 추가적인 기능을 여기에 붙여 나갈 경우 최소한의 노력만으로 계속해서 시스템이 자라날 수 있다. SRE를 위해서는 기본적으로 거의 대부분을 자동화해야 하는데, 이렇게 "동작 뼈대"를 구성함으로써 자동화를 위한 첫 단추를 잘 꿰어낸 셈이다.

사실 SRE는 이 자동화 뿐만 아니라 좀 더 큰 개념으로써 모니터링, 스케일링, 회복 탄력성 까지도 고려해야 하는데, 이 부분은 이 포스트의 범위를 벗어나는 것으로 다시 기회가 된다면 다루어 보도록 한다.

## 좀 더 읽어보기

- [서평 - 사이트 신뢰성 엔지니어링](https://blog.outsider.ne.kr/1358) by [@outsideris](https://twitter.com/outsideris)
- [SRE/DevOps 개념 소개](https://bcho.tistory.com/1325) by [조대협](https://bcho.tistory.com/)
- ["동작 뼈대"란 무엇인가?](https://devops.stackexchange.com/questions/712/what-is-a-walking-skeleton)
- [팩토리 메소드 패턴](https://ko.wikipedia.org/wiki/팩토리_메서드_패턴)
- [.NET Core 테스트 명령어 옵션](https://docs.microsoft.com/ko-kr/dotnet/core/tools/dotnet-test?tabs=netcore21)
- [.NET Core 테스트 설정](https://github.com/microsoft/vstest-docs/blob/master/docs/configure.md)
- [.NET Core 테스트 필터링](https://github.com/microsoft/vstest-docs/blob/master/docs/filter.md)
- [.NET Core 테스트 리포팅](https://github.com/microsoft/vstest-docs/blob/master/docs/report.md)
- [애저 데브옵스 멀티 스테이지 파이프라인 소개](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/)
- [애저 파이프라인 조건 실행](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/process/conditions?view=azure-devops&tabs=yaml)
- [애저 파이프라인 표현식](https://docs.microsoft.com/ko-kr/azure/devops/pipelines/process/expressions?view=azure-devops)
