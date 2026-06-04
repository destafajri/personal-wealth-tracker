<script setup lang="ts">
import {
  ArrowRight,
  ChevronRight,
  CloudOff,
  FileText,
  Lock,
  Play,
  ShieldCheck,
} from 'lucide-vue-next'
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
  <section class="mx-auto max-w-5xl px-6 py-16 sm:py-24">
    <div class="mx-auto max-w-3xl text-center">
      <Badge>
        <template #icon><ShieldCheck class="h-3.5 w-3.5" /></template>
        {{ t('landing.eyebrow.label') }}
      </Badge>

      <h1
        class="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl"
      >
        {{ t('landing.hero.titlePrefix') }}
        <span class="text-[var(--color-primary)]">{{ t('landing.hero.titleWord1') }}</span>,
        <span class="text-[var(--color-primary)]">{{ t('landing.hero.titleWord2') }}</span>, atau
        <span class="text-[var(--color-primary)]">{{ t('landing.hero.titleWord3') }}</span>?
      </h1>

      <p class="mt-6 text-pretty text-lg text-[var(--color-text-secondary)]">
        {{ t('landing.hero.subtitle') }}
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Badge size="md">
          <template #icon><Lock class="h-3.5 w-3.5" /></template>
          {{ t('landing.trust.pill.noRegister') }}
        </Badge>
        <Badge size="md">
          <template #icon><CloudOff class="h-3.5 w-3.5" /></template>
          {{ t('landing.trust.pill.noCloud') }}
        </Badge>
      </div>
    </div>

    <div class="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-2">
      <div
        class="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]"
      >
        <div
          class="h-1 bg-gradient-to-r from-[var(--color-emerald-500)] to-[var(--color-emerald-600)]"
        />
        <div class="flex flex-1 flex-col p-6 sm:p-8">
          <IconChip>
            <FileText class="h-5 w-5" />
          </IconChip>
          <h3 class="mt-5 text-xl font-bold text-[var(--color-text-primary)]">
            {{ t('landing.cta.snapshot.label') }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {{ t('landing.cta.snapshot.body') }}
          </p>
          <NuxtLink to="/app/snapshot" class="mt-auto block pt-6" @click="startFresh">
            <ButtonCTA tag="span" block>
              {{ t('landing.cta.snapshot.action') }}
              <ChevronRight class="h-4 w-4" />
            </ButtonCTA>
          </NuxtLink>
        </div>
      </div>

      <div
        class="group flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] sm:p-8"
      >
        <IconChip variant="neutral">
          <Play class="h-5 w-5" />
        </IconChip>
        <h3 class="mt-5 text-xl font-bold text-[var(--color-text-primary)]">
          {{ t('landing.cta.demo.label') }}
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {{ t('landing.cta.demo.body') }}
        </p>
        <NuxtLink to="/app/snapshot?demo=1" class="mt-auto block pt-6">
          <ButtonCTA tag="span" variant="outline" block>
            {{ t('landing.cta.demo.action') }}
            <ArrowRight class="h-4 w-4" />
          </ButtonCTA>
        </NuxtLink>
      </div>
    </div>

    <div class="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 sm:mt-16">
      <div class="text-center">
        <p class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('landing.feature.free.label') }}
        </p>
        <p class="mt-0.5 text-xs text-[var(--color-text-muted)]">
          {{ t('landing.feature.free.sub') }}
        </p>
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('landing.feature.realtime.label') }}
        </p>
        <p class="mt-0.5 text-xs text-[var(--color-text-muted)]">
          {{ t('landing.feature.realtime.sub') }}
        </p>
      </div>
      <div class="text-center">
        <p class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('landing.feature.private.label') }}
        </p>
        <p class="mt-0.5 text-xs text-[var(--color-text-muted)]">
          {{ t('landing.feature.private.sub') }}
        </p>
      </div>
    </div>
  </section>
</template>
