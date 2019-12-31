---
title: "핸드폰 웹 브라우저로 로컬 개발 환경에서 돌아가는 ASP.NET Core 애플리케이션 접속하기"
date: "2017-02-25"
slug: remote-access-to-aspnet-core-apps-from-mobile-devices
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- asp-net-core
- air-server
- conveyor
- windows-firewall
fullscreen: false
cover: ""
---

비주얼스튜디오(VS)로 ASP.NET 혹은 ASP.NET Core 애플리케이션을 개발할 때 뗄래야 뗄 수 없는 것이 바로 [IIS Express](https://www.iis.net/learn/extensions/introduction-to-iis-express)이다. F5 키를 눌러 디버깅을 할 때 특별한 경우가 아니고는 항상 IIS Express를 사용하게 되는데 이것은 IIS의 간편 버전이라고 할 수 있다. 거의 기능은 같지만 로컬 디버깅 환경에서 사용할 수 있게끔 도와주는 가벼운 웹서버 쯤으로 생각하면 될 것이다. 따라서, 내 로컬 개발 환경에서는 손쉽게 접근이 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-01.png)

만약 모바일 웹 애플리케이션을 개발하는 경우에는 실제 모바일 장치에서 웹 브라우저를 통해 접근해 볼 필요가 있다. 이럴 경우 단지 `localhost` 부분을 내부 네트워크의 IP 주소로 단순히 치환한다고 해서 접근할 수가 없다. 추가적으로 내 개발 환경을 맞춰줄 필요가 있다. 이 포스트에서는 두 가지 서로 다른 방법을 이용해서 내 모바일 장치에서 직접 내 로컬 개발 환경에서 돌아가는 웹 애플리케이션에 접근해 보도록 한다.

> 오는 [2017년 3월 7일](https://launch.visualstudio.com/)에 전세계적으로 VS 2017 버전을 동시에 출시하지만 이 글을 쓰는 시점에서는 아직 출시되지 않았으므로 기존의 VS 2015 버전으로 진행하도록 한다.

## 내 컴퓨터 네트워크 설정 및 윈도우 방화벽 확인

여기서는 Windows 10 버전을 기준으로 설명한다. 내 컴퓨터의 최신 업데이트 상태에 따라 화면이 살짝 다르게 보일 수도 있으니, 그점은 감안하고 보도록 하자. 현재 내가 연결된 네트워크 (유선 또는 무선)를 선택해서 속성을 클릭한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-04.png)

아래와 같은 화면이 보인다면 반드시 내 PC가 네트워크 안에서 검색이 가능한지 아닌지에 대한 옵션을 반드시 켜 놓아야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-05.png)

이 옵션을 활성화 시켰다면 윈도우 방화벽 모드에서 사설 네트워크로 설정된 것이다. 제어판을 통해 확인해 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-06.png)

> **주의사항!!**: 만약 홈 네트워크 혹은 회사 네트워크가 아닌 까페와 같은 공개 네트워크에서는 반드시 이 옵션을 꺼 두도록 하자. 안그러면 같은 네트워크의 다른 사람들이 내 컴퓨터를 악의적으로 접근할 수 있으니 항상 조심해야 한다.

## 1\. IIS Express 환경 설정 직접 수정

우선 VS를 설치했다면, 이 IIS Express는 당연히 함께 설치되기 때문에 이 환경 설정 부분이 어디에 있는지만 확인해 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-02.png)

VS로 솔루션을 생성했다면 솔루션 루트 디렉토리에 `.vs`라는 폴더가 하나 보인다. 이 안으로 들어가면 `config`라는 폴더가 있고 그 안의 `applicationhost.config` 라는 파일이 바로 우리가 찾는 것이다. 이 파일을 열어보자.

https://gist.github.com/justinyoo/df45586919969b64adc43c7d8b46eb1a

이렇게 현재 내 웹 애플리케이션에 관련된 내용을 찾을 수 있다. 여기서 `7314:localhost` 값의 `localhost` 부분을 내 로컬 네트워크의 IP 주소로 바꾼 바인딩을 아래와 같이 하나 추가하면 된다.

https://gist.github.com/justinyoo/b25a717052484395b5e1773d42e501b9

내 컴퓨터의 로컬 IP 주소는 아래와 같이 `ipconfig` 커맨드 프롬프트 명령어를 이용해 쉽게 알아낼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-03.png)

이제 윈도우 방화벽에 해당 포트 번호를 등록하고 외부에서 접근 가능하게 만들어 주어야 한다. 윈도우 방화벽을 열어 고급 설정 모드로 이동한다.

## 윈도우 방화벽 수정

