---
title: "애저 로직 앱의 웹훅 기능 사용시 알아두면 좋은 소소한 팁"
date: "2017-05-30"
slug: notes-for-logic-apps-when-using-webhook-actions
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure Logic Apps
- Webhook
fullscreen: false
cover: ""
---

[애저 로직 앱](https://azure.microsoft.com/en-us/services/logic-apps/)은 애저 서비스를 이용할 때 활용할 수 있는 두 가지 [서버리스 서비스](http://blog.aliencube.org/ko/2016/06/23/serverless-architectures/) 중 하나이다. 물론 다른 하나는 [애저 펑션](https://azure.microsoft.com/en-us/services/functions/)이다. 로직 앱은 API를 기반으로 하는 서비스를 하나의 워크플로우 안에서 조율해주는 일종의 오케스트레이션 앱이라고 할 수 있다. 따라서, 수많은 서비스를 연결하기 위한 커넥터를 제공하는데, 그 중 하나가 웹훅(Webhook) 커넥터이다. 이 포스트에서는 이 웹훅 커넥터를 사용할 때 알고 있으면 좋을만한 몇가지 팁에 대해 간단히 언급하고자 한다.

## 웹훅이란?

웹훅은 일종의 API로, 특정 엔드포인트를 등록해 놓으면 어떤 이벤트가 발생했을 때 이 등록된 엔드포인트로 페이로드(Payload)를 보내는 역할을 한다. 여기서 몇 가지 짚어볼 포인트가 있다.

- 웹훅을 이용하기 위해서는 일단 어딘가에 등록을 해야 한다. 이를 섭스크립션(Subscription)이라고 한다.
- 섭스크립션 과정에서 콜백(Callback) URL을 지정하는데, 이 콜백 URL은 나중에 이벤트가 발생했을 경우 호출하는데 쓰인다.
- 콜백 URL을 호출하면서 데이터를 함께 실어 보내는데, 이를 페이로드라고 한다.
- 더이상 웹훅이 필요없을 경우 또는 유효하지 않을 경우 섭스크립션을 해제한다. 이를 언섭스크립션(Unsubscription)이라고 한다.

뭔가 말이 복잡한데, 깃헙과 슬랙의 예를 들어보자. 깃헙에서 코드 커밋이 발생할 경우 이를 슬랙의 특정 채널에 푸시하는 상황이라고 가정해 본다면, 아래와 같은 상황을 상상해보자.

- 슬랙에서 깃헙의 커밋 이벤트에 섭스크립션한다.
- 섭스크립션 과정에서 슬랙의 특정 API 엔드포인트를 제공한다. 이것이 바로 콜백 URL이다.
- 깃헙에서 커밋 이벤트가 발생하면, 이제 이 콜백 URL을 통해 슬랙으로 데이터를 보낸다. 이 데이터가 페이로드이다.
- 더이상 슬랙과 연동이 필요없다면 깃헙의 커밋 이벤트에 대한 섭스크립션을 해제한다. 이것이 언섭스크립션이다. 이 과정에서 슬랙의 API 엔드포인트를 깃헙에서 삭제한다.

애저 로직 앱에서도 비슷한 과정을 거친다. 어떤 모습일까?

## 로직앱 웹훅 액션

로직앱 웹훅 액션은 아래와 같이 검색해서 등록할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/notes-for-logic-apps-when-using-webhook-actions-01.png)

웹훅 액션을 선택하면 아래와 같은 입력 화면이 나오는데, 이를 하나 하나 짚어보도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/notes-for-logic-apps-when-using-webhook-actions-02.png)

1. 필수 입력 항목은 아래 다섯 가지이다. 이 포스트를 쓰는 시점에서는 마치 `Subscribe - Method`와 `Subscribe - URI`만 필수 입력 항목인 것처럼 되어 있지만, 사실 아래 다섯 항목을 다 입력해야한다.
    
    - `Subscribe - Method`
    - `Subscribe - URI`
    - `Subscribe - Body`
    - `Unsubscribe - Method`
    - `Unsubscribe - URI`
