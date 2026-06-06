<script setup lang="ts">
useHead({
  script: [
    {
      innerHTML: `(function(){try{if(localStorage.getItem('cermat-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
      type: 'text/javascript',
      tagPriority: 'critical',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
