<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

// Unified "+ Tambah X" CTA across all snapshot sections. Hybrid pattern:
//   - Empty state (hasRows=false): full-width dashed card with stronger affordance
//     and copy "... pertama" to signal first-time add. Helps discovery when the
//     list is empty.
//   - Filled state (hasRows=true): minimal inline text link with Plus icon.
//     Low visual weight so it doesn't compete with existing rows.
//
// Usage:
//   <AddRowCta noun="deposito" :has-rows="rows.length > 0" @add="..." />
// Renders:
//   Empty:   [+ Tambah deposito pertama]   (dashed card, full width)
//   Filled:  + Tambah deposito              (text link, inline)
defineProps<{
  noun: string
  hasRow: boolean
}>()
defineEmits<{ add: [] }>()
</script>

<template>
  <!-- Empty state: dashed card -->
  <button
    v-if="!hasRow"
    type="button"
    class="w-full rounded-[var(--radius-input)] border border-dashed border-[var(--color-border-strong)] py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-low)] hover:text-[var(--color-primary)]"
    @click="$emit('add')"
  >
    <span class="inline-flex items-center gap-1.5">
      <Plus :size="14" :stroke-width="2.5" />
      Tambah {{ noun }} pertama
    </span>
  </button>
  <!-- Filled state: minimal text link -->
  <button
    v-else
    type="button"
    class="inline-flex items-center gap-1 pt-1 text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]"
    @click="$emit('add')"
  >
    <Plus :size="14" :stroke-width="2.5" />
    Tambah {{ noun }}
  </button>
</template>