윈도우 방화벽 고급 설정 창을 열어 인바운드 규칙을 하나 새로 생성한다. 내용은 아래와 같다.

- Rule Type: Port
- Protocol: TCP
- Port Number: 7314
- Action: 커넥션 허용
- Profile: Private (회사 네트워크일 경우 Domain도 선택할 수 있다)
- Name: 적당한 이름을 주도록 하자. 예) IIS Express Port Opener

이제 설정은 모두 끝났으니 실제 모바일 웹 브라우저에서 IP 주소를 통해 접근해 보도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-07.png)

위 화면은 아이폰의 크롬 브라우저로 접속한 모습이다. 문제없이 접속 가능한 것을 확인할 수 있다.

사실 이 정도면 충분한데, 이 방법의 문제점이 하나 있다. 가장 치명적인(?) 문제점이기도 한데, 웹 애플리케이션을 하나 새로 만들 때마다 IIS Express는 무작위로 포트 번호를 할당한다. 어떤 포트 번호가 될지는 아무도 모른다. 며느리도 몰라 따라서, 웹 애플리케이션을 하나 생성할 때 마다 윈도우 방화벽에 매번 포트 번호를 설정해 줘야 한다. 너무 불편하다. 어떻게 편한 방법이 없을까?

흐흐흐...

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/cat-smiling.jpg)

## 2\. Conveyor 익스텐션 이용

VS 익스텐션 중에 [Conveyor](https://marketplace.visualstudio.com/items?itemName=vs-publisher-1448185.ConveyorbyKeyoti) 라는 것이 있다. 이 익스텐션을 설치하면 참 많은 부분을 쉽게 해결할 수 있다. 참고로 이 글을 쓰는 시점에서 Conveyor의 버전은 `1.3.2`이다. 이 익스텐션을 설치한 후 다시 F5키를 눌러 웹 애플리케이션을 실행시켜 보도록 하자. 그러면 아래와 같은 별도의 창을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-08.png)

위의 창에서 Remote URL 부분이 굉장히 중요한데, 만약 집의 네트워크 공유기를 사용하는 경우라면 보통 `192.168.xxx.xxx` 같은 형태의 IP 주소일 것이고, 회사 네트워크라면 또 다른 형태의 IP 주소가 될텐데, 가끔 전혀 상관없는 IP 주소가 보이는 경우도 있다. 이럴 땐 침착하게 자기 컴퓨터의 IP 주소를 기억해 내자. 이 글에서는 `192.168.1.3` 이라는 IP 주소를 사용하고 있다. Conveyor는 45455부터 시작하는 다른 포트 번호를 사용한다. 즉, IIS Express에서 할당 받은 포트 번호 대신 자체 포트 번호를 사용한다.

바로 이 지점이 사실 Conveyor 익스텐션을 쓰는 가장 근본적인 이유가 된다. 굳이 IIS Express 의 설정파일을 건드릴 필요도 없을 뿐더러 윈도우 방화벽에 임의의 포트 번호를 그때그때 생성하는 대신 Conveyor가 택하는 45455 이후 포트 번호만 방화벽에 충분한 범위로 등록해 놓으면 더이상 포트 번호를 등록하는 문제로 고민할 필요가 없어진다.

앞서 윈도우 방화벽에 등록한 포트 번호를 7314 대신 45455-45500 정도로 넓게 잡아 놓으면 내 로컬 개발 환경에서 동시에 많은 웹 앱을 디버깅하기 시작해도 더이상 방화벽 설정을 건드릴 필요가 없다. 실제로 45455 포트 번호를 이용해 다시 웹 앱에 접속해 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-09.png)

접근이 가능한 것을 확인할 수 있다. 만약 HTTPS 커넥션이 필요한 경우라 해도 크게 문제는 되지 않는다. 최초 실행시 자가서명 인증서를 사용할 것인지 물어보고 내 컴퓨터에 자가서명 인증서를 설치한 후 진행하면 된다. 만약 이 경우에는 아래와 같은 일련의 화면이 나타난 후 본 화면이 나오는데, 이것은 자가서명 인증서라서 브라우저 차원에서 경고를 한 번 해 주는 것에 불과한지라 크게 걱정하지 않아도 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-10.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-11.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/02/remote-access-to-aspnet-core-apps-from-mobile-devices-12.png)

지금까지 두 가지 서로 다른 방법으로 내 로컬 개발 환경에서 돌아가는 웹 애플리케이션을 같은 네트워크 안의 다른 모바일 장치에서 접근하는 방법에 대해 알아 보았다. 개인적으로는 후자의 Conveyor 익스텐션을 이용하면 여러모로 편리한 측면이 많아 추천하는 바이다.
