---
title: "애저 펑션에서 Application Insights로 로그 남기기"
date: "2017-06-19"
slug: azure-functions-logging-to-application-insights
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-application-insights
- ilogger
- logging
fullscreen: false
cover: ""
---

이 포스트에서는 애저 펑션과 Application Insights를 연동시킬 때 적용시킬 수 있는 몇 가지 방법에 대해 간략하게 알아보기로 한다.

[Azure Functions (애저 펑션)](https://azure.microsoft.com/en-us/services/functions/)는 자체적으로 [`TraceWriter`](https://github.com/Azure/azure-webjobs-sdk/blob/dev/src/Microsoft.Azure.WebJobs.Host/TraceWriter.cs) 인스턴스를 통해 로깅 기능을 제공한다.

https://gist.github.com/justinyoo/d100936d14eda767abe15062b1929d49

이를 이용하면 애저 펑션의 로그 콘솔에 아래와 같이 정보를 표시할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-logging-01.png)

하지만, 이 콘솔 로그는 [최대 1000개의 메시지만 저장할 수 있는 제약](http://geekswithblogs.net/tmurphy/archive/2017/02/13/implementing-logging-in-azure-functions.aspx)이 있어서 간단한 디버깅의 용도로는 좋지만 본격적인 로그 저장 용도로는 썩 좋지 않다. 그래서 최근 [Application Insights](https://azure.microsoft.com/en-us/services/application-insights/)와 연동을 시키는 [프리뷰 기능](https://github.com/Azure/Azure-Functions/wiki/App-Insights-(Preview))을 제공하기 시작했다.

## Application Insights 연동

이부분은 사실 굉장히 간단하다. 애저 펑션의 `AppSettings` 섹션에 Application Insights 인스턴스의 Instrumentation Key 값을 `APPINSIGHTS_INSTRUMENTATIONKEY` 에 추가하면 된다. 이 때 Application Insights 인스턴스는 반드시 `General` 타입이어야 한다.

이렇게 설정한 후 펑션을 몇 번 실행시켜 보면 아래와 같이 실행 결과 로그가 자동으로 Application Insights에 수집되는 것을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-logging-02.png)

참 쉽죠?

## DevOps 엔지니어를 위한 ARM 템플릿 설정

위와 같은 방법으로 Application Insights의 Instrumentation Key를 설정하는 것이 나쁘진 않지만 실제 CI/CD 환경에서 추천할만한 방법은 아니다. DevOps 관점에서는 ARM 템플릿을 이용하는 것이 훨씬 더 효과적이므로 아래 템플릿 샘플과 같이 설정하면 손쉽게 Instrumentation Key를 설정할 수 있다.

https://gist.github.com/justinyoo/6bb2b82935e70bfa005e3a287f5296d8

위의 ARM 템플릿은 필요한 부분만 남긴 축약 버전이다. 템플릿과 관련한 좀 더 자세한 내용은 [이 공식 문서](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-create-first-template)를 참조하면 좋다.

## `ILogger` 연동

ASP.NET Core 라이브러리는 [`ILogger`](https://docs.microsoft.com/en-au/aspnet/core/api/microsoft.extensions.logging.ilogger)라는 로깅 관련 인터페이스를 제공한다. 이 인터페이스를 이용하면 Application Insights에서 로그를 보낼 수 있다. 이 부분도 굉장히 간단하다. 기존의 `TraceWriter` 타입을 `ILogger` 타입으로 변경하고 로그 메소드 이름을 `Info()`에서 `LogInformation()`과 같이 바꿔주면 된다.

https://gist.github.com/justinyoo/983a518cb9f6e9c55c695e6c0a4bb8f2

만약 기존의 `Info()` 메소드 이름을 그대로 사용하고 싶다면 아래와 같이 확장 메서드를 하나 만들어주면 좋다.

https://gist.github.com/justinyoo/11b187022dac81824122855df3f951e4

이 확장 메소드를 이용하면 기존의 `log.Info()` 메소드를 변경 없이 그대로 사용할 수 있다.

https://gist.github.com/justinyoo/72c4950e106d4576860590709e43561e

이렇게 바꾼 후 애저 펑션을 실행시켜보면 아래와 같은 결과를 애저 펑션 로그 콘솔에서 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-logging-03.png)

또한 Application Insights에서도 확인이 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-logging-04.png)

그렇다면 Application Insights 뿐만 아니라 `ILogger` 인터페이스를 구현한 써드파티 로깅 라이브러리도 사용할 수 있지 않을까? 안타깝게도 이 포스트를 쓰는 현재 시점에서는 사용할 수 없다. 하지만 [이 이슈를 보면](https://github.com/Azure/azure-webjobs-sdk-script/issues/1579) 곧 구현될 것 같다.

지금까지 애저 펑션과 Application Insights를 연동시키는 방법에 대해 다양한 관점에서 대략적으로 훑어봤다. 아직까지 프리뷰 기능이어서 제한적이기는 하지만, 그래도 꽤 유용하게 쓰일 수 있을 것처럼 보인다.
