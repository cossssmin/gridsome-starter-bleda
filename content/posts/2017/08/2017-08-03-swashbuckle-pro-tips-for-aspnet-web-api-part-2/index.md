---
title: "Swashbuckle 이용시 알아두면 좋을 소소한 팁 #2"
date: "2017-08-03"
slug: swashbuckle-pro-tips-for-aspnet-web-api-part-2
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- web-api
- open-api
- swagger
- swashbuckle
fullscreen: false
cover: ""
---

- [Swashbuckle 이용시 알아두면 좋을 소소한 팁 #1](http://blog.aliencube.org/ko/2017/07/31/swashbuckle-pro-tips-for-aspnet-web-api-part-1/)
- Swashbuckle 이용시 알아두면 좋을 소소한 팁 #2
- [Swashbuckle 이용시 알아두면 좋을 소소한 팁 #3](http://blog.aliencube.org/ko/2017/08/21/swashbuckle-pro-tips-for-aspnet-web-api-part-3/)

[지난 포스트](http://blog.aliencube.org/ko/2017/07/31/swashbuckle-pro-tips-for-aspnet-web-api-part-1/)에 이어 이 포스트에서도 [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle) 라이브러리를 이용해서 [Swagger 문서](https://swagger.io)를 작성할 경우 필요한 확장 기능에 대해 알아본다.

> 이 포스트에 사용된 코드 샘플은 [이곳](https://github.com/devkimchi/Swashbuckle-Tips-Sample-for-ASP.NET-Web-API)에서 확인할 수 있다.

## 참고사항

이 포스트에 사용한 애플리케이션은 아래 스펙으로 만들어졌다:

- [ASP.NET Web API](https://docs.microsoft.com/en-us/aspnet/web-api/)
- [Swagger (Open API) Spec 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)

## Operation 객체 내 `examples` 정의

Swagger 정의 문서에서 예제 객체를 지정하는 부분은 여러 군데가 있다:

- `parameter` 객체 내 `example` 필드
- `responses` 객체 내 `examples` 필드
- `definitions` 객체 내 `example` 필드

별도로 샘플 객체를 정의하지 않는 이상 Swashbuckle 라이브러리는 데이터 타입을 기반으로 기본값만을 제공하는 샘플 객체를 아래와 같이 표시한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-2-01.png)

개별 필드의 데이터 타입을 기반으로 기본값을 그대로 뿌려주는데, 뭔가 쿨하지 않다. 이걸 뭔가 의미있는 데이터로 뿌려주는 방법은 없을까? 물론 있다. 마찬가지로 `IOperationFilter` 인터페이스를 구현하면 된다. 다행히도 누군가 미리 고민을 해서 [NuGet 패키지](https://www.nuget.org/packages/Swashbuckle.Examples/)를 만들어 두었으니 우리는 그걸 활용만 하면 된다. 참 쉽죠? 패키지를 다운로드 받은 후 아래와 같이 예제 코드를 작성한다.

https://gist.github.com/justinyoo/47a9d909187562ef13db29062d5aeac2

이 예제 모델을 Web API의 액션에 데코레이터로 추가한다.

https://gist.github.com/justinyoo/3a203fba96f6ede1f013aa9da9b6423e

마지막으로 Swagger 정의 환경 설정 파일에 OptionFilter 액션을 아래와 같이 추가한다.

https://gist.github.com/justinyoo/7671b1da2a6a401a3bdafbe75c917b11

이렇게 한 뒤 Swagger 페이지를 보면 앞서 지정한 객체 값으로 바뀐 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-2-02.png)

실제 Swagger 문서에서는 아래와 같이 정의된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-2-03.png)

## AutoFixture 라이브러리를 이용한 모델 객체 자동 생성

앞서 작성한 `ValueResponseModelExample` 객체를 이용하면 우리가 원하는 값을 하드코딩해서 박아넣을 수 있다. 만약, 이를 하드코딩하는 대신 자동으로 생성되는 값을 이용하면 어떨까? 원래 [`AutoFixture`](https://github.com/AutoFixture/AutoFixture) 라이브러리는 테스트를 위한 것으로, 테스트 픽스쳐 생성시 임의의 값을 자동으로 만들어서 객체를 생성해주는 역할을 한다. 이 "임의의 값을 자동으로 생성"하는 것에 착안해서 Swagger 정의 문서의 예시 객체를 생성해 보도록 하자.

이번엔 제너릭을 이용한 추상 클라스를 하나 만들어서 요청 객체 및 응답 객체에 모두 적용시켜 보도록 하자.

https://gist.github.com/justinyoo/7d8ce2350e5b25b98689e8974bb2c267

원리는 아주 간단하다. `ModelExample<T>` 라는 추상 클라스는 `AutoFixture`에서 제공하는 `IFixture` 라는 인터페이스를 내부적으로 구현해서 원하는 타입(`T`)의 객체를 임의로 만들어 낸다. 실제로 아래와 같이 요청 객체 또는 응답 객체를 구현할 수 있다.

https://gist.github.com/justinyoo/8589837e0d9804cb2862e7c7d18f86ce

그리고 이를 Web API의 액션에 구현하면 아래와 같다.

https://gist.github.com/justinyoo/2bdb53954ba737dba564be83337a76c8

이후 실제로 Web API를 구동시켜 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-2-04.png)

임의의 값들이 자동으로 들어가서 생성된 것을 볼 수 있다. 이 방법을 이용하면 굳이 예제 객체를 위해 별도의 많은 수고를 할 일이 줄어든다.

* * *

지금까지 Swashbuckle 라이브러리를 사용하면서 필요에 의해 `IOperationFilter` 인테페이스를 구현해야 하는 방법에 대해 알아보았다. 이것 말고도 더 많은 활용예가 있을텐데, 틈나는 대로 소개해 보도록 하겠다.
