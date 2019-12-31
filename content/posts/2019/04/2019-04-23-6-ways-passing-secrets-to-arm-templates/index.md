---
title: "ARM 템플릿으로 시크릿 값을 넘겨주는 여섯 가지 방법"
date: "2019-04-23"
slug: 6-ways-passing-secrets-to-arm-templates
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- steps
- azure-devops
- azure-key-vault
- azure-pipelines
- linked-template
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/04/6-ways-passing-secrets-to-arm-templates-00.png
---

ARM 템플릿을 작성하다 보면 항상 민감한 정보를 다루는 상황과 마주치게 된다. 주로 API 키 값을 넘겨준다거나 하는 경우가 될텐데, 이 때 어떻게 하면 ARM 템플릿에 값을 하드코딩 방식으로 저장하지 않고도 이런 민감한 값들을 활용할 수 있을까? 이 포스트에서는 가장 흔히 사용할 수 있는 여섯 가지 방법에 정리해 보도록 한다.

## 1\. 애저 리소스 펑션을 이용해 ARM 템플릿 내부적으로 값을 전달하기

애저 리소스들 중에서는 리소스 인스턴스가 만들어진 후 액세스 키를 이용해야만 접근이 가능한 것들이 있다. 대표적인 경우가 [Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview), [Azure SQL 데이터베이스](https://azure.microsoft.com/en-au/services/sql-database/), [Cosmos DB](https://azure.microsoft.com/en-au/services/cosmos-db/), [Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview), [Service Bus](https://azure.microsoft.com/en-au/services/service-bus/), [Functions](https://azure.microsoft.com/en-au/services/functions/), [Logic Apps](https://azure.microsoft.com/en-au/services/logic-apps/) 같은 것들이 될텐데, 이 리소스들은 굳이 액세스 키를 모르더라도 리소스 ID 값만 알면 ARM 템플릿 내부에서 곧바로 키 값을 가져올 수 있다. 이미 이와 관련한 포스트를 작성한 적이 있으므로 여기서는 자세한 설명은 생략하기로 한다.

- [ARM 템플릿 배포 실행 후 애저 리소스별 액세스 키에 접근하기](https://devkimchi.com/2018/01/05/list-of-access-keys-from-output-values-after-arm-template-deployment/)

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/04/no-more-explanation-required.jpg)

이 방식의 장점은 굳이 애저 리소스의 액세스 키 값을 별도로 저장할 필요가 없이 ARM 템플릿 내부적으로 처리가 가능하다는 점이다. 액세스 키를 호출하는 펑션만 알고 있다면 곧바로 사용이 가능하다. 반면에 이 방식의 단점은 애저 리소스가 아닌 경우에는 사용할 수 없다는 데 있다. 당연하게도 애저 리소스에 접근 가능한 API를 이용해서 펑션이 작동하기 때문에 외부 리소스의 경우에는 절대로 사용할 수 없다. 또 한 가지 단점이라면 단점이랄 것은, 리소스 별로 액세스 키를 호출하는 함수가 살짝 다른 경우가 있다. 예를 들자면 애저 Storage Account 같은 경우에는 `listKeys` 라는 펑션을 쓰는 반면, 애저 펑션에서는 `listSecrets`라는 펑션을 사용한다. 이러한 비일관성 때문에 굉장히 유용한 기능임에도 불구하고 잘 알려져 있지 않다는 것은 좀 안타까운 일이기도 하다.

## 2\. ARM 템플릿 파라미터의 `SecureString` 속성을 이용해 전달하기

가장 널리 알려진 방법이라고 할 수 있다. ARM 템플릿의 파라미터는 값의 데이터 타입을 `string`, `int`, `bool`, `securestring`, `secureobject` 등과 같은 형태로 정의할 수 있는데, 이 때 `securestring`을 사용하게 되면 ARM 템플릿으로 값을 전달할 때 암호화된 값으로 전달하므로 실제 값을 알아낼 수 없다. 실제 ARM 템플릿에서는 아래와 같은 식으로 파라미터를 정의한다.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=serviceprincipaltenantid.yaml

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=serviceprincipaltenantid.json

> **참고**: 위 ARM 템플릿 샘플은 YAML 포맷과 JSON 포맷 두 가지 방식으로 쓰여졌는데, 아직 ARM 템플릿 작성에서 YAML 지원은 공식적으로 이루어지지 않는다. 만약 YAML을 이용해서 ARM 템플릿을 작성하고 싶다면 [이 포스트](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/)를 참조하도록 한다.

이렇게 하면 실제 ARM 템플릿을 실행하는 과정에서 값을 암호화하여 파라미터로 전달한다거나 CI/CD 파이프라인을 통해 암호화된 값을 전달할 수 있다. 아래는 파워셸을 이용한 명령어이다.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=new-azurermresourcegroupdeployment.txt

만약 애저 CLI를 사용한다면 아래와 같이 할 수도 있다.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=az-cli.txt

이 방법의 장점은 별다른 노력 없이도 손쉽게 `SecureString` 값을 만들어 낸 후 곧바로 사용할 수 있다는 데 있다. 또한 이렇게 하면 CI/CD 파이프라인 자체적으로 제공하는 환경 변수 값을 이용해서 곧바로 ARM 템플릿 파라미터로 전달할 수 있으므로 굉장히 편리하다. 반면에 이렇게 하면 흔하지는 않겠지만 어떤 식으로든 CI/CD 파이프라인의 환경 변수에 저장되는 과정에서 해당 시크릿 값이 노출될 가능성이 생긴다. 또한 파워셸 스크린 상에서 값을 암호화 하는 도중에 해당 값이 노출될 가능성도 있다. 이런 경우가 없지는 않은 셈이다.

## 3\. 애저 Key Vault와 ARM 템플릿 직접 연동하기

그렇다면, 애저 Key Vault가 이럴 때 쓰라고 있는 것이니 어떻게 하면 ARM 템플릿과 연동할 수 있을까? 먼저 직접 연동하는 방법에 대해 알아 보자. ARM 템플릿 대신 파라미터 파일을 이용하면 직접 애저 Key Vault를 참조해서 값을 가져올 수 있다. 아래는 애저 Logic App을 생성하는 ARM 템플릿의 일부분이다.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=parameters.yaml

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=parameters.json

이 템플릿에 값을 전달해 주기 위한 파라미터 파일에 애저 Key Vault 참조를 설정할 수 있다.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=parameters-kv.yaml

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=parameters-kv.json

이렇게 하면 ARM 템플릿은 그대로 유지하고, 파라미터 파일에서 Key Vault 참조를 설정해서 손쉽게 값을 가져올 수 있다. 굉장히 간단한 방법이지만, 이 역시 한 가지 단점이 있다. 애저 Key Vault 인스턴스의 리소스 ID 값을 파라미터 파일에 하드코딩을 해야 한다. 이 과정에서 애저 섭스크립션 ID 값이 노출되는데 그다지 바람직하지는 않다. 그렇다면 이를 하드코딩 하지 않고도 가져올 수 있는 방법이 없을까? 물론 있다.

## 4\. 애저 Key Vault와 ARM 템플릿 간접 연동하기

애저 섭스크립션 ID를 하드코딩으로 노출시키지 않고도 애저 Key Vault 인스턴스를 참조할 수 있는 방법이 있는데, 이 때는 Linked 템플릿 방식을 활용할 수 있다. 즉, 아래와 같은 Linked 템플릿을 추가로 작성하면 된다.

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=resources.yaml

https://gist.github.com/justinyoo/49b5a9a3d42dd21bbc68afe3ffd6a25f?file=resources.json

위와 같이 [`resourceId` 펑션](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-functions-resource#resourceid)을 이용해서 파라미터에 애저 Key Vault 인스턴스 참조를 설정해 주면 된다. 이 방법은 당연하게도 아무런 하드 코딩 값이 필요가 없다는 장점이 있는 반면에, 이를 활용하기 위해서는 추가적으로 Linked 템플릿을 생성해야 한다는 것이다. 현재 프로젝트에서 Linked 템플릿을 적극적으로 활용한다면 큰 문제가 되지는 않겠지만, 그렇지 않은 경우에는 별도의 관리 포인트가 생기는 단점이 있을 수 있다.

## 5\. CI/CD 개별 파이프라인에 애저 Key Vault 연동하기

애저 Key Vault 참조를 ARM 템플릿에 설정하는 대신 개별 CI/CD 파이프라인에 설정해서 사용할 수도 있다. 여기서는 애저 DevOps에서 제공하는 파이프라인 서비스를 이용해서 설명하도록 한다. 먼저 애저 Key Vault 인스턴스에 저장된 시크릿 값은 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/04/6-ways-passing-secrets-to-arm-templates-01.png)

이를 애저 DevOps의 개별 파이프라인에서는 Key Vault 타스크를 통해 참조할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/04/6-ways-passing-secrets-to-arm-templates-02.png)

