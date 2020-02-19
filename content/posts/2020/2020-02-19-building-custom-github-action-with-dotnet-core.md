---
title: ".NET Core 콘솔 앱으로 커스텀 GitHub Action 만들기"
slug: building-custom-github-action-with-dotnet-core
description: "이 포스트에서는 .NET Core 콘솔 앱을 이용해서 커스텀 GitHub Actions을 만드는 방법에 대해 알아봅니다."
date: "2020-02-19"
author: Justin-Yoo
tags:
- github-actions
- custom-action
- docker
- dotnet-core
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/02/building-custom-github-action-with-dotnet-core-00.png
fullscreen: true
---

앞서 [여러 포스트][prev post 1]를 [통해][prev post 2] [다뤘던][prev post 3] [깃헙 액션][gh actions]을 이번 포스트에서도 이어가고자 한다. 지금까지는 기존에 누가 만들어 놓았던 액션을 사용했다면, 특정 상황에서는 내 요구사항에 맞는 액션을 찾을 수 없는 경우, 혹은 여러 가지 이유로 공개된 액션을 사용할 수 없는 경우가 있을 수 있다. 이럴 때 필요한 것이 바로 [커스텀 깃헙 액션][gh actions custom]이다. 이 포스트를 통해 어떤 경우에 커스텀 깃헙 액션을 사용하는지, 그리고 어떻게 만드는지에 대해 간단한 [.NET Core][.net core] 콘솔 앱을 통해 알아보기로 한다.


## 왜 커스텀 깃헙 액션을 사용할까? ##

[마켓플레이스][gh actions marketplace]에 올라와 있는 모든 깃헙 액션은 오픈소스이다. 오픈소스의 장점은 라이센스 규정을 준수한다면 누구나 사용할 수 있다. 동시에 라이센스 규정을 충족시켜야 한다는 규정 때문에 특정 상황에서는 사용하기 어려울 수도 있다. 이럴 경우 해당 깃헙 액션을 사용하는 대신 커스텀 액션을 만들어서 사용해야 한다. 또 다른 경우를 생각해 보자. 내가 원하는 형태의 깃헙 액션이 존재하지 않을 경우에는 누군가 만들어 공개할 때 까지 기다리거나 아니면 직접 만들어 써야 한다. 이 때 커스텀 깃헙 액션을 만들 수 있다.


## 커스텀 깃헙 액션의 종류 ##

커스텀 깃헙 액션을 만드는 방법은 크게 두 가지가 있다. 하나는 [도커 컨테이너로 만드는 방법][gh actions docker], 다른 하나는 [자바스크립트로 만드는 방법][gh actions nodejs]이다. 이 두 가지 방법은 모두 저마다의 장단점을 갖고 있는데 간략하게 짚어보도록 하자.

|                                  | 도커 액션                                       | 자바스크립트 액션                         |
|----------------------------------|-------------------------------------------------|-------------------------------------------|
| [러너][gh actions runner] 종속성 | [러너][gh actions runner]와 독립적으로 작동한다 | [러너][gh actions runner] 위에서 작동한다 |
| 퍼포먼스                         | 느리다                                          | 빠르다                                    |
| 멀티 플랫폼 지원                 | Ubuntu [러너][gh actions runner]만 지원한다     | 모든 [러너][gh actions runner]를 지원한다 |
| 언어 지원                        | 모든 언어를 사용할 수 있다                      | 자바스크립트로만 작성할 수 있다           |


도커로 만드는 커스텀 액션 보다 자바스크립트로 만드는 커스텀 액션이 일견 더 나이 보이기도 한다. 하지만, 다양한 언어를 지원한다는 점이 가장 큰 장점이기 때문에 본인이 가장 편하게 사용할 수 있는 언어를 사용하고 싶다면 도커 액션으로 가는 것이 좋다.

이 포스트에서는 C#을 사용할 예정이므로 도커 액션을 사용한다.

## .NET Core 콘솔 앱 만들기 ##

우선, 커스텀 액션에 사용할 .NET Core 콘솔 앱을 하나 만들어 보자. 단순히 `Hello World`를 출력하기 보다는 좀 더 실용적인 콘솔 앱을 만들어 보자면 대략 아래와 같다. 아래 코드는 입력을 받아서 [Microsoft Teams][ms teams] 채널로 메시지를 보내는 앱이다. 기본적인 코드의 구조는 대략 아래와 같다.

> [이 포스트][prev post 4]에서 다룬 애저 펑션 코드를 참조하면 좋다.

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=program.cs

콘솔 앱을 완성했다면 이제 이를 이용해 커스텀 액션을 만들어 보자.


## 커스텀 액션 메타 데이터 작성하기 ##

가장 먼저 해야 할 일은 커스텀 액션을 정의하는 메타데이터를 작성하는 것이다. 리포지토리의 루트에 `action.yml` 파일을 생성한다. 좀 더 자세한 내용을 알고 싶다면 [Metadata syntax for GitHub Actions][gh actions metadata] 페이지를 참조하기로 하고, 여기서는 필수 요소들만 나열해 본다.

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=action.yml&highlights=9-10

여기서 핵심은 `using` 파라미터와 `image` 파라미터이다. 도커 액션을 사용할 계획이므로 `using` 파라미터의 값은 반드시 `docker`가 되어야 하고, 다음 섹션에서 다룰 `Dockerfile`을 이용해서 컨테이터 빌드를 정의한다.

