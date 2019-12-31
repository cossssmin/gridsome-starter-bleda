---
title: "XmlWriter 클라스와 XmlTextWriter 클라스의 차이"
date: "2013-06-04"
slug: xmlwriter-xmltextwriter
description: ""
author: Justin-Yoo
tags:
- dotnet
- XmlNode
- XmlTextWriter
fullscreen: false
cover: ""
---

[XmlTextWriter](http://msdn.microsoft.com/en-us/library/system.xml.xmltextwriter(v=vs.110).aspx) 클라스는 [XmlWriter](http://msdn.microsoft.com/en-us/library/system.xml.xmlwriter(v=vs.110).aspx) 클라스로부터 상속 받은 클라스이다. 보통 XmlWriter 인스턴스를 생성할 때에는 `XmlWriter.Create()` 메소드를 이용하는데, 팩토리 메소드 패턴의 전형적인 예라고 할 수 있다.

예를 들어 보통 아래와 같은 방식으로 `XmlWriter` 클라스를 사용한다.

```csharp
using (var writer = XmlWriter.Create(filepath))
{
    ...
}
```

`XmlWriter` 인스턴스를 사용하면서 XML 문서를 생성할 때 반드시 쓰이는 메소드는 `WriteString()` 인데, 이 메소드는 XML 문서 생성시 0x00 - 0x1F 사이에 존재하는 화이트 스페이스 문자들을 만나게 되면 예외를 발생시킨다. 반면에 `WriteRaw()` 메소드는 해당 화이트 스페이스 문자들을 모두 이스케이프 시켜 XML 문서를 생성한다.

```csharp
using (var writer = XmlWriter.Create(filepath))
{
    writer.WriteString("<");
    writer.WriterRaw("<");
}
```

위의 예제를 보면 첫번째 `WriteString()` 메소드는 `&lt;` 를 렌더링하고, 두번째 `WriteRaw()` 메소드는 그냥 `<` 를 렌더링 하는 것을 볼 수 있다.

`XmlWriter` 클라스를 이용하여 XML 문서를 생성할 때 유의해야 할 것은 기본 옵션이 유효하지 않은 구간의 화이트 스페이스 문자들을 발견할 경우 예외를 발생시키는 것이므로, `XmlWriterSettings` 인스턴스를 추가하여 `CheckCharacters` 속성에 `false` 값을 설정하거나, 아니면 아예 상속받은 `XmlTextWriter` 클라스를 사용하는 것이 좋다.

```csharp
using (var writer = new XmlTextWriter(filepath, Encoding.UTF8))
{
    ...
}
```

이렇게 `XmlTextWriter` 클라스를 사용하게 되면 기본 설정값이 화이트 스페이스 문자들을 체크하지 않는 것이므로, 유효하지 않은 화이트 스페이스 문자들에 의해 의도하지 않은 에러가 발생하는 것을 방지할 수 있다.

참조: [http://microsoft.public.dotnet.xml.narkive.com/i0swDHmA/xmlwriter-writestring-problem](http://microsoft.public.dotnet.xml.narkive.com/i0swDHmA/xmlwriter-writestring-problem)
