---
title: "ARM 템플릿에서 로직앱 분리해 내기"
date: "2018-06-09"
slug: separation-of-concerns-logic-app-from-arm-template
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- steps
- azure-logic-apps
- separation-of-concerns
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/06/separate-of-concerns-logic-app-from-arm-template-00.jpg
---

애저 로직 앱은 서버리스 워크플로우 엔진으로 다양한 작업을 일련의 흐름 안에서 통합적으로 관리하는데 굉장히 유용하다. 애저 펑션과 유사한 기능을 수행하지만, 애저 리소스를 비롯한 다양한 써드파티 애플리케이션에 대한 API 커넥터를 보유하고 있어, 굳이 코드를 작성하지 않고서도 원하는 작업을 수행할 수 있다. 이 워크 플로우는 하나의 커다란 JSON 객체로 정의하는데, 이 JSON 객체는 ARM 템플릿과 긴밀하게 통합되어 있다. 따라서 어찌 보면 로직 앱은 ARM 템플릿에 의존성이 있다고 할 수 있다.

사실, 이러한 의존성 덕분에 로직 앱을 만들 때면 매번 수정을 할 때 마다 ARM 템플릿 전체를 새로 배포해야 하는 상황이 발생한다. 어찌 보면 ARM 템플릿은 애저 리소스에 대한 인프라스트럭처에 해당하고, 로직 앱 워크플로우는 그 리소스에 설치하는 애플리케이션에 가까운데, 이를 하나로 묶어서 매번 배포하는 것은 객체 지향 프로그래밍 설계 원칙 중 하나인 "관심사의 분리 (Separation of Concerns)"에 위반한다고도 볼 수 있다. 이 포스트에서는 객체 지향 프로그래밍 원리 중 하나인 "의존성 분리 원칙"에 의해 ARM 템플릿에서 애저 로직앱 워크플로우를 분리하는 방법에 대해 알아보도록 한다.

> 이 포스트에서 사용한 로직 앱 코드 샘플은 [이곳](https://github.com/devkimchi/Separating-Logic-App-from-ARM-Template)에서 확인 가능하다.

## 로직앱 구조 분석

ARM 템플릿과 그 안에 존재하는 로직 앱의 구조는 대략 아래와 같다.

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=logic-app.json

`properties` 속성 값의 JSON 객체가 바로 로직 앱에 해당하는 부분이다. 이 JSON 객체의 속성 중 `parameters`는 ARM 템플릿에서 만들어진 여러 값들을 로직 앱으로 전달하는 일종의 관문 역할을 한다. 실제 워크플로우는 바로 `definition` 속성에서 정의한다. 따라서, 이론적으로는 이 두 속성만 별도로 ARM 템플릿에서 분리할 수 있다면 문제가 해결되는 셈이다. 실제로 한 번 분리해 보도록 하자.

## 로직 앱 작성

우선 ARM 템플릿과 합쳐져 있는 로직 앱은 아래와 같다. 현재 로직 앱이 설치되어 있는 리소스 그룹의 배포 이력을 조회하는 워크플로우를 정의해 놓았다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/separate-of-concerns-logic-app-from-arm-template-01.png)

위 워크플로우를 정의한 ARM 템플릿은 대략 아래와 비슷한 형태가 될 것이다.

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=azuredeploy-full.json

## 로직 앱 분리

이제 이 ARM 템플릿에서 `parameters`와 `definition`을 분리해 별도의 파일로 저장한다.

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=parameters.json

여기서 `parameters.json` 파일 안에 보면 `{subscriptionId}`와 같은 문자열을 볼 수 있다. 이는 향후 해당 로직 앱이 CI/CD 파이프라인을 거치면서 다양한 값들을 받아들일 수 있도록 조치해 놓은 것이다.

아래는 실제 로직 앱 워크플로우 정의 부분이다. 여기서는 절대로 워크플로우 안에서 ARM 템플릿의 `parameters` 또는 `varibles` 값을 참조하는 형식으로 작성하면 안된다. 이미 별도의 파일로 분리가 되어 있기 때문에 ARM 템플릿과는 독립적으로 작동하기 때문이다. 다만, `parameters.json` 파일에 정의해 놓은 값들은 사용할 수 있다.

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=definition.json

이후 남은 ARM 템플릿은 아래와 같은 모양이 될 것이다.

https://gist.github.com/justinyoo/6245ade21d62982180a29f26ba4e7317?file=azuredeploy.json

여기까지 왔다면 이제 ARM 템플릿은 순수한 로직앱 인스턴스만 설치하는 형태로, 이 상태에서 이 ARM 템플릿을 배포하면 빈 껍데기만 있는 로직 앱 인스턴스가 만들어진다. 실제로 애저 포탈에서 학인해 보면 아래와 같이 워크플로우를 작성하라는 화면이 나오는 것을 알 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/separate-of-concerns-logic-app-from-arm-template-02.png)

## 로직 앱 설치

이제 별도로 분리한 로직 앱을 설치할 차례이다. 이 때 쓸 수 있는 애저 파워셸 명령여가 바로 `Set-AzureRmResource`이다. 이 명령어를 이용해서 애저 리소스를 업데이트하는 형식으로 ARM 템플릿 없이 로직 앱만 별도로 설치가 가능해진다. 아래 파워셸 스크립트를 보자. 가장 먼저 변수 설정을 한 후, `parameters.json` 파일을 읽어 필요한 값을 설정한다. 다음으로 `definition.json` 파일을 읽어 로직 앱 워크플로우를 정의한다. 마지막으로 기존 로직 앱 인스턴스 정보를 읽어들여 신규로 읽어들인 값으로 설정한 후, 저장하면 된다.

https://gist.github.com/justinyoo/0f1bf2d5776717afdb0afc2278b949d7

이후 다시 애저 포탈을 통해 확인해 보면 제대로 로직 앱이 설치가 됐고, 실제로 실행을 시켜 보면 정상적으로 작동하는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/06/separate-of-concerns-logic-app-from-arm-template-03.png)

## 고려 사항

워크플로우를 정의하는 `definition.json`에서는 오로지 `parameters.json`에서 정의한 값들만 참조할 수 밖에 없다. 그런데 이 `parameters.json`은 ARM 템플릿에서 정의한 값들을 로직앱 내부로 전달해주는 관문 역할을 하는데, 지금과 같이 별도의 파일로 분리해 낼 경우 ARM 템플릿 변수 값을 전달할 방법이 마땅하지 않다.

이 때에는 ARM 템플릿의 `outputs` 섹션을 통해 ARM 템플릿에서 생성한 변수 값을 밀어내고, 이를 `parameters.json` 파일을 읽어 들일 때 활용하는 형태로 하는 것이 좋다.

* * *

지금까지 ARM 템플릿에서 로직 앱 워크플로우를 분리해 내는 방법에 대해 알아 보았다. 이렇게 함으로써, 로직 앱 인스턴스를 위한 ARM 템플릿은 계속해서 재사용 할 수 있고, 실제 워크플로우 부분은 별도의 파일에서 관리하면서 CI/CD 파이프라인 안에서 워크플로우 변경시 해당 부분만 빠르게 배포할 수 있게 됐다. 아직까지는 이 방법이 최선이라고 할 수 있겠다. 곧 로직 앱 내부적으로 이러한 방법이 적용될 수 있기를 기대한다.
