<template>
  <Layout>
    <main>
      <post-header :post="$page.post" />

      <article class="container mx-auto max-w-lg px-6 sm:px-12 pt-16" :class="{'border-b border-grey-lighter pb-10 mb-16': !$page.post.author}">

        <alert v-if="postIsOlderThanOneYear" color="orange">This post is over a year old, some of this information may be out of date.</alert>

        <div :class="{'pb-10': $page.post.author || $page.post.tag}" class="markdown text-lg leading-normal text-grey-darkest" v-html="$page.post.content" />

        <footer v-if="$page.post.author || $page.post.tag" class="flex flex-wrap pb-10 sm:pb-16">
          <div>
            <g-link v-for="tag in $page.post.tags" :key="tag.id" :to="`${tag.path}/`" class="inline-block text-teal hover:text-white hover:bg-teal font-sans font-bold text-xs sm:text-sm border border-teal px-4 py-2 mr-4 mb-2 rounded-full no-underline transition-color transition-bg">
            <svg class="w-3 fill-current align-middle mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" role="img"><path d="M0 10V2l2-2h8l10 10-10 10L0 10zm4.5-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
            {{ tag.title }}
            </g-link>
          </div>
          <div v-if="$page.post.author" class="flex flex-wrap items-center justify-center sm:justify-left border-t border-b border-grey-lighter w-full mt-10 py-10 sm:px-16">
            <figure class="px-2 mb-1 sm:mb-0 w-full sm:w-1/5 text-center sm:text-left">
              <g-link :to="`${$page.post.author.path}/`">
                <img :src="avatar" :alt="$page.post.author.title" @error="imageLoadError" width="100" class="rounded-full p-4 sm:p-0">
              </g-link>
            </figure>
            <div class="px-4 sm:w-4/5 text-center sm:text-left">
              <h4 class="font-sans text-lg sm:text-xl mb-2 sm:mb-4">
                <g-link :to="`${$page.post.author.path}/`" class="text-black no-underline capitalize border-b-2 border-transparent hover:border-black transition-border-color">{{ titleCase($page.post.author.title) }}</g-link>
              </h4>
              <p class="leading-normal">
                <g-link :to="`${$page.post.author.path}/`" class="text-blue hover:text-blue-darker no-underline transition-color">See all posts by {{ titleCase($page.post.author.title) }} &rarr;</g-link>
              </p>
            </div>
          </div>
        </footer>
      </article>

      <site-footer class="pb-8 sm:pb-10" />
    </main>
  </Layout>
</template>

<script>
import moment from 'moment'
import Alert from '@/components/Alert'
import SiteFooter from '@/components/Footer'
import PostHeader from '~/components/PostHeader'

export default {
  components: {
    Alert,
    PostHeader,
    SiteFooter,
  },
  metaInfo () {
    return {
      title: `${this.$page.post.title} ${this.$page.post.tag ? '- '+this.$page.post.tag.name : ''}`,
      meta: [
        {
          key: 'description',
          name: 'description',
          content: this.description(this.$page.post)
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:description", content: this.description(this.$page.post) },
        { name: "twitter:title", content: this.$page.post.title },
        { name: "twitter:site", content: "@cossssmin" },
        { name: "twitter:image", content: this.$page.post.cover },
        { name: "twitter:creator", content: "@cossssmin" },
        { property: "og:updated_time", content: this.$page.post.datetime },
        { property: "og:image", content: this.$page.post.cover },
      ],
    }
  },
  mounted () {
    import('medium-zoom').then(mediumZoom => {
      this.zoom = mediumZoom.default('.markdown p > img')
    })
  },
  methods: {
    imageLoadError (e) {
      e.target.src = `/images/authors/default.png`
    },
    description(post, length, clamp) {
      if (post.description) {
        return post.description
      }

      length = length || 280
      clamp = clamp || ' ...'
      let text = post.content.replace(/<pre(.|\n)*?<\/pre>/gm, '').replace(/<[^>]+>/gm, '')

      return text.length > length ? `${ text.slice(0, length)}${clamp}` : text
    },
    titleCase(str) {
      return str.replace('-', ' ')
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ')
    },

  },
  computed: {
    avatar() {
      return `/images/authors/${this.$page.post.author.id}.png`
    },
    postIsOlderThanOneYear() {
      let postDate = moment(this.$page.post.datetime)
      return moment().diff(postDate, 'years') > 0 ? true : false
    }
  },
}
</script>

<page-query>
query Post ($path: String) {
  post (path: $path) {
    title
    datetime: date (format: "YYYY-MM-DD HH:mm:ss")
    content
    description
    timeToRead
    cover
    fullscreen
    author {
      id
      title
      path
    }
    tags {
      id
      title
      path
    }
  }
}
</page-query>
