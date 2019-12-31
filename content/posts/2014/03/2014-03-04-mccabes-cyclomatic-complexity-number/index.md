---
title: "McCabe 소프트웨어 복잡도 지수"
date: "2014-03-04"
slug: mccabes-cyclomatic-complexity-number
description: ""
author: Justin-Yoo
tags:
- dotnet
- code-analysis
- code-metrics
- codemaid
- kiss
- mccabe-cyclomatic
- complexity
fullscreen: false
cover: ""
---

소프트웨어 공학 쪽에서 나오는 얘기들 중에 코드 복잡도에 대해 얘기하다보면 항상 언급되는 용어가 있는데 바로 맥카비 복잡도 지수 [McCabe's Cyclomatic Complexity](http://en.wikipedia.org/wiki/Cyclomatic_complexity) 라는 것이 있다. 이와 관련한 논문은 궁금하면 직접 읽어보면 되고[1](#fn-123:1), 그냥 간단하게 말하자면, 소프트웨어 코드가 복잡해지지 않게끔 간결하게 짜야 한단 얘기다. 이건 TDD를 프로젝트에 적용하다보면 꼭 겪는 문제이기도 한데, 메소드 하나가 엄청나게 길다든가, 복잡하다든가 해서 유닛테스트를 할 수가 없는 경우가 생긴다.

이는 흔히 언급하는 KISS (Keep It Simple, Stupid!) 규칙과도 어긋나는 일이기도 한데, 코드가 복잡해지다보면 자연스럽게 생기는 현상이기도 하다. [Aviva Solutions](http://avivasolutions.nl)에서 제공하는 [C# Coding Guidelines](http://csharpguidelines.codeplex.com)에서도 복잡한 메소드 작성을 피하고 가급적 한 메소드는 7개의 선언문 이상을 넘지 않는 것을 권장하고 있다.

그렇다면 닷넷 코딩을 하다보면 이 복잡도 지수를 어떻게 측정해 가면서 할 수 있을까? 다행히도 Visual Studio 에는 코드 복잡도 분석 툴이 기본적으로 내장되어 있어서 아래와 같은 검사 결과를 손쉽게 얻을 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/03/Code.Metrics.png)

위 이미지에서 볼 수 있다시피 클라스 각각에 만들어져 있는 메소드들 저마다에 대한 맥카비 복잡도 지수가 매겨져 있는 것을 볼 수 있다. 원래 논문에서는 복잡도 지수가 10을 넘어가면 반드시 리팩토링을 해야 하는 복잡한 함수라고 정의하고 있으나, 아마도 이 기준은 프로젝트마다 달라질 듯 싶기도 한데, 마이크로소프트에서 기준으로 삼는 복잡도 지수는 리팩토링 임계치가 15, 리팩토링을 고려해야 하는 시점을 10으로 설정한다. [2](#fn-123:2)

이와 더불어 Visual Studio 의 확장기능으로써 구할 수 있는 [Code Maid](http://www.codemaid.net) 라는 툴이 있다. 이 확장 기능을 사용하면 비주얼 스튜디오의 기본 기능보다 훨씬 더 편리하게 코드 복잡도 지수를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/03/Code.Maid_.png)

여기서도 마찬가지로 10을 리팩토링 고려치, 15를 임계치로 설정하고 그에 따라 색상별로 구분이 쉽게 되어 있어서 더욱 편리하다 할 수 있겠다.

![](http://www.codemaid.net/wp-content/uploads/2013/07/Digging_TypeOrder.png)

이런 도구들을 충분히 활용하면 내가 짜고 있는, 내 프로젝트가 만들고 있는 소프트웨어의 어느 부분에서 나쁜 냄새가 나고 있는지 손쉽게 확인이 가능하고, 그에 따른 유연한 대처가 가능해져서 좀 더 생산적인 코딩생활이 될 것으로 확신한다.

* * *

2. [Measuring Software Complexity to Target Risky Modules in Autonomous Vehicle Systems](http://www.mccabe.com/pdf/MeasuringSoftwareComplexityUAV.pdf) [↩](#fnref-123:1)

4. [Code Metrics – Cyclomatic Complexity](http://blogs.msdn.com/b/zainnab/archive/2011/05/17/code-metrics-cyclomatic-complexity.aspx) [↩](#fnref-123:2)
