---
title: "[COVID-19 시리즈 #3] 파워앱으로 학생들 온라인 출석부 앱 만들기"
slug: building-online-check-in-app-with-power-apps
description: "이 포스트에서는 파워앱과 애저 펑션, 애저 안면 인식 API로 학생들의 온라인 출석부 앱을 만드는 방법에 대해 알아봅니다."
date: "2020-04-15"
author: Justin-Yoo
tags:
- power-apps
- azure-functions
- face-api
- covid-19
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-00.png
fullscreen: true
---

이 포스트는 [파워 앱][powapp], [애저 펑션][az func], [애저 안면 인식 API][az cog faceapi]를 이용해서 학교 선생님들이 온라인으로 학생들 출석체크 하는 앱을 만들 때 필요한 내용들을 정리해보는 시리즈의 세번째입니다.

1. [애저 펑션을 이용해서 브라우저에서 애저 블롭 저장소로 스크린샷 이미지 저장하기][post series 1]
2. [애저 펑션과 안면 인식 API를 이용해서 본인 인증하기][post series 2]
3. **파워 앱과 얼굴 인식 API를 이용해서 출석 체크 앱 만들기**

---

[지난 포스트][post series 2]에서는 [애저 펑션][az func]과 [애저 안면 인식 API][az cog faceapi]를 이용해 본인 인증을 하는 앱을 만들어 보았다. 이번에는 웹 페이지 대신 [파워 앱][powapp]을 이용해 핸드폰에서 사진을 찍어 본인 인증을 하는 방법에 대해 알아보기로 한다.

> 이 포스트에 쓰인 샘플 코드는 [Azure Functions Face Recognition Sample][gh sample]에서 다운로드 받을 수 있다.


## 안면 인식 워크플우 ##

아래는 이 포스트에서 다룰 워크플로우이다. [지난 포스트][post series 2]에서 다룬 워크플로우와 동일하다. 다만 프론트엔드 앱이 웹 페이지에서 [파워 앱][powapp]으로 바뀐 차이이다.

![][image-01]

하지만, 이 차이 덕분에 파워 앱에서 사용하기 조금 더 편하게 API 설계를 바꾸긴 했다. 어떻게 바뀌었는지는 차차 다뤄보기로 한다.


## API 요청/응답 구조 변경 ##

API 요청 데이터가 예전에는 단순 텍스트 형태의 embedded image 밖에 없었다면, [파워 앱][powapp]을 통해 데이터를 받을 때에는 아무래도 출석부이다 보니 학생의 이름까지 같이 받아야 한다. 따라서, 아래와 같이 요청 객체를 수정한다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=01-embedded-request.cs

그리고, 응답 객체 역시도 기존의 단순 텍스트 형태에서 JSON 객체 형태로 바꿔준다. 생성자는 없어도 상관 없지만, 응답 객체 생성시 코드의 양을 조금 더 줄여줄 수 있다는 관점에서는 아래와 같이 구현하는 것도 좋다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=02-result-response.cs

다른 로직은 변한 것이 없으므로 위와 같이 요청 및 응답 객체를 리팩토링한 후 로컬에서 실행시켜 보면 아래와 같이 제대로 작동해야 한다. 제대로 작동한다면 애저로 배포한다.

![][image-02]


## 커스텀 커넥터 생성 ##

[애저 펑션][az func]으로 만든 API는 이제 위와 같이 준비가 됐다. 하지만 이를 [파워 앱][powapp]에서 사용하려면 한 가지 추가로 해 줄 작업이 있다. [파워 앱][powapp]에서는 API에 직접 접근하는 것이 번거롭다. 전에 공유했던 [파워 앱에서 네이버 지도 API 사용하기][post navermapapi]에서 언급했다시피 API에 직접 접근하려면 여러 가지 제약 사항이 많기 때문이다. 따라서, 보통은 [커스텀 커넥터][powapp cuscon]를 사용해서 API를 호출하고 결과값을 받아온다. 이 커스텀 커넥터는 사실 [로직 앱][az logapp]과 [파워 오토메이트][powflow]에서도 함께 쓰이는 것들이라서 한 번 만들어 놓으면 여러모로 재활용성이 높다.

