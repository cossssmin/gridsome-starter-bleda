---
title: "파워앱에서 네이버 지도 API 연동하기"
slug: building-powerapp-with-naver-map-api
description: "이 포스트에서는 파워앱을 개발할 때 네이버 지도 API를 연동하는 방법에 대해 알아봅니다. 네이버 지도 API는 파워앱에서 직접 사용할 수 없는 제약사항을 갖고 있는데, 이 제약사항을 해결하는 방법도 함께 논의합니다"
date: "2020-03-18"
author: Justin-Yoo
tags:
- azure-functions
- powerapps
- naver-map-api
- facade
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/building-powerapp-with-naver-map-api-00.png
fullscreen: true
---

[파워 앱][power apps]은 로우코드 혹은 제로코드 기반으로 빠르게 모바일 앱을 개발할 수 있는 플랫폼으로 굳이 높은 개발 지식을 갖고 있지 않아도 순식간에 업무에 필요한 앱을 개발할 수 있는 장점이 있다. 이와 함께 같은 [파워 플랫폼][power platform] 식구들 중 하나인 [파워 오토메이트][power automate]를 곁들인다면 훨씬 더 강력한 앱을 작성할 수 있다.

우연히 Microsoft MVP인 [Cana][mvp cana]님이 일하는 회사의 [유튜브 채널][youtube oms]에서 다른 MVP인 [Shane Young][mvp shane]이 정리한 [파워앱 관련 포스트][power apps shane]를 봤다. 이 포스트에서는 구글 맵 API를 [파워 앱][power apps]에 직접 연동시키는 것을 보여주는데 정말 손쉽게 구글 맵을 모바일 앱에 연동시킬 수 있었다.

그런데, 여기서 문득 한국에서는 구글 맵이 국내 법규상 반쪽짜리에 불과하기 때문에 그다지 유용한 서비스가 아니라는 것에 생각이 미쳤다. 그렇다면, 구글 맵 대신 네이버 맵을 쓰면 어떨까? 미우나 고우나 네이버는 한국에서 가장 널리 쓰이는 플랫폼이니 말이다.

그래서, 이 포스트에서는 정말 간단하게 네이버 맵 API를 [파워 앱][power apps]에 연동시키는 방법에 대해 알아보고자 한다.


## 네이버 맵 API의 특성 ##

네이버 맵 API 중에서 우리가 사용할 서비스는 [정적 맵 API][naver api static map] 서비스이다. 링크한 문서에 보면 `GET` 방식으로 호출하면 맵 이미지가 반환되는 아주 간단한 API이다. 그런데, 엔드포인트가 두 가지가 있다.

1. `/map-static/v2/raster`: 이는 헤더로 Client ID 값과 Client Secret 값을 보낸다.
2. `/map-static/v2/raster-cors`: 이는 쿼리스트링으로 Client ID 값을 보낸다.

[파워 앱][power apps]에서는 첫번째 방식과 같이 헤더를 이용할 수는 없고, 두번째 쿼리스트링 방식으로 사용해야 한다. 그런데, 여기서 문제가 한 가지 있다. 네이버 API를 사용할 때 반드시 안드로이드 패키지 이름 혹은 iOS 번들 ID를 입력하든가 혹은 웹서비스 URL을 입력해야 한다.

![][image-01]

이건 어느 클라우드 서비스 제공자든 비슷한 방식으로 등록하니 크게 문제가 없다. 다만, 세상에는 안드로이드나 iOS, 웹이 아닌 다른 형태의 앱들도 많기 때문에 보통은 저 웹서비스 URL은 일종의 앱 구분자로만 사용할 뿐 그 이상의 역할을 부여하지는 않는다. 그런데, 네이버 API에서는 이 웹서비스 URL을 리퍼러로 규정하기 때문에 [파워 앱][power apps] 같은 경우에는 네이버 지도 API를 직접 사용할 수 없다. 직접 사용하게 되면 아래와 같이 그냥 빈 이미지 만 보인다.

![][image-02]

