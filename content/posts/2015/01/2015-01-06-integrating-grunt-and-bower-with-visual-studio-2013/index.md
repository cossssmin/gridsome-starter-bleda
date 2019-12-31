---
title: "Grunt와 Bower를 Visual Studio 2013에 통합하기"
date: "2015-01-06"
slug: integrating-grunt-and-bower-with-visual-studio-2013
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- Bower
- Grunt
- Gulp
- LESS
- node.js
- npm
- Visual Studio 2013
fullscreen: false
cover: ""
---

프론트엔드 개발에서 [`node.js`](http://nodejs.org)는 동의하건 동의하지 않건 중심적인 위치를 차지한지 이미 오래 됐고, 단순히 개발 프레임웍을 벗어나 이제는 개발 플랫폼으로 자리잡았다. 비주얼스튜디오에서도 `node.js`를 이미 지원하고 있다. 이 `node.js`를 이용한 여러가지 패키지 매니저들이 있는데, 이 포스트에서는 그들 중 [Grunt](http://gruntjs.com/)와 [Bower](http://bower.io)를 비주얼스튜디오에 통합하는 방법에 대해 이야기 해 볼까 한다.

## 배경

사실 [Simple Mock Web Service](https://github.com/aliencube/Simple-Mock-Web-Service) 개발을 진행하면서 프론트엔드 개발 작업을 진행해 주셨던 모 코알라 개발자가 Bower를 가지고 작업을 해 놓았다. 그걸 닷넷 백엔드 코드와 어떻게 연결해서 사용해 볼 수 있을까를 고민하던 차에 [Scott Hanselman](https://twitter.com/shanselman) 아저씨의 포스트, [Introducing Gulp, Grunt, Bower, and npm support for Visual Studio](http://www.hanselman.com/blog/IntroducingGulpGruntBowerAndNpmSupportForVisualStudio.aspx)를 찾았다. 충분히 매력적이어서 그대로 따라해 봤는데, 생각처럼 쉽지 않았다. 아무래도 배경 지식이 충분하지 않기도 하고, 대부분 코맨드라인에서 명령어를 입력하는 방식이기도 해서 익숙하지도 않고, 무엇보다도 각 라이브러리들의 설명이 시원찮았다. [#인생은삽질](https://twitter.com/hashtag/인생은삽질) 결국 성공하긴 했는데, 기록 차원에서 포스트를 작성한다.

## 사전 준비

- [Visual Studio 2013 Update 4](http://www.visualstudio.com/en-us/downloads/download-visual-studio-vs#DownloadFamilies_5): [Web Installer](http://go.microsoft.com/?linkid=9842996) | [ISO Image](http://go.microsoft.com/?linkid=9842997)
- [Task Runner Explorer](https://visualstudiogallery.msdn.microsoft.com/8e1b4368-4afb-467a-bc13-9650572db708)
- [Grunt Launcher](https://visualstudiogallery.msdn.microsoft.com/dcbc5325-79ef-4b72-960e-0a51ee33a0ff)
- [Package Intellisense](https://visualstudiogallery.msdn.microsoft.com/65748cdb-4087-497e-a394-2e3449c8e61e)
- [msysgit 1.9.5](https://github.com/msysgit/msysgit/releases/download/Git-1.9.5-preview20141217/Git-1.9.5-preview20141217.exe)
- [node.js Windows Installer v0.10.35](http://nodejs.org): [32bit](http://nodejs.org/dist/v0.10.35/node-v0.10.35-x86.msi) | [64bit](http://nodejs.org/dist/v0.10.35/x64/node-v0.10.35-x64.msi)
- [Grunt](http://gruntjs.com)
- [Bower](http://bower.io)

## 환경 설정

아래 순서대로 환경 설정을 하도록 하자. 순서가 중요하다 순서가!

### 비주얼 스튜디오 업데이트

우선 비주얼 스튜디오 2013을 최신의 Update 4 까지 업데이트해 놓아야 한다. 헤인즐만 옹은 Update 3이면 충분하다 하는데, 기왕 하는거 Update 4까지 올려놓자. 이미 업데이트 되었다면 이 부분은 패스.

### `msysgit` 설치/업데이트

최신 버전의 `msysgit`을 설치하도록 하자. 이미 설치했다고 하더라도 아래 이미지의 옵션을 선택하지 않았다면 다시 한 번 설치한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/msysgit-01.png)

즉, Git 명령어를 윈도우 코맨드 창에서도 실행시킬 수 있어야 한다. 다음에 설명할 Bower와 비주얼스튜디오의 통합 때문에라도 이 옵션이 반드시 필요하다.

### `node.js` 설치/업데이트

이 글을 쓰는 시점에서 `node.js`의 버전은 0.10.35이다. 최신 버전의 인스톨러를 사용해 업데이트 하도록 하자.

### npm 업데이트

`node.js`를 설치했다면 `npm (Node Package Manager)` 역시도 자동으로 설치가 되어 있을 것이다. 이를 최신 버전으로 업데이트하자. 관리자모드로 코맨드 프롬프트를 열어 아래 명령어를 실행시키면 된다.

```bat
npm update -g npm
```

**NOTE** 만약 회사 방화벽 때문에 설치가 안 될 경우에는 프록시 서버를 설정해 주어야 한다. 아래 명령어를 입력하여 프록시 서버 설정을 해 준다.

```bat
npm config set proxy "http://username:password@proxy.server:port"
npm config set https-proxy "http://username:password@proxy.server:port"
```

이 때, 회사의 방화벽이 Active Directory와 연동되어 있다면 아래와 같이 방화벽 설정을 한다. 액티브 디렉토리에 필요한 백슬래시(`\`)는 반드시 인코딩한 값인 `%5C`로 넣도록 한다.

```bat
npm config set proxy "http://domain%5Cusername:password@proxy.server:port"
npm config set https-proxy "http://domain%5Cusername:password@proxy.server:port"
```

명령어 대신 `%USERPROFILE%\.npmrc` 파일을 직접 아래와 같이 수정해도 된다.

```bat
proxy="http://username:password@proxy.server:port"
https-proxy="http://username:password@proxy.server:port"
```

액티브 디렉토리 연동시에는 아래와 같다.

```bat
proxy="http://domain%5Cusername:password@proxy.server:port"
https-proxy="http://domain%5Cusername:password@proxy.server:port"
```

참고로, 액티브 디렉토리의 경우에는 성공했다는 사람도 있고 아닌 사람도 있는 걸 보면 아직까지 안정적으로 지원하지 않는 듯 하다. 또 큰 따옴표 대신 작은 따옴표로 바꿔 보면 작동하는 경우도 있다고 한다.

### Grunt 설치/업데이트

이제 Grunt를 설치할 차례이다. 관리자 모드로 코맨드 프롬프트를 열어 아래 명령어를 실행시킨다.

```bat
npm install -g grunt-cli
```

### Bower 설치/업데이트

Bower 설치시 `node.js`와 `npm`, `git`을 필요로 한다. 이미 우리는 `node.js`, `npm`, `git` 모두 설치해 놓은 상태이다. 관리자 모드로 코맨드 프롬프트를 열어 아래 명령어를 실행시킨다.

```bat
npm install -g bower
```

**NOTE** 만약 회사 방화벽 때문에 설치가 안 될 경우에는 `git` 역시도 프록시 서버를 설정해 주어야 한다. 아래 명령어를 입력하여 프록시 서버 설정을 해 준다.

```bat
git config --global http.proxy "http://username:password@proxy.server:port"
```

이 때, 회사의 방화벽이 Active Directory와 연동되어 있다면 아래와 같이 방화벽 설정을 한다. 액티브 디렉토리에 필요한 백슬래시(`\`)는 반드시 인코딩한 값인 `%5C`로 넣도록 한다.

```bat
git config --global http.proxy "http://domain%5Cusername:password@proxy.server:port"
```

`git`에서는 굳이 `HTTPS` 프록시 설정을 해주지 않아도 된다. 또한 명령어 방식 대신 `%HOMEDRIVE%\.gitconfig` 파일을 직접 수정해도 상관없다. 이 경우 아래와 같이 수정하면 된다.

```ini
[http]
    proxy = http://username:password@proxy.server:port
```

Active Directory의 경우에는 아래와 같다.

```ini
[http]
    proxy = http://domain%5Cusername:password@proxy.server:port
```

또한 Bower 자체도 프록시 설정을 해야 한다. 이는 `%USERPRIFILE%\.bowerrc` 파일을 수정하면 된다.

```json
{
    "proxy": "http://username:password@proxy.server:port",
    "https-proxy": "http://username:password@proxy.server:port"
}
```

### Gulp 설치/업데이트

Gulp도 설치한다. 관리자 모드로 코맨드 프롬프트를 열어 아래 명령어를 실행시킨다.

```bat
npm install -g gulp
```

### 비주얼스튜디오 익스텐션 설치

이제 기본적인 것들은 다 설치를 했다. 비주얼 스튜디오와 통합을 하기 위해 아래 익스텐션들을 설치한다.

- [Task Runner Explorer](https://visualstudiogallery.msdn.microsoft.com/8e1b4368-4afb-467a-bc13-9650572db708)
- [Grunt Launcher](https://visualstudiogallery.msdn.microsoft.com/dcbc5325-79ef-4b72-960e-0a51ee33a0ff)
- [Package Intellisense](https://visualstudiogallery.msdn.microsoft.com/65748cdb-4087-497e-a394-2e3449c8e61e)

이렇게 해서 개발환경 설정은 다 끝났다. 이제 실제 개발 소스와 함께 작업을 해보자.

## Grunt 패키징 – `gruntfile.js`, `package.json`

Grunt를 제대로 쓰기 위해서는 반드시 `gruntfile.js`와 `package.json` 파일이 있어야 한다. 이 두 파일이 Grunt의 동작 방식을 결정하기 때문이다. 이미 존재한다면 상관 없지만, 없다면 만들어야 한다. 여러 방법이 있을 수 있겠지만, 가장 디폴트 값으로 `gruntfile.js`와 `package.json`을 만들어주는 방법을 사용하기로 한다.

### `grunt-init` 설치

기본적인 Grunt 스카폴딩을 위해서 설치하는 패키지이다. 관리자 모드로 코맨드 프롬프트를 열어 아래와 같이 입력한다.

```bat
npm install -g grunt-init
```

이후 아래와 같이 입력하면 스카폴딩에 사용할 수 있는 템플릿들의 리스트를 확인할 수 있다.

```bat
grunt-init --help
```

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/grunt-init-01.png)

위에서 보다시피 현재 사용 가능한 템플릿은 `grunt-init-gruntfile` 하나 뿐이다. 이것을 사용하는 방법은 아래에 설명하기로 한다.

### `grunt-init-gruntfile` 템플릿 설치

`grunt-init-gruntfile`은 가장 기본적인 `gruntfile.js` 파일과 `package.json` 파일을 설치해준다. 이 템플릿을 사용하기 위해서는 다음과 같은 순서를 따른다.

- `%USERPROFILE%\.grunt-init` 디렉토리로 이동한다. 없으면 만든다.
- 아래 내용을 관리자 모드 코맨드 프롬프트에서 실행시켜 템플릿을 복제한다.

```bat
git clone --progress -v "https://github.com/gruntjs/grunt-init-gruntfile.git" "%USERPROFILE%.grunt-initgrunt-init-gruntfile"
```

- 웹 앱 프로젝트의 루트 디렉토리에서 아래 명령어를 실행시켜 템플릿을 생성한다.

```bat
grunt-init grunt-init-gruntfile
```

템플릿 생성 도중 몇가지 질문이 있는데, 디폴트로 설정하면 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/grunt-init-02.png)

이렇게 해서 만들어진 `gruntfile.js` 파일과 `package.json` 파일은 아래와 같이 비주얼스튜디오에서 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/grunt-init-03.png)

### `npm` 패키지 설치

`package.json` 파일을 프로젝트에 추가시킨 후 마우스 오른쪽 버튼을 클릭해보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/npm-package-install-01.png)

위 그림의 `NPM install packages` 메뉴를 클릭하여 `package.json`에 정의되어 있는 패키지 모듈들을 설치한다. 패키지 설치가 다 끝나면 아래와 같다. 아무런 메시지가 나오지 않아도 당황하지 말자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/npm-package-install-02.png)

프로젝트 구조 화면에 보면 `package.json` 파일에 정의된 패키지 모듈 모두 설치가 된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/npm-package-install-03.png)

이번엔 `gruntfile.js` 파일을 프로젝트에 추가시킨 후 마우스 오른쪽 버튼을 클릭해보자. 아래 그림과 같이 `Task Runner Explorer` 메뉴와 `Grunt` 메뉴가 보인다. Grunt 메뉴 아래에는 `gruntfile.js`에 정의한 타스크들을 볼 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/gruntfile-01.png)

### 추가 `npm` 패키지 설치 – Bower, LESS

모 코알라 개발자가 개발에 사용한 패키지는 모두 Bower에 LESS 라이브러리를 이용했기 때문에 Grunt에 Bower, LESS 패키지를 추가해야 한다.

Bower 패키지는 [grunt-bower-task](https://github.com/yatskevich/grunt-bower-task)를 이용하여 아래와 같이 추가할 수 있다.

```bat
npm install grunt-bower-task --save-dev
```

뒤에 따라 붙은 `--save-dev` 옵션은 `package.json` 파일에 추가하라는 의미이다. 꼭 붙이자 두번 붙이자

같은 방식으로 LESS 패키지는 [grunt-contrib-less](https://www.npmjs.com/package/grunt-contrib-less)를 이용하여 추가한다.

```bat
npm install grunt-contrib-less --save-dev
```

이후 다시 `npm install` 명령을 `package.json` 파일에서 실행하여 방금 추가한 패키지를 포함시킨다.

### Grunt 타스크 추가 – Bower, LESS

하지만 패키지만 추가했을 뿐, 실제로 Grunt에서 이를 활용할 수 있는 방법을 설정하지는 않았다. 아래와 같이 `gruntfile.js` 파일을 수정하여 Bower와 LESS가 작동할 수 있도록 한다.

```js
grunt.loadNpmTasks('grunt-bower-task');
grunt.loadNpmTasks('grunt-contrib-less');
```

위의 두 줄은 추가한 플러그인을 활성화시키는 명령어이다. 그럼 이렇게 추가한 플러그인을 어떻게 작동하게 하는지에 대한 설정을 살펴보도록 하자. 초기화 설정은 `grunt.initConfig();` 함수에 선언한다.

```json
bower: {
  install: {
    options: {
      targetDir: './lib',
      layout: 'byType',
      install: true,
      verbose: false,
      cleanTargetDir: false,
      cleanBowerDir: false,
      bowerOptions: {}
    }
  }
}
```

Bower의 기본 설정값이다. 이를 실행시키면 Bower 패키지를 `/lib` 디렉토리로 설치한다. 이 때 `targetDir` 값은 `./bower_components`를 제외한 무엇이든 될 수 있다. 이 플러그인을 실행시키면 실제로 `/bower_components`와 `/lib` 디렉토리 둘을 만들기 때문이다.

```less
less: {
  development: {
    options: {
      paths: ["less"]
    },
    files: {
      "css/main.css": "less/main.less"
    }
  }
}
```

LESS의 기본 설정값이다. 이를 실행시키면 `/less/main.less` 파일을 컴파일하여 `css/main.css`로 저장한다.

마지막으로 Alias 타스크를 설정한다. 이를 설정해두면 여러개의 타스크들을 한꺼번에 순서대로 실행시킬 수 있다.

```js
grunt.registerTask('build', ['bower', 'less']);
```

여기까지 `gruntfile.js` 파일을 수정한 후 저장한다. 이후 이 `gruntfile.js` 파일을 마우스 오른쪽 버튼으로 클릭하여 `Task Runner Explorer`를 실행시킨다.

## Grunt 빌드

Bower로 작업을 했다면 반드시 `bower.json` 파일이 존재한다. 이는 Bower를 사용하면서 쓰였던 패키지 및 각종 초기 설정들에 대한 정의 파일이다. 아래와 같이 `bower.json` 파일에 마우스 오른쪽 버튼을 클릭하면 Bower 패키지를 설치할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/bower-01.png)

하지만 우리는 이 대신 Grunt를 이용하기로 한다. 앞서 실행시킨 `Task Runner Explorer`를 보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/trx-01.png)

`gruntfile.js` 파일에 정의한 모든 타스크들을 볼 수 있다. 여기서 `Alias Tasks > build`에 마우스 오른쪽 버튼을 눌러 `Binding` 옵션을 선택하면 솔루션을 빌드하는 어느 시점에 이 Grunt 타스크를 실행시킬지 결정할 수 있다. 보통 `After Build` 옵션을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/trx-02.png)

위와 같이 설정한 후 일단 `build`를 더블클릭해보자. 그러면 Grunt가 실행되는 것이 보인다.

**NOTE** 만약 `#128` 에러를 보게 된다면 이것은 `git`의 방화벽 설정 때문인데, `git`의 글로벌 설정보다는 프로젝트별 설정을 추가하는 것이 좋다. 아무래도 이것은 Bower 자체의 버그 같다. 코맨드 프롬프트에서 아래와 같이 입력한다.

```bat
git config http.proxy "http://username:password@proxy.server:port"
```

아니면 프로젝트내 `.git/config` 파일을 직접 수정해도 좋다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/trx-03.png)

위 그림과 같이 `gruntfile.js`에 정의한 대로 파일이 지정한 디렉토리에 생성된 것을 확인할 수 있다. 이를 프로젝트 트리에서 확인하면 다음과 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/01/trx-04.png)

앞서 언급한 바와 같이 `grunt-bower-task`를 통해서는 `/bower_components`와 `/lib` 두 디렉토리가 만들어졌고, 이를 바탕으로 `/Less` 디렉토리의 파일들과 함께 `grunt-contrib-less`를 통해서는 컴파일된 `main.css` 파일이 `/css` 디렉토리에 만들어졌다.

## 마치며

지금까지 Grunt와 Bower를 비주얼스튜디오와 연동시켜 어떻게 작업을 할 수 있는지에 대해 알아보았다. 이 모든 것은 사실 다음 버전의 비주얼스튜디오 15 안에는 모두 포함이 되어 있기 때문에 앞으로는 딱히 복잡하진 않을 것이다. 다만 현재 비주얼스튜디오 13 버전에서는 이와 같은 추가 작업이 필요하긴 하다.

또한 소스코드 관리를 위해서는 사실 `bower_components`, `lib`, `node_modules` 디렉토리들은 필요가 없으므로 프로젝트에 포함시키지 않아도 상관없지만, 이를 관리해주는 메타 파일들인 `gruntfile.js`, `package.json`, `bower.json` 파일들은 반드시 프로젝트에 포함시켜놓아야 한다.

조금은 복잡해 보이지만 이렇게 함으로써 비주얼스튜디오를 좀 더 강력하게 활용할 수 있게 되었다.