커스텀 커넥터를 만들기 위해서는 API에 [Open API 스펙][openapi spec]을 정의해 놨을 경우 [굉장히 쉽게 생성 가능하다][powapp cuscon openapi]. 하지만, 이 시리즈에서 만들어 놓은 [애저 펑션][az func]은 런타임 버전이 3.x이기 때문에 공식적으로 [Open API를 지원하지 않는다][az func openapi]. 물론, [`swagger.json` 파일을 미리 정의한 후 그 파일을 렌더링하는 방식으로 구현할 수도 있다][post openapi 1]. 또한, [NuGet 패키지][az func openapi nuget]를 이용하면 [손쉽게 구현이 가능하기도 하다][post openapi 2]. 하지만 여기서는 단순히 API만 구현했기 때문에 [커스텀 커넥터를 직접 만들어야 한다][powapp cuscon scratch].

파워 앱으로 우선 로그인을 한 후 왼쪽의 `사용자 지정 커넥터` 메뉴로 이동한다.

![][image-03]

그리고 오른쪽 상단의 `+ 새 사용자 지정 커넥터`를 클릭해서 `빈 페이지에서 만들기`를 선택한다.

![][image-04]

가장 처음 할 일은 커스텀 커넥터의 이름을 정하는 일이다. 여기서는 `FaceIdentifier`로 한다.

![][image-05]

Open API 문서를 직접 작성하는 것이 익숙하다면 우측 상단의 `Swagger 편집기`를 클릭해서 직접 작성해도 된다. 하지만 여기서는 아래와 같이 폼을 작성하는 것으로 하자. 먼저 `HTTPS` 프로토콜과 애저 펑션의 URL을 입력한다. 그리고 `기준 URL` 필드에는 `/api` 라고 입력한다. 그리고 오른쪽 아래의 `보안 ➡️`을 클릭해서 다음 화면으로 이동한다.

![][image-06]

다음으로는 인증 방식에 대한 설정이다. 애저 펑션은 엔드포인트마다 인증 키를 통해 접근할 수 있으므로 아래와 같이 `API 키`를 선택하고 매개 변수 레이블 필드에는 `authkey` 매개 변수 이름에는 `x-functions-key`, 그리고 매개 변수 위치는 `머리글 (Header)`로 설정한다. 그리고 `정의 ➡️`를 클릭해서 다음 화면으로 이동한다.

![][image-07]

이제 실제 작동 방식과 필요한 데이터 형식을 정의할 차례이다. 작동 ID 값에는 `Identify`라고 입력한다. 그리고 요청 데이터 형식을 정의하기 위해 `+ 샘플에서 가져오기` 버튼을 클릭한다.

![][image-08]

이 요청 데이터는 `POST` 방식이고, URL은 `/faces/identify`이다. 요청 본문의 JSON 형식은 `personGroup`과 `image` 필드를 문자열 형식으로 받아오므로 대략 모양만 갖춰서 아래와 같이 적어준다. 그리고 `가져오기` 버튼을 클릭한다.

![][image-09]

그러면 아래와 같이 요청 데이터 형식이 정해진다.

![][image-10]

이제 응답 데이터 형식을 정의할 차례이다. 아래의 `default` 데이터 형식을 클릭한다.

![][image-11]

기본적으로 HTTP Status Code 값이 `200 (OK)`인 내용을 정의한다. 본문 형식에 `key-body-output`이라는 필드가 보이는데, 지금은 무시해도 좋다. 이름을 `200`으로 하고, `+ 샘플에서 가져오기`  버튼을 클릭한다.

![][image-12]

응답 데이터 형식은 위에서 정의한 바와 같이 아래 JSON 객체 모양이 된다. `가져오기` 버튼을 클릭한다.

![][image-13]

그렇게 하면 아래와 같이 응답 객체 본문에서 `key-body-output` 필드가 없어지고 대신 `statusCode`와 `message` 필드가 보인다.

![][image-14]

여기까지 하면 커스텀 커넥터 정의가 다 끝난 셈이다. 상단의 `✅ 커넥터 만들기` 버튼을 클릭해서 저장하면 커스텀 커넥터 작성은 끝난다.

이제 이렇게 만들어진 커넥터가 제대로 작동하는지 테스트를 해 볼 차례이다. 오른쪽 아래의 `테스트 →` 버튼을 클릭해서 다음 화면으로 이동한다. 그리고 `+ 새 연결` 버튼을 클릭한다.

![][image-15]

애저 펑션은 개별 엔드포인트마다 인증키를 갖고 있다. 이 값을 입력하거나 아니면 모든 엔드포인트에 동일하게 적용할 수 있는 공통 인증키를 입력한다.

