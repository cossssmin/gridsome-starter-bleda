---
title: "개발자를 위한 API 목킹"
date: "2017-05-16"
slug: api-mocking-for-developers
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- aws
- api-gateway
- azure
- api-management
- mulesoft
- api-manager
- mocking
- swagger
- raml
fullscreen: false
cover: ""
---

마이크로서비스 아키텍처를 이용해 서비스를 운영하게 되면 서비스간 메시지 교환은 API를 이용한다. 이런 API를 개발할 때 두 가지 접근 방법을 생각할 수 있는데, 하나는 모델 우선 (Model First) 개발 방식이고, 다른 하나는 설계 우선 (Design First) 개발 방식이다. 보통은 후자의 설계 우선 개발 방식을 채택하는데, 이의 또 다른 표현에는 스펙 주도 개발 (Spec-Driven Development; SDD)이 있다.

모델 우선 개발 방식이 유용한 경우에는 레거시 API 애플리케이션을 이용할 때이다. 기존에 이미 운영하던 API 애플리케이션이 있다고 가정할 때 만약 이 애플리케이션의 각 클라스와 멤버마다 문서화가 잘 되어 있다면 여기서 API 요청/응답 객체와 관련한 설계 문서를 곧바로 뽑아낼 수 있다. [Swagger](http://swagger.io/)로 알려진 [Open API Spec](https://github.com/OAI/OpenAPI-Specification)의 언어별 구현체를 이용하면 이 작업 과정이 굉장히 쉽게 이뤄진다.

그렇다면, 새로 API를 구현해야 하는 경우에는 어떨까? 일단 API 애플리케이션을 먼저 만들고 앞서와 같이 거기서 API 스펙을 뽑아내야 할까? 그렇게 해도 물론 상관은 없다. 만약에 API 스펙이 변경된다면? 다시 애플리케이션을 업데이트해야 할까? 애플리케이션을 먼저 만들고 거기서 API 설계 문서를 뽑아내는 일은 굉장히 시간도 많이 걸리고, 비용도 많이 드는 접근 방법이다. 설계를 먼저 하고난 후 검토를 거쳐 스펙을 확정한 후 실제 구현에 들어가는 것이 시간과 비용을 절약할 수 있는 방법이다. 따라서 이러한 이유들로 인해 설계 우선 혹은 스펙 주도 API 개발 방법론을 선호하게 된다. 이 설계 우선 API 개발 방법론과 관련한 대략의 그림은 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-01.png)

1. 먼저 요구 사항에 맞춰 API 설계를 한다.
2. 이렇게 설계한 API를 시뮬레이션 해 본다.
3. 시뮬레이션이 끝난 후 피드백을 받는다.
4. 요구 사항에 맞게 설계가 되었는지 확인한다.
5. 검증이 끝나면 API 스펙으로 확정한다.

2번 항목에서 언급한 바와 같이 설계한 API를 돌려봐야 하는데, 실제 구현이 없이 어떻게 시뮬레이션을 할 수 있을까? 이 때 필요한 것이 바로 API 목킹이다. 이 API 목킹을 이용해서 프론트엔드 웹 애플리케이션이나 모바일 애플리케이션에서 실제 작동 여부와 상관 없이 시뮬레이션을 할 수 있고, 이 결과를 이용해 API 개발자에게 피드백을 줄 수 있다.

이 포스트에서는 이러한 API 목킹을 어떻게 할 수 있는지에 대해 대표적인 API 매니지먼트 도구인 [MuleSoft API Manager](https://www.mulesoft.com/platform/api/manager), [Azure API Management](https://azure.microsoft.com/en-us/services/api-management/), [AWS API Gateway](https://aws.amazon.com/api-gateway/)를 이용해 보고, 각각의 장단점에 대해 논의해 보기로 한다.

## MuleSoft API Manager + RAML

[RAML(RESTful API Modelling Language)](http://raml.org/)은 MuleSoft의 API Manager에서 지원하는 API 스펙 문서 형식이다. 0.8 버전의 스펙이 가장 널리 쓰이지만 최근 [1.0 버전의 스펙](https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md)이 나왔다. RAML은 기본적으로 [YAML](http://yaml.org/) 형식의 문서이므로 API 설계를 하는데 있어서 가독성이라든가 하는 부분에서 크게 어려운 점이 없다. 아래는 이 포스트에서 쓰일 간단한 RAML 기반 API 설계 문서이다.

https://gist.github.com/justinyoo/0e850fa95efedd711b4e0088f946364d

이 문서에 따르면 API 엔드포인트는 `/products`와 `/products/{productId}` 이렇게 두 개이고, 각각 `GET`, `POST`, `PATCH`, `DELETE` 등을 정의해 놓았다. 혹시 이 스펙 파일에서 어떤 부분이 우리가 목킹에 사용할 곳인지 대충 눈치를 챘을 수도 있는데, 각각의 응답 객체 정의 부분에 보면 `example` 노드가 보인다. 이 부분이 바로 MuleSoft의 API Manager에서 목킹을 하는 부분이다. 이제 이를 이용해서 어떤 식으로 목킹을 하는지 알아보자.

먼저 MuleSoft의 Anypoint 사이트에 로그인한다. 계정이 없다면 한달짜리 무료 트라이얼 계정을 생성할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-02.png)

로그인 후 `API Manager` 버튼을 클릭해서 이동한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-03.png)

