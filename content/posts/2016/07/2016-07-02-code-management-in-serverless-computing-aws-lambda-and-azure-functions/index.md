---
title: "서버리스 코드 관리 - AWS 람다와 Azure 펑션"
date: "2016-07-02"
slug: code-management-in-serverless-computing-aws-lambda-and-azure-functions
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure Functions
- AWS Lambda
- Serverless
- APEX
fullscreen: false
cover: ""
---

`서버리스` 세상에서 우리는 서버를 전혀 셋업할 필요가 없다. 단지 펑션이라고 불리는 코드만 신경 쓰면 될 뿐이다. 하지만 서버리스 세상에서 FaaS(Function as a Service) 제공자가 가진 주요 문제점(?)들 중 하나는 코드 관리 부분이 취약하다는 것이다. 이 포스트에서는 [AWS 람다 (`람다`)](http://aws.amazon.com/lambda) and [Azure 펑션 (`펑션`)](https://azure.microsoft.com/en-us/services/functions)을 소스코드 관리 관점에서 비교해 보도록 하겠다.

## AWS 람다

`람다`는 코드 관리 기능을 자체적으로 제공하지 않는다. 물론 `.zip` 파일로 만들어서 업로드를 하게 되면 버전 관리가 가능하긴 하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-01.png)

하지만 이것은 DevOps 관점에서는 적합하지 않은데, 아티팩트들을 수동으로 업로드해야 하기 때문이다. 웹 에디터는 변경 이력 관리를 전혀 하지 않는다. 그렇다면 `람다`를 이용해서 어떻게 코드 관리를 할 수 있을까? 다행히도 [`Apex`](http://apex.run) 라고 불리는 좋은 오픈소스 도구가 있다. `Apex`는 자신의 웹사이트에서 "손쉽게 `람다`에 코드를 테스트하고 설치하게 도와준다"고 한다. 굉장히 훌륭한 도구처럼 보인다. 그럼 한 번 들여다 보도록 하자.

### AWS CLI

`Apex`를 사용하기 위해서는 우선 [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)를 내 개발용 컴퓨터(또는 빌드서버)에 설치해야 한다. 크로스 플랫폼을 지원하므로 내가 사용하는 OS에 맞춰서 설치하면 된다(여기서는 윈도우용 CLI를 사용한다). 설치가 끝나면 아래 명령어를 통해 제대로 설치가 됐는지 확인해 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-02.png)

이제 AWS CLI를 내 개발용 컴퓨터에 설치했다. 이제 [AWS 설정](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)을 해보도록 하자. `aws configure` 명령을 실행해서 `AWS Access Key ID`, `AWS Secret Access Key`, `Default region name` and `Default output format` 값들을 입력하도록 하자:

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-03.png)

이제 `Apex`를 위한 준비가 모두 끝났다.

### Apex

`Apex`는 크로스 플랫폼 도구이다. `Apex`를 실행시키기 위한 바이너리 파일은 [깃헙 리포지토리](https://github.com/apex/apex/releases)에서 다운로드 받을 수 있다. 각 OS별로 이름이 다 다르기 때문에 다운로드 받은 후에 이름을 `apex`로 바꾸는 것을 추천한다(물론 안해도 된다). 그리고 난 후 아래 명령어를 커맨드 프롬프트를 열고 실행시켜보도록 하자:

https://gist.github.com/justinyoo/9c5a45ffc65205c858f24785d287fbaf

프로젝트 이름과 설명을 입력하고 나면 이제 람다 펑션이 준비가 끝나서 곧바로 설치할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-04.png)

초기화가 끝나면, 파일이 몇 개 만들어진 것을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-05.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-06.png)

기본적인 스카폴딩 파일이므로 적절하게 수정한 후 아래 명령어를 실행시켜보자:

https://gist.github.com/justinyoo/c8db1e74f1019b83c9184c0054712218

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-07.png)

`람다`에 방금 생성한 펑션이 설치된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-08.png)

> `Apex`를 통해 설치한 펑션은 웹에디터를 통해 직접 수정이 불가능하다. ![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-09.png)

지금까지 `Apex`를 통해 `람다` 펑션을 생성하고 수정하고 설치하는 것에 대해 간략하게 살펴보았다. 이제 이 폴더에 `git init` 명령어를 실행시켜 리포지토리를 만들고 빌드 서버와 통합시키면 끝. 이제부터 코드 변경 이력을 관리할 수 있다.

## Azure 펑션

`펑션`을 통해 코드를 관리하는 것은 `람다`에서 관리하는 것보다 훨씬 더 쉽다. 일단 `펑션`에서는 `Apex`와 같은 써드파티 도구가 전혀 필요가 없고 자체적으로 git을 지원하기 때문에 그저 Azure 포탈에서 리포지토리 URL을 받아서 사용하기만 하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-10.png)

git을 지원하는 다양한 서비스들과 통합이 가능한데, 만약 `Local Git Repository`를 선택했다면, git에 접근할 수 있는 URL과 계정이 자동으로 화면에 아래와 같이 나타난다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-11.png)

이 접속 정보를 가지고 손쉽게 빌드 서버와 연동시켜서 코드 변경 이력을 관리할 수 있다.

> `람다`와 마찬가지로 git을 연동한 상태라면 코드를 직접 웹 데이터에서 수정할 수는 없다. ![](https://sa0blogs.blob.core.windows.net/aliencube/2016/06/code-management-12.png)

지금까지 코드 관리 측면에서 `람다`와 `펑션`을 간단하게 살펴보았다. `서버리스`라는 개념은 현재도 계속 발전하는 기술이고 굉장히 재미있는 기술임에 틀림없다. 따라서 어떤 식으로 발전되어 갈지 계속 눈여겨 보는 것도 좋을 것이다.

* * *

이 포스트의 내용으로 [이상한모임](http://weirdx.io)이 주최한 ["모두의 관리"](https://event.weirdx.io/720) 컨퍼런스에서 발표를 했다. 아래는 발표 동영상이다. 이 [슬라이드](https://docs.com/justinyoo/5769)와 함께 보면 더욱 좋다.

<iframe width="420" height="315" src="https://www.youtube.com/embed/9O32yoBtCm4" frameborder="0" allowfullscreen></iframe>
