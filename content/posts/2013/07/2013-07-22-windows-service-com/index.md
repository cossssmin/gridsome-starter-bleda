---
title: "Windows Service 중지시 COM 객체 죽이기"
date: "2013-07-22"
slug: windows-service-com
description: ""
author: Justin Yoo
tags:
- Windows App Development
- COM Object
- Windows Services
- Zombie Process
fullscreen: false
cover: ""
---

닷넷으로 Windows Service를 개발하여 시스템에 설치한 후 업데이트라든가 여타의 이유로 Windows Service를 언인스톨, 중지 혹은 재실행해야 하는 경우가 많다. 이 과정이 딱히 어렵거나 하진 않은데 Windows Service가 다른 COM 객체를 호출하는 경우에는 문제가 하나 있다.

COM 객체는 기본적으로 닷넷 프레임웍 바깥에서 만들어진 것들이 대부분이라서 닷넷 프레임웍에서 콘트롤할 수 없다고 생각하면 되는데, 이럴 경우 Windows Service를 중지시키면 보통은 COM 객체 역시도 프로세스가 자동으로 죽고 메모리에서 내려오게 된다. 하지만, 여전히 메모리상에서 좀비프로세스로 남아있는 경우도 많다. 이럴 땐 어쩔 수 없이 수동으로 프로세스를 죽여야 하는데…

이럴 경우 그나마 이들 자식 프로세스를 자동으로 죽이는 방법은 서비스 종료 이벤트시 프로세스를 죽이는 로직을 추가하는 것이다.

```csharp
Marshal.ReleaseComObject(instance);

```

보통은 이 명령어 한줄로 충분한데, 그래도 죽지 않고 살아 있다면 아래와 같은 로직을 추가한다.

```csharp
var processName = "MyProcess";
var processes = Process.GetProcessesByName(processName);
foreach (var process in processes)
{
  process.Kill();
}

```

그럼 확실히 죽일 수 있다.
