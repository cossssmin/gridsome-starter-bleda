<template>
  <Layout>
    <main>
      <header>
        <div class="max-w-xl md:max-w-3xl xl:max-w-4xl flex flex-col-reverse mx-auto text-center px-6 pt-24 pb-10 md:py-32 border-b border-gray-300">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-sans font-bold mb-2 capitalize">{{ titleCase($page.author.title) }}</h1>
          <svg class="w-5 sm:w-6 fill-current text-gray-500 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" role="img" aria-labelledby="authorIcon"><title id="authorIcon">Author posts</title><path d="M5 5a5 5 0 0 1 10 0v2A5 5 0 0 1 5 7V5zM0 16.68A19.9 19.9 0 0 1 10 14c3.64 0 7.06.97 10 2.68V20H0v-3.32z"/></svg>
        </div>
        <nav class="absolute top-0 left-0 z-20 mt-6 ml-6">
          <g-link to="/" class="text-sm border text-gray-900 border-gray-400 opacity-75 hover:opacity-100 rounded-full px-4 py-2 transition-opacity">&larr; Home</g-link>
        </nav>
      </header>
      <section>
        <post-item v-for="edge in $page.author.belongsTo.edges" :key="edge.node.id" :post="edge.node" />
      </section>
      <pagination :base="`${$page.author.path}`" :info="$page.author.belongsTo.pageInfo" v-if="$page.author.belongsTo.pageInfo.totalPages > 1" />
      <site-footer class="py-8 sm:py-16" />
    </main>
  </Layout>
</template>

<script>
import moment from 'moment'
import config from '~/.temp/config.js'
import PostItem from '@/components/PostItem'
import SiteFooter from '@/components/Footer'
import Pagination from '@/components/Pagination'

export default {
  components: {
    PostItem,
    Pagination,
    SiteFooter,
  },
  metaInfo () {
    return {
      title: `Posts written by ${this.titleCase(this.$page.author.title)}`,
      meta: [
        {
          key: 'description',
          name: 'description',
          content: `Browse posts written by ${this.titleCase(this.$page.author.title)}`
        },

        { property: "og:type", content: 'website' },
        { property: "og:title", content: `Posts written by ${this.titleCase(this.$page.author.title)}` },
        { property: "og:description", content: `Browse posts written by ${this.titleCase(this.$page.author.title)}` },
        { property: "og:url", content: `${this.config.siteUrl}/${this.$page.author.path}/` },
        { property: "og:image", content: this.ogImageUrl },

        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `Posts written by ${this.titleCase(this.$page.author.title)}` },
        { name: "twitter:description", content: `Browse posts written by ${this.titleCase(this.$page.author.title)}` },
        { name: "twitter:site", content: "@cossssmin" },
        { name: "twitter:creator", content: "@cossssmin" },
        { name: "twitter:image", content: this.ogImageUrl },
      ],
    }
  },
  methods: {
    titleCase(str) {
      return str.replace('-', ' ').split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
    }
  },
  computed: {
    config () {
      return config
    },
    ogImageUrl () {
      return `${this.config.siteUrl}/images/bleda-card.png`
    }
  },
}
</script>

<page-query>
query Author ($path: String!, $page: Int) {
  author (path: $path) {
    id
    title
    path
    belongsTo (page: $page, perPage: 6) @paginate {
      totalCount
      pageInfo {
        totalPages
        currentPage
      }
      edges {
        node {
          ...on Post {
            id
            title
            datetime: date (format: "YYYY-MM-DD HH:mm:ss")
            path
            content
            excerpt
            description
            tags {
              id
              title
              path
            }
          }
        }
      }
    }
  }
}
</page-query>
