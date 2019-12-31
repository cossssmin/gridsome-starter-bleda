---
title: "엔티티 프레임워크 Code First 방법론 #2"
date: "2013-09-30"
slug: entity-framework-code-first-approach-part-2
description: ""
author: Justin-Yoo
tags:
- dotnet
- Code First
- entity-framework
- ORM
fullscreen: false
cover: ""
---

1. [엔티티 프레임워크 Code First 방법론 #1](https://blog.aliencube.org/ko/2013/09/29/entity-framework-code-first-approach-part-1)
2. 엔티티 프레임워크 Code First 방법론 #2
3. [엔티티 프레임워크 Code First 방법론 #3](https://blog.aliencube.org/ko/2013/10/18/entity-framework-code-first-approach-part-3)

### 데이터 타입 설정하기

앞서 Local DB에 테이블을 생성하는 방법까지 알아 보았다. 만들어진 테이블은 아래와 같다.

![](http://media.tumblr.com/314d58fed2754c95fbb17b4e53c1a8d4/tumblr_inline_mtvvwwokys1qzhmhx.png)

여기서 눈여겨 봐야 할 것은 각각의 필드 데이터 타입 및 크기이다.

- `NULL` vs `NOT NULL`
- `NVARCHAR(MAX)`
- `decimal` 데이터 타입 크기
- `int`, `datetime`

앞의 글에서 언급한 바와 같이 `엔티티 이름 + Id` 형태의 프로퍼티가 있을 경우 해당 프로퍼티는 자동으로 `PK` 처리가 된다. `int`, `bool`, `DateTime` 같은 경우에는 기본적으로 `Nullable` 속성을 갖고 있지 않으므로 테이블 생성시에도 마찬가지로 자동으로 `NOT NULL` 속성을 갖는다. 반면에 `string` 데이터 타입의 경우에는 `NULL`을 허용하므로 테이블 필드 역시 `NULL`로 설정한다. 만약 `int`, `bool`, `DateTime` 데이터 타입을 갖는 필드에 `NULL` 값을 허용하려면 프로퍼티 설정시 `int?`, `bool?`, `DateTime?`과 같은 형태로 `Nullable` 속성을 추가해 주면 된다. 또한 닷넷 코드는 기본적으로 유니코드를 지원하므로 `string` 데이터 타입은 곧바로 `nvarchar` 타입으로 대응하게 된다.

그렇다면, 바로 이 `string` 데이터 타입의 크기는 어떻게 조정을 할까? 별다른 설정이 없을 경우에는 무조건 `MAX`값을 갖는데, 일반적으로 테이블의 필드는 `nvarchar` 타입이라 하더라도 최대 크기를 정해놓는다. 이렇게 데이터의 크기를 결정해주는 방법은 크게 두가지 방식이 있다.

- [Data Annotations](http://msdn.microsoft.com/en-us/data/jj591583.aspx)
- [Fluent API](http://msdn.microsoft.com/en-us/data/jj591617)

여기서는 먼저 첫번째 Data Annotations 방식을 다루기로 하고 다음에 Fluent API를 논의하도록 하자.

### Data Annotations

Data Annotation을 위해서는 각각의 클라스명 또는 프로퍼티명에 속성 클라스를 지정해 준다. 앞서 생성했던 엔티티들을 아래와 같이 바꾸어 보도록 하자.

```csharp
[Table("ProductInfo")]
public class Product
{
    [Key]
    public int ProductId { get; set; }

    [Required(ErrorMessage="ProductName must be set")]
    [MaxLength(128, ErrorMessage="ProductName is too long")]
    [MinLength(4, ErrorMessage="ProductName is too short")]
    public string ProductName { get; set; }

    [Column(Name="Description", TypeName="NTEXT")]
    public string ProductDescription { get; set; }

    [NotMapped]
    public string ProductAlias { get; set; }

    [Required(ErrorMessage = "UnitPrice must be set")]
    public decimal UnitPrice { get; set; }

    [Required(ErrorMessage = "DateCreated must be set")]
    public DateTime DateCreated { get; set; }
}

public class Order
{
    [Key]
    public int OrderId { get; set; }

    [Required(ErrorMessage = "DateOrdered must be set")]
    public DateTime DateOrdered { get; set; }

    [Required(ErrorMessage = "OrderBy must be set")]
    public int OrderBy { get; set; }
}

public class ProductOrder
{
    [Key]
    public int ProductOrderId { get; set; }

    [Required(ErrorMessage = "ProductId must be set")]
    public int ProductId { get; set; }

    [Required(ErrorMessage = "OrderId must be set")]
    public int OrderId { get; set; }

    [Required(ErrorMessage = "AmountOrdered must be set")]
    public int AmountOrdered { get; set; }
}

```

Data Annotation을 위해서는 크게 두가지 속성 클라스가 있다. 하나는 Validation 속성 클라스이고 다른 하나는 Annotation 속성 클라스이다. 위의 코드에서 `Required`, `MaxLength`, `MinLength` 등과 같은 속성 클라스들이 Validation 속성 클라스이고, `Key`, `NotMapped`, `Table`, `Column` 등과 같은 속성 클라스들을 가리켜 Annotation 속성 클라스라고 부른다. 이밖에도 더 많은 속성 클라스들이 있으니 자세한 사항은 MSDN을 참고하도록 하자.

이렇게 속성클라스들을 생성하고 난 후에 F5 키를 눌러 한 번 디버깅을 한 후 MS SQL Server Management Studio로 접속해서 테이블 구조를 확인해 보면 아래와 같이 변한 것을 확인할 수 있다.

![](http://media.tumblr.com/697cb3004613d7f16af7fdc08673ded6/tumblr_inline_mtxvcsZqwU1qzhmhx.png)

- `Products` 테이블의 이름이 `ProductInfo`로 바뀌었다
- `ProductName` 컬럼의 데이터 크기가 `MAX`에서 `128`로 바뀌었다.
- `ProductDescription` 컬럼명이 `Description`으로 바뀌었다.
- `ProductDescription` 데이터 타입이 `NTEXT`로 바뀌었다.

다음에는 각각의 테이블마다 FK를 설정하는 방법에 대해 논의해 보도록 하자.
