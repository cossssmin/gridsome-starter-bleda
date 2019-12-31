---
title: "Azure Functions에 Swagger 통합하기"
date: "2017-06-12"
slug: azure-functions-with-swagger
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- swagger
fullscreen: false
cover: ""
---

얼마전 [Azure Functions(애저 펑션)](https://azure.microsoft.com/en-us/services/functions/)에 [Swagger](http://swagger.io/)로 알려진 [OpenAPI](https://www.openapis.org/) [지원 기능이 추가됐다](https://blogs.msdn.microsoft.com/appserviceteam/2017/03/30/announcing-functions-swagger-support/). 애저 펑션을 API로 사용할 경우 굉장히 유용한 기능인데, 이 포스트에서는 어떻게 Swagger를 연동시킬 수 있는지 간단하게 알아보기로 한다.

> 이 포스트에 쓰인 샘플 코드는 [이곳](https://github.com/devkimchi/Azure-Functions-Swagger-Sample)에서 확인할 수 있다.

## 샘플 애저 펑션 인스턴스

우선 애저 펑션 인스턴스를 생성해서 간단한 펑션을 두 개 만들어 보도록 한다. 하나는 `CreateProduct`이고, 다른 하나는 `GetProduct`이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-01.png)

Postman을 이용해서 두 펑션으로 요청을 보내면 대략 아래와 같은 응답을 받게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-02.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-03.png)

이제 이 애저 펑션 인스턴스에 정의된 펑션을 Swagger로 정의해 보도록 하자.

## Swagger 정의 자동 생성

애저 펑션 인스턴스에 적어도 하나 이상의 펑션 코드가 있다면 자동으로 Swagger 정의를 생성할 수 있다. 우선 아래 화면에서 보이는 `API definition (preview)` 탭을 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-04.png)

Swagger를 한 번도 정의해 본 적이 없다면 기본적으로는 `External URL` 버튼이 활성화 되어 있다. 바로 옆의 `Functions` 버튼을 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-05.png)

당연히 Swagger가 정의되어 있지 않기 때문에 아래와 같이 에러를 낸다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-06.png)

이제 `Generate API definition template` 버튼을 클릭해서 자동으로 Swagger 정의 문서를 만들어 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-07.png)

이렇게 Swagger 문서를 자동으로 만들 수 있다. 실제 만들어진 Swagger 문서는 YAML 형식으로 아래와 같다.

https://gist.github.com/justinyoo/f90a5d863204126e1e52a29e376c6ae5

하지만 이 문서에는 최소한 세 가지가 빠져 있어서 이를 직접 채워 넣어야 한다.

- 요청/응답 모델: 위 문서의 `definitions` 항목이 비어있다. 즉 이 부분은 직접 만들어 넣어야 한다.
- `produces`/`consumes` 문서 타입: 어떤 문서 타입을 허용할 지에 대해 정의해야 한다. 일반적으로는 REST API에서 가장 널리 쓰이는 `application/json`을 추가하면 된다.
- API Key header: 자동 생성된 문서는 `code` 쿼리 파라미터 까지는 정의해 놓았지만, 요청 헤더에 들어가는 API Key(`x-functions-key`)에 대한 정의는 없다. 이것도 직접 채워 넣어야 한다.

위에 빠진 내용을 추가한 결과는 아래와 같다.

https://gist.github.com/justinyoo/fcc71c2c968eb47417fab3b8244fca3e

새롭게 업데이트한 Swagger 파일을 저장한 후 화면의 우측 미리보기 화면에서 직접 테스트 해 볼 수도 있다. 이렇게 하면 간단하게 Swagger 파일을 애저 펑션에 통합시킬 수 있다.

실제로 위 그림의 중간에 있는 주소인 `https://xxxx.azurewebsites.net/admin/host/swagger?code=xxxx`로 접속해 보면 아래와 같이 자동으로 생성된 YAML 문서가 JSON 포맷의 문서로 보이는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-08.png)

하지만 이 방법의 단점이 하나 있다. 이 방법을 위해서는 이미 펑션 코드가 최소한 하나 이상 돌고 있어야 한다는 가정을 해야 한다. 즉, API 설계 우선 방법론으로는 적용하기 힘들다는 단점이 생긴다.

그렇다면 실제 펑션 코드는 없이 API 정의 문서만 있을 경우에는 어떻게 할 수 있을까? 두 가지 방법이 있다. 하나씩 짚어보도록 하자.

