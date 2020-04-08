---
title: "[COVID-19 시리즈 #2] 애저 펑션과 안면 인식 API를 이용해서 본인 인증하기"
slug: identifying-faces-through-azure-functions-using-face-api
description: "이 포스트에서는 웹사이트에서 캡쳐한 얼굴 사진으로 Face API와 애저 펑션을 통해 본인 인증을 하는 방법에 대해 알아봅니다."
date: "2020-04-08"
author: Justin-Yoo
tags:
- azure-functions
- face-api
- azure-blob-storage
- azure-table-storage
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/identifying-faces-through-azure-functions-using-face-api-00.png
fullscreen: true
---

> 이 포스트는 [파워 앱][power apps], [애저 펑션][az func], [애저 안면 인식 API][az cog faceapi]를 이용해서 학교 선생님들이 온라인으로 학생들 출석체크 하는 앱을 만들 때 필요한 내용들을 정리해보는 시리즈의 두번째입니다.

1. [애저 펑션을 이용해서 브라우저에서 애저 블롭 저장소로 스크린샷 이미지 저장하기][post series 1]
2. **애저 펑션과 안면 인식 API를 이용해서 본인 인증하기**
3. 파워 앱과 얼굴 인식 API를 이용해서 출석 체크 앱 만들기

---

[지난 포스트][post series 1]에서는 애저 펑션을 이용해서 웹캠으로 얼굴 사진을 찍어 [애저 블롭 저장소][az st blob]에 자동으로 저장하는 방법에 대해 알아보았다. 이 포스트에서는 이렇게 업로드한 사진을 바탕으로 [애저 안면 인식 API][az cog faceapi]를 이용해 본인 인증을 하는 방법에 대해 알아보기로 하자.

> 이 포스트에 쓰인 샘플 코드는 [Azure Functions Face Recognition Sample][gh sample]에서 다운로드 받을 수 있다.


## 안면 인식 워크플우 ##

아래는 이 포스트에서 다룰 워크플로우이다.

![][image-01]

"얼굴 이미지 수신" 액션과 "얼굴 이미지 업로드" 액션은 이미 [이전 포스트][post series 1]에서 다룬 바 있다. 다만 이번 포스트에서는 이 사이에 별도의 체크 로직("얼굴 이미지 갯수 충분한가?")을 넣고, 그 다음에 "얼굴 이미지 트레이닝" 액션 및 "얼굴 이미지 인식" 액션, "본인 인증 됐는가?" 체크 로직을 추가할 예정이다. 하나씩 차근차근 살펴보기로 하자.


## 환경 변수 ##

이 앱에서 쓰이는 환경 변수는 아래와 같다.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=00-environment-variables.cs

위 환경 변수 값들은 아래 설명하는 코드에서 계속 쓰이니 잘 기억해 두도록 하자.


## 얼굴 이미지 갯수는 충분한가? ##

