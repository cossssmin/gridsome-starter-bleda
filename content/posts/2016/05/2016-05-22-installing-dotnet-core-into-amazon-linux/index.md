---
title: "Amazon 리눅스에 .NET Core 설치하고 실행시키기"
date: "2016-05-22"
slug: installing-dotnet-core-into-amazon-linux
description: ""
author: Justin-Yoo
tags:
- dotnet
- amazon-linux
- dotnet-core
fullscreen: false
cover: ""
---

[지난 포스트](http://blog.aliencube.org/ko/2016/05/21/installing-mono-into-amazon-linux)에서는 Amazon Linux(이하 `아마존 리눅스`)에 [Mono](http://www.mono-project.com)(이하 `모노`)를 설치하는 방법에 대해 알아 보았다. 얼마전까지만 해도 모노가 리눅스 환경에서 C# 코드를 실행시킬 수 있는 유일한 방법이었다면 이제 [.NET 코어 프레임워크](https://www.microsoft.com/net/core)(이하 `닷넷 코어`)가 나오면서 좀 더 다양한 방법으로 C# 코드를 실행시킬 수 있게 되었다. 현재 닷넷 코어는 RC2 버전이 릴리즈된 상태이므로, 포스트에서는 이 닷넷 코어를 아마존 리눅스에 설치하고 실행시키는 방법에 대해 메모 차원에서 정리해 보고자 한다.

## 닷넷 코어 RC1 설치

RC2 버전을 설치하기에 앞서 우선 RC1 버전을 설치해 보도록 하자. 설치와 관련해서는 이 [공식 문서](https://docs.asp.net/en/1.0.0-rc1/getting-started/installing-on-linux.html#installing-on-centos-7)를 참조한다. 이전에도 언급했다시피 아마존 리눅스는 RHEL/CentOS 기반이므로 동일한 설정을 적용할 수 있다.

> 아마존 리눅스는 우분투 리눅스와 달리 닷넷 코어 RC1 에서 모노로만 실행시킬 수 있고 코어 CLR은 실행시킬 수 없다. 모노를 설치하는 방법은 [이전 포스트](http://blog.aliencube.org/ko/2016/05/21/installing-mono-into-amazon-linux)를 참조한다.

DNVM, DNU, DNX 모두 설치가 끝났다면 아래 리포지토리를 클론 받는다. 물론, 아마존 리눅스에는 git 도 설치가 되어 있지 않으므로 `sudo yum install git` 명령으로 설치 먼저 해야 한다.

- [https://github.com/devkimchi/Azure-Functions-AWS-Lambda-Sample](https://github.com/devkimchi/Azure-Functions-AWS-Lambda-Sample)

이 리포지토리에 있는 `AzureFunctionsSample.Dnx.Consoleapp`을 실행시켜보도록 하자. 아래의 순서대로 명령어를 입력한다.

https://gist.github.com/justinyoo/e720df8261afa0e17e6dcfb0131d6251

이렇게 하면 아래와 같은 결과를 통해 닷넷 코어 RC1이 제대로 작동하는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/installing-dotnet-core-into-amazon-linux-01.png)

닷넷 코어 RC1 에서는 한가지 재미있는 옵션을 제공한다. 바로 `--native`라는 옵션인데, 이를 주면 해당 OS에서 작동하는 네이티브 바이너리를 만들어준다. 즉, 리눅스에서 따로 닷넷 프레임워크를 설치하지 않아도 이 바이너리만 있으면 바로 실행을 시킬 수 있다. 아래와 같이 명령어를 실행시켜 바이너리를 만들어 보도록 하자.

https://gist.github.com/justinyoo/dc222f44758cc3372c25b756fd1e1e5f

안타깝게도 아마존 리눅스에서는 코어 CLR을 지원하지 않으므로 아래와 같은 메시지만 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/installing-dotnet-core-into-amazon-linux-02.png)

즉, 네이티브 바이너리를 생성할 수 없다. 그렇다면 RC2 에서는 어떻게 변했을까?

## 닷넷 코어 RC2 설치

이번에는 아마존 리눅스에 닷넷 코어 RC2 버전을 설치해 보도록 하자. RC1에 비해 상당히 많은 부분이 개선되었다고 하니 확인해 보도록 하자. RC2 버전을 아마존 리눅스에 설치하는 방법은 이 [공식 문서](https://www.microsoft.com/net/core#centos)를 참조한다.

설치가 끝나고 나면 문서에서 나온 것과 같이 샘플 코드를 하나 생성해서 실행시켜 보도록 한다. 그렇다면 아래왁 같은 결과를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/installing-dotnet-core-into-amazon-linux-03.png)

그렇다면, 이제 RC2 에서는 `--native` 옵션을 이용해서 네이티브 바이너리를 생성할 수 있을까? 확인해 보도록 하자.

https://gist.github.com/justinyoo/c5beabbeb7820cbc6abff7d652310cd0

이 명령어를 실행시켜 보면 `--native` 옵션이 없다.

https://gist.github.com/justinyoo/804e1f182f44ba67cdc01067226fcc94

마찬가지로 이 명령어에도 `--native` 옵션이 없다. [깃헙 이슈](https://github.com/dotnet/cli/issues/2803#issuecomment-216334290)에서 확인을 해보니 이번 RC2 릴리즈에서 이 옵션을 뺐다고 한다. 그래서 다른 채널을 통해 언제쯤 다시 이 옵션이 들어오는가 확인해 봤는데 해당 프로젝트 담당자의 답신은 아래와 같았다. 다행히도 이 코멘트는 NDA가 아니어서 공개한다.

> We plan to bring "native" back. At this point, I’m expecting that will be a post v1.0 project. We realized that we added it too early to the project initially. `--native` 옵션을 다시 추가할 예정입니다. 현 시점에서는 아마도 1.0 정식 버전 릴리즈 이후가 될 것으로 기대합니다. 이 옵션을 프로젝트 초기에 너무 일찍 집어 넣었어요.

또한, 이렇게 덧붙였다.

> The native build remains an important goal for .NET Core. We had to scope back features and experiences to land the the v1.0 release, which is ongoing. We're now starting to look at post v1.0 planning and will include the native build in that planning. We also need to get community feedback for post v1.0, which hasn't yet started. 네이티브 빌드 기능은 닷넷 코어에서 아주 핵심적인 목표들 중 하나입니다. 좀 더 안정적인 1.0 정식 릴리즈를 위해 이 기능을 뺄 수 밖에 없었어요. 현재 1.0 정식 버전 이후를 계획하기 시작했는데요, 여기에 이 네이티브 빌드 기능을 다시 넣었습니다. 또한 1.0 정식 버전 릴리즈 이후 피드백을 받아야 하긴 하는데, 아직 이 부분은 시작하지 않았습니다.

결론적으로 아마존 리눅스에서는:

- 닷넷 코어를 이용해서 C# 코드를 실행시킬 수 있다. RC2 릴리즈에서는 모노를 통하지 않고서 곧바로 빌드 및 실행이 가능하다.
- 닷넷 코어 RC2 버전에서는 아직 네이티브 바이너리를 생성할 수 없다. 이 기능은 1.0 정식 버전 릴리즈 이후 추가될 계획이다.

정도로 정리할 수 있다. 네이티브 바이너리를 생성하지 않고서도 C# 코드는 실행이 가능하기 때문에 실제 애플리케이션을 작성하는데 아무런 문제는 없다. 그러나 네이티브 바이너리가 없다면 **AWS 람다와 같은 서비스에서는 아직 C# 코드를 실행시킬 수 없다**는 결론이 나온다. 정식 버전 출시 후 빠른 시일 안에 네이티브 바이너리 생성 기능이 추가되길 기대해 본다.
