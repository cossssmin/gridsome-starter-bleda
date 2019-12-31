---
title: "로직 앱을 이용해서 애저 키 저장소 시크릿을 백업/복원하기"
date: "2019-11-21"
slug: backup-restore-key-vault-secrets-via-logic-apps
description: ""
author: Justin Yoo
tags:
- Enterprise Integration
- Azure Logic Apps
- Azure Key Vault
- Backup
- Restore
fullscreen: true
cover: https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-00.png
---

[애저 키 저장소](https://docs.microsoft.com/ko-kr/azure/key-vault/key-vault-overview?WT.mc_id=aliencubeorg-blog-juyoo)를 쓰다 보면 이를 백업하고 복구해야 할 필요가 있다. 현재는 키 저장소 인스턴스 전체를 백업하고 복구하는 기능은 없고, 대신 개별 시크릿, 인증서, 키 등을 백업 및 복구하는 기능이 있다. 하지만, 일반적으로는 키 저장소에 하나만 저장하지 않고 수십개의 시크릿을 저장하게 되는데, 이럴 경우에 개별적으로 시크릿을 백업하고 복구하는 것이 쉽지는 않다. 물론 [애저 이벤트 그리드](https://docs.microsoft.com/ko-kr/azure/event-grid/overview?WT.mc_id=aliencubeorg-blog-juyoo)를 이용해서 [상태 변화를 모니터링](https://docs.microsoft.com/ko-kr/azure/key-vault/event-grid-overview?WT.mc_id=aliencubeorg-blog-juyoo)할 수도 있지만, 이는 백업에는 유효하지만 복구에는 그다지 유효하지 않다. 이 포스트에서는 [애저 로직 앱](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-overview?WT.mc_id=aliencubeorg-blog-juyoo)의 워크플로우와 [관리 ID](https://docs.microsoft.com/ko-kr/azure/logic-apps/create-managed-service-identity?WT.mc_id=aliencubeorg-blog-juyoo) 기능을 이용해서 키 저장소의 시크릿을 벌크로 백업하고 복구하는 방법에 대해 알아보기로 한다.

> 이 포스트에 쓰인 로직 앱과 관련 ARM 템플릿은 [이 깃헙 리포지토리](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample)에서 다운로드 받을 수 있다.

## 키 저장소 백업 워크플로우

먼저 키 저장소에 다음과 같이 네 개의 시크릿이 저장되어 있다고 가정을 하자. 실제로는 더 많겠지만, 여기서 쓸 예제로는 이 네 개 정도로도 충분하다. 각각의 시크릿은 업데이트 될 때마다 변경 이력을 보관하기 때문에 백업/복구시 이 변경 이력도 함께 따라다닌다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-01.png)

이 키 저장소에 저장된 시크릿 값들을 백업하는 워크플로우를 로직앱에서 작성해 보자. 애저 포탈에서 로직 앱 인스턴스를 생성한다. 현재 로직 앱은 한국 지역을 지원하지 않으므로, 일본 서부 (Japan West) 혹은 홍콩 (East Asia), 싱가폴 (Southeast Asia) 지역을 이용하는 것이 가장 네트워크 레이턴시가 적다. 로직 앱 인스턴스를 생성했다면 [관리 ID](https://docs.microsoft.com/ko-kr/azure/logic-apps/create-managed-service-identity?WT.mc_id=aliencubeorg-blog-juyoo) 기능을 활성화 시켜 키 저장소에 직접 접근이 가능하게끔 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-02.png)

관리 ID 기능을 활성화 시키면 `ObjectId` 값이 만들어지는데, 이 값을 이용해서 키 저장소의 접근 권한에서 로직 앱을 추가한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-03.png)

로직 앱 인스턴스를 생성한 후 가장 먼저 HTTP 트리거를 추가한다. 현재는 HTTP 트리거로 작성하지만, 만약 주기적으로 이 로직 앱을 실행시키려면 타이머 트리거를 실행시키는 것이 좋다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-04.png)

이제 아래 액션들을 추가하는 것으로 워크플로우를 만들어 보도록 하자. 키 저장소에 있는 모든 시크릿을 백업하는 것이 목표이므로, 개별 시크릿 백업을 하나의 배열에 추가해야 한다. 아래와 같이 `BackupItems`라는 이름의 변수를 만들고 `Array` 타입을 지정한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-05.png)

