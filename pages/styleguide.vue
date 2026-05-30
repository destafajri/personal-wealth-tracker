<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'default' })

if (!import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

const currencyValue = ref<number | null>(25_000_000)
const goldGram = ref<number | null>(50)

const tokens = [
  { key: '--color-primary', label: 'Primary' },
  { key: '--color-primary-dark', label: 'Primary Dark' },
  { key: '--color-primary-container', label: 'Primary Container' },
  { key: '--color-accent-emerald', label: 'Accent Emerald' },
  { key: '--color-accent-emerald-soft', label: 'Accent Emerald Soft' },
  { key: '--color-warning-amber', label: 'Warning Amber' },
  { key: '--color-danger-rose', label: 'Danger Rose' },
  { key: '--color-gold', label: 'Gold' },
  { key: '--color-gold-muted', label: 'Gold Muted' },
  { key: '--color-capacity-teal', label: 'Capacity Teal' },
  { key: '--color-surface', label: 'Surface' },
  { key: '--color-surface-card', label: 'Surface Card' },
  { key: '--color-border', label: 'Border' },
]
</script>

<template>
  <section class="mx-auto max-w-[1100px] px-6 py-12 sm:px-10">
    <h1 class="text-2xl font-semibold text-[var(--color-primary-dark)]">Styleguide (dev-only)</h1>
    <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
      Primitives + design tokens. 404 di production.
    </p>

    <h2 class="mt-10 text-lg font-semibold">Tokens</h2>
    <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="token in tokens"
        :key="token.key"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-3"
      >
        <div
          class="h-12 w-full rounded-[var(--radius-input)]"
          :style="{ background: `var(${token.key})` }"
        />
        <p class="mt-2 text-xs font-medium">{{ token.label }}</p>
        <p class="text-[10px] text-[var(--color-text-muted)]">{{ token.key }}</p>
      </div>
    </div>

    <h2 class="mt-10 text-lg font-semibold">Buttons</h2>
    <div class="mt-3 flex flex-wrap gap-3">
      <ButtonPrimary>Primary</ButtonPrimary>
      <ButtonPrimary disabled disabled-reason="Tambahkan minimal 1 aset">Disabled</ButtonPrimary>
      <ButtonSecondary>Secondary</ButtonSecondary>
      <ButtonGhost>Ghost</ButtonGhost>
      <ButtonGhost danger>Reset Data</ButtonGhost>
    </div>

    <h2 class="mt-10 text-lg font-semibold">Inputs</h2>
    <div class="mt-3 grid gap-3 sm:max-w-md">
      <InputCurrency v-model="currencyValue" aria-label="Penghasilan" />
      <InputQuantity v-model="goldGram" unit="gram" aria-label="Emas (gram)" />
      <p class="text-xs text-[var(--color-text-muted)]">
        currency: {{ currencyValue }} · gram: {{ goldGram }}
      </p>
    </div>

    <h2 class="mt-10 text-lg font-semibold">Pills</h2>
    <div class="mt-3 flex flex-wrap items-center gap-3">
      <PillLive />
      <PillEstimasi />
      <PillStale />
    </div>

    <h2 class="mt-10 text-lg font-semibold">Status Dots</h2>
    <div class="mt-3 flex flex-wrap items-center gap-4">
      <StatusDot status="sehat" label="Sehat" />
      <StatusDot status="waspada" label="Waspada" />
      <StatusDot status="bahaya" label="Bahaya" />
      <StatusDot status="neutral" label="—" />
    </div>

    <h2 class="mt-10 text-lg font-semibold">Disclaimer Banner</h2>
    <div class="mt-3 max-w-2xl">
      <DisclaimerBanner />
    </div>
  </section>
</template>
