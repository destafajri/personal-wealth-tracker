<script setup lang="ts">
import { t } from '~/lib/copy/strings'

const props = defineProps<{ error: { statusCode: number; message?: string } }>()
const handleHome = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-[var(--color-surface)] grid place-items-center px-6">
    <div class="max-w-md text-center">
      <p class="text-sm font-medium text-[var(--color-text-secondary)]">
        {{ props.error.statusCode }}
      </p>
      <h1 class="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
        {{ t('error.generic.title') }}
      </h1>
      <p class="mt-2 text-[var(--color-text-secondary)]">
        {{ t('error.generic.body') }}
      </p>
      <button
        class="mt-6 inline-flex items-center rounded-[var(--radius-input)] bg-[var(--color-primary)] px-5 py-3 text-white hover:bg-[var(--color-primary-container)]"
        @click="handleHome"
      >
        {{ t('error.generic.cta') }}
      </button>
    </div>
  </div>
</template>
