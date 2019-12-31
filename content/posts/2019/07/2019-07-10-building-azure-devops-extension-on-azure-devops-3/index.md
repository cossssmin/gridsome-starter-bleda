---
title: "애저 데브옵스 확장 기능을 애저 데브옵스에서 개발하기 - 배포편 계정 생성"
date: "2019-07-10"
slug: building-azure-devops-extension-on-azure-devops-3
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure DevOps
- Extensions
- ALM
- Publish
- Publisher
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)를 통해 [애저 데브옵스](https://azure.microsoft.com/ko-kr/services/devops/) 확장 기능의 개발을 끝마쳤다면, 이 포스트에서는 이를 [마켓플레이스](https://marketplace.visualstudio.com/azuredevops)에 출판하기 위해서 필요한 퍼블리셔를 등록하는 방법에 대해 알아보기로 하자.

## 목차

1. [애저 데브옵스 확장 기능 개발하기 - 설계편](https://blog.aliencube.org/ko/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. [애저 데브옵스 확장 기능 개발하기 - 개발편](https://blog.aliencube.org/ko/2019/07/03/building-azure-devops-extension-on-azure-devops-2/)
3. **_애저 데브옵스 확장 기능 개발하기 - 배포편 계정 생성_**
4. [애저 데브옵스 확장 기능 개발하기 - 수동 배포편](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 1](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 2](https://blog.aliencube.org/ko/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## 사용자 케이스

개인적으로 [휴고](https://gohugo.io/)라는 정적 웹사이트 생성도구를 이용해서 웹사이트를 하나 만들어 보는 중인데, [휴고 확장 기능](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension)은 애저 데브옵스에서 찾을 수 있었지만, 이를 [Netlify](https://netlify.com)로 배포하는 확장 기능은 찾을 수 없었다. 따라서, 실제로 이 [Netlify](https://netlify.com) 확장 기능을 개발해 보도록 하자.

> 현재 Netlify 확장 기능은 [이곳](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)에 배포되었고, 실제 곧바로 사용할 수 있다. 이 포스트는 이 확장 기능을 개발하면서 실제 마주쳤던, 공식 문서에 구체적인 설명이 없지만 개발하면서 필요한 여러 가지 상황들을 기록하는 의미도 지니고 있다. 또한 이 확장 기능은 [이곳 깃헙 리포지토리](https://github.com/aliencube/AzureDevOps.Extensions)에서 관련 소스 코드를 확인할 수 있다.

## 비주얼 스튜디오 마켓플레이스 퍼블리셔 등록

확장 기능을 등록하기 위해서는 우선 퍼블리셔를 등록해야 한다. 모든 확장 기능은 바로 이 퍼블리셔의 이름을 달고 배포가 되기 때문인데, 이는 말 그대로 마켓플레이스는 장터만 제공하는 플랫폼으로서의 역할일 뿐이고, 실제 개발 및 유지보수는 해당 퍼블리셔가 담당하는 시스템이라서 그렇다. 이 퍼블리셔를 등록하는 절차 자체는 크게 어려운 것이 없다. 다만, 등록을 위해서 반드시 알고 있어야 할 사항들이 몇 가지가 있는데, 이를 논의해 보기로 하자.

### 몇 개의 퍼블리셔를 등록해야 할까?

말 그대로다. 내 확장 기능을 마켓플레이스에 출판하기 위해서는 퍼블리셔가 몇 개나 필요할까? 언뜻 생각해 보면 하나면 충분하지 싶다. 사실 일반적으로는 하나면 충분하다. 그렇지만, 모든 개발 프로세스를 자동화 한다고 가정을 해 본다면 과연 하나면 충분할까? 예를 들어 소프트웨어 개발 프로세스 단계를 보자면 소프트웨어를 개발한 후 먼저 개발 환경에 배포하고, 다음 테스트 환경, 마지막으로 프로덕션 환경으로 순차적인 배포를 통해 발생할 수 있는 여러 이슈를 사전에 잡아낼 수 있게끔 하는 것이 일반적이라고 할 수 있다. 물론 여기서는 개발/테스트/프로덕션의 3단계 배포 프로세스를 거친다고 했지만, 회사마다 다양한 단계의 배포 프로세스가 존재할 수 있다.

이 경우를 애저 데브옵스 확장 기능 개발에 적용한다면, 하나의 퍼블리셔를 통해 이 모든 것들 다 해결할 수도 있겠지만, 차라리 개발용 퍼블리셔, 테스트용 퍼블리셔, 프로덕션용 퍼블리셔 등 각 단계별 퍼블리셔를 등록해서 사용하는 것이 조금 더 효과적이다. 퍼블리셔 등록 자체는 무료이니 걱정 없이 원하는 숫자만큼 퍼블리셔를 등록해 보도록 하자.

> 여기서는 개발/프로덕션 두 단계만 고려했기 때문에 퍼블리셔도 두 개만 생성하기로 한다. 물론, 굳이 추천하지는 않겠지만 여러 가지 불가피한 상황 때문에 퍼블리셔를 하나만 만들어 사용할 수도 있다. 이 부분은 다음 포스트에서 구체적으로 다루기로 한다.

### 애저 액티브 디렉토리 선택

이제 실제로 등록 절차를 한 번 살펴 보기로 하자. 우선 [마켓플레이스 페이지](https://marketplace.visualstudio.com/azuredevops)로 들어가 보면 우측 상단에 로그인 버튼과 더불어 [`publish extensions`](https://marketplace.visualstudio.com/manage)라는 링크가 보인다. 클릭해서 들어가면 로그인을 하게 될 것이다. 이 때 퍼블리셔를 등록하고자 하는 계정으로 로그인을 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-3-01.png)

로그인이 끝나면 처음으로 퍼블리셔를 등록하는 경우 아래와 같은 화면이 보일 것이다. 여기서 내가 현재 로그인 한 계정의 이메일 주소와 애저 액티브 디렉토리 이름이 보인다. 아래 스크린샷에서는 블러 처리 했다. 이 부분을 반드시 확인해야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-3-02.png)

내가 어떤 애저 액티브 디렉토리에 퍼블리셔를 만들어야 하는지 꼭 확인하지 않으면 나중에 엉뚱한 디렉토리에 퍼블리셔가 만들어질 수 있으니 주의하도록 한다.

> 원하지 않은 디렉토리에 퍼블리셔가 만들어지면 다른 개발자와 협업하기가 번거로와지기도 하고, 조직 구성에 따라 보안 관련 규정이 까다로와질 수 있으니 반드시 꼼꼼하게 챙기도록 한다.

좀 더 꼼꼼하게 확인하고 싶다면 위 스크린샷의 `Change` 링크를 클릭해 보자. 그러면 아래와 같이 살짝 바뀌면서 정확한 애저 액티브 디렉토리를 선택할 수 있다. 현재 필자의 계정은 세 군데의 애저 액티브 디렉토리에 연결되어 있기 때문에 이렇게 보이는 것이고, 계정에 따라 하나만 있을 수도, 여러 개의 디렉토리가 보일 수도 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-3-03.png)

### 기본 정보 설정

이제 퍼블리셔 기본 정보를 등록할 차례이다. 아래 두 `Name` 필드와 `ID` 필드를 입력하면 된다. 여기서 중요한 것은 바로 ID 필드인데, 이것은 전체 마켓플레이스에서 유일해야 하는 부분이므로 신중히 생각해서 결정하도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-3-04.png)

이 시리즈를 위해서 필자는 [`aliencube-dev`](https://marketplace.visualstudio.com/publishers/aliencube-dev), [`aliencube`](https://marketplace.visualstudio.com/publishers/aliencube) 이 두 퍼블리셔를 등록했다.

### 상세 정보 설정

이번에는 퍼블리셔에 대한 상세 정보를 등록할 차례이다. 사실 이 부분은 선택적이긴 한데, 내가 개발한 확장 기능을 일반에 공개할 계획이라면 작성하는 것이 좋다. 그래야만 내 확장 기능을 다운로드 받는 사람들이 좀 더 퍼블리셔에 대해 안심하게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-3-05.png)

### 퍼블리셔 인가 요청

만약 내가 생성하는 퍼블리셔가 내부 개발 용도로만 쓰인다면 굳이 이 단계는 필요 없다. 예를 들어 이 시리즈에서 `aliencube-dev` 퍼블리셔는 내부 개발 용도로만 사용할 예정이므로 굳이 이 단계를 거칠 필요가 없지만, `aliencube` 퍼블리셔는 공개 확장 기능을 배포할 계획이므로 반드시 아래 체크 버튼을 클릭해서 마이크로소프트에서 공인을 받아야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-3-06.png)

만약 인가 요청을 선택한 상태에서 `Create` 버튼을 클릭하면 아래와 같은 이메일을 받게 되고,

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-3-07.png)

그리고 며칠 후에 아래와 같은 인가 확인 이메일을 받을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-3-08.png)

* * *

이로써 애저 데브옵스 확장 기능을 마켓플레이스에 배포하기 위한 퍼블리셔 등록 절차가 모두 끝났다. 사실 쉽게 생각하면 이 퍼블리셔 등록 절차가 까다로운 것은 아닌데 향후 CI/CD 파이프라인을 이용한 자동 배포 절차를 고려한다면 위와 같이 좀 고민해 볼 수 있는 부분이다. [다음 포스트](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)에서는 지금까지 개발한 확장 기능을 배포하기 위한 패키지를 만들고 이를 수동으로 배포해 보는 과정을 다뤄 보도록 하자.
