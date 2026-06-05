<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'

const props = defineProps<{
  variant: 'afterPersona' | 'dashboardBottom' | 'landing'
}>()

const label = t(`cta.mamikos.${props.variant}.label` as import('~/lib/copy/strings').CopyKey)
const body = t(`cta.mamikos.${props.variant}.body` as import('~/lib/copy/strings').CopyKey)
</script>

<template>
  <a
    href="https://mamikos.com"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex items-start gap-3 rounded-[var(--radius-card)] border border-l-4 border-[var(--color-border)] border-l-emerald-500 bg-[var(--color-surface-card)] p-4 transition-shadow hover:shadow-md"
  >
    <div class="min-w-0 flex-1">
      <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ label }}
      </h4>
      <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {{ body }}
      </p>
      <span class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:underline">
        {{ t('cta.mamikos.action') }}
        <ExternalLink :size="12" />
      </span>
    </div>
  </a>
</template>
