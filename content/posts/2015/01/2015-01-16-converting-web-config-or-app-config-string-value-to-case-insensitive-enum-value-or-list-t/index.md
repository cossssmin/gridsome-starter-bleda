---
title: "Web.config/App.config 설정값 문자열을 대소문자 구분 없는 enum 혹은 List 형태로 손쉽게 변환하기"
date: "2015-01-16"
slug: converting-web-config-or-app-config-string-value-to-case-insensitive-enum-value-or-list-t
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- App.Config
- CaseInsensitiveEnumConverter
- CommaDelimitedListConverter
- ConfigurationValueConverter
- ConfigurationSection
- System.Configuration
- TypeConverter
- Web.Config
fullscreen: false
cover: ""
---

닷넷으로 개발을 하다 보면 항상 신경써야 하는 것이 바로 `Web.config` 또는 `App.config`이다. 이 설정 파일 안에는 개발자 임의로 적용 가능한 커스텀 섹션이 있는데, 보통 이 섹션은 [`System.Configuration.ConfigurationSection`](http://msdn.microsoft.com/en-us/library/System.Configuration.ConfigurationSection(v=vs.110).aspx)을 상속받아 strongly-typed class로 만들어서 사용한다. 아래와 같은 `Web.config` 내용이 있다고 가정해 보자.

```xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration>

  ...

  <converterSettings>
    <product status="active" productIds="1,2,3" />
  </converterSettings>

  ...

</configuration>
```

위의 `converterSettings`라는 항목은 기본 `Web.config`안에서 정의한 적이 없기 때문에 별도로 정의를 해 주어야 한다. 이를 위해서는 `<configuration>` 태그 바로 다음에 아래와 같은 형태로 선언을 해 준다.

```xml
<configuration>
  <configSections>
    <section name="converterSettings" type="Aliencube.ConfigurationValueConverter.Configs.ConverterSettings, Aliencube.ConfigurationValueConverter.Configs" requirePermission="false" />
  </configSections>

  ...

</configuration>
```

위 내용을 간단하게 설명해 보자면, 커스텀 섹션 이름은 `converterSettings`로 하기로 하고, `Aliencube.ConfigurationValueConverter.Configs.ConverterSettings`라는 클라스 안에 이와 관련한 메타 데이터들을 정의해 놓았다고 선언을 했다. 그리고, 이 클라스는 `Aliencube.ConfigurationValueConverter.Configs`라는 어셈블리 안에 들어있다.

다시 맨 위의 `converterSettings` 섹션을 보면 `product`라는 이름의 `ConfigurationElement`가 있고, 그 엘리먼트에 `status`와 `productIds`라는 속성이 보인다. 여기서 `status` 속성은 `Unknown`, `Active`, `Inactive`라는 세 값을 갖는다. 이와 같은 내용을 코드로 변환하면 아래와 같다.

```csharp
public class ConverterSettings : ConfigurationSection
{
  [ConfigurationProperty("product", IsRequired = true)]
  public ProductElement Product
  {
    get { return (ProductElement)this["product"]; }
    set { this["product"] = value; }
  }
}

public class ProductElement : ConfigurationElement
{
  [ConfigurationProperty("status", IsRequired = true)]
  [TypeConverter(typeof(CaseInsensitiveEnumConverter<ProductStatus>))]
  public ProductStatus Status
  {
    get { return (ProductStatus)this["status"]; }
    set { this["status"] = value; }
  }

  [ConfigurationProperty("productIds", IsRequired = true)]
  [TypeConverter(typeof(CommaDelimitedListConverter<int>))]
  public List<int> ProductIds
  {
    get { return (List<int>)this["productIds"]; }
    set { this["productIds"] = value; }
  }
}

public enum ProductStatus
{
  Unknown,
  Active,
  Inactive
}
```

위 코드는 커스텀 `ConfigurationSection`을 만들어 봤다면 금방 이해할 수 있는 부분인데, 이 코드에서 눈여겨 봐야 할 부분은 두 군데가 있다. 바로 이 `[TypeConverter(typeof(CaseInsensitiveEnumConverter<ProductStatus>))]` 속성 클라스와 `[TypeConverter(typeof(CommaDelimitedListConverter<int>))]` 부분이다.

## 참고

- 소스코드: [https://github.com/aliencube/Configuration-Value-Converter](https://github.com/aliencube/Configuration-Value-Converter)
- nuget 패키지:
    
    - Case Insensitive Enum Value Converter: [![](https://img.shields.io/nuget/v/Aliencube.CaseInsensitiveEnumConverter.svg)](https://www.nuget.org/packages/Aliencube.CaseInsensitiveEnumConverter/) [![](https://img.shields.io/nuget/dt/Aliencube.CaseInsensitiveEnumConverter.svg)](https://www.nuget.org/packages/Aliencube.CaseInsensitiveEnumConverter/)
    - Comma Delimited List Value Converter: [![](https://img.shields.io/nuget/v/Aliencube.CommaDelimitedListConverter.svg)](https://www.nuget.org/packages/Aliencube.CommaDelimitedListConverter/) [![](https://img.shields.io/nuget/dt/Aliencube.CommaDelimitedListConverter.svg)](https://www.nuget.org/packages/Aliencube.CommaDelimitedListConverter/)

## `CaseInsensitiveEnumConverter<TEnum>` 클라스

기본적으로 `Web.config` 파일에서 `status` 속성값은 반드시 대소문자를 구분하는 `Unknown`, `Active` 혹은 `Inactive` 중 하나가 되어야 한다. 만약 `ACTIVE` 혹은 `active`와 같은 식으로 값을 선언한다면 에러가 발생한다. 이를 방지하기 위해 [`TypeConverter`](http://msdn.microsoft.com/en-us/library/system.componentmodel.typeconverter(v=vs.110).aspx) 속성 클라스를 도입했지만, 이 `TypeConverter`는 `enum` 값의 대소문자 구분 없이 변환하는 메소드를 제공하지 않는다. [`System.Configuration.GenericEnumConverter`](http://msdn.microsoft.com/en-us/library/system.configuration.genericenumconverter(v=vs.110).aspx)가 이미 존재하긴 하는데, 이 역시도 대소문자를 구분하기 때문에 별도의 `CaseInsensitiveEnumConverter<TEnum>`라는 클라스를 작성해야 한다. `CaseInsensitiveEnumConverter<TEnum>` 클라스의 내부를 들여다 보면 아래와 같다.

```csharp
public class CaseInsensitiveEnumConverter<TEnum> : ConfigurationConverterBase where TEnum : struct
{
  public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
  {
    if (value == null)
    {
      throw new ArgumentNullException("value");
    }

    TEnum result;
    if (!Enum.TryParse((string)value, true, out result))
    {
      throw new InvalidOperationException("Invalid enum value");
    }

    return result;
  }
}
```

`CaseInsensitiveEnumConverter<TEnum>` 클라스는 [`System.Configuration.ConfigurationConverterBase`](http://msdn.microsoft.com/en-us/library/System.Configuration.ConfigurationConverterBase(v=vs.110).aspx) 클라스를 상속 받아 사용하는데, 이 추상 클라스는 원래 [`System.ComponentModel.TypeConverter`](http://msdn.microsoft.com/en-us/library/system.componentmodel.typeconverter(v=vs.110).aspx) 클라스를 상속 받은 것이다. 따라서 이 `TypeConverter`에서 정의한 여러 메소드들 중 `ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)`를 수정해서 사용하면 된다.

위 코드와 같이 `Enum.TryParse(value, ignoreCase, out result)` 메소드를 이용하면 대소문자 구분하지 않고 `Web.config`에 정의해 놓은 문자열 값을 `enum` 값으로 곧바로 변환시킬 수 있다.

## `CommaDelimitedListConverter<T>` 클라스

비슷한 방식으로 맨 위의 `<product>` 엘리먼트를 보면 `productIds="1,2,3"`라는 속성값이 있다. 이를 손쉽게 `List<int>` 형태로 바꾸기 위해서 작성한 것이 바로 `CommaDelimitedListConverter<T>` 클라스이다. 이미 [`System.Configuration.CommaDelimitedStringCollectionConverter`](http://msdn.microsoft.com/en-us/library/system.configuration.commadelimitedstringcollectionconverter(v=vs.110).aspx)라는 변환 클라스가 있긴 하지만, 이 역시도 `StringCollection`으로 변환을 시켜줄 뿐이지 실제 원하는 `List<T>` 형태로 바꾸어 주진 않는다. 이제 `CommaDelimitedListConverter<T>` 클라스의 내부를 들여다 보자.

```csharp
public class CommaDelimitedListConverter<T> : ConfigurationConverterBase
{
  public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
  {
    if (value == null)
    {
      throw new ArgumentNullException("value");
    }

    var segments = ((string)value).Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);
    var result = segments.Select(p => (T) ChangeType(typeof (T), p.Trim())).ToList();
    return result;
  }

  private static object ChangeType(Type type, string value)
  {
    if (type == null)
    {
      throw new ArgumentNullException("type");
    }

    object result;
    if (type.IsEnum)
    {
      result = Enum.Parse(type, value, true);
      return result;
    }

    result = Convert.ChangeType(value, type);
    return result;
  }
}
```

마찬가지로 `ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)` 메소드를 재정의해서 `List<T>` 형태로 변환시킬 수 있다.

## 결론

지금까지 간단하게 `Web.config` 설정 파일들의 값들을 변환시키는 예제를 살펴 보았다. 기존에 닷넷 프레임워크에서 제공하는 컨버터로 변환할 수 없다면 `TypeConverter` 클라스를 상속 받아 원하는 타입으로 변환시킬 수 있다. 더 많은 변환 클라스들도 필요에 따라 작성할 수 있을 것이다.