환경 변수인 `Blob__NumberOfPhotos`는 실제 안면 인식을 위해 최소한도로 필요한 얼굴 이미지의 갯수를 설정하는 부분인데, 이 숫자는 크면 클수록 정확도가 높아진다. 하지만, 그만큼 안면 인식에 걸리는 시간은 길어진다는 점을 감안하도록 하자. 여기서는 `6`으로 설정했다. 따라서, [애저 블롭 저장소][az st blob]에 저장한 얼굴 이미지를 랜덤으로 6개 만큼 가져온다 (line #6). 아래는 이 부분에 해당하는 로직이다.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=01-get-images.cs&highlights=6,15

여기까지 한 후 앱을 돌려보면 실제로 충분한 수의 얼굴 사진이 모이기 전 까지는 아래와 같은 메시지를 보게 될 것이다 (line #15).

![][image-02]

이렇게 하면 랜덤으로 [애저 블롭 저장소][az st blob]에 저장된 이미지 중 원하는 갯수만큼 가져온다. 만약 저장된 이미지 갯수가 충분하지 않다면 좀 더 많은 이미지를 저장하라는 메시지를 반환하게 된다. 그런데, 여기 코드를 보면 특별히 랜덤으로 파일을 가져오는 로직이 존재하지는 않는데, 이 것은 파일 이름 자체가 `GUID` 형식이어서 이것만으로도 충분히 랜덤하기 때문이다. 기존에 저장되어 있던 얼굴 이미지를 원하는 갯수만큼 가져왔고, 이 이미지들은 나중에 얼굴 인식을 위한 대조군으로 사용될 것이다. 이제 아래 코드를 보자. 새로 얼굴 사진을 찍었을 때 이 사진에 얼굴이 여러 개 인식이 된다면 그 사진은 사용할 수 없으므로 반려해야 한다 (line #11).

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=02-detect-face.cs&highlights=11

위 코드에 보면 [Face API][az cog faceapi]에 얼굴 사진 이미지를 보내서 사진 속에 얼굴이 하나만 있는지 아닌지를 확인한다. 이 때, 사진이 저장되어 있는 [애저 블롭 저장소][az st blob]는 외부에서 직접 접근할 수 없으므로 위와 같이 [SAS 토큰][az st blob sas]을 뒤에 붙여서 접근할 수 있게끔 해 준다. SAS 토큰 값은 환경 변수인 `Blob__SasToken`에 저장해 놓았다. 만약 사진 속에 얼굴이 하나도 없거나, 둘 이상이라면 이 사진은 안면 인식에 적합하지 않으므로 `Bad Request`를 반환한다.

![][image-03]


## 얼굴 이미지 트레이닝 ##

이제 충분한 갯수의 얼굴 이미지가 준비됐고 실제 본인 인증을 위한 얼굴 이미지도 준비가 됐다면, 대조군으로 랜덤하게 뽑아놓은 이미지를 트레이닝 시켜야 할 차례이다. 아래 코드는 이 트레이닝을 위해서 사전에 준비해야 하는 사항들을 보여준다.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=03-train-faces-1.cs&highlights=8-9

위의 코드를 통해 매번 안면 인식을 수행할 때 마다 히스토리를 만들기 위해 [애저 테이블 저장소][az st table]에 레코드를 추가한다 (line #8-9). 그리고 `FaceEntity`는 일종의 상태 저장소 역할을 하면서 안면 인식 전반에 걸쳐 관여한다. 여기서는 이 `FaceEntity` 인스턴스에 `personGroup`, `personGroupId` 데이터를 저장했다.

이제 아래 코드를 보자. 안면 인식을 위해서는 우선 `PersonGroup`을 만들고 (line #4-6) 그 안에 `Person`을 만들어야 하는데 (line #8-10), 아래와 같이 구성할 수 있다.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=03-train-faces-2.cs&highlights=4-6,8-10

이제 트레이닝을 위해 대조군 이미지를 `Person`에 업로드해야 한다. 아래 코드를 보자. 앞서 생성한 `Person` 안에 대조군 이미지를 업로드한다 (line #9-11). 대조군으로 사용된 얼굴 이미지는 `FaceIds` 속성에 고스란히 저장시켰다.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=03-train-faces-3.cs&highlights=9-11

이제 트레이닝을 위한 밑작업은 끝났고, 실제로 얼굴 이미지를 트레이닝 시켜보자. `TrainAsync()` 메소드를 통해 트레이닝을 시키면 된다 (line #4-6).

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=03-train-faces-4.cs&highlights=4-6,11-13

트레이닝에는 시간이 걸리므로 위와 같이 `while { ... }` 루프를 이용해서 트레이닝 결과를 체크한다 (line #11-13). 마침내 트레이닝이 끝나고 나면 이 루프를 빠져나오게 되고, 이제 새롭게 찍은 얼굴 사진과 대조할 차례이다.


## 얼굴 이미지 인식 ##

본인 인증을 위해 새로 찍은 사진 역시도 사진 속에 얼굴 하나만 있는지 여부를 앞서와 같이 체크해야 한다. 그리고 난 후 이 얼굴을 대조군과 비교한다 (line #7-9).

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=04-identify-face.cs&highlights=7-9

얼굴 인식 결과는 `Confidence` 값으로 나타나는데, `1`이면 완벽하게 똑같은 사람이고, `0`이면 완벽하게 다른 사람이다.


## 본인 인증에 성공했는가? ##

앞서 환경 변수 값 중에 `Face__Confidence` 값이 있었는데, 이 값보다 `Confidence` 값이 높으면 본인 인증이 된 것이고 낮으면 본인 인증에 실패한 것으로 처리하면 된다. 아래 코드는 본인 인증 결과를 처리하는 부분이다.

https://gist.github.com/justinyoo/840f71acbc16a767c23e90b16c06a323?file=05-confirm-identification.cs

아래는 본인 인증이 성공했을 경우와 실패했을 경우를 보여준다.

![][image-04]
![][image-05]

마지막으로 본인 인증 결과는 아래와 같이 [애저 테이블 저장소][az st table]에 저장된다. `Confidence` 컬럼에 실제 안면 인식 결과 값을 보여주고, 그 옆의 `FaceIds` 컬럼에서는 대조군으로 사용한 이미지 파일을 보여준다.

![][image-06]

---

지금까지 [애저 펑션][az func]과 [애저 안면 인식 API][az cog faceapi]를 사용해서 본인 인증을 하는 방법에 대해 알아 보았다. 사실 안면 인식 알고리즘이 굉장히 복잡할텐데, 우리는 그런 부분은 모두 애저에 맏겨놓고 단순히 API만 사용하면 되는 것이 바로 이 포스트의 핵심이다. 다음 포스트에서는 이를 바탕으로 실제 [파워 앱][power apps]을 통해 이를 어떻게 구현하는지에 대해 알아보기로 한다.


[image-01]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/identifying-faces-through-azure-functions-using-face-api-01-ko.png
[image-02]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/identifying-faces-through-azure-functions-using-face-api-02.png
[image-03]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/identifying-faces-through-azure-functions-using-face-api-03.png
[image-04]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/identifying-faces-through-azure-functions-using-face-api-04.png
[image-05]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/identifying-faces-through-azure-functions-using-face-api-05.png
[image-06]: https://sa0blogs.blob.core.windows.net/aliencube/2020/04/identifying-faces-through-azure-functions-using-face-api-06.png

[post series 1]: /ko/2020/04/01/capturing-images-from-browser-to-azure-blob-storage-via-azure-functions/

[gh sample]: https://github.com/devkimchi/Azure-Functions-Face-Recognition-Sample/tree/part-2
[az func]: https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo

[az st blob]: https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az st blob sas]: https://docs.microsoft.com/ko-kr/azure/storage/common/storage-sas-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az st table]: https://docs.microsoft.com/ko-kr/azure/storage/tables/table-storage-overview?WT.mc_id=aliencubeorg-blog-juyoo

[az cog faceapi]: https://docs.microsoft.com/ko-kr/azure/cognitive-services/face/overview?WT.mc_id=aliencubeorg-blog-juyoo

[power apps]: https://powerapps.microsoft.com/ko-kr/?WT.mc_id=aliencubeorg-blog-juyoo
