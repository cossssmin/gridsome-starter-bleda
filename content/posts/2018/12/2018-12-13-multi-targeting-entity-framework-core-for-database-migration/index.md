---
title: "데이터베이스 마이그레이션을 위한 엔티티 프레임워크 코어 2.1 멀티 타겟팅"
date: "2018-12-13"
slug: multi-targeting-entity-framework-core-for-database-migration
description: ""
author: Justin-Yoo
tags:
- dotnet
- dotnet-core
- dotnet Standard
- entity-framework-core
- multi-targeting
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2018/12/entityframeworkcore-on-netcoreapp-and-netstandard-00.png
---

> **알림**: 이 포스트는 순수한 개인의 견해이며, 제가 속해있는 직장의 의견 혹은 입장을 대변하지 않습니다.

엔티티 프레임워크 코어 라이브러리는 기본적으로 .NET Standard 2.0 을 지원한다. 따라서, 라이브러리 형태로만 쓸 때에는 아래와 같이 `.csproj` 파일을 설정해 주면 큰 문제가 없다.

```xml
<TargetFramework>netstandard2.0</TargetFramework>

```

하지만, 만약 해당 라이브러리를 이용해서 코드 우선 (Code-First) 형태의 데이터베이스 마이그레이션을 진행하기 위해서는 `.csproj` 파일을 반드시 아래와 같이 .NET Core 2.1 로 타겟팅 해야 한다.

```xml
<TargetFramework>netcoreapp2.1</TargetFramework>

```

이후 이 라이브러리를 참조하는 모든 라이브러리는 반드시 .NET Core 2.1 을 타켓팅 해야 정상적으로 작동한다. 하지만, 웹 앱 또는 콘솔 앱과 같은 최종 애플리케이션이 아닌 이상 .NET Core 를 타겟팅 하기 보다는 .NET Standard 를 타겟팅하는 것이 향후 라이브러리 확장성 면에서 좋다. 사실 데이터베이스 마이그레이션이 진행되는 라이브러리는 `DbContext`가 존재하고 이는 데이터베이스 트랜잭션에 필수적으로 쓰이는 지라, .NET Standard 를 타켓팅 해야 하지만, 데이터베이스 마이그레이션이라는 최종 애플리케이션의 역할도 해야 하므로 애매한 상황이 된다. 이럴 땐 어떻게 하면 좋을까?

가장 최선의 방법은 데이터베이스 마이그레이션 관련 데이터를 별도의 프로젝트로 셋업하는 것이다. 이렇게 하면 데이터베이스 마이그레이션 관련 스냅샷만 남아있게 되므로 기존의 `DbContext` 구현체 클라스는 단순 참조만 하기 때문에 해당 프로젝트만 .NET Core 로 타겟팅하면 된다. 하지만, 세상 일은 그렇게 뜻대로 흘러가지 않는 법. 보통은 이 마이그레이션 스냅샷과 `DbContext` 구현체가 함께 존재하는 경우가 많다. 이럴 땐 바로 멀티 타겟팅을 하면 된다.

```xml
<TargetFrameworks>netstandard2.0;netcoreapp2.1</TargetFrameworks>

```

위와 같이 `.csproj` 파일을 수정해서 .NET Standard 와 .NET Core 를 동시에 빌드할 수 있게끔 할 수 있다. 이렇게 한 후 아래와 같이 데이터베이스 마이그레이션 관련 dotnet CLI 명령어를 날려주면 해결.

```bash
dotnet ef migrations add ThisMigration --framework netcoreapp2.1
dotnet ef database update --framework netcoreapp2.1

```

위 명령어와 같이 명시적으로 프레임워크를 정해주면 해당 라이브러리는 이미 멀티 타겟팅 상태로 컴파일이 되어 있으므로 문제 없이 사용할 수 있다.

참 쉽죠?
