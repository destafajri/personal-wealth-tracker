<script setup lang="ts">
useHead({
  script: [
    {
      innerHTML: `(function(){try{var t=localStorage.getItem('cermat-theme');var d=t==='dark'||(t!=='light'&&new Date().getHours()>=18||new Date().getHours()<6);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
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
