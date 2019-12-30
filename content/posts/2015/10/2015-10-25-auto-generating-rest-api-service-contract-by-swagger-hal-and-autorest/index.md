---
title: "Swagger 및 HAL, AutoRest를 이용한 Web API 서비스 콘트랙트 자동화"
date: "2015-10-25"
slug: auto-generating-rest-api-service-contract-by-swagger-hal-and-autorest
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- AngularJs
- TypeScript
- ASP.NET MVC
- AutoRest
- HAL
- Swagger
- Web API
fullscreen: false
cover: ""
---

> 이 내용은 [2015년 10월 24일 진행한 #이모콘](https://www.crowdcast.io/e/emocon2015)에서 발표한 내용을 블로그 포스트에 맞추어 정리한 것입니다. 발표 슬라이드 및 동영상은 아래에서 확인하실 수 있습니다.
> 
> - [동영상 링크](https://www.crowdcast.io/e/emocon2015/13)
> - [슬라이드 링크](https://docs.com/justinyoo/123c6b0a-ed5d-4aa4-8b29-0a9f77392eed/response-deserialisation-by-swagger-with-hal)

[지난 포스트](http://blog.aliencube.org/ko/2015/08/16/applying-hal-to-rest-api)에 이어 이번에는 Swagger 라이브러리를 적용해 보기로 한다.

> - [TypeScript 라이브러리를 이용한 Angular 앱 만들기](http://blog.aliencube.org/ko/2015/09/05/building-angular-app-using-typescript)
> - [Angular 앱에 Web API 적용하기](http://blog.aliencube.org/ko/2015/09/06/applying-web-api-to-angular-app)
> - [Web API 응답 문서에 HAL 적용하기](http://blog.aliencube.org/ko/2015/08/16/applying-hal-to-rest-api)
> - **Swagger 및 HAL, AutoRest를 이용한 Web API 서비스 콘트랙트 자동화**
> - [Angular 앱 상호작용 - 이벤트 소싱과 CQRS](http://blog.aliencube.org/ko/2015/11/12/building-applications-on-cloud-with-event-sourcing-pattern-and-cqrs-pattern)

이 포스트에 사용한 예제 코드는 아래에서 확인할 수 있다.

- `ts-ng` 예제: [https://github.com/devkimchi/TypeScript-WebApi-Sample](https://github.com/devkimchi/TypeScript-WebApi-Sample)
- ASP.NET MVC 예제: [https://github.com/devkimchi/HAL-Swagger-Sample](https://github.com/devkimchi/HAL-Swagger-Sample)

## Swagger 적용하기

[Swagger](http://swagger.io)는 REST API에 대한 표준 인터페이스를 제공하는 구현체이다. Swagger 웹사이트에서는 아래와 같이 정의하고 있다.

> Swagger is a simple yet powerful representation of your RESTful API. With the largest ecosystem of API tooling on the planet, thousands of developers are supporting Swagger in almost every modern programming language and deployment environment. With a Swagger-enabled API, you get interactive documentation, client SDK generation and discoverability. Swagger는 간단하지만 강력한 RESTful API의 구현체이다. 가장 커다란 API 도구 생태계에서 수천명의 개발자들이 거의 모든 현대적인 프로그래밍 언어 및 개발 환경에서 Swagger를 지원하고 있다. Swagger를 지원하는 API에서 서로 상호작용이 가능한 문서화 및 클라이언트 SDK 생성 및 폭 넓은 커버리지를 발견할 수 있을 것이다.

즉, Swagger를 이용하게 되면, REST API를 사용하는 사람 혹은 기계들에게 좀 더 쉽게 접근 가능하게 해 주는 것이고, 굳이 소스 코드를 확인하지 않아도 REST API 구조를 손쉽게 확인할 수 있다. 이 포스트에서는 Swagger의 여러 구현체중 하나인 [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle)을 이용하여 Web API에 앞서 구현한 HAL과 함께 적용시키도록 한다.

사실, Web API 에서 Swagger 구현은 너무나도 간단하다. 단지 [NuGet 패키지](https://www.nuget.org/packages/Swashbuckle)를 다운로드 받아 실행시키면 그걸로 끝이다. NuGet 패키지를 다운로드 받으면 `SwaggerConfig.cs` 라는 파일도 함께 설치가 된다. 이걸 그대로 써도 상관은 없지만 OWIN 환경에서 다른 환경 설정 파일들과 함께 쓰려면 몇가지 변경이 필요하다. 아래는 `SwaggerConfig.cs` 파일의 일부이다.

```csharp
//[assembly: PreApplicationStartMethod(typeof(SwaggerConfig), "Register")]

namespace HalSwaggerSample.HalApiApp
{
  public static class SwaggerConfig
  {
    public static void ConfigSwagger(this HttpConfiguration config)
    {
      Register(config);
    }

    private static void Register(HttpConfiguration config)
    {
      ...
    }
  }
}

```

맨 윗줄은 주석처리해서 직접 실행시키지 않고 `WebApiConfig.cs` 안에서 실행시키는 것으로 바꾸었다. 실제로 파일을 열어보면 아래와 같은 라인을 확인할 수 있을 것이다.

```csharp
// HAL
config.ConfigHal();

// Swagger
config.ConfigSwagger();

```

이렇게 해서 모든 Swagger 설정이 다 끝났다. 참 쉽죠? 이제 Web API 앱을 실행시킨 후 아래의 URL을 입력해 보자.

- [http://localhost:53144/swagger/ui/index](http://localhost:53144/swagger/ui/index)

지금 예제 코드는 `localhost:53144` 라는 URL을 사용하고 있으므로 이부분은 상황에 따라 가변적으로 바뀔 것이다. 기본 Swagger 문서 URL은 `/swagger/ui/index` 이므로 이쪽으로 연결해 보면 아래와 같은 화면을 만날 수 있을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/10/swagger-01.png)

그런데 위 화면에 보면 검색창 같은 곳에 무슨 주소가 쓰여 있다. 바로 이것이 Swagger에서 자동으로 생성한 JSON schema 주소이다. 저 주소로 들어가 보면 아래와 같은 JSON 스키마 파일을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/10/swagger-02.png)

이로써 Swagger 사용법은 끝이다. 뭘 더 바랬음? 하지만 앞서도 언급했다시피, Swagger는 이를 이용해서 클라이언트가 어떻게 REST API를 사용할 수 있는지에 대한 문서를 제공하는 것이므로, 이를 클라이언트에서 직접 확인하는 것이 필요하다.

## AutoRest를 이용한 클라이언트 서비스 콘트랙트 생성

이제 간단한 ASP.NET MVC 앱을 하나 만들어 보도록 하자. 이 앱에서는 앞서 생성한 REST API를 이용하여 데이터를 주고 받는 작업을 할 것이다. 앞서 확인한 JSON 스키마 파일을 `swagger.json` 이라는 파일로 저장한다. 그리고 아래와 같은 라이브러리를 NuGet 으로부터 다운로드 받는다.

- [https://www.nuget.org/packages/AutoRest](https://www.nuget.org/packages/AutoRest)
- [https://www.nuget.org/packages/Microsoft.Rest.ClientRuntime](https://www.nuget.org/packages/Microsoft.Rest.ClientRuntime)

처음 라이브러리는 앞서 저장한 `swagger.json` 파일을 바탕으로 서비스 콘트랙트 및 다타 콘트랙트를 자동 생성해주는 것이고, 두번째 라이브러리는 닷넷에서 연결해주는 라이브러이이다. 그렇다면 이제 서비스 콘트랙트 및 다타 콘트랙트를 생성해 보도록 하자. 처음 라이브러리는 CLI 코맨드로 실행시키는 앱이기 때문에, 간단한 배치파일을 작성하도록 한다.

```bat
..\..\packages\autorest.0.11.0\tools\AutoRest.exe
  -Input swagger.json
  -Namespace HalSwaggerSample.WebApp.Proxies
  -OutputDirectory ..\Proxies
  -CodeGenerator CSharp

```

- `-Input`: Swagger JSON 스키마를 담고 있는 파일 이름을 지정해 준다.
- `-Namespace`: 자동 생성시 필요한 네임스페이스를 지정해 준다.
- `-OutputDirectory`: 자동 생성된 파일이 저장될 장소를 지정해 준다.
- `-CodeGenerator`: 자동 생성 파일의 종류를 지정해 준다. 기본값은 `CSharp`이지만, `Node.js`, `Java`, `Ruby` 등이 가능하다.

위와 같은 명령어를 코맨드 프롬프트 창에서 실행시키면 자동으로 아래와 같은 파일들이 생성된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/10/swagger-03.png)

이 파일들 중에 우리는 `HalSwaggerSampleHalApiApp` 라는 파일을 이용한다. 이를 열어보면 실제 Web API 앱에 대한 엔드포인트 및 서비스 콘트랙트가 정의되어 있다. 이를 이용해서 `HomeController`에 아래와 같이 작성해 본다.

```csharp
[RoutePrefix("")]
public class HomeController : Controller
{
  private readonly IHalSwaggerSampleHalApiApp _proxy;

  public HomeController(IHalSwaggerSampleHalApiApp proxy)
  {
    if (proxy == null)
    {
      throw new ArgumentException(nameof(proxy));
    }

    this._proxy = proxy;
  }

  [Route("{productId}")]
  public virtual async Task<ActionResult> Index(int productId)
  {
    var response = await this._proxy
                             .ProductOperations
                             .GetProductWithHttpMessagesAsync(productId);
    var product = response.Body;
    return View(product);
  }
}

```

이렇게 하면 저 `_proxy` 인스턴스를 통해 Web API와 직접 통신하여 데이터를 주고 받을 수 있다. 이렇게 해서 화면에 뿌리게 되면 아래와 같이 될 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/10/swagger-04.png)

이렇게 해서 ASP.NET MVC 앱에서 Web API와 Swagger/HAL을 이용하여 데이터를 주고 받는 것에 대해 살펴보았다. 그렇다면 앵귤러 앱에서는 어떻게 통신을 할 것인가? 보통 두 가지 방법이 있다. 앵귤라 앱에서 직접 API와 통신하는 방법이 하나, 아니면 앵귤라 앱은 내부 프록시를 통해 데이터를 가져오고, 실제 API와 통신은 내부 프록시 앱이 대행해 주는 방법이 있다. 어떤 것이든 필요에 따라 사용하면 되기 때문에 여기서 더이상 언급은 하지 않고, 다만 샘플 코드를 공유하도록 한다.

- [https://github.com/devkimchi/TypeScript-WebApi-Sample/tree/master/src/TypeScriptAngularWebApiAppHalSwagger](https://github.com/devkimchi/TypeScript-WebApi-Sample/tree/master/src/TypeScriptAngularWebApiAppHalSwagger)

## 마치며

여기까지 해서 HAL, Swagger, AutoRest를 이용하여 REST API 서버의 서비스 콘트랙트 및 다타 콘트랙트를 클라이언트에서 손쉽게 사용하는 방법에 대해 알아 보았다. [다음 포스트](http://blog.aliencube.org/ko/2015/11/12/building-applications-on-cloud-with-event-sourcing-pattern-and-cqrs-pattern)에서는 실제로 서버쪽에서 다타 트랜잭션이 일어날 때 클라우드와 같은 분산 환경에서 효과적으로 적용할 수 있는 이벤트 소싱 패턴과 CQRS 패턴에 대해 알아보도록 하자.
