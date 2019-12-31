---
title: "Enumerable.FirstOrDefault() 메소드가 반환하는 기본 값"
date: "2014-02-16"
slug: what-enumerable-firstordefault-tsource-returns-as-a-default-value
description: ""
author: Justin Yoo
tags:
- .NET
- C#
- Default Value
- Value Type
fullscreen: false
cover: ""
---

`Enumerable.FirstOrDefault<Tsource>()` 메서드 또는 `Enumerable.SingleOrDefault<Tsource>()` 메서드는 시퀀스에서 찾는 값이 없을 경우 `Tsource` 타입의 기본 값을 리턴한다. 대부분의 경우 이 `Tsource` 타입은 클라스와 같은 레퍼런스 타입이거나 `nullable` 타입이어서 그냥 간단하게 `null` 값을 리턴한다.

```csharp
var items = new List() { "Item1", "Item2", "Item3" };
var item = items.FirstOrDefault(p => p.StartsWith("J");

if (item == null)
    throw new Exception("No Item Found"); 
```

위의 예제 코드를 보자. 4번 라인에 보면 `item == null`을 통해 바로 위 `FirstOrDefault()` 메소드를 통해 가져온 값이 `null`인지 아닌지를 체크하고 있다. 앞서 언급했다시피 레퍼런스 타입이나 `nullable` 타입의 경우에는 이렇게 해도 상관이 없다. **거의** 대부분의 경우에서는 이렇게 해도 괜찮다. 하지만 밸류 타입일 경우에는 이렇게 하면 아래와 같은 에러를 볼 수 있다.

> Operator '==' cannot be applied to operands of type 'System.Collections.Generic.KeyValuePair<int,string>' and '<null>'

위의 에러 메시지와 같이 `KeyValuePair<TKey, TValue>`와 같은 밸류 타입일 경우에는 `null` 체크를 위와 같이 할 수가 없기 때문에 다른 방식으로 접근해야 한다.

```csharp
var items = new Dictionary() { { 1, "Item1" }, { 2, "Item2" }, { 3, "Item3" } };
var item = items.FirstOrDefault(p => p.Value.StartsWith("J");

if (item == null)
    throw new Exception("No Item Found"); 
```

위와 같은 코드에서는 4번 라인에서 에러가 날 수 밖에 없기 때문에, 다른 방식으로 접근해야 한다. 이 `FirstOrDefault()` 메소드가 리턴하는 디폴트 값은 바로 `default(TSource)`이다. 즉, 위의 예제에서는 `default(KeyValuePair<int, string>)`이 디폴트 값이다. 따라서, 4번 라인을 아래와 같이 바꾸어 주어야만 에러가 나지 않는다.

```csharp
var items = new Dictionary() { { 1, "Item1" }, { 2, "Item2" }, { 3, "Item3" } };
var item = items.FirstOrDefault(p => p.Value.StartsWith("J");

if (item.Equals(default(KeyValuePair)))
    throw new Exception("No Item Found"); 
```

즉, 이런 경우에 있어서 조금 더 안전한 코드 작성을 위해서는 `null` 체크를 하는 것 보다 `default(type)` 체크를 하는 것이 현명하다 할 수 있다.

* * *

참조:

- [Enumerable.FirstOrDefault Method (IEnumerable)](http://msdn.microsoft.com/en-us/library/bb340482.aspx)
- [Enumerable.SingleOrDefault Method (IEnumerable)](http://msdn.microsoft.com/en-us/library/bb342451.aspx)
