<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed } from 'vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import InputQuantity from '~/components/common/InputQuantity.vue'
import { t } from '~/lib/copy/strings'
import {
  emasCategoryOfJaminan,
  pawnedGramOf,
  totalGramOf,
} from '~/lib/finance/emas'
import { useSnapshotStore } from '~/stores/snapshot'
import type { GadaiJaminanKind, GadaiRow } from '~/lib/types/snapshot'

const props = defineProps<{ row: GadaiRow }>()
const emit = defineEmits<{
  update: [patch: Partial<Omit<GadaiRow, 'id'>>]
  remove: []
}>()

const snap = useSnapshotStore()

const jaminanOptions: { value: GadaiJaminanKind; labelKey: Parameters<typeof t>[0] }[] = [
  { value: 'emas:digital', labelKey: 'gadai.jaminan.emas.digital' },
  { value: 'emas:fisikAntam', labelKey: 'gadai.jaminan.emas.fisikAntam' },
  { value: 'emas:perhiasan18K', labelKey: 'gadai.jaminan.emas.perhiasan18K' },
  { value: 'emas:perhiasan14K', labelKey: 'gadai.jaminan.emas.perhiasan14K' },
  { value: 'emas:perhiasan10K', labelKey: 'gadai.jaminan.emas.perhiasan10K' },
  { value: 'properti', labelKey: 'gadai.jaminan.properti' },
  { value: 'kendaraan', labelKey: 'gadai.jaminan.kendaraan' },
]

const isEmas = computed(() => props.row.jaminan.startsWith('emas:'))
const emasCat = computed(() => emasCategoryOfJaminan(props.row.jaminan))

const snapView = computed(() => ({
  penghasilan: snap.penghasilan,
  penghasilanLain: snap.penghasilanLain,
  pengeluaran: snap.pengeluaran,
  asetLikuid: snap.asetLikuid,
  asetNonLikuid: snap.asetNonLikuid,
  emas: snap.emas,
  saham: snap.saham,
  crypto: snap.crypto,
  cicilanAktif: snap.cicilanAktif,
  utangPribadi: snap.utangPribadi,
  gadai: snap.gadai,
}))

const ownedGram = computed(() =>
  emasCat.value ? totalGramOf(snapView.value, emasCat.value) : 0,
)

// Total grams pawned across ALL gadai rows of this emas category — catches the
// cross-row overcommit case where each row stays individually under owned grams
// but Σ exceeds. Row-level warning fires on every row contributing to the over.
const totalPawnedInCategory = computed(() =>
  emasCat.value ? pawnedGramOf(snapView.value, emasCat.value) : 0,
)

const emasJenisLabel = computed(() => {
  if (props.row.jaminan === 'emas:digital') return t('gadai.jaminan.emas.digital')
  if (props.row.jaminan === 'emas:fisikAntam') return t('gadai.jaminan.emas.fisikAntam')
  if (props.row.jaminan === 'emas:perhiasan18K')
    return t('gadai.jaminan.emas.perhiasan18K')
  if (props.row.jaminan === 'emas:perhiasan14K')
    return t('gadai.jaminan.emas.perhiasan14K')
  if (props.row.jaminan === 'emas:perhiasan10K')
    return t('gadai.jaminan.emas.perhiasan10K')
  return ''
})

// Parallel to the properti/kendaraan "belum ada aset" hint: warn if the chosen emas
// category has zero grams owned in snapshot.
const emasNotEntered = computed(() => isEmas.value && ownedGram.value === 0)

const overOwned = computed(
  () =>
    isEmas.value &&
    ownedGram.value > 0 &&
    totalPawnedInCategory.value > ownedGram.value,
)

// Non-emas: list of asetNonLikuid rows the user can link to.
const refOptions = computed(() => {
  if (props.row.jaminan === 'properti') return snap.asetNonLikuid.properti
  if (props.row.jaminan === 'kendaraan') return snap.asetNonLikuid.kendaraan
  return []
})

const nonEmasEmptyMsgKey = computed<Parameters<typeof t>[0] | null>(() => {
  if (refOptions.value.length > 0) return null
  if (props.row.jaminan === 'properti') return 'gadai.asetRef.empty.properti'
  if (props.row.jaminan === 'kendaraan') return 'gadai.asetRef.empty.kendaraan'
  return null
})
</script>

