---
title: "Amazon 리눅스에 Mono 설치하기"
date: "2016-05-21"
slug: installing-mono-into-amazon-linux
description: ""
author: Justin-Yoo
tags:
- dotnet
- Amazon Linux
- C#
- Mono
fullscreen: false
cover: ""
---

C# 코드를 리눅스 운영체제에서 실행시키기 위한 방법은 여러 가지가 있다. 그중에서 [Mono](http://www.mono-project.com)(이하 `모노`)는 [.NET Core](https://www.microsoft.com/net/core)를 제외하고는 거의 유일한 방법이라고 할 수 있다. 모노는 리눅스는 배포판별로 다른 설치 방법을 제공하는데, 이 포스트에서는 Amazon Linux(이하 `아마존 리눅스`)에 이 모노를 설치하는 방법에 대해 메모 차원에서 정리해 보고자 한다.

> 참고: 이 포스트에서는 아마존 리눅스 2016.03.1 버전을 사용한다. ![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/installing-mono-into-amazon-linux-01.png)

아마존 리눅스는 RHEL/CentOS 계열이므로 모노를 설치하기 위해서는 우선 이 [공식 문서](http://www.mono-project.com/docs/getting-started/install/linux/#centos-7-fedora-19-and-later-and-derivatives)를 따라하면 좋다. 하지만, 이대로 따라하면 아래와 같이 특정 의존성 패키지를 설치할 수 없다는 에러메시지를 보게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/installing-mono-into-amazon-linux-02.png)

따라서, 이를 미리 해결해 줘야 하는데, 이는 아래와 같이 해결할 수 있다.

https://gist.github.com/justinyoo/fea4924afbe9b0bf06808a1861a8abb4

맨 처음 `sudo su` 명령어는 아예 루트 권한으로 세션을 열라는 의미여서 나중에 설치가 끝나면 다시 일반유저 권한으로 나와야 한다. 이렇게 하지 않으면 매 명령어마다 `sudo`를 붙여줘야 해서 안전하지만 귀찮다.

다운로드 받은 RPM 패키지를 실행시켜 설치한다. 그런 후에 다시 [공식 문서](http://www.mono-project.com/docs/getting-started/install/linux/#centos-7-fedora-19-and-later-and-derivatives)를 따라하면서 모노를 실행시키도록 하자.

https://gist.github.com/justinyoo/6c25161d882ea234a6234d69d93c8877

이후 필요하다면 아래 명령어를 추가로 실행시켜 캐시를 새로 생성하는 것도 좋다.

https://gist.github.com/justinyoo/aea2ec3152fef557359372ae088a69c6

여기까지 왔다면 모노를 설치할 준비가 모두 끝났다. 이제 아래 명령어를 실행시켜 모노를 설치한다.

https://gist.github.com/justinyoo/8d37336332a177b156598fd13b4be216

이제 모노 설치가 모두 끝났다. 임시로 다운로드 받아 설치했던 패키지들은 더이상 필요없으니 지우도록 한다.

https://gist.github.com/justinyoo/ba241f69845a2b6fb14e7004a5b7fb61

마지막으로 루트 권한에서 빠져나오도록 하자.

https://gist.github.com/justinyoo/5ca61677101e90c468c293b5c86eb0a8

모노가 제대로 설치가 됐는지 확인하기 위한 차원에서 샘플 코드를 하나 생성해서 실행시켜 보도록 하자. 자세한 내용은 이 [공식 문서](http://www.mono-project.com/docs/getting-started/mono-basics)를 참고한다. 설치가 성공적으로 끝났고, 제대로 모노를 실행시킬 수 있다면 아래와 같은 결과를 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/installing-mono-into-amazon-linux-03.png)

이렇게 아마존 리눅스에 모노를 설치했다. [다음 포스트](http://blog.aliencube.org/ko/2016/05/22/installing-dotnet-core-into-amazon-linux)에서는 람다에서 C# 코드를 실행시키기 위해 .NET Core 1.0 RC1, RC2 버전을 설치해 보도록 한다.
