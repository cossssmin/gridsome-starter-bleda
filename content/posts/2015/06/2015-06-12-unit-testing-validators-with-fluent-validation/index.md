---
title: "FluentValidation 라이브러리 유닛 테스트"
date: "2015-06-12"
slug: unit-testing-validators-with-fluent-validation
description: ""
author: Justin-Yoo
tags:
- dotnet
- fluent-assertions
- fluent-validation
- nunit
- unit-testing
fullscreen: false
cover: ""
---

[지난 포스트](http://blog.aliencube.org/ko/2015/06/04/validating-asp-net-mvc-models-using-fluentvalidation-library/)에서 간단하게 소개했던 [FluentValidation](https://github.com/JeremySkinner/FluentValidation) 라이브러리는 유효성 검사 자체를 손쉽게 해 줄 수 있게끔 도와주기도 하지만, 그 유효성 검사 로직 자체를 테스트할 수 있기 쉽게도 되어 있다. 이번 포스트에서는 이 FluentValidation 라이브러리를 활용하여 어떻게 유닛테스트를 진행할 수 있는지에 대해 알아보기로 한다. 여기에 쓰인 코드는 아래 리포지토리에서 확인할 수 있다.

- [https://github.com/devkimchi/FluentValidation-Sample](https://github.com/devkimchi/FluentValidation-Sample)

> 1. [FluentValidation 라이브러리를 이용한 ASP.NET MVC 모델 유효성 검사](http://blog.aliencube.org/ko/2015/06/04/validating-asp-net-mvc-models-using-fluentvalidation-library/)
> 2. **FluentValidation 라이브러리 유닛 테스트**
> 3. [FluentValidation 제어 역전 혹은 의존성 주입 설정](http://blog.aliencube.org/ko/2015/06/16/setting-up-fluent-validation-in-ioc-controller/)

앞서 작성했던 `RegisterViewModelValidator` 클라스는 `AbstractValidator<T>` 추상 클라스를 상속 받아 작성한 것이다. 이 `AbstractValidator<T>` 추상 클라스는 `IValidator` 인터페이스를 구현한 것이므로 이를 이용하여 테스트를 진행하면 된다. [NUnit](http://nunit.org) 테스트 프레임워크와 [FluentAssertions](https://github.com/dennisdoomen/fluentassertions) 라이브러리를 이용하면 아래와 같이 유닛 테스트 코드를 작성할 수 있다.

```csharp
[TestFixture]
public class RegisterModelValidatorTest
{
  private IValidator _validator;

  [SetUp]
  public void Init()
  {
    this._validator = new RegisterViewModelValidator();
  }

  [TearDown]
  public void Cleanup()
  {
  }

  [Test]
  [TestCase("email", "password", "password", false)]
  [TestCase(null, "password", "password", false)]
  [TestCase("e@mail.com", "password", "password", true)]
  public void RegisterViewModel_Should_Be_Validated(string email, string password, string confirmPassword, bool expected)
  {
    var result = this._validator.Validate(new RegisterViewModel()
                                              {
                                                Email = email,
                                                Password = password,
                                                ConfirmPassword = confirmPassword,
                                              });
    result.IsValid.Should().Be(expected);
  }

```

위의 코드에서 볼 수 있다시피, `IValidator` 인터페이스에 구현된 `Validate()` 메소드를 통해 바로 유효성 검사를 진행할 수 있다. 물론, 이렇게 한꺼번에 유효성 검사를 할 수도 있고, 개별 속성을 하나하나 별도의 유효성 검사 테스트를 진행할 수도 있는데, FluentValidation 라이브러리는 자체적으로 Helper 클라스가 있어 다음과 같은 Helper 메소드를 제공한다.

- ShouldHaveValidationErrorFor
- ShouldNotHaveValidationErrorFor
- ShouldHaveChildValidator

따라서 위의 테스트 메소드에 추가적으로 덧붙이자면 아래와 같은 형태가 될 수 있다.

```csharp
[Test]
[TestCase("password", false)]
[TestCase(null, true)]
public void Password_Should_Be_Validated(string password, bool exceptionExpected)
{
  var validator = this._validator as RegisterViewModelValidator;
  try
  {
    validator.ShouldNotHaveValidationErrorFor(p => p.Password, password);
  }
  catch (ValidationTestException ex)
  {
    if (exceptionExpected)
    {
      Assert.Pass();
    }
    else
    {
      Assert.Fail(ex.Message);
    }
  }
  catch (Exception ex)
  {
    Assert.Fail(ex.Message);
  }
}

```

`RegisterViewModel` 객체는 `Password` 라는 속성을 갖고 있고 `RegisterViewModelValidator` 클라스는 `Password` 속성에 대한 유효성 검사 규칙을 갖고 있기 때문에, 위와 같이 테스트 코드를 작성하면 유효성 검사에 통과할 경우에는 테스트가 끝나지만, 유효성 검사에 실패하면 `ValidationTestException` 예외를 발생 시킨다. 이것이 예상된 오류이면 테스트는 성공한 것이고, 아니면 테스트는 실패한 것이 될 것이다. 마찬가지로 아래와 같은 형태로 하여 `ConfirmPassword` 속성의 유효성 검사를 진행할 수도 있다.

```csharp
[Test]
[TestCase("password", "password", false)]
[TestCase("password", "different", true)]
public void ConfirmPassword_Should_Be_Validated(string password, string confirmPassword, bool exceptionExpected)
{
  var validator = this._validator as RegisterViewModelValidator;
  try
  {
    validator.ShouldNotHaveValidationErrorFor(
        p => p.ConfirmPassword,
        new RegisterViewModel() { Password = password, ConfirmPassword = confirmPassword });
  }
  catch (ValidationTestException ex)
  {
    if (exceptionExpected)
    {
        Assert.Pass();
    }
    else
    {
        Assert.Fail(ex.Message);
    }
  }
  catch (Exception ex)
  {
    Assert.Fail(ex.Message);
  }
}

```

이렇게 간단하게 FluentValidation 라이브러리가 유효성 검사를 어떻게 진행하는지 테스트를 할 수 있는 방법에 대해 살펴 보았다. [다음 포스트](http://blog.aliencube.org/ko/2015/06/16/setting-up-fluent-validation-in-ioc-controller/)에서는 이 라이브러리를 IoC 컨테이너에서 어떻게 활용할 것인지에 대해 알아보도록 하자.
