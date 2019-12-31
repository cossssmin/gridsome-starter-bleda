---
title: "cmder에 Windows Subsystem for Linux (WSL) 연동하기"
date: "2018-04-05"
slug: wsl-bash-on-cmder
description: ""
author: Justin-Yoo
tags:
- visual-studio-alm
- bash
- cmder
- linux
- windows-subsystem-for-linux
- wsl
fullscreen: false
cover: ""
---

[Windows Subsystem for Linux(WSL)](https://docs.microsoft.com/en-us/windows/wsl/about)는 윈도우 10 안에서 별도의 가상 머신을 설치하지 않고서도 다양한 리눅스 배포판을 사용할 수 있는 훌륭한 개발자 도구중 하나이다. 또한 [cmder](http://cmder.net/) 역시 오픈 소스 커맨더 툴로써, 윈도우에서 자체 제공하는 커맨드 프롬프트, 파워셸 콘솔, git Bash 콘솔 등을 한꺼번에 관리할 수 있게 해준다. 그렇다면, 이 cmder에 WSL의 Bash 콘솔을 연결시킬 수 있지 않을까? 이 포스트는 cmder에 WSL Bash 콘솔을 직접 연결시키는 방법에 대해 간단하게 다뤄보고자 한다.

## 준비사항

- Windows 10 (64비트 버전) Fall Creators Update 이상
- [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/about)
- [cmder](http://cmder.net/)

WSL과 cmder를 설치하는 방법에 대해서는 여기서 다루지 않는다. 위에 링크한 문서를 보면 손쉽게 설치할 수 있다.

## cmder 설정

1. cmder 설정 화면으로 들어가서 `Startup` > `Tasks` 화면으로 이동한다.
2. 새 Task를 하나 만든다. 기존의 `bash` Task를 하나 복사하면 손쉽게 만들 수 있다.
3. 이름을 `bash::WSL`로 한다. 처음 `bash::` 부분은 cmder 내부적인 그룹핑을 위한 거라서 굳이 본인의 그룹핑 규칙이 따로 있다면 이대로 하지 않아도 좋다.
4. 커맨드 필드에 `%windir%\system32\bash.exe -new_console ~`와 같이 입력한다. 여기서 `~`은 홈 디렉토리를 의미한다. 만약 시작 디렉토리를 다른 곳으로 설정하고 싶다면 WSL 안의 `.bashrc`를 수정하는 것이 좋다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/wsl-bash-on-cmder-01.png)

## cmder 실행

이렇게 한 후 새 창을 열어 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/wsl-bash-on-cmder-02.png)

아래와 같이 훌륭하게 cmer와 WSL bash 콘솔이 연동된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2018/04/wsl-bash-on-cmder-03.png)

이렇게 함으로써 굳이 WSL 콘솔을 열 필요 없이 하나의 cmder 인스턴스 안에서 해결할 수 있다.
