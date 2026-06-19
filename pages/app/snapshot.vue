<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watchEffect } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Banknote,
  Bitcoin,
  Coins,
  CreditCard,
  Download,
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
import TradingViewTickerTape from '~/components/snapshot/TradingViewTickerTape.vue'
import EmasPanel from '~/components/snapshot/EmasPanel.vue'
import CicilanAktifPanel from '~/components/snapshot/CicilanAktifPanel.vue'
import UtangPribadiPanel from '~/components/snapshot/UtangPribadiPanel.vue'
import GadaiPanel from '~/components/snapshot/GadaiPanel.vue'
import UndoToast from '~/components/snapshot/UndoToast.vue'
import PersonaPickerBanner from '~/components/snapshot/PersonaPickerBanner.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useGoalsStore } from '~/stores/goals'
import { isSnapshotDirty } from '~/composables/useDirtyGuard'
import { useXlsx } from '~/composables/useXlsx'
import { usePdf } from '~/composables/usePdf'
import { useToast } from '~/composables/useToast'
import { triggerDemoFromQuery } from '~/lib/fixtures/demoSnapshot'
import { PERSONAS, applyPersona, type SamplePersona } from '~/lib/fixtures/personas'
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
import { idr } from '~/lib/format/idr'
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
    pengeluaranBiayaKos: snap.pengeluaran.biayaKos ?? 0,
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
  // Set AFTER demo trigger because applyDemoSnapshot calls reset() which
  // clears mode to null.
  triggerDemoFromQuery(snap, route, router)
  snap.mode = 'wealthTracker'
  // If demo loaded, mark default persona as active
  if (snap.isDemo) {
    activePersonaId.value = 'pegawai-muda-kpr'
  }
})
function resetDemo() {
  snap.reset()
}

// Demo banner personas — diagnostic only (kind !== 'template'). Template personas
// are reserved for the PersonaPickerBanner first-run flow (Phase 8.2). Without
// this discriminator, adding template personas to the same registry would leak
// them into the demo picker.
const personas = computed(() =>
  PERSONAS.filter((p) => p.mode === 'wealthTracker' && p.kind !== 'template'),
)
const activePersonaId = ref<string | null>(null)

