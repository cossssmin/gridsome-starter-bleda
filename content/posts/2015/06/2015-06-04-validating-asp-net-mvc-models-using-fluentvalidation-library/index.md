---
title: "FluentValidation 라이브러리를 이용한 ASP.NET MVC 모델 유효성 검사"
date: "2015-06-04"
slug: validating-asp-net-mvc-models-using-fluentvalidation-library
description: ""
author: Justin Yoo
tags:
- ASP.NET/IIS
- DataAnnotations
- FluentValidation
- Model Binding
- Validation
fullscreen: false
cover: ""
---

ASP.NET MVC 웹 애플리케이션에서 사용자 입력값의 유효성을 검사하는 방법은 여러가지가 있겠지만, 보통은 [DataAnnodations](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations(v=vs.110).aspx) 방법을 이용한다. 그러나, 여기 소개하는 [FluentValidation](https://github.com/JeremySkinner/FluentValidation) 라이브러리를 이용하면 훨씬 더 편리하게 유효성 검사를 수행할 수 있다. 이 포스트에서는 이 FluentValidation 라이브러리를 소개하고, 이를 ASP.NET MVC 웹 애플리케이션과 Web API 애플리케이션에서 사용하는 방법, 유닛 테스트를 수행하는 방법, 그리고 IoC 콘트롤러에서 활용하는 방법에 대해 간단하게 논의해 보도록 하자. 여기에 쓰인 코드는 아래 리포지토리에서 확인할 수 있다.

- [https://github.com/devkimchi/FluentValidation-Sample](https://github.com/devkimchi/FluentValidation-Sample)

> 1. **FluentValidation 라이브러리를 이용한 ASP.NET MVC 모델 유효성 검사**
> 2. [FluentValidation 라이브러리 유닛 테스트](http://blog.aliencube.org/ko/2015/06/12/unit-testing-validators-with-fluent-validation/)
> 3. [FluentValidation 제어 역전 혹은 의존성 주입 설정](http://blog.aliencube.org/ko/2015/06/16/setting-up-fluent-validation-in-ioc-controller/)

## 전형적인 사용자 입력 유효성 검사

일반적으로 ASP.NET MVC 애플리케이션에서 사용자 입력에 대한 유효성 검사를 위해서는 바인딩 모델에 DataAnnotation 을 아래와 같은 식으로 추가한다.

```csharp
public class RegisterViewModel
{
  [Required]
  [DataType(DataType.EmailAddress)]
  [Display(Name = "Email")]
  public string Email { get; set; }

  [Required]
  [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
  [DataType(DataType.Password)]
  [Display(Name = "Password")]
  public string Password { get; set; }

  [DataType(DataType.Password)]
  [Display(Name = "Confirm password")]
  [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
  public string ConfirmPassword { get; set; }
}

```

위에서 확인할 수 있다 시피 `Required`와 `StringLength` 같은 속성클라스를 이용하여 해당 모델의 유효성 검사를 진행한다. 이를 이용하면 콘트롤러에서는 보통 이런 모양이 될 수 있다.

```csharp
[HttpPost]
public virtual async Task<ActionResult> Register(RegisterViewModel form)
{
  var vm = form;
  if (ModelState.IsValid)
  {
    vm.Validated = true;
  }
  return View(vm);
}

```

이렇게 하면 `ModelState.IsValid`을 확인하는 시점에서 이미 유효성 검사는 끝났다고 볼 수 있다. 이렇게 해도 아무런 문제가 없긴 하다만, 모델 바인딩 클라스를 만들면서 굉장히 번거로운 작업이 필요하다. 이 과정을 획기적으로 줄여줄 수 있는 것이 바로 FluentValidation library이다.

## FluentValidation 라이브러리로 변환

이제 FluentValidation 라이브러리를 설치해서 사용해 보도록 하자. NuGet 패키지를 다운로드 받아 설치한 후 아래와 같이 코드를 바꾸어 보자.

```csharp
[Validator(typeof(RegisterViewModelValidator))]
public class RegisterViewModel
{
  [Display(Name = "Email")]
  public string Email { get; set; }

  [DataType(DataType.Password)]
  [Display(Name = "Password")]
  public string Password { get; set; }

  [DataType(DataType.Password)]
  [Display(Name = "Confirm password")]
  public string ConfirmPassword { get; set; }
}

```

위에서 보는 바와 같이 바인딩 모델은 아주 간단하게 바뀌었다. 대신 `Validator`라는 속성 클라스를 추가한 것을 확인할 수 있는데, 이 속성 클라스의 정의는 아래와 같다.

```csharp
public class RegisterViewModelValidator : AbstractValidator<RegisterViewModel>
{
  public RegisterViewModelValidator()
  {
    RuleFor(x => x.Email)
      .NotNull().WithMessage("Required")
      .EmailAddress().WithMessage("Invalid email");

    RuleFor(x => x.Password)
      .NotNull().WithMessage("Required")
      .Length(6, 100).WithMessage("Too short or too long");

    RuleFor(x => x.ConfirmPassword)
      .NotNull().WithMessage("Required")
      .Equal(x => x.Password).WithMessage("Not matched");
  }
}

```

이렇게 `Validator` 정의를 별도의 클라스에 한꺼번에 몰아서 선언하고 이를 `Global.asax.cs`의 `Application_Start()` 메소드에서 초기화한다.

```csharp
public class MvcApplication : System.Web.HttpApplication
{
  protected void Application_Start()
  {
    ...

    FluentValidationModelValidatorProvider.Configure();
  }
}

```

이렇게 한 후 다시 콘트롤러에서 평소와 같이 `ModelState.IsValid` 속성을 호출하면 된다.

## Razor 뷰

그렇다면, 이에 대응하는 Razor 뷰는 어떻게 작성할까? 대략 아래와 같은 모습이 될 것이다.

```razor
@using (Html.BeginForm(MVC.Home.ActionNames.Register, MVC.Home.Name, FormMethod.Post))
{
  <div>
    @Html.LabelFor(m => m.Email)
    <div>
      @Html.TextBoxFor(m => m.Email, new Dictionary<string, object>() { { "placeholder", "Email" } })
      @Html.ValidationMessageFor(m => m.Email)
    </div>
  </div>
  <div>
    @Html.LabelFor(m => m.Password)
    <div>
      @Html.PasswordFor(m => m.Password, new Dictionary<string, object>() { { "placeholder", "Password" } })
      @Html.ValidationMessageFor(m => m.Password)
    </div>
  </div>
  <div>
    @Html.LabelFor(m => m.ConfirmPassword)
    <div>
      @Html.PasswordFor(m => m.ConfirmPassword, new Dictionary<string, object>() { { "placeholder", "Confirm Password" } })
      @Html.ValidationMessageFor(m => m.ConfirmPassword)
    </div>
  </div>
  <div>
    <div>
      <input type="submit" name="Submit" />
    </div>
  </div>
}

```

이후 실제로 웹사이트를 구동시킨 후 렌더링 된 HTML 코드는 아래와 같다.

```html
<form action="/Home/Register" method="post">
  <div>
    <label for="Email">Email</label>
    <div>
      <input data-val="true" data-val-email="Invalid email" data-val-required="Required" id="Email" name="Email" placeholder="Email" type="text" value="" />
      <span class="field-validation-valid" data-valmsg-for="Email" data-valmsg-replace="true"/>
    </div>
  </div>
  <div>
    <label for="Password">Password</label>
    <div>
      <input data-val="true" data-val-length="Too short or too long" data-val-length-max="100" data-val-length-min="6" data-val-required="Required" id="Password" name="Password" placeholder="Password" type="password" />
      <span class="field-validation-valid" data-valmsg-for="Password" data-valmsg-replace="true"/>
    </div>
  </div>
  <div>
    <label for="ConfirmPassword">Confirm password</label>
    <div>
      <input data-val="true" data-val-equalto="Not matched" data-val-equalto-other="*.Password" data-val-required="Required" id="ConfirmPassword" name="ConfirmPassword" placeholder="Confirm Password" type="password" />
      <span class="field-validation-valid" data-valmsg-for="ConfirmPassword" data-valmsg-replace="true"/>
    </div>
  </div>
  <div>
    <div>
      <input type="submit" name="Submit" />
    </div>
  </div>
</form>

```

이렇게 해서 FluentValidation 라이브러리로 유효성 검사를 대체하는 방법에 대해 알아보았다. 그렇다면 이러한 유효성 검사에 대한 것들을 어떻게 테스트를 할 수 있을까? [다음 포스트](http://blog.aliencube.org/ko/2015/06/12/unit-testing-validators-with-fluent-validation/)에서 알아보도록 하자. 60초 후에 돌아오겠습니다