아래는 키 저장소의 RESTful API를 호출하는 액션이다. 현재 키 저장소와 연결하는 로직 앱 커넥터는 백업과 복구를 지원하지 않으므로 커넥터를 사용하는 대신 API를 직접 호출하는 방식으로 한다. 이와 관련해서 좀 더 알아보고 싶다면 [애저 로직앱에서 키 저장소로 직접 접근하기](https://blog.aliencube.org/ko/2018/10/24/accessing-key-vault-from-logic-apps-with-managed-identity/) 포스트를 참조하면 좋다.

- `URI`: 키 저장소의 시크릿 리스트를 가져오는 엔드포인트이다. 보통 `https://[키 저장소 이름].vault.azure.net/secrets`와 같은 형태이다.
- `Queries`: API를 호출할 때 API 버전을 지정해야 한다. 현재 지원하는 API 버전은 `7.0`이다.
- `Authentication`: `Managed Identity` 값을 선택한다.
- `Audience`: `https://vault.azure.net` 값을 입력한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-06.png)

위 액션을 실행시키면 현재 키 저장소에 저장된 모든 시크릿의 리스트를 배열로 가져올 수 있다. 따라서, 아래와 같이 `ForEach` 액션을 통해 시크릿 리스트를 루프로 돌린다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-07.png)

위에서 실행한 시크릿 리스트를 가져오는 RESTful API와 마찬가지로 아래와 같이 HTTP 액션을 통해 개별적으로 백업을 진행한다. 흥미로운 것은 백업을 별도의 저장소로 하는 것이 아니라 백업의 결과를 이 HTTP 액션의 응답으로 돌려준다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-08.png)

위의 액션에서 받아온 백업 결과를 맨 처음에 선언한 배열 변수에 아래와 같이 추가한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-09.png)

모든 시크릿이 백업이 됐고, 배열에 추가됐다면, 아래와 같이 최종적으로 배열 값을 확인한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-10.png)

마지막으로 아래와 같이 [애저 블롭 스토리지](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=aliencubeorg-blog-juyoo)에 배열값을 저장한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-11.png)

이렇게 해서 키 저장소의 시크릿 값이 애저 블롭 스토리지에 저장되었다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-12.png)

여기까지 해서 로직 앱을 이용해 애저 블롭 스토리지에 키 저장소의 시크릿 값을 벌크로 백업하는 기능에 대해 알아보았다.

## 키 저장소 복구 워크플로우

앞서와 같이 키 저장소의 시크릿을 백업했다면 이제 복구하는 절차에 대해서도 알아보도록 하자. 복구하는 절차 역시 앞서 백업하는 절차와 크게 다르지 않다. 한가지 차이가 있다면 여러 개의 백업 파일 중 최신 백업 파일을 선택해서 복구하는 로직이 들어가야 하는데, 이는 [지난 포스트](https://blog.aliencube.org/ko/2019/11/14/getting-the-latest-array-item-with-inline-script-in-logic-app/)에서 다뤄본 적이 있으므로 여기에서 적절하게 사용하면 된다.

로직 앱 인스턴스를 생성한 후 가장 먼저 해야 할 일은 [관리 ID](https://docs.microsoft.com/ko-kr/azure/logic-apps/create-managed-service-identity?WT.mc_id=aliencubeorg-blog-juyoo) 기능을 활성화 시키는 것이다. 이는 위에 다루었으므로 다시 언급하지는 않겠다. 두번째로 해야 할 일은 로직 앱에 [통합 어카운트](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-enterprise-integration-create-integration-account?WT.mc_id=aliencubeorg-blog-juyoo) 인스턴스를 연결하는 것이다. 통합 어카운트를 연결해야 [인라인 자바스크립트 코드 액션](https://docs.microsoft.com/ko-kr/azure/logic-apps/logic-apps-add-run-inline-code?WT.mc_id=aliencubeorg-blog-juyoo)을 사용할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-13.png)

이제 키 저장소 복구를 위한 로직 앱 인스턴스 설정은 끝났으니 워크플로우를 아래와 같이 만들어 보도록 하자. 먼저 HTTP 트리거를 추가한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-14.png)

이제 애저 블롭 스토리지에서 백업 파일의 리스트를 가져온다. 이 리스트는 배열의 형태로 되어 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-16.png)

