---
title: "레거시 애저 서비스 버스 SDK에서 JSON 객체를 다루는 방법"
date: "2019-09-11"
slug: handling-json-objects-in-legacy-azure-service-bus-sdk
description: ""
author: Justin-Yoo
tags:
- sdk-support-on-azure
- message Driven Architecture
- azure-service-bus
- legacy
- sdk
- serialisation
- deserialisation
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/09/handling-json-objects-in-azure-service-bus-00.png
---

애저 클라우드에서 메시징 기반 아키텍처를 구상한다면 반드시 필요한 것이 바로 [애저 서비스 버스](https://azure.microsoft.com/ko-kr/services/service-bus/)이다. 이 서비스를 사용하기 위해서는 보통 SDK를 이용하면 되는데, 닷넷 쪽에서 SDK를 찾다보면 두 가지가 보인다.

- [Microsoft.Azure.ServiceBus](https://www.nuget.org/packages/Microsoft.Azure.ServiceBus/)
- [WindowsAzure.ServiceBus](https://www.nuget.org/packages/WindowsAzure.ServiceBus/)

첫번째 라이브러리는 .NET Standard 기반의 크로스 플랫폼 라이브러리이고, 여기서는 JSON 객체를 메시지 포맷으로 사용하는 데 있어서 큰 문제가 없다. 반면 두번째 라이브러리는 .NET 4.6.2 이상 버전의 풀 프레임워크에서 작동하는 레거시 라이브러리이다. 이 라이브러리는 기본적으로 XML 문서 포맷을 채택하고 있어서 JSON 객체를 사용하기 힘들다. 하지만, 늘 그랬듯이 방법은 있게 마련이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/well-find-a-way-we-always-have.jpg)

이 포스트에서는 이 두번째 레거시 라이브러리에서 JSON 객체를 활용하는 방법에 대해 알아보도록 한다. 먼저 간략하게 두 라이브러리에서 사용하는 메시지 객체를 살펴보자.

## `Microsoft.Azure.ServiceBus.Message`

첫번째 크로스 플랫폼 라이브러리는 [`Microsoft.Azure.ServiceBus.Message`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.servicebus.message) 클라스를 사용하고, [메시지 본문을 위해 바이트 배열(`byte[]`)값을 사용](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.servicebus.message.body)한다. 따라서, JSON 객체의 직렬화/비직렬화에 큰 문제가 없다. 아래와 같은 형태로 사용하면 아주 쉽다.

https://gist.github.com/justinyoo/6647b4da30201624a6b3eac372c53657?file=microsoft-azure-servicebus-message.cs

## `Microsoft.ServiceBus.Messaging.BrokeredMessage`

문제는 두번째 레거시 라이브러리에 있다. 여기서는 [`Microsoft.ServiceBus.Messaging.BrokeredMessage`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.servicebus.messaging.brokeredmessage) 클라스를 사용하는데 아래와 같은 형태로 객체를 생성해야 한다. 기본적으로 XML serialiser를 직렬화 포맷으로 선택하기 때문에 아래 코드의 첫번째 부분처럼 된다.

https://gist.github.com/justinyoo/6647b4da30201624a6b3eac372c53657?file=microsoft-servicebus-messaging-brokeredmessage-with-serialiser.cs

만약 serialiser를 지정하지 않는다면 어떨까? 여전히 기본값은 XML serialiser이다. 따라서 JSON 객체를 다루고 싶다면 `DataContractJsonSerializer`를 초기화해서 사용해야 한다. 그렇다면, 반드시 이렇게 serialiser를 사용해야 할까? 물론 serialiser를 사용하지 않고 할 수 있는 방법도 있다. 아래 코드를 살펴 보자.

https://gist.github.com/justinyoo/6647b4da30201624a6b3eac372c53657?file=microsoft-servicebus-messaging-brokeredmessage-with-stream.cs

위 코드는 객체를 직렬화하는 대신 아예 `Stream` 객체로 바꿔서 직접 `BrokeredMessage`에 꽂아 넣는 형식이다. 내부적으로는 `Stream` 객체를 이용하는 것처럼 보이므로 내부적으로 처리하게 하도록 하지 말고, 직접 내가 꽂아 넣는 형태를 취하는 셈이다. 이럴 경우에는 굳이 serialiser 객체가 필요 없어진다.

둘 중 어느 것이 더 나은 방식인지는 모르겠다. 객체와 serialiser를 함께 제공하는 것이 좋을까 아니면 객체를 바이트 스트림으로 바꾸고 serialiser 없이 직접 다루는 것이 좋을까? 아마도 기존 코드 베이스가 serialiser를 다루던 상황이었다면 첫번째 방식이 나을 것이고, 그렇지 않다면 두번째 방식이 나을 수도 있다.

선택은 이 글을 읽는 당신의 몫이다!
