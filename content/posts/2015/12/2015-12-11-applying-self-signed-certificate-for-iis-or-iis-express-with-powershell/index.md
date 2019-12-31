---
title: "파워쉘을 이용하여 IIS 또는 IIS Express에 자가서명 루트 인증서 적용하기"
date: "2015-12-11"
slug: applying-self-signed-certificate-for-iis-or-iis-express-with-powershell
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- IIS
- IIS Express
- PowerShell
- Self-signed Certificate
fullscreen: false
cover: ""
---

[Azure](https://azure.microsoft.com)의 다양한 리소스들을 웹 애플리케이션이나 네이티브 애플리케이션에서 사용하기 위해서는 해당 애플리케이션들을 [Azure Active Directory (AAD)](https://azure.microsoft.com/en-us/services/active-directory)에 우선 등록시켜야 한다. 이렇게 등록한 애플리케이션은 아주어의 리소스들을 AAD에서 설정한 권한대로 사용이 가능하다. 이 때 애플리케이션과 아주어 리소스들간의 커뮤니케이션은 REST API를 이용하게 되는데, 항상 SSL을 이용한 HTTPS 프로토콜을 이용한다. 즉, 애플리케이션은 SSL 인증서를 앱에 반드시 포함시켜야 통신이 가능하다.

Web 애플리케이션이나 Web API 애플리케이션의 경우에는 두가지 방법이 가능하다. 하나는 웹사이트 자체를 인증시키는 방법이고 또 하나는 AAD에 등록시킨 애플리케이션에 인증서를 포함시키는 방법이다. 이 포스트에서는 애플리케이션 자체를 인증시키는 방법에 대해 논의해 보고자 한다.

우선 Azure Website를 이용해서 웹 애플리케이션을 서비스 하는 경우에는 인증서를 구매하여 웹사이트 자체에 구매한 인증서를 적용시키면 되기 때문에 큰 문제가 없다. 하지만, 해당 애플리케이션을 개발자의 로컬 환경에서 테스트를 해야 하는 경우라면 IIS 또는 IIS Express에 자가서명(self-signed) 인증서를 적용시켜야 한다. 이럴 경우 아래와 같이 몇가지 파워쉘 명령어를 통하면 손쉽게 적용시킬 수 있다.

## 자가서명 인증서 검색

우선 아래와 같이 파워쉘 명령어를 입력하여 자가서명 인증서를 검색해 보도록 하자.

https://gist.github.com/justinyoo/c39dc9a6a87f372e3022

그러면 아래와 같이 현재 개인 저장소 아래에 등록되어 있는 자가서명 인증서를 찾을 수 있을 것이다.

https://gist.github.com/justinyoo/5ea706f02918e12f362c

> 참고: 위에서 보이는 Thumbprint 값은 사용자마다 모두 다르다.

## 자가서명 인증서 생성

만약 `CN=localhost`라는 이름의 인증서가 없다면 아래와 같이 `makecert.exe` 툴을 이용해서 만들 수 있다.

https://gist.github.com/justinyoo/5a5d0313f22f737b0762

- `-r`: 자가서명 인증서를 만들라는 옵션이다.
- `-pe`: 개인키를 익스포트 가능하게 하라는 옵션이다.
- `-n`: 인증서 이름을 지정하는 옵션이다. 예) `-n "CN=localhost"`
- `-b`: 인증서 시작 유효일자를 `mm/dd/yyyy` 형식으로 지정한다. 기본값은 오늘이다.
- `-e`: 인증서 종료 유효일자를 `mm/dd/yyyy` 형식으로 지정한다. 기본값은 2039년 오늘이다.
- `-ss`: 인증서 저장소의 이름을 지정한다. 예) `-ss My`
- `-len`: 인증서의 길이를 지정한다. 자가서명 인증서의 경우 항상 `2048`이다.

이렇게 개인 저장소에서 자가서명 인증서를 찾았다면 (혹은 만들었다면) 이 인증서를 **신뢰할 수 있는 루트 인증서**로 만들어야 한다. 위에 보는 바와 같이 자가서명 인증서의 Thumbprint 값을 이용해서 아래와 같은 파워쉘 명령어를 순차적으로 적용하면 된다.

## 자가서명 인증서 저장

https://gist.github.com/justinyoo/b436c6d35f218ffb4570

여기까지 한 후 다시 아래와 같은 파워쉘 명령어를 통해 루트 저장소를 살펴보면 `CN=localhost`의 이름을 가진 자가서명 인증서를 확인할 수 있다.

https://gist.github.com/justinyoo/605c13bb34b4053f10be

이 명령어를 실행시킨 결과는 아래와 비슷할 것이다.

https://gist.github.com/justinyoo/4bbec011b7a70983d770

여기까지. 이렇게 하면 자가서명 인증서를 개발자 로컬 피씨의 루트 인증서로 저장시킬 수 있다.

이렇게 해서 IIS 또는 IIS Express에 자가서명 루트 인증서를 적용하는 방법에 대해 간략하게 알아보았다. 다음 포스트에서는 AAD에 앱을 등록하고 거기에 자가서명 인증서를 적용시키는 방법에 대해 알아보도록 하자.
