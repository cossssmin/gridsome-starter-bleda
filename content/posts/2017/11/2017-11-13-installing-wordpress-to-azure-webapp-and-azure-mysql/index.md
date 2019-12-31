---
title: "애저 웹 앱과 애저 MySQL 데이터베이스를 사용해서 워드프레스 설치하기"
date: "2017-11-13"
slug: installing-wordpress-to-azure-webapp-and-azure-mysql
description: ""
author: Justin-Yoo
tags:
- azure-app-service
- azure-web-app
- azure-database
- mysql
- wordpress
fullscreen: false
cover: ""
---

[이전 포스트](http://blog.aliencube.org/ko/2017/11/05/installing-phpmyadmin-to-azure-webapp-and-azure-mysql/)에서는 [phpMyAdmin](https://www.phpmyadmin.net/)이라는 웹 기반 MySQL 관리 도구를 애저 웹 앱에 설치하는 요령에 대한 내용이었다. 이번에는 애저 웹 앱에 [워드프레스](https://wordpress.org/)를 설치하고 애저 MySQL 데이터베이스에 연결해서 사용하는 방법에 대해 알아두면 좋을만한 것들에 대해 정리를 해 보고자 한다.

> 이 블로그 포스트에 쓰인 애저 웹 앱 인스턴스는 [윈도우 기반](https://docs.microsoft.com/en-us/azure/app-service/app-service-web-overview)이다. [리눅스 기반의 애저 웹 앱 인스턴스](https://docs.microsoft.com/en-us/azure/app-service/containers/app-service-linux-intro)와 대부분 비슷하겠지만 미묘한 부분에서 차이가 있을 수 있다.

## 애저 웹 앱 인스턴스 생성 및 설정

애저 웹 앱 인스턴스를 생성하고 PHP를 사용하기 위한 기본적인 설정 방법은 [이전 포스트](http://blog.aliencube.org/ko/2017/11/05/installing-phpmyadmin-to-azure-webapp-and-azure-mysql/)에서 다뤘으니 여기서는 넘어가도록 한다. 다만 좀 더 향상된 보안을 위해 애저 MySQL 인스턴스 연결에 필요한 정보를 환경 변수에 저장하는 방법에 대해 짚어볼 필요가 있다. 우선 `Application settings` 블레이드를 열어 아래와 같이 몇가지 정보를 추가한다.

- `MYSQL_DB_NAME`: 데이터베이스 이름. 여기서는 `my_wordpress_db`라고 하자.
- `MYSQL_DB_USER`: 데이터베이스 접속 사용자 ID. 항상 `username@hostname`과 같은 형태여야 한다. 예를 들어 사용자 ID가 `supercoolsqluser`이고, 데이터베이스 서버 이름이 `mysql-server`라면 이 값은 항상 `supercoolsqluser@mysql-server`가 된다.
- `MYSQL_DB_PASSWORD`: 데이터베이스 접속 패스워드
- `MYSQL_DB_HOST`: 데이터베이스 서버 전체 도메인. 애저 MySQL 인스턴스의 도메인 이름은 항상 `[hostname].mysql.database.azure.com`과 같은 형식이다. 따라서, 이 예제에서는 `mysql-server.mysql.database.azure.com`가 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-wordpress-to-azure-webapp-and-azure-mysql-01.png)

그리고, 루트 디렉토리를 아래와 같이 `site\wwwroot\wordpress`로 변경한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-wordpress-to-azure-webapp-and-azure-mysql-02.png)

이제 기본적인 애저 웹 앱 인스턴스의 환경 설정 부분은 끝났다. 다음 단계로 넘어가보자.

## 애저 웹 앱 아웃바운드 IP 주소 등록

기본적으로 애저 MySQL 데이터베이스는 등록되지 않은 IP 주소에서 접속하는 것을 허락하지 않는다. 심지어 애저 웹 앱이라고 할지라도 접속을 허용하지 않기 때문에 애저 MySQL에서 제공하는 방화벽에 애저 웹 앱의 아웃바운드 IP 주소를 등록해야 한다. 먼저 애저 웹 앱 인스턴스의 `Properties` 블레이드를 열어 보면 아래와 같이 아웃바운드 IP 주소가 나온다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-wordpress-to-azure-webapp-and-azure-mysql-03.png)

보통 네 개 정도의 IP 주소가 보이는데, 이 주소를 애저 MySQL 데이터베이스의 방화벽에 등록시키면 된다. 애저 MySQL 데이터베이스 인스턴스를 열어 `Connection security` 블레이드를 클릭한다. 그러면 SSL 커넥션이 활성화 된 것을 볼 수 있다. 이는 애저 MySQL 데이터베이스에서 강력하게 권장하는 설정이므로 특별한 사정이 있지 않은 이상 항상 `Enabled`로 설정해 놓는다. 그 아랫부분에는 `Firewall rules` 섹션이 있는데 여기에 앞서 확인한 애저 웹 앱 인스턴서의 아웃바운드 IP 주소를 등록시킨다. `Start IP`와 `End IP` 값을 동일하게 주면 된다. 여기서 한가지 주의해야 할 점이 있는데, 이 아웃바운드 IP 주소는 웹 앱 인스턴스를 재시작하거나, 해당 웹 앱 인스턴스가 있는 리전에 신규 하드웨어가 추가된다거나 하는 등의 이유로 종종 바뀔 때가 있다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-wordpress-to-azure-webapp-and-azure-mysql-04.png)

여기까지 하면 애저 웹 앱 인스턴스에서 애저 MySQL 데이터베이스로 접속할 수 있는 기반은 마련된 셈이다. 이제 애저 웹 앱 인스턴스에 워드프레스를 설치할 차례이다.

