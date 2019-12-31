---
title: "REST API에 HAL(Hypertext Application Language) 적용하기"
date: "2015-08-16"
slug: applying-hal-to-rest-api
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- HAL
- REST
- serialisation
- web-api
fullscreen: false
cover: ""
---

[지난 포스트](http://blog.aliencube.org/ko/2015/09/06/applying-web-api-to-angular-app)에 이어 이번에는 Web API에 HAL을 적용하는 예제를 보기로 한다.

> - [TypeScript 라이브러리를 이용한 Angular 앱 만들기](http://blog.aliencube.org/ko/2015/09/05/building-angular-app-using-typescript)
> - [Angular 앱에 Web API 적용하기](http://blog.aliencube.org/ko/2015/09/06/applying-web-api-to-angular-app)
> - **Web API 응답 문서에 HAL 적용하기**
> - [Swagger 및 HAL, AutoRest를 이용한 Web API 서비스 콘트랙트 자동화](http://blog.aliencube.org/ko/2015/10/25/auto-generating-rest-api-service-contract-by-swagger-hal-and-autorest)
> - [Angular 앱 상호작용 - 이벤트 소싱과 CQRS](http://blog.aliencube.org/ko/2015/11/12/building-applications-on-cloud-with-event-sourcing-pattern-and-cqrs-pattern)

어떤 API를 개발하는데 있어, 해당 API를 어떻게 설계하는가에 따라 그 API를 사용하는 개발자들 또는 사용자들이 굉장한 개발 경험의 차이를 갖는 경우는 참으로 흔하다. 특히, REST API를 제공하는 서비스들의 경우에는 Response 메시지에 단순히 응답 객체만 담을 수도 있겠지만 부가적인 메타 정보들도 담아서 연관된 다른 API를 손쉽게 사용할 수 있게끔 설계하는 경우도 볼 수 있는데, 이런 경우에는 개발자들 입장에서는 굉장한 개발 경험의 상승효과를 누릴 수 있다. 이 포스트에서는 REST API 설계시 Response 메시지에 부가 정보들을 담아서 함께 제공하는 여러 방식들 중 하나인 HAL(Hypertext Application Language)에 대해 알아 보고, 그것을 어떻게 구현할 수 있는지에 대해 논의해 보고자 한다.

## Hypertext Application Language (HAL)

HAL의 최초 제안자이자 작성자인 Mike Kelly의 [포스트](http://stateless.co/hal_specification.html)를 보면 HAL에 대한 정의를 아래와 같이 내리고 있다.

> HAL은 API의 리소스들 사이에 쉽고 일관적인 하이퍼링크를 제공하는 방식이다. API 설계시 HAL을 도입하면 API간에 쉽게 검색이 가능하다. 따라서 해당 API를 사용하는 다른 개발자들에게 좀 더 나은 개발 경험을 제공한다.

즉, HAL을 API Response 메시지에 적용하면 그 메시지가 JSON 포맷이건 XML 포맷이건 API를 쉽게 찾을 수 있는 메타 정보들을 포함시킬 수 있다는 것이다. 특히 Mike Kelly는 이 HAL을 적용하는데 있어서, 이를 위해서 불필요한 추가 작업을 하기 보다는 자동화된 방식을 적용하는 것을 선호한다. 여러 언어들을 이용한 HAL의 오픈 소스 구현체가 있는데, 그 리스트는 [이 링크](https://github.com/mikekelly/hal_specification/wiki/Libraries)에서 확인할 수 있다. 여기서는 C#으로 구현한 아래의 라이브러리를 이용해 보고자 한다. 저 리스트에는 없는 듣보잡 라이브러리이다

- [https://github.com/aliencube/Aliencube.WebApi.Hal](https://github.com/aliencube/Aliencube.WebApi.Hal)

HAL을 적용하는 데 있어서 핵심 고려사항은 바로 개발자의 개발 경험을 해치지 말아야 한다는 것이다. 즉, 개발자는 실제 Response 메시지에 들어갈 객체 자체에만 신경을 써야지, HAL 스펙에 명시된 부가 정보들을 위해 추가적으로 개발 공수를 들일 필요는 없다는 것이다. 위의 라이브러리를 통해 어떤 식으로 구현했는지 알아보도록 하자.

## Response 메시지에 담을 Resource 구현

예를 들어 아래와 같은 두 API를 구현한다고 가정하자.

```bat
GET http://myapi.com/product/1
GET http://myapi.com/products

```

위 API URL은 특정 상품의 정보를 요청한 것이고, 아래 URL은 모든 상품들의 리스트를 요청한 것이다. 이를 위한 `Product`의 모델을 아래와 같이 정의했다고 하자.

```csharp
public class Product
{
  public int ProductId { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
  public decimal UnitPrice { get; set; }
}

```

그렇다면 일반적인 REST API 의 JSON 응답 메시지는 아래와 같을 것이다.

```json
{
  "productId": 1,
  "name": "ABC",
  "description": "Product ABC",
  "unitPrice": 9.99
}

```

응답 메시지 포맷을 XML로 지정한다면 아래와 같은 형태가 될 것이다.

```xml
<Product>
  <ProductId>1</ProductId>
  <Name>ABC</Name>
  <Description>Product ABC</Description>
  <UnitPrice>9.99</UnitPrice>
</Product>

```

만약 `/products` URL로 모든 상품 리스트를 요청했다고 한다면 JSON 응답과 XML 응답 메시지의 형태는 아래와 같을 것이다.

```json
[
  {
    "productId": 1,
    "name": "ABC",
    "description": "Product ABC",
    "unitPrice": 9.99
  },
  {
    "productId": 2,
    "name": "XYZ",
    "description": "Product XYZ",
    "unitPrice": 19.99
  }
]

```

```xml
<Products>
  <Product>
    <ProductId>1</ProductId>
    <Name>ABC</Name>
    <Description>Product ABC</Description>
    <UnitPrice>9.99</UnitPrice>
  </Product>
  <Product>
    <ProductId>2</ProductId>
    <Name>XYZ</Name>
    <Description>Product XYZ</Description>
    <UnitPrice>19.99</UnitPrice>
  </Product>
</Products>

```

## Response 메시지에 HAL 추가 구현

위와 같이 응답 메시지를 구현한다면 사실 일차적으로는 충분하다. 하지만, 부가적인 하이퍼링크 정보들을 더 담아줄 수 있다면 더욱 좋을 것이다. 위에 언급한 [Aliencube.WebApi.Hal](https://www.nuget.org/packages/Aliencube.WebApi.Hal/) 라이브러리는 바로 이 HAL을 손쉽게 구현해 줄 수 있게끔 해 준다. 이 라이브러리는 `LinkedResource`와 `LinkedResourceCollection` 클라스 포함하고 있는데, `LinkedResource` 클라스는 아래와 같은 형태를 갖는다.

```csharp
public abstract class LinkedResource
{
  protected LinkedResource()
  {
      this.Links = new List<Link>();
  }

  [JsonIgnore]
  public string Href { get; set; }

  [JsonIgnore]
  public List<Link> Links { get; private set; }
}

```

`LinkedResourceCollection` 클라스는 조금 복잡한데, `LinkedResource` 클라스 자체를 상속 받을 뿐만 아니라 `ICollection`, `ICollection<T>` 인터페이스를 함께 구현한다. 여기서 T는 `LinkedResource` 타입을 상속받은 클라스만을 허용한다. `List<T>` 형태로 구현하지 않은 이유는 콜렉션 자체가 하나의 객체 형태를 가져야 하기 떄문이다. 이 클라스 구현의 자세한 내용은 [https://github.com/aliencube/Aliencube.WebApi.Hal/blob/master/src/Aliencube.WebApi.Hal/Resources/LinkedResourceCollection.cs](https://github.com/aliencube/Aliencube.WebApi.Hal/blob/master/src/Aliencube.WebApi.Hal/Resources/LinkedResourceCollection.cs)를 참조하도록 하자.

이제 이렇게 `LinkedResource`와 `LinkedResourceCollection` 클라스의 구현이 끝났다면 아래와 같이 `Product` 클라스를 수정하여 `LinkedResource` 를 상속받게끔 하자. 마찬가지로 `Products` 클라스를 하나 만들어 이를 `Product` 콜렉션에 활용할 수 있게끔 하자.

```csharp
public class Product : LinkedResource
{
  public int ProductId { get; set; }
  public string Name { get; set; }
  public string Description { get; set; }
}

public class Products : LinkedResourceCollection<Product>
{
  public Products() : base()
  {
  }

  public Products(List<Product> items) : base(items)
  {
  }
}

```

사실, 이렇게 하면 기존의 객체에 HAL을 추가하기 위한 기본적인 작업은 끝났다고 할 수 있다. 이제 실제로 이를 Web API에서 어떻게 구현해 내는지 보도록 하자.

## Web API에 HAL 적용 - `Startup` 혹은 `Global.asax`

아래의 예제는 OWIN으로 구현한 Web API 예제 코드이다. OWIN에는 `Global.asax` 파일이 존재하지 않는 대신 `Startup.cs` 파일이 이를 대체한다.

```csharp
public class Startup
{
  public void Configuration(IAppBuilder appBuilder)
  {
    ...

    WebApiConfig.Configure(GlobalConfiguration.Configuration);

    ...
  }
}

```

만약 `Global.asax` 파일에 이를 구현하고자 한다면 아래와 같이 구현할 수 있다.

```csharp
public class WebApiApplication : System.Web.HttpApplication
{
  protected void Application_Start(object sender, EventArgs e)
  {
    ...

    WebApiConfig.Configure(GlobalConfiguration.Configuration);

    ...
  }
}

```

위에서 확인할 수 있다시피 이제 `WebApiConfig.Configure(HttpConfiguration)` 메소드를 구현할 차례이다. 이는 보통 `App_Start` 폴더 안에 구현이 되므로 아래와 같이 확인할 수 있다.

```csharp
public static class WebApiConfig
{
  public static void Configure(HttpConfiguration config)
  {
    ...

    config.ConfigHalFormatter();

    ...
  }
}

```

위의 예제 코드에서 보이는 `ConfigHalFormatter()` 확장 메소드는 이미 [Aliencube.WebApi.Hal](https://github.com/aliencube/Aliencube.WebApi.Hal) 라이브러리에 구현되어 있는 것이므로 그대로 호출하기만 하면 된다. 하지만 조금 더 직접 콘트롤을 하고 싶다면 아래와 같은 내용을 `WebApiConfig.Configure(HttpConfiguration)` 메소드에 추가할 수 있다.

```csharp
var settings = new JsonSerializerSettings()
                   {
                       ContractResolver = new CamelCasePropertyNamesContractResolver(),
                       MissingMemberHandling = MissingMemberHandling.Ignore,
                   };

var jsonFormatter = new HalJsonMediaTypeFormatter()
                        {
                            SerializerSettings = settings,
                        };

var xmlFormatter = new HalXmlMediaTypeFormatter()
                       {
                           Namespace = "http://schema.aliencube.org/xml/2015/08/hal",
                       };

config.Formatters.Remove(config.Formatters.JsonFormatter);
config.Formatters.Insert(0, jsonFormatter);
config.Formatters.Insert(1, xmlFormatter);

```

위의 내용은 기존의 `HttpConfiguration` 객체 초기화 상태를 변경시키는 것이다. 기존에 초기화 되어 있던 `JsonFormatter` 인스턴스를 `HalJsonMediaTypeFormatter` 인스턴스로 교체하고, `HalXmlMediaTypeFormatter`인스턴스를 기존의 `XmlFormatter` 앞에 배치한다. 그렇게 함으로써 Request 헤더의 `Accept` 값을 `text/json`, `application/json`, `application/hal+json` 중 하나로 지정한다면 우리가 원하는 HAL 이 구현된 JSON 포맷의 Response 메시지를 볼 수 있게 된다. 만약 `Accept` 값을 `text/xml`, `application/xml` 또는 `application/hal+xml`중 하나로 지정한다면 HAL이 구현된 XML 포맷의 Response 메시지를 볼 수 있을 것이다.

또한 `HalXmlMediaTypeFormatter` 인스턴스 생성시 네임스페이스를 지정할 수 있게 되어 있는데, 여기서는 [`http://schema.aliencube.org/xml/2015/08/hal`](http://schema.aliencube.org/xml/2015/08/hal) 네임스페이스를 기본값으로 지정해 놓았다. 실제 저 페이지를 확인해 보면 XML 스키마 정의를 확인할 수 있다.

## Web API에 HAL 적용 - API 콘트롤러 단일 객체

이제 API 콘트롤러에서 위의 `Product` 응답 메시지를 구현해 보도록 한다. 아래의 예제 코드를 보자.

```csharp
[RoutePrefix("product")]
public class ProductController : BaseController
{
  [Route("{productId}")]
  public virtual Product Get(int productId)
  {
    var product = ProductHelper.GetProduct(productId); // #1

    product.Href = this.Request.RequestUri.PathAndQuery; // #2

    return product;
  }
}

```

위의 `ProductController`는 `/product/{productId}` 형태의 리퀘스트들을 처리한다.

- `#1`: `productId`에 해당하는 `Product` 인스턴스를 구한다. 이는 다양한 방법을 통해서 구현할 수 있을 것이다.
- `#2`: `product.Href` 값에는 현재 Request URI룰 지정한다.

여기서 눈여겨 봐야 할 부분은 `product.Href` 속성값 지정이다. 여기서는 간단하게 구현한다고 위와 같이 해 놓았지만, 이 부분은 사실 개발자의 개발 경험에서 벗어난 부분으로 HAL이 담당해야 하는 영역이다. 실제 서비스에서는 이부분을 자동적으로 지정해주는 작업이 필요하다. 마찬가지로 `Product`가 상속한 `LinkedResource` 클라스는 `List<Link> Links` 라는 속성이 있는데, 이 부분이 바로 HAL의 핵심인 하이퍼링크의 콜렉션 부분이다. 이부분 역시도 자동으로 값을 지정해 줄 내용이 별도로 구현되어야 하지만 여기서는 우선 간단하게 직접 지정하는 것으로 했다.

이렇게 구현한 뒤 실제로 `http://localhost/product/1`과 같은 형태로 리퀘스트를 날려보면 아래와 같은 결과를 볼 수 있다.

```json
{
  "_links": {
    "self": {
      "href": "/product/1"
    },
    "collection": {
      "href": "/products"
    },
    "templated": {
      "href": "/product/{productId}",
      "templated": true
    }
  },
  "productId": 1,
  "name": "ABC",
  "description": "Product ABC"
  "unitPrice": 9.99
}

```

만약 XML 리퀘스트였다면 아래와 같을 것이다.

```xml
<?xml version="1.0" encoding="utf-8"?>
<resource xmlns="http://schema.aliencube.org/xml/2015/08/hal">
  <links>
    <link>
      <rel>self</rel>
      <href>/product/1</href>
    </link>
    <link>
      <rel>collection</rel>
      <href>/products</href>
    </link>
    <link>
      <rel>templated</rel>
      <href>/product/{productId}</href>
      <templated>true</templated>
    </link>
  </links>
  <productId>1</productId>
  <name>ABC</name>
  <description>Product ABC</description>
  <unitPrice>9.99</unitPrice>
</resource>

```

## Web API에 HAL 적용 - API 콘트롤러 콜렉션 객체

이번에는 API 콘트롤러에서 위의 `Products` 응답 메시지를 구현해 보도록 한다. 아래의 예제 코드를 보자.

```csharp
[RoutePrefix("products")]
public class ProductsController : BaseController
{
  [Route("")]
  public virtual Products Get()
  {
    var products = ProductHelper.GetProducts(); // #1

    products.Href = this.Request.RequestUri.PathAndQuery; // #2
    products.AddLink(new Link() { Rel = "next", Href = "/products?p=2" });
    products.AddLink(new Link() { Rel = "templated", Href = "/product/{productId}" });

    return products;
  }
}

```

위의 `ProductsController`는 `/products` 형태의 리퀘스트들을 처리한다.

- `#1`: 모든 `Product` 객체를 포함하는 `Products` 콜렉션 인스턴스를 구한다. 이는 다양한 방법을 통해서 구현할 수 있을 것이다.
- `#2`: `product.Href` 값에는 현재 Request URI룰 지정한다. 만약 콜렉션의 양이 방대하다면 페이징을 통해 리퀘스트 한 번에 지정한 수 만큼의 `Product` 객체를 반환할 것이므로 다음 콜렉션 쿼리는 어떤 형태를 갖는지에 대한 힌트 역시 제공할 수 있다. 또한 개별 `Product`에 대한 리퀘스트를 날릴 때에는 어떤 형태로 날릴 수 있는지에 대한 힌트 역시도 제공할 수 있다.

이렇게 구현한 뒤 실제로 `http://localhost/products`과 같은 형태로 리퀘스트를 날려보면 아래와 같은 결과를 JSON 또는 XML 포맷으로 확인할 수 있다.

```json
{
  "_links": {
    "self": {
      "href": "/products"
    },
    "next": {
      "href": "/products?p=2"
    },
    "templated": {
      "href": "/product/{productId}",
      "templated": true
    }
  },
  "_embedded": [
    {
      "_links": {
        "self": {
          "href": "/product/1"
        },
        "collection": {
          "href": "/products"
        },
        "templated": {
          "href": "/product/{productId}",
          "templated": true
        }
      },
      "productId": 1,
      "name": "ABC",
      "description": "Product ABC",
      "unitPrice": 9.99
    },
    {
      "_links": {
        "self": {
          "href": "/product/2"
        },
        "collection": {
          "href": "/products"
        },
        "templated": {
          "href": "/product/{productId}",
          "templated": true
        }
      },
      "productId": 2,
      "name": "XYZ",
      "description": "Product XYZ",
      "unitPrice": 19.99
    }
  ]
}

```

```xml
<?xml version="1.0" encoding="utf-8"?>
<resource xmlns="http://schema.aliencube.org/xml/2015/08/hal">
  <links>
    <link>
      <rel>self</rel>
      <href>/products</href>
    </link>
    <link>
      <rel>next</rel>
      <href>/products?p=2</href>
    </link>
    <link>
      <rel>templated</rel>
      <href>/product/{productId}</href>
    </link>
  </links>
  <resources>
    <resource>
      <links>
        <link>
          <rel>self</rel>
          <href>/product/1</href>
        </link>
        <link>
          <rel>collection</rel>
          <href>/products</href>
        </link>
        <link>
          <rel>templated</rel>
          <href>/product/{productId}</href>
          <templated>true</templated>
        </link>
      </links>
      <productId>1</productId>
      <name>ABC</name>
      <description>Product ABC</description>
      <unitPrice>9.99</unitPrice>
    </resource>
    <resource>
      <links>
        <link>
          <rel>self</rel>
          <href>/product/2</href>
        </link>
        <link>
          <rel>collection</rel>
          <href>/products</href>
        </link>
        <link>
          <rel>templated</rel>
          <href>/product/{productId}</href>
          <templated>true</templated>
        </link>
      </links>
      <productId>2</productId>
      <name>XYZ</name>
      <description>Product XYZ</description>
      <unitPrice>19.99</unitPrice>
    </resource>
  </resources>
</resource>

```

## 마치며

이상과 같이 HAL 스펙을 기존의 REST API에 적용시키는 방법에 대해 알아 보았다. 이의 장점이라면 기존의 개발 경험을 최대한 해치지 않으면서도 HAL 스펙을 적용시킬 수 있다는 것이다. 또한 이를 통해 Response 메시지가 조금 더 풍성해지고, 이렇게 풍성해진 API의 응답 메시지를 활용한다면 다른 개발자들이 좀 더 나은 개발 경험을 가질 수 있다는 것이다. 이것이 HAL이 추구하는 목표라 할 수 있다.

기존의 API에 적용하기에는 어려움이 있다면, 요즘과 같이 마이크로서비스가 추세인 상황에서 새로운 API를 개발할 때 적용시켜보는 것은 어떨까?
