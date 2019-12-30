---
title: "NuGet 패키지 작성시 Web.config 포함시키기"
date: "2015-04-24"
slug: including-web-config-for-nuget-packaging
description: ""
author: Justin Yoo
tags:
- .NET
- NuGet
- Transformation
- Web.Config
- XDT
fullscreen: false
cover: ""
---

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/04/web-config-instagram.png)

닷넷 애플리케이션을 개발하다보면 반드시 필요한 것이 바로 [NuGet](https://nuget.org) 패키지 라이브러리들이다. 심지어 닷넷의 코어 라이브러리들도 이 NuGet을 통해서 배포가 될 정도이니 말 다했지. 일반적인 경우에는 `.dll` 라이브러리 파일들만 배포하지만, 특별한 경우에는 다른 파일들도 함께 배포를 해야 하는 경우가 있다. 예를 들어 웹 앱을 개발하는데 필요한 라이브러리인데, `Web.config` 파일 변경이 필요한 경우가 있기 때문이다.

닷넷 애플리케이션의 [XDT 스키마 정의](https://msdn.microsoft.com/en-us/library/dd465326.aspx)는 바로 `Web.config` 파일의 변환을 위해 굉장히 유용하게 쓰인다. 이것은 단지 개발 환경에서 배포 환경으로 변환만 시키는 것이 아니라 NuGet 패키지 배포에서도 유용하게 쓰일 수 있다. 일반적인 상황이라면 보통 아래와 같다.

```xml
<configuration>
  <system.web>
    <compilation debug="true" targetFramework="4.5" />
  </system.web>
</configuration>

```

위 내용은 `Web.config`에서 흔히 볼 수 있는 설정이다. 개발 환경에서는 보통 위와 같이 `debug="true"` 옵션을 설정해 놓지만, 배포 환경에서는 반드시 보안을 위해서라도 저 옵션을 지워야 한다. 그럴 때 배포 환경을 위해서는 `Web.Release.config` 파일을 아래와 같이 작성한다.

```xml
<configuration>
  <system.web>
    <compilation xdt:Transform="RemoveAttributes(debug)" />
  </system.web>
</configuration>

```

이렇게 하면 배포시 자동으로 `debug="true"` 부분이 사라지게 된다. 그렇다면, 이 것을 NuGet 패키지 배포시에도 적용시킬 수 있지 않을까? 두가지 방법이 있다.

## `.transform` 파일 이용하기

이것은 NuGet 버전 2.6 이전에서 쓰였던 방법이고, 지금도 쓰이는 방법이다. 먼저 `Web.config.transform` 파일을 아래와 같이 작성한다.

```xml
<configuration>
  <system.webServer>
    <modules>
      <add name="NewModule" type="Aliencube.NewModule" />
    </modules>
  <system.webServer>
</configuration>

```

원래 `Web.config` 파일은 아래와 같다고 가정한다면:

```xml
<configuration>
  <system.webServer>
    <modules>
      <add name="OldModule" type="Aliencube.OldModule" />
    </modules>
  <system.webServer>
</configuration>

```

NuGet 패키지 배포후 다운로드 받아 현재 프로젝트에 적용시키면 아래와 같이 변환된다.

```xml
<configuration>
  <system.webServer>
    <modules>
      <add name="OldModule" type="Aliencube.OldModule" />
      <add name="NewModule" type="Aliencube.NewModule" />
    </modules>
  <system.webServer>
</configuration>

```

해당 패키지를 언인스톨하면 새롭게 추가된 부분은 사라진다. 하지만 아래와 같은 경우라면?

```xml
<!-- Web.config.transform -->
<configuration>
  <system.webServer>
    <modules>
      <add name="NewModule" type="Aliencube.NewModule" customAttr="something" />
    </modules>
  <system.webServer>
</configuration>

```

```xml
<!-- Web.config -->
<configuration>
  <system.webServer>
    <modules>
      <add name="NewModule" type="Aliencube.NewModule" />
    </modules>
  <system.webServer>
</configuration>

```

이런 경우에는 패키지를 설치할 경우 아래와 같이 바뀐다. 새로운 속성만 추가되는 셈이다.

```xml
<!-- Web.config -->
<configuration>
  <system.webServer>
    <modules>
      <add name="NewModule" type="Aliencube.NewModule" customAttr="something" />
    </modules>
  <system.webServer>
</configuration>

```

그런데, 여기서 문제가 생기는 것이, 만약 이 NuGet 패키지를 삭제하게 되면

```xml
      <add name="NewModule" type="Aliencube.NewModule" customAttr="something" />

```

이 엘리먼트가 통째로 날아가게 된다. 원하지 않는 결과가 나타는 셈이다. 이를 극복하기 위해 NuGet 2.6 버전 이후로는 다음과 같은 방식을 도입했다.

참고: [https://docs.nuget.org/create/Transforming-Configuration-Files-Using-dotTransform-Files](https://docs.nuget.org/create/Transforming-Configuration-Files-Using-dotTransform-Files)

## `.install.xdt`와 `.uninstall.xdt` 파일 이용하기

이는 앞서 언급했던 XDT 변환 방법을 이용하는 것이다. 먼저 기존의 `Web.config` 파일 구성이 아래와 같다고 가정하자.

```xml
<configuration>
  <appSettings>
    <add key="webpages:Version" value="3.0.0.0" />
    <add key="webpages:Enabled" value="false" />
    <add key="ClientValidationEnabled" value="true" />
    <add key="UnobtrusiveJavaScriptEnabled" value="true" />
  </appSettings>
</configuration>

```

새 NuGet 패키지는 위의 `appSettings` 섹션에 `Web.config.install.xdt` 파일을 이용하여 추가 엘리먼트를 아래와 같이 끼워 넣는다고 한다.

```xml
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <appSettings>
    <add key="Key1" value="Value1" xdt:Transform="Insert" />
    <add key="Key2" value="Value2" xdt:Transform="Insert" />
  </appSettings>
</configuration>

```

반대로 `Web.config.uninstall.xdt` 파일을 이용하면 NuGet 패키지 삭제시 간단하게 관련 내용을 삭제할 수 있다.

```xml
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <appSettings>
    <add key="Key1" xdt:Transform="Remove" xdt:Locator="Match(key)" />
    <add key="Key2" xdt:Transform="Remove" xdt:Locator="Match(key)" />
  </appSettings>
</configuration>

```

참고: [https://docs.nuget.org/create/configuration-file-and-source-code-transformations](https://docs.nuget.org/create/configuration-file-and-source-code-transformations)

## 응용: `configSections` 추가하기

`Web.config` 파일에서 `configSectioins` 엘리먼트는 `configuration` 루트 엘리먼트의 가장 첫번째 자식 엘리먼트이다. 무조건 첫번째 엘리먼트여야 하므로 약간의 트릭이 필요하다. 아래 `Web.config.install.xdt` 파일을 보도록 한다.

```xml
<configSections xdt:Transform="InsertBefore(/configuration/*[1])" />

```

비어있는 `configSections` 엘리먼트를 가장 먼저 위치하게끔 추가한다. `/configuration/*[1]`는 루트 엘리먼트인 `configuration`의 자식 엘리먼트들 중 첫번째 엘리먼트를 가리키는 XPATH이다. 즉, 이 첫번째 엘리먼트 앞에 `configSections` 엘리먼트를 하나 추가하라는 것이다. 이미 `configSections` 엘리먼트가 있다면 그 앞에 하나 더 생길 것이고, 없다면 새롭게 하나가 만들어질 것이다.

```xml
<configSections xdt:Locator="XPath(/configuration/configSections[last()])">
    <section name="mySection" xdt:Locator="Match(name)" xdt:Transform="InsertIfMissing" />
</configSections>

```

이것은 `/configuration/configSections[last()]`, 즉 여러 개의 `configSections` 엘리먼트들 중 가장 나중의 것을 선택하게 한다. 이미 기존의 `configSections` 엘리먼트가 있었다면, 그것이 선택될 것이고, 없었다면 새롭게 추가된 `configSections` 엘리먼트를 선택할 것이다. 그렇게 선택된 `configSections` 엘리먼트에 `mySection` 이라는 이름을 가진 `section` 엘리먼트를 추가한다. `InsertIfMissing` 조건에 따라, 만약 이미 존재한다면 무시한다.

```xml
<configSections xdt:Transform="RemoveAll" xdt:Locator="Condition(count(*)=0)" />

```

마지막으로 자식 엘리먼트가 없는 `configSections`를 모두 제거한다. 이것은 맨 처음에 생성한 빈 엘리먼트를 제거하는 역할을 한다.

참고: [http://stackoverflow.com/questions/18737022/xdt-transform-insertbefore-locator-condition-is-ignored](http://stackoverflow.com/questions/18737022/xdt-transform-insertbefore-locator-condition-is-ignored)

이상으로 NuGet 패키지 배포시 `Web.config` 파일을 자동으로 수정할 수 있는 방법에 대해 간략하게 알아보았다. 참 쉽죠?
