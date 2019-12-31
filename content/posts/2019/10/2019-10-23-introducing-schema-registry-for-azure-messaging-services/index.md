---
title: "애저 메시징 서비스를 위한 스키마 저장소 구현"
date: "2019-10-23"
slug: introducing-schema-registry-for-azure-messaging-services
description: ""
author: Justin-Yoo
tags:
- enterprise-integration
- azure-blob-storage
- azure-event-grid
- azure-event-hub
- eventing
- messaging
- azure-queue-storage
- schema-registry
- azure-service-bus
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/10/introduction-to-schema-registry-for-azure-messaging-service-01.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/10/09/many-meanings-of-message-validation/)에서는 메시지 유효성 검증의 도구로서 스키마 저장소에 대해 논의해 봤다. 클라우드상에서 비동기식 시스템 아키텍처를 구현한다면 메시지 유효성 검사를 위해 고려해 봐야 할 부분이 바로 이 스키마 저장소인데, 애저에서 제공하는 다양한 메시징 서비스 – [큐 스토리지](https://docs.microsoft.com/ko-kr/azure/storage/queues/storage-queues-introduction?WT.mc_id=aliencubeorg-blog-juyoo), [서비스 버스](https://docs.microsoft.com/ko-kr/azure/service-bus-messaging/service-bus-messaging-overview?WT.mc_id=aliencubeorg-blog-juyoo), [이벤트 허브](https://docs.microsoft.com/ko-kr/azure/event-hubs/event-hubs-about?WT.mc_id=aliencubeorg-blog-juyoo), [이벤트 그리드](https://docs.microsoft.com/ko-kr/azure/event-grid/overview?WT.mc_id=aliencubeorg-blog-juyoo) – 중 어느 하나도 스키마 저장소를 현재로서는 지원하지 않는다. 따라서 스키마 저장소 기능은 직접 구현해서 써야 한다.

이 포스트에서는 [애저 블롭 스토리지](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-overview?WT.mc_id=aliencubeorg-blog-juyoo)를 이용해서 스키마 저장소 만들고, 이곳에 스키마를 등록하는 방법에 대해 샘플 코드를 통해 구현해 보도록 한다.

## 샘플 코드 및 라이브러리

이 포스트에서는 [.NET Core](https://docs.microsoft.com/ko-kr/dotnet/core/about?WT.mc_id=aliencubeorg-blog-juyoo)를 기반으로 한 C# 라이브러리를 이용해 [샘플 코드](https://github.com/aliencube/AzureMessaging.SchemaRegistry/tree/master/samples)를 작성했다. 모든 NuGet 라이브러리와 샘플 코드는 아래 링크한 [깃헙 리포지토리](https://github.com/aliencube/AzureMessaging.SchemaRegistry)에서 다운로드 받을 수 있다.

| Package | Document | Download | Version |
| ------- | -------- | -------- | ------- |
| [Aliencube.AzureMessaging.SchemaRegistry](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry/) |
| [Aliencube.AzureMessaging.SchemaRegistry.Sinks](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.Sinks.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.Sinks.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks/) |
| [Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks-blob.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Blob/) |
| [Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks-file-system.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.FileSystem/) |
| [Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks-http.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaRegistry.Sinks.Http/) |
| [Aliencube.AzureMessaging.SchemaValidation](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-validation.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaValidation.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaValidation.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation/) |
| [Aliencube.AzureMessaging.SchemaValidation.HttpClient](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.HttpClient/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-validation-http-client.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaValidation.HttpClient.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.HttpClient/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaValidation.HttpClient.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.HttpClient/) |
| [Aliencube.AzureMessaging.SchemaValidation.ServiceBus](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.ServiceBus/) | [Document](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-validation-service-bus.md) | [![](https://img.shields.io/nuget/dt/Aliencube.AzureMessaging.SchemaValidation.ServiceBus.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.ServiceBus/) | [![](https://img.shields.io/nuget/v/Aliencube.AzureMessaging.SchemaValidation.ServiceBus.svg)](https://www.nuget.org/packages/Aliencube.AzureMessaging.SchemaValidation.ServiceBus/) |

## 게시자/구독자 아키텍처 패턴

지난 포스트에서 언급했던 [게시자(Publisher)/구독자(Subscriber) 패턴](https://docs.microsoft.com/ko-kr/azure/architecture/patterns/publisher-subscriber?WT.mc_id=aliencubeorg-blog-juyoo)에 스키마 저장소를 추가한 아키텍처 다이어그램은 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/introduction-to-schema-registry-for-azure-messaging-service-01.png)

이 포스트를 통해 우리가 구현할 부분은 아래와 같다:

- [애저 블롭 스토리지](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-overview?WT.mc_id=aliencubeorg-blog-juyoo): 스키마 저장소로 사용한다.
- [애저 로직 앱](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo): 게시자와 구독자로 사용한다. 다음 포스트에서 구현한다.
- [애저 펑션 앱](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo): 유효성 검증을 위한 도구로 사용한다. 다음 포스트에서 구현한다.

## 스키마 저장소 구현

스키마 저장소는 애저 블롭 스토리지에 컨테이너를 지정하는 방식으로 구현이 가능하다. 만약 스키마 저장소의 고가용성을 고려한다면 블롭 스토리지 인스턴스를 두 개 만들어서 각각에 스키마를 저장하면 된다. 여기서는 하나의 블롭 스토리지에 `schemas` 컨테이너와 `backups` 컨테이너를 만들어 마치 두 개의 스키마 저장소를 사용하는 것과 같은 느낌을 주었다. 스키마 저장소를 위해서 애저 블롭 스토리지를 사용하려면 크게 세 가지 리소스를 정의해야 한다.

1. 스토리지 계정 인스턴스
2. 블롭 서비스
3. 블롭 컨테이너

아래는 그 예시이다. 스키마 저장소로 쓰인 애저 블롭 스토리지의 전체 템플릿은 [여기](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/samples/Resources/StorageAccount.yaml)에서 확인할 수 있다.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=storage-account.yaml

> 여기서는 ARM 템플릿을 YAML로 작성했다. YAML로 ARM 템플릿을 작성하는 방법에 대해서는 [이전 포스트(영문)](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/)를 참조하도록 하자.

ARM 템플릿 작성이 끝나고 나면 이를 [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=aliencubeorg-blog-juyoo)에서 실행시켜 실제 인스턴스를 생성한다.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=deploy-storage-account.sh

이렇게 스키마 저장소 구현이 끝났다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/introduction-to-schema-registry-for-azure-messaging-service-02.png)

실제로 콘솔 앱을 하나 만들어서 스키마를 등록해 보자.

## 스키마 등록

사실 스키마를 등록하는 절차는 단순히 애저 블롭 컨테이너에 스키마 파일을 업로드하는 것에 불과하다. 따라서 그냥 [REST API](https://docs.microsoft.com/ko-kr/rest/api/storageservices/blob-service-rest-api?WT.mc_id=aliencubeorg-blog-juyoo)나 [SDK](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-quickstart-blobs-dotnet?WT.mc_id=aliencubeorg-blog-juyoo)를 이용해서 스키마를 업로드해도 크게 문제는 없다. 그런데, 사용자는 스키마 저장소로 애저 블롭 스토리지를 항상 이용한다는 가정을 할 수 있을까? 예를 들어 [AWS S3 버킷](https://aws.amazon.com/ko/s3/)이라면 얘기는 살짝 달라질 것이다. 이런 다양한 가능성을 고려하기 위해 [Sink](https://en.wikipedia.org/wiki/Sink_(computing))라는 개념을 도입하고 개별 싱크는 [DSL](https://ko.wikipedia.org/wiki/도메인_특화_언어)로 작동하도록 설계했다. 따라서 아래와 같이 [`BlobStorageSchemaSink`](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry-sinks-blob.md)를 선언하고 거기에 스키마를 업로드하면 된다.

> 콘솔 앱의 전체 샘플 코드는 [이곳](https://github.com/aliencube/AzureMessaging.SchemaRegistry/tree/master/samples/Aliencube.AzureMessaging.SchemaRegistry.ConsoleApp)을 참조하도록 한다.

### 스키마 저장소 싱크 선언

콘솔 앱에서 아래와 같이 싱크를 선언한다. 앞서 블롭 컨테이너를 두 개 만들어서 마치 두 개의 스키마 저장소가 있는 것과 같은 효과를 주었으므로 싱크도 두 개를 만든다.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=declare-blob-sink-for-schema-registry.cs

여기서 보면 `BlobStorageSchemaSink` 라이브러리는 [Fluent API](https://ko.wikipedia.org/wiki/플루언트_인터페이스)를 도입하여 `WithXXX()`와 같은 형태의 [메소드 체이닝](https://en.wikipedia.org/wiki/Method_chaining)을 적극적으로 활용했다. 이로 인해 코딩의 가독성을 향상시키는 결과를 가져왔다.

> 참고로 기차 충돌(Train Wreck)과 메소드 체이닝(Method Chaining)은 다르다. 이와 관련해서 정리한 좋은 포스트가 [여기](https://blog.aliencube.org/ko/2013/12/06/law-of-demeter-explained/) 그리고 [여기](https://hyesun03.github.io/2019/04/01/method-chain-vs-train-wrek/)에 있으니 읽어보면 좋겠다.

### 스키마 생성자 선언

스키마 저장소를 대변하는 싱크는 준비가 됐으니 실제로 싱크에 스키마를 업로드하는 스키마 생성자([`SchemaProducer`](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/src/Aliencube.AzureMessaging.SchemaRegistry/SchemaProducer.cs))를 선언할 차례이다. [`SchemaRegistry`](https://github.com/aliencube/AzureMessaging.SchemaRegistry/blob/master/docs/schema-registry.md) 라이브러리는 이 생성자를 정의하고 있으므로 이것을 사용하면 된다.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=declare-schema-producer.cs

위에서 보면 `WithSink()` 메소드를 통해 앞서 선언한 두 개의 스키마 저장소를 등록했다.

### 스키마 업로드

이제 스키마 생성자는 준비가 됐으니 원하는 메시지 클라스를 곧바로 생성자를 통해 스키마 저장소로 등록시키면 된다. 아래 코드는 클라스 타입을 보내면 내부적으로 스키마를 만든 후 업로드 한다.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=register-schema-1.cs

또는 이미 JSON 스키마 데이터가 있다면 아래와 같이 직접 업로드 할 수도 있다.

https://gist.github.com/justinyoo/a3fbed4cfafa5e86bf1888a39330e736?file=register-schema-2.cs

스키마를 등록한 결과는 대략 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/10/introduction-to-schema-registry-for-azure-messaging-service-03.png)

지금까지 스키마 저장소를 만들고 스키마를 저장소에 등록시키는 방법에 대해 간단한 코드 샘플을 통해 알아 보았다. 다음 포스트에서는 실제로 메시지 게시자와 구독자가 어떻게 이 스키마를 활용해서 메시지 유효성 검사를 수행하는지 실제 코드를 통해 구현해 보도록 하자.
