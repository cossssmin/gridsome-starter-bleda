---
title: "Entity Framework 커넥션 스트링 가변적으로 구성하기"
date: "2013-09-02"
slug: setting-up-connection-string-for-entity-framework-dynamically
description: ""
author: Justin-Yoo
tags:
- dotnet
- connection-string
- entity-framework
- entity-connection
fullscreen: false
cover: ""
---

Entity Framework (EF) 은 닷넷 어플리케이션 개발시 사용할 수 있는 ORM 도구들 중 하나이다. 다른 ORM 도구들에 비해 러닝커브도 적을 뿐 아니라 사용이 꽤 직관적이기 때문이다. 다만, 한가지 불편한 점이 있다면 데이터베이스 커넥션 스트링이 너무 길다는 것. 보통 `web.config` 혹은 `app.config`에 들어가는 EF 커넥션 스트링은 대략 아래와 같은 형태이다.

```xml
<connectionStrings>
  <add name="ApplicationDataContext"
       connectionString="metadata=res://*/ApplicationDataContext.csdl|res://*/ApplicationDataContext.ssdl|res://*/ApplicationDataContext.msl;provider=System.Data.SqlClient;provider connection string=&quot;data source=(LocalDB)v11.0;attachdbfilename=|Data Directory|AdventureWorks.mdf;UserId=username;Password=passwordintegrated security=False;connect timeout=30;MultipleActiveResultSets=True;App=EntityFramework&quot;"
       providerName="System.Data.EntityClient" />
</connectionStrings>

```

이렇게 너무 커넥션 스트링 부분이 너무 길다보니 한눈에 들어오지도 않을 뿐더러, 상황에 따라 적절하게 서버가 바뀐다거나 데이터베이스가 바뀐다거나 하는 경우에는 수정하기가 쉽지 않다. 하지만, `.edmx` 파일을 이용해 EF를 구성할 경우 세 가지의 서로 다른 인자를 받아들이는 생성자가 생기는데, 그중 하나는 이 커넥션 스트링을 유연하게 구성할 수 있는 방법을 제시한다. 아래는 `.edmx` 파일을 이용하여 생성한 EF 데이터 콘텍스트의 생성자들이다.

```csharp
public partial class ApplicationDataContext : DbContext
{
  // Initialises a new instance of the ApplicationDataContext object.
  public ApplicationDataContext()
  {
    ...
  }

  // Initialises a new instance of the ApplicationDataContext object
  // with the given connection string.
  public ApplicationDataContext(string connectionString)
  {
    ...
  }

  // Initialises a new instance of the ApplicationDataContext object
  // with the given entity connection instance.
  public ApplicationDataContext(EntityConnection conn)
  {
    ...
  }
}

```

맨 아래 생성자를 보면 `EntityConnection` 인스턴스를 인자로 받아 EF 데이터 콘텍스트를 생성하는 것을 볼 수 있다. 바로 이 생성자를 이용하여 상황에 따라 유연하게 커넥션 스트링을 작성할 수 있다. 아래 코드는 이 방법을 이용하는 테스트 케이스 메소드이다.

```csharp
[Test]
[TestCase("serverName", "dbName", "username", "password", "System.Data.SqlClient", true)]
public void TestDatabaseConnection_SendParameters_GetDatabaseConnected(string serverName, string dbName, string username, string password, string provider, bool connected)
{
  var sqlBuilder = new SqlConnectionStringBuilder();
  sqlBuilder.DataSource = serverName;
  sqlBuilder.InitialCatalog = dbName;
  sqlBuilder.Username = username;
  sqlBuilder.Password = password;
  sqlBuiler.IntegratedSecurity = false;

  var efBuilder = new EntityConnectionStringBuilder();
  efBuilder.Provider = provider;
  efBuilder.ProviderConnectionString = sqlBuilder.ToString();
  efBuilder.MetaData = String.Format(@"res://*/{0}.csdl|res://*/{0}.ssdl|res://*/{0}.msl", "ApplicationDataContext");

  using (var conn = new EntityConnection(efBuilder.ToString()))
  {
    conn.Open();
    Assert.AreEqual(connected, conn.State == ConnectionState.Open);
    conn.Close();
  }
}

```

위의 코드에서 알 수 있다시피,

1. `SqlConnectionStringBuilder` 인스턴스를 통해 기본적인 커넥션 스트링을 만들고,
2. 그것을 다시 `EntityConnectionStringBuilder` 인스턴스로 한 번 더 감싸준 후에,
3. 이것을 `EntityConnection` 객체로 보내 데이터베이스 커넥션을 완성한다.
4. 이렇게 만들어진 `EntityConnection` 인스턴스는 맨 위의 `ApplicationDataContext(EntityConnection conn) { ... }` 생성자의 인자로 쓰여 데이터베이스 트랜잭션을 위한 EF 인스턴스 초기화를 가능하게 한다.

위의 테스트 코드에서 알 수 있다시피, `web.config` 또는 `app.config` 사용시 굳이 기나긴 커넥션 스트링을 사용하는 것 보다는 의미있는 데이터 – 서버명, DB명, 유저네임, 패스워드 등 – 를 `<appSettings>` 섹션에 넣어두고 그것을 상황에 따라 가변적으로 호출하여 커넥션을 만드는 것이 개발자 관점에서는 더욱 수월한 일이 아닐까 한다.

참조: [EntityConnectionStringBuilder Class](http://msdn.microsoft.com/en-us/library/system.data.entityclient.entityconnectionstringbuilder.aspx)