이 액션이 키 저장소 복구의 핵심이라고 할 수 있다. 배열의 형태로 받아온 백업 파일 리스트에서 가장 최신의 파일을 아래 인라인 자바스크립트 액션을 통해 가려낸다. 인라인 자바스크립트 코드는 [지난 포스트](https://blog.aliencube.org/ko/2019/11/14/getting-the-latest-array-item-with-inline-script-in-logic-app/)에서 언급한 바 있으므로 여기서 다시 언급하지는 않도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-17.png)

위 액션에서 찾은 최신 백업 파일을 통해 애저 블롭 스토리지에서 파일을 다운로드 받는다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-18.png)

이 파일의 내용은 Base64 인코딩이 되어 있는 문자열의 형태이므로, 이를 로직 앱 워크플로우에서 사용하기 위해서는 우선 디코딩을 하고, JSON 객체 형태로 변환시켜야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-19.png)

JSON 형태로 변환이 끝나면 이는 모든 시크릿 값의 배열이므로 이를 아래와 같이 루프를 통해 돌린다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-20.png)

그리고 그 루프 안에는 RESTful API를 호출할 수 있는 HTTP 액션을 아래와 같이 추가한다.

- `URI`: 키 저장소에 시크릿을 복구하는 엔드포인트이다. 보통 `https://[키 저장소 이름].vault.azure.net/secrets/restore`와 같은 형태이다.
- `Queries`: API를 호출할 때 API 버전을 지정해야 한다. 현재 지원하는 API 버전은 `7.0`이다.
- `Authentication`: `Managed Identity` 값을 선택한다.
- `Audience`: `https://vault.azure.net` 값을 입력한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-21.png)

이렇게 해서 모든 시크릿 값이 새 키 저장소에 복구가 되면 아래 액션을 실행시켜 새 키 저장소에 복구된 시크릿 리스트를 불러온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-22.png)

새 키 저장소에는 아래와 같이 복구된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2019/11/backup-restore-key-vault-secrets-via-logic-apps-23.png)

이렇게 해서 애저 블롭 스토리지에 저장된 키 저장소 백업 파일을 복구하는 로직 앱을 작성해 보았다.

## ARM 템플릿 실행

이 모든 것은 사실 ARM 템플릿 몇 개만 실행시키면 된다. 위에 언급한 [깃헙 리포지토리](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample)에서 다운로드 받은 ARM 템플릿을 아래의 순서로 실행시켜 보자.

1. 통합 어카운트: [`integrationAccount.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/integrationAccount.json)
2. 스토리지 어카운트: [`storageAccount.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/storageAccount.json)
3. 애저 블롭 스토리지 커넥터: [`connection.azureblob.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/connection.azureblob.json)
4. 백업용 로직 앱: [`logicApp.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/logicApp.json)
5. 복구용 로직 앱: [`logicApp.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/logicApp.json)
6. 백업용 키 저장소: [`keyVault.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/keyVault.json)
7. 복구용 키 저장소: [`keyVault.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/Resources/keyVault.json)

위의 파일들을 아래와 같이 애저 파워셸 명령어를 이용해서 하나씩 실행시키면 된다.

https://gist.github.com/justinyoo/352b643439878367a9a3d44f1b808b07?file=new-azresourcegroupdeployment.txt

이렇게 하면 필요한 모든 리소스들이 만들어진다. 마지막으로 로직 앱 워크플로우를 로직 앱 인스턴스에 추가하기 위해서는 아래 파워셸 스크립트를 실행시킨다.

1. 백업: [`backup.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/LogicApps/backup.json)
2. 복구: [`restore.json`](https://github.com/devkimchi/Key-Vault-Backup-Restore-Sample/blob/master/src/LogicApps/restore.json)

https://gist.github.com/justinyoo/352b643439878367a9a3d44f1b808b07?file=set-logicappworkflow.txt

* * *

지금까지 애저 로직 앱을 이용해서 키 저장소의 시크릿 값들을 벌크로 백업하고 복구하는 방법에 대해 알아보았다. 생각보다 까다롭지는 않으므로 실제로 애저 클라우드에 [무료](https://azure.microsoft.com/ko-kr/free/?WT.mc_id=aliencubeorg-github-juyoo)로 계정을 만들어서 연습해 보자.
