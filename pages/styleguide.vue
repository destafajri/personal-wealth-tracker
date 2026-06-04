<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Clock, CloudOff, FileText, Lock, Play, Shield, Wallet } from 'lucide-vue-next'

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
    <p class="mt-1 text-xs text-[var(--color-text-muted)]">
      Day 2: shadow-sm default + shadow-md hover (premium elevation) on Primary / Secondary.
      Ghost stays flat. Deferred (Day 3+): explicit active, focus-visible ring, loading state.
    </p>
    <div class="mt-3 flex flex-wrap gap-3">
      <ButtonPrimary>Primary</ButtonPrimary>
      <ButtonPrimary disabled disabled-reason="Tambahkan minimal 1 aset">Disabled</ButtonPrimary>
      <ButtonSecondary>Secondary</ButtonSecondary>
      <ButtonGhost>Ghost</ButtonGhost>
      <ButtonGhost danger>Reset Data</ButtonGhost>
    </div>

    <h2 class="mt-10 text-lg font-semibold">Button CTA (Day 2 — landing hero)</h2>
    <p class="mt-1 text-xs text-[var(--color-text-muted)]">
      Hero-grade CTA: solid (emerald-600 → emerald-700 on hover) vs outline
      (emerald-50 fill, emerald-200 border). Used in landing card actions and
      future Plan/Decide CTAs.
    </p>
    <div class="mt-3 flex flex-wrap gap-3">
      <ButtonCTA>
        Mulai
        <ArrowRight class="h-4 w-4" />
      </ButtonCTA>
      <ButtonCTA variant="outline">
        Coba
        <ArrowRight class="h-4 w-4" />
      </ButtonCTA>
      <ButtonCTA size="md">Compact</ButtonCTA>
      <ButtonCTA disabled>Disabled</ButtonCTA>
    </div>
    <div class="mt-3 grid max-w-md gap-3">
      <ButtonCTA block>
        Mulai
        <ArrowRight class="h-4 w-4" />
      </ButtonCTA>
      <ButtonCTA block variant="outline">
        Coba
        <ArrowRight class="h-4 w-4" />
      </ButtonCTA>
    </div>

    <h2 class="mt-10 text-lg font-semibold">Badges (Day 2 — hero pills)</h2>
    <p class="mt-1 text-xs text-[var(--color-text-muted)]">
      Icon + text pill for hero trust chips ("Tanpa daftar", "Tanpa cloud") and
      section labels ("Kalkulator Keuangan Pribadi"). Variants: emerald / neutral
      / amber.
    </p>
    <div class="mt-3 flex flex-wrap items-center gap-3">
      <Badge>
        <template #icon><Shield class="h-3.5 w-3.5" /></template>
        Kalkulator Keuangan Pribadi
      </Badge>
      <Badge>
        <template #icon><Lock class="h-3.5 w-3.5" /></template>
        Tanpa daftar
      </Badge>
      <Badge>
        <template #icon><CloudOff class="h-3.5 w-3.5" /></template>
        Tanpa cloud
      </Badge>
      <Badge variant="neutral">
        <template #icon><Clock class="h-3.5 w-3.5" /></template>
        Cek Keuangan dalam 10 Menit
      </Badge>
      <Badge variant="amber" size="md">Beta</Badge>
    </div>

    <h2 class="mt-10 text-lg font-semibold">Icon Chips (Day 2 — card icons)</h2>
    <p class="mt-1 text-xs text-[var(--color-text-muted)]">
      Soft-bg square holder for the icon at top of landing CTA cards and section
      headers. Variants: emerald (primary card) / neutral (secondary) / amber / rose.
    </p>
    <div class="mt-3 flex flex-wrap items-center gap-3">
      <IconChip><FileText class="h-5 w-5" /></IconChip>
      <IconChip variant="neutral"><Play class="h-5 w-5" /></IconChip>
      <IconChip variant="amber"><Wallet class="h-5 w-5" /></IconChip>
      <IconChip variant="rose"><Shield class="h-5 w-5" /></IconChip>
      <IconChip size="lg"><Wallet class="h-6 w-6" /></IconChip>
    </div>

    <h2 class="mt-10 text-lg font-semibold">Inputs</h2>
    <p class="mt-1 text-xs text-[var(--color-text-muted)]">
      Implemented: focus-within border, lenient currency parsing, hydration-safe id.
      Deferred (Day 3+): error state, helper text slot, blur-validation feedback.
    </p>
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
