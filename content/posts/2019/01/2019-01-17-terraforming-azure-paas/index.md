---
title: "애저 PaaS 테라포밍"
date: "2019-01-17"
slug: terraforming-azure-paas
description: ""
author: Justin Yoo
tags:
- ARM & DevOps on Azure
- ARM Templates
- Azure Functions
- Azure Logic Apps
- Azure PaaS
- Terraform
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/01/terraforming-azure-ipaas-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

[테라폼](https://www.terraform.io/)은 [해시코프](https://www.hashicorp.com/)에서 만든 클라우드 인프라 자동화 도구이다. 각각의 클라우드 벤더는 자신만의 인프라스트럭처 구성 도구가 있는데, 애저는 [애저 리소스 매니저](https://docs.microsoft.com/en-us/azure/azure-resource-manager/)가 있어서, 이를 바탕으로 ARM 템플릿을 만들어 사용한다. 하지만, 벤더마다 자신만의 고유한 방식으로 이를 구성하기 때문에 만약 멀티 클라우드를 구성한다든가, 한 벤더에서 다른 벤더로 이전하는 경우에는 인프라 구성 스크립트를 새롭게 만들어야 한다. 어찌 보면 당연한 것이기도 하지만, 어찌 보면 같은 작업을 반복하는 것이기도 한데, 테라폼은 이런 고민의 결과물이라고 할 수 있다. 테라폼이 지원하는 클라우드 벤더는 아주 방대하도록 다양해서 동일한 스크립트 환경과 문법에서 멀티 클라우드 환경을 지원할 수 있다는 것이 바로 이 도구의 셀링 포인트라고 해도 좋을 정도이다.

하지만 테라폼을 이용한 예제는 거의 대부분 AWS를 대상으로 하는 것이어서 애저를 대상으로 하는 예제는 공식 문서 이외에서는 좀처럼 찾기가 어렵다. 더군다나 애저 PaaS와 관련한 내용은 그 중에서도 더 찾기가 어려운데, 이 포스트에서는 테라폼을 이용해서 애저 PaaS 관련 인프라스트럭처를 구성하는 방법, 그 중에서 애저 펑션과 로직 앱을 구성하는 방법에 대해 알아보고 테라폼과 ARM 템플릿을 비교해 보도록 한다.

> 이 포스트에서 사용한 예제는 [이 리포지토리](https://github.com/devkimchi/Terraform-for-Azure-iPaaS-Sample)에서 확인할 수 있다.

## 테라폼 스크립트 구성

테라폼은 굉장히 따라하기 쉬운 [시작하기](https://learn.hashicorp.com/terraform/getting-started/install.html) 문서를 제공한다. 물론 AWS의 가상 머신 설치를 대상으로 하지만, 이를 바탕으로 [애저 프로바이더](https://www.terraform.io/docs/providers/azurerm/index.html)를 활용하면 된다. [열무님](https://twitter.com/mooyoul)께서 친절히 [한국어 증강 번역본(?)](https://mooyoul.github.io/2016/12/19/Terraform-101/)도 제공하고 있으니 영어가 부담스럽다면 이 문서를 바탕으로 시작하면 좋다.

### 애저 리소스 모듈

아무래도 재사용성을 고려하다 보면 각 애저 리소스별로 모듈을 하나씩 만들어 두면 향후 여러모로 쓰기가 편하다. 기본적으로 이 포스트에서는 애저 펑션과 로직 앱을 만드는데, 이를 위해서는 최소 아래와 같은 리소스가 필요하다.

- 리소스 그룹
- 저장소 어카운트
- 앱 서비스 플랜 (컨섬션 플랜)
- 애저 펑션
- 로직 앱

즉, 이 말은 다섯 개의 모듈로 나눌 수 있다는 말이다. 각각의 모듈은 나중에 추가적인 리소스가 필요할 때 독립적으로 사용할 수 있으므로 꽤 편리하다. 또한 각 모듈은 리소스 `resource.tf`, 외부 변수 `variables.tf`, 반환값 `outputs.tf`와 같이 편의상 구분을 해 놓았다.

### 리소스 그룹

먼저 리소스 그룹을 구성하는 모듈을 살펴 보자. `provider`, `locals`, `resource`의 세 섹션으로 구성되어 있다.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=resourcegroup.tf

- `provider` 섹션에서는 이 리소스를 구성하기 위한 애저 프로바이더의 버전을 지정한다. 이 안에 인증 정보도 넣을 수 있지만, 여기서는 버전만 지정하는 것으로 하자.
- `locals` 섹션은 이 모듈 내부적으로 사용하기 위한 변수들을 정의하는 영역이다. 여기서는 외부 변수를 받아 다음 섹션에서 정의하는 리소스에서 사용할 수 있게 적당히 값을 변환하거나 한다.
- `resource` 섹션은 실제 리소스를 정의하는 부분이다. 여기서는 리소스 그룹을 정의하고 있다. 위 스크립트를 보면 `resource` 섹션에서는 `var.xxx` 와 같은 외부 변수 값 대신 `local.xxx` 와 같은 내부 변수 값을 사용한다. 실제로 `var.xxx` 를 사용해도 아무런 문제가 되지 않지만, `variables`과 `locals`의 역할을 고려해 본다면, `locals` 값을 사용하는 것이 훨씬 더 시만틱하다는 것을 알 수 있다. [이 글](https://devkimchi.com/2018/06/19/arm-template-lifecycle-management-dos-and-donts/)에서 언급하는 ARM 템플릿에서 `parameters`와 `variables`를 구분해서 쓰는 이유와 동일하다.

이제 리소스 그룹을 만들기 위한 외부 변수 정의 영역을 살펴보자. `variables.tf` 파일에서는 오로지 외부에서 값을 받아오는 변수들만 정의한다.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=variables.tf

변수 타입은 `string`, `list`, `map` 이렇게 세가지 밖에 없는데, 모든 문자열, 숫자, 불리언 값들은 `string`으로 정의해 두면 내부적으로 알아서 변환된다. `map` 타입은 플랫 Key-Value 짝의 형태이고, 이 때 Value는 항상 `string` 타입만을 가정하고 있을 뿐 복잡한 구조의 객체 형식은 지원하지 않는다.

또한 리소스 그룹은 다른 리소스를 정의할 때 참조를 해야 하므로 모듈 작성시 반드시 `output` 값을 통해 필요한 값을 노출시켜야 한다. 아래는 `outputs.tf` 파일의 내용이다.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=outputs.tf

기본적으로 리소스 그룹이 만들어지면 `id` 값과 `name`, `location` 값은 해당 리소스 그룹 안의 모든 리소스들이 참조하는 값이므로 이와 같은 방법으로 노출시킨다.

> 저장소 어카운트, 컨섬션 플랜 리소스 정의는 리소스 그룹 정의와 비슷하므로 여기선 자세히 다루지 않는다. 다만, 저장소 어카운트 실행 결과 반환 값 중 하나는 반드시 커넥션 스트링을 포함해야 하고, 컨섬션 플랜 실행 결과는 반드시 컨섬션 플랜 ID 값을 반환해야 아래 펑션 앱 정의 문서에서 이를 참조할 수 있다.

### 애저 펑션

이제 애저 펑션 리소스를 정의한 모듈을 살펴보자. 리소스 그룹을 정의한 문서와 크게 다르지 않다.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=functionapp.tf

가장 먼저 `provider` 섹션을 정의한 후, `locals` 섹션을 통해 그 다음 따라오는 `resource` 섹션에서 사용할 변수 값들을 정리했다. 리소스 그룹 정의와 달리 애저 펑션 인스턴스는 설정할 것이 조금 더 많은데, `site_config` 섹션, `app_settings` 섹션을 눈여겨 보자.

애저 펑션 인스턴스를 정의할 때 ARM 템플릿과 테라폼 스크립트의 구조가 살짝 다르다. 예를 들어 `http_only` 값은 사실 `site_config` 쪽에 들어가 있어야 ARM 템플릿과 동일한 구조를 갖게 되지만, 그렇지 않다. 또한 `storage_connection_string`과 `version` 역시도 `app_settings` 안에 들어가 있어야 하지만, 별도로 빠져 있다. 이런 차이점이 어떻게 작용할지는 잘 모르겠지만, ARM 템플릿과 테라폼 사이에 존재하는 이런 부분이 나중에는 사용자에게 혼란을 가져오지 않을까 하는 의구심도 든다.

> **참고**: 애저 펑션 컨섬션 플랜의 경우에는 `always_on` 값이 항상 `true`이므로 여기에서 별도로 설정할 필요가 없다. 만약 이 값을 그래도 정의하고 싶다면 `site_config` 항목 아래 정의하면 되긴 하지만, 이것은 이미 애저 펑션의 설정에 정의되어 있으므로, 테라폼 스크립트 상에서는 [이를 적용시킬 때 에러가 난다](https://github.com/terraform-providers/terraform-provider-azurerm/issues/1560#issuecomment-453724892). 공식 문서에서는 설정할 수 있는 것으로 나와 있지만, 사실과 다르다. 일해라 해시코프! 물론, 컨섬션 플랜이기 때문에 이런 제약 사항이 생긴 것이다. 컨섬션 플랜이 아닌 일반 앱서비스 플랜의 경우에는 해당사항이 없다.

### 애저 로직 앱

이번에는 로직 앱을 테라폼으로 정의해 보도록 한다. 애저 펑션과 달리 로직 앱의 경우에는 리소스 그룹과 로직 앱 자체만 정의하면 되기 때문에 크게 복잡하지 않다.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=logicapp.tf

딱 여기 까지만 정의하면 로직 앱이 만들어진다. 그런데, 나머지 워크플로우는 어디에서 정의해야 할까? 테라폼에서 지원하는 로직 앱 관련 리소스는 앞서 언급한 `azurerm_logic_app_workflow`을 통해 로직 앱 인스턴스 자체를 생성하고, `azurerm_logic_app_trigger_http_request`, `azurerm_logic_app_trigger_recurrence`, `azurerm_logic_app_trigger_custom`를 통해 트리거를 추가한다. 그리고 `azurerm_logic_app_action_http`, `azurerm_logic_app_action_custom`을 통해 액션을 추가할 수 있다.

그런데, 로직 앱 트리거는 HTTP 트리거와 스케줄러 트리거만 있는 게 아니라 굉장히 많은 트리거가 있다. 특히 외부 커넥터를 이용한 API 트리거가 거의 대부분인데, 이를 위해서는 `azurerm_logic_app_trigger_custom`을 사용할 수 밖에 없다. 이와 관련한 예제 코드는 대략 아래와 같이 생겼다.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=logicapp-custom-trigger.tf

위의 보기와 같이 `body` 부분을 JSON 하드코딩으로 정의하거나, 아니면 JSON 파일을 읽어서 문자열로 대체하거나 하면 되는데, 이렇게 JSON 하드 코딩을 하려면 테라폼을 쓸 이유가 전혀 없기 때문에 로직 앱 인스턴스 까지만 정의하고 나머지 상세 워크플로우는 테라폼 밖에서 파워셸이나 애저 CLI를 이용해서 추가하는 것이 낫다. 이와 관련한 내용은 이미 예전에 [ARM 템플릿에서 로직앱 분리해 내기](https://blog.aliencube.org/ko/2018/06/09/separation-of-concerns-logic-app-from-arm-template/)에서 다룬 적이 있으므로 해당 포스트를 참조하면 된다.

또한, 이 포스트를 쓰는 현 시점에서는:

1. 로직 앱의 Managed Identity 기능을 정의할 수 없고,
2. API 커넥션을 정의할 수 없고,
3. 커스텀 API를 정의할 수 없고,
4. 통합 어카운트를 정의할 수 없다.

위의 내용은 로직 앱 구성에 있어서 없어서는 안될 것들인데 이 모든 것들을 테라폼으로 정의할 수 없기 때문에 테라폼은 로직 앱을 위해서는 거의 쓸모 없는 것과 마찬가지이다.

### 마스터 오케스트레이터

이렇게 리소스 그룹, 저장소 어카운트, 컨섬션 플랜, 펑션 앱, 로직 앱 모듈 모두 정의가 끝났다면, 이제 이를 한꺼번에 호출해서 정리해 줄 마스터 오케스트레이터 파일을 만들어야 한다. 아래 오케스트레이터 파일 정의를 살펴보자.

https://gist.github.com/justinyoo/56f4078a7ef30efdec3f702b2620aedd?file=orchestrator.tf

- `locals` 섹션을 보면 그 위에서 정의한 다양한 `variable` 들을 조합해서 새로운 내부 변수를 만들어 놓은 것을 볼 수 있다. 이 `local` 변수들은 그 아래에 정의한 `module` 부분에서 사용한다. 앞서 언급했다시피 `module` 영역에서는 `variable` 변수를 직접 사용하는 대신 `local` 변수를 사용하는 것이 좋다.
- 각각의 `module`을 보면 `source` 값이 모두 로컬 디렉토리를 가리키고 있다. 이 부분이 ARM 템플릿에 비해 테라폼이 월등히 나은 부분이다. ARM 템플릿으로 연결 템플릿을 호출하려면 반드시 URL을 통해서만 호출할 수 있다. 하지만, 테라폼은 URL을 통해서 뿐만 아니라 이렇게 로컬 디렉토리를 참조해서도 받아올 수 있는데, 이는 CI/CD를 구성하다 보면 굉장한 강점으로 다가온다.
- 각각의 `module` 안에서 `source` 속성을 제외한 나머지는 모두 각 모듈에서 정의한 외부 변수들이다. 오케스트레이터에서 정의한 `local` 변수를 바탕으로 각 모듈의 외부 변수에 값을 지정해 주면 된다.
- 펑션 앱의 변수들 중 `resource_group`은 리소스 그룹 모듈의 반환값 중 하나인 리소스 그룹 이름을 `module.resgrp.name`과 같은 식으로 참조해서 받아온다. 마찬가지로 `module.csplan.id`는 컨섬션 플랜 ID 값으로, `module.st.connection_string`는 저장소 어카운트의 커넥션 스트링 값을 받아온다.
- 기본적으로 각각의 모듈들은 참조가 없을 경우 동시에 실행된다. 하지만, 지금은 애저 펑션 인스턴스는 저장소 어카운트 모듈과 컨섬션 플랜 모듈에, 모든 리소스들은 리소스 그룹 모듈에 의존성을 갖고 있으므로 이에 따라서 가장 먼저 리소스 그룹 모듈이 실행되고, 이어서 저장소 어카운트 모듈과 컨섬션 플랜 모듈이 동시에 실행되며, 마지막으로 펑션 앱 모듈이 실행된다.
- 로직 앱 모듈은 `module.resgrp`에만 의존성을 갖고 있으므로 상대적으로 정의하기가 쉽다.

이렇게 오케스트레이터를 작성한 후 아래 커맨드를 실행시켜 보자.

```
terraform init

```

그러면 애저 프로바이더 관련 파일을 다운로드 받아서 `.terraform/plugins` 디렉토리 아래에 저장시켜 놓고, 또한 오케스트레이터에서 사용한 모든 모듈들에 대한 정보 역시도 다운로드 받아 `.terraform/modules` 디렉토리에 저장시켜 놓는다. 이제 다음 커맨드를 실행시켜 보자.

```
terraform plan -var "resource_name=[RESOURCE_NAME]"

```

이 명령어는 실제로 리소스를 구성하기 전에 오류는 없는지 어떤 식으로 구성을 할 것인지를 미리 검증하는 명령어이다. 이를 통해서 실제로 어떤 식으로 애저 펑션과 관련된 리소스들이 만들어질 지 알 수 있다. 물론 아직 실제로 리소스를 만드는 것은 아니다. 여기까지 다 했다면 아래 커맨드를 실행시켜 보자.

```
terraform apply -var "resource_name=[RESOURCE_NAME]" -auto-approve

```

이 명령어를 실행시키면 이제 실제로 테라폼을 통해 애저에 리소스를 만들게 된다. 마지막 `-auto-approve` 옵션이 없으면 실제 리소스 생성/변경 전에 확인을 한 번 해줘야 하지만, 이 옵션을 주게 되면 그런 절차 없이 곧바로 리소스를 생성한다. 아무 문제 없이 설치가 끝났다면, 리소스 그릅과 그 안에 저장소 어카운트, 컨섬션 플랜, 애저 펑션, 로직 앱 이렇게 네 가지 리소스가 설치되어 있어야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/terraforming-azure-ipaas-01.png)

그런데, 이 `Deployments` 블레이드를 살펴보면 히스토리가 없다! ARM 템플릿으로 리소스를 배포하면 여기에 배포 히스토리가 남게 되는데, 테라폼은 그렇지 않다. 이는 어찌 보면 굉장한 장점이 될 수 있다. [배포 히스토리는 총 800개를 초과할 수 없기 때문에](https://devkimchi.com/2018/05/30/managing-excessive-arm-deployment-histories-with-logic-apps/), ARM 템플릿으로 배포할 경우 수시로 히스토리를 정리해 줘야 하지만, 테라폼으로 배포할 경우에는 그런 부담이 없다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/terraforming-azure-ipaas-02.png)

## 테라폼 vs ARM 템플릿

지금까지 애저 펑션과 로직 앱 인스턴스를 테라폼을 이용해서 생성해 봤다. 그렇다면 테라폼과 ARM 템플릿 중 어떤 것이 나을까?

### 테라폼의 장점

| 테라폼 | ARM 템플릿 |
| ------ | ---------- |
| 가독성 높음 | 가독성 낮음 &ndash; YARM과 같은 도구를 이용해서 가독성 향상 가능 |
| 로컬 파일 시스템 모듈 참조 가능 | 로컬 파일 시스템 모듈 참조 불가능 &ndash; 오로지 URL 참조만 가능 |

### 테라폼의 단점

| 테라폼 | ARM 템플릿 |
| ------ | ---------- |
| 배포 히스토리 별도 관리 필요 | 배포 히스토리 자동 저장 |
| 애저 프로바이더 업데이트 느림 | |
| 애저 PaaS 지원이 상대적으로 약함 | |
| 배포 테스트를 위해 Go 언어만 사용 가능 | 배포 테스트를 위해 파워셸 사용 가능 |

대략 위와 같이 테라폼이 ARM 템플릿에 대해 갖는 장점과 단점을 간략하게 정리해 보았다. 만약 애저 PaaS를 위해서 테라폼과 ARM 템플릿 둘 중 하나를 선택하라고 한다면 여러 불편함에도 불구하고 아직까지는 ARM 템플릿이 낫다. 만약 둘 다 동시에 사용 가능하다면? 그래도 현재로써는 ARM 템플릿을 선택할 것이다. 리소스 배포 전 스크립트 테스트를 구현해야 하는데, 이를 위해 테라폼은 Go 언어를 다시 배워야 한다면, ARM 템플릿은 기존의 파워셸 cmdlet 만으로도 충분히 테스트가 가능하기 때문이다.

* * *

지금까지 애저 PaaS 리소스 구성을 위해 애저 펑션과 로직 앱을 중심으로 테라폼 스크립트를 구성해 보았다. 애저 IaaS를 위해서라면 테라폼은 충분히 좋은 선택일 수 있다. 하지만, 아직까지는 애저 PaaS를 위한 테라폼은 시기상조라는 결론과 함께 이 포스트를 마치고자 한다.
