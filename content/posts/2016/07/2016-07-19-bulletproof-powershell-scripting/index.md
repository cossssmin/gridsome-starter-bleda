---
title: "방탄 파워셸 스크립팅"
date: "2016-07-19"
slug: bulletproof-powershell-scripting
description: ""
author: Justin Yoo
tags:
- ARM & DevOps on Azure
- PowerShell
- Error Handling
fullscreen: false
cover: ""
---

파워셸로 스크립트를 작성하다보면 흔히 만나는 여러 가지 상황들이 있다. 하나는 파란 바탕 화면에 시뻘건 에러 메시지들, 다른 하나는 보여주고 싶지 않은 수많은 실행 결과 값들. 어떻게 하면 이런 것들을 안보이게 하거나 최소한도로 줄일 수 있을까? 이 포스트에서는 몇가지 트릭들을 통해 깔끔하게 파워셸 스크립트를 작성하는 방법에 대해 논의해 보도록 하자.

## 실행 결과 메시지 감추기

파워셸은 원천적으로 실행한 후 결과값을 화면에 보여주게끔 구현을 해 놓았다. 아래 파워셸 커맨들릿을 한 번 실행시켜 보도록 하자.

https://gist.github.com/justinyoo/45efc5a1c907d44c716b0b6738b00b5e

이 커맨들릿의 실행 결과는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-01.png)

`Account`, `TenantId`, `SubscriptionId`와 같은 민감한 정보들이 화면에 보이는데, 보안에 신경을 많이 쓰는 곳이라면 이러한 정보들을 화면에서 보이게 하고 싶지 않을 것이다. 그렇다면 어떻게 해야 할까? 이번에는 아래와 같이 커맨들릿을 호출해보자.

https://gist.github.com/justinyoo/835f113db52321bbffdedf8e42465dd7

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-02.png)

결과값이 화면에서 사라졌다! `$result` 라는 변수를 선언해서 해당 결과 값을 그쪽으로 돌려버린 것이다. 실제로 아래와 같이 `$result` 값을 호출하면 그제서야 결과값을 화면에서 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-03.png)

이것이 가능한 이유는 대부분의 파워셸 커맨들릿은 [`PSObject`](https://msdn.microsoft.com/en-us/library/system.management.automation.psobject.aspx) 타입의 인스턴스를 반환하면서 이를 화면에 출력하기 때문이다. 따라서, 위의 예와 같이 `$result`와 같은 임시 변수를 지정해서 반환값을 받아주면 화면에 나타날 일이 없다. 또한 이렇게 생성한 변수는 strongly-typed 인스턴스이기 때문에 필요한 경우 `$result.Context.Subscription.SubscriptionId`와 같은 형태로 필요한 값을 받아다 사용할 수 있어서 훨씬 더 편하다.

보안상 좀 더 안전하게 아예 `$result` 인스턴스까지 없애고 싶다면? 아래와 같이 하면 완전히 없앨 수 있다.

https://gist.github.com/justinyoo/30bd5421a8a9ae1cdd80c6240d85f527

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-04.png)

지금까지 파워셸 콘솔에서, 커맨들릿을 실행시킬 때 나오는, 불필요한 혹은 보안상 민감한 내용을 감추는 방법에 대해 알아보았다. ~~참 쉽죠?~~

## 에러 메시지 핸들링

이번에는 파워셸의 강력하고 무서운 파란 바탕 화면의 붉은색 에러메시지를 감춰보자. 감춘다기 보다는 제대로 핸들링 해 보도록 하자. 파워셸 에러 핸들링은 크게 두가지가 있어서 이 두가지를 적절히 섞어서 쓰면 된다.

### Try...Catch...Finally 블록

먼저 아래와 같이 이번엔 `Login-AzureRmAccount` 커맨들릿을 실행시켜 보자. 에러가 발생할 것이다.

https://gist.github.com/justinyoo/c2257d2846b7bc91eda26ad65b9adddc

서비스 계정으로 로그인하겠다고 했는데, 서비스 계정의 로그인 정보를 제공하지 않았으므로 당연히 아래와 같은 에러 화면을 뱉을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-05.png)

이 에러 메시지를 없애기 위해서는 간단하게 `try...catch...finally` 블록으로 아래와 같이 감싸주면 된다.

https://gist.github.com/justinyoo/5bc4458e540abed7c8ed9f473c72829d

이렇게 한 결과는 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-06.png)

한결 에러 메시지 처리가 깔끔해졌다. ~~참 쉽죠?~~

### ErrorAction 파라미터

`try...catch...finally` 블록을 사용하면 **대부분**의 에러 메시지들을 다 잡아낼 수 있다. 음? 대부분이라고? 그렇다, 전부 다 잡아낼 수는 없다. 아래 커맨들릿을 실행시켜 보자.

https://gist.github.com/justinyoo/590ee993ca89bb48bf667074d81b08bf

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-07.png)

어...어어? `try...catch` 블록에 잡히지 않는다! 이럴 때 바로 `-ErrorAction` 파라미터가 출동하면 어떨까?

https://gist.github.com/justinyoo/26502dbb1c1bfdeb88659e475d5c161f

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-08.png)

이제 `try...catch` 블록이 작동을 잘 한다.

### ErrorVariable 파라미터

`try...catch` 블록의 단점이 한가지 있다면 너무 길고 장황하다는 것. 일반적인 코딩이라면 원래 그렇게 하니까 그러려니 하겠는데, 스크립팅이라는 특성상 빠른 시간 안에 작성하고 결과를 확인해야 하다보니 이 방법은 뭔가 오버하는 느낌적 휠링. 이럴 때 `-ErrorVariable` 파라미터를 잘 활용하면 간단하게 에러 핸들링이 가능하다. 아래 커맨들릿을 실행시켜 보자.

https://gist.github.com/justinyoo/ecda76c53c8c421253c8e21ca69520e0

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-09.png)

에러가 발생하지 않았다면 분명히 `readme.txt` 파일을 읽어들여 그 결과를 화면에 출력해야 한다. 하지만, 출력을 못하는 것을 보니 에러가 생겼다는 것을 알 수 있는데, 우리는 `-ErrorVariable ex` 파라미터를 통해 에러를 `$ex` 라는 변수로 돌린 것을 확인할 수 있다. 아래와 같이 `$ex[0].Exception.Message`를 확인하면 된다. ~~참 쉽죠?~~

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/bulletproof-powershell-scripting-10.png)

이런 식으로 `-ErrorAction`과 `-ErrorVariable` 파라미터를 잘 활용하면 굳이 `try...catch` 블록을 이용하지 않더라도 간단하게 에러 핸들링을 할 수 있다.

지금까지 깔끔한 파워셸 스크립트 작성을 위해 화면 출력 제어, 에러 메시지 핸들링에 대해 알아보았다. 이정도만 해도 스크립트에서 발생하는 거의 대부분의 화면 출력 메시지를 90% 정도 줄일 수 있어서 실제 필요한 출력 내용에만 집중할 수 있다.
