<script setup lang="ts">
// Wizard launcher grid — 4 decision + 3 capacity cards. Only KPR is wired for Day 6;
// the rest stay rendered with "Soon" badges (Disabled + Soon, locked decision) so the
// user sees the full product surface without dead-end clicks.
import {
  CarFront,
  Coins,
  Compass,
  Gem,
  Home,
  PiggyBank,
  Settings2,
} from 'lucide-vue-next'
import { t, type CopyKey } from '~/lib/copy/strings'
import { useSimulator } from '~/composables/useSimulator'
import type { WizardKey } from '~/lib/types/wizard'

const { open } = useSimulator()

interface LauncherCard {
  key: WizardKey
  labelKey: CopyKey
  bodyKey: CopyKey
  icon: typeof Home
  enabled: boolean
}

// Decision wizards ("Mau gw X?") — Day 6+7: all 4 live. Capacity Day 8.
const decisions: LauncherCard[] = [
  { key: 'kpr', labelKey: 'simulator.card.kpr.label', bodyKey: 'simulator.card.kpr.body', icon: Home, enabled: true },
  { key: 'gadai', labelKey: 'simulator.card.gadai.label', bodyKey: 'simulator.card.gadai.body', icon: Gem, enabled: true },
  { key: 'cicil', labelKey: 'simulator.card.cicil.label', bodyKey: 'simulator.card.cicil.body', icon: CarFront, enabled: true },
  { key: 'custom', labelKey: 'simulator.card.custom.label', bodyKey: 'simulator.card.custom.body', icon: Settings2, enabled: true },
]

// Capacity wizards ("Bisa gw apa?") — Day 8: Max Utang + Lunasi. Modal Options Day 9.
const capacity: LauncherCard[] = [
  { key: 'max-utang', labelKey: 'simulator.card.maxUtang.label', bodyKey: 'simulator.card.maxUtang.body', icon: Coins, enabled: true },
  { key: 'lunasi', labelKey: 'simulator.card.lunasi.label', bodyKey: 'simulator.card.lunasi.body', icon: PiggyBank, enabled: true },
  { key: 'modal-options', labelKey: 'simulator.card.modalOptions.label', bodyKey: 'simulator.card.modalOptions.body', icon: Compass, enabled: true },
]
</script>

<template>
  <div class="space-y-8">
    <section>
      <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {{ t('simulator.launcher.decisions') }}
      </h3>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <component
          :is="card.enabled ? 'button' : 'div'"
          v-for="card in decisions"
          :key="card.key"
          :type="card.enabled ? 'button' : undefined"
          :disabled="card.enabled ? undefined : true"
          class="group flex flex-col items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 text-left transition"
          :class="
            card.enabled
              ? 'hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-low)]'
              : 'cursor-not-allowed opacity-60'
          "
          @click="card.enabled && open(card.key)"
        >
          <div class="flex w-full items-center justify-between">
            <component :is="card.icon" :size="20" class="text-[var(--color-primary)]" />
            <span
              v-if="!card.enabled"
              class="rounded-[var(--radius-pill)] bg-[var(--color-surface-low)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]"
            >
              {{ t('simulator.card.soon') }}
            </span>
          </div>
          <div class="font-medium text-[var(--color-text-primary)]">{{ t(card.labelKey) }}</div>
          <div class="text-xs text-[var(--color-text-secondary)]">{{ t(card.bodyKey) }}</div>
        </component>
      </div>
    </section>

    <section>
      <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {{ t('simulator.launcher.capacity') }}
      </h3>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <!--
          Codex round-14: capacity section was hardcoded as non-interactive div w/ cursor-
          not-allowed (carry-over from Day-6 when all capacity wizards were Soon). Mirror
          the decisions section's `<component :is>` dispatch so card.enabled actually wires
          the click + button affordance. Soon badge stays only for !enabled cards.
        -->
        <component
          :is="card.enabled ? 'button' : 'div'"
          v-for="card in capacity"
          :key="card.key"
          :type="card.enabled ? 'button' : undefined"
          :disabled="card.enabled ? undefined : true"
          class="group flex flex-col items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 text-left transition"
          :class="
            card.enabled
              ? 'hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-low)]'
              : 'cursor-not-allowed opacity-60'
          "
          @click="card.enabled && open(card.key)"
        >
          <div class="flex w-full items-center justify-between">
            <component :is="card.icon" :size="20" class="text-[var(--color-primary)]" />
            <span
              v-if="!card.enabled"
              class="rounded-[var(--radius-pill)] bg-[var(--color-surface-low)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]"
            >
              {{ t('simulator.card.soon') }}
            </span>
          </div>
          <div class="font-medium text-[var(--color-text-primary)]">{{ t(card.labelKey) }}</div>
          <div class="text-xs text-[var(--color-text-secondary)]">{{ t(card.bodyKey) }}</div>
        </component>
      </div>
    </section>
  </div>
</template>
