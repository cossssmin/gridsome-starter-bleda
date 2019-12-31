---
title: "데이터베이스에 ELMAH 로그 데이터 저장하기"
date: "2014-05-08"
slug: storing-error-logs-into-database-with-elmah
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- ELMAH
- Error Log
- MVC
fullscreen: false
cover: ""
---

> 이 포스트는 `ELMAH`와 `NLog`를 이용한 웹사이트 에러 로그 시스템 구축 관련 포스트들의 시리즈입니다. 다른 포스트들은 아래 링크에서 확인할 수 있습니다.
> 
> 1. [`ELMAH`를 사용하여 웹사이트 에러 로그 구축하기](http://blog.aliencube.org/ko/2014/05/07/logging-website-logs-with-elmah)
> 2. 데이터베이스에 `ELMAH` 로그 데이터 저장하기
> 3. 데이터베이스에 `NLog` 로그 데이터 저장하기 (예정)
> 4. 로그 리포트 페이지 구축하기 (예정)

[이전 포스트에서](http://blog.aliencube.org/ko/2014/05/07/logging-website-logs-with-elmah)는 `EMLAH`를 이용하여 에러 로그 시스템을 손쉽게 구축하는 방법에 대하여 알아보았다. 마지막 부분에서 언급한 바와 같이 `ELMAH`의 기본 세팅은 메모리에 로그를 저장하는 형태라서, 언제든 로그 데이타가 사라질 수 있다. 따라서, 파일 시스템 혹은 데이터베이스를 이용하여 로그를 저장해 놓아야지 나중에 활용이 가능하다. 이 포스트에서는 MS-SQL 서버 데이터베이스를 이용하여 에러 로그를 저장하는 방법에 대해 논의해 보도록 한다. 관련 소스코드는 아래 링크에서 다운로드가 가능하다.

[https://github.com/aliencube/Aliencube-ELMAH](https://github.com/aliencube/Aliencube-ELMAH)

## MS-SQL 데이터베이스 셋업

`ELMAH`가 저장하는 에러 로그를 위해서는 테이블 하나면 충분하다. 따라서, 기존에 사용하던 데이터베이스에 테이블 하나를 추가해도 좋고, 별도의 에러 로깅을 위한 데이터베이스를 준비해도 좋다. 여기서는 편의상 에러 로깅을 위한 별도의 데이터베이스를 따로 준비하는 것으로 하자. 이 포스트에서는 데이터베이스 이름을 `LogDatabase` 라고 정했다. 데이터베이스 준비가 끝났다면, 아래 `ELMAH` 다운로드 링크를 통해 데이터베이스에 테이블과 몇가지 스토어드 프로시저를 추가하는 스크립트를 다운로드 받아 실행시키도록 한다.

- [https://code.google.com/p/elmah/wiki/Downloads?tm=2](https://code.google.com/p/elmah/wiki/Downloads?tm=2)

아래는 SQL 스크립트를 직접 다운로드 받을 수 있는 링크이다.

- [http://code.google.com/p/elmah/downloads/detail?name=ELMAH-1.2-db-SQLServer.sql](http://code.google.com/p/elmah/downloads/detail?name=ELMAH-1.2-db-SQLServer.sql)

스크립트를 실행시키면 MS-SQL 서버 버전이 2000이 아닌 이상 아래와 같은 에러메시지를 볼 수 있을 것이다.

```sql
\===========================================================================
WARNING! 
---------------------------------------------------------------------------

This script is designed for Microsoft SQL Server 2000 (8.0) but your 
database is set up for compatibility with version 11.0. Although 
the script should work with later versions of Microsoft SQL Server, 
you can ensure compatibility by executing the following statement:

ALTER DATABASE [LogDatabase] 
SET COMPATIBILITY_LEVEL = 80

If you are hosting ELMAH in the same database as your application 
database and do not wish to change the compatibility option then you 
should create a separate database to host ELMAH where you can set the 
compatibility level more freely.

If you continue with the current setup, please report any compatibility 
issues you encounter over at:

http://code.google.com/p/elmah/issues/list

===========================================================================
```

위 메시지에 따르면 현재 데이터베이스 버전은 하일라이트 쳐진 라인에서 확인할 수 있다시피 11.0, 즉 MS-SQL 서버 2012이다. 하위 호환성을 위해 MS-SQL 서버 버전의 호환성을 아래와 같이 설정하라고도 되어 있다.

```sql
ALTER DATABASE [LogDatabase] 
SET COMPATIBILITY\_LEVEL = 80
```

위에서 언급한 `80`이 바로 MS-SQL 서버 2000을 의미한다. 하지만, MS-SQL 서버 2012의 경우 하위 호환성모드 설정이 2005까지, 즉 `90`까지만 가능하므로 위의 스크립트를 실행시키게 되면 아래와 같은 에러메시지를 확인할 수 있다.

Msg 15048, Level 16, State 1, Line 1
Valid values of the database compatibility level are 90, 100, or 110.

`ELMAH` 라이브러리는 닷넷 프레임웍 버전 1.x 버전부터 모두 지원을 하기 때문에 그런 것이므로 위의 에러 메시지에 대해서는 크게 신경을 쓰지 않아도 상관은 없다.[1](#fn-201-1) 데이터베이스 셋업 결과는 아래와 같이 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-07.png)

만약 다른 데이터베이스 시스템을 사용하고 싶다면 아래 두 페이지를 참고로 하면 된다.

- [https://code.google.com/p/elmah/wiki/Downloads?tm=2](https://code.google.com/p/elmah/wiki/Downloads?tm=2)
- [https://code.google.com/p/elmah/wiki/ErrorLogImplementations](https://code.google.com/p/elmah/wiki/ErrorLogImplementations)

## `Web.config` 셋업

데이터베이스가 위와 같이 준비됐다면, 이제 `ELMAH` 라이브러리가 데이터베이스에 저장할 수 있게끔 `Web.config`를 수정하는 일이 남았다. 아래와 같은 부분을 확인해 보도록 하자.

- `#4`: `<sectionGroup>` 엘리먼트 안에 `errorLog` 엘리먼트가 있는지 확인한다.
- `#22`: `<errorLog>` 엘리먼트의 `type` 속성을 `Elmah.SqlErrorLog, Elmah`로 설정하고, `connectionStringName` 속성을 `LogDbContext`로 설정한다. 이 `connectionStringName` 속성값은 바로 아래 `#26`에서 설정한 이름과 동일해야 한다.
- `#26`: 데이터베이스 커넥션 스트링을 설정한다.

위와 같이 `Web.config` 파일을 수정하면 `ELMAH` 라이브러리가 데이터베이스에 에러로그를 저장할 준비가 다 됐다. 이제 실제로 에러를 발생시켜보자.

## 에러 로그 생성

[이전 포스트](http://blog.aliencube.org/ko/2014/05/07/logging-website-logs-with-elmah)에서 생성한 URL – `http://elmah.aliencube.local/home/confused` – 을 호출한다. 결과는 예상한 바와 같이 아래와 같을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-05.png)

그리고, 이를 브라우저에서 `http://elmah.aliencube.local/elmah.axd`을 통해 확인해 보면 예상한 대로 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-06.png)

이제 데이터베이스를 확인해 보도록 하자. 아래와 같이 로그가 저장된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/05/elmah-08.png)

## 결론

이로써, 데이터베이스에 `ELMAH` 라이브러리가 생성한 에러 로그를 저장하는 방법에 대해 알아보았다. 다음 포스트에서는 에러 로그가 아닌 일반적인 로그들을 `NLog` 라이브러리를 이용하여 저장하는 방법에 대해 알아보도록 하겠다.

* * *

2. [Error Log Implementations](https://code.google.com/p/elmah/wiki/ErrorLogImplementations#Enterprise-Level_Relational_Databases) [↩](#fnref-201-1)
