---
title: "이벤트로그 작성시 나타나는 System.Security.SecurityException"
date: "2014-02-27"
slug: system-security-securityexception-on-writing-an-event-log
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- EventLog
- IIS
- Logging
- SecurityException
- Web Application
fullscreen: false
cover: ""
---

닷넷 웹 어플리케이션을 작성하다보면 여러 가지 방법으로 로그를 작성하게 된다. 직접 로그 핸들러를 만든다거나 [log4net](http://logging.apache.org/log4net/) 또는 [ELMAH](https://code.google.com/p/elmah/) 등의 라이브러리를 사용한다거나 해서 핸들링하게 될텐데, 이 때 종종 이벤트 로그를 활용할 일이 있다. 그런데 윈도우 시스템별로 관리자의 권한 설정에 따라 아래와 같은 에러 메시지가 나타날 수 있다.

> Security Exception Description: The application attempted to perform an operation not allowed by the security policy. To grant this application the required permission please contact your system administrator or change the application’s trust level in the configuration file. Exception Details: System.Security.SecurityException: The source was not found, but some or all event logs could not be searched. Inaccessible logs: Security

에러 메시지에 나와 있다시피 이벤트 로그에 접근할 수 있는 권한이 없다는 뜻인데, 이것은 레지스트리의 특정 항목에 적절한 권한을 추가함으로써 해결할 수 있다. 우선 레지스트리 에디터를 열어 아래 두 가지 항목에 권한을 확인해 보자.

- `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\eventlog`
- `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\eventlog\Security`

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/02/registry-eventlog-01.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/02/registry-eventlog-02.png)

`eventlog` 항목의 권한이 아래 항목인 `Security` 항목에 상속되지 않으므로 둘 다 반드시 체크해야 한다. 해당 항목에서 마우스 오른쪽 버튼을 눌러 `권한...` 혹은 `Permissions...` 항목을 선택한다. 아래 이미지는 Windows 7 기준이므로 Windows 2003, Windows 2008, Windows 2012 에서는 살짝 다를 수 있으나, 기본적인 사항은 동일하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/02/registry-eventlog-03.png)

위의 그림과 같이 IIS를 사용하는 계정을 추가하여 `읽기` 또는 `Read` 권한을 추가해 주면 된다. IIS 6 혹은 IIS 7+ 에서 Classic 모드를 사용하는 경우에는 위와 같이 `NETWORK SERVICE` 계정에, IIS 7+ 에서 Integrated 모드를 사용하는 경우에는 `IIS APPPOOL\[AppPoolName]` 과 같은 형태로 사용하고자 하는 Application Pool Identity 를 추가하면 된다.

추가하고 나서 IIS를 한 번 리셋해 주면 이제 위의 에러가 발생하지 않는다. 만약 IIS 리셋 후에도 계속 동일한 에러가 발생한다면, `everyone` 계정에 모든 권한을 주고 다시 한 번 IIS를 리셋해 보자. 이렇게 하면 에러가 발생하지 않을 것이다. 하지만 이 경우에는 `everyone`에게 모든 권한을 줬기 때문에 보안상 안전하지 않으므로 주의해서 사용해야 한다. 먄약 이렇게 까지 했는데도 계속 에러가 발생한다면 컴퓨터를 껐다 켜보자. 그럼 이제는 완전히 된다. 만약 `everyone` 계정에 모든 권한을 주고 컴퓨터를 재부팅해서 에러가 사라졌다면, 다시 `everyone` 대신 `NETWORK SERVICE` 혹은 `IIS APPPOOL\[AppPoolName]` 계정으로 바꾼후 다시 재부팅해 보면서 권한을 조정해 보도록 하자.

참조:

- [System.Security.SecurityException when writing to Event Log](http://stackoverflow.com/questions/1274018/system-security-securityexception-when-writing-to-event-log)
- [How do I create an Event Log source under Vista?](http://social.msdn.microsoft.com/Forums/windowsdesktop/en-US/00a043ae-9ea1-4a55-8b7c-d088a4b08f09/how-do-i-create-an-event-log-source-under-vista?forum=windowsgeneraldevelopmentissues)