## 워드프레스 설치

애저 웹 앱 인스턴스를 생성하면 이를 관리하는 KUDU 서비스도 함께 사용할 수 있다. 워드프레스는 이 KUDU에서 직접 다운로드 받아 설치하면 된다. 먼저 KUDU 서비스로 접속한다. 만약 웹 앱 인스턴스의 이름이 `my-wordpress.azurewebsites.net` 이라면 KUDU 접속을 위한 주소는 `my-wordpress.scm.azurewebsites.net`이 된다. 여기에서 Debug console > CMD 메뉴로 이동한 후 `wwwroot` 디렉토리까지 이동한다. 그 후 워드프레스 설치 파일을 다운로드 받기 위해 아래 명령어를 실행한다.

```bat
curl -L https://wordpress.org/latest.zip > wordpress.zip

```

이 명령어를 실행시키면 `wwwroot` 디렉토리 아래에 `wordpress.zip` 파일을 다운로드 받는다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-wordpress-to-azure-webapp-and-azure-mysql-05.png)

파일 다운로드가 끝나면 아래 명령어를 실행시켜 압축을 푼다.

```bat
unzip wordpress.zip

```

압축을 풀면 `wwwroot` 바로 아래에 `wordpress` 라는 디렉토리가 생기고 그 아래로 모든 파일들이 생긴다. `wordpress` 디렉토리로 이동한다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-wordpress-to-azure-webapp-and-azure-mysql-06.png)

## 애저 MySQL 데이터베이스 연결

이제 워드프레스에 애저 MySQL 데이터베이스를 연결할 차례이다. 여기서 애저 웹 앱을 곧바로 실행시킨다면 바로 데이터베이스 설정 마법사 화면이 나오면서 필요한 값을 입력하면 된다. 하지만, 이 경우에는 MySQL 인스턴스가 SSL 커넥션을 요구하는 상황에 대한 고려가 없기 때문에 결국 실패하게 된다. 따라서 수동으로 설정해주는 것이 좋다. 이럴 땐 아래 명령어를 실행해서 `wp-config.php` 파일을 준비한다.

```bat
copy wp-config-sample.php wp-config.php

```

아래와 같은 결과를 만나게 된다.

![](https://sa0blogs.blob.core.windows.net/aliencube/2017/11/installing-wordpress-to-azure-webapp-and-azure-mysql-07.png)

이제 `wp-config.php` 파일을 아래와 같이 수정한다.

```php
...

/** The name of the database for WordPress */
define('DB_NAME', getenv('MYSQL_DB_NAME'));

/** MySQL database username */
define('DB_USER', getenv('MYSQL_DB_USER'));

/** MySQL database password */
define('DB_PASSWORD', getenv('MYSQL_DB_PASSWORD'));

/** MySQL hostname */
define('DB_HOST', getenv('MYSQL_DB_HOST'));

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/** MySQL database connection over SSL */
define('MYSQL_CLIENT_FLAGS', MYSQLI_CLIENT_SSL | MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT);

...

define('AUTH_KEY',         '[HASHED_SALT_VALUE]');
define('SECURE_AUTH_KEY',  '[HASHED_SALT_VALUE]');
define('LOGGED_IN_KEY',    '[HASHED_SALT_VALUE]');
define('NONCE_KEY',        '[HASHED_SALT_VALUE]');
define('AUTH_SALT',        '[HASHED_SALT_VALUE]');
define('SECURE_AUTH_SALT', '[HASHED_SALT_VALUE]');
define('LOGGED_IN_SALT',   '[HASHED_SALT_VALUE]');
define('NONCE_SALT',       '[HASHED_SALT_VALUE]');

...

```

이미 애저 웹 앱 인스턴스의 환경 변수에 MySQL 연결과 관련한 모든 내용을 다 입력해 두었으므로, 여기서는 해당 값을 받아오기면 하면 된다. 이 때 쓸 수 있는 함수가 바로 [`genenv(KEY)`](http://php.net/manual/en/function.getenv.php) 이다. 마지막으로 애저 MySQL 데이터베이스에 SSL로 연결하기 위해서는 위와 같이 `MYSQL_CLIENT_FLAGS` 라는 값을 하나 정의해서 그 값을 `MYSQLI_CLIENT_SSL | MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT`로 설정한다.

## HTTPS 강제하기

만약 애저 웹 앱 인스턴스의 URL을 그대로 이용할 경우 웹 앱에 대한 기본적인 SSL 커넥션을 제공하므로 보안을 위해 HTTP 연결 요청도 자동으로 HTTPS 연결로 넘어가게끔 리디렉션을 강제하는 것이 좋다. 이는 `web.config` 파일을 아래와 같이 수정하면 된다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Force HTTPS" enabled="true">
          <match url="(.*)" ignoreCase="false" />
          <conditions>
            <add input="{HTTPS}" pattern="off" />
            <add input="{WARMUP_REQUEST}" pattern="1" negate="true" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" appendQueryString="true" redirectType="Permanent" />
        </rule>
        ...
      </rules>
    </rewrite>
  </system.webServer>
</configuration>

```

이렇게 하면 `http://my-wordpress.azurewebsites.net` 이라고 접속해도 자동으로 `https://my-wordpress.azurewebsites.net`으로 강제 리디렉션을 시켜 향상된 보안 연결을 이용할 수 있다.

지금까지 애저 웹 앱 인스턴스와 애저 MySQL 데이터베이스를 이용해 워드프레스를 설치하고 데이터베이스를 연결하는 방법에 대해 알아보았다.