![][image-16]

인증이 끝난 후 아래와 같이 데이터를 입력해서 실행시키면 테스트에 성공한 것이다.

![][image-17]

이제 [커스텀 커넥터][powapp cuscon]가 준비 됐으니 본격적으로 [파워 앱][powapp]을 만들어 보자.


## 파워 앱 만들기 ##

[파워 앱][powapp] 첫 화면에서 아래와 같이 `빈 페이지의 캔버스 앱` 타일을 클릭한다.

![][image-18]

앱의 이름을 지정한다. 여기서는 `SchoolCheckIn`으로 했다. 핸드폰 또는 태블릿 형태를 지정할 수 있는데, 여기서는 핸드폰 형태를 선택했다.

![][image-19]

빈 캔버스가 준비됐다. 여기에 필요한 콘트롤들을 선택해서 올려놓으면 된다. 여기서는 맨 위부터 [카메라][powapp control camera], [토글][powapp control toggle], [버튼][powapp control button] 두 개, [라벨][powapp control label], [이미지][powapp control image] 순서로 콘트를을 정리했다.

![][image-20]

우선 앞서 만들어 놓은 커스텀 커넥터를 연결한다. 아래와 같이 캔버스 왼쪽의 Data Sources에서 커넥터를 검색해 보면 `FaceIdentifier` 커넥터가 보인다. 이를 선택한다.

![][image-21]

이제 우리가 만드는 [파워 앱][powapp] 안에서 `FaceIdentifier` 커넥터를 사용할 수 있다.

![][image-22]

이제 콘트롤을 하나씩 건드려보자.


### 토글 콘트롤 ###

가장 먼저 [토글][powapp control toggle] 콘트롤을 조정해 보자. 이 토글 콘트롤을 통해 카메라를 전면 카메라를 쓸 지, 후면 카메라를 쓸 지 결정한다. 요즘 핸드폰은 보통 카메라가 얼굴을 향하는 전면 카메라와 상대방을 향하는 후면 카메라 두 개가 있는 편인데, 아이폰의 경우 후면 카메라는 `0`, 전면 카메라는 `1`로 값이 할당된다. 따라서, 아래와 같이 `OnCheck` 필드에 아래 수식을 넣는다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=03-toggle-oncheck.vb

그리고 `OnUncheck` 필드에 아래 수식을 넣는다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=04-toggle-onuncheck.vb

여기서 `cameraId`는 메모리 변수 콜렉션이고, [`ClearCollect()`][powapp func clearcollect] 함수를 통해 해당 변수 값을 메모리에서 비우고 새 값으로 채워 넣는다. [파워 앱][powapp]에서는 별도로 변수를 선언하는 절차가 없고 모두 암시적으로 변수가 만들어지고 사라진다. 여기서도 `cameraId` 콜렉션은 그냥 선언만 하면 자동으로 메모리 안에서 관리가 되므로 그냥 사용하면 된다.

![][image-23]


### 카메라 콘트롤 ###

이번에는 [카메라][powapp control camera] 콘트롤의 `Camera` 속성과 `StreamRate` 속성값을 조정한다. `StreamRate`는 최소값인 `100`으로 둔다. 이것은 카메라를 매 100ms 마다 리프레시한다는 의미이다. 그리고 `Camera` 필드에 아래 수식을 넣는다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=05-camera-camera.vb

![][image-24]

이렇게 하면 앞서 [토글][powapp control toggle] 콘트롤에서 선택하는 값에 따라서 카메라가 선택된다. 실제로 이렇게 한 후 토글을 클릭해 보면 카메라가 바뀐다.

![][image-25]


### 버튼 콘트롤 ###

이 앱에는 [버튼][powapp control button] 콘트롤이 두 개가 있다. 먼저 "Reset" 버튼을 먼저 보자. `OnSelect` 속성에 아래 수식을 입력한다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=06-button-reset-onselect.vb

앞서 언급한 바와 같은 방법으로 [`ClearCollect()`][powapp func clearcollect] 함수를 이용해 콜렉션 변수인 `captured`와 `identified`의 값을 초기화 한다. 이 두 콜렉션 변수는 아래 다룰 [라벨][powapp control label] 콘트롤과 [이미지][powapp control image] 콘트롤에서 쓰인다.

![][image-26]

