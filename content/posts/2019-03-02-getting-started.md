---
title: "Getting started"
slug: getting-started-with-gridsome-and-bleda
description: "Getting started with the Bleda blog starter theme for the Gridsome static site generator"
date: 2019-03-01 14:43:24
author: bleda
tags:
    - getting-started
cover: https://pbs.twimg.com/profile_banners/710394749207896064/1547818514
---

**Bleda** is a minimal blog starter theme for Gridsome, inspired by the design of the [Attila](https://github.com/zutrinken/attila) Ghost theme, and styled with [Tailwind CSS](https://tailwindcss.com).

[Gridsome](https://gridsome.org) is a Vue.js-powered, modern site generator for building the fastest possible websites for any Headless CMS, APIs or Markdown-files. Gridsome makes it easy and fun for developers to create fast, beautiful websites without needing to become a performance expert.


## Installation

After installing Gridsome, run:

```
gridsome create my-website https://github.com/cossssmin/gridsome-starter-bleda.git
```

Then, `cd my-website` and `gridsome develop` to start a local development server.

Alternatively, you can clone or download the [repo on GitHub](https://github.com/cossssmin/gridsome-starter-bleda).

## Features

- Sitemap
- RSS Feed
- Google Analytics
- Custom 404 Page
- Open Graph meta tags
- Code syntax highlighting
- Parallax post image covers
- Option for fullscreen covers
- Medium-like image lightbox
- Taxonomies: Tags and Authors
- Aproximate read time for posts
- Post excerpts: automatic or user-defined
- **Paginated** [blog](/2/), [tag](https://gridsome-starter-bleda.netlify.com/tag/dummy/), and [author](/author/gridsome/) archives
- Easily show post dates in your locale (moment.js)
- Posts show a warning if they're older than 1 year (configurable)

## Configuration

You'll need to change some Bleda defaults before deploying your own site.

#### Google Analytics

If you want to use Google Analytics, make sure to change the default tracking code in `gridsome.config.js`:

```js
{
use: '@gridsome/plugin-google-analytics',
  options: {
    id: 'UA-135446199-1' // <- change this
  }
}
```

To disable GA, simply comment out or delete that entire code block.

#### Sitemap

Bleda uses Gridsome's official sitemap plugin. Simply change the default `siteUrl` in `gridsome.config.js`, and you're all set:

```js
siteUrl: 'https://gridsome-starter-bleda.netlify.com',
```

When you build the site, a `sitemap.xml` will be automatically generated at the root of your site.
Read more in the [plugin's documentation](https://gridsome.org/plugins/@gridsome/plugin-sitemap).

#### RSS Feed

Update the feed title and all the default URLs, in `gridsome.config.js`:

```js
{
  use: 'gridsome-plugin-rss',
  options: {
    contentTypeName: 'Post',
    feedOptions: {
      title: 'Bleda, a Gridsome blog starter', // <- update
      feed_url: 'https://gridsome-starter-bleda.netlify.com/feed.xml',  // <- update, leave the file name
      site_url: 'https://gridsome-starter-bleda.netlify.com'  // <- update
    },
    feedItemOptions: node => ({
      title: node.title,
      description: node.description,
      url: 'https://gridsome-starter-bleda.netlify.com/' + node.slug,  // <- update
      author: node.author,
      date: node.date
    }),
    output: {
      name: 'feed.xml' // <- if you change this, also change it in the `feed_url` above
    }
  }
},
```

## Customisation

#### Old content alert

Posts that are over one year old will show a warning like this one:

<div class="bg-orange-100 border-l-4 border-orange-500 text-orange-900 leading-normal p-4 md:mx-6 mb-6" role="alert">
    This post is over a year old, some of this information may be out of date.
</div>

This is a flexible alert component, defined in `/src/components/Alert.vue` and pulled into `/src/templates/Post.vue`: 

```vue
<template>
    ...
    <alert v-if="postIsOlderThanOneYear" color="orange">This post is over a year old, some of this information may be out of date.</alert>
    ...
</template>
```
The `postIsOlderThanOneYear` computed property uses `moment.js`, so you can customise it to any date you need.

The `color` prop can be any color name from your `tailwind.js` config. If you omit it, the alert will use <span class="inline-block bg-blue-lightest border-l-4 border-blue text-blue-darker px-2 py-px stext-sm">blue</span> as a fallback.

#### Post dates in your language

Open `/src/components/PostItem.vue` and `import` your [locale](https://github.com/moment/moment/tree/develop/locale "List of all moment.js locales") after the `moment` import:

```vue
<script>
import moment from 'moment'
import 'moment/locale/ro' // <- add this

export default {
  // ...
}
</script>
```

For the single post view, do the same in `/src/templates/Post.vue`.

#### Advanced customisation

The [Gridsome documentation](https://gridsome.org/docs) is a great place to start. You will need to be familiar with Vue.js, mostly. Tailwind CSS is very easy to pick up. For advanced customisation, you'll also need to know a bit about GraphQL.
