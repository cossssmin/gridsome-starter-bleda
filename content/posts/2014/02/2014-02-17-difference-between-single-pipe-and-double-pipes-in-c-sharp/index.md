---
title: "C#에서 |와 ||, &와 &&의 차이"
date: "2014-02-17"
slug: difference-between-single-pipe-and-double-pipes-in-c-sharp
description: ""
author: Justin Yoo
tags:
- .NET
- Bitwise Operator
- Logical Operator
fullscreen: false
cover: ""
---

C#에서 코딩을 하다보면 `AND` 조건을 위해서는 `&&`, `OR` 조건을 위해서는 `||`를 쓴다. 하지만 종종 `&` 또는 `|` 이런 식으로 하나씩만 쓰는 경우를 볼 때가 있다. 주로 정규식 객체를 초기화하는 경우 혹은 리플렉션을 이용하여 프라이빗 멤버에 접근하려고 하는 경우가 될텐데, 아래 코드를 살짝 들여다 보도록 하자

```csharp
// Initialiseing a regular expression instance.
var regex = new Regex("pattern", RegexOptions.IgnoreCase | RegexOptions.Compiled);

// Accessing a private method via reflection.
var mi = this.GetType().GetMethod("MethodName", BindingFlags.NonPublic | BindingFlags.Instance);
```

위의 코드에서 볼 수 있다시피 정규식 초기화 또는 리플렉션을 통해 프라이빗 메소드에 접근하려는 경우에서는 `|`를 흔히 볼 수 있다. 그렇다면 `||`와 `|`의 차이는 무엇일까? 프로젝트 내 초급 개발자들이 흔히 물어보곤 하는데, 그냥 이걸 Bitwise 연산자이다! 라고만 하면 전공자가 아닌 이상 사실 잘 와닿지 않는다. 그래서 조금 더 풀어 쓰자면 아래와 같다고 할 수 있다.

```csharp
var result1 = condition1 || condition2 || condition3;
var result2 = condition1 | condition2 | condition3;
```

`result1`의 값은 `condition1`이 참이라면 더이상 `condition2`와 `condition3`를 수행하지 않고 `TRUE`가 된다. 이미 `OR` 연산에서 첫번째 조건이 참이 됐기 때문에 더이상 그 이후를 수행할 의미가 없기 때문이다. 반면 `result2`의 값은 `condition1`이 참/거짓인것과 상관 없이 `condition2`, `condition3`를 모두 확인하고 그 세 결과값을 통해 하나라도 참이면 `TRUE`를 갖게 된다. 당연히 `result2`를 수행하는 것이 비용이 높을 것이다.

```csharp
var result3 = condition1 && condition2 && condition3;
var result4 = condition1 & condition2 & condition3;
```

마찬가지로 `result3`의 값은 `condition1`의 값이 거짓이라면 곧바로 `FALSE`를 반환하고 `condition2`, `condition3`를 수행하지 않는다. 반면에 `result4`의 값은 모든 `condition1`, `condition2`, `condition3`를 수행하고 하나라도 거짓값이 있으면 `FALSE`를 반환하게 된다.

결국 아주 특별한 상황이 아니라면 굳이 비용이 높은 `|` 또는 `&`를 사용할 필요가 없다. 맨 위의 예제 코드는 언어의 설계가 그렇게 됐기 때문에 쓰는 것일 뿐이다.

참고로 VB.NET 에서는 `|`는 `Or`, `||`는 `OrElse`, `&`는 `And`, `&&`는 `AndAlso`에 대응한다.

* * *