다음으로 "Identify!" 버튼을 보자. 이 버튼은 `OnSelect` 속성에 [`ClearCollect()`][powapp func clearcollect] 함수를 이용해 `captured`와 `identified` 콜렉션 변수에 값을 할당한다. 사실 이 부분이 이 [파워 앱][powapp] 제작의 핵심 부분이다. 아래 수식을 입력한다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=07-button-identify-onselect.vb

뭔가 복잡해 보이는데 하나씩 풀어보자.

* `captured` 콜렉션 변수에 [카메라][powapp control camera] 콘트롤에서 받아온 `Stream` 값을 입력한다. 이 `Stream` 값을 이용해 [이미지][powapp control image] 콘트롤에 캡쳐한 이미지를 전달한다.
* `identified` 콜렉션 변수에는 앞서 연결시킨 `FaceIdentifier` 커스텀 커넥터의 `Identify()` 동작을 통해 API를 호출하고 그 결과값을 저장한다.
* `FaceIdentifier.Identify()` 함수는 `personGroup`과 `image` 값을 콘트롤에서 받아 사용한다.
  * 여기서는 `personGroup` 값을 하드코딩했지만, 실제로는 학생의 이름을 입력 받아 사용하면 된다.
  * [카메라][powapp control camera] 콘트롤의 `Stream` 속성은 꽤 재미있는 성질을 가졌는데, 이 속성값을 API 호출에 사용하려면 [`JSON()`][powapp func json] 함수를 통해 문자열로 바꿔야 한다. 이렇게 변경한 문자열은 쌍따옴표(")로 둘러쌓여 있으므로 이 값을 [`Substitute()`][powapp func substitute] 함수로 제거해 줘야 한다. 이 때 쌍따옴표의 이스케이핑을 위해서는 다시 쌍따옴표를 사용한다.

여기까지 보면 마치 엑셀 파일 안에서 함수를 사용하는 느낌이 들지 않는가? 적어도 나는 그렇게 보인다. 함수 사용 방법도 비슷하다.

![][image-27]


### 라벨 콘트롤 ###

[라벨][powapp control label]을 이용해서 앞서 "Identify!" 버튼에서 호출한 `identified` 콜렉션 변수의 결과값을 표시한다. 커스텀 커넥터에 정의된 응답 객체는 `message` 속성이 있으므로 그 값을 아래와 같이 `Text` 필드에 호출한다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=08-label-text.vb

![][image-28]

이제 앞서 "Reset" 버튼에서 굳이 `identified` 콜렉션 변수값을 초기화할 때 `{ message: "" }`라고 한 이유가 바로 여기에 있다. 동일한 구조로 맞춰줘야 하기 때문이다.


### 이미지 콘트롤 ###

이번에는 [이미지][powapp control image] 콘트롤을 조정해 보자. `Image` 필드에 아래와 같은 수식을 입력한다. 이는 앞서 캡쳐한 `captured` 콜렉션 변수의 값을 가져오기 위함이다.

https://gist.github.com/justinyoo/7b58161325ecce6d66a5b2e8d54d3605?file=09-image-image.vb

![][image-29]


## 파워 앱 테스트 ##

여기까지 하면 [파워 앱][powapp] 개발이 끝났다! 완전 간단하지 않은가? 실제로 실행을 시켜보도록 하자. 먼저 발행을 하기 전에 테스트를 먼저 할 수 있다. 윈도우에서는 `ALT` 키와 함께 마우스로 버튼을 클릭하면 캔버스 안에서 바로 실행시킬 수 있고, 맥에서는 `OPTION`키를 대신 사용할 수 있다. 아래와 같이 기대했던 대로 잘 작동하는 것이 보인다.

![][image-30]


## 파워 앱 출판 ##

이제 앱이 준비가 됐다면 출판을 할 차례이다. 저장후 바로 출판한다. 그리고 실제로 핸드폰에서 앱을 구동시켜 보면 아래와 같다.

https://youtu.be/GVNK8HcF-xY

---

지금까지 [파워 앱][powapp]과 [애저 펑션][az func], [애저 안면 인식 API][az cog faceapi]를 이용해 온라인으로 학생들의 출석을 체크하기 위한 출석부 앱을 만들어 보았다. [파워 앱][powapp]은 흔히 얘기하는 저코드(low-code) 혹은 무코드(no-code) 앱 빌더라고 하는데, 실제로 파워 앱 개발 자체는 코드 작성이 거의 필요 없다. 모든 외부 데이터 교환은 API 커넥션으로 이루어지기 때문이다. 따라서, [애저 펑션][az func]과 같은 서버리스 API를 통해 사용하기 쉬운 API를 구현해 놓고 바로 연결해서 사용하게 된다면 누구나 쉽게 모바일 앱을 개발할 수 있을 것이다.


[image-01]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-01-ko.png
[image-02]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-05.png
[image-06]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-06.png
[image-07]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-07.png
[image-08]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-08.png
[image-09]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-09.png
[image-10]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-10.png
[image-11]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-11.png
[image-12]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-12.png
[image-13]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-13.png
[image-14]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-14.png
[image-15]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-15.png
[image-16]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-16.png
[image-17]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-17.png
[image-18]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-18.png
[image-19]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-19.png
[image-20]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-20.png
[image-21]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-21.png
[image-22]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-22.png
[image-23]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-23.png
[image-24]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-24.png
[image-25]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-25.png
[image-26]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-26.png
[image-27]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-27.png
[image-28]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-28.png
[image-29]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-29.png
[image-30]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/building-online-check-in-app-with-power-apps-30.png

[post series 1]: /ko/2020/04/01/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions/
[post series 2]: /ko/2020/04/08/identifying-faces-through-azure-functions-using-face-api/
[post navermapapi]: /ko/2020/03/18/building-powerapp-with-naver-map-api/
[post openapi 1]: /ko/2019/01/04/rendering-swagger-definitions-on-azure-functions-v2/
[post openapi 2]: /ko/2019/02/02/introducing-swagger-ui-on-azure-functions/

[gh sample]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/tree/part-3

[openapi spec]: http://spec.openapis.org/oas/v2.0

[az func]: https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az func openapi]: https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-api-definition?WT.mc_id=aliencubeorg-blog-juyoo
[az func openapi nuget]: https://www.nuget.org/packages/Aliencube.AzureFunctions.Extensions.OpenApi/

