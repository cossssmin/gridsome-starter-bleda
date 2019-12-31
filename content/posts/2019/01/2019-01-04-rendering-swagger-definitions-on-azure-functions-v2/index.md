---
title: "애저 펑션에서 Swagger 정의 문서 출력하기"
date: "2019-01-04"
slug: rendering-swagger-definitions-on-azure-functions-v2
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- dependency-injection
- di
- open-api
- swagger
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/01/rendering-swagger-definitions-on-azure-functions-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

[애저 펑션 1.x 에서는 Swagger 정의 문서를 렌더링할 수 있는 기능이 프리뷰로 제공된다](https://docs.microsoft.com/en-us/azure/azure-functions/functions-openapi-definition). 이와 관련한 [블로그 포스팅](https://blog.aliencube.org/ko/2017/06/12/azure-functions-with-swagger/)도 예전에 했더랬는데, 아쉽게도 현재 2.x 버전의 애저 펑션에서는 이 기능을 제공하지 않는다. 따라서 수동으로 Swagger 문서를 렌더링하는 기능을 구현할 수 밖에 없는데, 이 포스트에서는 이를 어떻게 구현하는지 알아보도록 한다.

## 설계 우선 vs 구현 우선

앞서 언급했다시피 HTTP 트리거를 자동으로 인식해서 Swagger 정의문서를 렌더링 해주는 기능은 1.x 에서만 제한적으로 제공했던 기능이었다. 이 기능이 현재 2.x 에서는 아예 빠져 있기 때문에 구현 우선 (Implementation-first) 방식의 렌더링은 아쉽게도 사용할 수 없다. 하지만 일반적으로 API 설계를 먼저 하고 나면 (설계 우선; Design-first) API 기능이 구현되어 있지 않더라도 API 사용자 입장에서는 굳이 기다리지 않고 사용자 쪽의 애플리케이션을 개발할 수 있기 때문에 협업의 관점에서는 설계 우선 방법을 선호하는 편이다. 따라서, 이 포스트 에서도 역시 Swagger 정의 문서가 이미 준비되어 있다는 가정을 하고 시작한다.

> 이 포스트에서 사용한 코드는 [이곳에서 확인할 수 있다](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps).

## Swagger 렌더링 코드

애저 펑션에서 키 저장소로 접근하기 위한 코드는 두 개의 엔드포인트를 정의해 놓았다. 하나는 `/api/secrets` 이고 다른 하나는 `/api/secret/{name}`이다. 이 두 엔드포인트가 반환하는 payload와 어떻게 이 엔드포인트를 호출하는지에 대한 정의를 이미 설계 우선 방식으로 만들어 놓았다.

https://gist.github.com/justinyoo/d52cc2d6f5613b0714f21db993c5918d?file=swagger.yaml

따라서, 펑션 코드상에서는 해당 문서의 URL을 파싱해서 보여주기만 하면 된다. Swagger 문서를 렌더링하기 위한 엔드포인트를 `/api/swagger.{extension}`으로 정의한 후 확장자가 `json`인지 `yaml`인지에 따라 다르게 렌더링 할 수 있게끔 해 놓았다.

https://gist.github.com/justinyoo/d52cc2d6f5613b0714f21db993c5918d?file=swagger-trigger.cs

물론 이 코드는 [애저 펑션의 의존성 주입 패키지](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.DependencyInjection/)를 이용한 것이므로 실제 Swagger 문서 렌더링은 `IRenderSwaggerFunction` 인스턴스에서 이루어진다. 아래 코드를 보자.

https://gist.github.com/justinyoo/d52cc2d6f5613b0714f21db993c5918d?file=render-swagger-function.cs

이렇게 작성한 코드를 배포한 후 Postman을 통해 엔드포인트를 호출해 보도록 하자. 먼저 `json` 확장자로 호출하면 아래와 같은 결과가 나온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/rendering-swagger-definitions-on-azure-functions-01.png)

이번에는 `yaml` 확장자로 호출하면 아래와 같은 결과가 나온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/rendering-swagger-definitions-on-azure-functions-02.png)

YAML이든 JSON이든 Swagger 정의 문서를 하나만 만들어 놓은 후에 애저 펑션을 이용해 렌더링을 시키면 호출하는 확장자에 따라 적절하게 문서 포맷을 변경한 후 렌더링해 준다. 이 부분이 굉장히 중요한데, API 설계는 어느 한 형태의 문서로 작성한 후에 상황에 따라 필요한 문서를 렌더링해서 쓸 수 있다는 점이다.

* * *

지금까지 애저 펑션 2.x 에서 Swagger 정의 문서를 상황에 따라 적절한 포맷으로 맞춰서 렌더링해주는 방법에 대해 알아 보았다. 다음 포스트에서는 지금까지 애저 펑션으로 다뤘던 키 저장소 관련 구현 기능들을 한데 묶어보도록 한다.
