---
title: "25일간의 서버리스 챌린지 (22일차): 동짓날 저승 사자로부터 철수를 보호하라!"
date: "2019-12-23"
slug: 25-days-of-serverless-day-22-winter-solstice-protect-secrets-from-grim-reaper
description: ""
author: Justin Yoo
tags:
- Azure App Service
- '25 Days of Serverless'
- Azure Blob Storage
- Azure Functions
- Azure Key Vault
- Backup
- Restore
- Serverless Challenges
fullscreen: true
cover: https://res.cloudinary.com/jen-looper/image/upload/v1575489111/images/challenge-22_glk8t3.jpg
---

이 포스트는 [#25DaysOfServerless](https://25daysofserverless.com)라는 해시태그와 함께 진행하는 이벤트의 한 부분입니다. 12월 한 달간 Microsoft 클라우드 아드보캇들이 하루에 하나씩 도전 과제를 제시합니다. 만약 애저의 서버리스 펑션에 대해 궁금하다면 [이 링크](https://docs.microsoft.com/ko-kr/azure/azure-functions/?WT.mc_id=25days_devto-blog-cxa)를 클릭해서 보시면 도움이 될 겁니다.

이 도전 과제에 대해 좋은 의견이나 아이디어, 해법이 있다면 <a href="https://twitter.com/intent/tweet?text=I'm joining the @azureadvocates 25DaysOfServerless challenge!! Learn more at https://aka.ms/25daysofserverless or see solutions at https://dev.to/search?q=25DaysOfServerless! Join me!" target="_blank">트위터</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>와 같은 SNS를 통해 의견을 공유해 보도록 하시죠!

* * *

## 도전 과제

한국에 오신 것을 환영합니다! 오늘은 동짓날인데요, 옛날부터 한국에서는 동짓날이면 저승 사자들이 어린 아이들의 영혼을 거둬 데리고 간다고 합니다. 그런데, 아이들이 만약 잠들기 전에 팥죽을 먹는다면 저승 사자들은 아이들을 찾을 수 없게 되어 아이들의 영혼을 구할 수 있다고 믿습니다. 그래서 한국에서는 모든 아이들이 동짓날 팥죽을 먹는 습관이 있답니다.

![porridge](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/red-bean-porridge.png)

어머나, 그런데 이를 어쩌지요? 철수가 팥죽 먹는 것을 깜빡했어요! 이제 철수는 저승 사자에게 잡혀갈 처지가 됐습니다. 우리는 철수를 안전한 곳으로 대피시키고 문을 잠가서 그 다음날 해가 뜰 때 까지 저승 사자가 들어갈 수 없게 해야 해요. 철수의 가장 친한 친구인 영희가 문을 잠그고 난 후, 다시 문을 여는 비밀 코드를 받았습니다.

![memo](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/memo.png)

그리고, 애저 키 저장소에 이 비밀 코드를 안전하게 저장했어요. 그런데, 저승 사자는 더 영리하군요. 저승 사자는 아예 키 저장소 자체를 통째로 부숴 버리려고 하고 있어요! 키 저장소가 부서지면 그 안에 저장시켜 놓은 비밀 코드 역시 없어지게 되고, 철수는 영원히 나올 수 없게 된답니다! 영희가 이 키 저장소를 백업하고 복구하는 방법을 빨리 찾아내지 못한다면 철수는 영원히 그 안에 갇혀 있다가 죽게 될 거예요!

우리의 미션은 저승 사자보다 먼저 영희가 키 저장소를 백업하는 방법을 알아낼 수 있게끔 도와주는 겁니다. 심지어 저승 사자가 키 저장소를 부쉈을 때도 우리는 영희를 도와서 그걸 복구 할 수 있어야 해요. 어떻게 영희를 도와줄 수 있을까요?

## 준비물

### 애저 계정

아직 애저에 계정이 없으신가요? 그렇다면 [무료로 만들 수 있습니다](https://azure.microsoft.com/ko-kr/free/?WT.mc_id=25days_devto-blog-cxa). 이 무료 계정에는 대략 22만 5천원 상당의 무료 크레딧이 제공이 되는데, 이것으로 이 도전과제를 수행하기에는 충분합니다.

### 애저 CLI

[애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=25days_devto-blog-cxa)는 크로스 플랫폼 도구로서 애저 리소스를 콘솔창에서 관리하기 쉽게 해 줍니다. [이 링크](https://docs.microsoft.com/ko-kr/cli/azure/install-azure-cli?view=azure-cli-latest&WT.mc_id=25days_devto-blog-cxa)를 통해 애저 CLI를 설치하세요.

## 샘플 소스 코드 다운로드

이 포스트에 쓰인 샘플 코드의 전체 소스는 [깃헙 리포지토리](https://github.com/justinyoo/25-days-of-serverless)에서 다운로드 받을 수 있습니다.

## 리소스 설치

이 도전 과제를 해결하기 위해서는 애저에 리소스를 먼저 설치해야 합니다. 아래 버튼을 클릭해서 리소스를 설치하세요.

[![Deploy to Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fjustinyoo%2F25-days-of-serverless%2Fmaster%2Fweek-4%2Fchallenge-22%2Fsrc%2FResources%2Fazuredeploy.json)

만약 애저 포탈을 통하지 않고 [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=25days_devto-blog-cxa)를 통해 리소스를 설치하고 싶다면 아래 명령어를 입력합니다.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=az-group-deployment.sh

이 과정이 끝나면 애저 포탈에서 아래와 같이 리소스 프로비저닝 결과를 볼 수 있습니다.

![resource provisioning result](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-01.png)

## 애저 펑션 관리 ID 활성화 확인

위와 같이 리소스 설치가 끝난 후 애저 펑션 인스턴스로 들어가서 관리 ID가 활성화 되어 있는지 확인합니다. 이를 통해 애저 펑션 인스턴스가 애저 키 저장소로 별도의 인증 절차 없이 직접 접근이 가능해졌습니다.

![management identity](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-02.png)

## 애저 키 저장소 액세스 정책 조정

한가지 더 추가적으로 해야 할 일이 있습니다. 바로 애저 키 저장소에 내 계정이 접근할 수 있게끔 정책을 조정하는 건데요, 아래 그림과 같이 키 저장소 인스턴스의 `액세스 정책` 블레이드로 들어갑니다. 그 다음에 `+ 액세스 정책 추가` 링크를 클릭합니다.

![access poliocy blade](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-03.png)

비밀 권한 항목에 `모두 선택`을 선택합니다.

![secrets](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-04.png)

주체 선택에서 내 계정의 이메일 주소를 입력합니다.

![user](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-05.png)

그리고 나서 저장 버튼을 아래와 같이 클릭합니다. 이렇게 함으로써 애저 키 저장소의 비밀 권한 항목에 내 계정이 접근 가능해 졌습니다.

## 애저 키 저장소 시크릿 입력

철수를 안전하게 숨겨둔 후 문을 잠그고 나왔을 때 영희는 비밀 코드를 하나 받았습니다.

> `DoYouKnow,soN,Bts,&pSy?`

이걸 키 저장소에 저장해야 합니다. 아래와 같이 `비밀` 블레이드를 클릭해서 `생성/가져오기` 버튼을 클릭합니다.

![create secret](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-06.png)

`이름`에 적당히 이름을 입력합니다. 여기서는 `cheolsoo`를 입력하기로 합니다. 그리고 `값`에 비밀 코드를 입력합니다. 그리고 맨 아래에 있는 `만들기` 버튼을 클릭합니다. 이제 철수를 다시 꺼내줄 수 있는 비밀 코드는 안전하게 키 저장소에 저장이 되었습니다.

![secret created](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-07.png)

## 애저 키 저장소 백업 펑션 작성

애저 키 저장소의 시크릿을 백업하기 위한 워크플로우는 아래와 같습니다.

1. 시크릿 리스트를 가져온다
2. 리스트를 반복문으로 돌며 개별적으로 시크릿을 백업한다
3. 백업 결과를 배열로 저장한다
4. 배열을 직렬화해서 [애저 블롭 저장소](https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=25days_devto-blog-cxa)에 업로드한다

아래와 같이 전체 시크릿 리스트를 가져오는 코드를 작성합니다. 이 코드를 실행시키면 시크릿 이름들을 리스트로 반환하겠지요?

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=secrets-get.cs

이렇게 만들어진 시크릿 리스트를 반복문으로 돌면서 개별적으로 시크릿을 백업합니다. 이 글을 쓰는 현 시점에서 벌크로 한 번에 백업하는 기능은 지원하지 않기 때문에 반복문을 돌려야 합니다.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=secrets-backup.cs

백업 결과를 리스트로 받았습니다. 이제 이 결과를 애저 블롭 저장소에 업로드 할 차례죠. 아래와 같이 코드를 작성해 봅니다. 리스트를 직렬화한 후 업로드합니다. 이 때 파일 이름을 `<yyyyMMdd>.json` 형태로 지정했습니다.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=blob-upload.cs

개별 기능이 완성이 되었습니다. 이제 이를 애저 펑션의 HTTP 트리거 안에서 하나의 워크플로우로 만들어 호출해 보도록 하죠.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=trigger-backup.cs

이렇게 키 저장소 백업을 위한 워크플로우까지 완성이 됐다면, 실제로 로컬 개발 환경에서 제대로 작동하는지 알아보겠습니다. 로컬 환경에서 [관리 ID](https://docs.microsoft.com/ko-kr/azure/app-service/overview-managed-identity?tabs=dotnet&WT.mc_id=25days_devto-blog-cxa) 기능을 사용하려면 [애저 CLI](https://docs.microsoft.com/ko-kr/cli/azure/get-started-with-azure-cli?view=azure-cli-latest&WT.mc_id=25days_devto-blog-cxa)로 먼저 [로그인을 한 상태](https://docs.microsoft.com/ko-kr/samples/azure-samples/app-service-msi-keyvault-dotnet/keyvault-msi-appservice-sample/?WT.mc_id=25days_devto-blog-cxa#step-5-run-the-application-on-your-local-development-machine)여야 하는데요, 로그인 후 실제로 VS 코드에서 디버깅 모드를 실행시켜 보겠습니다.

![debug backup](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-08.png)

그리고 [포스트맨](https://getpostman.com/)으로 호출해 보면 아래와 같은 결과를 확인할 수 있습니다.

![postman backup](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-09.png)

그리고, 애저 저장소 탐색기를 통해서 실제로 블롭 저장소에 잘 저장이 된 것도 확인 가능합니다.

![storage explorer backup](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-10.png)

여기까지 해서, 영희가 철수를 구할 수 있는 키 저장소의 시크릿을 성공적으로 백업한 것을 도와줬습니다. 이제 시간이 얼마 안 남았네요. 저승 사자가 저 멀리 키 저장소를 부수러 달려오고 있어요!

## 애저 키 저장소 복구 펑션 작성

애저 키 저장소의 시크릿을 복구하기 위한 워크플로우는 아래와 같습니다.

1. 복구하고자 하는 날짜의 타임스탬프 값을 입력 받는다
2. 애저 블롭 저장소에서 타임스탬프에 해당하는 백업 파일을 다운로드 받는다
3. 다운로드 받은 파일을 비직렬화한다
4. 새로운 키 저장소에 복구한다

타임스탬프는 `yyyyMMdd`의 형식이고 이는 복구 펑션 트리거 엔드포인트의 URL을 통해 입력받습니다. 이 타임스탬프를 통해 애저 블롭 저장소에서 다운로드 받는 메소드는 대략 아래와 같습니다. 파일을 다운로드 받은 후에 비직렬화해서 배열로 반환합니다.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=blob-download.cs

이 배열을 이용해서 아래 메소드는 반복문을 실행하면서 복구합니다. 백업 절차와 마찬가지로 벌크 복구 절차를 지원하지 않으므로 반복문을 통해 개별 시크릿을 복구해야 합니다.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=secrets-restore.cs

이렇게 복구를 위한 개별 기능이 완성됐습니다. 이제 이를 애저 펑션의 HTTP 트리거 안에서 하나의 워크플로우로 만들어 호출해 보도록 하죠.

https://gist.github.com/justinyoo/f1081e1061d02396048acf162e3b52d9?file=trigger-restore.cs

이렇게 키 저장소 복구를 위한 워크플로우까지 완성이 됐다면, 실제로 로컬 개발 환경에서 제대로 작동하는지 알아보겠습니다. VS 코드에서 디버깅 모드를 실행시킨 후 [포스트맨](https://getpostman.com/)으로 호출해 보면 아래와 같은 결과를 확인할 수 있습니다.

![postman restore](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-11.png)

그리고, 실제로 애저 키 저장소를 들여다보면 이렇게 복구가 됐습니다.

![keyvault restore](https://sa0blogs.blob.core.windows.net/aliencube/2019/12/challenge-12.png)

이제 영희는 키 저장소를 백업하고 복구할 수 있게 됐습니다! 저승 사자는 더이상 철수를 데려갈 수도 없고, 철수가 숨어 있는 방의 비밀 코드를 부술 수도 없습니다. 이제 곧 날이 밝겠네요. 영희도 이제 잘 시간이 됐습니다. 여러분도 맘 편하게 잠자리로 돌아가세요. 그러면 내일 다른 도전 과제로 찾아뵙겠습니다!

* * *

이 도전 과제를 풀었고, 그걸 공유하고 싶다구요? 로컬에서 솔루션이 잘 돌아가는지 확인해 보고 [이슈를 등록](https://github.com/microsoft/25-days-of-serverless/issues/new?assignees=&labels=challenge-submission&template=challenge-solution-submission.md&title=%5BCHALLENGE+SUBMISSION%5D+)합니다. 만약 코드가 없다면 문제 해결과 관련한 간단한 비디오를 찍어서 설명과 함께 공유해도 됩니다. 꼭 명심하셔야 할 부분은 솔루션을 제출하실 때 무슨 도전 과제에 대한 해법인지 알려주는 것이 가장 좋습니다. 우리는 여러분의 창의적인 문제 해결 과정을 보고 싶습니다! 질문이라든가 코멘트가 있다면 아래에 달아주세요.

* * *

저희가 이 "25일간의 서버리스 챌린지" 행사를 즐기는 것처럼 여러분들도 12월 한 달간을 즐겨 보세요. 이곳 dev.to 에서 저희가 제시하는 도전 과제를 눈여겨 보고 기다리면 좋은 일이 생길 겁니다. 만약 애저 계정이 없다면 [애저에 무료로 계정을 만들 수 있어요](https://azure.microsoft.com/ko-kr/free/?WT.mc_id=25days_devto-blog-cxa). 계정이 생겼으면 이제 뭐다? 도전 과제를 풀어 보시지요!
