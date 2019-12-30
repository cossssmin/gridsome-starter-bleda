---
title: "엔티티 프레임워크 Code First 방법론 #3"
date: "2013-10-18"
slug: entity-framework-code-first-approach-part-3
description: ""
author: Justin Yoo
tags:
- .NET
- Code First
- Entity Framework
- ORM
fullscreen: false
cover: ""
---

1. [엔티티 프레임워크 Code First 방법론 #1](https://blog.aliencube.org/ko/2013/09/29/entity-framework-code-first-approach-part-1)
2. [엔티티 프레임워크 Code First 방법론 #2](https://blog.aliencube.org/ko/2013/09/30/entity-framework-code-first-approach-part-2)
3. 엔티티 프레임워크 Code First 방법론 #3

### Foreign Key 설정하기

앞서 Data Annotation 방법을 통해 테이블의 컬럼들에 대한 속성을 제어하는 방법에 대해 알아보았다. 이번에는 테이블 각각에 대한 관계를 설정하는 방법에 대해 논의해 보도록 하자.

현재 `Products` 테이블과 `Orders` 테이블은 각각 상품 정보, 주문 정보를 가지고 있다. 이 둘은 many-to-many 관계이므로, 정규화를 거쳐 one-to-many 관계로 바꾸어 주어야 하는데, 그 결과로 `ProductOrders` 테이블이 만들어졌다. 따라서, 이 `ProductOrders` 테이블에 있는 `ProductId`와 `OrderId`가 Forein Key 로서 역할을 해야 한다. 아래와 같이 `ProductOrder` 클라스를 수정해 보자.

```
public class ProductOrder
{
    [Key]
    public int ProductOrderId { get; set; }

    [Required(ErrorMessage = "ProductId must be set")]
    public int ProductId { get; set; }

    [ForeignKey("ProductId")]
    public virtual Product Product { get; set; }

    [Required(ErrorMessage = "OrderId must be set")]
    public int OrderId { get; set; }

    [ForeignKey("OrderId")]
    public virtual Order Order { get; set; }

    [Required(ErrorMessage = "AmountOrdered must be set")]
    public int AmountOrdered { get; set; }
}

```

위 코드에서 주목해야 할 부분은 `public virtual Product Product { get; set; }` 부분과 `public virtual Order Order { get; set; }` 부분이다. `ProductOrder` 클라스가 `ProductId`, `OrderId` 필드를 각각 해당하는 `Product`, `Order` 클라스의 Foreign Key 로서 인식시키기 위하여 버추얼 프로퍼티를 추가시켰다. 이렇게 추가시켜 컴파일 한 후, F5 키를 다시 한 번 눌러 이 변경사항을 반영시켜 보자. 그리고, SQL Server Management Studio 를 통해 변경된 사항을 확인해 보도록 하자.

![](http://media.tumblr.com/6649846e2c18b93db4331147a1e6d5c8/tumblr_inline_muv9wej11M1qzhmhx.png)

위 이미지에서 볼 수 있다시피 `ProductId`와 `OrderId`가 Foreign Key로 지정이 되었고, 해당하는 키값은 테이블 스키마와 테이블 이름의 조합 – 여기서는 `dbo.ProductOrders_dbo.Products_ProductId` – 으로 이루어진 것을 볼 수 있다.

다음에는 Fluent API를 이용하여 테이블을 생성하는 방법을 알아보도록 하자.
