<template>
  <Layout class="bg-teal">
    <main class="flex items-center h-screen">
      <div class="w-full sm:w-3/4 md:w-3/5 lg:w-2/5 max-w-xs mx-auto px-6 md:px-0 relative">
        <span class="absolute -mt-10 text-5xl pin-x text-center pointer-events-none">🧐</span>
        <section class="bg-grey-lightest mx-auto px-8 py-6 rounded shadow-lg relative">
          <h1 class="text-2xl font-sans mb-4">Page Not Found</h1>
          <p class="font-serif mb-4 leading-normal text-grey-darker">Looks like you've followed a broken link or entered a URL that doesn't exist on this site.</p>
          <g-link to="/" class="text-sm text-teal hover:text-teal-darker no-underline font-sans">&larr; Back to our site</g-link>
        </section>
      </div>
    </main>
  </Layout>
</template>

<script>
export default {
  metaInfo () {
    return {
      title: `Page Not Found (404)`,
    }
  },
}
</script>

