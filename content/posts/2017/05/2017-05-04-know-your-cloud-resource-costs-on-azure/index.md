---
title: "나는 얼마나 애저 클라우드 리소스를 사용했을까?"
date: "2017-05-04"
slug: know-your-cloud-resource-costs-on-azure
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-billing-api
- azure-webjobs
fullscreen: false
cover: ""
---

어떤 기업이 자사의 IT에 투자할 때 처음에는 컴퓨터, 네트워크, 데이터센터와 같은 인프라스트럭쳐에 거의 대부분의 비용을 소비했다면, 시간이 지나 웹 호스팅 환경에서 공간에 대한 비용만 지불하는 방식으로, 이제는 클라우드 컴퓨팅 환경이 되면서 컴퓨팅 파워에 대한 비용을 지불하는 방식으로 점차 변해왔다. 아래는 클라우드 이전과 이후, 그중에서도 클라우드 환경에서 어떤 형태로 발전해 왔는지에 대한 간략한 도식이다. 왼쪽으로 갈수록 인프라스트럭처에 대한 비용의 비중이 커지고, 오른쪽으로 갈수록 컴퓨팅 파워에 대한 비용이 주를 이루게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/know-your-cloud-resource-costs-on-azure-01.png) 이미지 출처: [Building Serverless Integration Solutions with Azure Logic Apps](https://docs.com/paco-de-la-cruz/4266/building-serverless-integration-solutions-with) by [Paco de la Cruz](https://twitter.com/pacodelacruz)  
  

이런 클라우드 환경에서는 필요할 때 마다 적절한 리소스를 생성해서 사용하고, 필요 없는 리소스는 삭제하고 하는 식으로 사용하게 마련이다. 하지만, 실제 서비스 환경이 아닌 개발 환경과 테스트 환경도 동시에 구축해서 사용하다보면 도대체 어떤 리소스가 어디에 얼마만큼 쓰이고 있는지 제대로 모니터링하지 않으면 요금폭탄을 맞기 십상이다. 이 포스트에서는 최근에 프리뷰 형태로 출시한 [Azure Billing API](https://docs.microsoft.com/en-us/azure/billing/billing-usage-rate-card-overview)를 이용해서 효과적으로 클라우드 리소스 사용과 관련한 비용을 모니터링할 수 있는 방법에 대해 간단히 알아보도록 한다.

> 이 포스트에 쓰인 샘플 코드는 [이곳](https://github.com/devkimchi/Azure-Resources-Cost-Monitoring-Sample)에서 확인할 수 있다.

## Azure Billing API 구조

이 API는 크게 두 가지로 나뉜다. 하나는 [실제 사용량(Usage) 관련 API](https://msdn.microsoft.com/en-us/library/azure/mt219003.aspx), 또다른 하나는 [요금제(Rate) 관련 API](https://msdn.microsoft.com/en-us/library/azure/mt219005.aspx)이다. 따라서 이 둘을 조합하면 특정 기간동안 어떤 요금제로 어떤 리소스를 얼마나 사용했는지 계산할 수 있다. 또한, 정확도의 수준을 지정할 수 있어 최대한 정확한 요금을 계산할 수도 있고, 이를 바탕으로 향후 얼마나 사용이 가능한지도 예측할 수 있다.

### 실제 사용량 (Usage)

모든 API 요청은 기본적으로 섭스크립션 기준으로 한다. 한 섭스크립션 안에서 사용한 리소스의 양에 대해 쿼리를 날릴 수 있는데, 이 때 사용하는 파라미터들은 아래와 같다.

- `ReportedStartTime`: 과금 시스템에 기록된(reported) 사용 기준 시작 시각이다.
- `ReportedEndTime`: 과금 시스템에 기록된(reported) 사용 기준 종료 시각이다.
- `Granularity`: 사용량 세분화 정도를 나타낸다. 현재 `Daily` 또는 `Hourly` 옵션이 있다. `Hourly`가 좀 더 자세한 결과를 반환하지만, 응답 시간은 훨씬 더 길어진다.
- `Details`: `true` 또는 `false` 값을 지정한다. 인스턴스 수준으로 사용량을 쪼개서 보여줄 것인지 아닌지를 결정한다. `true`일 경우 인스턴스 수준에서 잘게 쪼개 보여주고, `false`일 경우 동일 인스턴스를 모두 합쳐서 보여준다.

여기서 `Reported`라는 표현에 대해 좀 짚어봐야 할 필요가 있다. 클라우드 리소스를 `사용`했다고 한다면, 이것이 실제로 사용한(Used) 시각인지 아니면 사용했다고 과금 시스템에 기록된(Reported) 시각인지 구분해야 한다. 왜냐하면 애저 리소스는 전세계 데이터 센터에 분산되어 있고, 사용한 리소스가 위치한 데이터센터에 따라 실제 사용 시각과 이 사용 시각 이벤트가 과금 시스템에 도착해서 기록된 시각에 차이가 생길 수 있기 때문이다. 데이터 요청은 기록된 시각 기준으로 보내지만 실제 응답 객체에는 실제 사용 시각 기준으로 데이터가 나타난다는 점 기억해 두자. 현재로서는 요청시에는 오로지 기록된 시각 기준으로만 쿼리를 보낼 수 있다는 제약사항 때문에 약간의 오차가 발생할 수 있다는 것을 꼭 염두에 두어야 한다.

### 요금제 (Rate)

애저 섭스크립션을 하나 등록할 때 혹시라도 `MS-AZR-****P` 형태의 코드를 본 적이 있는가? 이것을 가리켜 Offer Durable ID 라고 부르는데, 일종의 요금제도이다. [이 페이지](https://azure.microsoft.com/en-us/support/legal/offer-details/)를 보면 상당히 다양한 요금제가 있는 것을 확인할 수 있다. 이 요금제 별로 리소스마다 다양한 요금 정책이 적용된다. 이와 관련한 쿼리 요청을 위해서는 아래와 같은 파라미터들을 사용한다.

- `OfferDurableId`: 위에서 설명했다. 예) MS-AZR-0017P (EA 섭스크립션)
- `Currency`: 내가 조회하고자 하는 화폐 단위이다. 예) KRW
- `Locale`: 내가 조회하고자 하는 지역의 로케일이다. 예) ko-KR
- `Region`: 이 요금제를 구입한 지역의 ISO 코드이다. 예) KR

따라서, 현재까지 내가 사용한 리소스의 총 금액을 계산하기 위해서는 사용량과 요금제를 조합해서 계산해야 한다. 다행히도 누가 이미 이런 작업을 해 놓았기 때문에 우리는 그저 간편하게 라이브러리를 받아 쓰면 된다. 바로 이 [CodeHollow.AzureBillingApi](https://www.nuget.org/packages/CodeHollow.AzureBillingApi/) NuGet package가 우리가 쓰고자 하는 것이다. 이 라이브러리를 이용해서 특정 기간동안 사용한 애저 리소스의 비용을 계산해 보는 애플리케이션을 만들어 보도록 하자.

## 시나리오

K라는 클라우드 전문 컨설팅 회사가 있다. 각 컨설턴트는 회사가 제공하는 애저 섭스크립션에서 제한없이 리소스를 생성하고 삭제하면서 고객에게 제공하는 솔루션을 위한 테스트를 진행할 수 있다. 하지만, 리소스를 사용하지 않는 경우 삭제하지 않아 불필요한 비용 낭비가 발생한다. 따라서, 리소스 그룹별로 태그 기능을 이용해서 1) 사용자를 지정하고, 2) 총 최고 한도 금액을 설정하고, 3) 일간 최고 한도 금액을 설정해서, 총 사용 한도의 90%를 넘어서는 시점에 알림 메일을 보내고, 총 사용 한도를 넘어서는 시점에 다시 한 번 알람 메일을 보낸 후, 해당 리소스 그룹을 삭제한다. 동시에 매일 일간 한도 금액을 확인해서 사용 한도를 넘어설 경우 알람 메일을 보내 필요한 조치를 취하게끔 한다.