function switchPersona(p: SamplePersona) {
  applyPersona(snap, p, goals)
  activePersonaId.value = p.id
  if (p.mode === 'budgetKos') {
    navigateTo('/app/budget-kos')
  }
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

const xlsx = useXlsx()
const pdf = usePdf()
const toast = useToast()

type DownloadPhase = 'idle' | 'xlsx' | 'pdf'
const downloadPhase = ref<DownloadPhase>('idle')
const downloadDisabled = computed(() =>
  derived.totalAset === 0 &&
  derived.totalUtang === 0 &&
  derived.penghasilanMonthlyIdr === 0,
)

async function onDownloadReport() {
  if (downloadDisabled.value || downloadPhase.value !== 'idle') return
  try {
    downloadPhase.value = 'xlsx'
    await nextTick()
    await xlsx.download()

    downloadPhase.value = 'pdf'
    await nextTick()
    await pdf.generatePdf()

    toast.showToast(t('toast.download.downloading'), {
      type: 'info',
      durationMs: 5000,
      actions: [
        { label: t('toast.download.retryPdf'), handler: () => pdf.generatePdf() },
        { label: t('toast.download.retryXlsx'), handler: () => xlsx.download() },
      ],
    })
  } catch {
    if (downloadPhase.value === 'xlsx') {
      toast.showToast(t('toast.download.allFailed'), { type: 'error' })
    } else {
      toast.showToast(t('toast.download.pdfFailed'), {
        type: 'error',
        actions: [
          { label: t('toast.download.retryPdf'), handler: () => pdf.generatePdf() },
        ],
      })
    }
  } finally {
    downloadPhase.value = 'idle'
  }
}

function goNext() {
  // Last tab is Ringkasan — button becomes "Unduh Laporan"
  if (isLastTab.value) return
  goToTab(TABS[activeIndex.value + 1]!.id)
}

function goPrev() {
  if (isFirstTab.value) return
  goToTab(TABS[activeIndex.value - 1]!.id)
}

const nextCtaLabel = computed(() => {
  if (activeTabId.value === 'ringkasan') {
    if (downloadPhase.value === 'xlsx') return 'Menyusun XLSX...'
    if (downloadPhase.value === 'pdf') return 'Menyusun PDF...'
    return 'Unduh Laporan'
  }
  if (activeTabId.value === 'utang') return 'Simpan & Lihat Hasil'
  return 'Simpan & Lanjutkan'
})

const isDownloading = computed(() => downloadPhase.value !== 'idle')

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

// Investasi section-header totals. Each is a pure sum of the underlying per-panel
// totals — descriptive only, no per-section status metric (per Fix C: DSR is
// portfolio-level, not decomposable per asset section).
const emasGramTotal = computed(() => {
  const e = snap.emas
  return (
    e.digitalGram +
    e.fisikAntamGram +
    e.perhiasan18KGram +
    e.perhiasan14KGram +
    e.perhiasan10KGram
  )
})
const investasiPasarTotal = computed(
  () => sahamTotal.value + cryptoTotal.value,
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

// Phase 8.3 — Per-tab row counts for SnapshotTabBar badges. Each tab badge
// shows total row count across all panels rendered in that tab. Ringkasan
// always 0 (it's the dashboard view, no data entry).
const hasEmas = computed(() => {
  const e = snap.emas
  return (
    e.digitalGram > 0 ||
    e.fisikAntamGram > 0 ||
    e.perhiasan18KGram > 0 ||
    e.perhiasan14KGram > 0 ||
    e.perhiasan10KGram > 0
  )
})

const tabCounts = computed<Record<string, number>>(() => ({
  'cash-flow':
    (snap.penghasilan.amount > 0 ? 1 : 0) +
    snap.penghasilanLain.length +
    (snap.pengeluaran.pokok > 0 || snap.pengeluaran.lifestyle > 0 ? 1 : 0) +
    snap.pengeluaranLain.length,
  'kas-tabungan': snap.asetLikuid.kas.length,
  investasi:
    snap.asetLikuid.deposito.length +
    snap.asetLikuid.reksaDana.length +
    snap.asetLikuid.sbn.length +
    (hasEmas.value ? 1 : 0) +
    snap.saham.length +
    snap.crypto.length,
  'aset-non-likuid':
    snap.asetNonLikuid.properti.length +
    snap.asetNonLikuid.kendaraan.length +
    snap.asetNonLikuid.pensiun.length,
  utang:
    snap.cicilanAktif.length +
    snap.utangPribadi.length +
    snap.gadai.length,
  ringkasan: 0,
}))

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
    goldSource: gold.data.value?.source ?? null,
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
      class="rounded-[var(--radius-card)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-4 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      <div class="flex items-start gap-3">
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
      <!-- Persona picker -->
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="p in personas"
          :key="p.id"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-medium transition"
          :class="
            activePersonaId === p.id
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'
          "
          @click="switchPersona(p)"
        >
          <span>{{ p.emoji }}</span>
          <span>{{ p.nama }}</span>
        </button>
      </div>
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
      :counts="tabCounts"
      @update:active-id="(id) => goToTab(id as SnapshotTabId)"
    />

    <PersonaPickerBanner :has-data="hasData" />

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
          :section-complete="penghasilanTotal > 0"
        >
          <PenghasilanForm hide-header />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Pengeluaran"
          subtitle="Biaya pokok, lifestyle, dan cicilan rutin"
          :icon="ShoppingCart"
          variant="rose"
          :value="pengeluaranTotal"
          :section-complete="pengeluaranTotal > 0"
        >
          <PengeluaranForm hide-header />
        </CollapsiblePanel>
      </div>
    </div>

    <div v-show="activeTabId === 'kas-tabungan'" class="space-y-5">
      <CollapsiblePanel
        title="Kas"
        subtitle="Saldo bank, dana darurat, dan tabungan tujuan"
        :icon="Wallet"
        variant="emerald"
        :value="kasTotal"
        :section-complete="kasTotal > 0"
      >
        <AsetLikuidPanel :categories="['kas']" hide-header />
      </CollapsiblePanel>
    </div>

    <div
      v-show="activeTabId === 'investasi'"
      class="space-y-5"
    >
      <!-- TradingView Ticker Tape — market overview strip (IHSG + gold + BTC + USD/IDR).
           Contextual to Investasi tab; not shown on other tabs. -->
      <TradingViewTickerTape />

      <!-- Section 1: Investasi Pasif — pure form: title prominent, total as value -->
      <section
        class="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <header class="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div class="flex min-w-0 items-center gap-2.5">
            <IconChip variant="emerald" size="md">
              <Landmark :size="18" :stroke-width="1.75" />
            </IconChip>
            <div class="min-w-0">
              <h3 class="text-base font-semibold leading-tight text-[var(--color-text-primary)]">
                Investasi Pasif
              </h3>
              <p class="truncate text-xs text-[var(--color-text-muted)]">
                Deposito, reksa dana, SBN
              </p>
            </div>
          </div>
          <span class="num whitespace-nowrap text-sm font-medium text-[var(--color-text-secondary)]">
            {{ idr(depoRdSbnTotal) }}
          </span>
        </header>
        <hr class="border-[var(--color-border)]">
        <div class="p-4 sm:p-5">
          <AsetLikuidPanel
            :categories="['deposito', 'reksaDana', 'sbn']"
            variant="bordered"
            hide-header
          />
        </div>
      </section>

      <!-- Section 2: Emas & Logam Mulia -->
      <section
        class="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <header class="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div class="flex min-w-0 items-center gap-2.5">
            <IconChip variant="amber" size="md">
              <Coins :size="18" :stroke-width="1.75" />
            </IconChip>
            <div class="min-w-0">
              <h3 class="text-base font-semibold leading-tight text-[var(--color-text-primary)]">
                Emas & Logam Mulia
              </h3>
              <p class="truncate text-xs text-[var(--color-text-muted)]">
                Antam, perhiasan, emas digital
              </p>
            </div>
          </div>
          <span class="num whitespace-nowrap text-sm font-medium text-[var(--color-text-secondary)]">
            {{ idr(emasTotal) }}<span
              v-if="emasGramTotal > 0"
              class="ml-1 font-normal text-[var(--color-text-muted)]"
            >· {{ emasGramTotal }}g</span>
          </span>
        </header>
        <hr class="border-[var(--color-border)]">
        <div class="p-4 sm:p-5">
          <EmasPanel
            hide-header
            :live-error="goldLiveError"
            :live-pending="gold.pending.value"
            :cooldown-remaining="gold.cooldownRemaining.value"
            :on-refresh="gold.forceRefresh"
            :gold-source="gold.data.value?.source ?? null"
          />
        </div>
      </section>

      <!-- Section 3: Investasi Pasar -->
      <section
        class="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <header class="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div class="flex min-w-0 items-center gap-2.5">
            <IconChip variant="sky" size="md">
              <LineChart :size="18" :stroke-width="1.75" />
            </IconChip>
            <div class="min-w-0">
              <h3 class="text-base font-semibold leading-tight text-[var(--color-text-primary)]">
                Investasi Pasar
              </h3>
              <p class="truncate text-xs text-[var(--color-text-muted)]">
                Saham & kripto live
              </p>
            </div>
          </div>
          <span class="num whitespace-nowrap text-sm font-medium text-[var(--color-text-secondary)]">
            {{ idr(investasiPasarTotal) }}
          </span>
        </header>
        <hr class="border-[var(--color-border)]">
        <div class="space-y-5 p-4 sm:p-5">
          <SahamPanel
            hide-header
            :idx-rows="idx.data.value?.prices"
            :live-error="idxLiveError"
            :live-pending="idx.pending.value"
            :cooldown-remaining="idx.cooldownRemaining.value"
            :on-refresh="idx.forceRefresh"
          />
          <CryptoPanel
            hide-header
            :live-error="cryptoLiveError"
            :live-pending="crypto.pending.value"
            :cooldown-remaining="crypto.cooldownRemaining.value"
            :on-refresh="crypto.forceRefresh"
          />
        </div>
      </section>
    </div>

    <div v-show="activeTabId === 'aset-non-likuid'" class="space-y-5">
      <CollapsiblePanel
        title="Properti, Kendaraan, Lainnya"
        subtitle="Aset fisik dan barang berharga"
        :icon="Home"
        variant="sky"
        :value="asetTetapTotal"
        :section-complete="asetTetapTotal > 0"
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
      <div class="space-y-4">
        <CollapsiblePanel
          title="Cicilan Aktif"
          subtitle="KPR, KPM, kartu kredit, pinjol, paylater, KTA"
          :icon="CreditCard"
          variant="rose"
          :value="cicilanAktifTotal"
          :section-complete="cicilanAktifTotal > 0"
        >
          <CicilanAktifPanel hide-header />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Utang Pribadi"
          subtitle="Pinjaman ke keluarga / teman tanpa skema cicilan"
          :icon="Banknote"
          variant="rose"
          :value="utangPribadiTotal"
          :section-complete="utangPribadiTotal > 0"
        >
          <UtangPribadiPanel hide-header />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Gadai"
          subtitle="Jaminan emas, saham, atau aset lain"
          :icon="Lock"
          variant="rose"
          :value="gadaiTotal"
          :section-complete="gadaiTotal > 0"
        >
          <GadaiPanel hide-header />
        </CollapsiblePanel>
      </div>
    </div>

    <div v-if="activeTabId === 'ringkasan'" class="min-w-0 space-y-4 overflow-x-hidden">
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
      <div class="min-w-0 overflow-x-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-2 sm:p-3">
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
          v-if="isLastTab"
          :disabled="downloadDisabled || isDownloading"
          :title="downloadDisabled ? 'Isi data keuangan dulu untuk mengunduh laporan' : undefined"
          class="w-full whitespace-nowrap sm:ml-auto sm:w-auto"
          @click="onDownloadReport"
        >
          <Download :size="16" class="mr-1.5 inline-block" />
          {{ nextCtaLabel }}
        </ButtonPrimary>
        <ButtonPrimary
          v-else
          class="w-full whitespace-nowrap sm:ml-auto sm:w-auto"
          @click="goNext"
        >
          {{ nextCtaLabel }} →
        </ButtonPrimary>
      </div>
      <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)] sm:mt-2 sm:text-[11px]">
        <Lock :size="12" :stroke-width="2" class="shrink-0 sm:h-3 sm:w-3" />
        <span>Data disimpan lokal di browser kamu, tidak dikirim ke server. Unduh XLSX untuk simpan data & lanjutkan kapan saja.</span>
      </p>
    </div>

    <UndoToast />
  </div>
</template>
