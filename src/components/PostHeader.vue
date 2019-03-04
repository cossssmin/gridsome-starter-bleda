<template>
  <header>
    <div v-if="post.cover" class="post-cover overflow-hidden relative" :class="[post.fullscreen ? 'fullscreen' : 'max-h-cover']">
      <div class="container max-w-lg text-center px-6 absolute z-10" :class="[post.fullscreen ? 'flex flex-col items-center m-auto pin': 'mx-auto pin-b pin-x pb-16']">
        <div class="m-auto">
          <p class="text-white text-xs mb-2 uppercase">{{ post.timeToRead }} min read</p>
          <h1 class="sm:text-4xl font-sans font-bold mb-2 text-white">{{ post.title }}</h1>
          <p class="text-white">
            <span v-if="post.author">
              <g-link :to="`${post.author.path}/`" class="text-white no-underline capitalize border-b border-transparent hover:border-white transition-border-color">{{ titleCase(post.author.title) }}</g-link> &bull;
            </span>
            <time :datetime="post.datetime" class="capitalize">{{ formattedPublishDate }}</time>
          </p>
        </div>
      </div>
      <ClientOnly>
        <parallax :speed-factor="speedFactor" :sectionHeight="80">
          <img :src="post.cover" :alt="post.title">
        </parallax>
      </ClientOnly>
    </div>
    <div v-else class="pt-24">
      <div class="container max-w-lg mx-auto text-center px-6">
        <p class="text-grey-dark text-xs mb-2 uppercase">{{ post.timeToRead }} min read</p>
        <h1 class="sm:text-4xl font-sans font-bold mb-2 text-black">{{ post.title }}</h1>
        <p class="text-grey-dark">
          <span v-if="post.author">
            <g-link :to="`${post.author.path}/`" class="text-grey-dark no-underline capitalize hover:border-b">{{ titleCase(post.author.title) }}</g-link> &bull;
          </span>
          <time :datetime="post.datetime" class="capitalize">{{ formattedPublishDate }}</time>
        </p>
      </div>
    </div>
    <nav class="absolute pin-t pin-l z-20 mt-6 ml-6">
      <g-link to="/" :class="[post.cover ? 'text-white border-white' : 'text-grey-darkest border-grey-dark']" class="text-sm border opacity-75 hover:opacity-100 rounded-full no-underline px-4 py-2 transition-opacity">&larr; Home</g-link>
    </nav>
  </header>
</template>

<script>
import moment from 'moment'
import Parallax from "vue-parallaxy"

export default {
  props: ['post'],
  components: {
    Parallax
  },
  methods: {
    titleCase(str) {
      return str.replace('-', ' ')
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ')
    }
  },
  computed: {
    formattedPublishDate() {
      return moment(this.post.datetime).format('DD MMMM, YYYY');
    },
    speedFactor() {
      return this.post.fullscreen ? 0.21 : 0.37
    }
  },
}
</script>
