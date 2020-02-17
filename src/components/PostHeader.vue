<template>
  <header>
    <div v-if="post.cover" class="post-cover overflow-hidden relative" :class="[post.fullscreen ? 'fullscreen' : 'max-h-cover']">
      <div class="max-w-xl md:max-w-3xl xl:max-w-4xl text-center px-6 absolute z-10" :class="[post.fullscreen ? 'flex flex-col items-center m-auto inset-0': 'mx-auto bottom-0 inset-x-0 pb-16']">
        <div class="m-auto">
          <p class="text-white text-xs mb-2 uppercase">{{ post.timeToRead }} min read</p>
          <h1 class="text-3xl sm:text-5xl font-sans font-bold leading-tight mb-2 text-white">{{ post.title }}</h1>
          <p class="text-white">
            <span v-if="post.author">
              <g-link :to="`${post.author.path}/`" class="text-white capitalize border-b border-transparent hover:border-white transition-colors duration-300">{{ titleCase(post.author.title) }}</g-link> &bull;
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
      <div class="max-w-xl md:max-w-3xl xl:max-w-4xl mx-auto text-center px-6">
        <p class="text-gray-700 text-xs mb-2 uppercase">{{ post.timeToRead }} min read</p>
        <h1 class="text-3xl sm:text-5xl leading-tight font-sans font-bold mb-2 text-black">{{ post.title }}</h1>
        <p class="text-gray-700">
          <span v-if="post.author">
            <g-link :to="`${post.author.path}/`" class="text-gray-700 capitalize border-b border-transparent hover:border-gray-400 transition-colors duration-300">{{ titleCase(post.author.title) }}</g-link> &bull;
          </span>
          <time :datetime="post.datetime" class="capitalize">{{ formattedPublishDate }}</time>
        </p>
      </div>
    </div>
    <nav class="absolute top-0 left-0 z-20 mt-6 ml-6">
      <g-link to="/" :class="[post.cover ? 'text-white border-white' : 'text-gray-900 border-gray-400']" class="text-sm border opacity-75 hover:opacity-100 rounded-full px-4 py-2 transition-opacity duration-300">&larr; Home</g-link>
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
