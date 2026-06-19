<script setup lang="ts">
import { CirclePlus, X } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useUndoDelete } from '~/composables/useUndoDelete'
import { t } from '~/lib/copy/strings'
import { CURRENCIES } from '~/lib/types/snapshot'

defineProps<{ hideHeader?: boolean; showBiayaKos?: boolean }>()

const snap = useSnapshotStore()
const undo = useUndoDelete()

function handleRemoveLain(rowId: string) {
  const idx = snap.pengeluaranLain.findIndex((r) => r.id === rowId)
  if (idx === -1) return
  const row = snap.pengeluaranLain[idx]!
  const { id, ...rowData } = row
  void id
  undo.capture('pengeluaranLain', rowData, idx)
  snap.removePengeluaranLain(rowId)
}
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header v-if="!hideHeader" class="mb-3">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.pengeluaran') }}
      </h3>
    </header>
    <div class="space-y-3">
      <label v-if="showBiayaKos" class="block">
        <span class="text-sm font-medium text-[var(--color-text-primary)]">
          {{ t('snapshot.pengeluaran.biayaKos.label') }}
        </span>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {{ t('snapshot.pengeluaran.biayaKos.help') }}
        </p>
        <div class="mt-2">
          <InputCurrency
            :model-value="!snap.pengeluaran.biayaKos ? null : snap.pengeluaran.biayaKos"
            :currency="snap.pengeluaran.biayaKosCurrency ?? 'IDR'"
            :currencies="CURRENCIES"
            @update:model-value="snap.setPengeluaran({ biayaKos: $event ?? 0 })"
            @update:currency="snap.setPengeluaran({ biayaKosCurrency: $event })"
          />
        </div>
      </label>
      <label class="block">
        <span class="text-sm font-medium text-[var(--color-text-primary)]">
          {{ t('snapshot.pengeluaran.pokok.label') }}
        </span>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {{ t('snapshot.pengeluaran.pokok.help') }}
        </p>
        <div class="mt-2">
          <InputCurrency
            :model-value="snap.pengeluaran.pokok === 0 ? null : snap.pengeluaran.pokok"
            :currency="snap.pengeluaran.pokokCurrency"
            :currencies="CURRENCIES"
            @update:model-value="snap.setPengeluaran({ pokok: $event ?? 0 })"
            @update:currency="snap.setPengeluaran({ pokokCurrency: $event })"
          />
        </div>
      </label>
      <label class="block">
        <span class="text-sm font-medium text-[var(--color-text-primary)]">
          {{ t('snapshot.pengeluaran.lifestyle.label') }}
        </span>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {{ t('snapshot.pengeluaran.lifestyle.help') }}
        </p>
        <div class="mt-2">
          <InputCurrency
            :model-value="
              snap.pengeluaran.lifestyle === 0 ? null : snap.pengeluaran.lifestyle
            "
            :currency="snap.pengeluaran.lifestyleCurrency"
            :currencies="CURRENCIES"
            @update:model-value="snap.setPengeluaran({ lifestyle: $event ?? 0 })"
            @update:currency="snap.setPengeluaran({ lifestyleCurrency: $event })"
          />
        </div>
      </label>

      <!-- Pengeluaran Lain — parallel pattern dengan Penghasilan Lain -->
      <div class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3">
        <div class="flex items-start gap-3">
          <CirclePlus
            :size="20"
            class="mt-1 shrink-0 text-[var(--color-text-secondary)]"
          />
          <div class="flex-1">
            <label
              class="block text-xs font-medium text-[var(--color-text-secondary)]"
            >
              Pengeluaran Lain
            </label>
            <p
              v-if="snap.pengeluaranLain.length === 0"
              class="mt-2 text-[11px] text-[var(--color-text-muted)]"
            >
              Belum ada pengeluaran lain. Sewa, asuransi, biaya anak, langganan — yang ga masuk pokok/lifestyle.
            </p>
            <TransitionGroup
              v-else
              name="row-slide"
              tag="ul"
              class="mt-2 divide-y divide-[var(--color-border)]"
            >
              <li
                v-for="row in snap.pengeluaranLain"
                :key="row.id"
                class="space-y-1 py-2 first:pt-0 last:pb-0"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    :value="row.label"
                    placeholder="Contoh: Asuransi BPJS"
                    class="h-12 min-w-0 flex-1 basis-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)] sm:basis-auto"
                    @input="
                      snap.updatePengeluaranLain(row.id, {
                        label: ($event.target as HTMLInputElement).value,
                      })
                    "
                  >
                  <div class="min-w-0 flex-1 sm:w-52 sm:flex-initial">
                    <InputCurrency
                      :model-value="row.amount === 0 ? null : row.amount"
                      :currency="row.currency ?? 'IDR'"
                      :currencies="CURRENCIES"
                      :placeholder="t('snapshot.row.idrPlaceholder')"
                      @update:model-value="
                        snap.updatePengeluaranLain(row.id, { amount: $event ?? 0 })
                      "
                      @update:currency="
                        snap.updatePengeluaranLain(row.id, { currency: $event })
                      "
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Hapus baris"
                    class="shrink-0 rounded p-2 text-[var(--color-text-muted)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)] active:scale-95"
                    @click="handleRemoveLain(row.id)"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </li>
            </TransitionGroup>
            <ButtonGhost
              class="mt-2 w-full"
              @click="snap.addPengeluaranLain()"
            >
              + Tambah
            </ButtonGhost>
          </div>
        </div>
      </div>
    </div>
    <p class="mt-3 text-xs italic text-[var(--color-text-muted)]">
      {{ t('snapshot.pengeluaran.note') }}
    </p>
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
