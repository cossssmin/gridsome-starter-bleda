---
title: "워드프레스에서 Gridsome으로 블로그 이전후 깃헙 액션을 통해 넷틀리파이에서 호스팅하기"
slug: migrating-wordpress-to-gridsome-on-netlify-through-github-actions
description: "이 포스트에서는 기존의 설치형 워드프레스 블로그를 vue.js 기반의 gridsome 이라는 정적 사이트 생성 도구를 이용해서 이전한 후 깃헙 액션을 통해 넷틀리파이로 호스팅하는 과정을 다뤄봅니다."
date: "2020-01-03"
author: Justin-Yoo
tags:
- front-end-web-dev
- wordpress
- gridsome
- netlify
- github-actions
- migration
cover: https://sa0blogs.blob.core.windows.net/aliencube/2020/01/migrating-wordpress-to-gridsome-on-netlify-through-github-actions-00.png
fullscreen: true
---

이 포스트에서는 [워드프레스][blog wordpress]에서 [gridsome][blog gridsome]으로 이전하고, 이를 [깃헙 액션][gh actions]을 통해 [넷틀리파이][netlify]로 호스팅하는 전반적인 과정을 살펴보기로 한다.

## 왜 gridsome 인가? ##

[워드프레스][blog wordpress]는 분명히 세상에서 가장 잘 만들어진 블로그 발행 도구중 하나임에는 틀림이 없다. 그런데, 가장 큰 문제라면 문제일 것이 일단 설치형 버전의 워드프레스라면 어딘가에 호스팅을 해야 하고 꾸준히 업데이트를 해 줘야 하는데, 이게 평소에 아무 문제가 없을 경우에라면야 크게 상관이 없지만 한번 꼬이기 시작하면 굉장히 골치가 아파진다. 워드프레스도 내부적으로 계속 업그레이드 되면서 플러그인이라든가 테마, 그리고 워드프레스 자체도 자동으로 업그레이드 되게끔 하는 설정이 가능해 졌긴 하지만 여전히 불편하다. 게다가 웹사이트와 데이터베이스 모두 직접 관리를 해 줘야하는지라 너무 번잡스럽다. 반면 서비스형 워드프레스는 모든 것이 자동으로 관리가 되기 때문에 상당히 편리하게 쓸 수 있지만, 커스텀 도메인이라든가 커스텀 테마, 커스텀 플러그인 설치를 위해서는 별도의 비용을 지불해야 하고 이 비용은 설치형 워드프레스를 사용할 때와 비교해서 더 비싸면 비쌌지 결코 싸지 않다.

이런 이유로 예전부터 계속해서 워드프레스에서 호스팅하던 블로그를 정적 웹사이트로 이전하는 것에 대해 많이 방법을 찾아봤다. 맨 처음에는 [Jekyll][blog jekyll]을 들여다 봤고, 다음에는 [Hexo][blog hexo], 그리고 [Hugo][blog hugo]까지 계속 시도를 해 봤는데, 딱히 꼭 집어 얘기할 수는 없지만 뭔가 내가 쓰고 싶은 용도와는 맞지 않다는 느낌을 받았다. 그래서 거의 2-3년 정도를 할까말까 고민만 하고 있었다. 그러다가 [React][reactjs] 기반의 [Gatsby][blog gatsby]를 보게 됐다. 개인적으로 리액트를 한 번도 해 본 적이 없던 터라 사용해 볼 엄두를 내질 못했는데, 그렇다면 그나마 한 번이라도 예전에 해 봤던 [vue.js][vuejs] 기반의 도구도 있지 않을까 해서 찾아보니 [gridsome][blog gridsome]이라는 도구를 찾았다. 그래서 이 도구를 이용해서 이런저런 테스트를 해 보면서 [이 블로그][blog post 1]도 써 봤고, [이 블로그][blog post 2]도 써 봤다. 그러면서 다른 도구들 보다 내가 사용하기에 좀 더 알맞다는 가능성을 봤다. 딱히 써 놓고 보니 논리적인 이유라기 보다는 kibun 탓이네?


## 왜 깃헙 액션인가? ##

[애저 DevOps][az devops] 대신 [깃헙 액션][gh actions]을 선택한 가장 큰 이유는 깃헙 안에서 모든 것이 해결이 가능하기 때문이다. 굳이 [애저 DevOps][az devops]를 별도로 연결하고 설정하지 않아도 된다는 점이 가장 컸다. 게다가 [깃헙 액션은 애저 파이프라인을 포크한 것][gh actions hosted runners]으로 좀 더 사용하기 쉽게 다듬어졌다. 그리고 [깃헙 액션][gh actions]이 돌아가는 러너 역시 애저상에서 돌아간다. 그러니 안 쓸 이유가 없다!