이는 API 제공자의 정책이라서 사용자 입장에서는 반드시 따라줘야 하는 부분이다. 만약 [포스트맨][postman]을 사용해서 이 API를 호출한다면 아래 그림과 같이 `Referer` 헤더를 하나 직접 추가해 주면 된다.

![][image-03]

따라서, [파워 앱][power apps]에서 네이버 지도 API를 사용하기 위해서는 위 그림과 같이 어떻게 해서든 `Referer`를 헤더에 담아서 호출하면 되는 셈인데, 이런 작업은 [파워 앱][power apps] 자체로는 할 수 없고, 다만 퍼사드를 하나 추가하는 식으로 아키텍처를 변경해 주면 된다.


## 애저 펑션으로 퍼사드 만들기 ##

그럼 이 퍼사드는 어떻게 만들 수 있을까? 가장 손쉬운 방법이라고 한다면 [애저 펑션][az func]과 같은 서버리스 앱을 하나 만들어서 중간에 끼워 넣는 것이 될 것이다. 굳이 [애저 펑션][az func]을 사용하는 이유라고 한다면 여러 설정이 필요 없고 아주 간단한 코드만 끼워 넣으면 되기 때문이다. 그렇다면 그 코드는 어떤 모양이 될까? 아래 코드를 살펴보자.

https://gist.github.com/justinyoo/18966c960fa9b97fd7b264aa911f7420?file=naver-map-api-facade.cs&highlights=12,18

위 코드에서 볼 수 있다시피 18번 라인에 보면 `Referer` 헤더를 직접 집어 넣는 것으로 호출을 했다. 이렇게 한 후 이 애저 펑션 인스턴스를 로컬에서 실행시켜 보자. 그러면 아래와 같이 [포스트맨][postman]에서 실행이 가능하다.

![][image-04]

그렇다면 이제 이 [애저 펑션][az func] 엔드포인트 URL을 [파워 앱][power apps]에 적용시켜 보자.

![][image-05]

이제 네이버 지도를 [파워 앱][power apps]에서 잘 볼 수 있게 됐다! 이제 [애저 펑션][az func] 인스턴스에 배포한 후 실제 인스턴스 이름을 `localhost:7071`과 바꿔주면 된다.

---

지금까지 [파워 앱][power apps]에 외부 API를 연동할 때 직접 연동이 불가능한 경우 [애저 펑션][az func]을 이용해 퍼사드를 만들어 붙이는 방법에 대해 알아 보았다. 사실 이 포스트에서는 [애저 펑션][az func]을 사용했지만, [파워 오토메이트][power automate]나 [로직 앱][az logapp]을 사용해도 큰 문제는 없다. 중요한 것은 이렇게 외부 API 사용에 대한 제약이 있을 때 중간에 퍼사드를 굉장히 간단하게 만들어 넣을 수 있다는 점이다. [파워 오토메이트][power automate] 또는 [로직 앱][az logapp]을 사용해서 구현해 보는 것은 여러분의 몫으로 남겨두기로 한다.


[image-01]: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/building-powerapp-with-naver-map-api-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/building-powerapp-with-naver-map-api-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/building-powerapp-with-naver-map-api-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/building-powerapp-with-naver-map-api-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/aliencube/2020/03/building-powerapp-with-naver-map-api-05.png

[mvp cana]: https://mvp.microsoft.com/en-us/PublicProfile/5001865
[mvp shane]: https://twitter.com/ShanesCows

[youtube oms]: https://www.youtube.com/channel/UCpLJu170ddf2qnpYlvsxobA

[power platform]: https://powerplatform.microsoft.com/ko-kr/?WT.mc_id=aliencubeorg-blog-juyoo
[power automate]: https://flow.microsoft.com/ko-kr/?WT.mc_id=aliencubeorg-blog-juyoo
[power apps]: https://powerapps.microsoft.com/ko-kr/?WT.mc_id=aliencubeorg-blog-juyoo
[power apps shane]: https://appsbuilders.org/guides/powerapps-google-maps-api-build-your-first-app/

[naver api static map]: https://apidocs.ncloud.com/ko/ai-naver/maps_static_map/

[postman]: https://www.postman.com/

[az func]: https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az logapp]: https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo
