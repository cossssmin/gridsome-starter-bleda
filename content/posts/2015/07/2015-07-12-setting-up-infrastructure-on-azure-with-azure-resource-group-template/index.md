---
title: "Azure Resource Group 템플릿으로 인프라스트럭처 한방에 셋업하기"
date: "2015-07-12"
slug: setting-up-infrastructure-on-azure-with-azure-resource-group-template
description: ""
author: Justin-Yoo
tags:
- arm-devops-on-azure
- Azure
- Infrastructure
- Resource Group Management
fullscreen: false
cover: ""
---

Microsoft Azure를 사용하면서 흔히 겪는 문제가 전체적인 인프라스트럭처를 한꺼번에 구현해야 할 때이다. 예를 들어 웹사이트와 데이터베이스는 보통 별도의 서버를 이용해서 한번에 셋업해야 하는 경우가 많다. 게다가 Application Insight 라고 불리는 모니터링 도구 및 기타 여러가지 다른 것들을 따로따로 셋업하는 것은 여간 귀찮은 것이 아닌데, Azure에서는 이런 손이 많이 타는 작업을 템플릿으로 구성해서 한번에 셋업할 수 있게 해 놓았다. 이를 가리켜 Azure Resource Group Management라고 하는데, 이 포스트에서는 이것을 이용해서 간단한 웹사이트와 데이터베이스를 셋업하는 것에 대해 알아보도록 한다.

## 사전 준비사항

아래와 같은 내용들이 Visual Studio 2013 에 설치되어 있는 것을 확인하고, 만약 없다면 설치하도록 한다.

- \[Microsoft Azure SDK for .NET 2.6+\]
- \[PowerShell Tools for Visual Studio\]

이 포스트는 Visual Studio 2013 버전을 기준으로 한다. 만약 Visual Studio 2012 혹은 Visual Studio 2010 버전을 갖고 있다면 비슷한 방법으로 진행이 가능할 것이다. 장담하지 않는다

## 시나리오

전형적인 웹사이트 운영과 관련한 인프라스트럭처를 구성하도록 한다. 이와 관련해서는 아래와 같은 리소스가 필요할 것이다.

- Azure 웹사이트
- Azure SQL 데이터베이스
- Azure Storage
- Azure Application Insight

## Visual Studio 프로젝트 생성

새 프로젝트를 생성할 때 아래와 같이 Azure Resource Group 프로젝트 템플릿을 선택한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-01.png)

그러면 Azure 템플릿 선택화면이 나타난다. 여기 보이는 템플릿들은 가장 자주 쓰이는 템플릿들 몇가지를 추려놓은 것이다. 우리는 여기서 `Web app + SQL` 템플릿을 선택한다

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-02.png)

만약 이보다 더 많은 템플릿들을 보고 싶다면 아래 GitHub 리포지토리를 참고하도록 하자.

[Azure Resource Manager QuickStart Templates](https://github.com/Azure/azure-quickstart-templates)

이렇게 해서 만들어진 프로젝트는 아래와 같은 구조로 되어 있을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-03.png)

- `Deploy-AzureResourceGroup.ps1`
- `WebSiteSQLDatabase.json`
- `WebSiteSQLDatabase.param.dev.json`
- `AzCopy.exe`

첫 파일은 파워쉘 스크립트이다. 이것은 단순히 템플릿 파일을 실행시켜주는 것에 불과하므로 딱히 여기서 언급하지는 않도록 한다. 다만 파워쉘 스크립트 실행과 관련하여 별도의 포스트에 따로 언급할 예정이다.

마지막 파일 역시도 여기서는 크게 중요하지 않다.

Azure Resource Group 템플릿의 핵심은 바로 나머지 두 `.json` 파일이다. 이 파일들은 확장자에서도 확인할 수 있다시피 JSON 포맷으로 구성되어 있는데, 파워쉘에서 이 파일을 불러들이면 내부적으로 Azure REST API를 호출하여 필요한 절차들을 진행시키게 된다. 이제 첫번째 `WebSiteSQLDatabase.json` 파일을 열어보면 아래와 같은 화면을 볼 수 있을 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-04.png)

