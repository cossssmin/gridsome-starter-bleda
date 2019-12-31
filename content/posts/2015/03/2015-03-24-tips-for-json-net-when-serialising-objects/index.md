---
title: "Json.NET을 이용한 객체 Serialisation에 쓰이는 소소한 팁들"
date: "2015-03-24"
slug: tips-for-json-net-when-serialising-objects
description: ""
author: Justin-Yoo
tags:
- dotnet
- json
- json-net
- serialisation
fullscreen: false
cover: ""
---

[Json.NET](http://www.newtonsoft.com/json)은 닷넷 어플리케이션 개발시 가장 자주 쓰이는 라이브러리들 중 하나이다. 심지어 MS도 ASP.NET MVC 라이브러리를 만들 때 자체 [JavaScriptSerializer](https://msdn.microsoft.com/en-us/library/system.web.script.serialization.javascriptserializer(v=vs.110).aspx)를 쓰지 않고 Json.NET 라이브러리를 이용할 정도니 말 다 했지. 그런데, JSON 객체는 굉장히 유연해서 어떤 타입을 정의하기가 힘들다. 하려면야 할 수 있겠지만, 보통 동적으로 속성이 생겼다가 없어졌다가 하는 경우가 많아서 C#과 같은 정적언어에서 직렬화(serialisation)하기에는 굉장히 껄끄러운 경우가 많다. 그런 면에서 Json.NET의 serialisation은 많은 편의성을 제공하는데 몇가지 소소하지만 유용하게 쓸 수 있는 팁을 논의해 보고자 한다.

## `camelCase` 속성 이름 변환

C#의 일반적인 코딩 컨벤션상, 모든 속성은 PascalCase로 작성한다. 예를 들자면 아래와 같은 형태가 된다.

```csharp
public class Product
{
  public int ProductId { get; set; }
  public string Name { get; set; }
  public decimal UnitPrice { get; set; }
}

```

이 클라스를 Json.NET을 이용하여 serialisation하면 아래와 같은 형태가 된다.

```csharp
var product = new Product() { ProductId = 1, Name = "MyProduct", UnitPrice = 10.00M };
var serialised = JsonConvert.SerialiseObject(product);

Console.WriteLine(serialised);

// { "ProductId": 1, "Name": "MyProduct", "UnitPrice": 10.00 }

```

그런데, 이렇게 serialised 된 JSON 객체는 일반적인 JSON 객체의 네이밍 컨벤션과는 다르다. 보통은 `camelCase` 이거나 `lowercase` 이거나, `lower_case` 같은 형태의 key를 갖기 때문인데, 이를 위해서는 약간의 조정이 필요하다. 이 때 사용할 수 있는 것이 `JsonSerializerSettings` 클라스이다.

```csharp
var settings = new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
var serialised = JsonConvert.SerializeObject(product, settings);

Console.WriteLine(serialised);

// { "productId": 1, "name": "MyProduct", "unitPrice": 10.00 }

```

위와 같이 `JsonSerializerSettings.ContractResolver` 속성에 `CamelCasePropertyNamesContractResolver` 클라스를 설정해 놓으면 JSON 객체 serialisation 결과가 달라진 것을 확인할 수 있다.

## `lowercase` 속성 이름 변환

비슷한 방법으로 `lowercase`로 변환시킬 수도 있는데, `CamelCasePropertyNamesContractResolver` 클라스는 Json.NET에서 기본으로 제공하는 클라스이지만 그 이외에는 직접 만들어야 한다. 아래와 같이 `LowerCasePropertyNamesContractResolver` 클라스를 만들어 같은 방법으로 적용시킨 후 그 결과를 확인해 보도록 하자.

```csharp
public class LowerCasePropertyNamesContractResolver : DefaultContractResolver
{
  protected override string ResolvePropertyName(string propertyName)
  {
    return propertyName.ToLower();
  }
}

```

위와 같이 `DefaultContractResolver` 클라스를 상속받아서 만든 `LowerCasePropertyNamesContractResolver` 클라스를 아래에 적용시켜 보도록 하자.

```csharp
var settings = new JsonSerializerSettings() { ContractResolver = new LowerCasePropertyNamesContractResolver() };
var serialised = JsonConvert.SerializeObject(product, settings);

Console.WriteLine(serialised);

// { "productid": 1, "name": "MyProduct", "unitprice": 10.00 }

```

달라진 결과가 보이는가?

## `lower_case` 속성 이름 변환

이번에는 key에 `_`가 들어간 경우를 생각해 보자. 일반적인 속성 이름에는 `_`가 들어가지 않는다. 하지만, JSON 객체에서는 제한없이 들어가기도 하는데, 심지어 속성 key 값에 `.`가 들어가는 경우도 있다. 이럴 경우에는 단순히 위의 `ContractResolver`로 해결할 수 없고 다른 방법이 필요하다. 이 때 쓰일 수 있는 것이 `JsonPropertyAttribute` 클라스이다. 아래의 예제 코드를 보자.

```csharp
public class Product2
{
  [JsonProperty(PropertyName = "Product_Id")]
  public int ProductId { get; set; }

  [JsonProperty(PropertyName = "Product.Name")]
  public string Name { get; set; }

  public decimal UnitPrice { get; set; }
}

```

위와 같이 각각의 속성에 `JsonProperty`라는 속성 클라스를 적용시키고 `PropertyName` 값으로 원하는 key 값을 지정하면 된다.

```csharp
var product2 = new Product2() { ProductId = 2, Name = "My Another Product", UnitPrice = 20.00M };
var settings = new JsonSerializerSettings() { ContractResolver = new LowerCasePropertyNamesContractResolver() };
serialised = JsonConvert.SerializeObject(product2, settings);

Console.WriteLine(serialised);

// { "product_id": 2, "product.name": "My Another Product", "unitprice": 20.00 }

```

JSON 객체의 key 값들이 원하는 형태로 바뀐 것을 확인할 수 있다.

## 선택적 Serialisation

기본적으로 객체의 모든 속성은 값이 있건 없건 serialisation 결과는 해당 속성의 기본값을 바탕으로 한다. 즉, `int` 속성의 경우에는 `0`, `bool` 속성의 경우에는 `false`를 기본값으로 갖는다. 따라서 객체의 속성에 별다른 값을 할당하지 않는다고 해도 저와 같은 기본값을 바탕으로 serialisation 결과를 얻을 수 있다. 그러나, 경우에 따라서는 `null`의 경우, 혹은 기본값의 경우에는 serialisation 결과에서 제외시켜야 할 수도 있다. 이런 경우에는 `JsonIgnoreAttribute`를 사용하면 되는데, 이것은 일괄적으로 serialisation 결과에서 제외시키는 것이지만, 조건에 따라서 어떨 땐 포함하고, 어떨 땐 제외하고 하는 목적에는 맞지 않다. 그렇다면 어떤 방법이 있을까?

.NET 프레임워크에서 제공하는 XML serialisation 기능 중에 [`ShouldSerialize`](https://msdn.microsoft.com/en-us/library/53b8022e.aspx) 기능이 있다. Json.NET 라이브러리도 마찬가지로 비슷한 [`ShouldSerialize`](http://www.newtonsoft.com/json/help/html/ConditionalProperties.htm) 기능이 있어서 이것을 활용하면 된다. 앞서 정의한 `Product2` 클라스에 `Description`이라는 추가 속성을 정의해보자.

```csharp
public class Product2
{
  [JsonProperty(PropertyName = "Product_Id")]
  public int ProductId { get; set; }

  [JsonProperty(PropertyName = "Product.Name")]
  public string Name { get; set; }

  [JsonProperty(PropertyName = "Product.Description")]
  public string Description { get; set; }  

  public decimal UnitPrice { get; set; }
}

```

이 `Description` 속성은 값이 있을 경우에만 serialisation 결과에 포함시키고 없으면 제외한다고 가정할 때, 아래와 같은 `ShouldSerialize` 기능을 추가한다.

```csharp
public class Product2
{
  public bool ShouldSerializeDescription()
  {
    return !String.IsNullOrWhiteSpace(this.Description);
  }
}

```

메소드 이름의 형식은 항상 `ShouldSerialize`로 시작해야 한다. 따라서, 이 경우에는 `Description` 속성에 적용시키는 것이므로 메소드의 이름이 `ShouldSerializeDescription`가 되었다. 따라서, 이 조건에 만족하는 경우에는 serialisation 결과에 포함시키고, 만족하지 않으면 제외한다.

만약 여러개의 속성에 적용시키고 싶다면, 해당 메소드를 속성 수에 맞게 만들어서 적용시켜야 한다는 것이 약간의 수고스러운 점이라고 할 수 있다.

```csharp
var product2 = new Product2() { ProductId = 2, Name = "My Another Product", Description = "My Description", UnitPrice = 20.00M };
var settings = new JsonSerializerSettings() { ContractResolver = new LowerCasePropertyNamesContractResolver() };
serialised = JsonConvert.SerializeObject(product2, settings);

Console.WriteLine(serialised);

// { "product_id": 2, "product.name": "My Another Product", "product.description": "My Description", "unitprice": 20.00 }

```

위의 경우에는 `Product2.Description` 속성에 값을 할당해서 serialisation 결과에 포함된 결과이다. 아래 코드를 보자.

```csharp
var product2 = new Product2() { ProductId = 2, Name = "My Another Product", UnitPrice = 20.00M };
var settings = new JsonSerializerSettings() { ContractResolver = new LowerCasePropertyNamesContractResolver() };
serialised = JsonConvert.SerializeObject(product2, settings);

Console.WriteLine(serialised);

// { "product_id": 2, "product.name": "My Another Product", "unitprice": 20.00 }

```

위 결과는 `Product2.Description` 속성에 값을 할당하지 않아 `null`인 상태에서 serialisation을 하다보니 `ShouldSerializeDescription` 메소드의 조건에 해당하지 않아 serialisation 결과값에서 제외되었다.

> 실제 코드는 아래 링크에서 확인할 수 있다. [https://dotnetfiddle.net/wh5SHG](https://dotnetfiddle.net/wh5SHG)

이상으로 Json.NET을 이용하여 객체의 serialisation을 진행하는 과정에서 쏠쏠하게 사용할 수 있는 몇가지 팁에 대해 살펴보았다. 실무에서 어플리케이션 개발시 유용하게 쓰일 수 있기를 기대한다.
