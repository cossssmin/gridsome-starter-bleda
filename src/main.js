import VueDisqus from 'vue-disqus'
import DefaultLayout from '~/layouts/Default.vue'

export default function (Vue, { head }) {
  Vue.use(VueDisqus)
  Vue.component('Layout', DefaultLayout)

  head.htmlAttrs = { lang: 'ko', class: 'h-full' }
  head.bodyAttrs = { class: 'antialiased font-sans' }

  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Fira+Sans:400,700%7CCardo'
  })
  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Nanum+Gothic:400,700,800&display=swap&subset=korean'
  })
  head.link.push({
    rel: 'stylesheet',
    href: 'https://github.githubassets.com/assets/gist-embed-d89dc96f3ab6372bb73ee45cafdd0711.css'
  })
}