시나리오는 꽤 간단하다. 참 쉽죠? 한 번 만들어 보자.

애플리케이션은 하루에 한 번 씩 자동으로 돌면서 데이터를 일별로 수집하고, 데이터베이스에 저장한 후 리소스 그룹별로 데이터를 취합해서 리소스 그룹 사용자에게 이메일을 보낼지 아닐지를 결정한다.

## 공통 라이브러리 제작

우선 공통 라이브러리는 크게 두 부분으로 나눌 수 있다. 첫번째는 Azure Billing API를 호출해서 리소스 그룹별로, 날짜별로 데이터를 구분한 후 취합하는 부분이고, 두번째는 이렇게 정리된 데이터를 데이터베이스에 저장하는 부분이다.

### Azure Billing API 호출 및 데이터 취합

API 호출 부분은 앞서 언급한 `CodeHollow.AzureBillingApi` 라이브러리를 이용하면 손쉽게 구현할 수 있다. 대략의 구현체는 아래와 같다.

https://gist.github.com/justinyoo/cd0b242be3b24d54d9a29ae00f71f08b

먼저 라이브러리를 이용해서 지정한 기간동안의 모든 리소스 사용량에 대한 비용을 위와 같이 구해낸다. 이렇게 받아놓은 데이터를 아래와 같이 날짜별, 리소스 그룹별로 합계를 낸다.

https://gist.github.com/justinyoo/973f3c0fe69bd4e225726e7b01cb4d5b

이제 기본적인 리소스 그룹별 사용 금액과 관련한 데이터는 다 모았다. 이제 리소스 그룹별로 지정한 태그를 찾아 매핑하는 작업을 해야 한다.

https://gist.github.com/justinyoo/f929659017212977f8c251de103e9fa9

위 코드는 섭스크립션에 속한 모든 리소스 그룹을 찾아내는 것이고, 아래 코드는 이렇게 찾아낸 리소스 그룹을 앞서 구해낸 리소스 그룹별로 비용 합계를 낸 결과와 합치는 것이다.