<template>
  <article
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4"
  >
    <header class="mb-3 flex items-start justify-between gap-2">
      <input
        type="text"
        :value="row.label"
        :placeholder="t('gadai.field.label')"
        class="h-10 flex-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        @input="emit('update', { label: ($event.target as HTMLInputElement).value })"
      >
      <button
        type="button"
        :aria-label="t('gadai.row.remove')"
        class="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)]"
        @click="emit('remove')"
      >
        <X :size="16" />
      </button>
    </header>

    <div class="space-y-3">
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('gadai.field.jaminan') }}
        </span>
        <select
          :value="row.jaminan"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          @change="
            emit('update', {
              jaminan: ($event.target as HTMLSelectElement).value as GadaiJaminanKind,
            })
          "
        >
          <option v-for="opt in jaminanOptions" :key="opt.value" :value="opt.value">
            {{ t(opt.labelKey) }}
          </option>
        </select>
      </label>

      <!-- Emas-based jaminan: pawn grams -->
      <template v-if="isEmas">
        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">
            {{ t('gadai.field.tertahan') }}
            <span v-if="ownedGram > 0" class="text-[var(--color-text-muted)]">
              (dari total {{ ownedGram }}g)
            </span>
          </span>
          <div class="mt-1">
            <InputQuantity
              unit="gram"
              :step="0.1"
              :model-value="row.gramTertahan ?? null"
              @update:model-value="emit('update', { gramTertahan: $event ?? 0 })"
            />
          </div>
        </label>
        <p
          v-if="emasNotEntered"
          class="rounded-[var(--radius-input)] bg-[var(--color-warning-amber-soft)] px-3 py-2 text-[11px] text-[var(--color-warning-amber)]"
        >
          {{ t('gadai.emasRef.empty', { jenis: emasJenisLabel }) }}
        </p>
        <p
          v-else-if="overOwned"
          class="rounded-[var(--radius-input)] bg-[var(--color-danger-rose-soft)] px-3 py-2 text-[11px] text-[var(--color-danger-rose)]"
        >
          {{
            t('gadai.warning.overOwned', {
              pawned: totalPawnedInCategory,
              owned: ownedGram,
            })
          }}
        </p>
      </template>

      <!-- Properti / kendaraan: reference an existing aset row -->
      <template v-else>
        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">
            {{ t('gadai.field.asetRef') }}
          </span>
          <select
            v-if="refOptions.length > 0"
            :value="row.asetRefId ?? ''"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
            @change="
              emit('update', {
                asetRefId:
                  ($event.target as HTMLSelectElement).value || undefined,
              })
            "
          >
            <option value="">{{ t('gadai.field.asetRef.pick') }}</option>
            <option v-for="aset in refOptions" :key="aset.id" :value="aset.id">
              {{ aset.label || '(tanpa nama)' }}
            </option>
          </select>
          <p
            v-else-if="nonEmasEmptyMsgKey"
            class="mt-1 rounded-[var(--radius-input)] bg-[var(--color-warning-amber-soft)] px-3 py-2 text-[11px] text-[var(--color-warning-amber)]"
          >
            {{ t(nonEmasEmptyMsgKey) }}
          </p>
        </label>
      </template>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('gadai.field.piutang') }}
        </span>
        <div class="mt-1">
          <InputCurrency
            :model-value="row.piutangIdr || null"
            @update:model-value="emit('update', { piutangIdr: $event ?? 0 })"
          />
        </div>
      </label>
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('gadai.field.bunga') }}
        </span>
        <div class="mt-1">
          <InputQuantity
            unit="%/bln"
            :step="0.1"
            :model-value="row.bungaPerBulanPercent || null"
            @update:model-value="emit('update', { bungaPerBulanPercent: $event ?? 0 })"
          />
        </div>
      </label>
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('gadai.field.tempo') }}
        </span>
        <div class="mt-1">
          <InputQuantity
            unit="bln"
            :step="1"
            :model-value="row.tempoBulan || null"
            @update:model-value="emit('update', { tempoBulan: $event ?? 0 })"
          />
        </div>
      </label>
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('gadai.field.tanggal') }}
        </span>
        <input
          type="date"
          :value="row.tanggalJatuhTempo ?? ''"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          @input="
            emit('update', {
              tanggalJatuhTempo:
                ($event.target as HTMLInputElement).value || undefined,
            })
          "
        >
      </label>
    </div>
  </article>
</template>
