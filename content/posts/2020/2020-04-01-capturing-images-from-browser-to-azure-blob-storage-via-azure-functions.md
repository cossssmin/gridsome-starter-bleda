---
title: "[COVID-19 시리즈 #1] 애저 펑션을 이용해서 브라우저에서 애저 Blob 저장소로 스크린샷 이미지 저장하기"
slug: capturing-images-from-browser-to-azure-blob-storage-via-azure-functions
description: "이 포스트에서는 웹사이트에서 캡쳐한 카메라 이미지를 애저 펑션을 통해 애저 블롭 저장소로 저장하는 방법에 대해 알아봅니다."
date: "2020-04-01"
author: Justin-Yoo
tags:
- azure-functions
- html-media-capture
- azure-blob-storage
- covid-19
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions-00.png
fullscreen: true
---

> 이 포스트는 [파워 앱][power apps], [애저 펑션][az func], [애저 안면 인식 API][az cog faceapi]를 이용해서 학교 선생님들이 온라인으로 학생들 출석체크 하는 앱을 만들 때 필요한 내용들을 정리해보는 시리즈의 첫번째입니다.

1. **애저 펑션을 이용해서 브라우저에서 애저 블롭 저장소로 스크린샷 이미지 저장하기**
2. [애저 펑션과 얼굴 인식 API를 이용해서 본인 인증하기][post series 2]
3. [파워 앱과 얼굴 인식 API를 이용해서 출석 체크 앱 만들기][post series 3]

---

전혀 예상하지 못했던 전염병이 전세계를 휩쓸면서 학생들은 학교엘 나가지 못하고, 직장인들은 회사에 나가질 못하는 상황이다. 대신 모두 다 원격으로 화상 회의 솔루션을 이용해서 수업을 듣는다거나 회의를 한다거나 한다. 오죽하면 회사의 수많은 C 레벨 임원들이 못한 디지털 전환을 같은 C 자 돌림인 COVID-19 바이러스가 완성했다는 우스갯소리까지 나돌 지경이다.

![][image-02]

학교에서 온라인으로 원격 수업을 진행하기 위해서는 다른 것들도 중요하지만 학생들의 출결 상황 체크 역시 중요하다. 여러 가지 방법이 있겠지만, 이 포스트를 포함한 시리즈에서는 [애저 안면 인식 API][az cog faceapi]를 이용해서 본인 인증을 진행하는 방식으로 출석 체크를 하는 앱을 만들어 볼 계획이다. 그 중 첫번째 포스트에서는 화면으로 본인 사진을 캡쳐해서 저장하는 방법에 대해 알아보자.

> 이 포스트에 쓰인 샘플 코드는 [Azure Functions Face Recognition Sample][gh sample]에서 다운로드 받을 수 있다.


## 웹 브라우저에서 사진 찍기 ##

최신 웹 브라우저를 사용하고 있다면 요즘은 [Media Capture API][mdn media capture]를 사용해서 손쉽게 웹캠에 접근해서 사진을 찍을 수 있다. 이 API의 핵심은 [`getUserMedia()`][mdn getusermedia] 라는 함수를 사용하는 것인데, 자세한 내용은 해당 문서를 참조하고 여기서는 [HTML5 Rocks][html5rocks tutorial]에서 제공하는 [getUserMedia() 튜토리얼][html5rocks tutorial getusermedia]에서 코드를 참조하기로 한다. [웹페이지 HTML 소스 보기][gh photocapture]

