<template>
  <footer class="text-gray-700 text-sm leading-normal flex flex-wrap justify-between mx-auto max-w-3xl px-6 sm:px-12">
    <div class="w-full sm:w-1/2 mb-4 sm:mb-0">
      <p><a href="https://github.com/cossssmin/gridsome-starter-bleda" class="border-b border-transparent hover:border-gray-400 transition-border-color">Bleda</a> by <a href="https://twitter.com/cossssmin" class="border-b border-transparent hover:border-gray-400 transition-border-color">@cossssmin</a></p>
      <p>Built with <a href="https://gridsome.org" class="border-b border-transparent hover:border-gray-400 transition-border-color">Gridsome</a> &amp; <a href="https://tailwindcss.com/" class="border-b border-transparent hover:border-gray-400 transition-border-color">Tailwind CSS</a>.</p>
    </div>
    <div class="w-full sm:w-1/2">
      <nav>
        <ul class="flex sm:justify-end -mx-2">
          <li class="px-2">
            <g-link to="/" class="border-b border-transparent hover:border-gray-400 transition-border-color">Home</g-link>
          </li>
          <li class="px-2">
            <g-link to="/about/" class="border-b border-transparent hover:border-gray-400 transition-border-color">About</g-link>
          </li>
          <li class="px-2">
            <a href="/sitemap.xml" class="border-b border-transparent hover:border-gray-400 transition-border-color">Sitemap</a>
          </li>
          <li class="px-2">
            <a href="/feed.xml" class="border-b border-transparent hover:border-gray-400 transition-border-color">RSS Feed</a>
          </li>
        </ul>
      </nav>
    </div>
  </footer>
</template>

<script>

export default {
  name: 'Footer',
}
</script>
