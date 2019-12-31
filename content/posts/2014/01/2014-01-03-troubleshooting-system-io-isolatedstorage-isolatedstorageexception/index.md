---
title: "System.IO.IsolatedStorage.IsolatedStorageException 에러 발생시 해결방법"
date: "2014-01-03"
slug: troubleshooting-system-io-isolatedstorage-isolatedstorageexception
description: ""
author: Justin-Yoo
tags:
- asp-net-iis
- ASP.NET
- IsolatedStorageException
- OpenXML
- System.IO.Packaging
- Troubleshooting
fullscreen: false
cover: ""
---

웹사이트에서 보고서라든가 하는 것을 실시간으로 다운로드 받고자 할 때 보통 엑셀 파일 형태로 해달라는 고객의 요청이 많다. `.csv` 파일 포맷이라면 텍스트 파일이니까 크게 문제가 되지 않는데, 엑셀 파일 포맷의 경우에는 상황이 조금 달라진다. 고객의 요청사항이 그저 엑셀 문서로 다운로드 받을 수 있게 해달라면 단순히 `.xls` 포맷으로 다운로드 받을 수 있게 해주면 되지만, 만약 `.xlsx` 포맷으로 다운로드 받을 수 있게 해달라는 요청사항이라면 얘기는 달라진다.

`.xlsx` 파일은 OpenXML 포맷으로 닷넷 어플리케이션에서는 [`System.IO.Packaging`](http://msdn2.microsoft.com/en-us/library/system.io.packaging.aspx) 라이브러리를 사용한다. 일반적인 리포트 다운로드 절차는 대략 아래와 같다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/01/report-download-process.png)

위의 그림과 같이 사용자가 리포트를 서버에 요청하면 서버는 임시 파일을 생성해서 임시 저장소에 저장시켜 놓은 후에 사용자에게 해당 임시파일을 다운로드 받게하는 방식이 일반적이다. 이때, 앞서 언급한 `System.IO.Packaging` 라이브러리는 리포트 파일 크기가 4MB 이상일 경우 웹 어플리케이션에서 지정한 임시 저장소가 아닌 별도의 저장소에 보관하게 된다. 그 별도의 저장소 이름은 `IsolatedStorage`이고, 이 폴더의 위치는 Windows Server 2003의 경우 `"C:\Documents and Settings\Default User\Local Settings\Application Data\IsolatedStorage"`, Windows Server 2008 이상의 경우 `"C:\ProgramData\IsolatedStorage"`이다. 만약 해당 위치에 저 폴더가 없을 경우 폴더를 만들어주면 된다. 그리고 나서 할 일은 해당 폴더에 적절한 사용자 권한을 부여하면 끝.

만약 저 `IsolatedStorage`에 적절한 권한이 부여되지 않았다면 다음과 같은 에러를 만날 것이다.

> Unable to create the store directory. (Exception from HRESULT: 0x80131468)

따라서, 이 에러를 없애기 위해서는 아래와 같이 서버별로 적절한 조치를 취해주면 된다.

## Windows Server 2003

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/01/win2003-setup-232x300.png)

위의 그림과 같이 `IUSR_`로 시작하는 `Internet Guest Account` 계정과 `NETWORK SERVICE` 계정에 읽기/쓰기 권한을 부여해주면 된다. 보안상 가장 좋은 방법은 `Internet Guest Account`에 대해서만 권한을 조정하면 되지만, 서버 설정상 `NETWORK SERVICE` 계정도 권한 조정이 필요한 경우가 있으니 그부분은 시스템 관리자와 논의하면 된다.

## Windows Server 2008 or Later

![](https://sa0blogs.blob.core.windows.net/aliencube/2014/01/win2008-setup-248x300.png)

위의 그림과 같이 `IIS Application Pool Identity` 계정에만 읽기/쓰기 권한을 부여해주면 된다. 이전 버전과 호환성을 위해 `IUSER_XXXX` 계정과 `NETWORK SERVICE` 계정이 존재하지만, 더이상 사용하지 않는 계정이니 신경 쓰지 않아도 된다.

참고로 앞서 언급한 `System.IO.Packaging` 라이브러리를 사용하는 대표적인 오픈소스로는 [EPPlus](https://epplus.codeplex.com)가 있다. 엑셀 파일에 관련한 모든 것을 다룰 수 있는 아주 강력한 오픈소스 라이브러리이니 한번쯤 사용해 보는 것도 나쁘지 않을 것이다.

## 참조

- [IsolatedStorageException: Unable to create the store directory](https://epplus.codeplex.com/discussions/255537)
- [System.IO.IsolatedStorage.IsolatedStorageException: Unable to create the store directory](http://social.msdn.microsoft.com/Forums/office/en-US/0151b8fe-be6c-45b3-aba4-d939a91f594c/systemioisolatedstorageisolatedstorageexception-unable-to-create-the-store-directory?forum=oxmlsdk)