> 만약 [깃헙 액션][gh actions]이 없었다면 [애저 DevOps][az devops]를 사용했을 것이다. 여러 CI/CD 도구를 사용해 봤지만 서비스형으로서 무료로 오픈소스를 지원하는 가장 최적의 사용자 경험을 제공하기 때문이다.


## 왜 넷틀리파이인가? ##

맨 처음에는 [애저 블롭 저장소][az blob storage]의 [정적 웹사이트 호스팅 기능][az blob static website 1]을 고려했다. 하지만 [블롭 저장소 하나당 하나의 호스팅만 가능][az blob static website 2]하기 때문에 결론적으로 내 경우에는 세 개의 호스팅([justinchronicles.net][jc], [aliencube.org][ac], [devkimchi.com][dk])을 한번에 하기에는 맞지 않았다. 게다가 [커스텀 도메인을 설정][az storage custom domain]하고 난 후 [HTTPS 연결 기능][az storage https]을 위해서는 [애저 CDN][az cdn]과 같은 추가적인 작업이 더 필요한지라 좀 더 한 자리에서 손쉽게 호스팅이 가능한 [넷틀리파이][netlify]로 결정했다.


## 워드프레스 포스트 변환 ##

### XML 추출 ###

[워드프레스][blog wordpress]에서는 마크다운으로 내보내기 기능이 없다. 의외로 제대로 작동하는 플러그인도 없어서 우선은 기본 제공하는 [내보내기 기능][wp export]을 이용해 XML 파일로 추출했다. 이렇게 추출한 XML 파일을 이용해 마크다운으로 변환시켜야 한다.


### 마크다운 변환 ###

가장 시간이 많이 걸렸던 부분이 바로 여기다. 우선 [wordpress-export-to-markdown][wp2md]를 이용해 워드프레스 추출 파일을 마크다운으로 변환했다. 그런데, 변환 결과의 [프론트매터][frontmatter] 내용이 많이 빈약해서 매 포스트를 열어 이를 수정해야 했다. [Jekyll][blog jekyll]의 프론트매터 형태를 다른 도구에서도 거의 동일하게 따라하고 있기 때문에 마크다운으로 변환된 파일의 프론트매터를 필요한 내용으로 수정하는 것은 크게 어려움이 없었다. 단지 시간이 많이 걸렸을 뿐.

변환후 생긴 포스트의 프론트매터는 아래와 같았다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=frontmatter-1-ko.yaml

하지만 [gridsome][blog gridsome]이 기본적으로 생성해주는 파일은 아래와 같이 좀 더 많은 프론트매터가 필요하다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=frontmatter-2-ko.yaml&highlights=3-4,6-9

따라서 `title`과 `date`를 제외한 나머지는 모두 추가해 줘야 했다. 다행히도 전체 포스트 수가 생각보다 많지 않아서 시간이 오래 걸리진 았았지만, 그래도 다시 한 번 더 하라면 못하겠다. 이렇게 해서 마크다운으로 변환을 다 끝냈다.


## gridsome 블로그 테마 준비 ##

[gridsome][blog gridsome]은 다양한 [스타터][gs starter]를 제공한다. 공식 스타터도 있고 써드파티 스타터도 있고 해서 양이 그렇게 많지는 않지만 마크다운용 스타터 중에서 현재 사용하고 있는 [Bleda][gs starter bleda]를 선택했다. 다른 스타터에 비해 트위터, 유튜브, gist 등의 연동이 쉽게 가능하기 때문이다.


## gridsome 플러그인 준비 ##

기본적인 플러그인은 이미 스타터에 다 들어 있기 때문에 딱히 추가로 설정할 일은 없었다. 다만...


### gridsome-plugin-remark-embed ###

[소셜미디어 연동 플러그인][gs plugin embed]을 추가했다. 그런데, 이 플러그인의 gist 연동 쪽 코드에 오류가 있어서 [PR][gs plugin embed pr]을 날려 수정했고 릴리즈를 기다리는 중이다. 그동안 사용하지 않을 수는 없으니 별도의 `patches` 디렉토리에 `Gist.js` 파일을 복사해서 향후 배포시 사용할 수 있게 해 놓았다.


### vue-disqus ###

