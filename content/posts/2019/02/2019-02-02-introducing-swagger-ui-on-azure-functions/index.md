---
title: "애저 펑션 Swagger UI 소개"
date: "2019-02-02"
slug: introducing-swagger-ui-on-azure-functions
description: ""
author: Justin-Yoo
tags:
- dotnet
- azure-functions
- nuget
- open-api
- swagger
- swagger-ui
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/02/rendering-swagger-ui-via-azure-functions-00.png
---

> 알림: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

ASP.NET Core 애플리케이션에서는 [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore)이라는 엄청난 라이브러리가 있어서 이를 이용하면 정말로 손쉽게 Swagger 문서 및 UI를 사용할 수 있다. 하지만 애저 펑션에서는 아직까지 이런 기능을 제공하지 못하고 있는 상황이다.

애저 펑션 1.x 에서는 [프리뷰 형태로 Swagger 문서를 제한적이나마 제공해 왔다](https://docs.microsoft.com/en-us/azure/azure-functions/functions-openapi-definition). 이와 관련한 [포스트](https://blog.aliencube.org/ko/2017/06/12/azure-functions-with-swagger/)도 예전에 썼던 적이 있었는데, 그 포스트에서도 언급했다시피 자동으로 생성해 주는 부분 이외에 추가로 작업해야 할 부분들이 꽤 있기 때문에 여전히 기능이 제한적이다. 게다가 애저 펑션 2.x 으로 올라오면서는 아예 이 프리뷰 기능 조차도 빠져버렸다. 결국 [지난 포스트](https://blog.aliencube.org/ko/2019/01/04/rendering-swagger-definitions-on-azure-functions-v2/)에서는 직접 Swagger 문서를 작성한 후 웹에서 접근 가능한 장소로 업로드한 후 이를 렌더링하는 방법을 소개했다. 하지만, 이 역시도 불편한 것은 사실이다. API 설계 우선 방식(Design-First Approach)으로 접근하는 것은 최초 API를 설계할 당시에는 괜찮을지 모르지만, 운영하는 도중에도 항상 이 설계 우선 방식이 유효하지는 않다. 따라서, Swashbuckle과 비슷한 기능을 하는 라이브러리가 애저 펑션에서도 필요한지라, 직접 만들어 보았다.

> [Aliencube.AzureFunctions.Extensions.OpenApi](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/)

애저 펑션 팀 내부에서는 이 기능이 어느 정도의 우선 순위를 갖고 있는지는 모르겠으나, 공식적인 라이브러리 혹은 익스텐션이 나올 때 까지는 이 라이브러리를 꽤 유용하게 사용할 수 있을 것으로 기대한다. 더불어 이 포스트에서는 라이브러리 사용 방법에 대해 간단히 다뤄보고자 한다.

> 여기에 쓰인 샘플 코드는 이 [리포지토리](https://github.com/aliencube/AzureFunctions.Extensions)에서 확인할 수 있다.

## 애저 펑션 버전

이 라이브러리는 애저 펑션의 기본 HTTP 트리거를 이용하므로 1.x 버전과 2.x 버전 모두 사용할 수 있다.

## NuGet 패키지 다운로드

이 라이브러리는 현재 NuGet 패키지 리포지토리에서 다운로드 받을 수 있다. [![](https://img.shields.io/nuget/dt/Aliencube.AzureFunctions.Extensions.OpenApi.svg)](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/) [![](https://img.shields.io/nuget/v/Aliencube.AzureFunctions.Extensions.OpenApi.svg)](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/)

## HTTP 트리거 작성

가장 기본적인 HTTP 트리거를 두 개 작성해 보기로 하자. 하나는 GET 메소드를, 다른 하나는 POST 메소드를 구현한다.

https://gist.github.com/justinyoo/002920c00bfbe31e427d4de4a914f58e?file=sample-function.cs

위에서 볼 수 있다시피, Swashbuckle과 비슷한 방식으로 다양한 데코레이터를 사용해서 Open API 문서를 정의했다. [OpenAPI.NET](https://www.nuget.org/packages/Microsoft.OpenApi/) 라이브러리를 기반으로 만들어졌기 때문에 이 글을 쓰는 시점에서 데코레이터의 구조는 [Open API 3.0.1 스펙](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md)을 따른다. 각각의 데코레이터 구조는 [이 문서](https://github.com/aliencube/AzureFunctions.Extensions/blob/master/docs/openapi.md)를 참고하도록 한다. 현재 라이브러리 버전 [1.1.0](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/1.1.0)은 작동하는 최소한도 수준의 Open API 스펙을 구현했다.

## Open API 메타 데이터 설정

Open API 스펙에서는 반드시 [Info 객체](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#infoObject)를 정의해야 하는데, 이 부분은 라이브러리에서 환경 변수를 참조한다. 아래는 `local.settings.json` 파일의 내용에 대한 예시이다.

https://gist.github.com/justinyoo/002920c00bfbe31e427d4de4a914f58e?file=local-settings.json

애저 펑션 인스턴스의 App Settings 블레이드에는 아래와 같이 값을 입력하면 된다.

- `OpenApi__Info__Version`: **필수** Open API 문서 버전. 스펙 버전 아님 (예. 2.0.0)
- `OpenApi__Info__Title`: **필수** Open API 문서 제목 (예. Open API Sample on Azure Functions)
- `OpenApi__Info__Description`: Open API 문서 설명 (예. A sample API that runs on Azure Functions either 1.x or 2.x using Open API specification)
- `OpenApi__Info__TermsOfService`: 이용약관 URL (예. https://github.com/aliencube/AzureFunctions.Extensions)
- `OpenApi__Info__Contact__Name`: 담당자 이름 (예. Aliencube Community)
- `OpenApi__Info__Contact__Email`: 담당자 이메일 주소 (예. no-reply@aliencube.org)
- `OpenApi__Info__Contact__Url`: 문의 URL (예. https://github.com/aliencube/AzureFunctions.Extensions/issues)
- `OpenApi__Info__License__Name`: **필수** 라이센스 이름 (예. MIT)
- `OpenApi__Info__License__Url`: 라이센스 URL (예. http://opensource.org/licenses/MIT)
- `OpenApi__ApiKey`: Open API 문서 렌더링 엔드포인트의 API Key

## Open API 문서 렌더링

위와 같이 두 개의 HTTP 트리거를 작성하고 환경 변수를 설정했다면, 이제는 이를 Open API 문서로 표현할 차례이다. 아래와 같이 HTTP 트리거를 작성한다. `OpenApiIgnoreAttribute` 데코레이터를 사용해서 이 HTTP 트리거는 Open API 문서에 포함되지 않도록 한다.

https://gist.github.com/justinyoo/002920c00bfbe31e427d4de4a914f58e?file=render-openapi-document.cs

위 펑션 코드는 `version`과 `extension` 바인딩을 허용한다. 아래 렌더링 결과물을 확인해 보면 알 수 있을 것이다. 어떤 URL로 접속하는가에 따라 렌더링하는 문서의 스펙과 포맷이 달라진다.

- `/api/openapi/v2.json` ![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/rendering-swagger-ui-via-azure-functions-01.png)
    
- `/api/openapi/v2.yaml` ![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/rendering-swagger-ui-via-azure-functions-02.png)
    
- `/api/openapi/v3.json` ![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/rendering-swagger-ui-via-azure-functions-03.png)
    
- `/api/openapi/v3.yaml` ![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/rendering-swagger-ui-via-azure-functions-04.png)
    

## Swagger UI 페이지 렌더링

Open API 문서가 만들어졌다면, 이를 이용한 Swagger UI 페이지를 렌더링 할 차례이다. 마찬가지로 `OpenApiIgnoreAttribute` 데코레이터를 사용해서 이 HTTP 트리거 역시 Open API 문서에 포함되지 않도록 한다. 아래 코드는 `swagger.json` 엔드포인트를 사용했는데, 이는 위 Open API 문서 렌더링을 위한 엔드포인트를 `swagger.json` 으로 하드코딩을 해 놓았기 때문이다.

> 이 포스트를 쓰는 시점에서 Swagger UI 버전은 [`3.20.5`](https://github.com/swagger-api/swagger-ui/releases/tag/v3.20.5)을 사용했다.

https://gist.github.com/justinyoo/002920c00bfbe31e427d4de4a914f58e?file=render-swagger-ui.cs

이렇게 한 후 `/api/swagger/ui` 엔드포인트를 웹 브라우저에서 열어보면 아래와 같이 보일 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/rendering-swagger-ui-via-azure-functions-05.png)

여기까지 해서 로컬 개발 환경에서 Open API 문서와 Swagger UI 페이지를 렌더링하는 방법을 알아 봤다. 이제 이를 애저 펑션 인스턴스로 배포를 해 보도록 하자. 애저 펑션 인스턴스에서는 반드시 헤더에 `x-functions-key`를 사용하거나 쿼리스트링에 `code=xxx`를 사용하는 식으로 Open API 문서 또는 Swagger UI 페이지에 접근한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/02/rendering-swagger-ui-via-azure-functions-06.png)

* * *

지금까지 [Aliencube.AzureFunctions.Extensions.OpenApi](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/) 라이브러리를 사용해서 애저 펑션에 Swagger UI를 구현하는 방법에 대해 알아보았다. 앞으로는 애저 펑션에서도 손쉽게 Swagger UI 페이지를 사용할 수 있을 것이다.
