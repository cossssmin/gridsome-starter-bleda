# Bleda

> A blog starter theme for [Gridsome](https://gridsome.org), inspired by the [Attila](https://github.com/zutrinken/attila) Ghost theme and styled with [Tailwind CSS](https://tailwindcss.com).

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/cossssmin/gridsome-starter-bleda)

## Demo

- [Page](https://gridsome-starter-bleda.netlify.com/about/)
- [Single post](https://gridsome-starter-bleda.netlify.com/getting-started-with-gridsome-and-bleda/)
- [Blog archive](https://gridsome-starter-bleda.netlify.com/)
- [Tags archive](https://gridsome-starter-bleda.netlify.com/tag/getting-started/)
- [Author archive](https://gridsome-starter-bleda.netlify.com/author/gridsome/)

## Preview

![Bleda starter for Gridsome devices preview](https://res.cloudinary.com/cossssmin/image/upload/v1551618609/os/gridsome/bleda/bleda-screenshot-devices.jpg)

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
- **Paginated** [blog](https://gridsome-starter-bleda.netlify.com/2/), [tag](https://gridsome-starter-bleda.netlify.com/tag/dummy/), and [author](https://gridsome-starter-bleda.netlify.com/author/gridsome/) archives
- Easily show post dates in your locale (moment.js)
- Posts show a warning if they're older than 1 year (configurable)

## Installation

It's recommended that you install Bleda with the `gridsome create` command, so that Gridsome removes the `.git` folder and installs NPM dependencies for you: 

```sh 
gridsome create my-website https://github.com/cossssmin/gridsome-starter-bleda.git
```

Alternatively, you can clone this repo and set it up manually:

```sh 
git clone https://github.com/cossssmin/gridsome-starter-bleda.git my-website

# navigate to the directory
cd my-website

# remove the Git folder
rm -rf .git

# install NPM dependencies
npm install
```

## Configuration

See the [configuration notes](https://gridsome-starter-bleda.netlify.com/getting-started-with-gridsome-and-bleda/#configuration) in the Getting Started demo post.

## Development

Run `gridsome develop` to start a local development server, or `gridsome build` to build the static site into the `dist` folder.

See the [Gridsome docs](https://gridsome.org/docs) for more information.
