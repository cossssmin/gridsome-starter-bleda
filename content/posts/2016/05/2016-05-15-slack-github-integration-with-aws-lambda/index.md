---
title: "AWS Lambda를 이용해서 GitHub과 Slack 연동하기"
date: "2016-05-15"
slug: slack-github-integration-with-aws-lambda
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- amazon-api-gateway
- amazon-cloudwatch
- aws-lambda
- github
- integration
- slack
- webhook
fullscreen: false
cover: ""
---

AWS Lambda 서비스(이하 `람다`)는 서버가 필요 없는 이벤트 방식의 서비스로 알려져 있다. 따라서, 개발자들이 빠르게 애플리케이션을 셋업할 때 굉장히 유용하게 쓰일 수 있는 서비스이다. [@usefulparadigm](http://twitter.com/usefulparadigm)님께서 [AWS Lambda와 API Gateway로 Slack Bot 만들기](http://www.usefulparadigm.com/2016/04/06/creating-a-slack-bot-with-aws-lambda-and-api-gateway) 라는 포스트를 공유해 주신 김에 따라해 볼 겸 해서 약간은 다르게 깃헙과 연동시킨 슬랙 봇을 만들어 보았다.

이 포스트에서는 아래와 같은 내용을 다루고자 한다:

- Slack 수신 웹훅 생성
- AWS 람다 펑션 생성
- Amazon API Gateway 연결
- GitHub 송신 웹훅 연결

> 관련 소스 코드는 [Azure Functions & AWS Lambda Sample](https://github.com/devkimchi/Azure-Functions-AWS-Lambda-Sample)에서 찾을 수 있다.

## Slack 수신 웹훅

먼저 슬랙에서 수신용 웹훅을 만들어 보자. [수신 웹훅 문서](https://api.slack.com/incoming-webhooks)를 참고하면 좀 더 자세한 내용을 확인할 수 있으므로, 여기서는 다루지 않는다. 먼저 수신용 웹훅을 생성해야 한다. 아래 링크를 통해 생성하도록 하자.

- [https://my.slack.com/services/new/incoming-webhook](https://my.slack.com/services/new/incoming-webhook)

아래 그림과 같이 수신용 웹훅을 통해 받은 메시지를 전달할 채널을 설정한다. 여기서는 `#lambda-nodejs`로 설정했다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-01.png)

그리고 휍훅을 생성하면 아래와 같은 웹훅 URL을 확인할 수 있다. 또한 웹훅을 통해 메시지를 전달하는 봇의 이름도 설정할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-02.png)

생성된 웹훅 URL을 통해 우리는 아래와 같은 JSON 객체를 `POST`방식으로 보낼 수 있다.

https://gist.github.com/justinyoo/d5d7248dfc3ac295617f0f71bde2f520

포스트맨을 통해 실제로 값이 잘 날아가는지 확인해 보도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-03.png)

아래와 같이 메시지가 제대로 전달된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-04.png)

이제 이 슬랙 봇을 위한 웹훅을 람다에서 호출할 차례이다.

## AWS 람다 펑션 생성

람다 펑션을 `이벤트 방식`이라고 설명하는데, 별 거 없고 그냥 웹 요청 및 웹 응답이라고 보는 것이 가장 기억하기 쉬울 것이다. 여기서는 슬랙 봇을 호출하기 위한 HTTPS 요청을 사용해야 하므로 아래와 같이 이미 만들어져 있는 템플릿 중 `https-request` 라는 것을 사용하기로 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-05.png)

다음 화면에서 아래의 내용을 입력하도록 하자.

- `Name`: SlackIncomingWebhook
- `Runtime`: Node.js 4.3
- `Handler`: index\_handler
- `Role`: Basic execution role

그리고 나면, 아래와 같은 코드가 미리 만들어져 있는 것을 확인할 수 있다.

https://gist.github.com/justinyoo/59f2643f884971db4e06b01be8978c72

이 코드를 아래와 같이 살짝 변형시킨다. 우리가 이용할 `event` 객체에는 `options`도 없고, `data`도 없기 때문에 반드시 `options` 객체와 `data` 객체를 생성시켜 `event.options`와 `event.data`를 대체해야 한다.

https://gist.github.com/justinyoo/f0b4c890cf72b41d538d251cb6b13d3d