또한 [코멘트 기능][gs plugin comments] 기능을 추가했다. 이미 [Disqus][disqus] 서비스를 몇 년째 쓰고 있기도 했고, 무엇보다도 찰진 코멘트들이 많아서 포기하지는 못하겠더라. 그래서 당분간은 붙여두고 상황을 볼 생각이다.


## gridsome 환경 설정 ##

### 메타데이터 설정 ###

웹사이트에 기본적으로 사용할 메타데이터와 파비콘을 블로그에 맞게 설정했다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=config-metadata.js


### 퍼머링크 설정 ###

기존 워드프레스의 퍼머링크 구조를 그대로 가져가기 위해 `gridsome.config.js` 파일에서 퍼머링크 구조를 수정했다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=config-permalink.js&highlights=3-4

또한 RSS 피드의 피드 URL 설정도 퍼머링크에 맞게 수정했다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=config-rss-feed.js&highlights=9-10


### 한국어 폰트 지정 ###

한국어 폰트는 [구글 웹폰트][google webfonts]에서 [나눔고딕체][google webfonts nanumgothic]를 가져와 사용했다. 웹폰트는 `/src/main.js` 파일을 수정했다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=main-web-font.js

또한 CSS를 수정하기 위해 `tailwind.config.js` 파일을 아래와 같이 수정했다. 아래와 같이 수정함으로써 CSS에 `font-sans` 클라스만 추가하면 자동적으로 나눔고딕체를 렌더링한다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=config-tailwind.js&highlights=4


### 깃헙 gist 스타일 지정 ###

깃헙 gist의 스타일을 그대로 보여주기 위해서는 아래와 같이 별도의 스타일시트를 `src/main.js` 파일에 추가해 줬다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=main-gist.js


### 커버 이미지 추가 ###

오리지날 테마는 리스트 화면에는 커버 이미지가 나타나지 않았는데, 리스트에도 커버 이미지를 보여주기 위해 아래와 같이 `/src/components/PostItem.vue` 파일에 커버 이미지를 나타낼 수 있게끔 했다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=post-item-cover.vue&highlights=3-5

또한, 이 커버 이미지를 GraphQL에서 받아올 수 있게 하기 위해 `/src/templates/Author.vue` 파일과 `/src/templates/Tag.vue` 파일의 GraphQL 쿼리 부분을 수정했다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=graphql.vue&highlights=13

여기까지 해서 기본적인 설정은 다 끝났다.


## 넷틀리파이 인스턴스 준비 ##

[넷틀리파이][netlify]에 호스팅을 하기 위해서는 인스턴스가 필요하다. 넷틀리파이에 인스턴스를 만드는 방법은 깃헙을 직접 연동해서 사용할 수도 있지만 우리는 [깃헙 액션][gh actions]을 이용해서 배포할 예정이므로 아무 파일이나 하나 던져 놓으면 인스턴스가 만들어진다.

![][image-01]

이렇게 만들어진 인스턴스는 고유의 ID 값과 사이트 이름이 자동으로 생성되는데, 이를 깃헙 액션에서 사이트에 배포할 때 사용해야 한다.

![][image-02]

마지막으로 넷플리파이에 배포하기 위한 인증키를 만들어야 한다. 이는 [Personal Access Token][netlify pat]을 생성해서 사용한다.


## 깃헙 액션 워크플로우 준비 ##

웹사이트 이전 준비도 끝났고 넷틀리파이 인스턴스도 준비가 끝났다. 이제 아래와 같이 깃헙 액션을 설정해서 배포만 하면 된다.

### 이벤트 ###

`master` 브랜치는 원래 스타터 브랜치가 업데이트 됐을 경우 변경사항을 받아오는 용도로 쓸 예정이므로 `dev` 브랜치에 포스트를 작성하고 푸시하면 깃헙 액션이 작동하도록 이벤트를 설정했다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-event.yaml&highlights=2,4

### 러너 ###

러너는 깃헙이 제공하는 우분투 러너를 사용한다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-runner.yaml&highlights=3

### 스텝 ###

가장 먼저 체크아웃 액션을 통해 리포지토리를 다운로드 받는다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-step-checkout.yaml&highlights=3

이후의 액션은 별도의 외부 액션을 사용하는 대신 액션 자체적으로 제공하는 배시 셸 액션만으로 스텝을 구성했다. 넷틀리파이 CLI를 다운로드 받아 설치한다. 이때 `-g` 옵션을 주기 위해서는 `sudo` 명령어를 사용해야 한다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-step-install-netlify.yaml&highlights=4

