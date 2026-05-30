<script setup lang="ts">
import { t } from '~/lib/copy/strings'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: `${t('snapshot.placeholder.title')} — ${t('brand.name')}` })
</script>

<template>
  <section class="mx-auto max-w-[800px] px-6 py-16 sm:px-10 sm:py-24">
    <h1 class="text-3xl font-bold tracking-tight text-[var(--color-primary-dark)] sm:text-4xl">
      {{ t('snapshot.placeholder.title') }}
    </h1>
    <p class="mt-4 text-base text-[var(--color-text-secondary)]">
      {{ t('snapshot.placeholder.body') }}
    </p>
    <NuxtLink to="/" class="mt-8 inline-flex text-sm font-medium text-[var(--color-primary)]">
      {{ t('snapshot.placeholder.back') }}
    </NuxtLink>
  </section>
</template>
