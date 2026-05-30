<script setup lang="ts">
// Bare /app routes redirect to the snapshot tab (Track is the default landing).
definePageMeta({
  middleware: () => navigateTo('/app/snapshot', { replace: true }),
})
</script>

<template>
  <div />
</template>
