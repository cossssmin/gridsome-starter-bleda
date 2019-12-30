---
title: "데메테르의 법칙 Law of Demeter"
date: "2013-12-06"
slug: law-of-demeter-explained
description: ""
author: Justin Yoo
tags:
- .NET
- Law of Demeter
- Method Chaining
- Object-Oriented Programming
fullscreen: false
cover: ""
---

데메테르는 그리스 신화에 나오는 추수의 신이다. 로마신화에서는 세레스 Ceres 라고 불리는 바로 그 신. 하지만, 그 데메테르하고 이 법칙하고는 상관없다는 것이 함정. \[위키피디아\][1](p69165446353-1)에서는 데메테르의 법칙을 아래와 같이 정의하고 있다.

> 데메테르의 법칙에서는 어떤 객체 `O`의 메소드 `m`는 다음과 같은 종류의 객체에 있는 메소드들만 실행시킬 수 있다.
> 
> 1. `O` 자체
> 2. `m` 의 변수
> 3. `m` 안에서 만들어진 객체
> 4. `O`가 직접 관리하는 콤포넌트 객체
> 5. `m`의 스코프 안에서 `O`가 접근 가능한 전역변수

좀 말이 어려운데, [Richard Carr](http://www.blackwasp.co.uk/FAQ.aspx)의 \[The Law of Demeter\][2](p69165446353-2) 포스트에 좀 더 쉬운 설명이 있다.

> 어떤 클라스의 멤버 – 메소드 또는 속성 – 는 반드시 다음과 같은 객체들의 멤버들만을 실행시켜야 한다:
> 
> - 해당 메소드 또는 속성이 선언된 객체
> - 메소드의 파라미터로 보내진 객체
> - 메소드 또는 속성이 직접 초기화시킨 객체
> - 호출을 위한 메소드 또는 속성으로서 같은 클라스 안에서 선언된 객체
> - 전역 객체

아래 예제 코드를 보자. ASP.NET MVC 웹사이트를 개발하다보면 콘트롤러에서 흔히 볼 수 있는 상황이다.

```
public class ProductController : Controller
{
    private IProductService _service;

    public ProductController(IProductService service)
    {
        this._service = service;
    }

    public ActionResult Index()
    {
        var products = this._service.Repository.Get();

        return View(products);        
    }
}

public class ProductService : IProductService
{
    public ProductService(IProductRepository repository)
    {
        this.Repository = repository;
    }

    public IProductRepository Repository { get; private set; }
}

```

위의 코드에서 `Index` 액션을 보면 대략 예상이 가능하겠지만 `ProductService`라는 서비스 레이어 안에서 `ProductRepository`라는 데이터 리포지토리 패턴을 통해 CRUD를 구현하고 있다. `Index` 액션은 전체 제품 리스트를 보여주는 뷰를 갖고 있어서 전체 제품 리스트는 서비스 안에 구현된 리포지토리의 `Get` 메소드를 통해 가져오게 된다. 이렇게 메소드 체이닝을 하는 것이 바로 데메테르의 법칙을 위반하는 것이 된다. `ProductController` 객체는 생성자를 통해 변수로 받은 `ProductService` 객체의 메소드 또는 속성을 호출해야 하지 그 내부에 있는 `ProductRepository` 객체의 `Get` 메소드를 직접 호출해서는 안된다. `ProductRepository` 객체의 현재 상태가 `null`이라면 해당 코드는 `NullReferenceException`을 던지기 때문이다. 따라서 `ProductService` 클라스 안에 추가적인 메소드를 선언해주는 방식으로 리팩토링을 해야 한다.

```
public class ProductController : Controller
{
    private IProductService _service;

    public ProductController(IProductService service)
    {
        this._service = service;
    }

    public ActionResult Index()
    {
        var products = this._service.GetProducts();

        return View(products);        
    }
}

public class ProductService : IProductService
{
    private IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        this._repository = repository;
    }

    public IList<Product> GetProducts()
    {
        return this._repository.Get();
    }
}

```

즉 `ProductRepository` 객체를 `public` 속성이나 필드로 두는 것이 아니라 내부적으로 encapsulation 시키고 `ProductRepository` 클라스의 멤버는 `ProductService` 클라스의 멤버를 통해 호출하는 방식으로 하게 되면, `ProductController` 클라스는 직접적으로 관련이 있는 콤포넌트인 `ProductSerivce`에 대해서만 통제권을 가질 수 있어서 보다 안전하고 유연한 코드를 작성할 수 있게 된다.

이런식으로 메소드 체이닝을 최대한 줄이는 것이 바람직한 객체지향 프로그래밍이라고 할 수 있겠다. 하지만 이렇게 프로그래밍을 하게 되면 추가적인 메소드를 작성해야 하는 부담이 생기게 되는데, 이것이 꼭 부정적이라고는 할 수 없는 것이 객체 사이의 의존성을 최소화하는 방식으로 유연하게 개발을 할 수 있기 때문이다.

단, LINQ를 쓰는 상황이라면 얘기가 달라진다. LINQ에서는 특성상 메소드 체이닝이 필수일 수 밖에 없는지라, 이 데메테르의 법칙에서 벗어날 수 있는데, 그 이유는 메소드 체이닝을 하는 것과 상관없이 항상 리턴타입이 동일하기 때문이다. 위의 예제 코드에 나온 `ProductRepository` 클라스의 `Get` 메소드는 아마도 내부적으로 아래와 같이 구현이 되어 있을 것이다.

```
public class ProductRepository : IProductRepository
{
    private CompanyDataContext _context;

    public ProductRepository(ICompanyDataContext context)
    {
        this._context = context as CompanyDataContext;
    }

    public IList<Product> Get()
    {
        return this._context
                   .Products
                   .Where(p => p.IsActive)
                   .OrderBy(p => p.DateRegistered)
                   .ToList();
    }
}

```

여기서 `Products`, `Where` 그리고 `OrderBy`는 모두 동일한 `IEnumerable<Product>` 객체를 반환한다. 즉 LINQ를 이용한 메소드 체이닝의 경우 메소드마다 동일한 데이터 타입을 반환하기 때문에 이 데메테르의 법칙을 위반하지 않고 안전하게 사용할 수 있다.

* * *

참조:

- \[Law of Demeter\]\[^1\] from Wikipedia
- \[The Law of Demeter\]\[^2\] by Richard Carr

* * *

1. [http://en.wikipedia.org/wiki/Law\_of\_Demeter ](http://en.wikipedia.org/wiki/Law_of_Demeter%C2%A0)[↩](p69165446353-1)
2. [http://www.blackwasp.co.uk/LawOfDemeter.aspx ](http://www.blackwasp.co.uk/LawOfDemeter.aspx%C2%A0)[↩](p69165446353-2)
