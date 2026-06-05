<script setup lang="ts">
import { CirclePlus, X } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { t } from '~/lib/copy/strings'
import { CURRENCIES } from '~/lib/types/snapshot'

defineProps<{ hideHeader?: boolean; showBiayaKos?: boolean }>()

const snap = useSnapshotStore()
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
            <div class="flex items-center justify-between gap-2">
              <label
                class="min-w-0 flex-1 truncate text-xs font-medium text-[var(--color-text-secondary)]"
              >
                Pengeluaran Lain
              </label>
              <ButtonGhost
                class="shrink-0 whitespace-nowrap"
                @click="snap.addPengeluaranLain()"
              >
                + Tambah
              </ButtonGhost>
            </div>
            <p
              v-if="snap.pengeluaranLain.length === 0"
              class="mt-2 text-[11px] text-[var(--color-text-muted)]"
            >
              Sewa, asuransi, biaya anak, dan lain-lain yang ga masuk pokok/lifestyle.
            </p>
            <ul v-else class="mt-2 space-y-2">
              <li
                v-for="row in snap.pengeluaranLain"
                :key="row.id"
                class="space-y-1"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    :value="row.label"
                    placeholder="Contoh: Asuransi BPJS"
                    class="h-12 min-w-0 flex-1 basis-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] sm:basis-auto"
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
                    class="shrink-0 rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)]"
                    @click="snap.removePengeluaranLain(row.id)"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <p class="mt-3 text-xs italic text-[var(--color-text-muted)]">
      {{ t('snapshot.pengeluaran.note') }}
    </p>
  </section>
</template>
