---
title: "JSON Web Token(JWT)으로 Session 객체를 대체할 수 있을까?"
date: "2015-02-12"
slug: can-json-web-token-jwt-alter-session-object
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- Authentication
- JSON Web Token
- JWT
- MVC 5
- WIF
fullscreen: false
cover: ""
---

JSON Web Token(JWT)은 앱 개발에 있어서 서버와 정보를 주고받기 위해 쓰이는 하나의 공통 인증 규약으로 IEFT 네트워킹 그룹에서 그 [규약](http://tools.ietf.org/html/draft-jones-json-web-token-10)을 지정하고 관리하고 있다. 발음은 `jot`좉으로 한다(...) 다른 인증 토큰들과 큰 차이점은 없지만, JSON 객체를 생성하고 그걸 암호화 시킨다는 점이 뚜렷한 차별점이라고 할 수 있겠다. 보통 이 JWT를 이용해서 서버와 정보를 주고 받을 때에는 HTTP 리퀘스트 헤더에 이 토큰을 넣어서 서버에서 헤더를 분석한 후 처리를 진행한다. 따라서, 헤더 정보만 충분하다면 별도의 인증과정을 거치지 않아도 이 JWT 토큰이 그 역할을 대신한다고 볼 수 있다.

그렇다면, 이 JWT를 이용해서 웹 앱의 로그인/로그아웃 인증 정보를 관리할 수 있지 않을까? 웹에서는 보통 두가지 방법으로 로그인/로그아웃 인증 정보를 관리한다. 하나는 쿠키, 다른 하나는 세션. 쿠키는 클라이언트 컴퓨터에 정보를 저장하고, 세션은 서버 컴퓨터에 정보를 저장한다. 쿠키는 상대적으로 조작/위변조의 가능성이 높기 때문에 여러 가지 장치를 통해 쿠키 정보를 조작할 수 없게 혹은 조작하면 쓸모없어지게 만든다. 세션은 중간에 세션키를 가로채지 않는 이상 상대적으로 쿠키에 비해 안전한 편이지만, 서버의 로드밸런싱이라든가 하는 문제들을 해결하려면 꽤 많은 다른 작업들이 필요하다. 이럴 때 JWT와 쿠키를 이용하면 굳이 세션 객체에 의존하지 않아도 인증 정보를 관리할 수 있다.

아래는 ASP.NET MVC 웹사이트로 작성한 JWT 인증 예제 코드이다. 관련 코드는 이곳에서 확인할 수 있다.

- [https://github.com/devkimchi/JWT-Authentication](https://github.com/devkimchi/JWT-Authentication)

## JWT 생성하기

아래 코드를 위해서는 WIF의 확장기능인 [http://www.nuget.org/packages/System.IdentityModel.Tokens.Jwt](http://www.nuget.org/packages/System.IdentityModel.Tokens.Jwt) NuGet 패키지가 필요하다.

```csharp
var now = DateTime.UtcNow;
var tokenHandler = new JwtSecurityTokenHandler();
var symmetricKey = GetBytes("ThisIsAnImportantStringAndIHaveNoIdeaIfThisIsVerySecureOrNot!");
var tokenDescriptor = new SecurityTokenDescriptor
                          {
                            Subject = new ClaimsIdentity(new Claim[]
                                                             {
                                                               new Claim(ClaimTypes.Name, "DevKimchi"),
                                                               new Claim(ClaimTypes.Role, "User"),
                                                             }),
                            TokenIssuerName = "http://devkimchi.com",
                            AppliesToAddress = "http://jwt-sample.com",
                            Lifetime = new Lifetime(now, now.AddMinutes(30)),
                            SigningCredentials = new SigningCredentials(new InMemorySymmetricSecurityKey(symmetricKey),
                                                                        "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256",
                                                                        "http://www.w3.org/2001/04/xmlenc#sha256"),
                          };
var token = tokenHandler.CreateToken(tokenDescriptor);
var tokenString = tokenHandler.WriteToken(token);

var cookie = new HttpCookie(".JWTAUTH", tokenString) { HttpOnly = true, };
```

- `symmetricKey`는 인증 정보를 암호화하기 위한 키이다.
- `tokenDescriptor`는 IETF 규약에 맞게 JSON 객체를 생성하기 위한 객체이다. 기본적으로 로그인 사용자 정보, 토큰 발행 서버, 토큰 사용 서버, 토큰 유효기간, 토큰 암호화 방법 등을 지정한다. 이 정보를 이용하여 토큰을 만들고 (`token`) 암호화 시킨다 (`tokenString`).
- `cookie`에 이렇게 암호화된 토큰을 저장한다.

## `FormsAuthentication`을 이용한 추가 암호화

> 이 부분은 굳이 하지 않아도 상관 없는 부분이긴 하지만, 마음의 평안을 얻기 위해서는 해도 된다.

기본적으로 ASP.NET MVC 웹 앱은 `FormsAuthentication` 객체를 이용하여 쿠키에 인증정보를 저장한다. 쿠키 정보 자체가 암호화되어 있고 서버에서 쿠키 내용을 복호화해서 사용하기 때문에, 쿠키의 위변조 위험에서 비교적 자유롭다. 하지만, 인증에 필요한 최소한의 정보만을 저장하고 있기 때문에, 로그인 유저의 권한 정보라든가 하는 추가 정보 저장을 위해서는 약간의 커스터마이징이 필요하다.

```csharp
var ticket = new FormsAuthenticationTicket(
                 1,
                 model.Email,
                 now,
                 now.AddMinutes(30),
                 model.RememberMe,
                 tokenString,
                 FormsAuthentication.FormsCookiePath);

var encryptedTicket = FormsAuthentication.Encrypt(ticket);
var cookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket) { HttpOnly = true, };
```

- `ticket`에 `FormsAuthentication`에 필요한 티켓을 생성한다. 그리고 이것을 암호화하여 `encryptedTicket`에 보낸다.
- `cooke`에 이렇게 암호화된 티켓을 저장한다.

## `Global.asax`에서 인증 정보 확인

ASP.NET의 [HttpApplication 라이프사이클 파이프라인](https://msdn.microsoft.com/en-us/library/System.Web.HttpApplication(v=vs.110).aspx#remarksToggle)을 보면 리퀘스트를 받자마자 초반에 인증 정보를 확인하는 이벤트인 `AuthenticationRequest`를 `Application_AuthenticationRequest` 이벤트 핸들러 메소드에서 처리한다. 이 메소드를 아래와 같이 구성한다.

```csharp
var jwtCookie = Request.Cookies[".JWTAUTH"];
var userData = jwtCookie.Value;

var tokenHandler = new JwtSecurityTokenHandler();
var symmetricKey = GetBytes("ThisIsAnImportantStringAndIHaveNoIdeaIfThisIsVerySecureOrNot!");
var validationParameters = new TokenValidationParameters()
                           {
                             ValidAudience = "http://jwt-sample.com",
                             ValidIssuer = "http://devkimchi.com",
                             IssuerSigningToken = new BinarySecretSecurityToken(symmetricKey)
                           };
SecurityToken securityToken;
var principal = tokenHandler.ValidateToken(userData, validationParameters, out securityToken);

Context.User = principal;
```

- `symmetricKey`는 위에서 지정한 것과 같은 동일한 키이다. 이것으로 암호화된 토큰을 복호화시킬 수 있다.
- `validationParameters`는 JWT를 검증하기 위한 키값들이다. `ValidAudience`와 `ValidIssuer` 그리고, `IssuerSigningToken` 값이 일치해야만 유효한 토큰으로 인정받을 수 있다.
- `principal` 변수에 유효성 검사를 마친 인증 정보를 저장하고 이를 웹 앱의 사용자 인증 정보로 대체한다.

만약, `FormsAuthentication` 객체를 사용한다면 추가적인 작업이 더 필요하다.

```csharp
var authCookie = Request.Cookies[FormsAuthentication.FormsCookieName];
var authTicket = FormsAuthentication.Decrypt(authCookie.Value);
var userData = authTicket.UserData;
```

이렇게 해서 JWT를 이용한 사용자 인증 처리에 대해 간단히 살펴보았다. 의외로 굉장히 쉽게 구현 가능하고 또한 보안적인 문제도 기존의 방법들과 별반 차이가 없어서 충분히 활용 가능한 방법이 아닐까 싶다. 특히나, API를 제공하는 앱 서버가 모바일 앱, 데스크탑 앱, 웹 앱 등을 모두 지원해야 한다면 이와 같은 방법을 통해 좀 더 손쉽게 적용 가능하지 않을까 생각한다.
