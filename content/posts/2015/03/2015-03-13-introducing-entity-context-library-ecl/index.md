---
title: "Entity Context Library (ECL) 소개"
date: "2015-03-13"
slug: introducing-entity-context-library-ecl
description: ""
author: Justin Yoo
tags:
- .NET
- Entity Framework
- Object-oriented Design
- Repository Pattern
- SOLID
- SRP
- Unit of Work
fullscreen: false
cover: ""
---

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/03/Entity-Framework.jpg)

**Entity Context Library (ECL)**은 [엔티티 프레임워크](http://www.asp.net/entity-framework)를 이용하여 어플리케이션을 개발하다 보면 자주 쓰게 되는 인터페이스들을 제공한다.

엔티티 프레임워크를 사용하는 많은 어플리케이션들은 보통 아래와 같은 문제를 안고 있는 편인데:

- 리포지토리 패턴을 좀 더 쉽게 적용시킬 수 있을까?
- 작업단위 패턴을 좀 더 쉽게 적용시킬 수 있을까?
- 여러개의 데이터페이스를 한 번에 쉽게 관리할 수 있을까?

물론 많은 개발자들은 저마다의 방법을 갖고 있긴 하지만, 그것들을 한 어플리케이션에 쓰고 그 다음에 다시 복사/붙이기 해서 다른 어플리케이션에 쓰곤 한다. 이 **ECL** 라이브러리는 개발자들이 하게 될 수 있는 그런 반복적인 작업을 줄여준다.

**ECL** 라이브러리는 NuGet과 GitHub을 통해 다운로드 받을 수 있다.

- NuGet:[https://www.nuget.org/packages/Aliencube.EntityContextLibrary/](https://www.nuget.org/packages/Aliencube.EntityContextLibrary/)
- GitHub: [https://github.com/aliencube/Entity-Context-Library](https://github.com/aliencube/Entity-Context-Library)

**ECL** 라이브러리는 네 개의 독자적인 인터페이스를 제공한다. 바로 `IDbContextFactory`, `IBaseRepository`, `IUnitOfWork`, `IUnitOfWorkManager`와 같은 인터페이스들이다.

## `IDbContextFactory`

`IDbContextFactory` 인터페이스는 `DbContext` 인스턴스를 반환하는 속성을 갖는다. 이 팩토리 인스턴스는 여러 개의 데이터페이스 커넥션을 한 어플리케이션 안에서 사용할 때 굉장히 유용한 편이다. 만약 IoC 컨테이너로서 [`Autofac`](http://autofac.org)을 사용한다면 아래와 같은 코드를 사용할 수 있다. 물론, 다른 IoC 컨테이너를 사용한다고 하더라도 쉽게 적용시킬 수 있을 것이다.

```csharp
using Autofac;
...

public static class Program
{
  private const string MY_DB_CONTEXT = "MyDB";
  private const string ANOTHER_DB_CONTEXT = "AnotherDB";

  public static void Main(string[] args)
  {
    var builder = new ContainerBuilder();

    // Register MyDbContext with DbContextFactory.
    builder.RegisterType<DbContextFactory<MyDbContext>>()
           .Named<IDbContextFactory>(SERVICE_NAME)
           .As<IDbContextFactory>();

    // Register AnotherDbContext with DbContextFactory.
    builder.RegisterType<DbContextFactory<AnotherDbContext>>()
           .Named<IDbContextFactory>(SERVICE_NAME)
           .As<IDbContextFactory>();
    ...

    _container = builder.Build();
  }
}
```

위의 코드는 두 개의 서로 다른 데이터베이스 커넥션을 갖는다. 하나는 `MyDB`이고 다른 하나는 `AnotherDB`이다. 따라서, 두 개의 서로 다른 `DbContextFactory` 인스턴스가 만들어졌다. 굳이 `DbContext` 인스턴스를 직접 사용하지 않고, 이렇게 팩토리 클라스를 만들어 쓰는 것은 아무래도 `DbContext` 클라스는 유닛 테스트를 하기에 조금 번거롭기 때문이다. 이렇게 팩토리 클라스를 만들어 놓으면 그 안의 `.Context` 속성으로 손쉽게 데이터베이스 커넥션을 가져올 수 있을 뿐만 아니라 속성을 목킹하기도 쉽다. 이 팩토리 클라스는 `DbContextType`이라는 이름의 속성도 갖고 있는데, 이를 이용하면 현재 팩토리 클라스가 대상으로 하는 데이터베이스가 어떤 것인지 쉽게 알 수 있다.

## `IBaseRepository`

`IBaseRepository` 인터페이스는 기본적인 CRUD 액션을 제공한다. 따라서 각각의 리포지토리들은 이 베이스 리포지토리 인터페이스를 그냥 쓰거나 아니면 상속 받아서 좀 더 풍부한 기능들을 제공한다거나 할 수 있다.

아래와 같이 가장 단순한 방법으로는 `IBaseRepository<TEntity>` 인터페이스를 사용하는 것이다.

```csharp
// Assuming that the contextFactory instance already exists.
IBaseRepository<Product> productRepository = new BaseRepository<Product>(contextFactory);

var product = new Product() { ProductId = 1 };
productRepository.Add(product);
```

만약 조금 더 `IBaseRepository<TEntity>` 인터페이스를 확장하고 싶다면 아래와 같은 방법을 사용하면 된다.

```csharp
public interface IProductRepository : IBaseRepository<Product>
{
  // You can put as many methods as you want here.
}

public class ProductRepository : BaseRepository<Product>, IProductRepository
{
  public ProductRepository(IDbContextFactory contextFactory)
    : base(contextFactory)
  {
  }

  // You can here implement methods defined in the interface above. 
}

...

IProductRepository productRepository = new ProductRepository(contextFactory);

var product = new Product() { ProductId = 1 };
productRepository.Add(product);
```

`Autofac`을 이용하면 아래와 같이 IoC 컨테이너에 선언할 수 있다.

```csharp
// Register Product Repository #1:
builder.Register(p => new BaseRepository<Product>(p.ResolveNamed<IDbContextFactory>(MY_DB_CONTEXT)))
       .As<IBaseRepository<Product>>();

// Register Product Repository #2:
builder.Register(p => new ProductRepository(p.ResolveNamed<IDbContextFactory>(MY_DB_CONTEXT)))
       .As<IProductRepository>();
```

### `IUnitOfWorkManager`

`IUnitOfWorkManager` 인터페이스는 `CreateInstance` 라는 이름으로 딱 한가지 메소드만 갖고 있다. 이 메소드를 통해 아래 설명할 `UnitOfWork` 인스턴스를 생성시키게 된다. `Autofac`을 사용하게 되면 아래와 같은 형태로 IoC 컨테이너에서 선언하여 인스턴스를 만들 수 있다.

```csharp
// Register UnitOfWorkManager.
builder.Register(p => new UnitOfWorkManager(p.ResolveNamed<IDbContextFactory>(MY_DB_CONTEXT)))
       .As<IUnitOfWorkManager>();
```

만약 여러 개의 데이터베이스를 관리해야 한다면 아래와 같은 형태로 선언하면 된다.

```csharp
// Register UnitOfWorkManager.
builder.Register(p => new UnitOfWorkManager(p.ResolveNamed<IDbContextFactory>(MY_DB_CONTEXT),
                                            p.ResolveNamed<IDbContextFactory>(ANOTHER_DB_CONTEXT)))
       .As<IUnitOfWorkManager>();
```

### `IUnitOfWork`

`IUnitOfWork` 인터페이스는 `INSERT`, `UPDATE`, `DELETE` 등과 같은 데이터베이스 트랜잭션을 직접적으로 담당한다. 따라서, `BeginTransaction`, `SaveChanges`, `Commit`, `Rollback` 등과 같은 메소드를 제공한다.

```csharp
// ProductQueryManager performs INSERT/UPDATE/DELETE actions.
public class ProductQueryManager
{
  private readonly IUnitOfWorkManager _uowm;
  private readonly IProductRepository _product;

  public ProductQueryManager(IUnitOfWorkManager uowm, IProductRepository product)
  {
    if (uowm == null)
    {
      throw new ArgumentNullException("uowm");
    }
    this._uowm = uowm;

    if (product == null)
    {
      throw new ArgumentNullException("product");
    }
    this._product = product;
  }

  // Adds a product into the table.
  public bool Add(Product product)
  {
    using (var uow = this._uowm.CreateInstance<MyDbContext>())
    {
      uow.BeginTransaction();

      try
      {
        this._productRepository.Add(product);
        uow.Commit();
        return true;
      }
      catch (Exception ex)
      {
        uow.Rollback();

        //
        // Do some error handling logic here.
        //

        return false;
      }
    }
  }

  // Updates a product on the table.
  public bool Update(Product product)
  {
    using (var uow = this._uowm.CreateInstance<MyDbContext>())
    {
      uow.BeginTransaction();

      try
      {
        this._productRepository.Update(product);
        uow.Commit();
        return true;
      }
      catch (Exception ex)
      {
        uow.Rollback();

        //
        // Do some error handling logic here.
        //

        return false;
      }
    }
  }

  // Deletes a product from the table.
  public bool Delete(Product product)
  {
    using (var uow = this._uowm.CreateInstance<MyDbContext>())
    {
      uow.BeginTransaction();

      try
      {
        this._productRepository.Delete(product);
        uow.Commit();
        return true;
      }
      catch (Exception ex)
      {
        uow.Rollback();

        //
        // Do some error handling logic here.
        //

        return false;
      }
    }
  }
}
```

만약 여러개의 데이터베이스를 관리해야 한다면, 아래와 같이 `using { ... }` 구문을 중첩 적용시켜 사용할 수 있다.

```csharp
// Adds a product into the table.
public bool Add(Product product, User user)
{
  using (var puow = this._uowm.CreateInstance<MyDbContext>())
  using (var uuow = this._uowm.CreateInstance<AnotherDbContext>())
  {
    puow.BeginTransaction();

    try
    {
      this._productRepository.Add(product);
      puow.Commit();
      return true;
    }
    catch (Exception ex)
    {
      puow.Rollback();

      //
      // Do some error handling logic here.
      //

      return false;
    }

    user.ProductId = product.ProductId;

    uuow.BeginTransaction();

    try
    {
      this._userRepository.Add(user);
      uuow.Commit();
      return true;
    }
    catch (Exception ex)
    {
      uuow.Rollback();

      //
      // Do some error handling logic here.
      //

      return false;
    }
  }
}
```

개인적으로는 이런 방법이 결코 좋지만은 않다고 보는데, 그것은 객체 지향 설계 방법론에서 귀에 딱지가 앉을 정도로 많이 들어본 [SOLID](http://en.wikipedia.org/wiki/SOLID_(object-oriented_design))의 [SRP (Single Responsiblity Principle)](http://en.wikipedia.org/wiki/Single_responsibility_principle) 원리를 무시하는 셈이다. 따라서, 이런 방법 보다는 `using` 구분을 분리시키거나, 아예 `Add()` 메소드 자체를 분리하는 것이 낫다.

지금까지 간단하게 **ECL** 라이브러리에 대해 알아봤다. 이미 위에서 언급한 바와 같이 이 라이브러리를 사용하게 도면 사무실에서 반복작업에 들였던 시간들을 굉장히 줄일 수 있을 것이다.
