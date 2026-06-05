<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronDown,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-vue-next'
import IconChip from '~/components/common/IconChip.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'

const snap = useSnapshotStore()
const derived = useDerivedStore()

const penghasilanTotal = computed(() => derived.penghasilanMonthlyIdr)
const pengeluaranTotal = computed(() =>
  penghasilanTotal.value - derived.surplusIdr,
)
const surplusAmt = computed(() => derived.surplusIdr)
const surplusPct = computed(() =>
  penghasilanTotal.value > 0
    ? Math.round((surplusAmt.value / penghasilanTotal.value) * 100)
    : 0,
)
const kasTotal = computed(() =>
  snap.asetLikuid.kas.reduce((s, r) => s + (r.amount || 0), 0),
)
const cicilanMonthly = computed(() =>
  snap.cicilanAktif.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0),
)
const cicilanSisa = computed(() =>
  snap.cicilanAktif.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)
const utangPribadiSisa = computed(() =>
  snap.utangPribadi.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)

const hasCashFlow = computed(() => penghasilanTotal.value > 0 || pengeluaranTotal.value > 0)
const hasKas = computed(() => kasTotal.value > 0)
const hasCicilan = computed(() => snap.cicilanAktif.length > 0)
const hasUtang = computed(() => snap.utangPribadi.length > 0)

type Section = 'cashflow' | 'kas' | 'cicilan' | 'utang'
const openSections = ref<Set<Section>>(new Set())
function toggle(key: Section) {
  const next = new Set(openSections.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  openSections.value = next
}
function isOpen(key: Section) { return openSections.value.has(key) }
</script>

<template>
  <section v-if="hasCashFlow || hasKas || hasCicilan || hasUtang" class="space-y-3">
    <!-- Surplus hero -->
    <div
      v-if="hasCashFlow"
      class="rounded-[var(--radius-card)] border p-4"
      :class="surplusAmt >= 0
        ? 'border-emerald-200 bg-emerald-50'
        : 'border-rose-200 bg-rose-50'"
    >
      <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
        Surplus Bulanan
      </p>
      <p
        class="mt-1 text-2xl font-bold tabular-nums"
        :class="surplusAmt >= 0 ? 'text-emerald-700' : 'text-rose-700'"
      >
        {{ surplusAmt >= 0 ? '+' : '' }}{{ idr(surplusAmt) }}
      </p>
      <p class="mt-1 text-xs text-[var(--color-text-secondary)]">
        {{ surplusPct }}% dari penghasilan
      </p>
    </div>

    <!-- Collapsible sections -->
    <div class="space-y-2">
      <!-- Cash Flow -->
      <article
        v-if="hasCashFlow"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggle('cashflow')"
          :aria-expanded="isOpen('cashflow')"
        >
          <IconChip variant="emerald" size="md"><TrendingUp :size="14" /></IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Cash Flow</h4>
          </div>
          <span class="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ idr(penghasilanTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('cashflow') && 'rotate-180'" />
        </button>
        <div v-show="isOpen('cashflow')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li class="flex justify-between py-1.5">
              <span class="text-[var(--color-text-secondary)]">Penghasilan</span>
              <span class="tabular-nums text-[var(--color-text-primary)]">{{ idr(penghasilanTotal) }}</span>
            </li>
            <li class="flex justify-between py-1.5">
              <span class="text-[var(--color-text-secondary)]">Pengeluaran</span>
              <span class="tabular-nums text-[var(--color-text-primary)]">{{ idr(pengeluaranTotal) }}</span>
            </li>
            <li class="flex justify-between py-1.5 font-semibold">
              <span :class="surplusAmt >= 0 ? 'text-emerald-700' : 'text-rose-700'">Surplus</span>
              <span class="tabular-nums" :class="surplusAmt >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                {{ surplusAmt >= 0 ? '+' : '' }}{{ idr(surplusAmt) }}
              </span>
            </li>
          </ul>
        </div>
      </article>

      <!-- Kas -->
      <article
        v-if="hasKas"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggle('kas')"
          :aria-expanded="isOpen('kas')"
        >
          <IconChip variant="emerald" size="md"><Wallet :size="14" /></IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Kas & Tabungan</h4>
          </div>
          <span class="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">{{ idr(kasTotal) }}</span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('kas') && 'rotate-180'" />
        </button>
        <div v-show="isOpen('kas')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li v-for="row in snap.asetLikuid.kas" :key="row.id" class="flex justify-between py-1.5">
              <span class="text-[var(--color-text-secondary)]">{{ row.label || 'Kas' }}</span>
              <span class="tabular-nums text-[var(--color-text-primary)]">{{ idr(row.amount || 0) }}</span>
            </li>
          </ul>
        </div>
      </article>

      <!-- Cicilan -->
      <article
        v-if="hasCicilan"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggle('cicilan')"
          :aria-expanded="isOpen('cicilan')"
        >
          <IconChip variant="rose" size="md"><CreditCard :size="14" /></IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Cicilan</h4>
          </div>
          <span class="text-sm font-semibold tabular-nums text-[var(--color-danger-rose)]">{{ idr(cicilanSisa) }}</span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('cicilan') && 'rotate-180'" />
        </button>
        <div v-show="isOpen('cicilan')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li v-for="row in snap.cicilanAktif" :key="row.id" class="space-y-0.5 py-1.5">
              <div class="flex justify-between">
                <span class="text-[var(--color-text-secondary)]">
                  <span class="text-[10px] uppercase tracking-wide text-[var(--color-danger-rose)]">{{ row.tipe }}</span>
                  {{ row.label || row.tipe }}
                </span>
                <span class="tabular-nums text-[var(--color-text-primary)]">{{ idr(row.sisaPokok || 0) }}</span>
              </div>
              <p class="text-[10px] text-[var(--color-text-muted)]">{{ idr(row.cicilanPerBulan || 0) }}/bln</p>
            </li>
          </ul>
        </div>
      </article>

      <!-- Utang Pribadi -->
      <article
        v-if="hasUtang"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggle('utang')"
          :aria-expanded="isOpen('utang')"
        >
          <IconChip variant="rose" size="md"><ShoppingCart :size="14" /></IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Utang Pribadi</h4>
          </div>
          <span class="text-sm font-semibold tabular-nums text-[var(--color-danger-rose)]">{{ idr(utangPribadiSisa) }}</span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('utang') && 'rotate-180'" />
        </button>
        <div v-show="isOpen('utang')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li v-for="row in snap.utangPribadi" :key="row.id" class="flex justify-between py-1.5">
              <span class="text-[var(--color-text-secondary)]">{{ row.label || 'Utang' }}</span>
              <span class="tabular-nums text-[var(--color-text-primary)]">{{ idr(row.sisaPokok || 0) }}</span>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>