아래와 같이 섭스크립션과 애저 Key Vault 인스턴스 설정을 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/04/6-ways-passing-secrets-to-arm-templates-03.png)

그리고 난 후 ARM 템플릿 배포 타스크에서 해당 값을 참조하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/04/6-ways-passing-secrets-to-arm-templates-04.png)

이렇게 하면 기존의 ARM 템플릿을 그대로 두고, CI/CD 파이프라인의 환경 변수에 의존하지 않으면서 애저 Key Vault 인스턴스에서 모든 시크릿 값을 관리할 수 있다. 하지만, 이 경우에는 개별 파이프라인마다 이를 설정해 줘야 하는 번거로움이 있다.

## 6\. CI/CD 공통 라이브러리에 애저 Key Vault 연동하기

개별 파이프라인에 애저 Key Vault 인스턴스를 연동하는 대신, 공통 라이브러리에 연동할 수도 있다. 아래와 같이 공통 라이브러리를 만들어서 애저 Key Vault 인스턴스와 연동시킨다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/04/6-ways-passing-secrets-to-arm-templates-05.png)

이 라이브러리를 파이프라인의 변수 탭에 등록시킨다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/04/6-ways-passing-secrets-to-arm-templates-06.png)

그리고 난 후 ARM 템플릿 배포 타스크에서 해당 값을 참조하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/04/6-ways-passing-secrets-to-arm-templates-07.png)

