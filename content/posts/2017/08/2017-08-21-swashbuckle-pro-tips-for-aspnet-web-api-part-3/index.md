---
title: "Swashbuckle 이용시 알아두면 좋을 소소한 팁 #3"
date: "2017-08-21"
slug: swashbuckle-pro-tips-for-aspnet-web-api-part-3
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- Web API
- Open API
- Swagger
- Swashbuckle
fullscreen: false
cover: ""
---

- [Swashbuckle 이용시 알아두면 좋을 소소한 팁 #1](http://blog.aliencube.org/ko/2017/07/31/swashbuckle-pro-tips-for-aspnet-web-api-part-1/)
- [Swashbuckle 이용시 알아두면 좋을 소소한 팁 #2](http://blog.aliencube.org/ko/2017/08/03/swashbuckle-pro-tips-for-aspnet-web-api-part-2/)
- Swashbuckle 이용시 알아두면 좋을 소소한 팁 #3

[지난 포스트](http://blog.aliencube.org/ko/2017/08/03/swashbuckle-pro-tips-for-aspnet-web-api-part-2/)에 이어 이 포스트에서는 [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle) 라이브러리를 이용해서 [Swagger 문서](https://swagger.io)가 XML 문서를 다룰 수 있게 도와주는 확장 기능에 대해 알아본다.

> 이 포스트에 사용된 코드 샘플은 [이곳](https://github.com/devkimchi/Swashbuckle-Tips-Sample-for-ASP.NET-Web-API)에서 확인할 수 있다.

## 참고사항

이 포스트에 사용한 애플리케이션은 아래 스펙으로 만들어졌다:

- [ASP.NET Web API](https://docs.microsoft.com/en-us/aspnet/web-api/)
- [Swagger (Open API) Spec 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)

## Web API 자체 XML 지원 기능

[`Httpconfiguration`](https://msdn.microsoft.com/en-us/library/system.web.http.httpconfiguration.aspx) 클라스는 Web API에 인스턴스 형태로 들어가 있고 기본적으로 JSON과 XML 직렬화/비직렬화를 지원한다. 따라서 Web API를 실행시켜 Swagger UI로 들어가면 아래와 같은 화면을 곧바로 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-01.png) ![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-02.png)

Swashbuckle 라이브러리는 JSON 쪽을 좀 더 잘 지원하는지라 JSON payload 쪽은 자체적으로 `camelCasing`을 지원해서 큰 문제가 안되는데, XML payload를 보면 뭔가 좀 어색하다. XML 노드 이름들이 모두 `PascalCasing`으로 표현된다. 일관성을 위해 `camelCasing`으로 바꿔주려면 어떻게 하면 될까? 아래와 같이 초기 설정 부분을 바꿔주도록 하자.

https://gist.github.com/justinyoo/7d353f345a2e875b7c47679d650f83a1

재밌는 사실은 XML에 `camelCasing`을 적용하기 위해 JSON 직렬화 설정을 바꿔준다는 것이다. 이후 다시 Swagger UI 화면으로 들어가 보면 아래와 같이 바뀐 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-03.png)

이제 실제로 XML payload를 이용해서 아래와 같이 REST API 요청을 보내보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-04.png)

엇, 그런데 Web API의 액션 파라미터 값이 `null`로 넘어온다. 즉 payload를 인식하지 못하는 상황이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-05.png)

이는 `HttpConfiguration` 인스턴스는 기본적으로 XML 문서의 직렬화/비직렬화를 위해 `DataContractSerializer` 직렬화 모델을 지원하는데, 이게 예상대로 동작하지 않는데 있다. 따라서, 이를 `XmlSerializer` 직렬화 모델로 바꿔주면 안정적으로 잘 작동한다. Web API 설정에서 아래와 같은 코드를 한 줄 더 추가해 보자.

https://gist.github.com/justinyoo/17b0dd5ff8353ccd350bf4ca051f2bf2

이제 다시 Web API를 실행시켜 보면 아래와 같은 결과를 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-06.png)

딱히 UI 상에서 변화는 느낄 수 없다. 그렇다면, 위와 같이 몇군데 값을 고쳐서 실제로 API 요청을 보내면서 값을 어떻게 전달하는지 살펴보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-07.png)

요청 객체가 이제는 `null` 값이 아니긴 한데, 뭔가 이상하다. 앞서 API 요청시 `lorem ipsum`과 `123`으로 값을 고쳐서 보냈지만 실제로 그 값이 전달되진 않는다. 무엇이 문제일까? 그렇다면 그냥 `camelCasing`이 아닌 `PascalCasing`으로 XML payload를 만들어 보내면 어떨까?

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-08.png)

