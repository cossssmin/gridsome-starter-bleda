---
title: "애저 펑션으로 통합 어카운트를 대체하는 XSL 매퍼 만들기"
date: "2019-01-07"
slug: building-xsl-mapper-with-azure-functions
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-functions
- azure-logic-apps
- integration-account
- xml-transformation
- xsl-mapping
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-xsl-mapper-with-azure-functions-00.png
---

서비스 통합 (Service Integration) 프로젝트에서 [BizTalk 서버](https://www.microsoft.com/en-au/cloud-platform/biztalk)를 사용할 경우, XML 데이터 변환 기능은 거의 필수적으로 이용한다고 보면 된다. 만약 비즈톡 서버의 많은 기능들을 애저 클라우드로 이전한다고 하면 [로직 앱(Logic App)](https://azure.microsoft.com/en-au/services/logic-apps/)과 [통합 어카운트(Integration Account)](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-enterprise-integration-create-integration-account)를 이용하게 된다. 통합 어카운트는 XML 스키마 매핑, XML 데이터 변환, 외부 어셈블리 저장 등 비즈톡의 기능을 대체할 수 있는 여러 서비스를 제공하지만 월 30일 기준 33만원 이상으로 가격이 굉장히 비싸다는 단점이 있다.

따라서 로직 앱 또는 애저 펑션과 같은 서버리스 서비스를 이용하기 위해 고가의 통합 어카운트를 사용하는 것이 기업 입장에서는 부담스러울 수 있다. 다행히도 애저 MVP 중 한 명인 [Toon Vanhoutte](https://twitter.com/toonvanhoutte)이 작성한 훌륭한 [포스트](https://toonvanhoutte.wordpress.com/2017/06/16/run-biztalk-extension-objects-in-logic-apps/)에서는 Web API를 사용해서 이 XSL 매퍼 기능을 대체한 예를 보여줬다. 이 포스트에서는 이를 애저 펑션으로 변환해서 만들어 보도록 한다.

> 이 포스트에서 사용한 코드는 [이곳에서 확인할 수 있다](https://github.com/aliencube/AzureFunctions-XSL-Mapper).

## 애저 펑션 버전 선택

이 애저 펑션에서는 반드시 [`XslCompiledTransform`](https://docs.microsoft.com/en-us/dotnet/api/system.xml.xsl.xslcompiledtransform?view=netcore-2.2) 클라스가 필요하다. 특히 비즈톡의 XSLT 매퍼 기능은 인라인 C# 스크립트 기능이 절대적으로 필요한데, .NET Core 버전을 사용할 경우 아래와 같은 에러 메시지를 뱉어낸다.

```bat
Compiling JScript/CSharp scripts is not supported

```

즉, [닷넷 코어 버전에서는 아직 이 기능을 지원하지 않을 뿐더러 지원 계획도 불투명하다](https://github.com/dotnet/corefx/issues/19837). 다시 말해서 애저 펑션 2.x 버전을 사용할 수 없다는 말과 동일하므로 이 매퍼 펑션은 1.x 버전을 사용해야만 한다.

## 환경 설정

애저 펑션 버전을 선택했다면 이제 환경 변수를 설정한다. 로컬 환경에서는 `local.settings.json` 파일을, 애저 펑션 인스턴스에서는 App Settings 값을 아래와 같이 설정한다.

- `Containers__Mappers`: 매퍼 XSL 파일을 저장하는 blob 저장소 컨테이너 이름. 기본값은 `mappers`이다.
- `Containers__ExtensionObjects`: 외부 확장 객체 파일을 저장하는 blob 저장소 컨테이너 이름. 기본값은 `extensionobjects`이다.
- `EncodeBase64Output`: 변환된 XML 파일을 base-64 포맷으로 인코딩해서 반환할지 여부. 기본값은 `false`이다.

## XSLT 매퍼 파일 업로드

blob 저장소에 XSLT 매퍼 컨테이너를 만들었다면 XSLT 매퍼 파일을 업로드한다. 외부 라이브러리를 이용하는 XSLT 파일의 형태는 대략 아래와 비슷하게 생겼다.

https://gist.github.com/justinyoo/aabdf5f167ab644a39c13eb5469039b2?file=transform.xsl

위의 XSLT 파일을 보면 `userCSharp` 네임스페이스와 `ScriptNS0` 네임스페이스가 보이는데, `userCSharp` 네임스페이스는 인라인 C# 코드를 가리키는 것이고, `ScriptNS0` 네임스페이스는 외부 확장 라이브러리를 가리킨다. 이를 이용한 XSLT 노드가 위의 XSLT 코드에 보면 `select="usserCSharp:DoSomething1()"`, `select="ScriptNS0:DoSomething2()"`으로 표현되어 있다.

이 파일을 blob 저장소로 업로드하게 되면 인라인 C# 코드는 활용이 가능하지만 외부 라이브러리와 연결은 어떻게 하면 좋을까?

## 외부 확장 라이브러리 업로드

blob 저장소에 외부 확장 라이브러리 컨테이너를 만들었다면 이제 .dll 파일을 업로드한다. 업로드하기에 앞서 해당 라이브러리와 관련한 메타 데이터를 담고 있는 XML 파일이 하나 있을 것이다.

https://gist.github.com/justinyoo/aabdf5f167ab644a39c13eb5469039b2?file=extension-object.xml

이 메타 데이터를 잘 저장해 놓도록 하자. 확장 라이브러리를 업로드한 후에 이 내용을 요청 메시지에 변환하고자 하는 XML 데이터와 함께 실어 보내야 한다.

## XML 변환 요청 Payload 구조

이 예제에서는 아래와 같은 JSON Payload 를 요청시 사용한다.

https://gist.github.com/justinyoo/aabdf5f167ab644a39c13eb5469039b2?file=request.json

Mapper 컨테이너, Extension Object 컨테이너 안에 여러 개의 XSLT 파일과 .dll 파일이 있다면 분명히 좀 더 용도에 맞게 서브 디렉토리를 만들어 놓았을 것이다. 서브 디렉토리가 있다면 `directory` 값을 지정하면 되고, 아니라면 `null` 값을 주면 된다. 그리고, XSLT 매퍼 파일 이름과 .dll 파일 이름을 지정하고, 어셈블리 이름, 클라스 이름을 지정해 주면 된다.

마지막으로 `inputXML` 값은 변환하고자 하는 XML 문서가 된다.

## XML 변환

모든 준비가 끝났다면 애저 펑션을 실행시킨 후 위의 Payload를 요청에 넣어 호출해본다. 만약 base-64 인코딩을 선택했다면 아래와 같은 결과가 나올 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-xsl-mapper-with-azure-functions-01.png)

만약 인코딩 옵션을 선택하지 않았다면 아래와 같은 결과가 나올 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/01/building-xsl-mapper-with-azure-functions-02.png)

## 로직 앱 연동

이렇게 개발한 애저 펑션 앱을 배포한 후, 로직 앱에서는 통합 어카운트를 호출해서 XML 변환을 하는 대신, 이 애저 펑션을 XML 데이터와 더불어 매퍼 및 외부 라이브러리 파일 메타 데이터를 호출하면 통합 어카운트를 호출한 것과 동일한 결과를 얻을 수 있다.

* * *

지금까지 애저 로직앱에서 사용 가능한 통합 어카운트의 대체재로서 애저 펑션을 이용한 XML 변환 매핑 기능을 만들어 봤다. on-prem 비즈톡 서버 환경에서 애저 클라우드 환경으로 서비스 통합 기능 이전을 검토중이라면 한번쯤 고려해 볼 만한 서버리스 애플리케이션이 될 것이다.
