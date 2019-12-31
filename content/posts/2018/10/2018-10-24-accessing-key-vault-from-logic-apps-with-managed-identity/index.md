---
title: "애저 로직앱에서 키 저장소로 직접 접근하기"
date: "2018-10-24"
slug: accessing-key-vault-from-logic-apps-with-managed-identity
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-logic-apps
- azure-key-vault
- managed-identity
- managed-service-identity
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

애저 로직앱에 최근 굉장히 편리한 기능이 하나 생겼다. 바로 매니지드 아이덴티티인데, 이 기능을 이용하면 로직앱에서 굳이 서비스 프린시플을 이용하지 않고도 직접 애저 리소스들에 접근이 가능하다. 이 기능을 이용하면 가장 많이 쓰일만한 시나리오가 바로 키 저장소에 직접 접근해서 패스워드 같은 것들을 가져오는 것이 될것이다. 이 포스트에서는 애저 키 저장소를 매니지드 아이덴티티를 이용해서 직접 로직앱에서 접근하는 방법에 대해 알아본다.

## 로직앱 키 저장소 커넥터

사실, 로직앱에는 애저의 수많은 리소스들에 직접 접근이 가능하게끔 다양한 커넥터들을 제공한다. 하지만 유독 키 저장소만큼은 커넥터를 제공하지 않고 있는데, 이와 관련된 기능 요청이 꽤 많은 것으로 알고 있다. 아마도 패스워드와 같은 굉장히 보안에 민감한 정보에 접근하는 커넥터인 만큼 꽤 신중한 접근을 하는 것으로 추측 가능하다.

그렇다면, 굳이 이런 커넥터에 의존하지 않고 직접 키 저장소에서 값을 가져오는 것은 어떨까? 기본적으로 키 저장소를 포함한 애저의 모든 리소스들은 REST API를 제공하니 충분히 가능하다.

## 로직앱 인스턴스 생성

우선 로직앱 인스턴스를 하나 만들도록 하자. 이후 `Workflow Settings` 블레이드에서 `Managed Service Identity` 옵션을 활성화하면 로직앱 쪽에서는 모든 설정이 다 끝난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-01.png)

참쉽죠?

## 키 저장소 등록

이제 로직앱 인스턴스가 하나 만들어졌고 이것이 애저 액티브 디렉토리에 등록이 됐으므로 키 저장소에서 직접 이 로직앱을 연동시킬 수 있다. 아래 그림과 같이 `Access Policies` 블레이드에서 로직앱 인스턴스를 등록시킨다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-02.png)

이후 시크릿을 하나 등록한다. 여기서는 `hello` 라는 시크릿에 `world` 라는 값을 등록시켰다.

## 로직앱 HTTP 액션 등록

이제 준비는 다 끝났으니, 로직앱에 HTTP 액션을 하나 등록한다. 이 액션을 통해 키 저장소로 REST API 호출을 해서 값을 가져오게 된다. 먼저 시크릿 값을 가져오기 위한 URL은 아래와 같다.

```
https://<mykeyvault>.vault.azure.net/secrets

```

그리고 `api-version` 값을 `2016-10-01`로 준다. 키 저장소 관련 최신 API 버전은 `2018-02-01-preview` 이긴 하지만 이 버전으로는 키 저장소 인스턴스 생성은 되지만 REST API 호출은 할 수 없다. 오직 `2016-10-01` 버전에서만 작동한다. 마지막으로 `Authentication` 필드에 `Managed Service Identity` 값을 선택하고 바로 아래 `Audience` 필드에 `https://vault.azure.net` 이라고 입력한다. 만약 `https://vault.azure.net/` 이라고 트레일링 슬래시를 붙이면 또한 작동하지 않으니 조심하도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-03.png)

## 키 저장소 등록 값 조회

이제 모든 설정은 다 끝났다. 실제로 로직앱을 실행시켜 보자. 키 저장소의 시크릿 값을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/10/accessing-key-vault-from-logic-apps-with-managed-identity-04.png)

참쉽죠?

이렇게 로직앱에서 직접 키 저장소로 접근해서 민감한 정보를 가져올 수 있게 되었다. 키 저장소 커넥터가 준비될 때 까지는 이를 이용하면 손쉽게 정보를 가져와서 로직앱 안에서 사용할 수 있다.

## 고려할 사항

- 위의 스크린샷과 같이 실행 히스토리에 민감한 정보가 남아있다. 따라서 로직앱에 접근 권한을 엄격하게 적용하지 않으면 문제가 생길 소지가 있다.
- 하나의 애저 섭스크립션에 총 10가 까지 로직앱을 매니지드 아이덴티티로 등록시킬 수 있다. 따라서, 매 로직앱마다 키 저장소를 접근할 수 있게 하기 보다는, 하나의 키 저장소 접근용 로직앱을 별도로 만들고, 다른 로직앱에서는 필요할 때 키 저장소 접근용 로직앱을 서브워크플로우의 형태로 호출하는 것이 바람직하다.

* * *

지금까지 로직앱에서 키 저장소로 직접 접근하는 방법에 대해 알아보았다. 이 포스트에서는 애저 포탈에서 직접 작업하는 예시를 들었지만, 실제 현업에서는 포탈에서 작업하기 보다는 ARM 템플릿의 형태로 작업하는 경우가 더 많을 것이다. 따라서 여기 [링크](https://github.com/devkimchi/Key-Vault-from-Logic-Apps)한 깃헙 리포지토리의 ARM 템플릿을 실행시켜 보면 대략 어떤 식으로 될지 감이 올 것이다.