2. `Subscribe - Method`와 `Unsubscribe - Method`는 무조건 `POST`만 허용한다. 위 그림처럼 `POST`가 아닌 `GET` 같은 다른 메소드로 지정하면 로직 앱을 실행할 때 아래와 같은 에러메시지를 보게 될 것이다. `POST` 말고도 다른 메소드를 선택할 수 있게 되어 있긴 하지만 여기에 낚이지 말도록 하자.
    
    ![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/notes-for-logic-apps-when-using-webhook-actions-03.png)
    
3. `Subscribe - Body`는 콜백 URL을 실어 보내기 위해 반드시 필요하다. 기본적으로 JSON 포맷의 페이로드를 사용한다. 따라서 위의 그림과 같이 `@{listCallbackUrl()}` 값을 반드시 페이로드에 포함시켜야 한다.
    
4. 로직앱 자체 URL도 그렇지만 콜백 URL도 마찬가지로 SAS 토큰이 필요하다. 이 SAS 토큰이 인증을 대신하므로 별도의 인증 관련 헤더가 필요하지 않다. 즉 다시 말해서 `Authorization` 헤더가 필요하지 않다. 만약 로직 앱 URL 또는 콜백 URL을 호출할 때 아래와 같이 `Authorization` 헤더를 포함시키면 아래와 같이 `DirectApiAuthorizationRequired` 에러가 발생한다.
    
    ![](https://sa0blogs.blob.core.windows.net/aliencube/2017/05/notes-for-logic-apps-when-using-webhook-actions-04.png)
    
5. 하나의 로직 앱 안에서 이 웹훅 액션을 만나면 우선 섭스크립션을 수행하고 콜백 URL이 호출될 때 까지 기다린다. 최대 90일까지 기다릴 수 있다. 콜백 URL은 반드시 `POST` 메소드로만 호출이 가능하다.
    
6. 콜백 URL이 호출될 때 받은 페이로드를 웹훅이 받은 응답 메시지로 간주한다. 예를 들어 로직 앱에서 아래 애저 펑션을 섭스크립션한다고 가정하자. 애저 펑션은 그대로 콜백 URL로 페이로드를 실어 보낸다. 아래 코드만 놓고 보면 웹훅은 최초 로직 앱에서 보내온 페이로드를 그대로 반환하는 것처럼 보이지만 실제로는 `productId` 대신 `objectId`로 바뀐 다른 페이로드를 선택한다.
    
    ```
    dynamic data = await req.Content.ReadAsAsync<object>();
    var serialised = JsonConvert.SerializeObject((object)data);
    
    using (var client = new HttpClient())
    {
      var payload = JsonConvert.SerializeObject(new { objectId = (int) data.productId });
      var content = new StringContent(payload);
      await client.PostAsync((string) data.callbackUrl, content);
    }
    
    return req.CreateResponse(HttpStatusCode.OK, serialised);
    
    ```
    
7. 콜백이 성공하건 아니건 상관없이 일단 콜백이 호출되면 그 당시 페이로드가 바로 웹훅의 응답 메시지가 된다.
    
8. 콜백이 호출되고 난 후에야 비로소 다음 액션으로 이동한다. 이 때 후속 액션에서 사용하는 웹훅의 응답 메시지는 앞서 서술한 바와 같이 콜백이 호출될 때 받은 페이로드이다.
    
9. 언섭스크립션은 로직 앱의 실행을 취소할 때 또는 90일이 지나서 타임아웃이 일어날 때 실행된다. 일종의 가비지 콜렉터 기능을 한다고 생각하면 좋다.
    

지금까지 애저 로직 앱에서 사용하는 웹훅 액션에 대해 간략하게 짚어 보았다. 아직 충분히 문서화가 이루어져 있지 않으므로 위와 같은 사항을 잘 기억해두었다가 웹훅 액션을 사용하면 삽질을 좀 더 줄일 수 있을 것이다.
