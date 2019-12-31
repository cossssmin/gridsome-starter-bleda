---
title: "AutoMapper 소개"
date: "2015-03-24"
slug: introducing-automapper
description: ""
author: Justin-Yoo
tags:
- dotnet
- auto-mapper
- DTO
fullscreen: false
cover: ""
---

어플리케이션 개발을 하다 보면 수시로 마주치는 문제 아닌 문제가 바로 객체간 형 변환이다. 특히나 데이터 수송 객체 (Data Transfer Object, DTO) 패턴을 쓰다보면 항상 만날 수 있다. 여러 개의 DTO를 하나의 DTO로 합친다거나, 반대로 하나의 DTO를 여러개로 쪼갠다거나, 아니면 비슷하지만 다른 형태의 DTO로 바꾼다거나 하는 등의 작업들이 많은데, 이럴 때 지금 소개하는 [AutoMapper](http://automapper.org)는 상당히 유용하게 쓰일 수 있다.

## AutoMapper 기초

기본적인 사용 방법은 아래와 같다.

```csharp
public class SourceType
{
  public int SourceId { get; set; }
  public string Value { get; set; }
  public DateTime DateUpdated { get; set; }
}

public class TargetType
{
  public string Value { get; set; }
  public DateTime DateUpdated { get; set; }
}

```

위와 같이 소스 타입과 타겟 타입 클라스가 있다고 가정하자. 그러면 우선, 이 둘을 엮어준다고 정의를 내려야 한다.

```csharp
Mapper.CreateMap<SourceType, TargetType>();

```

그 다음에는 단순히 매핑을 시켜주는 메소드를 호출하면 끝이다.

```csharp
var source = new SourceType() { SourceId = 1, Value = "value", DateUpdated = DateTime.Today };
var target = Mapper.Map<TargetType>(source);

```

이렇게 한 후 `target` 객체를 살펴보면 아래 링크와 같이 결과를 확인할 수 있다.

[https://dotnetfiddle.net/T3BmpC](https://dotnetfiddle.net/T3BmpC)

이것이 가능한 이유는 `SourceType`과 `TargetType` 클라스간 속성들의 이름이 동일하기 때문이다. 동일한 속성이름을 갖고 있을 때에는 별다른 추가 작업 없이 알아서 (automagically) 변환을 시켜준다.

## AutoMapper 응용 #1

하지만 일반적으로는 `SourceType`과 `TargetType` 사이에 속성이름이 살짝 다른 경우가 있다. 이럴 땐 아래와 같은 추가 작업을 해주면 된다.

```csharp
public class SourceType
{
  public int SourceId { get; set; }
  public string Value { get; set; }
  public DateTime DateUpdated { get; set; }
}

public class TargetType
{
  public string Value { get; set; }
  public DateTime DateChanged { get; set; }
}

```

위에서 보다시피, `SourceType.DateUpdate` 속성이 `TargetType.DateChanged` 속성으로 바뀌어야 한다. 이럴 땐 아래와 같이 정의를 해준다.

```csharp
Mapper.CreateMap<SourceType, TargetType>()
      .ForMember(d => d.DateChanged, o => o.MapFrom(s => s.DateUpdated));

```

`.ForMember()` 메소드는 두 객체간 다른 속성을 매핑 시킬 경우 어떻게 해야 하는지를 알려주는 메소드이다. 이는 연속해서 사용할 수 있다. 이 응용은 가장 많이 쓰이는 것이므로 잘 기억을 해 두도록 한다. 이후로 동일한 작업을 해보자.

```csharp
var source = new SourceType() { SourceId = 1, Value = "value", DateUpdated = DateTime.Today };
var target = Mapper.Map<TargetType>(source);

```

결과는 아래 링크에서 확인할 수 있다.

[https://dotnetfiddle.net/oj5Jg0](https://dotnetfiddle.net/oj5Jg0)

## AutoMapper 응용 #2

또 하나 자주 사용하는 방법은 여러 소스를 하나의 타켓에 매핑 시키는 것이다. 아래와 같은 DTO 클라스들이 있다고 가정하자.

```csharp
public class SourceType1
{
  public int SourceId { get; set; }
  public string Value { get; set; }
  public DateTime DateUpdated { get; set; }
}

public class SourceType2
{
  public int Rank { get; set; }
}

public class TargetType
{
  public string Value { get; set; }
  public DateTime DateChanged { get; set; }
  public int CurrentRank { get; set; }
}

```

이번엔 `SourceType1`과 `SourceType2`를 `TargetType`으로 매핑 시키려고 한다. 이런 경우에는 아래와 같이 정의해 준다.

```csharp
Mapper.CreateMap<SourceType1, TargetType>()
      .ForMember(d => d.DateChanged, o => o.MapFrom(s => s.DateUpdated));

Mapper.CreateMap<SourceType2, TargetType>()
      .ForMember(d => d.CurrentRank, o => o.MapFrom(s => s.Rank));

```

`SourceType1`과 `SourceType2` 각각을 `TargetType`으로 매핑하는 정의를 선언하고난 후 아래의 코드를 작업해 보자.

```csharp
var source1 = new SourceType1() { SourceId = 1, Value = "value", DateUpdated = DateTime.Today };
var source2 = new SourceType2() { Rank = 2 };

var target = Mapper.Map<TargetType>(source1);
target = Mapper.Map<SourceType2, TargetType>(source2, target);

```

아니면 확장 메소드를 추가적으로 작업하면 위의 코드는 조금 더 간결해 질 수 있다.

```csharp
public static TTarget Map<TSource, TTarget>(this TTarget target, TSource source)
{
  var result = Mapper.Map(source, target);
  return result;
} 

```

위와 같은 확장 메소드를 사용하면 아래와 같다.

```csharp
var source1 = new SourceType1() { SourceId = 1, Value = "value", DateUpdated = DateTime.Today };
var source2 = new SourceType2() { Rank = 2 };

var target = Mapper.Map<TargetType>(source1)
                   .Map(source2);

```

위의 결과는 아래 링크에서 확인해 볼 수 있다.

[https://dotnetfiddle.net/fg8UYs](https://dotnetfiddle.net/fg8UYs)

이 외에도 여러 다양한 방법으로 AutoMapper를 활용할 수 있다. 한가지 확실한 것은 AutoMapper를 이용하면 불필요한 혹은 지루한 반복작업을 상당부분 줄일 수 있다는 것이다. 적극적으로 활용해 볼만한 라이브러리이다.
