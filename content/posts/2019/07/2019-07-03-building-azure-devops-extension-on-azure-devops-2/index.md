---
title: "애저 데브옵스 확장 기능을 애저 데브옵스에서 개발하기 - 개발편"
date: "2019-07-03"
slug: building-azure-devops-extension-on-azure-devops-2
description: ""
author: Justin Yoo
tags:
- Visual Studio ALM
- Azure DevOps
- Extensions
- ALM
- Implementation
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)를 통해 [애저 데브옵스](https://azure.microsoft.com/ko-kr/services/devops/) 확장 기능의 기본적인 설계를 끝마쳤다면, 이 포스트에서는 설계대로 실제 개발을 해 보도록 한다.

## 목차

1. [애저 데브옵스 확장 기능 개발하기 - 설계편](https://blog.aliencube.org/ko/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)
2. **_애저 데브옵스 확장 기능 개발하기 - 개발편_**
3. [애저 데브옵스 확장 기능 개발하기 - 배포편 계정 생성](https://blog.aliencube.org/ko/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)
4. [애저 데브옵스 확장 기능 개발하기 - 수동 배포편](https://blog.aliencube.org/ko/2019/07/17/building-azure-devops-extension-on-azure-devops-4/)
5. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 1](https://blog.aliencube.org/ko/2019/07/24/building-azure-devops-extension-on-azure-devops-5/)
6. [애저 데브옵스 확장 기능 개발하기 - 자동 배포편 2](https://blog.aliencube.org/ko/2019/07/31/building-azure-devops-extension-on-azure-devops-6/)

## 사용자 케이스

개인적으로 [휴고](https://gohugo.io/)라는 정적 웹사이트 생성도구를 이용해서 웹사이트를 하나 만들어 보는 중인데, [휴고 확장 기능](https://marketplace.visualstudio.com/items?itemName=giuliovdev.hugo-extension)은 애저 데브옵스에서 찾을 수 있었지만, 이를 [Netlify](https://netlify.com)로 배포하는 확장 기능은 찾을 수 없었다. 따라서, 실제로 이 [Netlify](https://netlify.com) 확장 기능을 개발해 보도록 하자.

> 현재 Netlify 확장 기능은 [마켓플레이스에 이미 배포되었고](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions), 실제 곧바로 사용할 수 있다. 이 포스트는 이 확장 기능을 개발하면서 실제 마주쳤던, 공식 문서에 구체적인 설명이 없지만 개발하면서 필요한 여러 가지 상황들을 기록하는 의미도 지니고 있다. 또한 이 확장 기능은 [이곳 깃헙 리포지토리](https://github.com/aliencube/AzureDevOps.Extensions)에서 관련 소스 코드를 확인할 수 있다.

## 애저 데브옵스 확장 기능 개발하기

지난 포스트에서 설계한 바에 따르면 `task.json`에서 `index.js` 파일을 호출하게끔 해 놓았다. 그렇다면 실제로 이 `index.js`를 만들어 보자.

이 확장 기능 개발을 위해서는 [타입스크립트](https://www.typescriptlang.org/)가 필요하다. 만약 자신의 컴퓨터에 타입스크립트를 설치하지 않았다면 아래 명령어를 통해 타입스크립트를 먼저 설치하자.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-install-typescript.cmd

### 기본 구조 설정

각각의 작업 확장 기능은 `task.json`에서 정의한 바와 같이 node.js를 이용해서 개발한다. `install`, `deploy` 둘 다 node.js 모듈들이 필요하므로 `src` 폴더 바로 아래에서 두 작업 모두 적용할 수 있게끔 아래와 명령어를 통해 node.js 패키지인 `package.json` 파일을 생성한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-init.cmd

그 다음에는 아래 명령어를 통해 [`azure-pipelines-task-lib`](https://github.com/microsoft/azure-pipelines-task-lib) 패키지 및 타입스크립트 타이핑 패키지를 설치한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-install-packages.cmd

마지막으로 타입스크립트 환경 설정 파일을 아래 명령어를 통해 생성한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=tsc-init.cmd

이렇게 만들어진 `tsconfig.json` 파일을 열어 컴파일 옵션을 `ES5`에서 `ES6`로 바꿔준다. 이렇게 해서 모든 기본적인 개발을 위한 구조 설정은 끝났다. 여기까지 하면 대략 아래와 같은 폴더 및 파일 구조가 생기게 된다. 즉 `src` 폴더 아래 `package.json`, `package-lock.json`, `tsconfig.json` 이렇게 세 파일이 생기고, `node_modules` 폴더 아래 앞서 설치한 모든 npm 패키지들이 들어간다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-2-01.png)

`package.json` 파일의 내용은 신경쓰지 않도록 한다. 애저 데브옵스 확장 기능과는 상관 없기도 하고, npm 패키지로 배포하지 않기 때문이기도 하다.

### `install` 작업 개발

이제 실제로 작업 확장 기능을 개발할 차례이다. 먼저 `index.ts` 파일을 `install` 폴더 아래에 생성하고 아래 내용을 입력한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=bolierplate-index.ts

가장 쉽게 시작할 수 있는 보일러플레이트 템플릿이라고 생각하면 틀림없다. 물론 더 복잡하게 시작할 수 있기도 하지만, 그건 이 포스트의 내용이 아니므로 생략한다.

가장 먼저 필요한 모듈들을 불러들이고, `run()`이라는 함수를 선언한 후 마지막으로 이 `run()` 함수를 실행시킨다. 우리가 필요로 하는 모든 로직은 바로 이 `run()` 함수 안에 밀어넣기만 하면 되는 셈이다. 이제 실제 함수 내용을 만들어 보자. 아래 내용을 `run()` 함수 안에 입력한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=install.ts

이 작업의 목적은 `netlify-cli`를 파이프라인에 설치하는 것이다. 정확하게는 이 작업이 실행하는 명령어는 아래와 같다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=npm-install-netlify-cli.cmd

이를 위해서는 버전 정보만 알고 있으면 되기 때문에 [이전 포스트](https://blog.aliencube.org/ko/2019/06/26/building-azure-devops-extension-on-azure-devops-1/)에서 버전 정보를 입력 받았다.

이렇게 입력 받은 버전 정보는 `getInput('version', false)` 라는 함수 호출을 통해 가져온다. 여기서 `version`이라는 값은 `task.json`에서 정의한 입력 변수 이름이다. 만약 이 입력 변수 이름이 `task.json`과 `index.ts`에서 다르다면 에러가 생기니 꼭 확인하도록 하자.

`try` 블록 안의 마지막 줄에 보면 `exec('npm', args)` 라는 함수를 호출하는데, 이 함수 호출을 통해 실제로 `netlify-cli` npm 패키지를 파이프라인에 설치한다. 그리고 이 때 전달하는 `args` 배열 값은 그 위에 선언한 `args.push()` 함수를 보면 알 수 있다.

> 이 작업에서는 `getInput()`, `exec()` 함수 두 가지만 사용했지만, 다른 함수들도 많이 있다. [이 문서](https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/docs/azure-pipelines-task-lib.md)를 통해 다양한 레퍼런스 API를 확인할 수 있다.

전체적으로 어느 부분에서건 에러가 발생하면 이 작업을 중단하고 전체 파이프라인을 멈춰야 하기 때문에 `try...catch` 블록으로 감싸놓은 것을 확인할 수 있다.

### `deploy` 작업 개발

이번에는 `deploy` 작업 확장 기능을 개발해 보도록 하자. 전체적인 작업 프로세스는 앞서 언급했던 `install` 작업 확장 기능과 동일하다. 먼저 `deploy` 폴더 아래에 `index.ts` 파일을 생성하고 위에 언급한 보일러플레이트 코드를 입력한다. 이후 `run()` 함수 안에 아래 코드를 입력한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=deploy.ts

이 작업을 통해 실행하려고 하는 명령어는 아래와 같다:

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=netlify-deploy.cmd

이를 위해 `task.json` 파일에서 여러 가지 값들을 입력 받았고, 이 함수 안에서 사용하는 것이다. 다른 부분은 앞서와 동일하기 때문에 언급하지 않겠지만, 입력 변수를 읽어들이는 부분만 짚어보도록 하자. 문자열 변수를 위해서는 `getInput()`, 경로명 변수를 위해서는 `getPathInput()`, 불리언 변수를 위해서는 `getBoolInput()` 함수를 사용했다.

### 로컬 테스트

이제 모든 개발은 끝났으니, 실제로 이 작업 확장 기능이 제대로 작동하는지 확인해 볼 차례이다. 확장 기능을 출판하기에 앞서 로컬 개발 환경에서 테스트 해 보도록 하자. `src` 폴더 아래에 `tsconfig.json` 파일이 있으므로 그 위치에서 아래 명령어를 실행한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=tsc-compile.cmd

이렇게 하면 알아서 모든 `.ts` 파일을 `.js` 파일로 컴파일해 준다. `install/index.js`, `deploy.index.js` 파일이 만들어진 것을 확인할 수 있다. `install` 작업에는 `version` 변수값이 필요한데, 그렇다면 이 값은 어떻게 전달할 수 있을까? `run()` 함수는 그 값을 받아들일 준비가 전혀 되어 있지 않고 그 안에서 `getInput()` 함수를 통해 값을 받아온다. [공식 문서](https://docs.microsoft.com/ko-kr/azure/devops/extend/develop/add-build-task#run-the-task)에서는 환경 변수에 값을 설정해서 받아오라고 되어 있다. 즉 아래와 같이 먼저 환경 변수를 설정한다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=set-environment-variable.cmd

이렇게 설정한 후 아래 명령어를 통해 `install` 작업 확장 기능을 실행시킨다.

https://gist.github.com/justinyoo/baf3ecf3240df3037be0f84fe43b5425?file=node-run.cmd

이렇게 하면 문제 없이 `install` 작업이 실행된 것을 확인할 수 있다. 마찬가지로 `deploy/index.js` 파일도 먼저 환경 변수를 통해 변수값들을 설정하고 실행시키면 된다.

* * *

여기까지 해서 애저 데브옵스 확장 기능 개발 과정이 모두 끝났다. 개발을 마친 후 폴더 구조는 대략 아래와 같은 모습이 될 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/06/building-azure-devops-extension-on-azure-devops-2-02.png)

[다음 포스트](https://blog.aliencube.org/ko/2019/07/10/building-azure-devops-extension-on-azure-devops-3/)에서는 배포를 위한 마켓플레이스 퍼블리셔 등록 절차에 대해 간략하게 짚어보도록 하자.

## 참고 자료

- [빌드/릴리즈 작업 확장 기능 개발하기](https://docs.microsoft.com/ko-kr/azure/devops/extend/develop/add-build-task)
- [애저 파이프라인 작업 확장 기능 SDK](https://github.com/microsoft/azure-pipelines-task-lib)
- [node.js용 애저 파이프라인 작업 확장 기능 SDK](https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/README.md)
- [애저 파이프라인 작업 확장 기능 SDK - 타입스크립트 API](https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/docs/azure-pipelines-task-lib.md)
- [애저 파이프라인 작업 확장 기능 공식 샘플](https://github.com/microsoft/azure-pipelines-tasks)
- [Netlify CLI (문서)](https://www.netlify.com/docs/cli/)
- [Netlify CLI (npm 패키지)](https://www.npmjs.com/package/netlify-cli)
- [Netlify 확장 기능 (마켓플레이스)](https://marketplace.visualstudio.com/items?itemName=aliencube.netlify-cli-extensions)
- [Netlify 확장 기능 (소스 코드)](https://github.com/aliencube/AzureDevOps.Extensions/tree/master/Netlify)
