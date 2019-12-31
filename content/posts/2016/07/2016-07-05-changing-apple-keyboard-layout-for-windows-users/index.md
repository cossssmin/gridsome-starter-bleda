---
title: "윈도우 사용자를 위한 애플 키보드 레지스트리 설정"
date: "2016-07-05"
slug: changing-apple-keyboard-layout-for-windows-users
description: ""
author: Justin Yoo
tags:
- Windows for IT
- Windows
- Keyboard
- Layout
- Mapping
fullscreen: false
cover: ""
---

애플 제품에 포함된 키보드를 쓰다보면 윈도우 사용자들이 당황하기 쉬운 것이 바로 기능키 배열이 기존의 윈도우용 키보드와 사뭇 다르다는 점이다.

> 윈도우
> 
> 애플
> 
> 왼쪽 콘트롤키
> 
> 왼쪽 콘트롤키
> 
> 왼쪽 윈도우키
> 
> 왼쪽 알트키 (옵션키)
> 
> 왼쪽 알트키
> 
> 왼쪽 윈도우키 (코맨드키)
> 
> 오른쪽 알트키 (한영전환키)
> 
> 오른쪽 코맨드키
> 
> 오른쪽 콘텍스트키
> 
> 오른쪽 옵션키

대략 이런 차이가 있다. 게다가 애플 키보드에는 프린트 스크린 키 역시 존재하지 않아서 굉장히 당황스러울 때가 많다. 작년에 맥북프로 레티나 버전(맥프레)을 구입하고 나서 굉장히 당황스러웠던 기억이 있었는데, 인터넷을 뒤져보니 몇가지 해결책이 있었다. 이 포스트에서는 미래의 나를 위해 이런 키 매핑을 어떻게 해결하는지 간략하게 언급해 보도록 한다.

## Key Tweak 유틸리티 사용

[KeyTweak](http://keytweak.en.softonic.com) 이라는 툴을 사용하면 강제적으로 키를 매핑해준다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/apple-keyboard-remapping-01.png)

이를 이용해서 강제로 키를 매핑해 준 다음에 로그아웃/로그인 또는 리부팅하면 윈도우용 키보드 배열과 동일하게 사용할 수 있다. 물론 원한다면 본인의 선호도에 따라 마구 바꿀 수도 있다. 변경 내용을 별도로 저장해 놓을 수도 있어서 계속 저장한 것을 불러와서 사용할 수도 있다.

## 레지스트리 직접 수정

아니면 아예 레지스트리를 직접 수정하는 방법도 있다. 아래 첨부하는 레지스트리 파일은 인터넷을 뒤지다가 찾은 파일들인데 일년이 지난 지금 다시 출처를 찾으려니 찾을 수가 없다.

- [콘트롤-윈도우-알트-스페이스바-한영-콘텍스트키 변환](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/apple-keyboard-ctrl-win-alt-space-korean-context.zip)
- [콘트롤-윈도우-알트-스페이스바-한영-프린트스크린 변환](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/apple-keyboard-ctrl-win-alt-space-korean-printscreen.zip)
- [원상태 복구](https://sa0blogs.blob.core.windows.net/aliencube/2016/07/apple-keyboard-restore-default.zip)

위 파일을 다운로드 받아서 레지스트리를 변경시킨 다음 로그아웃/로그인 혹은 리부팅하면 된다. 개인적으로는 스크린샷을 많이 따기 때문에 프린트 스크린 키가 있는 두번째 레지스트리를 선호한다.

이렇게 해서 간단하게 애플 키보드를 윈도우 환경에서 사용하는 방법에 대해 정리해 보았다.
