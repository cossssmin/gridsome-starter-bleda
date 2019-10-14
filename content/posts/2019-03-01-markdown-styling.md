---
title: "Markdown styling"
description: "Markdown post content stress test. See how your post content is being styled with Tailwind CSS."
date: 2019-02-27 17:54:43
author: gridsome
tags: ['markdown', 'design']
---

**Blog posts in Bleda are written using Markdown. However, you are free to use HTML inside Markdown, for any elements not covered by the spec.**

Markdown is intended to be as easy-to-read and easy-to-write as is feasible.Readability, however, is emphasized above all else. A Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

**Haxx0r** ipsum _then_ less spoof ifdef ~~boolean~~ bang injection while it's a _**feature**_. Finally back door bit gc client access suitably small values injection protocol ack loop. Bang public echo baz server packet sniffer syn cd.

Frack highjack float buffer [function protocol](https://gridsome.org) I'm compiling. Root leet all your base are belong to us char protected ascii *.* regex semaphore root bin ip snarf foo <mark>Linus Torvalds</mark>. Cache Dennis Ritchie gc `echo endif` script kiddies **public** new tera brute force fork fopen spoof bytes tcp.

## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Heading 1 is the title of this page. You should only use it once in a document.

## Links

When you paste in a URL like so: https://gridsome.org, it will be automatically converted to a link. Otherwise, you can use the standard `[link text](https://...)` markdown to create a link.

## Ordered list

1. python
2. root
3. public
4. bypass

## Unordered list

- boolean
- stack
- foad
- tarball

## A definition list

This list is created using `<dl>`, `<dt>`, and `<dd>` HTML tags.

<dl>
  <dt>First Term</dt>
  <dd>This is the definition of the first term.</dd>
  <dt>Second Term</dt>
  <dd>This is one definition of the second term. </dd>
  <dd>This is another definition of the second term.</dd>
</dl>

## Blockquotes

> Trojan horse protected afk finally irc ip new kilo fork boolean. Int ack long less lib crack emacs gnu foo *.* segfault suitably small values ascii rsa throw void I'm sorry Dave

## Code

### Fenced codeblocks

Bleda uses [gridsome-plugin-remark-shiki](https://github.com/EldoranDev/gridsome-plugin-remark-shiki) to add syntax highlighting to code blocks. Roll with the default light one, or choose one of the other [themes available](https://github.com/octref/shiki/tree/master/packages/themes).

```vue
<template>
  <div id="app">
    <h1>My Todo App!</h1>
    <TodoList/>
  </div>
</template>

<script>
import TodoList from './components/TodoList.vue'

export default {
  components: {
    TodoList
  }
}
</script>

<style lang="postcss">
#app {
  @apply text-grey-darker max-w-sm mx-auto leading-normal font-sans;

  h1 {
    @apply text-black text-4xl;
  }
}
</style>
```

Of course, it also styles `inline code blocks`.

## Images

Here's a local image:

![iMac rear photo by Georgie Cobbs on Unsplash](/images/posts/georgie-cobbs-467924-unsplash.jpg)

As you just saw, Gridsome loads it only when it enters your viewport.

Here's an external image, hotlinked from Unsplash and linked to its page there:

[![Window photo by Mirna Rivalta on Unsplash](https://images.unsplash.com/photo-1551107671-b3ce56b6c667?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&h=360&q=80)](https://unsplash.com/photos/UecFf82b1qo)

As you can see, the lightbox is not used for linked images. Also, if the URL they link to is external, it will open in a new tab - just like the one above.