이렇게 하면 기존의 ARM 템플릿도 그대로 사용할 수 있고, CI/CD 파이프라인의 환경 변수에 의존하지도 않으면서, 개별 파이프라인마다 애저 Key Vault 인스턴스를 호출하지 않아도 된다. 대신, 이 경우에는 라이브러리에 개별 파이프라인에서 필요한 모든 시크릿 값을 등록해 놓아야 한다.

* * *

지금까지 ARM 템플릿에 시크릿 값을 전달하는 서로 다른 여섯 가지 방법에 대해 알아 보았다. 이 방법은 저마다 장단점이 뚜렷하기 때문에 어떤 것이 다른 것에 비해 더 낫다 라고 말하기는 어렵다. 다만, 각자의 상황에서 최선의 방법을 찾아 적용하는 것이 최고의 방법이라고 얘기해야 겠다.

## 각자 따라해 보기

- ARM 템플릿 샘플: [https://github.com/devkimchi/Handling-Secrets-around-ARM-Templates](https://github.com/devkimchi/Handling-Secrets-around-ARM-Templates)
- 애저 DevOps 파이프라인: [https://fairdincom.visualstudio.com/Handling-Secrets-around-ARM-Templates](https://fairdincom.visualstudio.com/Handling-Secrets-around-ARM-Templates/_release)
- 블로그 포스트: [ARM 템플릿 배포 실행 후 애저 리소스별 액세스 키에 접근하기](https://devkimchi.com/2018/01/05/list-of-access-keys-from-output-values-after-arm-template-deployment/)
- 블로그 포스트: [YAML 포맷으로 ARM 템플릿 만들기](https://devkimchi.com/2018/08/07/writing-arm-templates-in-yaml/)
