---
title: "애저 키 저장소를 위한 커스텀 로직 앱 커넥터 만들기"
date: "2019-01-05"
slug: building-logic-app-custom-connector-for-key-vault-with-azure-functions-v2
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-key-vault
- azure-logic-apps
- custom-connector
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/01/rendering-swagger-definitions-on-azure-functions-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

한참 전에 작성했던 [포스트](https://blog.aliencube.org/ko/2018/10/24/accessing-key-vault-from-logic-apps-with-managed-identity/)에서는 애저 로직앱에서 직접 키 저장소로 접근하는 방법에 대해 살펴 보았다. 이 방법의 가장 큰 장점은 손쉽게 로직앱을 작성해서 사용할 수 있다는 장점이 있지만, 로직앱에 한정해서 사용할 수 밖에 없다는 단점도 있다. 마침 [다른 포스트](https://blog.aliencube.org/ko/2019/01/03/accessing-key-vault-from-azure-functions-with-managed-identity/)에서는 애저 펑션을 통해 키 저장소로 접근하는 방법에 대해 살펴 보았다. 그렇다면 애저 펑션을 이용해 키 저장소에 접근하고, 로직앱에서는 커스텀 커넥터를 이용해 이 애저 펑션을 사용할 수 있으면 어떨까? 이렇게 만들어 놓으면 여러모로 활용성이 높을 것이다. 이번 포스트를 통해서는 로직앱 커스텀 커넥터를 만들고 여기에 애저 펑션을 연결해서 로직앱에서 불러와 사용할 수 있는 방법에 대해 알아보기로 한다.

> 이 포스트에서 사용한 코드는 [이곳에서 확인할 수 있다](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps).

## 미리 읽어두면 좋을만한 포스트

아래 포스트들을 아직 읽어보지 않았다면 한 번 읽어보기를 권한다. 이 포스트는 이를 바탕으로 좀 더 고급 기능을 제공한다.

- [애저 로직앱에서 키 저장소로 직접 접근하기](https://blog.aliencube.org/ko/2018/10/24/accessing-key-vault-from-logic-apps-with-managed-identity/)
- [애저 펑션에서 Managed Identity를 이용해 애저 키 저장소에 접근하기](https://blog.aliencube.org/ko/2019/01/03/accessing-key-vault-from-azure-functions-with-managed-identity/)
- [애저 펑션에 AutoMapper 의존성 주입 적용하기](https://blog.aliencube.org/ko/2019/01/02/automapper-di-into-azure-functions/)
- [애저 펑션에서 Swagger 정의 문서 출력하기](https://blog.aliencube.org/ko/2019/01/04/rendering-swagger-definitions-on-azure-functions-v2/)

## ARM 템플릿 작성

우선 몇가지 ARM 템플릿을 작성해야 한다. 로직앱 커스텀 커넥터 작성에 필요한 최소한의 애저 리소스는 다음과 같다.

- [애저 저장소 계정](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/StorageAccount.yaml)
- [애저 키 저장소](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/KeyVault.yaml)
- [컨섬션 플랜](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/ConsumptionPlan.yaml)
- [애저 펑션](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/FunctionApp.yaml)
- [애저 커스텀 API 커넥터](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/CustomApi-KeyVault.yaml)
- [애저 API 커넥션](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/ApiConnection-KeyVault.yaml)

이 이외에도 몇가지 더 추가하자면 아래와 같다.

- [애플리케이션 인사이트](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/ApplicationInsights.yaml)
- [로직앱 테스트 인스턴스](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/src/KeyVaultConnector.Resources/LogicApp.yaml)

이를 하나하나 추가하자면 시간이 걸리니 한 방에 설치해줄 수 있는 마스터 템플릿이 있다면 더 좋을 것이다.

- [마스터 템플릿](https://github.com/aliencube/Key-Vault-Connector-for-Logic-Apps/blob/dev/azuredeploy.yaml)

아래 버튼을 클릭하면 애저 포탈에 로그인 한 후 자동으로 모든 것을 한 방에 설치해 준다.

[![](https://camo.githubusercontent.com/8305b5cc13691600fbda2c857999c4153bee5e43/68747470733a2f2f617a7572656465706c6f792e6e65742f6465706c6f79627574746f6e2e706e67)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Faliencube%2FKey-Vault-Connector-for-Logic-Apps%2Fmaster%2Fazuredeploy.json)

이제 필요한 모든 애저 리소스 설치는 끝났다. 다음 단계로 넘어가 보자.

## 애저 펑션 애플리케이션 배포

지난 포스트에서 개발한 애저 펑션 애플리케이션을 애저 펑션 인스턴스에 배포한다. 배포한 후 애저 포탈에서 Managed Identity 기능이 활성화 됐는지 확인한다. `Object ID` 값을 볼 수 있으면 이 기능이 활성화 된 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-logic-app-custom-connector-for-key-vault-01.png)

## 애저 키 저장소에서 권한 확인

이제 애저 키 저장소에서 애저 펑션 인스턴스에 제대로 권한을 줬는지 확인해 보자. 위의 ARM 템플릿을 문제없이 설치했다면 권한은 제대로 설정되어 있을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-logic-app-custom-connector-for-key-vault-02.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-logic-app-custom-connector-for-key-vault-03.png)

## 로직앱 커스텀 커넥터 설정

ARM 템플릿을 그대로 설치했다면 커스텀 커넥터에 Swagger 문서 역시도 이미 정의가 되어 있을 것이다. 하지만, 만약 Swagger 정의 문서가 업데이트 되었다면 아래와 같이 Open API URL을 입력하면 된다. [이 포스트](https://blog.aliencube.org/ko/2019/01/04/rendering-swagger-definitions-on-azure-functions-v2/)를 참고하면 Swagger 문서를 직접 커스텀 커넥터에 로딩할 수 있는지 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-logic-app-custom-connector-for-key-vault-04.png)

## 로직앱 API 커넥션 인증

로직앱 커스텀 커넥터를 만들었다면 이를 로직앱에서 사용하기 위해서는 API 커넥션을 설정해야 한다. 여기서는 애저 펑션앱의 호스트 키를 이용해 인증한다. 이렇게 하면 개별 엔드포인트마다 다른 액세스 키를 사용하지 않아도 되기 때문에 편리하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-logic-app-custom-connector-for-key-vault-05.png)

이제 모든 설정은 끝났다. 함께 설치한 로직앱 테스트 인스턴스를 이용해서 실제로 로직앱에서 커스텀 커넥터를 통해 애저 펑션을 거쳐 키 저장소의 비밀 키 값을 가져와 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-logic-app-custom-connector-for-key-vault-06.png)

로직앱에서 잘 불러오는 것을 알 수 있다.

* * *

지금까지 애저 키 저장소 값을 로직앱에서 사용하기 위해 커스텀 커넥터를 만들어 사용하는 방법에 대해 알아 보았다.
