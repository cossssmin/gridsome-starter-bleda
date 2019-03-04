<template>
  <Layout>
    <main>
      <header>
        <div class="container flex flex-col-reverse xl:max-w-xl mx-auto text-center px-6 pt-24 pb-10 md:py-32 border-b border-grey-lighter">
          <p class="text-grey-dark leading-normal">{{ $page.tag.belongsTo.totalCount }} posts in total</p>
          <h1 class="sm:text-4xl md:text-5xl font-sans font-bold mb-2 capitalize">{{ titleCase($page.tag.title) }}</h1>
          <svg class="w-6 fill-current text-grey mx-auto mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" role="img" aria-labelledby="tagIcon"><title id="tagIcon">Posts tagged</title><path d="M0 10V2l2-2h8l10 10-10 10L0 10zm4.5-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
        </div>
        <nav class="absolute pin-t pin-l z-20 mt-6 ml-6">
          <g-link to="/" class="text-sm border text-grey-darkest border-grey-dark opacity-75 hover:opacity-100 rounded-full no-underline px-4 py-2 transition-opacity">&larr; Home</g-link>
        </nav>
      </header>
      <section>
        <post-item v-for="edge in $page.tag.belongsTo.edges" :key="edge.node.id" :post="edge.node" />
      </section>
      <pagination :base="`${$page.tag.path}`" :info="$page.tag.belongsTo.pageInfo" v-if="$page.tag.belongsTo.pageInfo.totalPages > 1" />
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
      title: `Posts tagged "${this.titleCase(this.$page.tag.title)}"`,
      meta: [
        {
          key: 'description',
          name: 'description',
          content: `Browse posts tagged "${this.titleCase(this.$page.tag.title)}"`
        },

        { property: "og:type", content: 'website' },
        { property: "og:title", content: `Posts tagged "${this.titleCase(this.$page.tag.title)}"` },
        { property: "og:description", content: `Browse posts tagged "${this.titleCase(this.$page.tag.title)}"` },
        { property: "og:url", content: `${this.config.siteUrl}/${this.$page.tag.path}/` },
        { property: "og:image", content: this.ogImageUrl },

        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `Posts tagged "${this.titleCase(this.$page.tag.title)}"` },
        { name: "twitter:description", content: `Browse posts tagged "${this.titleCase(this.$page.tag.title)}"` },
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
query Tag ($path: String!, $page: Int) {
  tag (path: $path) {
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
            author {
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
