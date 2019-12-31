---
title: "애저 펑션을 이용해서 애저 키 저장소 시크릿을 백업/복원하기"
date: "2019-11-27"
slug: backup-restore-key-vault-secrets-via-function-apps
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure Functions
- Azure Key Vault
- Azure Blob Storage
- Backup
- Restore
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-with-function-apps-00.png
---

[지난 포스트](https://blog.aliencube.org/ko/2019/11/21/backup-restore-key-vault-secrets-via-logic-apps/)에서는 [애저 로직 앱](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo)을 이용해서 [애저 키 저장소](https://docs.microsoft.com/ko-kr/azure/key-vault/key-vault-overview?WT.mc_id=aliencubeorg-blog-juyoo)를 백업하고 복구하는 방법에 대해 알아 보았다. 로직 앱을 사용하면 코드를 거의 사용할 일이 없기 때문에 굉장히 편리한 점이 있긴 하지만, 반대로 코드를 통해 키 저장소의 시크릿 값들을 백업하고 복구하는 요구사항도 분명히 있게 마련이다. 따라서, 이 포스트에서는 [애저 펑션 앱](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo)을 통해 키 저장소의 시크릿 값들을 백업하고 복구하는 방법에 대해 알아보기로 한다.

> 이 포스트에 쓰인 펑션 앱 코드는 [이 깃헙 리포지토리](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample)에서 다운로드 받을 수 있다.

## 애저 펑션에 관리 ID 활성화 시키기

애저 펑션이 키 저장소에 손쉽게 접근하기 위해서는 우선 [관리 ID](https://docs.microsoft.com/ko-kr/azure/app-service/overview-managed-identity?tabs=dotnet&WT.mc_id=aliencubeorg-blog-juyoo) 기능이 활성화 되어 있어야 한다. 이와 관련해서는 [이전 포스트](https://blog.aliencube.org/ko/2019/01/03/accessing-key-vault-from-azure-functions-with-managed-identity/)에서 이미 한 번 다룬 적이 있으므로 여기서는 더이상 언급하지는 않기로 한다.

## 키 저장소 백업 워크플로우

[이전 포스트](https://blog.aliencube.org/ko/2019/11/21/backup-restore-key-vault-secrets-via-logic-apps/)에서 다룬 바와 같이 키 저장소 백업을 위한 워크플로우는 동일하다.

1. 시크릿 리스트를 가져온다
2. 리스트를 루프로 돌며 개별적으로 시크릿을 백업한다
3. 백업 결과를 배열로 저장한다
4. 배열을 직렬화해서 [애저 블롭 저장소](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=aliencubeorg-blog-juyoo)에 업로드한다

아래와 같이 전체 시크릿 리스트를 가져오는 코드를 작성한다. 이 코드를 실행시키면 시크릿 이름들을 리스트로 반환한다.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=get-secrets.cs

이 시크릿 리스트를 이용해서 다음에는 개별 시크릿들을 백업한다. 현재 한 번에 벌크로 백업하는 기능은 지원하지 않으므로 아래와 같은 방식으로 반복문을 돌려야 한다.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=backup-secrets.cs

이제 백업 결과를 리스트로 받았으니, 이를 애저 블롭 저장소에 업로드 할 차례이다. 아래 코드를 실행시켜 리스트를 직렬화한 후 업로드한다.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=upload.cs

코드가 완성이 되었다. 이제 이를 HTTP 트리거 안에서 하나의 워크플로우로 만들어 호출한다.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=backup-trigger.cs

실제로 제대로 작동하는지 우선 로컬 개발 환경에서 확인해 보도록 하자. 로컬 개발 환경에서 [관리 ID](https://docs.microsoft.com/ko-kr/azure/app-service/overview-managed-identity?tabs=dotnet&WT.mc_id=aliencubeorg-blog-juyoo) 기능을 사용하려면 [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=aliencubeorg-blog-juyoo)로 먼저 [로그인을 한 상태](https://docs.microsoft.com/ko-kr/samples/azure-samples/app-service-msi-keyvault-dotnet/keyvault-msi-appservice-sample/?WT.mc_id=aliencubeorg-blog-juyoo#step-5-run-the-application-on-your-local-development-machine)여야 한다. 실제로 VS 코드에서 디버깅 모드를 실행시킨 후 [포스트맨](https://getpostman.com/)으로 호출해 보면 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-with-function-apps-01.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-with-function-apps-02.png)

로컬 애저 블롭 저장소 에뮬레이터인 [Azurite](https://docs.microsoft.com/ko-kr/azure/storage/common/storage-use-azurite?WT.mc_id=aliencubeorg-blog-juyoo)에 제대로 잘 저장된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-with-function-apps-03.png)

지금까지 [애저 키 저장소](https://docs.microsoft.com/ko-kr/azure/key-vault/key-vault-overview?WT.mc_id=aliencubeorg-blog-juyoo)의 시크릿 값들을 [애저 펑션](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-overview?WT.mc_id=aliencubeorg-blog-juyoo)을 이용해서 [애저 블롭 저장소](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=aliencubeorg-blog-juyoo)에 백업하는 방법에 대해 알아 보았다.

## 키 저장소 복구 워크플로우

[이전 포스트](https://blog.aliencube.org/ko/2019/11/21/backup-restore-key-vault-secrets-via-logic-apps/)에서는 일단 모든 백업 파일의 리스트를 가져와서 최신 백업 파일을 찾아 복구하는 워크플로우였다면, 이번에는 특정 일자의 백업 파일을 복구하는 워크플로우를 만들어 보자. 대략의 워크플로우는 아래와 같다.

1. 복구하고자 하는 날짜의 타임스탬프 값을 입력 받는다
2. 애저 블롭 저장소에서 타임스탬프에 해당하는 백업 파일을 다운로드 받는다
3. 다운로드 받은 파일을 비직렬화한다
4. 키 저장소에 복구한다

타임스탬프는 `yyyyMMdd`의 형식이고 이는 펑션 엔드포인트의 URL을 통해 입력받는다. 이 타임스탬프를 통해 애저 블롭 저장소에서 다운로드 받는 부분은 아래와 같다.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=download.cs

다운로드 받은 파일을 비직렬화해서 반환하면 이 내용을 받은 아래 메소드는 반복문을 실행하면서 복구한다.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=restore-secrets.cs

이렇게 기본적인 복구 로직이 완성되었으니, 이를 애저 펑션 트리거에 워크플로우를 만들어 구성해 보자.

https://gist.github.com/justinyoo/1b7ee5e2fb0829bf74dfdfd2ee2f6c72?file=restore-trigger.cs

이렇게 만들어진 워크플로우를 포스트맨에서 실행시켜 보면 아래와 같은 결과를 받는다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-with-function-apps-04.png)

그리고, 실제로 애저 키 저장소에 이렇게 복구가 됐다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-with-function-apps-05.png)

* * *

지금까지 애저 펑션을 이용해서 애저 키 저장소의 시크릿 값들을 백업하고 복구하는 절차에 대해 알아보았다. 이 포스트에 올라온 코드는 제대로 작동을 하기는 하지만, 편의상 불필요한 부분은 생략하고 핵심만 나타냈다. 전체 코드라고 해도 생각보다 까다롭지는 않으므로 실제로 [리포지토리](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample)에서 다운로드 받은 후, 애저 클라우드에 [무료](https://azure.microsoft.com/ko-kr/free/?WT.mc_id=aliencubeorg-github-juyoo)로 계정을 만들어서 연습해 보자.
