---
title: "Writing posts"
description: "Writing posts in Markdown with Bleda for Gridsome"
date: 2019-02-28 15:16:11
author: gridsome
slug: writing-posts-markdown
tags:
    - getting-started
    - content
cover: https://images.unsplash.com/photo-1539815913963-92c9bfeb9d1f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&h=900&crop=bottom&q=80
---

The starter uses Gridsome's filesystem source plugin, which means blog posts are Markdown files that exist in the `/content/posts` directory.

## Creating a new post

There are 2 ways you can create a new post with Bleda:

1. Simply add a new, uniquely-named `*.md` file in the `/content/posts` directory - duh!
2. In your terminal, navigate to the project root and run this command:

    ```sh
    npm run newpost "My post title"
    ```

    The quotes around the title are mandatory.

    This will create a new file named `YYYY-MM-DD-my-post-title.md` under `/content/posts`.

## Supported Front Matter keys

You can use the following Front Matter keys when creating a post:

```yaml
---
title: "Post title" # required
slug: post-title-custom-url # optional, override the auto-generated post slug
description: "Lorem ipsum description sit amet" # required, used in meta tags and RSS feed
date: 2019-03-01 17:54:43 # required; time is optional, but recommended for the <time> tag and better post sorting control
author: bleda # optional
tags: ['markdown', 'design'] # optional
cover: https://example.com/path/to/cover/image.jpg # optional parallax post cover image
fullscreen: false # optional - when `true`, makes parallax cover image take up full viewport height
excerpt: "Custom excerpt to show in archive pages" # optional
---
```

## Markdown syntax & styling

This is a short guide to using Markdown - see the [full spec](https://daringfireball.net/projects/markdown/syntax), or check out [how Bleda styles it](/markdown-styling/).

### Formatting text

#### Headings

```markdown
# This is an H1

## This is an H2

###### This is an H6
```

#### Paragraphs

A paragraph is simply one or more consecutive lines of text, separated by one or more blank lines. (A blank line is any line that looks like a blank line — a line containing nothing but spaces or tabs is considered blank.)

Normal paragraphs should not be indented with spaces or tabs.

#### Inline elements

Make text:

- **bold**: `**bold text**`
- _italic_: `_italic text_`
- ~~strikethrough~~: `~~strikethrough text~~`
- <mark>highlighted</mark>: `<mark>highlighted text</mark>`
- [link](https://example.com): `[link text](https://example.com)`

For links, you can also use the [reference-style](https://daringfireball.net/projects/markdown/syntax#link):

```markdown
[link text][id] reference-style link.
[id]: https://example.com/  "Optional Title Here"
```

#### Lists

Unordered:

```markdown
- one
- two
- three
```

Ordered:

```markdown
1. one
2. two
3. three
```

#### Blockquotes

```markdown
> Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere.
```

### Inserting Images

Local images are added with `![Image alt text](./images/image.jpg)`

Of course, you can reference images from a CDN:

`![Image alt text](https://example.com/image.jpg)`

#### Linking images

With Markdown, do: `[![Image alt text](https://example.com/path/to/image.jpg)](url to link to)`

### Dividing sections

Any of the following:

```markdown
* * *

***

*****

- - -

---

---------------------------------------
```

... will create a `<hr>` like this one:

---

### Code blocks

Both inline code and fenced codeblocks are supported.

To write inline code `like this` simply surround it with backticks: \`some inline code\`

#### Fenced codeblocks

Surround your code with triple backticks, like this:

```markdown
    ```language
    your code here
    ```
```

Specify the language ([reference](https://github.com/octref/shiki/blob/master/packages/languages/src/lang.ts)) in order to get proper syntax highlighting:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <p>Lorem ipsum</p>
</body>
</html>
```

If you don't specify a language, the code block will not be wrapped in a `<pre>` tag, and will look like this:

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <p>Lorem ipsum</p>
</body>
</html>
```

---

Cover photo by [Joyce McCown](https://unsplash.com/photos/h4BIz4rPPy0).
