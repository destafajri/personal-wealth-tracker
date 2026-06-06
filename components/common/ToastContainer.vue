<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const { toasts, dismissToast } = useToast()
</script>

<template>
  <div
    v-if="toasts.length"
    class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-96"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3 shadow-lg"
        :class="{
          'border-l-4 border-l-emerald-500': toast.type === 'success',
          'border-l-4 border-l-red-500': toast.type === 'error',
          'border-l-4 border-l-amber-500': toast.type === 'warning',
          'border-l-4 border-l-blue-500': toast.type === 'info',
        }"
      >
        <p class="flex-1 text-sm text-[var(--color-text-primary)]">
          {{ toast.message }}
        </p>
        <div class="flex shrink-0 items-center gap-2">
          <button
            v-for="(action, i) in toast.actions"
            :key="i"
            type="button"
            class="whitespace-nowrap text-xs font-medium text-[var(--color-primary)] hover:underline"
            @click="action.handler()"
          >
            {{ action.label }}
          </button>
          <button
            type="button"
            class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            aria-label="Tutup"
            @click="dismissToast(toast.id)"
          >
            <X :size="14" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.2s ease-out;
}
.toast-leave-active {
  transition: all 0.15s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
