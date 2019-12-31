---
title: "테스트 가능한 Dynamics CRM 2015 엔티티 필터링"
date: "2015-12-01"
slug: filtering-entities-in-dynamics-crm-2015-with-testability
description: ""
author: Justin-Yoo
tags:
- dotnet
- crmsvcutil-exe
- dynamics-crm-2015
- dynamics-crm-2015-online
- entity-filtering
- testability
fullscreen: false
cover: ""
---

SI 프로젝트를 진행하다 보면 단순히 새 애플리케이션만 개발하는 데 그치는 것이 아니라 기존 애플리케이션과 통합해야 하는 시나리오가 대부분이다. 이번 포스트에서 다룰 주제는 그러한 시스템 통합 시나리오들 중 [MS Dynamics CRM](http://www.microsoft.com/crm) 솔루션과 웹 애플리케이션을 통합하는 것과 관련이 있다. [Dynamics](http://microsoft.com/dynamics)는 MS에서 개발하여 제공하는 ERP 및 CRM 솔루션으로 다양한 윈도우 제품군들과 또는 타 시스템과 연동이 잘 되기 때문에 고가의 타 ERP 솔루션을 감당하기 힘들 경우 많이 선택하는 제품군들 중 하나이다. 이제는 Azure를 등에 업고 클라우드 기반으로 거듭나고 있다. 특히 [Office 365](http://office365.com)와는 [Azure AD](https://azure.microsoft.com/en-us/services/active-directory)를 함께 사용할 경우 환상의 궁합을 자랑한다.

Dynamics CRM은 시스템 통합을 위해 웹서비스 엔드포인트를 제공하고 있다. Dynamics CRM 2011 버전부터 엔드포인트의 주소는 동일한데, 설치형 서비스일 경우와 클라우드 기반의 서비스일 경우 도메인만 바뀔 분 WSDL 파일의 주소는 동일하다.

https://gist.github.com/justinyoo/96e5b5dd3a25343044a7

재미있는 것은 예전에는 프록시를 직접 만들기 위해 위의 주소를 직접 서비스 레퍼런스로 가져오는 경우가 많았다. 하지만, 이렇게 하면 대부분의 엔티티들을 Key-Value pair 로 가져오기 때문에, 세세한 설정은 편하지만, 그 이외에는 굉장히 불편했다. 그래서 `OrganizationServiceContext`를 추출하여 `IQueryable` 인터페이스를 구현하는 LINQ 문법을 이용할 수 있게 됐다. 이를 위해서는 [CRM SDK](https://msdn.microsoft.com/en-us/library/hh547453.aspx)를 다운로드 받아 사용하면 되는데, 그 중 `CrmSvcUtil.exe`라는 것을 이용해 보도록 하자.

https://gist.github.com/justinyoo/4229dbb8b385e744db5c

커맨드 프롬프트 창에서 위와 같이 직접 입력하거나 위의 내용으로 `build.bat` 파일을 만들어서 실행시키거나 하면 위의 `/out` 파라미터를 통해 지정한 이름으로 파일이 하나 만들어진다. 그런데 여기 문제가 있다.

- 생성되는 파일은 하나인데, CRM 안에 정의한 엔티티는 여러개이다.
- 하나의 엔티티당 필드는 적게는 수십 개 많게는 수백 개 까지도 될 수 있다.

위와 같은 상황 때문에 신규 CRM 인스턴스에서 생성한다고 하더라도 만들어진 파일의 크기는 6.5MB 정도이다. 여기에 비즈니스 요구사항에 따라 엔티티를 추가로 생성한다거나, 기존의 엔티티에 커스텀 필드를 추가한다거나 하면 파일의 크기는 비약적으로 커지게 된다. 다행스럽게도 자주 사용하는 몇 가지 엔티티만 걸러낼 수 있는 인터페이스가 있다. 여기서는 해당 인터페이스를 사용하는 필터링 예제 코드를 소개하고자 한다. 코드는 아래에서 확인할 수 있다.

- [https://github.com/devkimchi/Dynamics-CRM-2015-Filtering-Sample](https://github.com/devkimchi/Dynamics-CRM-2015-Filtering-Sample)

## 필터링 적용하기

CRM SDK를 다운로드 받았다면 그 안에 참고할 만한 샘플 코드가 여러개 있는데, 그 중 `SDK/SampleCode/CS/CrmSvcUtilExtensions/BasicFilteringService/BasicFilteringService.cs` 파일을 바탕으로 작성한 아래 코드를 보자.

https://gist.github.com/justinyoo/8b4f82dc7bafca780c15

- `GenerateEntity()` 메소드를 눈여겨 보자. CRM 엔티티 메타데이터를 파라미터로 받아서 엔티티 이름을 체크한 후 유효하다면 생성하고 그렇지 않다면 생성하지 않는다.
- 유효성 체크를 위해 `IFilterItemCollection` 인터페이스를 구현한 인스턴스를 생성한다.

사실, 이게 필터링 서비스가 하는 전부이다. 핵심은 바로 이 `IFilterItemCollection` 인터페이스인데, 걸러내고 싶은 엔티티를 설정파일에 정의하면 그것을 바탕으로 필요한 엔티티만 생성해주게끔 한다. 이제 좀 더 자세히 들어가 보도록 하자.

### `FiterItemCollection`

우선 `IFilterItemCollection` 인터페이스는 아래와 같이 하나의 메소드를 정의한다.

https://gist.github.com/justinyoo/1379daed7fa0d5213067

그리고 그 메소드는 아래와 같이 `FilterItemCollection` 클라스에서 구현된다.

https://gist.github.com/justinyoo/13a0f7179bb2350fe835

이 `FilterItemCollection`이 추상 클라스라는 것을 눈여겨 보도록 하자. 이것은 설정 파일의 형식이 뭐든 될 수 있기 때문에 다양한 파일 포맷에 대응하기 위한 사전 포석 쯤으로 보면 될 것이다. `protected` 스코프를 가진 `Filter` 속성과 `OnInitialising()` 추상 메소드를 가지고 다음으로 넘어가 보자.

### `XmlFilterItemCollection`

설정 파일이 XML 포맷이라고 가정한다면 파일 이름은 `filter.xml` 정도가 될 것이고, 대략의 구조는 아래와 같을 것이다.

https://gist.github.com/justinyoo/cbb3d12a9bab9583899f

따라서, 이 파일을 읽어들여서 deserialisation 한 후 `Filter` 속성에 저장하기만 하면 된다.

https://gist.github.com/justinyoo/462b1cf564c8421c34e2

### `JsonFilterItemCollection`

설정 파일을 JSON 포맷으로 하고 싶다면 파일 이름을 `filter.json` 정도로 하고 `JsonFilterItemCollection` 클라스를 구현하도록 한다.

https://gist.github.com/justinyoo/dd1eb19e012221078b1b

https://gist.github.com/justinyoo/f6a451c44b34bcb62f28

### `YamlFilterItemCollection`

YAML로 설정 파일을 작성하고 싶다면 파일 이름을 `filter.yml` 정도로 하고 `YamlFilterItemCollection` 클라스를 구현한다. [`YamlDotNet`](https://github.com/aaubry/YamlDotNet) 이라는 라이브러리를 활용하면 YAML 파일을 손쉽게 파싱할 수 있다.

https://gist.github.com/justinyoo/aa10f921fca99495f13c

https://gist.github.com/justinyoo/9742709b60774a642a2d

이제 `FilterItemCollection` 클라스에 파일 포맷을 체크한 후 필요에 따라 `XmlFilterItemCollection`, `JsonFilterItemCollection` 또는 `YamlFilterItemCollection`을 생성하기만 하면 된다.

이렇게 해서 필터링 관련 구현은 다 끝났다. 이제 이를 적용시키는 일만 남았는데, 아래 배치 명령어를 보자.

### `build.bat`과 `CrmSvcUtil.exe.config`

https://gist.github.com/justinyoo/21d97430acf43f15ba4e

유저네임과 파스워드를 사용자로부터 직접 입력 받게 하고 나머지는 별도의 파라미터로 빼 놨는데, 몇가지 설정은 보이지 않는다. 어디로 간 것일까? `CrmSvcUtil.exe` 파일은 별도의 설정 파일이 `CrmSvcUtil.exe.config` 라는 이름으로 존재하는데 그 안에 포함시켜 두었다.

https://gist.github.com/justinyoo/362f7f974749cb717dbe

1. `language`: 프록시 파일을 생성하는 데 쓰이는 언어를 C# 으로 지정한다.
2. `out`: 생성되는 파일 이름을 설정한다. 여기서는 `OrganisationService.cs` 으로 지정했다.
3. `serviceContextName`: 콘텍스트 클라스의 이름을 지정한다. 여기서는 `OrganisationServiceContext`로 했다.
4. `codeCustomization`: 위에 적용시킨 필터링 확장 기능을 사용하기 위한 어셈블리를 지정한다.
5. `codeWriterFilter`: 실제 필터링 로직이 들어있는 어셈블리를 지정한다.

이렇게 설정을 끝마친 후 `build.bat` 파일을 실행시켜 보도록 하자. 유저네임과 파스워드를 입력하고 난 후에 `OrganisationService.cs` 라는 파일이 생성된 것을 확인할 수 있을 것이다. 그렇다면 실제로 이것을 어떻게 적용시켜 볼 수 있을까? 예제 샘플에는 Web API 콘트롤러가 있어서 이를 곧바로 적용시켜 볼 수 있다.

## 프록시 Web API 생성하기

`CrmSvcUtil.exe`을 이용해서 생성한 `OrganisationService.cs` 파일을 열어 보면 `OrganisationServiceContext` 라는 클라스가 있다. 다행히도 이 클라스는 `partial`로 지정되어 있어서 동일한 클라스에 추가적인 작업이 필요할 경우 다른 파일을 열어 적용시킬 수 있다. 특히 테스트 코드 작성과 의존성 주입을 위해서는 해당 콘텍스트 클라스는 조금 더 유연해 질 필요가 있는데, 이를 `IOrganisationServiceContext` 인터페이스를 이용해서 구현해 보도록 하자.

### `IOrganisationServiceContext`

https://gist.github.com/justinyoo/be0622e49525baa59005

사실 서비스 콘텍스트 클라스는 `DbContext` 클라스와 비슷해서 데이터셋 속성들만 정의해 놓았기 때문에 인터페이스를 작성하기가 어렵지는 않다. 위의 코드와 같이 `IQueryable<T>` 속성들만 별도로 인터페이스에 지정해 놓고 아래와 같이 `partial` 클라스를 생성하면 된다.

https://gist.github.com/justinyoo/c24d288c53aa320c9601

이렇게 하면 유닛 테스트 코드 작성을 할 때 또는 IoC 콘테이너를 통해 의존성 주입을 할 때 굉장히 수월해진다. 아래는 어떻게 IoC 콘테이너에서 해당 컨텍스트 클라스를 다루는지 보여준다.

https://gist.github.com/justinyoo/1e6aba327beb60895a40

그 이후에 콘트롤러에서는 엔티티 프레임워크를 사용하는 것과 똑같은 방식으로 코드 작업을 하면 된다.

https://gist.github.com/justinyoo/c9adc17279089057fea0

이렇게 해서 Web API를 작성한 후 실행시켜 보면 아래와 같은 결과를 만날 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/12/crm-2015-filtering-01.png)

지금까지 [Microsoft Dynamics CRM Online](http://microsoft.com/crm)을 웹 애플리케이션과 연동하는데 필요한 웹서비스들을 어떻게 필터링하고 적용하는지 살펴 보았다. CRM 2015 버전부터는 조금 더 손 쉽게 연동이 가능하도록 [REST 기반의 Web API 엔드포인트](https://msdn.microsoft.com/dynamics/crm/webapipreview) 역시 제공하고 있다. 이것은 차차 다루기로 하고, 이번 포스트를 마무리 지을까 한다.