> 여기서 주의해야 할 점은 외부 써드파티 npm 모듈들은 직접 사용할 수 없다는 점이다. 따라서, `node.js`의 기본 모듈들만 사용해야 한다. 만약 [request](https://github.com/request/request)과 같은 써드파티 모듈을 사용하기 위해서는 아래 두 문서를 참고하면 좋다.
> 
> - [Using Packages and Native nodejs Modules in AWS Lambda](https://aws.amazon.com/blogs/compute/nodejs-packages-in-lambda)
> - [Writing Functions for AWS Lambda Using NPM and Grunt](http://hipsterdevblog.com/blog/2014/12/07/writing-functions-for-aws-lambda-using-npm-and-grunt)

위와 같이 수정한 후 다시 람다를 실행시키면 아래 그림과 같이 바뀐 메시지가 나타나는 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-06.png)

## Amazon API Gateway 연결

람다 서비스는 단독으로 사용할 수 없고, 반드시 Amazon API Gateway 서비스(이하 `게이트웨이`)를 통해 외부로 노출 시켜야 한다. 게이트웨이에 하나를 추가하면서 채워야 할 필드들은 아래와 같다.

- New API
- API Name: Slack Incoming Webhook

잠시 후에 좀 더 자세히 다루겠지만 깃헙의 웹훅은 `POST` 메소드만 사용하므로, 게이트웨이에도 `POST` 메소드만 추가하면 된다. 아래와 같이 앞서 만들어 놓은 람다 펑션을 찾아서 진행시키도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-07.png)

람다 펑션을 게이트웨이가 사용할 수 있게끔 권한을 줘야 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-08.png)

그리고 나면 아래와 같이 게이트웨이가 람다와 연결이 된 것을 볼 수 있다. 우리가 작성한 웹훅은 별도의 추가적인 설정이 필요없으므로 곧바로 테스트를 실행시켜보자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-09.png)

성공적으로 메시지가 슬랙으로 전송된 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-10.png)

이제 이렇게 만들어진 게이트웨이 엔드포인트를 퍼블리싱하면 아래와 같은 공개 URL을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-11.png)

이 공개 URL을 가지고 포스트맨을 통해 체크해 보도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-12.png)

슬랙에서 아래와 같이 메시지를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-13.png)

여기까지 해서 우리는 슬랙 봇을 게이트웨이를 통해 람다와 연결시켰다. 이제 마지막으로 깃헙에서 이 람다를 실행시킬 차례이다.

## GitHub 송신 웹훅 연결

깃헙의 레포지토리 설정 화면에서 웹훅 링크로 이동한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-14.png)

아래와 같이 게이트웨이에서 만든 공개 URL을 `Payload URL` 필드에 넣고 모든 푸시에 대해 체크하는 것으로 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-15.png)

이제 실제로 코드를 푸시해 보자. 깃헙은 웹에서 직접 코드를 수정할 수도 있으므로 간편하게 아래와 같이 후딱 수정시켜보도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-16.png)

푸시하기 전에 도대체 어떤 내용이 깃헙에서 람다로 전달이 되는지 확인하기 위해 아래와 같이 람다 펑션 코드를 수정하여 `event` 객체를 콘솔에서 확인해 보도록 한다.

https://gist.github.com/justinyoo/7077aeeac29ac4ad34b433d3a1a2c0dc

그리고 나서 푸시를 하면 아래와 같이 슬랙 메시지를 확인할 수 있다. 이제 슬랙 메시지를 좀 더 의미있게 누가 푸시했는지, 커밋 ID는 무엇인지 알 수 있도록 만들어 보도록 하자.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-17.png)

기본적으로 람다는 Amazon CloudWatch 서비스(이하 `클라우드와치`)를 이용해 모든 로그를 저장한다. 아래와 같이 클라우드와치로 이동하여 우리가 만든 람다 펑션의 로그로 이동한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-18.png)

아래와 같이 `event` 객체가 어떤 JSON 객체 형식인지 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-19.png)

다시 람다 펑션을 수정해서 해당 `event` 객체에서 `head_commit` 속성을 이용하여 아래와 같이 슬랙에 보여줄 메시지를 바꾼다.

https://gist.github.com/justinyoo/ec07c3e91239213585660501b8505c18

그리고 나서 다시 커밋후 푸시를 하면 아래와 같이 바뀐 메시지를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-20.png)

지금까지 AWS 람다를 이용해서 GitHub의 리포지토리에 새로운 푸시가 생겼을 경우 이를 슬랙의 특정 채널에 자동으로 메시지를 뿌려주는 봇을 만들어 보았다. 참 쉽죠? [다음 포스트](http://blog.aliencube.org/ko/2016/05/16/slack-github-integration-with-azure-functions)에서는 람다 대신 [Azure Functions](https://azure.microsoft.com/en-us/services/functions)를 이용해서 만들어 보도록 하자.

> PS. 참고로 우리가 만든 봇은 사실 깃헙에서 이미 만들어서 제공하고 있기도 하다. ㅋ [![](https://sa0blogs.blob.core.windows.net/aliencube/2016/05/slack-bot-with-aws-lambda-21.png)](https://devkimchi.slack.com/apps/A0F7YS2SX-github)
