<script setup lang="ts">
import { ArrowRight, ChevronRight, CloudOff, FileText, Lock, Play } from 'lucide-vue-next'
// Explicit imports: Nuxt 3 auto-import prefixes components in subdirs
// (components/common/X.vue -> <CommonX/>). Bare-name usage silently fails at
// SSR (renders as anonymous, no build error). See memory note
// `feedback-nuxt-component-subdir-prefix`.
import Badge from '~/components/common/Badge.vue'
import ButtonCTA from '~/components/common/ButtonCTA.vue'
import CtaMamikos from '~/components/common/CtaMamikos.vue'
import IconChip from '~/components/common/IconChip.vue'
import { t } from '~/lib/copy/strings'
import { useSnapshotStore } from '~/stores/snapshot'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: `${t('brand.name')} — ${t('brand.tagline')}`,
  description: `${t('landing.hero.subtitle')} ${t('landing.hero.trust')}`,
})

const snap = useSnapshotStore()

// "Mulai dari Snapshot" semantically means "start fresh". If a prior demo (or any
// stale data) is still in the Pinia store, wipe it before navigating so the form
// renders empty. The demo card does its own seeding on the destination side.
function startFresh() {
  snap.reset()
}
</script>

<template>
  <section class="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
    <div class="mb-10 flex flex-wrap items-center justify-center gap-3">
      <Badge size="md">
        <template #icon><Lock class="h-3.5 w-3.5" /></template>
        {{ t('landing.trust.pill.noRegister') }}
      </Badge>
      <Badge size="md">
        <template #icon><CloudOff class="h-3.5 w-3.5" /></template>
        {{ t('landing.trust.pill.noCloud') }}
      </Badge>
    </div>

    <h1
      class="text-balance text-4xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl"
    >
      {{ t('landing.hero.titlePrefix') }}
      <span class="text-[var(--color-primary)]">{{ t('landing.hero.titleWord1') }}</span>,
      <span class="text-[var(--color-primary)]">{{ t('landing.hero.titleWord2') }}</span>, atau
      <span class="text-[var(--color-primary)]">{{ t('landing.hero.titleWord3') }}</span>?
    </h1>

    <p class="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-[var(--color-text-secondary)]">
      {{ t('landing.hero.subtitle') }}
    </p>

    <div class="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-2">
      <div
        class="group relative flex flex-col gap-5 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]"
      >
        <div
          class="absolute inset-x-0 top-0 h-1 rounded-t-[var(--radius-card)] bg-[var(--color-primary)]"
        />
        <div class="flex items-start gap-4">
          <IconChip size="lg">
            <FileText class="h-6 w-6" />
          </IconChip>
          <div class="text-left">
            <h2 class="text-xl font-bold text-[var(--color-text-primary)]">
              {{ t('landing.cta.snapshot.label') }}
            </h2>
            <p class="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {{ t('landing.cta.snapshot.body') }}
            </p>
          </div>
        </div>
        <NuxtLink to="/app/snapshot" class="mt-auto block" @click="startFresh">
          <ButtonCTA tag="span" block>
            {{ t('landing.cta.snapshot.action') }}
            <ChevronRight class="h-4 w-4" />
          </ButtonCTA>
        </NuxtLink>
      </div>

      <div
        class="group flex flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]"
      >
        <div class="flex items-start gap-4">
          <IconChip variant="neutral" size="lg">
            <Play class="h-6 w-6" />
          </IconChip>
          <div class="text-left">
            <h2 class="text-xl font-bold text-[var(--color-text-primary)]">
              {{ t('landing.cta.demo.label') }}
            </h2>
            <p class="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {{ t('landing.cta.demo.body') }}
            </p>
          </div>
        </div>
        <NuxtLink to="/app/snapshot?demo=1" class="mt-auto block">
          <ButtonCTA tag="span" variant="outline" block>
            {{ t('landing.cta.demo.action') }}
            <ArrowRight class="h-4 w-4" />
          </ButtonCTA>
        </NuxtLink>
      </div>
    </div>

    <div class="mx-auto mt-8 max-w-3xl">
      <CtaMamikos variant="landing" />
    </div>
  </section>
</template>
