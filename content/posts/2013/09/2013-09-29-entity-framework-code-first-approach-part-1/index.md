---
title: "엔티티 프레임워크 Code First 방법론 #1"
date: "2013-09-29"
slug: entity-framework-code-first-approach-part-1
description: ""
author: Justin-Yoo
tags:
- dotnet
- code-first
- entity-framework
- orm
fullscreen: false
cover: ""
---

1. 엔티티 프레임워크 Code First 방법론 #1
2. [엔티티 프레임워크 Code First 방법론 #2](https://blog.aliencube.org/ko/2013/09/30/entity-framework-code-first-approach-part-2)
3. [엔티티 프레임워크 Code First 방법론 #3](https://blog.aliencube.org/ko/2013/10/18/entity-framework-code-first-approach-part-3)

엔티티 프레임워크(Entity Framework, EF)가 가진 수많은 장점들 중 하나는 데이터베이스로부터 직접 ORM 매핑 클라스를 생성해 준다는 데 있다. 데이터베이스 연결을 위한 로그인 정보만 지정해주면 해당 데이터베이스의 모든 테이블, 스토어드 프로시저, 함수 등을 모두 객체화하여 손쉽게 코드에서 사용할 수 있게 해주는 것이다. 하지만, 이 방법의 문제점들 중 하나는 데이터베이스 스키마를 갱신한 후 EF에서 해당 갱신 내역을 업데이트하면, 수동으로 설정한 부분들은 모두 사라지게 된다. 따라서, 이런 문제점을 해결하기 위해서는 보통 두가지 방법 중 하나를 사용한다.

1. `partial` 클라스를 이용하여 수동 변경 사항 분리시키기
2. EF Code FIrst 방법 적용하기

여기서는 두번째 Code First 방법에 대해 논의해 보고자 한다. EF Code First 방법은 보통 아래와 같은 순서를 거쳐 적용할 수 있다.

### 데이터베이스 Connection String 설정하기

우선 `web.config` 혹은 `app.config` 파일의 `<connectionStrings>` 섹션을 아래와 같이 작성한다.

```xml
<connectionStrings>
    <clear />
    <add name="ApplicationDataContext"
         connectionString="Data Source=(LocalDB)v11.0;Initial Catalog=ApplicationDatabase;Persist Security Info=True;Integrated Security=True;MultipleActiveResultSets=True;Connect Timeout=30"
         providerName="System.Data.SqlClient" />
</connectionStrings>

```

위의 내용은 Visual Studio 2012부터 사용할 수 있는 Local DB를 이용하여 데이터베이스를 만드는 Connection String이다. 서버명은 `(LocalDB)v11.0`, 데이터베이스명은 `ApplicationDatabase`, 그리고 Windows 통합 인증 방법을 사용하는 것으로 설정해 두었다. 이 Connection String을 좀 더 보기 쉽게 설정하 싶다면 GitHub에 올라가 있는 오픈소스들 중 하나인 [Data Access Framework](https://github.com/aliencube/Data-Access-Framework) 라이브러리를 참조할 수도 있다.

### `DbContext` 클라스 상속 받기

Connection String 설정이 끝났다면, 새로운 `ApplicationDataContext` 클라스를 하나 생성한다. 이 클라스는 [`DbContext`](http://msdn.microsoft.com/en-us/library/system.data.entity.dbcontext(v=vs.103).aspx) 클라스를 상속받아 사용한다.

```csharp
public partial class ApplicationDataContext : DbContext
{
    #region Constructors

    public ApplicationDataContext()
        : base("ApplicationDatabase")
    {
        ...
    }

    public ApplicationDataContext(string connectionString)
        : base (connectionString)
    {
        ...
    }

    #endregion
}

```

이렇게 작성한 `ApplicationDataContext`는 아래와 같이 사용할 수 있다.

```csharp
using (var context = new ApplicationDataContext())
{
   ...
}

```

Constructor 파라미터 없이 직접 Context를 생성하는 것과, Connection String 파라미터를 받아 생성하는 것, 이렇게 두가지가 있다. 파라미터 없이 직접 Context를 생성하는 경우, 디폴트로 `ApplicationDataBase`를 이용한다. 만약, 지정한 데이터베이스 서버에 해당하는 이름이 없을 경우 새롭게 데이터베이스를 생성하게 된다.

```csharp
public partial class ApplicationDataContext : DbContext
{
    ...

    #region Properties

    public DbSet<Product> Products { get; set; }

    public DbSet<Order> Orders { get; set; }

    public DbSet<ProductOrder> ProductOrders { get; set; }

    #endregion
}

```

### 엔티티 추가하기

데이터베이스 설정이 끝났다면, 실제로 사용할 테이블을 지정해 주어야 한다. 위와 같이 `Products` 테이블과 `Orders` 테이블, 그리고 `ProductOrders` 테이블이 있다고 가정한다면 해당 엔티티 클라스를 아래와 같이 추가한다.

```csharp
public partial class Product
{
    public int ProductId { get; set; }

    public string ProductName { get; set; }

    public string ProductDescription { get; set; }

    public decimal UnitPrice { get; set;}

    public DateTime DateCreated { get; set; }
}

public partial class Order
{
    public int OrderId { get; set; }

    public DateTime DateOrdered { get; set; }

    public int OrderBy { get; set; }
}

public partial class ProductOrder
{
    public int ProductOrderId { get; set; }

    public int ProductId { get; set; }

    public int OrderId { get; set; }

    public int AmountOrdered { get; set; }
}

```

이렇게 `Product`, `Order`, `ProductOrder` 엔티티를 작성한 후 `F5` 키를 눌러 디버깅을 한 번 시도한다. 그리고 나서 Microsoft SQL Server Management Studio를 이용해 LocalDB로 접속해 보면 실제로 아래 그림과 같이 `ApplicationDatabase` 데이터베이스에 `Products`, `Orders`, `ProductOrders` 테이블이 만들어져 있는 것을 확인할 수 있다.

![](http://media.tumblr.com/314d58fed2754c95fbb17b4e53c1a8d4/tumblr_inline_mtvvwwokys1qzhmhx.png)

여기서 주목해야 할 부분이 하나 있는데, `ProductId`, `OrderId`, `ProductOrderId`는 모두 특별한 설정 없이도 `Primary Key`로 되어 있다. 이는 클라스의 이름에 `Id`가 붙으면 자동으로 PK로 인식하게끔 하는 EF의 자동 매핑 기능이다.

다음에는 이 엔티들 사이에 관계를 설정하는 것에 대해 논의해 보도록 하자.
