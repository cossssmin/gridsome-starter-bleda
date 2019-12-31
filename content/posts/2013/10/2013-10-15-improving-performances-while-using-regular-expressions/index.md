---
title: "정규표현식 성능 향상 팁"
date: "2013-10-15"
slug: improving-performances-while-using-regular-expressions
description: ""
author: Justin-Yoo
tags:
- dotnet
- compile-time
- regular-expression
- runtime
fullscreen: false
cover: ""
---

데이터 웨어하우징에 ETL 프로세스는 반드시 필요하다. 이 과정에서 데이터 클렌징을 포함한 텍스트 프로세싱을 진행하게 되는데, 정규표현식은 이 텍스트 프로세싱의 핵심 요소들 중 하나이다. 일반적인 상황에서 정규표현식은 아래와 같은 형태로 사용한다.

```csharp
var value = "abcdefg";
var pattern = @"^abc";
if (Regex.IsMatch(value, pattern))
{
  Console.WriteLine("Match found");
}

```

위의 예제와 같이 정규표현식은 정적 메소드인 `Regex.Ismatch()`의 형태로 쓰였다. 물론 아래와 같은 형태로 쓰일 수도 있다.

```csharp
var value = "abcdefg";
var pattern = @"^abc";
var regex = new Regex(pattern);
if (regex.IsMatch(value))
{
  Console.WriteLine("Match found");
}

```

위의 예제 코드는 정적 메소드인 `Regex.IsMatch()`를 사용하는 대신 `Regex` 인스턴스를 사용한다. 그렇다면 이 둘의 차이는 무엇일까? 바로 성능의 차이라고 할 수 있다. 컴파일 시점에 이미 정규표현식 객체를 포함하고 있는가, 런타임 시점에 그때그때 정규표현식 객체를 초기화 시켜 사용하는가의 차이라고도 할 수 있는데, 일반적인 용도로 사용한다면 두 가지 방법들 사이에는 큰 차이가 없다. 하지만, 대용량의 데이터를 처리하는데 있어서는 조그마한 차이가 엄청난 성능의 향상 혹은 저하를 가져올 수 있다.

`Regex.IsMatch()` 메소드는 정적 메소드로서 내부적으로 아래와 같은 형태로 구현된다.

```csharp
public static IsMatch(string input, string pattern)
{
    var regex = new Regex(pattern);
    return regex.IsMatch(input);
}

```

즉, 정적 메소드를 호출할 때마다 `Regex` 인스턴스가 만들어지고, 쓰이고, 없어지기를 반복한다. 따라서, 동일한 반복작업을 하는 경우 동일한 `Regex` 인스턴스를 한 번 만들어두고 재활용을 한다면 엄청난 성능의 향상을 볼 수 있다. [](http://www.dotnetperls.com/regex-performance)[http://www.dotnetperls.com/regex-performance](http://www.dotnetperls.com/regex-performance) 에서는 컴파일을 하게 된다면 대략 30%의 성능 향상을 나타낸다고 한다.

개발자들의 세계에서는 **If you are doing something repeatedly, you are doing it wrong** 이라는 금언이 있다. 즉, 뭔가 동일한 작업을 반복적으로 한다면, 그건 뭔가 잘못된 것이라는 것이다. 결국 그부분에서 성능 향상을 꾀할 수 있다는 말과 동일하다. 위의 정규표현식 예제도 마찬가지로, 동일한 정규표현식을 여러번 사용한다면, 그것은 미리 컴파일을 해놓고 재활용할 수 있게끔 하는 것이 성능 향상에 유리하다는 말과 동일하다.

참조:

- [http://stackoverflow.com/questions/5854063/how-to-optimize-regular-expression-performance](http://stackoverflow.com/questions/5854063/how-to-optimize-regular-expression-performance)
- [http://stackoverflow.com/questions/414328/using-static-regex-ismatch-vs-creating-an-instance-of-regex](http://stackoverflow.com/questions/414328/using-static-regex-ismatch-vs-creating-an-instance-of-regex)
- [http://www.dotnetperls.com/regex-performance](http://www.dotnetperls.com/regex-performance)
- [http://blogs.msdn.com/b/bclteam/archive/2010/06/25/optimizing-regular-expression-performance-part-i-working-with-the-regex-class-and-regex-objects.aspx](http://blogs.msdn.com/b/bclteam/archive/2010/06/25/optimizing-regular-expression-performance-part-i-working-with-the-regex-class-and-regex-objects.aspx)
- [http://blogs.msdn.com/b/bclteam/archive/2010/08/03/optimizing-regular-expression-performance-part-ii-taking-charge-of-backtracking.aspx](http://blogs.msdn.com/b/bclteam/archive/2010/08/03/optimizing-regular-expression-performance-part-ii-taking-charge-of-backtracking.aspx)
- [http://blogs.msdn.com/b/bclteam/archive/2011/03/28/optimizing-regex-performance-part-3-ron-petrusha.aspx](http://blogs.msdn.com/b/bclteam/archive/2011/03/28/optimizing-regex-performance-part-3-ron-petrusha.aspx)
