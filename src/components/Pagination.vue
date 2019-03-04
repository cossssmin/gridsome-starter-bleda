<template>
  <section class="border-b border-grey-lighter container mx-auto max-w-lg px-6 md:px-8 py-16">
    <nav role="navigation" aria-label="pagination">
      <ul class="list-reset flex items-center justify-between sm:text-lg lg:text-xl">
        <li class="lg:w-1/5">
          <g-link :to="previousPage(info.currentPage)" :class="{'pointer-events-none opacity-0': info.currentPage == 1}" class="text-grey-dark hover:text-grey-darkest px-4 py-2 no-underline transition-color" :rel="info.currentPage == 1 ? 'nofollow' : 'prev'">
            &larr; Previous
          </g-link>
        </li>
        <li class="hidden md:flex w-auto text-center text-grey text-base">Page {{ info.currentPage }} of {{ info.totalPages }}</li>
        <li class="lg:w-1/5 text-right">
          <g-link :to="nextPage(info.currentPage,info.totalPages)" :class="{'pointer-events-none opacity-0': info.currentPage == info.totalPages}" class="text-grey-dark hover:text-grey-darkest px-4 py-2 no-underline transition-color" :rel="info.currentPage == info.totalPages ? 'nofollow' : 'next'">
            Next &rarr;
          </g-link>
        </li>
      </ul>
    </nav>
  </section>
</template>

<script>
export default {
  props: ['base','info'],
  methods: {
    previousPage(currentPage) {
      return [0, 1].includes(currentPage - 1) ? `${this.basePath}/` : `${this.basePath}/${currentPage - 1}/`;
    },
    nextPage(currentPage, totalPages) {
      return totalPages > currentPage ? `${this.basePath}/${currentPage + 1}/` : `${this.basePath}/${currentPage}/`;
    }
  },
  computed: {
    basePath() {
      return this.base || ''
    }
  }
}
</script>