[az logapp]: https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo

[az cog faceapi]: https://docs.microsoft.com/ko-kr/azure/cognitive-services/face/overview?WT.mc_id=aliencubeorg-blog-juyoo

[powapp]: https://powerapps.microsoft.com/ko-kr/?WT.mc_id=aliencubeorg-blog-juyoo
[powapp cuscon]: https://docs.microsoft.com/ko-kr/connectors/custom-connectors/use-custom-connector-powerapps?WT.mc_id=aliencubeorg-blog-juyoo
[powapp cuscon openapi]: https://docs.microsoft.com/ko-kr/connectors/custom-connectors/define-openapi-definition?WT.mc_id=aliencubeorg-blog-juyoo
[powapp cuscon scratch]: https://docs.microsoft.com/ko-kr/connectors/custom-connectors/define-blank?WT.mc_id=aliencubeorg-blog-juyoo

[powapp control camera]: https://docs.microsoft.com/ko-kr/powerapps/maker/canvas-apps/controls/control-camera?WT.mc_id=aliencubeorg-blog-juyoo
[powapp control image]: https://docs.microsoft.com/ko-kr/powerapps/maker/canvas-apps/controls/control-image?WT.mc_id=aliencubeorg-blog-juyoo
[powapp control toggle]: https://docs.microsoft.com/ko-kr/powerapps/maker/canvas-apps/controls/control-toggle?WT.mc_id=aliencubeorg-blog-juyoo
[powapp control button]: https://docs.microsoft.com/ko-kr/powerapps/maker/canvas-apps/controls/control-button?WT.mc_id=aliencubeorg-blog-juyoo
[powapp control label]: https://docs.microsoft.com/ko-kr/powerapps/maker/canvas-apps/controls/control-text-box?WT.mc_id=aliencubeorg-blog-juyoo

[powapp func clearcollect]: https://docs.microsoft.com/ko-kr/powerapps/maker/canvas-apps/functions/function-clear-collect-clearcollect?WT.mc_id=aliencubeorg-blog-juyoo
[powapp func json]: https://docs.microsoft.com/ko-kr/powerapps/maker/canvas-apps/functions/function-json?WT.mc_id=aliencubeorg-blog-juyoo
[powapp func substitute]: https://docs.microsoft.com/ko-kr/powerapps/maker/canvas-apps/functions/function-replace-substitute?WT.mc_id=aliencubeorg-blog-juyoo

[powflow]: https://flow.microsoft.com/ko-kr/?WT.mc_id=aliencubeorg-blog-juyoo