https://gist.github.com/justinyoo/1862c88d5fae90bf06e6e9928db77370

### 데이터 저장

데이터 저장 부분은 꽤 구현이 간단하다. 단순히 엔티티 프레임워크를 이용해서 테이블에 앞서 구한 데이터를 그대로 저장하면 된다.

https://gist.github.com/justinyoo/d67953f3e0d02db0fb7234a8e60c2ced

여기까지 해서 데이터를 취합하는 부분은 끝났다. 이제 이 취합된 데이터를 바탕으로 알람을 날리는 부분을 구현해 보도록 하자. 이부분도 그렇게 어렵지는 않다.

https://gist.github.com/justinyoo/4caea4219c67a88abee3442a47cc969f

위 코드는 지정된 기간 동안 총 사용 한도에 근접하는 경우, 총 사용 한도를 초과한 경우, 또는 일간 사용 한도를 초과한 경우에 해당하는 리소스 그룹만을 데이터베이서에서 조회해서 반환한다. 코드에서 냄새가 나긴 하지만 그럭저럭 쓸만은 하다. 아래 코드는 위에서 찾은 리소스 그룹을 대상으로 해당 리소스 그룹 사용자에게 알림을 보내는 기능이다.

https://gist.github.com/justinyoo/1a6867fd33b7fb2fc6e8efdb26e05383

SendGrid를 이용해서 이메일을 보낸다거나 Twillio 같은 기능을 이용해서 문자 메시지를 보낸디거나, 아니면 아예 다른 형태로 알림을 보낼 수도 있다.

이렇게 해서 기본적인 애플리케이션의 뼈대는 다 잡았다. 실제로 이를 애플리케이션에서 구현해 보도록 하자.

## 모니터링 애플리케이션 - Azure WebJob

가장 간단한 구현체는 콘솔 애플리케이션을 하나 만들어서 이를 곧바로 Azure WebJob으로 배포하는 것이다. 콘솔 애플리케이션의 코드는 대략 아래와 같다.

https://gist.github.com/justinyoo/e81cde1e11af31d1f52346574135a4e2

코드가 설명하는 바와 같이 먼저 데이터를 취합하고, 해당하는 사용자에게 알람을 보낸다. 이렇게 만들어진 콘솔 애플리케이션을 Azure WebJob으로 배포하기 위해 추가적으로 파일 두 개를 만들어야 한다. 하나는 `run.cmd` 이고 다른 하나는 `settings.job` 파일이다.

- `settings.job`: CRON 표현식이 들어있는 JSON 파일이다. 예를 들어 매일 밤 00:20에 이 WebJob을 실행시키고 싶다면 아래와 같이 설정하면 된다:

https://gist.github.com/justinyoo/7a897bd9768a9ccb4a6f0f17e298e015

- `run.cmd`: 이 WebJob이 실행될 때 참조하는 배치 파일이다. 이 안에는 콘솔 앱을 실행시키기 위한 명령어와 필요하다면 변수까지 같이 지정해서 넘기면 된다.

이렇게 해서 Azure WebJob으로 모니터링 애플리케이션을 설치했다.

## 모니터링 애플리케이션 - Azure Function

Azure WebJob 대신 Azure Function을 이용해서 이 모니터링 애플리케이션을 실행시킬 수도 있다. 이 때 반드시 조심해야 할 부분이 하나 있다.

> **Function 인스턴스는 무조건 App Service Plan 기반으로 만들어야 한다**

기본적으로 애플리케이션의 실행 시간이 짧게는 1-2분에서 길게는 20-30분 정도 되는데, Consumption Plan 기반의 펑션 인스턴스를 이용하면 요금폭탄을 맞을 가능성이 현저히 높아진다. 따라서, 사용 시간에 제약이 없는 App Service Plan 기반의 펑션 인스턴스를 만들고 그 안에 펑션 코드를 작성하도록 하자. 여기서는 Timer Trigger 펑션을 이용하면 된다. [프리컴파일 방식으로 만들어진 펑션 코드](http://blog.aliencube.org/ko/2017/04/30/precompiled-azure-functions-revisited/)는 대략 아래와 같다.

https://gist.github.com/justinyoo/a10cc6c3f1c99131b3cbfe0a3996d6a8

그리고, 이 펑션을 실행시키기 위한 `function.json` 설정 파일은 아래와 같다.

https://gist.github.com/justinyoo/a1d4dae16710df8431a86b97044fb5d4

지금까지 클라우드 리소스 사용에 발생하는 비용과 관련해 Azure Billing API를 이용해서 모니터링하는 방법에 대해 알아보았다. 클라우드 자원은 분명 효과적이고 효율적으로 사용할 수 있지만 자칫하면 실제 사용하지 않는 부분에 대해 불필요한 낭비를 하기 쉬운 구조이기도 하다. 따라서 효과적인 모니터링 도구를 간편하게 구현해서 계속 모니터링을 하면 이러한 낭비를 최소화 할 수 있을 것이다.
