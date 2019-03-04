<template>
  <article>
    <div class="container mx-auto max-w-lg px-6">
      <div class="bg-white py-8 sm:py-20 border-b border-grey-lighter">
        <header class="text-center mb-8">
          <time :datetime="post.datetime" class="text-grey text-xs mb-2 uppercase">{{ formatPublishDate(post.datetime) }}</time>
          <h2 class="sm:text-4xl font-sans mb-2">
            <g-link :to="`${post.path}/`" class="text-black no-underline">{{ post.title }}</g-link>
          </h2>
          <p class="text-grey-dark leading-normal">
            <span v-if="post.author">by <g-link :to="`${post.author.path}/`" class="text-grey-darker capitalize no-underline border-b border-transparent hover:border-grey transition-border-color" v-if="post.author">{{ titleCase(post.author.title) }}</g-link></span>
            <span v-if="post.tags && post.tags.length > 0"> in <g-link :to="`${post.tags[0].path}/`" class="text-grey-darker capitalize no-underline border-b border-transparent hover:border-grey transition-border-color">{{ titleCase(post.tags[0].title) }}</g-link></span>
          </p>
        </header>
        <p class="leading-normal text-grey-darker text-lg px-2 sm:px-4 md:px-10" v-html="excerpt(post, 280, ' ...')"></p>
      </div>
    </div>
  </article>
</template>

<script>
import moment from 'moment'

export default {
  props: ['post'],
  computed: {
    formattedPublishDate() {
      return moment(this.post.datetime).format('DD MMMM, YYYY');
    },
  },
  methods: {
    formatPublishDate(date) {
      return moment(date).format('DD MMMM, YYYY');
    },
    excerpt(post, length, clamp) {
      if (post.excerpt) {
        return post.excerpt
      }

      length = length || 280
      clamp = clamp || ' ...'
      let text = post.content.replace(/<pre(.|\n)*?<\/pre>/gm, '').replace(/<[^>]+>/gm, '')

      return text.length > length ? `${ text.slice(0, length)}${clamp}` : text
    },
    titleCase(str) {
      return str.replace('-', ' ').split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
    }
  },
}
</script>
