---
title: "Topshelf를 이용한 윈도우 서비스 개발"
date: "2014-04-30"
slug: developing-windows-service-with-topshelf
description: ""
author: Justin-Yoo
tags:
- windows-app-development
- console-app
- topshelf
- windows-service
fullscreen: false
cover: ""
---

## 윈도우 서비스는 디버깅이 힘들다

윈도우 서비스를 개발하다 보면 가장 당황스러울 때가 디버깅이 자유롭지 않다는 점이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/windows-service-debugging-01.png)

디버깅을 하려고 하면 항상 위와 같은 경고창이 나타나기 때문에 보통은 아래와 같은 형태의 꼼수를 써서 디버깅을 하게 된다.

```csharp
static class Program
{
    static void Main()
    {
#if DEBUG
        var service = new SampleService();
        service.Start();
#else
        ServiceBase\[\] ServicesToRun;
        ServicesToRun = new ServiceBase\[\] 
        { 
            new SampleService() 
        };
        ServiceBase.Run(ServicesToRun);
#endif
    }
}
```

위와 같이 `#if DEBUG` ... `#else` ... `#endif` 전처리기 디렉티브를 사용하여 디버깅을 시도하게 된다[1](#fn-169-1). 이 방법이 틀린 것은 아니다. 여전히 실무에서도 이런 방식으로 접근을 많이 한다. 하지만 최선의 방법은 아니다.

## 뭔가 다른 방법이 없을까?

하지만 뭔가 다른 방식으로 접근할 수 있는 방법이 없을까? 하고 수많은 개발자들이 같은 고민을 해왔던 바 아래와 같은 오픈소스 라이브러리들이 만들어졌다.

- [Hybrid Windows Service](http://hws.codeplex.com)
- [Atlas](http://atlas.codeplex.com)
- [Topshelf](http://topshelf-project.com)

이 중 Hybrid Windows Service는 4년 전 최종 릴리즈가 이루어진 후 업데이트가 되지 않고 있다. 아주 간단한 라이브러리여서 더이상 업데이트의 필요성이 없는 듯 싶다. Atlas와 Topshelf는 꾸준히 버전업을 하고 있어서 이 둘 중에 하나를 선택해서 사용하면 된다.

이 라이브러리들의 공통점이라 하면 모두 디버깅이 가틍한 콘솔 애플리케이션을 기반으로 하는 윈도우 서비스라는 점이다. 따라서, 디버거를 붙여서 테스트를 하기가 상당히 간편하다. 게다가 Atlas와 Topshelf는 모두 Fluent API를 기반으로 하기 때문에 코드를 작성하기도 쉽다. 다만 Topshelf가 좀 더 많은 사용자를 기반으로 하는지라 다른 개발자들에 의해 다양한 확장 기능도 많이 제공되고 있다.

이 둘의 가장 중요한 차이점이라 한다면, Atlas는 타이머를 적용시키기가 상당히 까다로운데 비해 Topshelf는 훨씬 더 편리하게 타이머를 적용시킬 수 있어서 윈도우 서비스를 특정 시간대에만 작동하게 할 수 있다. 여기서는 Topshelf를 이용하여 윈도우 서비스를 개발하는 방법에 대해 간단하게 논의해 보도록 한다.

## Topshelf를 이용한 윈도우 서비스 개발

앞서 언급했다시피 Topshelf는 콘솔 애플리케이션을 기반으로 한 윈도우 서비스 라이브러리이므로, 여기서도 콘솔 애플리케이션 프로젝트를 만들어 개발하기로 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/topshelf-windows-service-01.png)

우선 위와 같이 콘솔 애플리케이션 프로젝트를 하나 준비한다. 프로젝트가 만들어졌으면 NuGet 패키지를 다운로드 받는다.

- nuget 패키지 URL: [http://www.nuget.org/packages/Topshelf](http://www.nuget.org/packages/Topshelf)
- GitHub 소스코드 URL: [https://github.com/Topshelf/Topshelf](https://github.com/Topshelf/Topshelf)

이제 기본적인 준비는 끝났고, 아래와 같이 샘플 윈도우 서비스를 만들어 보도록 하자.

```csharp
using Topshelf;

namespace TopshelfWindowsService
{
    public class SampleService : ServiceControl
    {
        public bool Start(HostControl hostControl)
        {
            throw new NotImplementedException();
        }

        public bool Stop(HostControl hostControl)
        {
            throw new NotImplementedException();
        }
    }
}
```

Topshelf가 제공하는 `ServiceControl` 인터페이스를 상속받아 클라스를 생성하게 되면 위와 같이 `Start(hostControl)`, `Stop(hostControl)` 메소드를 구현해야 한다. 일단은 위와 같은 상태로 놓고 콘솔 애플리케이션을 아래와 같이 구현한다.

```csharp
using System;
using System.Reflection;
using Topshelf;

namespace TopshelfWindowsService
{
    class Program
    {
        static void Main(string\[\] args)
        {
            try
            {
                HostFactory.Run(hc => // #1
                                {
                                    hc.Service(sc => // #2
                                                              {
                                                                  sc.ConstructUsing(() => new SampleService()); // #3
                                                                  sc.WhenStarted((s, c) => s.Start(c)); // #4
                                                                  sc.WhenStopped((s, c) => s.Stop(c)); // #5
                                                              });

                                    hc.SetDisplayName("Topshelf Windows Service"); // #6
                                    hc.SetDescription("Windows Service with Topshelf"); // #7
                                    hc.SetServiceName("TopshelfWindowsService"); // #8

                                    hc.RunAs("username", "password"); // #9

                                    hc.StartAutomatically(); // #10
                                }
                    );
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}
```

이렇게 하면 윈도우 서비스는 다 만들어졌다. 참 쉽죠?

조금 더 자세하게 들어가보자.

1. `#1`: 윈도우 서비스 애플리케이션을 시작한다. 내부적으로 람다식을 이용하여 서비스에 필요한 환경을 설정하게 된다.
2. `#2`: 윈도우 서비스 애플리케이션에서 실제로 작동시킬 서비스를 호출한다. 여기서는 앞서 구현했던 `SampleService`를 호출한다.
3. `#3`: `SampleService` 인스턴스를 생성한다.
4. `#4`: `SampleService`의 `Start()` 메소드를 구동시킨다. Topshelf는 윈도우 서비스를 시작할 때 이부분을 인지하여 서비스를 시작하게 된다.
5. `#5`: `SampleService`의 `Stop()` 메소드를 구동시킨다. Topshelf는 윈도우 서비스를 종료할 때 이부분을 인지하여 서비스를 종료하게 된다.
6. `#6`: 윈도우 서비스의 이름을 지정한다.
7. `#7`: 윈도우 서비스에 대한 간략한 설명을 지정한다.
8. `#8`: 윈도우 서비스 패널에 등록될 이름을 지정한다. 공백이 들어가서는 안된다는 점을 주의하도록 하자.
9. `#9`: 윈도우 서비스를 실행시킬 사용자 계정을 지정한다. 개발시에는 위와 같이 하드코딩을 할 수 있지만, 실제로는 아래와 같은 다른 옵션들을 사용하는 것이 낫다.
    
    - `hc.RunAsPrompt()`: 콘솔 앱에서 사용자 계정과 패스워드를 입력받아 실행시킨다.
    - `hc.RunAsNetworkService()`: `NETWORK_SERVICE` 계정으로 실행시킨다.
    - `hc.RunAsLocalSystem()`: 로컬 시스템 계정으로 실행시킨다.
    - `hc.RunAsLocalService()`: 로컬 서비스 계정으로 실행시킨다.
10. `#10`: 윈도우 서비스를 인스톨한 후 자동으로 실행시킨다. 다른 옵션들로는 아래와 같은 것들이 있다.
    
    - `hc.StartAutomaticallyDelayed()`,
    - `hc.StartManually()`,
    - `hc.Disabled()`

## 서비스 리팩토링 – 타이머 지정

위와 같이 윈도우 서비스 개발을 완료했다. 하지만 실제 `SampleService`의 `Start()` 메소드와 `Stop()` 메소드는 현재 구현되어 있지 않기 때문에, 이부분을 구현해 보도록 하자. 여기서는 간단하게 매 10초마다 콘솔에 `Hello World`를 찍어주게끔 해보도록 한다.

```csharp
using System;
using System.Timers;
using Topshelf;

namespace TopshelfWindowsService
{
    public class SampleService : ServiceControl
    {
        private readonly Timer \_timer;

        // #1
        public SampleService()
        {
            this.\_timer = new Timer(10000);
            this.\_timer.Elapsed += Timer\_Elapsed;
        }

        // #2
        public bool Start(HostControl hostControl)
        {
            this.\_timer.AutoReset = true;
            this.\_timer.Enabled = true;
            this.\_timer.Start();

            return true;
        }

        // #3
        public bool Stop(HostControl hostControl)
        {
            this.\_timer.AutoReset = false;
            this.\_timer.Enabled = false;
            this.\_timer.Stop();

            return true;
        }

        // #4
        protected void Timer\_Elapsed(object sender, ElapsedEventArgs e)
        {
            Console.WriteLine("Hello World at {0}", e.SignalTime.ToString("G"));
        }
    }
}
```

1. `#1`: `SampleService` 인스턴스 생성시 타이머를 매 10초마다 실행시키게끔 설정한다.
2. `#2`: 타이머를 실행시킨다.
3. `#3`: 타이머를 정지시킨다.
4. `#4`: 타이머가 일정 시간마다 실행될 때 `Hello World`를 콘솔창에 표시한다.

여기까지 해서 Topshelf를 이용한 윈도우 서비스 개발을 완료했다. 실제로 확인을 해보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/04/topshelf-windows-service-02.png)

`F5`키를 눌러 디버그 모드로 들어가게 되면 위와 같은 콘솔 앱이 실행된다. 현재 돌아가는 서비스의 이름과 Topshelf 라이브러리 버전, 닷넷 프레임워크 버전 등이 표시가 되면서, 이 서비스를 종료하려면 `Ctrl+C`를 타이핑하라고 알려준다. 그 아래에는 우리가 예상했던 바와 같이 매 10초마다 `Hello World`가 표시된다.

## 결론

이상과 같이 Topshelf를 이용하여 윈도우 서비스를 간편하게 개발해 보았다. [http://nuget.org](http://www.nuget.org/packages?q=topshelf)에서 Topshelf를 검색해 보면 엄청나게 많은 확장기능들이 존재하는 것을 확인할 수 있다. 이들 확장기능 라이브러리들과 함께 Topshelf를 이용한다면, 더욱 간편하게 윈도우 서비스를 개발할 수 있을 것이다.

참 쉽죠?

## 참고

- [Topshelf Documentation](http://docs.topshelf-project.com/en/latest/index.html)
- [BUILDING WINDOWS SERVICES WITH C# AND TOPSHELF](http://www.ordina.nl/nl-nl/blogs/2013/maart/building-windows-services-with-c-and-topshelf)
- [Create Windows Services Easily with Topshelf](http://visualstudiomagazine.com/articles/2013/10/01/easily-create-windows-services-with-topshelf.aspx)

* * *

2. [Debugging Windows Services under Visual Studio .NET](http://www.codeproject.com/Articles/10153/Debugging-Windows-Services-under-Visual-Studio-NET) [↩](#fnref-169-1)
