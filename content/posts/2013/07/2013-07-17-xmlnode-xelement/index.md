---
title: "XmlNode와 XElement간 상호 변환하기"
date: "2013-07-17"
slug: xmlnode-xelement
description: ""
author: Justin-Yoo
tags:
- dotnet
- ASP.NET
- XElement
- XmlNode
fullscreen: false
cover: ""
---

`XElement`와 `XmlNode`는 기본적으로 그 역할이 비슷하다. 하지만 다른 용도로 쓰이는데, 같은 XML 문서를 `XDocument`로 읽어들이는가 (`XElement`) 혹은 `XmlDocument`로 읽어들이는가 (`XmlNode`)에 따라 다르다. 전자는 보통 LINQ to XML 형태로 많이 사용하고, 후자는 Node 검색시 많이 사용한다.

문제는 거의 같은 역할을 하고 있음에도 불구하고 이 둘일 서로 변환시켜주는 방법이 없다는데 있다. 따라서, 익스텐션 메소드를 직접 만들어야 하는데, 아래와 같은 형태로 만들면 된다.


### `XElement` to `XmlNode`

```csharp
public static class XElementExtensions
{
    public static XmlNode ToXmlNode(this XElement element)
    {
        if (element == null)
            return null;

        XmlNode node = null;
        using (var reader = element.CreateReader())
        {
            var xml = new XmlDocument();
            xml.Load(reader);

            node = xml.DocumentElement;
        }
        return node;
    }
}
```


### `XmlNode` to `XElement`

```csharp
public static class XmlNodeExtensions
{
    public static XElement ToXElement(this XmlNode node)
    {
        if (node == null)
            return null;

        XElement element = null;
        var xml = new XDocument();
        using (var writer = xml.CreateWriter())
        {
            node.WriteTo(writer);
            element = xml.Root;
        }
        return element;
    }
}
```

이 두가지 익스텐션 메소드를 이용하면 언제든 손쉽게 바꿀 수 있다.

```csharp
var element = node.ToXElement();
var node = element.ToXmlNode();
```

참조: [Converting XElement into XmlNode](http://stackoverflow.com/questions/5389525/converting-xelement-into-xmlnode/5399711#5399711)