API Manager 섹션으로 들어오면 신규 API 작성 버튼을 클릭하여 API를 하나 추가한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-04.png)

API 추가가 끝나면 API Designer 링크를 클릭해서 들어간다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-05.png)

앞서 작성한 RAML 파일을 불러온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-06.png)

위 화면은 RAML 파일을 불러온 후의 API Designer 화면인데, 가운데 섹션은 RAML 파일의 내용이고, 우측 섹션은 이 RAML 파일이 API 문서로 변환된 모습이다. 이제 우측 상단의 `Mocking Serivce` 버튼을 클릭해서 목킹 상태로 바꿔보도록 하자. 이 버튼을 클릭해서 목킹을 활성화하면 RAML의 BaseUri 부분이 바뀐다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-07.png)

바로 이 목킹 URL을 이용해서 [Postman](https://www.getpostman.com/)을 통해 이 API 디자인을 테스트 하면 된다. 또한, 프론트엔드 웹 개발자 혹은 모바일 개발자는 실제 API 구현을 기다리는 동안 이 목킹 API를 이용해서 개발을 진행할 수도 있다. 아래는 Postman을 이용해 실제 API 엔드포인트로 요청을 보낸 결과이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-08.png)

RAML 스펙 문서 안에 `example` 노드로 정의해 놓은 결과값을 반환하는 것이 보인다. 같은 식으로 다른 API 엔드포인트도 `example` 노드를 준비해 놓았다면 같은 방식으로 결과값을 반환하는 것을 확인 가능하다.

지금까지 RAML과 MuleSoft API Manager를 이용해서 API 목킹을 하는 방법에 대해 살펴보았다. 이 방법의 장점은 굉장히 쉽다는 것이다. 단지 RAML 파일을 불러와서 쓰는 것 만으로 곧바로 목킹이 가능한 것을 봤는데, 개발 경험으로 볼 때 이것은 굉장한 강점이라고 할 수 있다. 하지만, 이 방법의 단점 역시도 존재하는데 바로 RAML이 과연 널리 쓰이는 API 스펙인지에 대한 의문이다. 현재 사실상의 API 스펙을 정의하기 위한 언어는 얼마전까지 [Swagger](http://swagger.io/)로 알려진 [Open API Spec](https://github.com/OAI/OpenAPI-Specification)이다. 따라서 MuleSoft의 API Manager에서 RAML만을 지원하는 것은 어찌보면 약간은 위험하지 않을까 싶은 선택이다.

그렇다면 이제 Swagger를 쓰는 다른 예로 넘어가 보도록 하자.

## Azure API Management + Swagger

[Swagger](https://swagger.io)는 이제 [Open API](https://www.openapis.org/)로 통합이 됐고, 현재 [2.0 버전의 스펙](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)이 가장 널리 쓰인다. [3.0 버전의 스펙도 현재 프리뷰 상태](https://github.com/OAI/OpenAPI-Specification/blob/OpenAPI.next/README.md)이니 곧 공식화 되지 않을까 기대한다. Swagger 역시도 기본적으로 YAML 형식의 문서이지만 Azure API Management 에서는 JSON 포맷의 Swagger 문서를 이용한다. 아래는 앞서 RAML로 정의한 Product API를 동일하게 Swagger로 변환한 것이다.

https://gist.github.com/justinyoo/751a4b31a24084c0fbcc7ea4add9a520

스펙 정의가 살짝 다를 뿐 RAML과 Swagger는 기본적으로 큰 차이는 없다. Swagger에서도 마찬가지로 `examples` 노드가 있어서 이를 이용하면 손쉽게 목킹이 가능하다. API Management 에서 목킹하는 방법에 대해 알아보도록 하자.

우선 Azure Portal에서 API Management 인스턴스를 하나 생성한다. 인스턴스를 생성하는데는 시간이 꽤 걸리는 편이어서 대략 30분 정도를 예상하면 좋다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-09.png)

API Management 인스턴스 생성이 끝나면 위 스크린샷의 좌측에 있는 `APIs - PREVIEW` 블레이드를 클릭해서 API를 등록한다. 아래 그림과 같이 `Open API specification` 타일을 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-10.png)

그러면 아래와 같이 Swagger 정의 문서를 업로드할 수 있는 창이 뜨는데, `Upload` 버튼을 클릭하여 `swagger.json` 파일을 업로드한다. 그리고, API URL suffix 칸에 적절한 값을 입력한다. 여기서는 `shop`이라고 입력했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-11.png)

