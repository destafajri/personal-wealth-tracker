<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
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
  <section class="mx-auto max-w-[1100px] px-6 py-16 sm:px-10 sm:py-24">
    <div class="mx-auto max-w-3xl text-center">
      <h1
        class="text-3xl font-bold leading-tight tracking-tight text-balance text-[var(--color-primary-dark)] sm:text-5xl"
      >
        {{ t('landing.hero.title') }}
      </h1>
      <p class="mt-4 text-lg text-[var(--color-text-secondary)] text-balance sm:text-xl">
        {{ t('landing.hero.subtitle') }}
      </p>
      <p class="mt-2 text-sm text-[var(--color-text-muted)]">
        {{ t('landing.hero.trust') }}
      </p>
    </div>

    <div class="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6">
      <NuxtLink
        to="/app/snapshot"
        class="group flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-hero)] transition-colors hover:border-[var(--color-primary)] sm:p-8"
        @click="startFresh"
      >
        <span class="text-base font-semibold text-[var(--color-text-primary)] sm:text-lg">
          {{ t('landing.cta.snapshot.label') }}
        </span>
        <span class="mt-2 text-sm text-[var(--color-text-secondary)]">
          {{ t('landing.cta.snapshot.body') }}
        </span>
        <span
          class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
        >
          {{ t('landing.cta.snapshot.action') }}
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </NuxtLink>

      <NuxtLink
        to="/app/snapshot?demo=1"
        class="group flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-hero)] transition-colors hover:border-[var(--color-primary)] sm:p-8"
      >
        <span class="text-base font-semibold text-[var(--color-text-primary)] sm:text-lg">
          {{ t('landing.cta.demo.label') }}
        </span>
        <span class="mt-2 text-sm text-[var(--color-text-secondary)]">
          {{ t('landing.cta.demo.body') }}
        </span>
        <span
          class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
        >
          {{ t('landing.cta.demo.action') }}
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </NuxtLink>
    </div>
  </section>
</template>
