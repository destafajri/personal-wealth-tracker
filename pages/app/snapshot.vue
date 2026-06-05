<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Banknote,
  Bitcoin,
  Coins,
  CreditCard,
  Home,
  Info,
  Landmark,
  LayoutDashboard,
  LineChart,
  Lock,
  PiggyBank,
  ShoppingCart,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import ButtonSecondary from '~/components/common/ButtonSecondary.vue'
import IconChip from '~/components/common/IconChip.vue'
import CollapsiblePanel from '~/components/snapshot/CollapsiblePanel.vue'
import SnapshotRecap from '~/components/snapshot/SnapshotRecap.vue'
import SnapshotTabBar from '~/components/snapshot/SnapshotTabBar.vue'
import DashboardPanel from '~/components/layout/DashboardPanel.vue'
import PenghasilanForm from '~/components/snapshot/PenghasilanForm.vue'
import PengeluaranForm from '~/components/snapshot/PengeluaranForm.vue'
import AsetLikuidPanel from '~/components/snapshot/AsetLikuidPanel.vue'
import AsetNonLikuidPanel from '~/components/snapshot/AsetNonLikuidPanel.vue'
import CryptoPanel from '~/components/snapshot/CryptoPanel.vue'
import SahamPanel from '~/components/snapshot/SahamPanel.vue'
import EmasPanel from '~/components/snapshot/EmasPanel.vue'
import CicilanAktifPanel from '~/components/snapshot/CicilanAktifPanel.vue'
import UtangPribadiPanel from '~/components/snapshot/UtangPribadiPanel.vue'
import GadaiPanel from '~/components/snapshot/GadaiPanel.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useGoalsStore } from '~/stores/goals'
import { isSnapshotDirty } from '~/composables/useDirtyGuard'
import { triggerDemoFromQuery } from '~/lib/fixtures/demoSnapshot'
import {
  useCryptoPrices,
  useFxRates,
  useGoldPrice,
  useIdxPrices,
} from '~/composables/usePrices'
import { rateToIdr } from '~/lib/finance/fx'
import {
  calcTotalPengeluaran,
  sumCryptoIdr,
  sumEmasIdr,
  sumSbnIdr,
  sumStockIdr,
} from '~/lib/finance/metrics'
import type {
  AssetRow,
  CryptoRateView,
  Currency,
  FxRatesMap,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'

definePageMeta({ layout: 'app', ssr: false })
useSeoMeta({ title: `${t('snapshot.title')} — ${t('brand.name')}` })

const snap = useSnapshotStore()
const derived = useDerivedStore()
const goals = useGoalsStore()
const route = useRoute()
const router = useRouter()

const hasData = computed(() =>
  isSnapshotDirty({
    isDemo: snap.isDemo,
    goalsCount: goals.goals.length,
    penghasilanAmount: snap.penghasilan.amount,
    penghasilanLainCount: snap.penghasilanLain.length,
    pengeluaranPokok: snap.pengeluaran.pokok,
    pengeluaranLifestyle: snap.pengeluaran.lifestyle,
    pengeluaranLainCount: snap.pengeluaranLain.length,
    totalAset: derived.totalAset,
    cicilanCount: snap.cicilanAktif.length,
    utangPribadiCount: snap.utangPribadi.length,
    gadaiCount: snap.gadai.length,
  }),
)

onBeforeRouteLeave(() => {
  if (!hasData.value) return true
  return window.confirm(
    `${t('dialog.leave.title')}\n\n${t('dialog.leave.body')}`,
  )
})

onMounted(() => {
  // /app/snapshot IS the Wealth Tracker page — always set professional mode.
  snap.mode = 'wealthTracker'
  triggerDemoFromQuery(snap, route, router)
})
function resetDemo() {
  snap.reset()
}

// Phase-2a Day 5 — bolt-inspired tabbed snapshot. Per-input store writes still fire
// on every keystroke (B1 preserved); CTA only navigates between tabs / routes to
// next surface on last tab (B18 preserved). Within each tab, CollapsiblePanel
// wraps every input panel so the user can fold sections with heavy data away.
type SnapshotTabId =
  | 'cash-flow'
  | 'kas-tabungan'
  | 'investasi'
  | 'aset-non-likuid'
  | 'utang'
  | 'ringkasan'

const TABS = [
  {
    id: 'cash-flow' as const,
    label: 'Cash Flow',
    icon: ArrowLeftRight,
  },
  {
    id: 'kas-tabungan' as const,
    label: 'Kas',
    icon: PiggyBank,
  },
  {
    id: 'investasi' as const,
    label: 'Investasi',
    icon: BarChart3,
  },
  {
    id: 'aset-non-likuid' as const,
    label: 'Aset Tetap',
    icon: Home,
  },
  {
    id: 'utang' as const,
    label: 'Utang',
    icon: CreditCard,
  },
  {
    id: 'ringkasan' as const,
    label: 'Ringkasan',
    icon: LayoutDashboard,
  },
] satisfies ReadonlyArray<{
  id: SnapshotTabId
  label: string
  icon: unknown
}>

const activeTabId = ref<SnapshotTabId>('cash-flow')
const activeIndex = computed(() => TABS.findIndex((tab) => tab.id === activeTabId.value))
const isFirstTab = computed(() => activeIndex.value === 0)
const isLastTab = computed(() => activeIndex.value === TABS.length - 1)

function goToTab(id: SnapshotTabId) {
  activeTabId.value = id
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goNext() {
  // Last tab is Ringkasan (view), so its "next" routes out to /app/goals;
  // earlier tabs walk through the TABS array in order.
  if (isLastTab.value) {
    router.push('/app/goals')
    return
  }
  goToTab(TABS[activeIndex.value + 1]!.id)
}

function goPrev() {
  if (isFirstTab.value) return
  goToTab(TABS[activeIndex.value - 1]!.id)
}

const nextCtaLabel = computed(() => {
  if (activeTabId.value === 'ringkasan') return 'Lanjut ke Plan'
  if (activeTabId.value === 'utang') return 'Simpan & Lihat Hasil'
  return 'Simpan & Lanjutkan'
})

// Per-section subtotals shown in each CollapsiblePanel header (so user sees the
// running total at a glance without expanding). Mirrors DashboardSummary's helper
// approach; numbers match dashboard sidebar so the two surfaces stay aligned.
function sumRows(rows: AssetRow[] | undefined): number {
  if (!rows) return 0
  return rows.reduce((sum, row) => {
    const amt = row.amount || 0
    const cur = row.currency ?? 'IDR'
    if (cur === 'IDR') return sum + amt
    const rate = rateToIdr(cur, derived.priceView?.fxRates) ?? 0
    return sum + amt * rate
  }, 0)
}

const snapState = computed<SnapshotState>(() => ({
  penghasilan: snap.penghasilan,
  penghasilanLain: snap.penghasilanLain,
  pengeluaran: snap.pengeluaran,
  pengeluaranLain: snap.pengeluaranLain,
  asetLikuid: snap.asetLikuid,
  asetNonLikuid: snap.asetNonLikuid,
  emas: snap.emas,
  saham: snap.saham,
  crypto: snap.crypto,
  cicilanAktif: snap.cicilanAktif,
  utangPribadi: snap.utangPribadi,
  gadai: snap.gadai,
}))

const penghasilanTotal = computed(() => derived.penghasilanMonthlyIdr)
const pengeluaranTotal = computed(() =>
  calcTotalPengeluaran(snapState.value, derived.priceView ?? undefined),
)
const kasTotal = computed(() => sumRows(snap.asetLikuid.kas))
const depoRdSbnTotal = computed(
  () =>
    sumRows(snap.asetLikuid.deposito) +
    sumRows(snap.asetLikuid.reksaDana) +
    sumSbnIdr(snapState.value, derived.priceView ?? undefined),
)
const emasTotal = computed(() =>
  sumEmasIdr(snapState.value, derived.priceView ?? undefined),
)
const sahamTotal = computed(() =>
  sumStockIdr(snap.saham, derived.priceView ?? undefined),
)
const cryptoTotal = computed(() =>
  sumCryptoIdr(snap.crypto, derived.priceView ?? undefined),
)
const asetTetapTotal = computed(
  () =>
    sumRows(snap.asetNonLikuid.properti) +
    sumRows(snap.asetNonLikuid.kendaraan) +
    sumRows(snap.asetNonLikuid.pensiun),
)
const cicilanAktifTotal = computed(() =>
  snap.cicilanAktif.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)
const utangPribadiTotal = computed(() =>
  snap.utangPribadi.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)
const gadaiTotal = computed(() =>
  snap.gadai.reduce((s, r) => s + (r.piutangIdr || 0), 0),
)

const tickers = computed(() => snap.saham.map((s) => s.ticker).filter(Boolean))
const gold = useGoldPrice()
const fx = useFxRates()
const idx = useIdxPrices(tickers)
const crypto = useCryptoPrices()
const cryptoLiveError = computed(() => crypto.error.value !== null)
const idxLiveError = computed(() => idx.error.value !== null)
const goldLiveError = computed(() => gold.error.value !== null)

function emptyFxRates(): FxRatesMap {
  return { USD: null, SGD: null, EUR: null, JPY: null, KRW: null }
}

watchEffect(() => {
  const idxMap: Record<string, number | null> = {}
  for (const row of idx.data.value?.prices ?? []) idxMap[row.ticker] = row.price
  const cryptoMap: Record<string, CryptoRateView> = {}
  for (const row of crypto.data.value?.prices ?? []) {
    cryptoMap[row.coinId] = {
      idr: row.idr,
      usd: row.usd,
      eur: row.eur,
      jpy: row.jpy,
      krw: row.krw,
    }
  }
  const fxRates = emptyFxRates()
  for (const row of fx.data.value?.rates ?? []) {
    const base = row.pair.replace(/IDR$/, '') as Exclude<Currency, 'IDR'>
    fxRates[base] = row.rate
  }
  const view: PricesView = {
    goldDigitalIdrPerGram: gold.data.value?.hargaJual ?? null,
    goldAntam1gIdr: gold.data.value?.antam1g ?? null,
    fxRates,
    idxByTicker: idxMap,
    cryptoByCoinId: cryptoMap,
  }
  derived.setPrices(view)
})
</script>

<template>
  <div class="space-y-5">
    <h1 class="sr-only">{{ t('snapshot.title') }}</h1>

    <div
      v-if="snap.isDemo"
      class="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-4 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      <Info class="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
      <p class="flex-1">{{ t('snapshot.demo.banner') }}</p>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)]"
        @click="resetDemo"
      >
        <X class="h-3 w-3" />
        {{ t('snapshot.demo.reset') }}
      </button>
    </div>

    <div
      v-if="hasData && !snap.isDemo"
      class="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-warning-amber)]/30 bg-[var(--color-warning-amber)]/5 px-4 py-2.5 text-sm text-[var(--color-text-secondary)]"
    >
      <AlertTriangle class="h-4 w-4 shrink-0 text-[var(--color-warning-amber)]" />
      <span>{{ t('snapshot.unsaved.banner') }}</span>
    </div>

    <SnapshotTabBar
      :tabs="TABS"
      :active-id="activeTabId"
      @update:active-id="(id) => goToTab(id as SnapshotTabId)"
    />

    <div
      v-show="activeTabId === 'cash-flow'"
      class="space-y-5 rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--color-primary)]/5 via-[var(--color-surface-card)] to-[var(--color-surface-card)] p-4 sm:p-6"
    >
      <header>
        <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Catat Cash Flow Bulanan
        </h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pendapatan dan pengeluaran rutin per bulan — fondasi analisis surplus, DSR, dan kapasitas keuangan kamu.
        </p>
      </header>
      <div class="space-y-3">
        <CollapsiblePanel
          title="Penghasilan"
          subtitle="Pendapatan rutin per bulan dari semua sumber"
          :icon="TrendingUp"
          variant="emerald"
          :value="penghasilanTotal"
        >
          <PenghasilanForm hide-header />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Pengeluaran"
          subtitle="Biaya pokok, lifestyle, dan cicilan rutin"
          :icon="ShoppingCart"
          variant="rose"
          :value="pengeluaranTotal"
        >
          <PengeluaranForm hide-header />
        </CollapsiblePanel>
      </div>
    </div>

    <div v-show="activeTabId === 'kas-tabungan'" class="space-y-3">
      <CollapsiblePanel
        title="Kas"
        subtitle="Saldo bank, dana darurat, dan tabungan tujuan"
        :icon="Wallet"
        variant="emerald"
        :value="kasTotal"
      >
        <AsetLikuidPanel :categories="['kas']" hide-header />
      </CollapsiblePanel>
    </div>

    <div
      v-show="activeTabId === 'investasi'"
      class="space-y-5 rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--color-primary)]/5 via-[var(--color-surface-card)] to-[var(--color-surface-card)] p-4 sm:p-6"
    >
      <header>
        <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Pilih Jenis Investasi
        </h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          Kategorikan portofolio kamu berdasarkan jenis aset untuk manajemen risiko yang lebih baik.
        </p>
      </header>

      <div class="space-y-3">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            Investasi Pasif
          </h3>
          <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            Deposito, reksa dana, SBN, dan emas — yielding atau store-of-value
          </p>
        </div>
        <CollapsiblePanel
          title="Deposito, Reksa Dana, SBN"
          subtitle="Fixed-income dengan bunga / yield"
          :icon="Landmark"
          variant="neutral"
          :value="depoRdSbnTotal"
        >
          <AsetLikuidPanel
            :categories="['deposito', 'reksaDana', 'sbn']"
            hide-header
          />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Emas"
          subtitle="Antam, perhiasan, dan emas digital"
          :icon="Coins"
          variant="neutral"
          :value="emasTotal"
          disabled
          badge="Maintenance"
        >
          <EmasPanel
            hide-header
            :live-error="goldLiveError"
            :live-pending="gold.pending.value"
            :cooldown-remaining="gold.cooldownRemaining.value"
            :on-refresh="gold.forceRefresh"
            disabled
          />
        </CollapsiblePanel>
      </div>

      <div class="space-y-3">
        <div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
            Investasi Pasar
          </h3>
          <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            Saham dan kripto dengan harga live
          </p>
        </div>
        <CollapsiblePanel
          title="Saham"
          subtitle="Per-emiten dengan harga IDX live"
          :icon="LineChart"
          variant="amber"
          :value="sahamTotal"
        >
          <SahamPanel
            hide-header
            :idx-rows="idx.data.value?.prices"
            :live-error="idxLiveError"
            :live-pending="idx.pending.value"
            :cooldown-remaining="idx.cooldownRemaining.value"
            :on-refresh="idx.forceRefresh"
          />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Kripto"
          subtitle="Per-coin dengan CoinGecko live + 4 mode input"
          :icon="Bitcoin"
          variant="amber"
          :value="cryptoTotal"
        >
          <CryptoPanel
            hide-header
            :live-error="cryptoLiveError"
            :live-pending="crypto.pending.value"
            :cooldown-remaining="crypto.cooldownRemaining.value"
            :on-refresh="crypto.forceRefresh"
          />
        </CollapsiblePanel>
      </div>
    </div>

    <div v-show="activeTabId === 'aset-non-likuid'" class="space-y-3">
      <CollapsiblePanel
        title="Properti, Kendaraan, Lainnya"
        subtitle="Aset fisik dan barang berharga"
        :icon="Home"
        variant="neutral"
        :value="asetTetapTotal"
      >
        <AsetNonLikuidPanel hide-header />
      </CollapsiblePanel>
    </div>

    <div
      v-show="activeTabId === 'utang'"
      class="space-y-5 rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--color-danger-rose)]/5 via-[var(--color-surface-card)] to-[var(--color-surface-card)] p-4 sm:p-6"
    >
      <header>
        <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Cek Beban Utang
        </h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          Cicilan aktif, utang pribadi, dan jaminan gadai — sumber kewajiban yang mempengaruhi DSR dan likuiditas darurat.
        </p>
      </header>
      <div class="space-y-3">
        <CollapsiblePanel
          title="Cicilan Aktif"
          subtitle="KPR, KPM, kartu kredit, pinjol, paylater, KTA"
          :icon="CreditCard"
          variant="rose"
          :value="cicilanAktifTotal"
        >
          <CicilanAktifPanel hide-header />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Utang Pribadi"
          subtitle="Pinjaman ke keluarga / teman tanpa skema cicilan"
          :icon="Banknote"
          variant="rose"
          :value="utangPribadiTotal"
        >
          <UtangPribadiPanel hide-header />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Gadai"
          subtitle="Jaminan emas, saham, atau aset lain"
          :icon="Lock"
          variant="rose"
          :value="gadaiTotal"
        >
          <GadaiPanel hide-header />
        </CollapsiblePanel>
      </div>
    </div>

    <div v-if="activeTabId === 'ringkasan'" class="space-y-4">
      <header
        class="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/8 via-[var(--color-surface-card)] to-[var(--color-surface-card)] px-4 py-4 sm:px-5"
      >
        <IconChip variant="emerald" size="lg">
          <LayoutDashboard :size="22" :stroke-width="1.75" />
        </IconChip>
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
            Ringkasan Keuanganmu
          </h2>
          <p class="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            Gambaran menyeluruh kondisi keuanganmu — langsung dari data yang kamu isi.
          </p>
        </div>
      </header>
      <!-- Visual dashboard FIRST — TL;DR in 3 seconds -->
      <div class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-2 sm:p-3">
        <DashboardPanel />
      </div>
      <!-- Detail breakdown BELOW — audit trail, grid 2-col on desktop -->
      <SnapshotRecap />
    </div>

    <div
      class="rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-4 sm:p-3"
    >
      <!-- Step progress indicator -->
      <div class="mb-4 flex items-center justify-center gap-1.5 sm:mb-2.5">
        <button
          v-for="(tab, i) in TABS"
          :key="tab.id"
          type="button"
          class="h-1.5 rounded-full transition-all sm:h-1"
          :class="[
            i <= activeIndex
              ? 'w-6 bg-[var(--color-primary)] sm:w-5'
              : 'w-1.5 bg-[var(--color-border)]',
          ]"
          :aria-label="`Langkah ${i + 1}: ${tab.label}`"
          @click="goToTab(tab.id)"
        />
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <ButtonSecondary
          v-if="!isFirstTab"
          class="w-full whitespace-nowrap sm:w-auto"
          @click="goPrev"
        >
          ← Sebelumnya
        </ButtonSecondary>
        <ButtonPrimary
          class="w-full whitespace-nowrap sm:ml-auto sm:w-auto"
          @click="goNext"
        >
          {{ nextCtaLabel }} →
        </ButtonPrimary>
      </div>
      <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)] sm:mt-2 sm:text-[11px]">
        <Lock :size="12" :stroke-width="2" class="shrink-0 sm:h-3 sm:w-3" />
        <span>Data disimpan lokal di browser kamu, tidak dikirim ke server.</span>
      </p>
    </div>
  </div>
</template>