실제로 API 요청을 보냈더니 아래와 같은 결과를 볼 수 있다!

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-09.png)

다시 말해서 Swagger UI 화면에는 `camelCasing`이 적용된 것 처럼 보였지만, 실제 payload는 `PascalCasing`으로 보내는 상황이 발생한다. 이를 어떻게 수정하면 좋을까? 앞서 `UseXmlSerializer` 속성값을 `true`로 지정했으니, 모든 요청 객체와 응답객체를 그에 맞게 수정해 주는 작업이 필요하다. `XmlSerializer`는 클라스에 `XmlRoot`, 속성에 `XmlAttribute` 혹은 `XmlElement` 데코레이터를 필요로 한다. 따라서 아래와 같이 모델 클라스를 수정해보자.

https://gist.github.com/justinyoo/4adde034b14bb8ef62b0fb22e19a8561

이제 다시 API를 실행시켜서 요청을 날려보면 아래와 같이 실제 데이터가 전달되는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-10.png) ![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-11.png)

어? 그런데 뭔가 살짝 이상하다. XML 형식의 요청 payload를 다시 한 번 자세히 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-12.png)

예시 문서에는 `ValueRequestModel` 이라고 되어 있지만, 실제 요청 payload는 앞서 `XmlRoot` 데코레이터에 지정한 것과 같이 `request`로 바뀌어 있다. 그렇지 않으면 `null` 값이 넘어간다. 이건 어디서 맞춰줘야 하는 걸까? Swagger 자체는 payload의 형식을 JSON만으로 한정짓지 않고 XML도 허용하고 있다. 하지만 JSON 객체는 루트 레벨이 별도로 없는 반면에 XML 문서는 별도로 루트 레벨의 노드부터 시작해야 하는 제약사항이 있는지라 Swagger 스펙 안에서 이를 위한 별도의 필드를 [`xml`](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#xmlObject) 이라는 이름으로 제공한다. 따라서 Swashbuckle 라이브러리의 `ISchemaFilter` 인터페이스를 구현해서 이 `xml` 필드를 채워주면 된다.

## Schema 객체 내 `xml` 정의

아래 코드를 보면 `ISchemaFilter`를 구현해서 어떻게 요청 객체에 `xml` 필드값을 `request`로 정의할 수 있는지 알 수 있다.

https://gist.github.com/justinyoo/c48baf3f0623d5c34eb9a694aacec580

`ISchemaFilter`는 [비지터 패턴 Visitor Pattern](http://www.dofactory.com/net/visitor-design-pattern)을 이용해서 원하는 타입에만 필터를 적용시킨다.

https://gist.github.com/justinyoo/a596ef4da31c903ad46ffbdbd9ef1627

위와 같이 Swagger 설정 파일에 `ValueRequestModel`과 `ValueResponseModel`을 등록시키면 이 두 객체에만 XML 루트 노드로써 `request`와 `response`를 적용시키게 된다. 실제로 이를 적용시킨 후 다시 API를 실행시켜 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/08/swashbuckle-pro-tips-for-aspnet-web-api-part-3-13.png)

* * *

지금까지 Swashbuckle 라이브러리의 `ISchemaFilter` 인테페이스를 이용해서 XML payload를 구현하는 방법에 대해 살펴보았다.
