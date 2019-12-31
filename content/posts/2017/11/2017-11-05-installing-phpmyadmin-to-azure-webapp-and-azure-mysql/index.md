---
title: "phpMyAdmin 애플리케이션을 애저 웹 앱에 설치하고 애저 MySQL에 연결시키기"
date: "2017-11-05"
slug: installing-phpmyadmin-to-azure-webapp-and-azure-mysql
description: ""
author: Justin Yoo
tags:
- Azure App Service
- Azure Web App
- PhpMyAdmin
- PHP
- MySQL
fullscreen: false
cover: ""
---

지난 2017년 5월, 마이크로소프트 [//Build](http://build.microsoft.com/) 행사에서 [애저 MySQL 데이터베이스 서비스를 론칭한다고 발표했다](https://azure.microsoft.com/en-us/blog/microsoft-extends-azure-managed-database-services-with-introduction-of-mysql-and-postgresql/). MySQL 데이터베이스는 보통 [phpMyAdmin](https://www.phpmyadmin.net/)이라는 웹 기반의 데이터베이스 관리 도구를 많이 사용하는 편이라서, 이번에 마침 애저 웹 앱 인스턴스에 phpMyAdmin을 설치하고 실행을 시켜볼 기회가 생겼다. 이 과정에서 알아두고 있으면 좋을만한 팁을 몇가지 공유하고자 한다.

> 여기서 사용한 애저 웹 앱 인스턴스는 윈도우 기반이다. 따라서, 리눅스 기반의 웹 앱 인스턴스와는 약간의 차이가 있을 수도 있다.

## 애저 데이터베이스 for MySQL 인스턴스 생성

우선 MySQL 데이터베이스 서버 인스턴스를 하나 생성하도록 한다. 애저 SQL 서비스가 서버와 데이터베이스를 별도로 생성할 수 있는 것과 달리 MySQL 데이터베이스는 서버 인스턴스만 생성할 수 있다. 현재는 프리뷰 상태여서 서버 인스턴스 생성 가능한 지역 중에 한국은 아직 포함되어 있지 않다. 대신 일본과 동남아시아 지역이 포함되어 있으므로 레이턴시를 고려한다면 우선은 둘 중 한 곳을 선택해서 생성하도록 하자. 또한 현재 지원하는 버전은 5.6 과 5.7 이니, 가급적이면 최신 버전을 선택하는 것이 좋겠다.

여기까지는 크게 어려운 점이 없으니 금방 할 수 있다.

## 애저 웹 앱 인스턴스 생성 및 설정

이번에는 애저 웹 앱 인스턴스를 생성하도록 한다. 데이터베이스와 같은 지역에 생성해도 되고, 한국 지역에 별도로 생성해도 된다. 이 부분은 전략적으로 고민해서 결정하면 될 듯 하다.

일단 애저 웹 앱 인스턴스를 하나 생성하고 나면 기본적인 설정을 해줘야 하는 것이 있다. Application Settings 블레이드를 열고 아래 사항을 확인한다.

- PHP Version: 이 글을 쓰는 현재 지원하는 가장 최신 버전은 7.1이다.
- Platform: 64비트 버전으로 설정한다.
- Always On: 웹 앱을 항상 빠릿빠릿하게 돌아가게끔 하는 옵션이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-01.png)

여기까지 해서 기본적인 설정은 끝났다. 딱히 어려운 것도 없고 새로운 것도 없다. 이제 phpMyAdmin 앱을 설치해 보도록 한다.

## phpMyAdmin 설치 및 설정

phpMyAdmin 앱은 애저 웹 앱의 확장 모듈로 설치할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-02.png)

이렇게 설치한 앱은 실제 웹 앱에 설치되는 것이 아니라 KUDU 쪽에 설치가 된다. 따라서 접속하고자 하는 웹사이트 주소도 달라진다. 예를 들어 `xyz.azurewebistes.net`이 원래 웹 앱의 주소였다면 phpMyAdmin 앱의 주소는 `xyz.scm.azurewebsites.net`이 된다. 이렇게 쓰면 딱히 걱정할 부분이 없어서 좋은데, 이 포스트는 삽질을 위한 것이니만큼 원래 웹 앱 인스턴스에 설치하는 것으로 하자.

우선 phpMyAdmin 소스코드를 .zip 파일 형태로 다운로드 받는다. 이 글을 쓰는 현재 phpMyAdmin의 버전은 4.7.5이다. 다운로드 받은 후 웹 앱 인스턴스의 KUDU로 들어가서 다운로드 받은 .zip 파일을 `wwwroot` 디렉토리 바로 아래에 업로드한다. KUDU로 업로드를 할 경우 .zip 파일을 업로드하는 것과 동시에 곧바로 압축을 풀어내 주기 때문에 굉장히 편리하다.

업로드가 끝나면 아래와 같이 `wwwroot` 바로 밑에 phpMyAdmin 압축을 풀어낸 디렉토리가 생긴다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-03.png)

