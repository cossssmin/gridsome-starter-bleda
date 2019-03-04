<template>
  <div :class="`bg-${theme}-lightest border-l-4 border-${theme} text-${theme}-darker leading-normal p-4 md:mx-6 mb-12`" role="alert">
    <slot>This is an alert, you should probably pass it some text...</slot>
  </div>
</template>

<script>
export default {
  props: ['color'],
  computed: {
    theme() {
      return this.color || 'blue'
    }
  }
}
</script>