> 위 글을 [생활코딩 페이스북 커뮤니티](https://www.facebook.com/groups/codingeverybody/719772688063270)에 올리고 난 후 많은 피드백을 받았다. 그에 따라 원문을 다시금 보충하고자 한다. 모든 내용은 C#의 스펙에 따른 것이므로 다른 언어와 다를 수 있다는 점을 전제로 하자.

`&&`와 `||`는 조건부 논리 연산자 conditional logical operator[1](#fn-109:1) 라고 부른다. 이는 short-circuiting 논리 연산자라고도 불리는데, 여기서 이 short-circuiting의 의미는 앞의 조건을 만족하면 뒤의 조건들은 무시한다는 뜻이다. C# 스펙에 정의되어 있는 불린형 조건부 논리 연산자 boolean conditional logical operator[2](#fn-109:2) 로서 이 두 연산자가 작동하는 방식은 다음과 같은 방식을 따른다.

- `condition1 && condition2`의 의미는 `condition1 ? condition2 : false`이다.
- `condition1 || condition2`의 의미는 `condition1 ? true : condition2`이다.

반면 `&`와 `|`는 논리 연산자 logical operator[3](#fn-109:3) 라고 부른다. 즉 `&&`와 `||`보다 좀 더 넓은 범위를 가진 연산자인 셈이다. 이 논리 연산자는 크게 세가지 형태의 미리 정의된 형태를 볼 수 있는데, 정수형 논리 연산자 integer logical operator[4](#fn-109:4), 열거형 논리 연산자 enumeration logical operator[5](#fn-109:5), 불린형 논리 연산자 boolean logical operator[6](#fn-109:6)가 있다. 정수형 논리 연산자는 비트 연산을 수행하고 열거형 논리 연산자 역시 비트 연산을 수행하는데 이는 열거형 내부적으로 정수형으로 변환이 가능하기 때문이다. 단, 이 경우 열거형은 `[Flag]` 속성 클라스와 더불어 2^n 형태의 값을 가져야 한다. 마지막으로 불린형 논리 연산자는 제시된 피연산자를 모두 검사한 후 결과를 반환한다.

```csharp
// integer logical operator
var operand1 = 6;                      // 0110
var operand2 = 10;                     // 1010
var result = operand1 | operand2       // 1110 = 14

// enumeration logical operator
var operand1 = RegexOptions.IgnoreCase // 1 = 0001
var operand2 = RegexOptions.Compiled   // 8 = 1000
var result = operand1 | operand2       // 9 = 1001

// boolean logical operator
var operand1 = true;                   // 1
var operand2 = false;                  // 0
var result1 = operand1 | operand2      // 1
var result2 = operand1 & operand2      // 0
```

위의 코드에서 알 수 있다시피 `&`와 `|`는 모두 비트 연산을 수행하고 그 결과를 반환시킨다.

그렇다면, `&`, `|`와 `&&`, `||` 사이의 관계는 어떠한 것인가? 앞서 불린형 조건부 논리 연산자 항목[2](#fn-109:2)에서 언급했다시피 `&&`와 `||`는 단축형 논리 연산자를 제공하는 것이어서, 굳이 첫번째 피연산자가 조건에 들어맞는다면 그 다음 피연산자를 검사할 필요가 없이 그자리에서 결과값을 반환하고 종료하는 것이다. 따라서, `&` 또는 `|` 연산자는 불린형 논리 연산에서는 피연산자 모두를 검사할 필요가 없다면 쓰지 않는 것이 좋다.

* * *

참고:

- [What is the difference between the | and || or operators?](http://stackoverflow.com/questions/35301/what-is-the-difference-between-the-and-or-operators)
- [VB.Net - Logical/Bitwise Operators](http://www.tutorialspoint.com/vb.net/vb.net_logical_operators.htm)

* * *

2. [C# Language Specification - 7.11 Conditional logical operators](http://msdn.microsoft.com/en-us/library/aa691310(v=vs.71).aspx) [↩](#fnref-109:1)

4. [C# Language Specification - 7.11.1 Boolean conditional logical operators](http://msdn.microsoft.com/en-us/library/aa691311(v=vs.71).aspx) [↩](#fnref-109:2) [↩](#fnref2:2)

6. [C# Language Specification - 7.10 Logical operators](http://msdn.microsoft.com/en-us/library/aa691306(v=vs.71).aspx) [↩](#fnref-109:3)

8. [C# Language Specification - 7.10.1 Integer logical operators](http://msdn.microsoft.com/en-us/library/aa691307(v=vs.71).aspx) [↩](#fnref-109:4)

10. [C# Language Specification - 7.10.2 Enumeration logical operators](http://msdn.microsoft.com/en-us/library/aa691308(v=vs.71).aspx) [↩](#fnref-109:5)

12. [C# Language Specification - 7.10.3 Boolean logical operators](http://msdn.microsoft.com/en-us/library/aa691309(v=vs.71).aspx) [↩](#fnref-109:6)