이제부터 슬슬 재밌어지는 타이밍이다. 이 웹 앱 인스턴스는 오로지 phpMyAdmin 만을 위한 것이므로 모든 파일을 `wwwroot` 밑으로 옮겨놓으면 굳이 `xyz.azurewebsites.net/phpmyadmin-4.7.5-all-languages`와 같은 식으로 주소를 적을 필요가 없다. 그런데, 이렇게 파일을 옮기는 것도 일이니. 그냥 아예 루트 디렉토리를 `wwwroot`에서 `wwwroot/phpmyadmin-4.7.5-all-languages`로 바꾸는 것이 더 쉽다. 웹 앱 인스턴스의 Application settings 블레이드에 보면 루트 디렉토리를 바꿀 수 있는 옵션이 존재하므로 아래와 같이 설정값을 `site\wwwroot`에서 `site\wwwroot\phpmyadmin-4.7.5-all-languages`로 바꾸도록 한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-04.png)

이렇게 한 뒤 웹 앱의 주소로 접속을 해보면 곧바로 접속을 할 수 있다고 나온다. 하지만 아직 아무런 설정도 하지 않은 상태이므로 로그인을 할 수는 없다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-05.png)

phpMyAdmin의 매뉴얼에 따라 `https://xyz.azurewebsites.net/setup`으로 치고 들어간다. 그런데, `Bzip2`라는 모듈이 설치되지 않았다는 경고 메시지가 아래와 같이 뜬다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-06.png)

검색을 해 보니, PHP 초기 설정에 기본적으로 활성화되지 않은 상태라고 한다. 실제로 `phpinfo();` 펑션을 돌려서 확인해 보면 아래와 같이 bzip2 모듈이 설치가 되어 있지 않아 비활성화 된 것으로 나온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-07.png)

아예 해당 모듈 자체가 애저 웹 앱 인스턴스에 설치가 되지 않았다는 것인지라, 이 모듈을 설치하고 활성화 시켜야 한다. 이를 위해서는 PHP 자체를 다운로드 받아서 해당하는 `php_bz2.dll` 파일을 찾아 별도로 업로드 해 줘야 한다. 그러기 위해서는 PHP의 정확한 버전과 컴파일러를 알아야 한다. 다시 한 번 `phpinfo();` 펑션을 돌려서 확인해 보도록 하자. 이 글을 쓰는 현재 애저 웹 앱에 설치된 PHP의 버전은 7.1.8이고, 64비트 버전, 그리고 VC14 버전의 컴파일러로 Non-Threading Safe 방식으로 컴파일한 것을 사용하는 걸로 확인 가능하다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-08.png)

따라서, [PHP 아카이빙 사이트](http://windows.php.net/downloads/releases/archives/)에서 7.1.8 버전의 NTS, VC14, 64비트 버전으로 컴파일 된 것을 찾아 다운로드 받는다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-09.png)

다운로드 받은 .zip 파일의 압축을 풀어 `ext` 디렉토리로 들어가 보면 `php_bz2.dll` 파일을 찾을 수 있다. 이 파일을 KUDU를 통해 웹 앱 인스턴스로 업로드 한다. 업로드 위치는 `site\ext`이다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-10.png)

그리고, `site\ini` 디렉토리를 하나 더 만들어 `extensions.ini` 파일을 하나 생성한 후 그 안에 아래와 같이 `php_bz2.dll` 모듈을 등록한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-11.png)

마지막으로 웹 앱 인스턴스의 Application settings 블레이드로 다시 이동해서 환경 변수 키를 `PHP_INI_SCAN_DIR`, 값을 `d:\home\site\ini`와 같이 하나 추가한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-12.png)

그리고 마지막으로 `phpinfo();` 함수를 실행시켜 보면 성공적으로 해당 모듈이 설치가 됐음을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-13.png)

다시 phpMyAdmin 셋업 페이지로 돌아가 보면 앞서와 같은 경고 메시지가 사라진 것을 확인할 수 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-14.png)

이후로는 phpMyAdmin의 매뉴얼대로 설정을 마치면 모든 설정이 끝난다. 다시 웹사이트 `https://xyz.azurewebsites.net` 으로 접속해서 로그인한다. 이 때 로그인 유저네임은 `username@hostname`과 같은 형태여야 한다. 예를 들어 데이터베이스 ID가 `user`이고 MySQL 서버명이 `myserver.mysql.database.azure.com`이라고 한다면, 로그인 유저네임은 `user@myserver`가 된다. 그렇게 해서 로그인하면 성공적으로 phpMyAdmin 대시보드에 접속할 수 있게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-phpmyadmin-to-azure-webapp-and-azure-mysql-15.png)

지금까지 phpMyAdmin을 애저 웹 앱 인스턴스에 설치하고 애저 MySQL 데이터베이스 서버에 접속하는 과정을 살펴보았다. 애저 웹 앱 인스턴스에 설치된 PHP의 버전과 컴파일러 버전, 그리도 추가로 설치해야 하는 확장 모듈에 대한 정보를 정확하게 알지 못한다면 굉장히 혼란스러울 수 있는 부분이기도 하다. 아마도 리눅스 버전의 애저 웹 앱 인스턴스라면 또 얘기가 달라졌을 수도 있다. 이 부분은 나중에 다른 포스트를 통해 알아보도록 하자.
