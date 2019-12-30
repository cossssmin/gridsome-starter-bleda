---
title: "CQRS 초간단 정리"
date: "2013-08-18"
slug: cqrs-oversimplified-overview
description: ""
author: Justin Yoo
tags:
- .NET
- Azure
- Cloud
- CQRS
fullscreen: false
cover: ""
---

CQRS (Command Query Responsibility Segregation) 은 수시로 확장이 용이한 대규모 엔터프라이즈 환경 혹은 클라우드 환경에서 사용하는 아키텍처 패턴 중 하나.

아주아주 간단한 설명은 아래와 같다.

> In an oversimplified manner, CQRS separates commands (that change the data) from the queries (that read the data).
> 
> – Rinat Abdullin from [CQRS Starting Page](http://abdullin.com/cqrs)

간단하게 번역을 해보자면

> CRQS는 (데이터를 변경하는) Command 부분을 (데이터를 읽어들이는) Query 로부터 분리시킨다

라는 것이다. 자세하게 들어가자면 한도 끝도 없지만, 일단 수박 겉핥기 식으로 간단한 이해를 해보도록 하자.

대부분의 데이터베이스 트랜잭션은 데이터베이스로부터 데이터를 읽어들여 화면에 뿌려주는 것이다. 이때, 데이터베이스에서 데이터를 읽는 시점과 화면에 렌더링을 하는 시점은 반드시 차이가 생기기 마련이며, 렌더링하는 데이터는 이미 실제 데이터와는 차이가 생기게 마련이다. `CQRS` 패턴은 이점을 인정하고 여기서부터 시작한다. 따라서, 굳이 하나의 데이터베이스 안에서 CRUD의 R에 해당하는 기능과 나머지 CUD 기능을 공존시키는 것이 의미가 없다는 것이 이 패턴의 핵심. 어차피 R의 결과물은 정도의 차이는 있을지언정 실제 데이터와 다르니 캐쉬로 돌려서 더욱 빠르게 사용자들이 읽어들일 수 있도록 하고, CUD는 메시지 큐를 통해 실제 데이터를 변경시키고, 그 변경이 일어나는 시점에 이벤트를 발생시켜서 캐쉬를 업데이트하는 방식으로 진행하자는 것.

일반적인 시스템에서는 굳이 CQRS 패턴을 적용시킬 필요 까지는 없지만, Windows Azure 라든가 AWS 같은 클라우드 기반 서비스를 이용하면서 Scalability가 시스템의 핵심 요소로 작용할 땐 반드시 고려해야 하는 것들 중 하나.

CQRS 패턴과 관련한 내용은 검색능력이 딸려서 그런지 한국어 관련 내용이 거의 없지 싶다. 가장 추천할만한 링크는 위 인용구문의 당사자인 Rinat Abdullin이 운영하는 웹사이트의 CQRS 섹션인 [CQRS Starting Page](http://abdullin.com/cqrs) 이곳이다. 다들 여기서부터 출발점을 삼으라고 추천하더군.

이외에 다른 읽어볼만한 링크들은 아래와 같다.

- [CQRS Starting Page](http://abdullin.com/cqrs)
- [Clarified CQRS](http://www.udidahan.com/2009/12/09/clarified-cqrs)
- [CQRS on Windows Azure](http://msdn.microsoft.com/en-us/magazine/gg983487.aspx)
- [CQRS Journey](http://msdn.microsoft.com/en-us/library/jj554200.aspx)
