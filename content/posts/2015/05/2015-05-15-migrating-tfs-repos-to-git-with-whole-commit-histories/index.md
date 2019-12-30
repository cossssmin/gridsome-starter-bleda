---
title: "TFS 리포지토리를 git으로 커밋 로그를 포함해서 이전하기"
date: "2015-05-15"
slug: migrating-tfs-repos-to-git-with-whole-commit-histories
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- git
- GitHub
- History
- Migration
- Team Foundation Server
- TFS
fullscreen: false
cover: ""
---

Team Foundation Server (TFS)는 현재 Visual Studio Online (VSO)라는 이름으로 바뀌어서 여전히 널리 쓰이고 있다. 지금의 VSO야 TFS 고유의 소스코드 시스템 뿐만 아니라 git 까지도 사용할 수 있는 형태이지만, TFS 2012 버전을 포함한 이전 버전까지는 git을 공식적으로 지원하지 않았다. 따라서, TFS가 관리하는 소스코드의 경우에는 git으로 이전하기가 쉽지 않았는데, 특히나 커밋 히스토리를 모두 이전하는 것은 거의 불가능하다고 할 수 있었다.

하지만, 아래 소개하는 툴을 이용하면 TFS의 모든 소스코드를 커밋 히스토리와 함께 git으로 이전할 수 있다. 간단히 다루어 보도록 하자.

## Git-TF 설치

다른 툴들도 있겠지만, 여기서는 Git-TF 라는 툴을 소개하고자 한다. 이 툴을 이용하면 git과 TFS 모두를 동시에 사용할 수 있다. 여기서는 TFS에서 git으로 이전하는 것만을 다루기 때문에 다른 기능은 살펴보지 않겠지만, 만약 궁금하다면 오백원 [이곳](https://gittf.codeplex.com)을 방문해서 살펴보도록 한다.

- 소스코드 리포지토리: [https://gittf.codeplex.com](https://gittf.codeplex.com)
- 최신 바이너리 다운로드: [http://www.microsoft.com/en-us/download/details.aspx?id=30474](http://www.microsoft.com/en-us/download/details.aspx?id=30474)

가장 최근에 릴리즈된 버전은 2013년 12월 19일인데, 지금도 가뭄에 콩나듯이 코드 커밋이 이루어지는 것으로 봐서는 꾸준히 유지보수를 하긴 하는 것 같다.

### 요구사항

이 툴을 이용하기 위해서는 자바 런타임을 설치해야 한다. 적어도 1.7 버전 이상의 JRE를 요구하고 있다.

### 설치 과정

설치 과정은 아래와 같다

1. 다운로드 받은 `git-tf-2.0.3.20131219.zip` 파일을 원하는 위치에 압축을 풀어 놓는다. 여기서는 `C:\git-tf` 라는 디렉토리라고 가정하도록 한다.
2. `C:\git-tf` 디렉토리를 PATH에 추가한다.
    ```bat
    SET PATH = %PATH%;C:\\git-tf;
    ```

3. 자바 런타임이 설치된 디렉토리를 PATH에 추가한다. 아마도 런타임 설치시 자동으로 추가가 되었을 가능성이 높긴 하지만 확인해 보고 없을 경우 아래와 같이 추가하도록 하자.
    ```bat
    SET PATH = %PATH%;C:\\ProgramData\\Oracle\\Java\\javapath;
    ```


이렇게 하면 설치 및 환경 설정은 끝. 참 쉽죠? 이제 본격적으로 TFS 리포지토리를 git으로 옮기는 작업을 해 보도록 하자.

## 원격에 git 리포지토리 생성하기

예를 들어 GitHub에 원격 리포지토리를 생성한다고 하면, 생성된 리포지토리의 주소는 아래와 같을 것이다.

```bat
https://github.com/[USER_NAME]/[REPO_NAME].git

```

원격 리포지토리는 이렇게 생성했다 치고, 이걸 아직까지는 직접 사용할 수 없기 때문에 일단은 TFS에서 로컬로 git 리포지토리를 생성한다.

## 로컬에 git 리포지토리 생성하기

```bat
git-tf clone http(s)://[TFS_SERVER]:[PORT]/[COLLECTION_NAME] $/[PROJECT_NAME]/[BRANCH_NAME] --deep

```

여기서 `--deep` 옵션은 모든 커밋 히스토리를 다 받아오겠다는 것을 의미한다.

이렇게 하면 TFS 내의 모든 소스코드를 커밋 히스토리와 함께 다 받아온다. 여기서 하나 알아두어야 할 점은 버그 같긴 한데, TFS의 체인지셋 번호가 모두 git의 tag로 바뀐다는 점이다. 따라서, 이것은 필요한 경우 로컬에서 모두 삭제를 해주는 것이 좋다.

## TFS 관련 찌꺼기 파일들 삭제하기

리포지토리를 열어 보면 TFS 관련 파일들과 메타데이터들이 존재하는데, TFS를 계속 병행할 것이 아니라면 모두 삭제하는 것이 좋다.

- `*.vssscc` 파일들을 모두 삭제한다.
- `*.vspscc` 파일들을 모두 삭제한다.
- `.sln` 파일에서 아래 섹션을 제거한다.
    ```bat
    GlobalSection(TeamFoundationVersionControl) ... EndGlobalSection
    ```

이상과 같이 TFS 관련 찌꺼기 파일들을 모두 삭제했다면 이제는 git 관련 메타 데이터를 추가해 줄 차례이다.

## git 관련 필요 파일들 추가하기

일반적으로 git 리포지토리의 루트에는 아래와 같은 세 파일을 추가해 주는 것이 좋다.

- `.gitignore`: 굳이 리포지토리로 관리하지 않아도 될 임시 파일들이라든가 하는 것들을 이곳에 정의한다.
- `.gitattributes`: `.gitignore` 파일과 비슷하다. 자세한 내용은 [https://github.com/Danimoth/gitattributes](https://github.com/Danimoth/gitattributes)을 참고한다.
- `README.md`: 리포지토리에 대한 간략한 설명을 적어두는 파일이다. 있으면 좋고 없어도 그만.

이렇게 로컬 git 리포지토리를 정리했다면 변경사항을 커밋하도록 하자. 이제 이것을 원격 리포지토리에 업로드할 차례이다.

## 원격 git 리포지토리로 업로드하기

우선 현재의 로컬 리포지토리에 위에 생성해 놓은 원격 리포지토리를 추가한다. 아래는 커맨드라인일 경우이고, TortoiseGIT, GitHub Client for Windows 또는 SourceTree 와 같이 선호하는 GUI를 사용해도 좋다.

```bat
git remote add origin https://github.com/[USER_NAME]/[REPO_NAME].git

```

이렇게 원격 리포지토리를 추가했다면 변경한 모든 커밋을 해당 원격 리포지토리로 푸시한다.

이렇게 해서 TFS의 모든 소스코드를 커밋 히스토리와 함께 git으로 모두 이전했다. 진짜 쉽죠?
