---
title: "MS-SQL 쿼리를 이용하여 문자열을 배열로 전환하기"
date: "2014-02-10"
slug: converting-array-like-table-from-string-in-ms-sql
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- Array
- MS-SQL
- Query
fullscreen: false
cover: ""
---

MS-SQL(시퀄) 서버에서 저장 프로시저(Stored Procedure; SP)를 사용하다 보면 흔히 접하는 문제들 중 하나이다. 표준 시퀄 쿼리는 배열을 지원하지 않기 때문에 여러가지 꼼수들을 사용해서 문자열을 배열로 변환시키곤 하는데, 아래 소개할 방법도 그런 것들 중 하나이다.

시퀄 서버 2005 버전부터 `PATINDEX()`[1](#fn-97:1)라는 함수를 새롭게 도입했다. 와일드카드(`%`)를 이용해서 문자열의 위치를 찾아내는 함수인데, 이를 이용하면 손쉽게 문자열을 잘라서 배열 형태의 테이블로 저장할 수 있게 된다. 아래 스크립트를 보자.

```sql
DECLARE @items NVARCHAR(MAX)
SET @items = '111,222,333,444,555,666,777,888,999'

DECLARE @delimiter NVARCHAR(1)
SET @delimiter = ','

DECLARE @item NVARCHAR(MAX)
SET @item = NULL

DECLARE @results TABLE (
    Item    NVARCHAR(MAX)
)

WHILE LEN(@items) > 0
BEGIN
    DECLARE @index    INT
    SET @index = PATINDEX('%' + @delimiter + '%', @items)
    IF @index > 0
    BEGIN
        SET @item = SUBSTRING(@items, 0, @index)
        SET @items = SUBSTRING(@items, LEN(@item + @delimiter) + 1, LEN(@items))

        INSERT INTO @results ( Item ) VALUES ( @item )
    END
    ELSE
    BEGIN
        SET @item = @items
        SET @items = NULL

        INSERT INTO @results ( Item ) VALUES ( @item )
    END
END

SELECT * FROM @results
```

1-2번 라인은 문자열을 지정하는 부분이다. 만약 저장 프로시저 혹은 펑션으로 만들고 싶다면 이부분은 파라미터로 받아들이면 된다.

4-5번 라인은 구분자를 지정하는 부분이다. 만약 저장 프로시저 혹은 펑션으로 만들고 싶다면 이부분은 파라미터로 받아들이면 된다.

10-12번 라인은 결과를 저장하는 테이블 변수이다. 펑션으로 만들고 싶다면 이부분을 리턴값으로 지정하면 된다.

12번 이후가 실제 내용이 될텐데, 간단하게 설명하자면 `PATINDEX()` 함수를 통해 구분자를 찾아서 해당 위치까지 문자열을 잘라낸 후 테이블에 값을 저장한다. 그렇게 다 저장을 하면 해당 테이블을 리턴해주면 끝. 만약 `PATINDEX()`와 같은 함수가 다른 DBMS에서도 존재한다면 위의 방법을 적용시킬 수도 있을 것이다.

참고로, `PATINDEX()` 함수 말고도 `CHARINDEX()`[2](#fn-97:2)라는 함수도 있는데, 이 둘의 차이는 와일드카드 문자(`%`)를 쓸 수 있는가(`PATINDEX()`) 없는가(`CHARINDEX()`)가 전부이다.[3](#fn-97:3)

* * *

참조:

- [Split string in SQL](http://stackoverflow.com/questions/2647/split-string-in-sql)
- [SQL User Defined Function to Parse a Delimited String](http://www.codeproject.com/Articles/7938/SQL-User-Defined-Function-to-Parse-a-Delimited-Str)

* * *

2. [PATINDEX (Transact-SQL)](http://msdn.microsoft.com/en-us/library/ms188395(v=sql.120).aspx) [↩](#fnref-97:1)

4. [CHARINDEX (Transact-SQL)](http://msdn.microsoft.com/en-us/library/ms186323(v=sql.120).aspx) [↩](#fnref-97:2)

6. [Comparing CHARINDEX and PATINDEX](http://technet.microsoft.com/en-us/library/ms190184(v=sql.105).aspx) [↩](#fnref-97:3)