`swagger.json` 파일 업로드를 통해 Product API 정의가 끝났다. 다음 단계로는 아래와 같은 화면을 볼 수 있다. 목킹 기능은 `Inbound processing` 타일에서 설정할 수 있다. 그 다음 단계가 실제 백엔드 API를 호출하는 것이므로, 백엔드 API 호출 직전에 목킹을 한 후 그 결과값을 되돌려 주어야 한다. 화면에서 볼 수 있다시피 모든 API 전체적으로 목킹을 한번에 지정할 수도 있고, 개별 API 수준에서 따로 목킹을 할 수도 있다. 여기서는 간단하게 `GET /products` API에 대해서 목킹을 설정해 보도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-12.png)

우선 위 그림의 좌측에서 `/products - GET`을 클릭한 후 중간에 있는 `Inbound Processing` 타일의 우측 상단에 있는 연필 모양의 버튼을 클릭한다. 그러면 아래와 같은 화면을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-13.png)

여기서 `Mocking` 탭을 클릭한 후, `Mocking behavior` 옵션에서 `Static responses`를 선택한다. 그리고 마지막으로 `Sample or schema responses` 항목의 `200 OK` 옵션을 선택한 후 저장한다. 앞서 정의한 Swagger 문서의 `/products GET` 항목에 추가해 둔 `examples` 노드의 값을 반환할 것이다. 이렇게 저장하고 나오면 화면이 아래와 같이 바뀐다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-14.png)

이 API 엔드포인트를 사용하기 위해서는 API Key를 요청 헤더에 함께 넣어 보내야 하므로, 아래와 같이 Products 설정 화면에서 필요한 설정을 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-15.png)

그리고, 아래와 같이 API Key 값을 확인한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-16.png)

이제 Postman을 통해 API 요청을 날려보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-17.png)

위와 같이 `Ocp-Apim-Subscription-Key` 헤더에 앞서 받아놓은 API Key 값을 입력하고 `GET` 요청을 보내면 swagger 에서 미리 정의해 놓은 예제 응답 객체를 반환한다.

지금까지 Swagger와 Azure API Management를 이용해서 API 목킹을 하는 방법에 대해 살펴보았다. API Management를 사용할 경우 목킹할 때의 URL과 실제 URL이 달라지지 않는다. 즉 프론트엔드 개발자는 동일한 URL을 통해 실제 데이터를 받아볼 수도 있고, 목킹된 결과를 받아볼 수도 있다. MuleSoft의 API Manager와 가장 큰 차이점이라면 이것을 들 수 있다. 또한, 개별 API 엔드포인트별로 목킹을 설정할 수 있다는 것도 큰 장점이다. MuleSoft와 비교해 봤을 때, MuleSoft는 전체 API에 목킹을 설정해서 개별 엔드포인트별로 세세하게 설정할 수 없다는 점이 큰 단점이라면 단점일 것이다. 또한 Azure API Management는 Swagger 라는 사실상의 표준 문서 형식을 사용하므로 다른 서비스로 옮겨가기도 수월하다. 반면에 이 역시도 단점이 있는데, 기본적으로 가격이 너무 비싸다. 개발자 계정으로 인스턴스를 만든다고 해도 한달에 6만원 가까운 비용이 든다. MuleSoft의 API Manager가 기본적으로 무료라는 것을 고려한다면 너무나 비싼 선택일 수 있다.

그렇다면, Swagger를 사용하는 또다른 서비스는 어떨까?

## AWS API Gateway + Swagger

AWS에서 제공하는 [API Gateway](https://aws.amazon.com/api-gateway/) 서비스도 Swagger를 사용한다. 따라서 앞서 정의해 놓은 Product API Swagger 정의 파일을 그대로 이용할 수 있다.

먼저 AWS API Gateway 콘솔에 로그인한 후 Swagger 파일을 불러온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-18.png)

