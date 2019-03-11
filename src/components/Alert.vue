<template>
  <div class="leading-normal p-4 md:mx-6 mb-12" role="alert">
    <slot>This is an alert, you should probably pass it some text...</slot>
  </div>
</template>

<script>
export default {
  name: 'Alert',
}
</script>