오른쪽에서 정의한 내용들이 왼쪽에 트리 구조로 한눈에 쏙쏙 보이게 나타나서 작업하기가 한결 수월하다. 오른쪽의 JSON 파일을 보면 맨 처음에 `schema` 항목이 있는데, 이 JSON 파일의 구조를 정의한 내용이다. JSON schema 자체에 대해 더 자세히 알고 싶으면 [http://json-schema.org/](http://json-schema.org/)에 더욱 많은 정보가 있다. 그리고, Azure Resource Group 템플릿에서 사용 가능한 리소스들에 대한 내용들은 해당 스키마 파일을 다운로드 받아보면 된다.

## Parameters 정의 및 설정

이 템플릿 안에는 여러가지 파라미터들을 받아들이는데, 이것은 상황에 따라 다른 이름을 부여한다거나 하는 식으로 쓰이기 때문에 간단하게 알아보도록 하자.

```json
"parameters": {
  "siteName": {
    "type": "string"
  },
  "hostingPlanName": {
    "type": "string"
  },
  "siteLocation": {
    "type": "string"
  },
  "sku": {
    "type": "string",
    "allowedValues": [
      "Free",
      "Shared",
      "Basic",
      "Standard",
      "Premium"
    ],
    "defaultValue": "Free"
  },
  "workerSize": {
    "type": "string",
    "allowedValues": [
      "0",
      "1",
      "2"
    ],
    "defaultValue": "0"
  },
  "serverName": {
    "type": "string"
  },
  "serverLocation": {
    "type": "string"
  },
  "administratorLogin": {
    "type": "string"
  },
  "administratorLoginPassword": {
    "type": "securestring"
  },
  "databaseName": {
    "type": "string"
  },
  "collation": {
    "type": "string",
    "defaultValue": "SQL_Latin1_General_CP1_CI_AS"
  },
  "edition": {
    "type": "string",
    "defaultValue": "Web"
  },
  "maxSizeBytes": {
    "type": "string",
    "defaultValue": "1073741824"
  },
  "requestedServiceObjectiveId": {
    "type": "string",
    "defaultValue": "910b4fcb-8a29-4c3e-958f-f7ba794388b2"
  }
},

```

- `siteName`: 웹사이트의 기본 도메인이다. 이 이름을 바탕으로 **siteName**.azurewebsites.net 이라는 웹사이트 도메인이 만들어진다. **주의: 굳이 대소문자를 구분하지 않으나 소문자로 지정하는 것이 좋다**
- `hostingPlanName`: 웹사이트의 호스팅 플랜에 대한 이름을 정의한다.
- `siteLocation`: 리소스를 생성하는 지역을 정의한다. 지정 가능한 지역 리스트는 아래와 같다.
    
    - East Asia: 홍콩
    - Southeast Asia: 싱가폴
    - Central US: 아이오와
    - East US: 버지니아
    - East US 2: 버지니아
    - West US: 캘리포니아
    - North Central US: 일리노이
    - South Central US: 텍사스
    - North Europe: 아일랜드
    - West Europe: 네덜란드
    - Japan West: 도쿄, 사이타마
    - Japan East: 오사카
    - Brazil South: 상파울로
    - Australia East: 시드니
    - Australia Southeast: 멜버른
- `sku`: 웹사이트 호스팅 플랜을 정의한다. 기본값은 `Free`이다.
    
    - `Free`, `Shared`, `Basic`, `Standard` 중에서 선택할 수 있다.
- `workerSize`: 호스팅 플랜의 인스턴스 사이즈를 정의한다. 기본값은 `0`, 즉 `Small`이다.
    
    - `0 (Small)`, `1 (Medium)`, `2 (Large)` 중에서 선택할 수 있다.
- `serverName`: SQL 데이터베이스 서버 이름을 정의한다. **주의: 무조건 소문자로만 지정해야 한다**
- `serverLocation`: 앞서 정의한 `siteLocation`과 같다.
- `administratorLogin`: 데이터베이스 서버 어드민 계정을 정의한다.
- `administratorLoginPassword`: 데이터베이스 서버 어드민 계정 패스워드를 정의한다.
- `databaseName`: 데이터베이스 이름을 정의한다.
- `collation`: 데이터베이스 collation 을 정의한다. 기본값은 `SQL_Latin1_General_CP1_CI_AS`이다.
- `edition`: 데이터베이스 서버 에디션을 정의한다. 기본값은 `Web`이다.
    
    - `Web`, `Business`, `Basic`, `Standard`, `Premium` 중에서 선택할 수 있다.
- `maxSizeBytes`: 데이터베이스 파일 최대 크기를 정의한다. 기본값은 `1073741824`, 즉 1Gb이다.
- `requestedServiceObjectiveId`: 데이터베이스 서버 에디션의 퍼포먼스를 정의한다. 기본값은 `910b4fcb-8a29-4c3e-958f-f7ba794388b2`이다. 지정 가능한 ID값은 아래와 같다.
    
    - `910B4FCB-8A29-4C3E-958F-F7BA794388B2`: Shared
    - `DD6D99BB-F193-4EC1-86F2-43D3BCCBC49C`: Basic
    - `F1173C43-91BD-4AAA-973C-54E79E15235B`: S0
    - `1B1EBD4D-D903-4BAA-97F9-4EA675F5E928`: S1
    - `455330E1-00CD-488B-B5FA-177C226F28B7`: S2
    - `789681B8-CA10-4EB0-BDF2-E0B050601B40`: S3
    - `7203483A-C4FB-4304-9E9F-17C71C904F5D`: P1
    - `A7D1B92D-C987-4375-B54D-2B1D0E0F5BB0`: P2
    - `A7C4C615-CFB1-464B-B252-925BE0A19446`: P3

## Resources 정의 및 설정

기본적으로 리소스는 아래와 같이 정의한다.

```json
"resources": [
  {
    "apiVersion": "<api-version-of-resource>",
    "type": "<resource-provider-namespace/resource-type-name>",
    "name": "<name-of-the-resource>",
    "location": "<location-of-resource>",
    "tags": "<name-value-pairs-for-resource-tagging>",
    "dependsOn": [
      "<array-of-related-resource-names>"
    ],
    "properties": "<settings-for-the-resource>",
    "resources": [
      "<array-of-dependent-resources>"
    ]
  }
]

```

- `apiVersion`: 해당 리소스를 정의하는 API 버전
- `type`: 리소스 프로바이더의 네임스페이스와 리소스 타입
- `name`: 리소스 이름
- `location`: 리소스 지역
- `tags`: 리소스 태그
- `dependsOn`: 해당 리소스의 부모 리소스
- `properties`: 리소스 설정
- `resources`: 해당 리소스의 자식 리소스

이를 바탕으로 여기서는 모두를 다 다루지는 않고 데이터베이스 설정만 설명하는 것으로 하자. 나머지는 템플릿을 읽어보면 대략 감이 올 것이다.

```json
{
  "name": "[parameters('serverName')]",
  "type": "Microsoft.Sql/servers",
  "location": "[parameters('serverLocation')]",
  "tags": {
    "displayName": "SqlServer"
  },
  "apiVersion": "2014-04-01-preview",
  "properties": {
    "administratorLogin": "[parameters('administratorLogin')]",
    "administratorLoginPassword": "[parameters('administratorLoginPassword')]"
  },
  "resources": [
    {
      "name": "[parameters('databaseName')]",
      "type": "databases",
      "location": "[parameters('serverLocation')]",
      "tags": {
        "displayName": "Database"
      },
      "apiVersion": "2014-04-01-preview",
      "dependsOn": [
        "[concat('Microsoft.Sql/servers/', parameters('serverName'))]"
      ],
      "properties": {
        "edition": "[parameters('edition')]",
        "collation": "[parameters('collation')]",
        "maxSizeBytes": "[parameters('maxSizeBytes')]",
        "requestedServiceObjectiveId": "[parameters('requestedServiceObjectiveId')]"
      }
    },
    {
      "type": "firewallrules",
      "apiVersion": "2014-04-01-preview",
      "dependsOn": [
        "[concat('Microsoft.Sql/servers/', parameters('serverName'))]"
      ],
      "location": "[parameters('serverLocation')]",
      "name": "AllowAllWindowsAzureIps",
      "properties": {
        "endIpAddress": "0.0.0.0",
        "startIpAddress": "0.0.0.0"
      }
    }
  ]
},

```

데이터베이스 서버는 부모 리소스가 존재하지 않으므로 `dependsOn` 속성을 찾을 수 없는 반면에, 자식 리소스인 데이터베이스가 존재하므로 자식 리소스 항목인 `resources`에 보면 데이터베이스에 데이터베이스 서버에 의존성이 있다는 명시를 `dependsOn` 속성을 통해 명시적으로 지정하고 있는 것을 볼 수 있다.

여기서 보면 몇가지 특이한 함수들을 볼 수 있다. `parameters()` 함수는 앞서 지정한 파라미터 값을 받아오는 것이고, `concat()` 함수는 여러 문자열을 하나로 합치는 함수이다. 이외에도 다양한 함수들을 활용할 수 있는데, 자세한 내용은 [Advanced Template Operations](https://azure.microsoft.com/en-us/documentation/articles/resource-group-advanced-template/)을 참조하면 좋다. 기회가 되면 이에 대해서도 간단히 다루어보는 포스트를 작성할 예정이다. 장담할 수 없다

이렇게 해서 기본적인 템플릿은 다 작성했다. 여기에 하나 덧붙이자면, 아직 Azure Storage Account는 들어있지 않은데, 이부분은 아래와 같이 추가하면 좋다.

## Azure Storage Account 추가

먼저 파라미터 항목에는 아래와 같이 추가한다.

```json
"newStorageAccountName": {
  "type": "string"
},
"storageAccountType": {
  "type": "string"
},
"location": {
  "type": "string"
}

```

그다음에 리소스 항목에는 아래와 같이 추가한다.

```json
{
  "type": "Microsoft.Storage/storageAccounts",
  "name": "[parameters('newStorageAccountName')]",
  "apiVersion": "2015-05-01-preview",
  "location": "[parameters('location')]",
  "properties": {
    "accountType": "[parameters('storageAccountType')]"
  }
}

```

Azure Storage Account 항목은 최근에 추가된 내용이라 아직 자세한 내용이 공개되지 않아서 이부분은 [Azure 깃헙 리포지토리](https://github.com/Azure/azure-quickstart-templates/tree/master/101-create-storage-account-standard)를 참조했다.

## 관련 파라미터 값 설정하기

위와 같이 템플릿을 작성했다면, 이제는 파라미터 값을 설정할 차례이다. `WebsiteSQLDatabase.param.dev.json` 파일을 열어 설정하도록 하자.

```json
{
  "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "siteName": {
      "value": "acsamplewebsite"
    },
    "hostingPlanName": {
      "value": ACSamplePlan
    },
    "siteLocation": {
      "value": "Southeast Asia"
    },
    "serverName": {
      "value": "acsampledb"
    },
    "serverLocation": {
      "value": "Southeast Asia"
    },
    "administratorLogin": {
      "value": "acsampleadmin"
    },
    "databaseName": {
      "value": "SampleDatabase"
    },
    "newStorageAccountName" : {
      "value" : "acsamplestorage"
    },
    "storageAccountType": {
      "value": "Standard_GRS"
    },
    "location": {
      "value": "Southeast Asia"
    }
  }
}

```

위와 같이 파라미터 값들을 모두 설정했다. 이제 파워쉘에서 이 템플릿을 통해 리소스그룹을 만들고 그 그룹 안에 다양한 리소스들을 설정하는 것을 확인해 보자.

## 템플릿 실행하기

우리가 설정하고자 하는 리소스그룹의 이름은 `ACSampleResourceGroup`으로 설정한다. 먼저 파워쉘 또는 파워쉘 ISE를 관리자모드로 실행한다.

```powershell
PS C:\Windows\system32>

```

해당 템플릿이 있는 위치로 이동한다. 굳이 하지 않아도 된다.

```powershell
cd C:\Dev\AzureResourceGroup\Templates

```

우선 Azure Resource Manager 모드로 전환한다.

```powershell
Switch-AzureMode AzureResourceManager

```

자신의 Azure 계정을 연결한다.

```powershell
Add-AzureAccount

```

그러면 아래와 같이 연결된 계정 정보가 보일 것이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-05.png)

참고로 연결된 계정에는 Azure 섭스크립션이 세 개가 있기 때문에 이 중에서 하나를 선택해야 한다. 우선 섭스크립션 정보를 확인한 후 연결하도록 하자.

```powershell
Get-AzureSubscription | Format-Table SubscriptionName, IsDefault, IsCurrent -Wrap

```

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-06.png)

원하는 섭스크립션으로 변경하려면 아래와 같이 한다.

```powershell
Select-AzureSubscription -SubscriptionName "[SubscriptionName]"

```

자, 이제 모든 준비가 끝났다. 이제 앞서 만들어둔 Azure Resource Group 템플릿을 실행시킬 차례이다. 아래와 같이 파워쉘에 입력한다.

```powershell
New-AzureResourceGroup -Name "ACSampleResourceGroup" -Location "Southeast Asia" -TemplateFile .\WebSiteSQLDatabase.json -TemplateParameterFile .\WebSiteSQLDatabase.param.dev.json

```

앞서 데이터베이스 관리자 패스워드를 지정하지 않았기 때문에 아래와 같은 화면이 나타날 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-07.png)

약간의 시간이 지난 후에 모두 성공적으로 생성되었다는 메시지를 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-08.png)

실제로 이를 Azure 포탈에서 확인해 보면 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-09.png)

![](https://sa0blogs.blob.core.windows.net/aliencube/2015/07/azure-resource-group-10.png)

## 마치며

이상으로 Azure Resource Group 템플릿과 파워쉘을 이용해서 인프라스트럭처를 한번에 구성하는 작업을 해 보았다. 이글을 쓰는 현재 시점에서는 Azure Storage 에 Blob 콘테이너를 추가하는 작업은 이 템플릿을 통해서는 진행할 수 없다. 현재 내부적으로 작업중인 것 같으니 조만간 추가가 될 듯 싶기도 하다.

참 쉽죠?