Swagger 파일에 정의해 놓은 모든 API 엔드포인트를 볼 수 있다. 이 중에서 마찬가지로 `/products GET` 엔드포인트를 선택한 후 `Mock` 항목을 선택한 후 저장한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-19.png)

이제 `Method Execution` 화면이 아래와 같이 나타난다. 실제 엔드포인트가 아닌 `Mock Endpoint`로 접속한다는 표시가 화면 우측에 나타난다. 여기서 `Integration Request` 타일을 클릭해서 들어간다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-20.png)

앞서 `Mock` 타입으로 선택한 내용이 화면 상단에 나타나고 하단에 `Request body passthrough` 선택지에서 `When there are no templates defined (recommended)` 항목을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-21.png)

다시 `Method Execution` 화면으로 이동해서 이번엔 `Integration Response` 타일을 클릭해 들어간다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-22.png)

이미 Swagger 문서에서 200 코드에 대한 정의가 들어 있기 때문에 자동으로 표시된다. 맨 왼쪽의 삼각형 모양을 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-23.png)

`Body Mapping Templates` 섹션을 열고 `application/json` 항목을 클릭하면 아래 그림과 같이 우측에 샘플 데이터를 입력할 수 있는 부분이 나타난다. 샘플 응답 객체를 직접 입력한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-24.png)

안타까운 점은 이 부분에 직접 JSON 응답 객체를 넣어줘야 한다는 것이다. 자동으로 템플릿을 생성할 수 있다고는 하는데, 배열 형태의 응답 객체는 제대로 생성하지 못하는 것을 확인했다. 아마도 AWS API Gateway를 위해서는 Swagger 파일에 응답 객체를 정의할 때 배열 보다는 단일 객체로 정의하고 그 안에 별도의 속성으로 배열을 정의하는 형태로 설계를 해야 할 것으로 보인다.

샘플 응답 객체를 입력한 후 저장하고 다시 `Method Execution` 화면으로 돌아간다. 이제 목킹을 위한 준비는 다 끝났고, 실제로 외부에서 이를 이용하기 위해서는 퍼블리시 작업을 더 해줘야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-25.png)

그런데, 여기서 또 한가지 안타까운(?) 점이 있다. 퍼블리시를 하기 위해서는 모든 메소드의 `Integration type`을 개별적으로 모두 정의해야 한다. 한번에 정의할 수 있는 방법이 없다. 만약 엔드포인트가 100개라면 이 모든 엔드포인트를 개별적으로 설정해줘야 한다. 분명히 더 쉬운 방법이 있을텐데 내가 못 찾은 것일 수도 있으니 이 부분은 넘어가도록 하자.

퍼블리시가 끝나면 이 API Gateway에 접근할 수 있는 URL을 받을 수 있다. 이 URL을 이용해서 Postman으로 접속해 보면 앞서 Azure API Management 서비스를 이용할 때와 동일한 결과를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/api-mocking-for-developers-26.png)

지금까지 AWS API Gateway를 이용해서 API 목킹을 해 봤다. API 목킹이라는 관점에서 볼 때, 이 세 서비스를 비교해 보자면 다음과 같다.

- **전체 API 목킹 용이성**: MueSoft, Azure, AWS 이 세 서비스 중에서 API 목킹이 가장 쉬운 것은 MuleSoft의 API Manager이고, 가장 어려운 것은 AWS의 API Gateway이다.
- **개별 API 목킹 용이성**: 개별 엔드포인트별로 세밀하게 목킹하기 좋은 것은 Azure의 API Management인 반면에 MuleSoft의 API Manager는 개별 엔드포인트별 목킹을 지원하지 않는다.
- **API 정의 파일 업로드 자동화**: AWS의 API Gateway는 개별 엔드포인트별로 세밀하게 지원하긴 하지만, Swagger 파일에 정의한 부분임에도 불구하고 업로드 이후 수동으로 설정해야 하는 부분이 너무 많다. 반면에 Azure API Management나 MuleSoft API Manager는 Swagger 또는 RAML 파일을 업로드하면 곧바로 사용할 수 있을만큼 깔끔하게 지원된다.
- **API 목킹 비용**: MuleSoft는 무료로 사용할 수 있고, AWS는 가입후 최초 12개월이 무료인 반면, Azure는 무료가 아니다. 비용을 고려한다면 Azure를 사용하는 것은 재고할 필요가 있다.

이상으로 MuleSoft, Azure, AWS에서 제공하는 API 서비스를 이용해 손쉽게 목킹을 하는 방법에 대해 살펴보았다.
