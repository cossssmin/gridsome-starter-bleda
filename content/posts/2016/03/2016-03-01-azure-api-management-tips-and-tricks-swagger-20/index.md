---
title: "아주어 API Management 팁 & 트릭 - swagger 2.0"
date: "2016-03-01"
slug: azure-api-management-tips-and-tricks-swagger-20
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- api-management
- asp-net-core
- Azure
- swagger
fullscreen: false
cover: ""
---

[Azure](https://azure.microsoft.com)에서 제공하는 강력한 기능들 중 하나가 바로 [API 매니지먼트 (APIM)](https://azure.microsoft.com/en-us/services/api-management)이다. 마이크로서비스 아키텍처(MSA)를 구현한다거나, 혹은 여러 API를 운영한다면 API의 사용자 입장에서는 여러개의 endpoint 보다는 하나의 통합된 endpoint가 있을 때 훨씬 더 사용하기 편리할 것이다. 그렇다고 해서 수많은 API 애플리케이션을 하나로 통합해서 endpoint를 하나로 운영하는 것은 더더욱 무리일텐데, 이럴 때 사용할 수 있는 방법들중 하나가 바로 이 APIM이다.

> AWS에서는 이를 [API Gateway](https://aws.amazon.com/api-gateway)라고 부르고, 또다른 유명한 것들로는 [Mulesoft](https://www.mulesoft.com)의 솔루션과 [APIGee](http://apigee.com)의 [Edge](http://apigee.com/about/products/api-management)등이 있다.

APIM의 많은 장점들은 다음 기회에 언급하기로 하고, 이 포스트에서는 수많은 API 서비스들을 Swagger 문서를 이용해서 어떻게 통합시키는지에 대해 간단히 알아보도록 한다.

## API 임포트

기본적인 내용은 [Manage your first API in Azure API Management](https://azure.microsoft.com/en-us/documentation/articles/api-management-get-started) 문서와 동일하다. 따라서, 이 포스트에서 다시 언급할 필요는 없다고 본다. 그럼 이 포스트는 무엇에 쓰는 물건인고? 아래 언급할 Swagger.json 파일의 형식에 따라 임포트가 성공할 수도 있고 실패할 수도 있다. 문제는 실패할 경우 왜 실패했는지 에러메시지가 나타나지 않고, 성공했는지 실패했는지 조차도 알 수 없는 상황에 맞닥뜨린다는 데 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/03/apim-with-swagger-01.png)

## 현상

우선 이 swagger.json 파일을 보자. 1.2 버전의 스키마를 이용했다.

https://gist.github.com/justinyoo/d57e8876b16cc0a7b669

이를 이용해서 임포트하면 아무런 문제가 없다. 문제는 바로 2.0 버전의 스키마를 이용해서 만들어진 swagger.json 파일을 임포트할 때 생긴다.

https://gist.github.com/justinyoo/5d3ef5b3a9f64ee46485

문서 자체에는 아무런 문제가 없다. 실제로 이를 이용해서 [swaggerhub.com](https://swaggerhub.com) 같은 서비스에서는 문제 없이 사용이 가능하다. 그런데, APIM 에서는 위와 같은 화면에서 멈추면서 임포트를 할 수가 없다. 그 이유는 아래에 보이는 [Darrel Miller](https://twitter.com/darrel_miller)와의 트윗 대화를 쭈욱 확인해 보면 알 수 있다. 참고로 Darrel은 마이크로소프트의 API 에반젤리스트이다.

<iframe src="//storify.com/justinchronicle/api-management-with-swagger-2-0/embed?border=false" width="100%" height="750" frameborder="no" allowtransparency="true"></iframe>

<script src="//storify.com/justinchronicle/api-management-with-swagger-2-0.js?border=false"></script>

\[<a href="//storify.com/justinchronicle/api-management-with-swagger-2-0" target="\_blank">View the story "API Management with Swagger 2.0" on Storify</a>\]

## 대책 및 구현

위의 대화를 간략하게 정리해 보자면 2.0 버전의 swagger.json 파일을 임포트할 때에는 반드시 `host`, `basePath`, `schemes` 속성을 포함시켜야 한다는 것이다. 이 속성들이 swagger.json 스펙에는 필수 속성이 아니어서 기본값으로 생성이 되지 않기 때문에 간과하기 쉽다. 따라서 이를 위해서는 반드시 `IDocumentFilter` 인터페이스를 구현해서 추가해 주어야 한다. 아래는 ASP.NET Core 애플리케이션에서 `IDocumentFilter` 인터페이스를 구현한 `SchemaDocumentFilter` 클라스이다.

https://gist.github.com/justinyoo/b1068979411fb2f0d6f2

그리고, 이를 `Startup.cs`에서는 아래와 같이 적용시킨다.

https://gist.github.com/justinyoo/44845d980dfe2ef77942

이렇게 한 후 다시 swagger.json 파일을 생성해보면 아래와 같이 제대로 `host`, `basePath`, `schemes` 속성이 만들어진 것을 확인할 수 있다.

https://gist.github.com/justinyoo/077fb118c751ae1034fc

이 swagger.json 파일을 APIM에서 임포트하면 이제는 아무런 문제 없이 사용 가능하다. 이후에 이어진 Darrel 과의 대화에서 위의 속성들이 필수 항목이 아니므로 굳이 꼭 필요한지 확인해보고 필요한 조치를 취하겠다고 했으니 조만간 어떤 식으로든 개선이 이루어질 것이다.

지금까지 API Management 도입을 위해 swagger 2.0 문서를 어떻게 활용해야 하는지에 대해 간략하게 다루어 보았다. API Management 는 이 문제를 제외하고는 상당히 직관적으로 잘 만들어져 있으므로 MSA 를 고려한다거나 여러 API의 통합 endpoint 를 도입하고자 한다면 꼭 고려해볼 만한 서비스이다. API는 굳이 아주어에 있지 않아도 되니 이 역시 금상첨화.
