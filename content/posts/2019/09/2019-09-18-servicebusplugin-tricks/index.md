---
title: "ServiceBusPlugin 트릭"
date: "2019-09-18"
slug: servicebusplugin-tricks
description: ""
author: Justin Yoo
tags:
- SDK Support on Azure
- Azure Service Bus
- SDK
- Plugin
- Validation
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/09/servicebusplugin-tricks-00.png
---

레거시 방식의 애저 서비스 버스 SDK([WindowsAzure.ServiceBus](https://www.nuget.org/packages/WindowsAzure.ServiceBus/))에서는 메시지 전처리 및 후처리를 위해 이벤트 핸들러를 이용한다. 예를 들어 동기식 메시지 전처리를 위해서는 [`OnSend`](https://docs.microsoft.com/ko-kr/dotnet/api/microsoft.servicebus.messaging.messagesender.onsend)를 사용하고 비동기식 전처리를 위해서는 [`OnBeginSend`](https://docs.microsoft.com/ko-kr/dotnet/api/microsoft.servicebus.messaging.messagesender.onendsend)와 [`OnEndSend`](https://docs.microsoft.com/ko-kr/dotnet/api/microsoft.servicebus.messaging.messagesender.onbeginsend)를 구현해야 한다. 마찬가지로 메시지 후처리를 위해서도 같은 접근 방식을 취하게 되는데, 이 방식이 딱히 나쁜 것은 아니지만, 메시지 전처리/후처리를 위해서 만들어야 하는 코드의 양이 늘어나는 것이 그닥 달갑지많은 않다.

뭔가 좀 더 우아한(?) 방법은 없을까?

다행히도 크로스 플랫폼을 지원하는 애저 서비스 버스 SDK인 [Microsoft.Azure.ServiceBus](https://www.nuget.org/packages/Microsoft.Azure.ServiceBus/)을 살펴보면 이벤트 핸들러는 SDK 안에 숨겨두고 대신 [`ServiceBusPlugin`](https://docs.microsoft.com/ko-kr/dotnet/api/microsoft.azure.servicebus.core.servicebusplugin)을 노출시켜 놓았다. 즉, 이 플러그인만 구현해서 등록해 두면 메시지 전처리 및 후처리를 SDK가 알아서 자동으로 대신 해 주게끔 바뀌었다.

이 포스트에서는 간단하게 이 `ServiceBusPlugin`을 활용해서 애저 서비스 버스 메시지 전처리 및 후처리를 해보는 예제를 다뤄보도록 한다.

## 사용자 케이스 정의

> AS 애플리케이션 관점에서, I WANT 서비스 버스 메시지에 특정 커스텀 프로퍼티가 존재하는지 확인하고 싶다. SO THAT 그래서 해당 프로퍼티가 존재하지 않을 경우 에러를 내게 한다.

## `ServiceBusPlugin` 확장

우선 특정 커스텀 프로퍼티는 메시지의 출처에 해당하는 `sender` 값이다. 하나의 서비스 버스 토픽으로 여러 개의 시스템에서 메시지를 보낼 수 있기 때문에, 출처가 없거나 등록되지 않은 출처에서 오는 메시지는 아예 거부할 수 있게끔 이 플러그인을 만들 계획이다.

`ServiceBusPlugin` 클라스는 추상 클라스여서 직접 사용하지는 못하고 반드시 상속 받아서 사용해야 한다. `SenderValidationPlugin`이라는 클라스를 하나 아래와 같이 만들어 보자.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=sender-validation-plugin-1.cs

`ServiceBusPlugin` 클라스는 추상 프로퍼티인 `Name`이 있는데, 이는 이 플러그인에게 유일한 이름을 줘서 중복 등록을 방지한다. 여기서는 간단하게 플러그인의 FQN을 할당했다.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=sender-validation-plugin-2.cs

또한 이 클라스에는 버추얼 프로퍼티 하나와 버추얼 메소드 두 개가 존재하는데, 이를 통해 실제 플러그인이 작동하는 로직을 구현할 수 있다. 아래와 같이 추가해 보자.

- `ShouldContinueOnException`: 프로퍼티의 기본값은 `false`로 설정해 놨는데, 이는 혹시나 이 플러그인을 통해 메시지를 다루다가 에러가 발생할 경우 그자리에서 멈추고 에러를 처리하게끔 한다.
- `BeforeMessageSend(Message message)`: 메소드는 메시지를 보내기 전 이 플러그인을 통해 앞서 정의한 특정 커스텀 프로퍼티가 존재하는지 여부를 체크한다. 만약 프로퍼티가 존재하지 않는다면, 에러를 발생시켜 아예 메시지 자체를 보내지 않게 할 수 있다.
- `AfterMessageReceive(Message message)`: 메소드는 메시지가 도착한 후 실제로 애플리케이션에서 처리하기 전에 이 플러그인이 먼저 메시지를 살펴보고 커스텀 프로퍼티가 존재하지 않는다면 바로 에러를 발생시켜 메시지를 처리하지 못하게 할 수 있다.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=sender-validation-plugin-3.cs

이제 아래와 같이 `ValidateAsync(Message message)` 메소드를 하나 추가시켜 보자. 프라이빗으로 설정이 되어 있으므로 이 플러그인의 내부에서만 작동하고, 이는 `BeforeMessageSend`와 `AfterMessageReceive`에서 호출한다.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=sender-validation-plugin-4.cs

이제 실제 코드는 아래 `ValidateAsync` 메소드에 모두 들어있다. 메시지를 체크해서 메시지가 없을 경우 에러를, 메시지의 커스텀 프로퍼티가 없을 경우 에러를, 커스텀 프로퍼티가 원하는 값이 아닐 경우 에러를 내고 멈추게끔 코드를 작성해 놓았다.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=validate-async.cs

이제 플러그인 구현이 다 끝났으니 실제로 이를 사용해 보도록 하자.

## `ServiceBusPlugin` 등록 및 사용

플러그인은 `TopicClient`에 곧바로 등록해서 사용할 수 있다. 아래 코드를 살펴보자. 먼저 플러그인 인스턴스를 하나 만들어서 `TopicClient`에 등록시킨다. 그리고 메시지를 바로 보내면 된다. 아래 코드는 `sender` 값이 등록되지 않은 `lorem`이므로 메시지를 보내지 못하고 바로 에러가 생길 것이다.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=topic-send.cs

이번에는 메시지를 받는 쪽에서 한 번 살펴보자. 플러그인 인스턴스를 만들어서 `SubscriptionClient`에 등록시킨다. 그리고 메시지를 받아서 처리하면 자동으로 플러그인 안의 로직이 실행된다.

https://gist.github.com/justinyoo/0466d3a899ef5b8387813e3920d15983?file=subscription-receive.cs

위 코드에서 보면 플러그인을 `TopicClient` 또는 `SubscriptionClient`에 등록함으로써 추가적인 작업 없이도 커스텀 프로퍼티를 자동으로 검증하게 된다. 전체적인 코딩의 양이 확 줄어든 것이 보일 것이다. 게다가 코드 역시 분리가 되어 깔끔해 진 것도 보일 것이다.

* * *

지금까지 애저 서비스 버스 SDK의 플러그인 기능을 이용해 메시지를 검증하는 방식에 대해 논의해 보았다. 애저 서비스 버스 SDK를 사용하면서 메시지에 대해 전처리/후처리가 필요할 경우 이 플러그인 방식을 쓰면 코드도 깔끔하게 분리가 되고 코딩의 양도 줄어들고 하면서 꽤 편리해 질 것이다.