## 애저 펑션에 API 정의 문서 연결

외부에서 공개적으로 접근 가능한 곳에 Swagger 정의 문서가 있을 경우에는 아래와 같이 `External URL` 버튼을 클릭해서 외부 URL을 지정해 주면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-09.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-10.png)

여기서는 편의상 GitHub에 올라가 있는 JSON 파일을 지정했다. 만약 Blob Storage에 저장해 놓은 파일이라면 해당 Blob Storage 컨테이너의 접근 권한에 따라 SAS 토큰을 함께 붙여주면 된다.

이 방법의 장점은 현재 애저 펑션 인스턴스와는 완전히 별개로 Swagger 문서를 작성할 수 있다는 것이다. 그리고 이 방법의 단점은 이게 전부라는 것이다. 외부 파일을 지정한다고 해서 애저 펑션에 어떤 변화가 생기는 것도 아니라서 딱히 이 방법의 효용성은 없다고 볼 수 있다. 현재 프리뷰 상태이니만큼 정식 버전이 될 때에는 어떤 변화가 생길지 두고 보면 좋을 것 같다.

## 애저 펑션으로 직접 Swagger 정의 문서 렌더링

이 방법은 기본적으로 애저 펑션 코드를 하나 생성해서 YAML 형식으로 된 Swagger 정의 문서를 JSON 포맷으로 파싱하는 것이다. 아래와 같은 펑션 코드를 보면 쉽게 이해할 수 있다.

https://gist.github.com/justinyoo/e5684525dd451640acf26d7a60687b42

우선 환경 변수를 하나 설정해야 한다. 애저 펑션의 `AppSettings` 섹션에 `WEBROOT_PATH` 라는 변수명을 넣고 그 값을 `D:\home\site\wwwroot`로 지정하자. 위 코드에서 보면 `var wwwroot = Environment.GetEnvironmentVariable("WEBROOT_PATH");`와 같이 환경 변수를 읽어들이면 된다. 또는 `var wwwroot = ConfigurationManager.AppSettings["WEBROOT_PATH"]`의 형태로 읽어들여도 상관 없다. 만약 이 환경 변수를 생략하면 애저 펑션은 기본값으로 [`C:\Windows\System32`](https://stackoverflow.com/questions/43498379/azure-functions-execution-error#43499130)를 가정하고 거기서 파일을 읽어들이려 하기 때문에 오류가 생긴다.

> [이 문서](https://github.com/Azure/azure-webjobs-sdk-script/wiki/Retrieving-information-about-the-currently-running-function)에 따르면 이 글을 쓰는 현재 `Microsoft.Azure.WebJobs.ExecutionContext` 인스턴스를 펑션에 추가할 수 있게 되어 조금 더 파일 경로에 대한 관리가 쉬워졌다고 한다. 하지만, 아직 이는 애저 펑션엔 반영이 되어 있지만, 개발툴에는 반영되어 있지 않아서 좀 더 기다려야 할 것 같다.

다음으로 위와 같은 형식으로 HTTP 트리거 펑션을 하나 만든다. 그리고 YAML 포맷으로 된 Swagger 정의 문서를 읽어들인다. 마지막으로 YAML 포맷을 JSON 포맷으로 변환해서 렌더링한다.

이렇게 해서 만들어진 애저 펑션 코드를 웹 브라우저에서 불러보면 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/06/azure-functions-with-swagger-11.png)

지금까지 세 가지 서로 다른 방법으로 애저 펑션에 Swagger 정의 문서를 통합하는 방법에 대해 알아 보았다. 현재 프리뷰 상태이니만큼 정식 버전에서는 어떤 변화가 생길지는 알 수 없지만, 큰 변화가 생길 것 같지는 않다. 이 포스트에서 다룬 첫번째 방식으로 일단 템플릿을 만들어서 그걸 수정한 후에 사용하는 방법이 가장 편리할 수 있겠지만, 이는 별도의 API 엔드포인트와 인증 키를 요구하므로 관리의 문제가 생길 수 있다. 따라서 마지막에 언급한 방식으로 Swagger 정의 문서를 렌더링해 주는 것이 관리의 측면에서는 좀 더 바람직하지 않을까 하는 개인적인 평가를 내려보면서 이 글을 마무리하도록 한다.