아래는 카메라에 접근하는 HTML 소스 부분이다. `video` 태그를 통해 웹캠 입력을 받고 (line #2) 스크린샷을 통해 이를 `img` 태그로 내보낸다 (line #3). `canvas` 태그는 이 사이에서 데이터를 제어하는 역할을 한다 (line #4).

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=01-photo-capture-1.html&highlights=2-4

아래는 이를 제어하는 자바스크립트 부분이다. `captureVideoButton` 함수를 통해 웹캠 접근 권한을 얻고 (line #13-18), `screenshotButton` 버튼을 통해 실제로 캡처한 데이터를 임베디드 이미지 데이터로 변환한다 (line #20-26).

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=02-photo-capture-2.html&highlights=13-18,20-26


아래는 추억의 [jQuery][jq] 코드인데, 이미지 데이터가 `src` 속성에 들어가면 이를 [애저 펑션][az func]으로 보내는 역할을 한다 (line #5-9).

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=03-photo-capture-3.html&highlights=5-9

이제 HTML 페이지는 준비가 끝났다. 이제 이 페이지를 웹사이트에서 돌려야 하는데, 어디에서 돌려볼까? [애저 펑션][az func]에서 HTML 페이지도 로딩할 수 있으니, 그 기능을 활용해 보기로 하자. 아래는 애저 펑션 코드이다. 이 코드에서 특이한 부분이 두 군데 있다. `ILogger` 인스턴스가 사라지고 `ExecutionContext` 인스턴스가 들어왔다. `ILogger` 인스턴스는 애저 펑션의 [의존성 주입 기능][az func di]을 통해 생성자 쪽으로 돌렸고, `ExecutionContext` 인스턴스는 애저 펑션의 [실행 경로를 추적하기 위해][az func executioncontext] 도입했다 (line #8). 실제로 이 `ExecutionContext` 인스턴스를 통해 앞서 작성한 HTML 파일을 읽어들일 수 있고, 이를 곧바로 `ContentResult` 인스턴스를 통해 반환하면 (line #10-15) 자연스럽게 HTML 웹 페이지를 렌더링 할 수 있다. 이 때 반환하는 문서 타입을 `text/html`로 지정해야 하는 것 잊지 말자. 전체 소스는 [이곳][gh trigger renderpage]을 확인한다.

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=04-render-page-trigger.cs&highlights=8,10-15

여기까지 한 후 애저 펑션을 로컬에서 실행시켜 보면 아래와 같은 화면이 나타난다.

![][image-01]

이제 이렇게 찍은 사진을 [애저 블롭 저장소][az storage blob]로 업로드하는 방법을 알아보자.


## 임베디드 이미지 데이터를 애저 블롭 저장소로 업로드하기 ##

앞서 사진을 찍고 나면 이미지 데이터는 `img` 태그의 `src` 속성에 아래와 같은 형태로 저장된다. 즉 Base64 형식으로 인코딩 된 임베디드 데이터이다.

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=05-embedded-image.txt

[애저 펑션][az func]은 이 데이터를 받았으니 이를 바이너리 데이터로 변환해서 [애저 블롭 저장소][az storage blob]로 업로드 해야 한다. 업로드 하기에 앞서 데이터의 형태를 잠깐 살펴보면 맨 앞 부분에 헤더의 형태로 `data:image/png;base64` 라는 내용이 있고, 그 뒤로 base64 인코딩된 이미지 데이터가 따라 붙는다. 따라서, 바이너리 데이터를 처리할 때 이 앞부분의 헤더를 제거해야 한다. 이 부분은 단순한 문자열 조작에 불과하기 때문에 아래와 같은 형태로 처리하면 좋다. 먼저 요청 데이터를 문자열로 다 읽어들인 후 (line #10), `Split()` 메소드를 통해 문자열을 분리한다. 헤더와 이미지 데이터를 먼저 `,` 구분자를 통해 분리하고 (line #13), 헤더에서 `:`, `;` 구분자를 이용해 파일 형식을 추출해 낸다 (line #14).

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=06-photo-capture-trigger.cs&highlights=10,13-14

그 다음에는 base64 인코딩된 이미지 데이터 문자열을 바이트 배열로 변환시킨 후, `UploadByteArrayAsync()` 메소드를 통해 업로드하면 된다 (line #9). 아래는 굉장히 축약시켜 놓은 코드 부분인데, 전체 코드는 [이곳][gh trigger photocapture]을 확인한다.

https://gist.github.com/justinyoo/f8bf5bbdd0f4fd7d10402527ea08eb4b?file=07-blob-upload.cs&highlights=9

이렇게 하면 웹 브라우저상에서 웹캠을 통해 내 얼굴을 찍을 때 마다 [애저 블롭 저장소][az storage blob]로 한번에 업로드를 시킬 수 있다.

---

여기까지 해서 첫번째 단계인 내 얼굴 사진을 찍은 후 저장하는 방법에 대해 알아보았다. 이렇게 저장된 이미지는 실제 내 얼굴인지 확인하는 참조 용도로 쓰일 예정이다. [다음 포스트][post series 2]에서는 애저 [안면 인식 API][az cog faceapi]를 이용해서 실제 내 얼굴인지 아닌지 확인하는 방법에 대해 알아보기로 한다.


[image-01]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions-02.jpeg

[post series 2]: /ko/2020/04/08/identifying-faces-through-azure-functions-using-face-api/
[post series 3]: /ko/2020/04/15/building-online-check-in-app-with-power-apps

[gh sample]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample
[gh photocapture]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/blob/master/src/FaceApiSample.FunctionApp/photo-capture.html
[gh trigger renderpage]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/blob/master/src/FaceApiSample.FunctionApp/RenderPageHttpTrigger.cs
[gh trigger photocapture]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/blob/master/src/FaceApiSample.FunctionApp/PhotoCaptureHttpTrigger.cs

[mdn media capture]: https://developer.mozilla.org/ko/docs/Web/API/Media_Streams_API
[mdn getusermedia]: https://developer.mozilla.org/ko/docs/Web/API/MediaDevices/getUserMedia

[html5rocks tutorial]: https://www.html5rocks.com/ko/tutorials/
[html5rocks tutorial getusermedia]: https://www.html5rocks.com/ko/tutorials/getusermedia/intro/

[jq]: https://jquery.com/

[az logapp]: https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az func]: https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az func di]: https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-dotnet-dependency-injection?WT.mc_id=aliencubeorg-blog-juyoo
[az func executioncontext]: https://github.com/Azure/azure-functions-host/wiki/Retrieving-information-about-the-currently-running-function#net-languages-c-f-etc

[az storage blob]: https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-overview?WT.mc_id=aliencubeorg-blog-juyoo

[az cog faceapi]: https://docs.microsoft.com/ko-kr/azure/cognitive-services/face/overview?WT.mc_id=aliencubeorg-blog-juyoo

[power apps]: https://powerapps.microsoft.com/ko-kr/?WT.mc_id=aliencubeorg-blog-juyoo