이어서 npm 패키지를 복원한다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-step-restore-npm-packages.yaml&highlights=4

앞서 언급한 바와 같이 `Gist.js` 파일 변경 사항이 공식적으로 릴리즈가 될 때 까지 임시로 패치한다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-step-monkey-patch.yaml&highlights=4

npm 패키지 복원 및 패치가 끝났으므로 애플리케이션을 빌드한다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-step-build-app.yaml&highlights=4

넷틀리파이의 도메인 리디렉션과 관련한 설정 파일을 `dist` 디렉토리로 복사한다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-step-copy-redirects.yaml&highlights=4

마지막으로 아래와 같이 넷틀리파이 CLI를 이용해서 파일을 배포한다. 여기서 `NETLIFY_SITE_ID` 값과 `NETLIFY_AUTH_TOKEN` 값은 앞서 생성한 값을 깃헙 리포지토리 설정에서 저장해 놓은 값이다.

https://gist.github.com/justinyoo/53cefa22732c8bc33348aa99e0674a37?file=github-actions-step-publish-app.yaml&highlights=4

이렇게 해서 블로그 이전 절차가 끝났다. 앞으로는 더이상 워드프레스 유지보수 걱정 없이 코드 리포지토리만 잘 관리하면 블로그 포스팅에 어려움이 없을 것 같다.


[image-01]: https://sa0blogs.blob.core.windows.net/aliencube/2020/01/migrating-wordpress-to-gridsome-on-netlify-through-github-actions-01.png
[image-02]: https://sa0blogs.blob.core.windows.net/aliencube/2020/01/migrating-wordpress-to-gridsome-on-netlify-through-github-actions-02.png

[jc]: https://justinchronicles.net
[ac]: https://blog.aliencube.org
[dk]: https://devkimchi.com
[reactjs]: https://reactjs.org/
[vuejs]: https://vuejs.org/
[netlify]: https://www.netlify.com/
[disqus]: https://disqus.com/

[blog wordpress]: https://wordpress.org/
[blog jekyll]: https://jekyllrb.com/
[blog hexo]: https://hexo.io/
[blog hugo]: https://gohugo.io/
[blog gatsby]: https://www.gatsbyjs.org/
[blog gridsome]: https://gridsome.org/

[blog post 1]: https://blog.aliencube.org/ko/2019/12/13/publishing-static-website-to-azure-blob-storage-via-github-actions/
[blog post 2]: https://blog.aliencube.org/ko/2019/12/18/building-ci-cd-pipelines-with-github-actions/

[az devops]: https://azure.microsoft.com/ko-kr/services/devops/?WT.mc_id=aliencubeorg-blog-juyoo
[az blob storage]: https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blobs-overview?WT.mc_id=aliencubeorg-blog-juyoo
[az blob static website 1]: https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blob-static-website-how-to?tabs=azure-portal&WT.mc_id=aliencubeorg-blog-juyoo
[az blob static website 2]: https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-blob-static-website?WT.mc_id=aliencubeorg-blog-juyoo
[az storage custom domain]: https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-custom-domain-name?WT.mc_id=aliencubeorg-blog-juyoo
[az storage https]: https://docs.microsoft.com/ko-kr/azure/storage/blobs/storage-https-custom-domain-cdn?WT.mc_id=aliencubeorg-blog-juyoo
[az cdn]: https://docs.microsoft.com/ko-kr/azure/cdn/cdn-overview?WT.mc_id=aliencubeorg-blog-juyoo

[gh actions]: https://github.com/features/actions
[gh actions hosted runners]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/virtual-environments-for-github-hosted-runners#about-github-hosted-runners

[wp export]: https://wordpress.org/support/article/tools-export-screen/
[frontmatter]: https://jekyllrb.com/docs/front-matter/
[wp2md]: https://github.com/lonekorean/wordpress-export-to-markdown

[gs starter]: https://gridsome.org/starters/
[gs starter bleda]: https://gridsome.org/starters/bleda/
[gs plugin embed]: https://gridsome.org/plugins/@noxify/gridsome-plugin-remark-embed
[gs plugin embed pr]: https://github.com/noxify/gridsome-plugin-remark-embed/pull/33
[gs plugin comments]: https://gridsome.org/docs/guide-comments/

[google webfonts]: https://fonts.google.com/
[google webfonts nanumgothic]: https://fonts.google.com/specimen/Nanum+Gothic

[netlify pat]: https://docs.netlify.com/cli/get-started/#obtain-a-token-in-the-netlify-ui
