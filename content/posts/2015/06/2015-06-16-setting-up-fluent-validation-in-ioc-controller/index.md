---
title: "FluentValidation 제어 역전 혹은 의존성 주입 설정"
date: "2015-06-16"
slug: setting-up-fluent-validation-in-ioc-controller
description: ""
author: Justin-Yoo
tags:
- dotnet
- autofac
- dependency-injection
- di
- fluent-validation
- inversion-of-control
- ioc
fullscreen: false
cover: ""
---

[지난 포스트](http://blog.aliencube.org/ko/2015/06/12/unit-testing-validators-with-fluent-validation/)에서는 [FluentValidation](https://github.com/JeremySkinner/FluentValidation) 라이브러리를 이용하여 유효성 검사 로직에 대해 어떻게 유닛테스트를 진행하는지에 대하여 간단하게 알아 보았다. 이번 포스트에서는 이 FluentValidation 라이브러리를 아예 IoC 콘테이너에 넣어서 좀 더 깔끔한 코드를 유지하는 방법에 대해 논의해 보기로 한다. 여기에 쓰인 코드는 아래 리포지토리에서 확인할 수 있다.

- [https://github.com/devkimchi/FluentValidation-Sample](https://github.com/devkimchi/FluentValidation-Sample)

> 1. [FluentValidation 라이브러리를 이용한 ASP.NET MVC 모델 유효성 검사](http://blog.aliencube.org/ko/2015/06/04/validating-asp-net-mvc-models-using-fluentvalidation-library/)
> 2. [FluentValidation 라이브러리 유닛 테스트](http://blog.aliencube.org/ko/2015/06/12/unit-testing-validators-with-fluent-validation/)
> 3. **FluentValidation 제어 역전 혹은 의존성 주입 설정**

## Autofac을 이용한 의존성 주입

IoC 콘테이너 라이브러리들은 여러가지가 있겠지만, 이 글에서는 [Autofac](http://autofac.org)을 이용한다. `Global.asax.cs` 파일의 `Application_Start()` 메소드를 아래와 같이 수정한다.

```csharp
private void Application_Start(object sender, EventArgs e)
{
  ...

  DependencyConfig.RegisterDependencies();
}

```

위에서 확인할 수 있다시피 기존에 들어 있던 `FluentValidationModelValidatorProvider.Configure()` 메소드가 없어지고 대신 `DependencyConfig.RegisterDependencies()` 메소드가 들어간 것을 확인할 수 있다. 아직 위에 언급한 `DependencyConfig.RegisterDependencies()` 메소드는 아직 구현이 안 된 상태이므로, 아래와 같이 `App_Start` 디렉토리 아래에 구현한다.

```csharp
public static class DependencyConfig
{
  public static void RegisterDependencies()
  {
    var builder = new ContainerBuilder();

    builder.RegisterModule(new AutofacWebTypesModule());

    RegisterValidators(builder);
    RegisterControllers(builder);

    var container = builder.Build();

    DependencyResolver.SetResolver(new AutofacDependencyResolver(container));

    RegisterValidationProviders(container);
  }

  private static void RegisterValidators(ContainerBuilder builder)
  {
    builder.RegisterType<RegisterViewModelValidator>()
           .Keyed<IValidator>(typeof(IValidator<RegisterViewModel>))
           .As<IValidator>();
  }

  private static void RegisterControllers(ContainerBuilder builder)
  {
    builder.RegisterControllers(Assembly.GetExecutingAssembly()).PropertiesAutowired();
  }
}

```

위의 `RegisterDependencies()` 메소드를 보면 나머지는 기본적인 `Autofac`의 사용법이라서 여기서는 다루지 않겠다. 그러나 `RegisterValidators()` 메소드와 `RegisterValidationProviders()` 메소드를 주목하도록 하자. `RegisterValidators()` 메소드는 유효성 검사를 위해 이미 정의해 놓은 Validator 클라스들을 등록하는 것이고, `RegisterValidationProviders()` 메소드는 유효성 검사를 위해 `Global.asax.cs`의 `Application_Start()` 메소드에 들어있던 `FluentValidationModelValidatorProvider.Configure()` 메소드를 대체하는 것이다. 그 내용은 아래와 같다.

## 유효성 검사 모듈 등록

```csharp
private static void RegisterValidationProviders(IContainer container)
{
  ModelValidatorProviders.Providers.Clear();
  DataAnnotationsModelValidatorProvider.AddImplicitRequiredAttributeForValueTypes = false;
  var fvmvp = new FluentValidationModelValidatorProvider(new ValidatorFactory(container))
              {
                AddImplicitRequiredValidator = false,
              };
  ModelValidatorProviders.Providers.Add(fvmvp);
}

```

- 첫번째 라인은 기존에 유효성 검사를 위해 등록했던 모든 모듈들을 삭제하라는 것이다. 혹시나 메모리에 남아있을 수 있는 찌꺼기들을 제거하는 것이다.
- 두번째 라인은 FluentValidation 대신 DataAnnotations 모델 유효성 검사를 암시적으로 수행할 것인지를 설정하는 것이다. `false` 값을 주어 명시적으로 수행하도록 하자.
- 세번째 라인은 이제 FluentValidation 유효성 검사 모듈을 초기화 시키는 부분이다. 마찬가지로 `false` 값을 세팅하는 것으로 명시적으로 FluentValidation 유효성 검사를 수행하게끔 하자.
- 마지막 라인은 방금 초기화 시켜놓은 모듈을 유효성 검사에 포함시키는 부분이다.

여기서 `ValidatorFactory` 클라스를 볼 수 있는데, 이 클라스의 내용은 아래와 같다.

```csharp
public class ValidatorFactory : ValidatorFactoryBase
{
  private readonly IContainer container;

  public ValidatorFactory(IContainer container)
  {
    this.container = container;
  }

  public override IValidator CreateInstance(Type validatorType)
  {
    var validator = container.ResolveOptionalKeyed<IValidator>(validatorType);
    return validator;
  }
}

```

즉 앞서 `RegisterValidators()` 메소드를 통해 등록해 놓은 모든 유효성 검사 클라스들을 여기서 활성화 시키는 것이다. 모든 유효성 검사 클라스들은 `IValidator` 인터페이스를 구현하게 되므로 이것이 가능해진다. 사실 이 부분은 바로 `RegisterViewModel` 클라스 선언시 함께 지정해 주어야 할 `ValidatorAttribute` 속성 클라스를 대체하는 것이기도 하다. 따라서, 이 `ValidatorFactory` 클라스를 선언했다면, 실제 `RegisterViewModel` 클라스의 속성 클라스로 지정한 `[Validator(typeof(RegisterViewModelValidator))]` 부분은 삭제해야 한다.

지금까지 `Autofac` 라이브러리를 이용하여 유효성 검사 모듈을 제어 역전 방식을 통해 주입시키는 것에 대해 알아보았다. 다음 포스트에서는 Web API에서 이것을 어떻게 적용시킬 수 있는지에 대해 알아보도록 하자. 하지만, FluentValidation 라이브러리가 아직까지는 Web API에 대해서는 제약사항이 더 많은 편이다. 물론 하려고 하면 되겠지만, 수많은 꼼수들을 사용해야 해서 타산이 맞질 않는다. 라이브러리 제작자인 Jeremy Skinner는 현재 Web API 2.x 버전을 지원하기 보다 [다음 버전의 ASP.NET MVC 6 쪽에서 Web API 지원을 강화할 계획](https://github.com/JeremySkinner/FluentValidation/issues/80)이라고 밝히고 있다. 따라서, Web API 관련 사용자 입력 데이터 유효성 검사는 [@styletigger](https://twitter.com/styletigger) 님께서 작성하신 포스트 [선언적 코드를 사용한 ASP.NET Web API 데이터 검사](https://justhackem.wordpress.com/2015/05/09/web-api-validation/)를 참고하도록 하자.