> `action.yaml`과 같이 `.yaml` 확장자를 사용하게 되면 리포지토리의 Settings 안에 저장한 secret 값들을 제대로 읽어오지 못하는 버그가 있다. 따라서 `.yml` 확장자를 유지하도록 하자. 실제 워크플로우는 `.yaml`, `.yml` 둘 중 무엇을 써도 상관 없다.


## `Dockerfile` 작성하기 ##

앞서 메타데이터 파일 `action.yml`을 작성하면서 `Dockerfile`을 정의한다고 했는데, 다음과 같이 정의해 보자. [.NET Core 3.1 SDK][.net core sdk]를 기본적으로 갖고 있어야 하므로 [`mcr.microsoft.com/dotnet/core/sdk:3.1`][.net core docker] 이미지를 베이스로 한다. 그리고 앞서 작성한 콘솔 앱 소스코드를 모두 복사한다. 마지막으로 `entrypoint.sh` 파일도 복사한 후 자동으로 이 파일을 실행시키도록 설정한다.

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=dockerfile.txt


## `entrypoint.sh` 파일 작성하기 ##

앞서 작성한 `Dockerfile` 안에 `entrypoint.sh` 파일을 복사해 넣었다. 이 파일의 내용을 작성해 보자. `Dockerfile` 안에서 복사해 온 콘솔 앱을 빌드하고 실행시키는 역할만 하면 되므로 아래와 같이 간단하게 작성할 수 있다.

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=entrypoint.sh

이제 기본적인 커스텀 액션의 구조는 다 만들어졌다! 실제로 이 액션이 제대로 작동하는지 테스트를 해 보도록 하자.


## 워크플로우 작성하기 ##

내가 만든 커스텀 액션이 제대로 작동하는지 알아보려면 직접 워크플로우를 만들어 실행시켜 보는 수 밖에 없다. 아래와 같이 `.github/workflows/main.yaml` 파일을 만들어 본다.

https://gist.github.com/justinyoo/073ed7a27a21786f922b6c8aca9b1729?file=workflow.yaml

이렇게 만든 워크플로우를 실행시켜 보면 대략 아래와 같은 형태로 [Microsoft Teams][ms teams] 채널에 메시지가 표시된다.

![][image-01]


## `README.md` 파일 작성하기 ##

이제 앞서와 같이 커스텀 액션은 다 만들었다. 만약 이를 마켓플레이스에 공개해서 누구나 사용할 수 있게 하려면 `README.md` 파일을 작성해야 한다. 이 파일에는 기본적인 액션의 소개와 사용법을 포함시켜 마켓플레이스에서 검색하면 누구나 이 액션을 어떻게 사용할 수 있는지 알 수 있게 해야 한다. 대략 포함시켜야 할 내용은 아래와 같다.

* 이 액션이 무엇을 위해 필요한지에 대한 구체적인 설명
* 입력 받을 파라미터 값들
* 출력될 파라미터 값들
* 이 액션이 필요로 하는 시크릿 값들
* 이 액션이 필요로 하는 환경 변수 값들
* 워크플로우 예시

이렇게 해서 마켓플레이스로 공개하면 대략 아래와 같은 형태로 보이게 된다.

![][image-02]

* [마켓플레이스][gh actions teams marketplace]
* [리포지토리][gh actions teams repo]

지금까지 .NET Core 콘솔 앱을 이용해 커스텀 깃헙 액션을 만드는 방법에 대해 실제 예제를 통해 알아 보았다. 이것은 그저 하나의 예시일 뿐이므로 본인의 용도에 맞는 액션을 하나씩 만들어 보면 깃헙 액션에 대한 전체적인 감을 쉽게 잡을 수 있을 것이다.


[image-01]: https://sa0blogs.blob.core.windows.net/aliencube/2020/02/building-custom-github-action-with-dotnet-core-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/aliencube/2020/02/building-custom-github-action-with-dotnet-core-02.png

[prev post 1]: https://blog.aliencube.org/ko/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/
[prev post 2]: https://blog.aliencube.org/ko/2019/12/18/building-ci-cd-pipelines-with-github-actions/
[prev post 3]: https://blog.aliencube.org/ko/2020/01/03/migrating-wordpress-to-gridsome-on-netlify-through-github-actions/
[prev post 4]: https://blog.aliencube.org/ko/2020/01/15/building-ms-teams-custom-connector-with-azure-functions/

[gh actions]: https://github.com/features/actions
[gh actions custom]: https://help.github.com/en/actions/building-actions
[gh actions marketplace]: https://github.com/marketplace?type=actions
[gh actions docker]: https://help.github.com/en/actions/building-actions/creating-a-docker-container-action
[gh actions nodejs]: https://help.github.com/en/actions/building-actions/creating-a-javascript-action
[gh actions runner]: https://help.github.com/en/actions/getting-started-with-github-actions/core-concepts-for-github-actions#runner
[gh actions metadata]: https://help.github.com/en/actions/building-actions/metadata-syntax-for-github-actions

[gh actions teams marketplace]: https://github.com/marketplace/actions/microsoft-teams-generic
[gh actions teams repo]: https://github.com/aliencube/microsoft-teams-actions

[.net core]: https://dotnet.microsoft.com/?WT.mc_id=aliencubeorg-blog-juyoo
[.net core sdk]: https://dotnet.microsoft.com/download/dotnet-core/3.1?WT.mc_id=aliencubeorg-blog-juyoo
[.net core docker]: https://hub.docker.com/_/microsoft-dotnet-core-sdk

[ms teams]: https://products.office.com/ko-kr/microsoft-teams/group-chat-software?WT.mc_id=aliencubeorg-blog-juyoo
