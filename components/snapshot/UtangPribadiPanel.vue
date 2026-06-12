<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed } from 'vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import InputQuantity from '~/components/common/InputQuantity.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'

defineProps<{ hideHeader?: boolean }>()

const snap = useSnapshotStore()

const rows = computed(() => snap.utangPribadi)
const totalPokok = computed(() => rows.value.reduce((s, r) => s + (r.sisaPokok || 0), 0))
const totalCicilan = computed(() =>
  rows.value.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0),
)
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header v-if="!hideHeader" class="mb-3">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.utangPribadi') }}
      </h3>
      <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {{ t('utangPribadi.help') }}
      </p>
    </header>
    <div class="mb-3 flex justify-end">
      <ButtonGhost @click="snap.addUtangPribadi()">
        {{ t('utangPribadi.add') }}
      </ButtonGhost>
    </div>

    <p
      v-if="rows.length === 0"
      class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      {{ t('utangPribadi.empty') }}
    </p>

    <TransitionGroup v-else name="row-slide" tag="div" class="space-y-3">
      <article
        v-for="row in rows"
        :key="row.id"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4"
      >
        <header class="mb-3 flex items-start justify-between gap-2">
          <input
            type="text"
            :value="row.label"
            :placeholder="t('utangPribadi.field.label')"
            class="h-10 flex-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)]"
            @input="
              snap.updateUtangPribadi(row.id, {
                label: ($event.target as HTMLInputElement).value,
              })
            "
          >
          <button
            type="button"
            :aria-label="t('utangPribadi.row.remove')"
            class="rounded p-2 text-[var(--color-text-muted)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)] active:scale-95"
            @click="snap.removeUtangPribadi(row.id)"
          >
            <X :size="16" />
          </button>
        </header>

        <div class="space-y-3">
          <label class="block text-xs">
            <span class="font-medium text-[var(--color-text-secondary)]">
              {{ t('utangPribadi.field.sisaPokok') }}
            </span>
            <div class="mt-1">
              <InputCurrency
                :model-value="row.sisaPokok || null"
                @update:model-value="
                  snap.updateUtangPribadi(row.id, { sisaPokok: $event ?? 0 })
                "
              />
            </div>
          </label>
          <label class="block text-xs">
            <span class="font-medium text-[var(--color-text-secondary)]">
              {{ t('utangPribadi.field.cicilan') }}
            </span>
            <div class="mt-1">
              <InputCurrency
                :model-value="row.cicilanPerBulan ?? null"
                @update:model-value="
                  snap.updateUtangPribadi(row.id, {
                    cicilanPerBulan: $event ?? undefined,
                  })
                "
              />
            </div>
          </label>
          <label class="block text-xs">
            <span class="font-medium text-[var(--color-text-secondary)]">
              {{ t('utangPribadi.field.tempo') }}
            </span>
            <div class="mt-1">
              <InputQuantity
                unit="bln"
                :step="1"
                :model-value="row.tempoBulan ?? null"
                @update:model-value="
                  snap.updateUtangPribadi(row.id, { tempoBulan: $event ?? undefined })
                "
              />
            </div>
          </label>
          <label class="block text-xs">
            <span class="font-medium text-[var(--color-text-secondary)]">
              {{ t('utangPribadi.field.tanggal') }}
            </span>
            <input
              type="date"
              :value="row.tanggalJatuhTempo ?? ''"
              class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)]"
              @input="
                snap.updateUtangPribadi(row.id, {
                  tanggalJatuhTempo:
                    ($event.target as HTMLInputElement).value || undefined,
                })
              "
            >
          </label>
        </div>
      </article>
    </TransitionGroup>

    <ButtonGhost
      v-if="rows.length > 0"
      class="mt-3 w-full"
      @click="snap.addUtangPribadi()"
    >
      {{ t('utangPribadi.add') }}
    </ButtonGhost>

    <div
      v-if="rows.length > 0"
      class="mt-4 grid gap-2 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3 text-xs sm:grid-cols-2"
    >
      <div>
        <div class="text-[var(--color-text-secondary)]">
          {{ t('utangPribadi.aggregate.total') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ idr(totalPokok) }}
        </div>
      </div>
      <div>
        <div class="text-[var(--color-text-secondary)]">
          {{ t('utangPribadi.aggregate.cicilan') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ idr(totalCicilan) }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.row-slide-enter-active {
  transition: all 0.3s ease-out;
}
.row-slide-leave-active {
  transition: all 0.2s ease-in;
}
.row-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.row-slide-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
.row-slide-move {
  transition: transform 0.25s ease;
}
</style>
