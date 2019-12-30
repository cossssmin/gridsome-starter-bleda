---
title: "이벤트 소싱 패턴과 CQRS 패턴을 적용해서 클라우드상에서 유연하게 앱 개발하기"
date: "2015-11-12"
slug: auto-generating-rest-api-service-contract-by-swagger-hal-and-autorest
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- AngularJs
- Cloud Design Pattern
- CQRS Pattern
- Event Sourcing Pattern
- TypeScript
- Web API
fullscreen: false
cover: ""
---

[Google 클라우드](https://cloud.google.com), [AWS](https://aws.amazon.com) 혹은 [Azure](https://azure.microsoft.com) 등과 같은 클라우드 플랫폼에서 애플리케이션을 개발할 때면 반드시 고려해야 할 요소들이 있다. 추가적인 기능을 필요로 할 때 적절하게 대응할 수 있을만큼 유연해야 하고 (flexible), 상황에 따라 가용 자산들의 규모를 조정할 수 있어야 하고 (scalable), 결국 이러한 여러 유연함으로 인해 발생할 수 있는 성능상 이슈들을 해결할 수 있어야 한다 (increasing performance). 마이크로소프트는 [24개의 클라우드 디자인 패턴](https://msdn.microsoft.com/en-us/library/dn568099.aspx)을 소개했는데 자신의 상황에 맞게 적절한 패턴들을 적용시키면 되겠다. 이 포스트에서는 그 중에서도 널리 쓰이는 [이벤트 소싱 패턴](https://msdn.microsoft.com/en-us/library/dn589792.aspx)과 [CQRS 패턴](https://msdn.microsoft.com/en-us/library/dn568103.aspx)에 대해 논의해 보도록 하자.

> - [TypeScript 라이브러리를 이용한 Angular 앱 만들기](http://blog.aliencube.org/ko/2015/09/05/building-angular-app-using-typescript)
> - [Angular 앱에 Web API 적용하기](http://blog.aliencube.org/ko/2015/09/06/applying-web-api-to-angular-app)
> - [Web API 응답 문서에 HAL 적용하기](http://blog.aliencube.org/ko/2015/08/16/applying-hal-to-rest-api)
> - [Swagger 및 HAL, AutoRest를 이용한 Web API 서비스 콘트랙트 자동화](http://blog.aliencube.org/ko/2015/10/25/auto-generating-rest-api-service-contract-by-swagger-hal-and-autorest)
> - **Angular 앱 상호작용 – 이벤트 소싱과 CQRS**

마이크로소프트에서 제공하는 클라우드 디자인 패턴 관련 예제 코드를 확인하고 싶다면 아래 링크를 참조하도록 하자.

- [Cloud Design Patterns – Sample Code](http://www.microsoft.com/en-us/download/details.aspx?id=41673)

하지만 여기서는 아래 샘플 코드를 이용하도록 한다. [지난 포스트](http://blog.aliencube.org/ko/2015/10/25/auto-generating-rest-api-service-contract-by-swagger-hal-and-autorest)에 이어 계속해서 여기서는 Angular 앱을 바탕으로 진행해 보도록 한다.

- [https://github.com/devkimchi/EventSourcing-CQRS-Sample](https://github.com/devkimchi/EventSourcing-CQRS-Sample)

## CQRS 패턴 소개

우선 간단하게 CQRS 패턴에 대해 논의해 보자. CQRS (Command Query Responsiblity Segregation) 패턴은 이름에서 알 수 있다시피 코맨드, 즉 `C` (Create – `INSERT`), `U`(Update – `UPDATE`), `D` (Delete – `DELETE`) 쿼리와 `R` (Read – `SELECT`) 쿼리를 분리하자는 것이다. CQRS 패턴에 대한 초초초초간단 설명은 [이 포스트](http://blog.aliencube.org/ko/2013/08/18/cqrs-oversimplified-overview)를 참조하도록 하자.

전통적으로 DB 트랜잭션은 아래와 같은 형태로 진행이 된다.

![](https://i-msdn.sec.s-msft.com/dynimg/IC709535.png) \[출처: [https://msdn.microsoft.com/en-us/library/dn568103.aspx](https://msdn.microsoft.com/en-us/library/dn568103.aspx)\] 

하나의 데이타베이스에서 읽고 쓰고를 한꺼번에 진행하다보니 시스템 스케일아웃이 필요한 시점에서는 문제가 생길 수 있다. 또한 데이터를 읽어들이는 시점과 쓰는 시점 사이에 분명히 시간차가 존재하다보니 그 사이에 다른 변경지점이 생겼을 경우에는 문제가 될 수 있다. 그래서 보통 트랜잭션이 이루어지는 동안에는 디비를 해당 트랜잭션만 사용할 수 있게끔 잠갔다가 풀었다가 하는 형태로 풀어낸다. 그래서 CQRS 패턴을 사용하게 되면 이렇게 트랜잭션에 필요한 데이터 모델과 쿼리에 사용하는 데이터 모델을 분리시킬 수 있다.

![](https://i-msdn.sec.s-msft.com/dynimg/IC702503.png) \[출처: [https://msdn.microsoft.com/en-us/library/dn568103.aspx](https://msdn.microsoft.com/en-us/library/dn568103.aspx)\] 

좀 더 나아가서 아예 트랜잭션용 디비와 쿼리용 디비를 따로 준비해서 그들간 싱크는 [서비스 브로커라든가 하는 것들을 통해 알아서 하게 하고](http://devkimchi.com/811/service-broker-external-activator-for-sql-server-step-by-step-1) 쿼리는 읽기 전용 디비에서, 트랜잭션은 쓰기 전용 디비에서 이루어지게 하면 된다는 것이다.

![](https://i-msdn.sec.s-msft.com/dynimg/IC702504.png) \[출처: [https://msdn.microsoft.com/en-us/library/dn568103.aspx](https://msdn.microsoft.com/en-us/library/dn568103.aspx)\] 

물론, CQRS 패턴이 만능은 아니다. 이 패턴을 도입하면서 생기는 복잡도 때문에, 비즈니스 로직이 간단하다면 굳이 도입할 필요가 없다. 또한 전체 시스템에 이 CQRS 패턴을 적용시킬 필요도 없다.

아래 소개할 이벤트 소싱 패턴과 CQRS 패턴은 찰떡 궁합을 보이기 때문에 보통 함께 적용하는 경우가 많다. 이제 이벤트 소싱 패턴에 대해 알아보도록 하자.

## 이벤트 소싱 패턴 소개

이벤트 소싱 패턴에서는 애플리케이션 내에서 가능한 모든 액티비티들을 이벤트로 전환해서 별도의 이벤트 스트림 (event stream) 디비에 저장하는 방식이다. 이벤트 스트림 디비는 오로지 추가만 가능하게끔 해서 계속 이벤트들이 쌓이게 만들고 실제로 내가 필요한 데이터를 구체화 (materialised) 시키는 시점에서는 그 때 까지 축적된 데이터를 바탕으로 작성하게 된다. 각각의 이벤트는 딱 한가지 액티비티에만 집중하게 되어 있으므로 아무리 복잡한 비즈니스 로직이라 하더라도 굉장히 간단하게 만들 수 있다. 또한 이벤트 스트림 디비는 실제 데이터가 저장되는 디비와는 다르기 때문에 퍼포먼스 측면에서도 구조적 확장 측면에서도 강점을 지닌다. 아래 그림은 이벤트 소싱 패턴에 대한 간략한 설명을 나타낸 것이다.

![](https://i-msdn.sec.s-msft.com/dynimg/IC709550.png) \[출처: [https://msdn.microsoft.com/en-us/library/dn589792.aspx](https://msdn.microsoft.com/en-us/library/dn589792.aspx)\] 

위 그림에서 볼 수 있다시피 각각의 액션들이 하나의 이벤트로 작동한다. `CartCreatedEvent`, `ItemAddedEvent`, `ItemRemovedEvent`, `ShippingDetailsAddedEvent` 등등으로 이벤트를 만들고 그 이벤트들은 오직 자기가 필요한 테이터만 받아 이벤트 스토어 (혹은 이벤트 스트림)에 저장한다. 그리고, 이를 바탕으로 구체화시킨 데이터(materialised view)를 디비에 저장하고, 별도의 리플레이를 통해 현재 시점의 뷰를 쿼리로 보여준다. 바로 이 시점에서 앞서 언급한 CQRS 패턴이 연결되는데, 이벤트 스트림에서 뽑아내서 구체화 시킨 데이터를 디비에 저장시키고 (Command), 특정 시점에 맞춰진 뷰(Query)를 화면에 뿌려주는 식이 되는 것이다.

지금까지 간단하게 CQRS 패턴과 이벤트 소싱 패턴에 대해 알아보았다. 이제 이를 실제로 애플리케이션에서 구현해 보는 예제를 살펴보도록 하자.

## 애플리케이션에 패턴 적용하기

앞서 언급한 [샘플 예제 코드](https://github.com/devkimchi/EventSourcing-CQRS-Sample)를 다운로드 받아 빌드한 후 실행시켜 보면 아래와 같은 간단한 앵귤라 앱을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/11/event-sourcing-cqrs.01.png)

화면의 왼쪽에 보면 총 세 개의 사용자 입력 필드 – `Title`, `Name`, `Email` – 과 `Submit` 버튼이 있다. 이 네 개의 사용자 액션이 각각 하나의 이벤트로 작용하여 이벤트 스트림에 저장된다. 이를 수행하는 타입스크립트 부분을 살펴보면 아래와 같다.

https://gist.github.com/justinyoo/541e525d555053721318#file-user-salutation-js

`link($scope, element, attributes)` 라는 함수를 통해 `Title`이 바뀌는 이벤트를 잡아서 Web API로 POST 리퀘스트를 보낸다. 해당 리퀘스트가 결과를 다시 브라우저로 보내면 그걸 바탕으로 가운데 `Replayed View` 섹션의 `Title` 항목을 업데이트 시킨다. 즉, 가장 최신의 이벤트를 리플레이하는 것이다. 다른 `Name` 필드와 `Email` 필드 역시 동일한 역할을 한다. 그에 해당하는 코드는 샘플 코드를 참조하도록 하자.

여기서 중요하게 봐야 할 점은 클라이언트, 즉 브라우저에서 어떤 액션이 발생했을 때 그 액션을 이벤트로 만들어서 Web API로 POST 리퀘스트를 보낸다는 것이다. 앞서 언급했다시피 이벤트 소싱 패턴은 이벤트 스트림에 계속 이벤트를 추가하는 방식이기 때문에 여기서는 POST 리퀘스트를 보내는 것이 적절하다고 볼 수 있다.

그렇다면, 해당 리퀘스트는 Web API 에서 어떻게 처리가 될까? 아래 코드를 살펴보도록 하자. 리퀘스트는 아래의 URL로 보낸다고 가정한다.

https://gist.github.com/justinyoo/541e525d555053721318#file-events-salutation-changed-txt

이 엔드포인트로 보낸 리퀘스트는 Web API 에서 아래와 같이 처리한다.

https://gist.github.com/justinyoo/541e525d555053721318#file-post-salutation-changed-controller-cs

API 콘트롤러에서는 그다지 보여줄 것이 없다. 콘트롤러 안에 보이는 서비스 레이어를 주목하도록 하자. `this._service.ChangeSalutationAsync(request)` 라는 메소드가 보이는가? 이 메소드가 실제 이벤트를 처리하는 로직이 된다. 그 안을 들여다 보도록 하자.

https://gist.github.com/justinyoo/541e525d555053721318#file-service-change-salutationi-async-cs

1. 우선 등록된 수많은 리퀘스트 핸들러 중에서 해당 리퀘스트를 처리할 수 있는 핸들러를 찾는다.
2. 해당 핸들러가 리퀘스트를 이벤트로 변환시킨다.
3. 이벤트 프로세서의 `ProcessEvent()` 메소드에 해당 이벤트를 보내서 처리한다.
4. 처리된 리퀘스트는 리플레이 시켜서 다시 리스폰스로 변환시켜 반환한다.

그렇다면 이벤트 프로세서는 어떻게 이벤트를 이벤트 스트림으로 저장시킬까? 아래 코드를 살펴보도록 하자.

https://gist.github.com/justinyoo/541e525d555053721318#file-processor-process-event-async-cs

1. 해당 이벤트를 처리할 수 있는 이벤트 핸들러를 모두 찾는다.
2. 각각의 이벤트핸들러에 정의되어 있는 `ProcessAsync()` 메소드를 호출하여 이벤트를 처리한다.

아래는 개별 이벤트 핸들러가 이벤트를 이벤트 스트림에 저장하는 것을 보여준다.

https://gist.github.com/justinyoo/541e525d555053721318#file-event-handler-process-async-cs

1. 이벤트 핸들러는 이벤트를 이벤트 스트림에 저장할 수 있는 포맷으로 변환한다.
2. 이벤트 스트림 리포지토리에 저장한다.

여기까지 해서 이벤트 소싱 패턴의 기본 동작을 살펴 보았다. 정리하자면,

1. 이미 등록된 리퀘스트 핸들러 풀에서 해당하는 리퀘스트 핸들러만 찾아낸 후 리퀘스트를 이벤트로 변환시킨다.
2. 변환시킨 이벤트는 이벤트 프로세서로 보낸다.
3. 이벤트 프로세서는 해당 이벤트를 처리할 수 있는 이벤트 핸들러를 모두 찾아내서 처리하도록 한다.
4. 해당 이벤트 핸들러는 그 이벤트를 이벤트 스트림에 저장한다.
5. 이벤트 스트림에 저장된 이벤트는 다시 리플레이를 통해 리스폰스로 변환되고 클라이언트 (여기서는 브라우저)로 반환된다.

여기까지 진행을 하게 되면 브라우저에서 아래와 비슷한 결과를 얻을 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/11/event-sourcing-cqrs.02.png)

위의 결과에서 확인할 수 있다시피, `Name` 필드에 입력한 데이터는 이벤트 스트림에 저장되고 그 결과는 바로 `Replayed View`에서 확인할 수 있다. 하지만, 아직 구체화는 되지 않은 상태에서 `Materialised Storage View`에서는 확인할 수 없다. 왜냐하면 아직 진짜 데이터베이스에는 저장되지 않은 상태이기 때문이다.

이제 필요한 데이터를 모두 입력한 후 `Submit` 버튼을 눌러보도록 하자. 그러면 아래와 같은 화면을 볼 수 있을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/11/event-sourcing-cqrs.03.png)

이제 이벤트 스트림에 저장되어 있던 모든 데이터들이 실제 User 데이터로 구체화 되어 (materialised) 디비에 저장되었다. 이후 다시 사용자 데이터를 바꿔도 서브밋 버튼을 누르기 전 까지는 이벤트 스트림에만 저장이 될 뿐 여전히 디비에는 반영이 되어 있지 않는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/11/event-sourcing-cqrs.04.png)

즉 모든 이벤트는 이벤트 스트림에 타임스탬프와 함께 저장이 되고, 이를 가장 최신의 내용으로 리플레이 할 것인가, 아니면 특정 시간대로 리플레이 할 것인가 등을 지정할 수 있다. 또한 해당 시간대의 리플레이 결과값을 바탕으로 디비에 데이터를 저장할 수도 있다. Replayed View 및 Materialised View 는 모두 이벤트 스트림을 바탕으로 하는데, 이것이 가능한 이유는 바로 이벤트 스트림이 모든 사용자 행동을 저장하고 있는 진실의 원천(source of truth)이기 때문이다. 따라서 특정 시점을 기준으로 사용자의 행동을 뽑아낼 수 있고 (Query), 저장할 수 있다 (Command).

지금까지 이벤트 소싱 패턴과 CQRS 패턴을 앵귤라 앱에 적용시켜 클라우드 환경에서 유연하게 애플리케이션을 개발하는 방법에 대해 살펴보았다. 여기서 다룬 이벤트 핸들링 방식, 리퀘스트 핸들링 방식이 반드시 정답이라고는 할 수 없겠지만, 대략의 아이디어를 줄 수는 있을 것이다. 자, 이제 당신의 애플리케이션에 적용시켜 볼 차례다.
