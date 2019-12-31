---
title: "Azure 관점에서 본 AWS re:Invent 2016 관전기"
date: "2016-12-08"
slug: aws-reinvent-2016-recap-from-azure-perspective
description: ""
author: Justin Yoo
tags:
- Azure App Service
- AWS
- Azure
- re:Invent
fullscreen: false
cover: ""
---

지난주에 AWS의 연례 행사중 하나인 [re:Invent](https://reinvent.awsevents.com/) 행사가 열렸다. 엄청나게 많은 신제품 및 신기술이 쏟아졌는데 실제로 이를 Azure에서 제공하는 서비스와 비교한 기사는 많지 않다. 마침 캐나다에서 Azure MVP로 활동하는 [Anthony Chu](https://twitter.com/nthonyChu)가 이를 정리한 [포스트](http://anthonychu.ca/post/aws-reinvent-2016-announcements/)가 있어 허락을 맡고 요약해서 한국어로 정리해 보기로 한다.

> 아무래도 나도 그렇고 Anthony도 그렇고 둘 다 업무로써 Azure와 AWS를 둘 다 쓰기는 하지만 둘 다 Azure MVP이다보니 약간의 편향된 시각이 있을 수는 있다. 하지만 최대한 객관적인 입장에서 글을 써 보도록 한다. 혹시나 잘못된 내용이 있을 경우 알려주면 곧바로 반영하도록 하겠다.

## PaaS on AWS

지금까지는 전통적으로 AWS는 IaaS에 강하고 Azure는 PaaS 또는 SaaS에 강하다고 했다. 하지만 이제는 그런 단순 비교는 없어지지 않을까 싶다. 우선 AWS에서는 [오로라DB](https://aws.amazon.com/rds/aurora/) 서비스와 [Lambda](https://aws.amazon.com/lambda/) 서비스를 출시했으니 이것이 바로 PaaS의 신호탄인 셈이다. 이를 바탕으로 AWS가 어떤 식으로 Azure를 추격할지가 관전 포인트.

## Amazon Athena

[아테나](https://aws.amazon.com/athena/)는 데이터 분석 서비스이다. 사용한 만큼 과금하는 형태로서 서버리스의 방식을 차용했다. 프레스토와 안시SQL을 이용해서 자료를 검색할 수 있다. 이와 동일한 서비스로는 Azure의 [Data Lake Analytics](https://azure.microsoft.com/en-us/services/data-lake-analytics/)이다.

Azure Data Lake Analytics는 U-SQL을 사용할 수 있어서 C# 코드와 함께 쓰면 SQL 독자적으로 수행하기 어려운 명령들을 처리할 수 있다. 아테나 서비스는 S3에 저장된 데이터들을 조회할 수 있는 반면에 Azure Data Lake Analytics 서비스는 S3와 동일한 성격을 가진 Azure Blob Storage 뿐만 아니라 Azure SQL 데이터베이스에서도 자료 조회가 가능하다.

## Amazon Lex

이번에 발표한 [Lex](https://aws.amazon.com/lex/) 서비스는 AWS 인공지능 또는 딥 러닝 도구인 알렉사의 사촌 격이다. 챗봇 서비스로서 AWS Lambda와 함께 사용하면서 시너지를 발휘할 수 있다.

Azure 쪽에서도 얼마전에 [Bot Frmaework](https://dev.botframework.com/)을 이용한 [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/)를 발표했다. [LUIS](https://www.luis.ai/)와 연계해서 [Azure Functions](https://azure.microsoft.com/en-us/services/functions/)와 통합시키면 훨씬 더 많은 기능을 수행할 수 있기도 하다. 아직까지는 이부분은 Lex 보다는 나은 듯.

## Amazon Rekognition & Poly

[Rekognition](https://aws.amazon.com/rekognition/) 서비스는 그림 인식 서비스이다. 예를 들어 사람의 얼굴에서 사람의 감정을 분석한다든가 하는 것들을 할 수 있다. 이는 [Azure Cognitive Service](https://www.microsoft.com/cognitive-services)에서 제공하는 [여러](https://www.microsoft.com/cognitive-services/en-us/computer-vision-api) [가지](https://www.microsoft.com/cognitive-services/en-us/emotion-api) [API](https://www.microsoft.com/cognitive-services/en-us/face-api)를 이용하면 된다.

마찬가지로 [Polly](https://aws.amazon.com/polly/) 서비스는 [Bing Speech API](https://www.microsoft.com/cognitive-services/en-us/speech-api)와 비교할 수 있다. 아직은 Azure에서 제공하는 API의 종류가 더 많긴 하지만 AWS가 놀고 있지는 않을테니 금방 따라잡을 것으로 예상한다.

## AWS Lambda

서버리스 아키텍처를 최초로 상업 서비스로 연결시킨 상품이다. Azure Functions는 그 후발주자로써 열심히 따라잡고 있는 중이다. 그런 람다 서비스에서 이번에 .NET Core 프레임워크 지원을 시작했다. 반면에 Azure Functions에서 지원하는 .NET 프레임워크는 4.6 버전. 일해라 MS!

게다가 AWS Lambda 서비스는 이제 [Lambda@Edge](https://aws.amazon.com/blogs/aws/coming-soon-lambda-at-the-edge/)를 통해 CDN에서 돌릴 수도 있게 했고, [AWS Greengrass](https://aws.amazon.com/greengrass/)를 통해 Lambda 펑션을 IoT 디바이스에서도 운용할 수 있게 됐다.

아직 Azure Functions 쪽에서는 이렇게 된다는 공식적인 발표는 없지만 이미 오픈소스로 코드를 [GitHub](https://github.com/Azure/azure-webjobs-sdk-script)에 올려서 개발하고 있으니 곧 어떤 식으로든 발표가 나지 않을까 싶기도 하다.

## Amazon X-Ray

[X-Ray](https://aws.amazon.com/xray/)는 Azure의 [Application Insights](https://azure.microsoft.com/en-us/services/application-insights/)와 같은 서비스이다. App Insights의 경우 이미 몇년간 프리뷰 형태로 있으면서 몇주 전에 GA가 된 만큼 안정적인 서비스를 제공한다. X-Ray는 아직 시작단계인 만큼 곧 괄목할만한 성장을 보여줄 수 있을지가 관건.

## Amazon Step Functions

[Step Functions](https://aws.amazon.com/step-functions/)는 워크플로우를 관리한다는 점에서 Azure의 [Logic Apps](https://azure.microsoft.com/en-us/services/logic-apps/)와 상당히 유사하다. 수많은 써드파티 서비스들과 통합을 이뤄내야 하고 조율을 해야하는 부분이 핵심인데 그점에 있어서는 Logic Apps가 좀 더 앞서있지 않은가 싶다.

## AWS CodeBuild

기존의 [CodeCommit](https://aws.amazon.com/codecommit/), [CodePipeline](https://aws.amazon.com/codepipeline/), [CodeDeploy](https://aws.amazon.com/codedeploy/) 서비스가 있기는 했으나 이를 통합적으로 서비스해주는 그 무언가가 없었다. 따라서 별도로 서버를 셋업해서 이를 통합해야 했는데, 이미 Azure 에서는 [Visual Studio Team Service (VSTS)](https://www.visualstudio.com/team-services/)가 자리를 잡고 있었다. 이제 AWS에서 [CodeBuild](https://aws.amazon.com/codebuild/) 서비스를 발표했으니 이제 또 어떻게 되나 관전하는 것이 또 포인트.

## AWS Batch

이번에 프리뷰를 발표한 [AWS Batch](https://aws.amazon.com/batch/)는 [Azure Batch](https://azure.microsoft.com/en-us/services/batch/) 서비스와 동일하다.

지금까지 주목할 만한 AWS의 새 서비스에 대해서 Azure의 서비스들과 간략하게 비교해 보았다. 아마존이 클라우드의 선두주자임은 부정할 수 없다. Azure가 엄청나게 따라잡아서 업계 2위라고는 하지만 아직까지 아마존의 영향력은 Azure에 견줄 바가 아닐만큼 크다. 따라서 그동안 Azure 서비스들이 아마존의 서비스들을 따라해 왔다면, 이번 re:Invent 이벤트에서는 오히려 그 반대 양상을 보여줬다고도 할 수 있다.

전통적으로 Microsoft는 엔터프라이즈 시장에서 강세를 보였고, 사실 Azure 서비스들 역시도 엔터프라이즈 쪽에 좀 더 포커스를 맞춰 성장해 왔다면 AWS는 그와는 다른 형태로 성장해 왔던 것이 사실이다. 이제는 그 둘의 경계가 많이 무너진 것처럼 보인다. 지금과 같이 서로 경쟁을 한다면 우리 같은 사용자 입장에서는 그저 즐거울 뿐이다.

두 서비스의 발전을 기원한다.
