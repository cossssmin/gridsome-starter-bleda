---
title: "지역 이중화로 구성된 애저 서비스 버스에 애저 펑션을 이용해서 메시지 주고 받기"
date: "2019-10-30"
slug: handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions
description: ""
author: Justin Yoo
tags:
- Enterprise Integration
- Azure Functions
- Dependency Injection
- Fan-in
- Fan-out
- Geo-redundancy
- Azure Service Bus
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-00.png
---

[애저 서비스 버스](https://docs.microsoft.com/ko-kr/azure/service-bus-messaging/service-bus-messaging-overview?WT.mc_id=aliencubeorg-blog-juyoo)는 애저에서 제공하는 여러 메시징 서비스 제품군 중 하나이다. 기본적으로 [월간 99.9%의 업타임을 보장](https://azure.microsoft.com/ko-kr/support/legal/sla/service-bus/v1_1/?WT.mc_id=aliencubeorg-blog-juyoo)하는데, 달리 말하면 이는 한달 30일 기준으로 약 43분 정도의 장애가 발생할 수 있다는 의미이다. 회사에서 사용하는 시스템이 애저 서비스 버스를 사용하고 있는데, 43분 정도의 장애가 일어나도 시스템 운용에 큰 문제가 없다면 상관 없지만, 만약 좀 더 고가용성을 필요로 한다면 [재해 복구 (Disaster Recovery)](https://ko.wikipedia.org/wiki/재해_복구)와 관련해서 [애저 서비스 버스 프리미엄 플랜](https://docs.microsoft.com/ko-kr/azure/service-bus-messaging/service-bus-premium-messaging?WT.mc_id=aliencubeorg-blog-juyoo)을 사용해야 한다.

그런데, 프리미엄 플랜은 스탠다드 플랜에 비해 [비용이 상당히 높은 편](https://azure.microsoft.com/ko-kr/pricing/details/service-bus/?WT.mc_id=aliencubeorg-blog-juyoo)이어서 프리미엄 플랜이 갖는 여러 장점에도 불구하고 도입하기에는 여러 가지 고민을 해야 할 수도 있다. 다행히도 [스탠다드 플랜으로도 얼마든지 고가용성을 구현할 수 있다](https://docs.microsoft.com/ko-kr/azure/service-bus-messaging/service-bus-outages-disasters?WT.mc_id=aliencubeorg-blog-juyoo#active-replication). 이렇게 지역 이중화를 구현한 아키텍처에서는 99.9999%의 고가용성을 유지하고 이는 대략 한 달에 2.6초 정도의 장애율로 환산된다.

물론 프리미엄 플랜에서는 이를 모두 자동으로 관리를 해 주지만, 스탠다드 플랜에서는 우리가 직접 구현하고 관리해야 한다. 이와 관련한 [샘플 코드](https://github.com/Azure/azure-service-bus/tree/master/samples/DotNet/Microsoft.Azure.ServiceBus/GeoReplication)가 이미 깃헙에 올라와 있긴 한데, [서비스 버스 큐](https://docs.microsoft.com/ko-kr/azure/service-bus-messaging/service-bus-dotnet-get-started-with-queues?WT.mc_id=aliencubeorg-blog-juyoo)를 사용한 샘플이어서 [서비스 버스 토픽](https://docs.microsoft.com/ko-kr/azure/service-bus-messaging/service-bus-dotnet-how-to-use-topics-subscriptions?WT.mc_id=aliencubeorg-blog-juyoo)과 관련한 코드는 살짝 다르기도 하다. 따라서, 이 포스트에서는 애저 서비스 버스 토픽을 이용한 지역 이중화 관련 예제 코드를 [애저 펑션](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo)에 적용시켜 보기로 한다.

> 이 포스트에 사용한 샘플 코드는 이곳 [깃헙 리포지토리](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample)에서 다운로드 받을 수 있다.

## 애저 서비스 버스 스탠다드 플랜 인스턴스 생성

우선 애저 서비스 버스 인스턴스를 스탠다드 플랜으로 두 개 생성한다. 여기서는 한국 중부(Korea Central)를 우선 지역(Primary Region)으로, 한국 남부(Korea South)를 차선 지역(Secondary Region)으로 선택했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-01.png) ![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-02.png)

이렇게 두 개의 인스턴스를 만들고 난 후 `my-topic`이라는 이름으로 항목(Topic)을, `my-topic-subscription`이라는 이름으로 구독(Subscription)을 생성했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-03.png)

이렇게 다른 지역에 생성된 서비스 버스 인스턴스 두 개가 만들어졌다. 이제 이 두 인스턴스를 엮어서 메시지 이중화 처리를 해 보도록 하자.

## 애저 펑션 준비하기

우선 애저 펑션을 코딩하면서 사용할 테크닉을 몇 가지 소개하기로 한다. 그다지 어려운 테크닉은 아니라서 쉽게 따라할 수 있을 것이다.

- [환경 변수 비직렬화](https://docs.microsoft.com/ko-kr/azure/app-service/configure-common?WT.mc_id=aliencubeorg-blog-juyoo#configure-app-settings)
- 의존성 주입을 위한 [제어 역전(Inversion of Control; IoC)](https://ko.wikipedia.org/wiki/제어_반전) 컨테이너 생성
- [생성자 주입 펑션 클라스 및 메소드 생성](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-dotnet-dependency-injection?WT.mc_id=aliencubeorg-blog-juyoo)
- 메시지 [팬아웃](https://en.wikipedia.org/wiki/Fan-out_(software))/[팬인](https://en.wikipedia.org/wiki/Fan-in)

### 환경 변수 비직렬화

애저 펑션을 로컬 개발환경에서 만들면 항상 사용하는 파일이 `local.settings.json`이다. 이 파일은 애저 펑션 인스턴스의 App Settings 블레이드를 모방한 것이므로 딕셔너리 구조로 되어 있다. 따라서, 좀 더 구조적인 환경 변수를 사용하려면 아래와 같은 형태로 환경 변수를 구성해야 한다. 전체적인 `local.settings.json` 파일은 [이곳](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/local.settings.json)에서 확인한다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=local-settings.json

자세히 보면 언더스코어 두 개 `__`로 필드를 연결하고 있다. 이렇게 하면 애저 펑션 내부적으로 환경 변수를 비직렬화할 때 [객체를 강타입으로 구분할 수 있다](https://docs.microsoft.com/ko-kr/azure/app-service/configure-common?WT.mc_id=aliencubeorg-blog-juyoo#configure-app-settings)고 한다. 환경 변수에 대한 객체는 아래와 같이 정의해 놓았다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=app-settings-service-bus.cs

`AzureServiceBusSettings` 객체를 보면 `ConnectionStrings` 속성이 있는데, 딕셔너리 타입으로 선언했다. 즉, 지역 이중화를 위해 서비스 버스 인스턴스를 몇 개든 이곳에 정의할 수 있는 셈이다. 이 포스트에서는 우선 지역과 차선 지역 두 곳만 설정하지만, 이론적으로는 더 많은 수의 지역을 설정할 수도 있다.

이 설정을 실제로 인스턴스화 해야 하는데, 이것은 `AppSettings`라는 클라스에서 이루어진다. 아래 코드를 살짝 보도록 하자. 전체 모습은 [이곳](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Configs/AppSettings.cs)을 확인한다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=app-settings.cs

`AppSettings` 클라스는 `AppSettingsBase` 추상 클라스를 상속 받았는데, 이 추상 클라스는 [Aliencube.AzureFunctions.Extensions.Configuration.AppSettings](https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.Configuration.AppSettings/)라는 NuGet 패키지에 들어있다. 이 패키지를 이용하면 위에서 보는 것과 같이 `this.Config.Get<AzureServiceBusSettings>(ServiceBusSettingsKey)` 메소드를 호출해서 곧바로 강타입의 환경 변수 인스턴스를 만들어낸다. 이제 이 `AppSettings` 인스턴스를 IoC 컨테이너에 싱글톤 인스턴스로 등록하게 되는데, 이렇게 함으로써 더이상 환경 변수에 대해서는 고민할 필요가 없어진다.

### IoC 컨테이너 생성

애저 펑션은 최초에는 `static` 한정자를 붙여서만 사용할 수 있었다. 따라서 IoC 컨테이너를 사용하려면 일종의 안티 패턴인 서비스 로케이터를 사용해야 했다. 하지만, 이제는 [IoC 컨테이너를 사용할 수 있게 되면서부터](https://blog.aliencube.org/ko/2019/02/22/revising-dependency-injections-on-azure-functions-v2/), 의존성 관리가 훨씬 쉬워졌다. 아래 [코드](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/StartUp.cs)를 보자.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=ioc-container.cs

앞서 언급했던 `AppSettings` 인스턴스를 싱글톤으로 등록했다. 또다른 인스턴스인 `IMessageService`는 나중에 다시 언급하기로 하고, 이렇게 IoC 컨테이너를 선언했다는 것만 확인한다.

### 펑션 클라스 생성자 주입

이번에는 펑션 클라스를 생성해 보도록 하자. 애저 펑션이 제공하는 [서비스 버스 바인딩](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-bindings-service-bus?WT.mc_id=aliencubeorg-blog-juyoo)은 지역 이중화를 위한 다중 서비스 버스 인스턴스를 지원하지 않는다. 따라서 메시지를 여러 인스턴스로 한 번에 보내기 위해서는 직접 [서비스 버스 SDK](https://docs.microsoft.com/ko-kr/dotnet/api/overview/azure/service-bus?view=azure-dotnet&WT.mc_id=aliencubeorg-blog-juyoo)를 사용해서 구현해야 한다. 여기서는 이 구현을 `IMessageService` 인스턴스를 통해 해결했다.

따라서 이 `IMessageService` 인스턴스를 펑션 클라스 생성자를 통해 주입해야 하는데, 아래 코드를 보면 생성자 주입이 어떤 식으로 작동하는지 알 수 있다. 실제 코드는 [이곳](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/MessageSendHttpTrigger.cs)을 확인한다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=http-trigger.cs

클라스 선언 부분에 보면 더이상 `static` 한정자가 없는 것이 보일 것이다. 그리고 생성자를 통해 곧바로 `IMessageService` 인스턴스를 주입 받았다.

### 메시지 팬아웃 구현

메시지를 보내는 부분을 구현할 차례이다. 아래와 같이 `IMessageService` 인터페이스를 구현한 `MessageService`를 보자. `AppSettings` 인스턴스를 주입 받아 사용한다. 팬아웃 구현에서는 두 메소드만 보면 된다. 하나는 `WithTopicClients()` 메소드이고, 다른 하나는 `SendAsync()` 메소드이다. 실제 구현은 [여기](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Services/MessageService.cs#L38)를 참조하고 여기서는 간략하게만 다뤄본다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=message-with-topic-clients.cs

위 메소드는 `TopicClient`를 등록하는 것인데, `AppSettings` 객체에서 받아온 커넥션 스트링의 갯수만큼 클라이언트를 등록한다. 자세히 보면 `this`를 반환함으로써 [Fluent 인터페이스](https://ko.wikipedia.org/wiki/플루언트_인터페이스)를 구현한 것도 알아두면 좋다.

이제 메시지를 보내는 부분을 들여다 보자. 여기서는 두 개의 서비스 버스 인스턴스로 메시지를 동시에 보낸다. 이와 같이 동일한 메시지를 여러 인스턴스로 한꺼번에 보내는 방식을 [팬아웃](https://en.wikipedia.org/wiki/Fan-out_(software))이라고 한다. 실제 구현은 [여기](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Services/MessageService.cs#L66)를 참조한다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=message-send.cs

이미 `TopicClient` 리스트를 `WithTopicClients()` 메소드를 통해 등록해 두었으므로 이를 그대로 사용하면 된다. 이 때 어느 한 쪽이 일시적으로 사용이 불가능하다고 하더라도 다른 하나가 살아있으면 메시지를 보낸 것으로 간주한다. 하지만, 예외가 두 곳 모두에서 발생한다면 이 때에는 정말 문제가 있는 것이므로 확실하게 예외처리를 해야 한다. 하지만, 지역 이중화를 해 놓았다면 한달에 2.6초 정도의 확률로 발생하기 때문에 큰 문제는 없다고 봐도 무방하다.

여기서는 특별한 기술이 사용됐다기 보다는 단순히 두 인스턴스로 같은 메시지를 동시에 보낸 것이다.

> 이 때 반드시 명심해야 할 부분은 바로 동일한 `MessageId`를 사용하는 것이다. 그렇지 않으면 시스템 상에서는 서로 동일한 메시지라고 인식할 수 없다.

이제 이 구현을 펑션 메소드에서 호출해서 사용할 차례이다. 아래 펑션 메소드를 보자. 클라스에도 `static` 한정자가 사라졌듯이, 메소드에서도 더이상 `static` 한정자를 사용할 필요가 없어졌다. 실제 구현은 [여기](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/MessageSendHttpTrigger.cs#L37)를 참조한다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=http-trigger-send.cs

메소드 안에서 보면 `.WithTopicClients()` 메소드와 `.SendAsync()` 메소드가 체이닝을 이뤄서 실행되고 있는 것이 보일 것이다. 실제로 이 펑션을 실행시켜서 대략 한 다섯 개 정도의 메시지를 보내보도록 하자. 그러면 두 인스턴스에 실제로 다섯 개의 메시지가 도착한 것이 보인다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-04.png)

이제 메시지는 두 개의 인스턴스로 무사히 잘 보내진 것 같으니 받아서 처리하는 부분을 살펴보자.

### 메시지 팬인 구현

우선 메시지를 받아서 처리하려면 `SubscriptionClient`를 생성해야 한다. 등록된 커넥션 스트링을 모두 받아서 클라이언트를 아래와 같이 생성한다. 실제 구현은 [여기](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Services/MessageService.cs#L52)를 참조한다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=message-with-subscription-clients.cs

앞서와 마찬가지로 이 메소드 역시 `this`를 반환함으로써 [Fluent 인터페이스](https://ko.wikipedia.org/wiki/플루언트_인터페이스)를 구현했다.

실제로 메시지를 받아 처리하는 부분을 보자. 이 구현의 핵심은 여러 서비스 버스 인스턴스에서 메시지를 받아와도 동일한 Message ID에 대해 하나만 받고 나머지는 곧바로 완료 처리하는 것에 있다. 통상적인 [팬인](https://en.wikipedia.org/wiki/Fan-in) 개념과는 살짝 다르지만, 기본적으로 여러 곳에서 메시지를 받아서 한번에 처리하는 접근은 동일하다.

[이전 포스트](https://blog.aliencube.org/ko/2019/09/18/servicebusplugin-tricks/)에서 언급한 적이 있는데, SDK를 직접 쓰게 되면 받아서 처리하는 부분은 콜백으로 처리한다. 이 부분이 살짝 어려울 수 있긴 하지만, 아래 코드를 잘 따라가다 보면 쉽게 이해할 수 있다. 실제 구현은 [여기](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/Services/MessageService.cs#L107)를 참조한다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=message-receive.cs

- `onMessageReceived`: C# 7.0 이후에는 메소드 안에 [로컬 펑션](https://docs.microsoft.com/ko-kr/dotnet/csharp/programming-guide/classes-and-structs/local-functions?WT.mc_id=aliencubeorg-blog-juyoo)을 다시 정의할 수가 있다. 따라서 람다 펑션 대신 로컬 펑션으로 작성하면 가독성 측면에서 좀 더 낫다.
    
    - 기본적으로 비동기식으로 처리가 되기 때문에 어느쪽 `SubscriptionClient` 인스턴스에서 콜이 먼저 오는지 알 수 없다.
    - 하지만 동일한 Message ID에 대해 하나만 처리를 해야 하므로 `lock` 블록을 통해 하나의 메시지 ID만 처리하게끔 잠금 처리를 한다.
    - 메시지를 선택했다면, `callbackToProcess` 파라미터를 통해 받아온 람다식으로 실제 메시지를 처리한다.
    - `maxMessageDeduplicationCount` 기본값을 `20`으로 설정해 놓았는데, 사실 아무 숫자가 와도 상관은 없다. 다만, 한번에 처리하는 메시지의 갯수가 이보다 크다면 메시지가 중복처리될 수 있으므로 충분히 큰 숫자를 주는 것이 좋다.
- `onExceptionReceived`: 또 다른 로컬 펑션으로 예외 처리에 쓰인다.
- `MessageHandlerOptions` 인스턴스를 생성할 때 `AutoComplete = true`로 설정했는데, 메시지는 하나만 처리하지만 두 서비스 버스 인스턴스에 들어있는 모든 메시지를 완료 처리해야 메시지 중복 처리 문제를 피할 수 있다.

이렇게 구현한 메소드를 펑션에서 호출한다. 자세한 구현은 [이곳](https://github.com/devkimchi/Azure-Service-Bus-Standard-Geo-Redundancy-Sample/blob/master/src/GeoRedundant.FunctionApp/MessageReceiveHttpTrigger.cs#L36)에서 확인한다.

https://gist.github.com/justinyoo/f8d0e00af42daf449664813600163419?file=http-trigger-receive.cs

위 코드에 보면 `ReceiveAsync()` 메소드에 람다식을 정의해서 보내는데, 바로 이 부분이 실제로 메시지를 처리하는 로직이다. 여기서야 Message ID 값만 보여주지만, 실제 애플리케이션에서는 업무 로직이 들어가야 하는 자리이다.

실제로 이 펑션을 호출해서 결과를 알아보자. 우선 지역 혹은 차선 지역 어느쪽이든 메시지를 먼저 받은 쪽에서만 처리를 하고 다른쪽은 그냥 완료 처리했다. 실제로 아래 그림과 같이 첫번째 메시지만 우선 지역에서 받아서 처리했고 나머지는 차선 지역에서 받아서 처리한 것이 보일 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-05.png)

메시지가 모두 처리가 됐고, 양쪽 서비스 버스 인스턴스에서는 모두 사라진 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/handling-messages-with-geo-redundant-azure-service-bus-via-azure-functions-06.png)

## 알아두어야 할 것들

이렇게 해서 서비스 버스 스탠다드 버전 인스턴스 두 개를 이용해서 지역 이중화 처리를 구현해 보았다. 맨 처음에 언급했다시피 서비스 버스 프리미엄 버전에서는 이 모든 것이 알아서 이루어진다. 하지만 비용적인 측면에서 볼 때 스탠다드 버전을 이용해서 이중화를 해야 할 수도 있다. 여기서 명심해야 할 부분은:

- 이 구현이 active/active 방식이다 보니 서비스 버스 인스턴스가 이중화 되면서 메시지도 이중화가 된다. 즉 스탠다드 버전 두 개를 사용하는 가격이 된다.
- 따라서, 메시지 처리량이 많을 경우 두 개의 스탠다드 인스턴스 사용 비용과 하나의 프리미엄 인스턴스 사용 비용 중에 어느 것이 유리할지 반드시 고려해 봐야 한다.
- 또한, 이 포스트에서 구현한 내용은 반드시 직접 구현해야 하는 것이므로 이 구현에 드는 비용과 유지보수에 드는 비용 역시 고려해 봐야 한다.

이러한 모든 고려사항에도 불구하고 이 방식이 더 유리하다고 판단한다면 꼭 한 번 시도해 보는 것도 좋을 것이다.
