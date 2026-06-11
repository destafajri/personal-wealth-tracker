<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftRight,
  CreditCard,
  ExternalLink,
  Home,
  Info,
  LayoutDashboard,
  PiggyBank,
  ShoppingCart,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'
import { idr } from '~/lib/format/idr'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import ButtonSecondary from '~/components/common/ButtonSecondary.vue'
import CollapsiblePanel from '~/components/snapshot/CollapsiblePanel.vue'
import SnapshotTabBar from '~/components/snapshot/SnapshotTabBar.vue'
import PenghasilanForm from '~/components/snapshot/PenghasilanForm.vue'
import PengeluaranForm from '~/components/snapshot/PengeluaranForm.vue'
import AsetLikuidPanel from '~/components/snapshot/AsetLikuidPanel.vue'
import CicilanAktifPanel from '~/components/snapshot/CicilanAktifPanel.vue'
import UtangPribadiPanel from '~/components/snapshot/UtangPribadiPanel.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { isSnapshotDirty } from '~/composables/useDirtyGuard'
import { useMetricExplainer } from '~/composables/useMetricExplainer'
import { calcTotalPengeluaran } from '~/lib/finance/metrics'
import { rowToIdr } from '~/lib/finance/fx'
import { triggerBudgetKosDemo } from '~/lib/fixtures/demoSnapshot'
import { PERSONAS, applyPersona, type SamplePersona } from '~/lib/fixtures/personas'
import { useFxRates } from '~/composables/usePrices'
import { getAppUrl } from '~/composables/useShare'
import ShareDialog from '~/components/common/ShareDialog.vue'
import PersonaShareCard from '~/components/share/PersonaShareCard.vue'
import { Share2 } from 'lucide-vue-next'
import type { Currency, FxRatesMap, PricesView } from '~/lib/types/snapshot'
import {
  resolvePersona,
  hasInvestments,
  isSnapshotReady,
  PERSONA_VISUALS,
  type PersonaKey,
} from '~/lib/finance/persona'

definePageMeta({ layout: 'default', ssr: false })
useSeoMeta({ title: `Cek Tipe Anak Kos Kamu — ${t('brand.name')}` })

const snap = useSnapshotStore()
const derived = useDerivedStore()
const route = useRoute()
const router = useRouter()

// Force budgetKos mode (AFTER triggerBudgetKosDemo, because reset() clears mode)
onMounted(() => {
  triggerBudgetKosDemo(snap, route, router)
  snap.mode = 'budgetKos'
  if (snap.isDemo) {
    activePersonaId.value = 'mahasiswa-pas-pasan'
  }
})

const budgetKosPersonas = computed(() => PERSONAS.filter((p) => p.mode === 'budgetKos'))
const activePersonaId = ref<string | null>(null)

function resetDemo() {
  snap.reset()
  snap.mode = 'budgetKos'
  activePersonaId.value = null
}

function switchPersona(p: SamplePersona) {
  applyPersona(snap, p)
  snap.mode = 'budgetKos'
  activePersonaId.value = p.id
  if (p.mode === 'wealthTracker') {
    navigateTo('/app/snapshot')
  }
}

// FX rates for non-IDR currency conversion
const fx = useFxRates()
watchEffect(() => {
  const fxRates: FxRatesMap = { USD: null, SGD: null, EUR: null, JPY: null, KRW: null }
  for (const row of fx.data.value?.rates ?? []) {
    const base = row.pair.replace(/IDR$/, '') as Exclude<Currency, 'IDR'>
    fxRates[base] = row.rate
  }
  derived.setPrices({
    goldDigitalIdrPerGram: null,
    goldAntam1gIdr: null,
    goldSource: null,
    fxRates,
    idxByTicker: {},
    cryptoByCoinId: {},
  } satisfies PricesView)
})

const hasData = computed(() =>
  isSnapshotDirty({
    isDemo: snap.isDemo,
    goalsCount: 0,
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

type BudgetTabId = 'cash-flow' | 'kas' | 'utang' | 'ringkasan'

const TABS = [
  { id: 'cash-flow' as const, label: 'Cash Flow', icon: ArrowLeftRight },
  { id: 'kas' as const, label: 'Kas', icon: PiggyBank },
  { id: 'utang' as const, label: 'Utang', icon: CreditCard },
  { id: 'ringkasan' as const, label: 'Ringkasan', icon: LayoutDashboard },
] satisfies ReadonlyArray<{ id: BudgetTabId; label: string; icon: unknown }>

const activeTabId = ref<BudgetTabId>('cash-flow')
const activeIndex = computed(() => TABS.findIndex((tab) => tab.id === activeTabId.value))
const isFirstTab = computed(() => activeIndex.value === 0)
const isLastTab = computed(() => activeIndex.value === TABS.length - 1)

function goToTab(id: BudgetTabId) {
  activeTabId.value = id
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goNext() {
  if (isLastTab.value) {
    // Migrate biayaKos → pengeluaranLain row before leaving budget-kos
    const kosAmount = snap.pengeluaran.biayaKos ?? 0
    const kosCurrency = snap.pengeluaran.biayaKosCurrency ?? 'IDR'
    if (kosAmount > 0) {
      snap.addPengeluaranLain({ label: 'Biaya Kos', amount: kosAmount, currency: kosCurrency })
      snap.setPengeluaran({ biayaKos: 0, biayaKosCurrency: 'IDR' })
    }
    // Switch to wealthTracker mode
    snap.mode = 'wealthTracker'
    router.push('/app/snapshot')
    return
  }
  goToTab(TABS[activeIndex.value + 1]!.id)
}

function goPrev() {
  if (isFirstTab.value) return
  goToTab(TABS[activeIndex.value - 1]!.id)
}

const nextCtaLabel = computed(() => {
  if (activeTabId.value === 'ringkasan') return 'Lanjut ke Wealth Tracker'
  if (activeTabId.value === 'utang') return 'Simpan & Lihat Hasil'
  return 'Simpan & Lanjutkan'
})

function sumRows(rows: { amount?: number; currency?: string }[] | undefined): number {
  if (!rows) return 0
  const fx = derived.priceView?.fxRates
  return rows.reduce((sum, row) => sum + rowToIdr(row as import('~/lib/types/snapshot').AssetRow, fx), 0)
}

const penghasilanTotal = computed(() => derived.penghasilanMonthlyIdr)

const snapState = computed(() => ({
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

const pengeluaranTotal = computed(() =>
  calcTotalPengeluaran(snapState.value, derived.priceView ?? undefined),
)
const kasTotal = computed(() => sumRows(snap.asetLikuid.kas))
const cicilanAktifTotal = computed(() =>
  snap.cicilanAktif.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)
const utangPribadiTotal = computed(() =>
  snap.utangPribadi.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)

// ----- Ringkasan: persona + gamification -----
const personaState = computed(() => ({
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

const persona = computed(() =>
  resolvePersona({
    savingsRate: derived.savingsRate,
    runway: derived.runway,
    hasInvestments: hasInvestments(personaState.value),
    isSnapshotReady: isSnapshotReady(personaState.value),
  }),
)

const personaStyle = computed(() => persona.value ? PERSONA_VISUALS[persona.value.key] : null)
const shareOpen = ref(false)
const showStats = ref(false)
const shareText = computed(() => {
  if (!persona.value) return ''
  const label = t(`persona.${persona.value.key}.label` as import('~/lib/copy/strings').CopyKey)
  const deepLink = `${getAppUrl()}?from=share&persona=${persona.value.key}`
  return `Aku ${label}! ✨ Cek keuanganmu juga di Cermat × Mamikos!\n${deepLink}`
})
const downloadName = computed(() => `cermat-${persona.value?.key ?? 'share'}.png`)

const surplusAmt = computed(() => derived.surplusIdr)
const surplusPct = computed(() =>
  penghasilanTotal.value > 0 ? Math.round((surplusAmt.value / penghasilanTotal.value) * 100) : 0,
)

const cicilanMonthly = computed(() =>
  snap.cicilanAktif.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0),
)
const totalUtang = computed(() => cicilanAktifTotal.value + utangPribadiTotal.value)

// ----- Ringkasan: click-to-toggle info tips -----
const explainer = useMetricExplainer()

// ----- CTA Mamikos: dynamic price range from biayaKos -----
const mamikosSearchUrl = computed(() => {
  const kos = snap.pengeluaran.biayaKos ?? 0
  const base = 'https://mamikos.com/cari?suggestion_type=location&rent=2&sort=price,-&singgahsini=0'
  if (kos <= 0) return `${base}&price=10000-20000000`
  const min = Math.round(kos * 0.75)
  const max = Math.round(kos * 1.25)
  return `${base}&price=${min}-${max}`
})
const mamikosSearchLabel = computed(() => {
  const kos = snap.pengeluaran.biayaKos ?? 0
  if (kos <= 0) return 'Budget udah fix? Cari kos yang pas langsung di Mamikos.'
  return `${idr(Math.round(kos * 0.75))}–${idr(Math.round(kos * 1.25))}/bulan — ada kos bagus di range ini, lho.`
})
const rentRatio = computed(() => derived.rentToIncomeRatio)
const rentRatioZone = computed(() => {
  const r = rentRatio.value
  if (r === null) return null
  if (r <= 25) return 'safe'
  if (r <= 35) return 'warning'
  return 'danger'
})
const rentRatioMsg = computed(() => {
  const zone = rentRatioZone.value
  if (!zone) return ''
  const pct = Math.round(rentRatio.value!)
  return t(`budgetKos.biayaKos.ratio.${zone}` as keyof typeof import('~/lib/copy/strings').copy, { pct })
})
const rentRecommend = computed(() => {
  const income = penghasilanTotal.value
  if (income <= 0) return ''
  const min = idr(Math.round(income * 0.25))
  const max = idr(Math.round(income * 0.3))
  return t('budgetKos.biayaKos.ratio.recommend' as keyof typeof import('~/lib/copy/strings').copy, { min, max })
})

// ----- Item A: kos-to-surplus action bridge -----
const recommendedMidKos = computed(() => Math.round(penghasilanTotal.value * 0.275))
const surplusIfRecommendedKos = computed(() => {
  const currentKos = snap.pengeluaran.biayaKos ?? 0
  if (currentKos <= 0 || penghasilanTotal.value <= 0) return null
  return surplusAmt.value + (currentKos - recommendedMidKos.value)
})

// ----- Item B: mini savings projection -----
const savingsProjection = computed(() => {
  const surplus = surplusAmt.value
  const kas = kasTotal.value
  const expense = pengeluaranTotal.value
  if (penghasilanTotal.value <= 0) return null
  if (surplus > 0) {
    const target = expense * 3
    const gap = Math.max(0, target - kas)
    if (gap <= 0) return { type: 'achieved' as const, message: 'Dana darurat 3 bulan sudah terkumpul!' }
    const months = Math.ceil(gap / surplus)
    if (months > 24) return { type: 'thin' as const, message: 'Surplus masih tipis — fokus naikin dulu sebelum mikir target.' }
    return { type: 'onTrack' as const, months, fv: kas + surplus * months }
  }
  if (surplus === 0) return { type: 'zero' as const, message: 'Target pertama: bikin surplus positif dulu.' }
  // surplus < 0
  if (kas <= 0) return { type: 'deficit' as const, message: 'Surplus minus — utang bisa membesar tiap bulan.' }
  const monthsUntilBroke = Math.ceil(kas / Math.abs(surplus))
  return { type: 'deficit' as const, months: monthsUntilBroke }
})

// ----- Item C: mini cashflow bar -----
const cashflowSegments = computed(() => {
  const income = penghasilanTotal.value
  if (income <= 0) return []
  const kos = snap.pengeluaran.biayaKos ?? 0
  const pokok = snap.pengeluaran.pokok ?? 0
  const lifestyle = snap.pengeluaran.lifestyle ?? 0
  const cicilan = cicilanMonthly.value
  const sisa = surplusAmt.value
  return [
    { label: 'Kos', amount: kos, color: 'bg-blue-400' },
    { label: 'Pokok', amount: pokok, color: 'bg-emerald-500' },
    { label: 'Lifestyle', amount: lifestyle, color: 'bg-amber-400' },
    { label: 'Cicilan', amount: cicilan, color: 'bg-rose-400' },
    { label: 'Sisa', amount: Math.abs(sisa), color: sisa >= 0 ? 'bg-green-500' : 'bg-red-400' },
  ].filter(s => s.amount > 0)
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-5 px-4 pb-8 pt-4 sm:px-6">
    <h1 class="sr-only">Cek Tipe Anak Kos Kamu</h1>

    <!-- Demo banner + persona picker -->
    <div
      v-if="snap.isDemo"
      class="rounded-[var(--radius-card)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-3 py-2.5 text-[12px] leading-5 text-[var(--color-text-secondary)] sm:px-4 sm:py-3 sm:text-sm sm:leading-6"
    >
      <div class="flex items-start gap-2 sm:gap-3">
        <Info class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary)] sm:h-4 sm:w-4" />
        <p class="min-w-0 flex-1 max-w-[24ch] sm:max-w-none">{{ t('snapshot.demo.banner') }}</p>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] sm:px-3 sm:text-xs"
          @click="resetDemo"
        >
          <X class="h-3 w-3" />
          {{ t('snapshot.demo.reset') }}
        </button>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="p in budgetKosPersonas"
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
      v-if="hasData"
      class="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-warning-amber)]/30 bg-[var(--color-warning-amber)]/5 px-4 py-2.5 text-sm text-[var(--color-text-secondary)]"
    >
      <Info class="h-4 w-4 shrink-0 text-[var(--color-warning-amber)]" />
      <span>{{ t('snapshot.unsaved.banner') }}</span>
    </div>

    <!-- Tab bar — same component as Wealth Tracker -->
    <SnapshotTabBar
      :tabs="TABS"
      :active-id="activeTabId"
      @update:active-id="(id: string) => goToTab(id as BudgetTabId)"
    />

    <!-- Cash Flow tab -->
    <div
      v-show="activeTabId === 'cash-flow'"
      class="space-y-5 rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--color-primary)]/5 via-[var(--color-surface-card)] to-[var(--color-surface-card)] p-4 sm:p-6"
    >
      <header>
        <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Catat Cash Flow Bulanan
        </h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          Pendapatan dan pengeluaran rutin per bulan — fondasi buat tau tipe anak kos kamu.
        </p>
      </header>
      <div class="space-y-3">
        <CollapsiblePanel
          title="Penghasilan"
          subtitle="Gaji + sampingan per bulan"
          :icon="TrendingUp"
          variant="emerald"
          :value="penghasilanTotal"
        >
          <PenghasilanForm hide-header />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Pengeluaran"
          subtitle="Biaya kos, makan, transport, dll"
          :icon="ShoppingCart"
          variant="rose"
          :value="pengeluaranTotal"
        >
          <PengeluaranForm hide-header show-biaya-kos />
        </CollapsiblePanel>
      </div>
    </div>

    <!-- Kas tab -->
    <div v-show="activeTabId === 'kas'" class="space-y-3">
      <CollapsiblePanel
        title="Kas & Tabungan"
        subtitle="Saldo rekening, dana darurat, tabungan"
        :icon="Wallet"
        variant="emerald"
        :value="kasTotal"
      >
        <AsetLikuidPanel :categories="['kas']" hide-header />
      </CollapsiblePanel>
    </div>

    <!-- Utang tab -->
    <div
      v-show="activeTabId === 'utang'"
      class="space-y-5 rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--color-danger-rose)]/5 via-[var(--color-surface-card)] to-[var(--color-surface-card)] p-4 sm:p-6"
    >
      <header>
        <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Cek Beban Utang
        </h2>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          Cicilan paylater, pinjol, utang ke teman — biar tau posisi keuangan kamu.
        </p>
      </header>
      <div class="space-y-3">
        <CollapsiblePanel
          title="Cicilan Aktif"
          subtitle="Paylater, kartu kredit, pinjol, KTA"
          :icon="CreditCard"
          variant="rose"
          :value="cicilanAktifTotal"
        >
          <CicilanAktifPanel hide-header />
        </CollapsiblePanel>
        <CollapsiblePanel
          title="Utang Pribadi"
          subtitle="Pinjaman ke keluarga / teman"
          :icon="Wallet"
          variant="rose"
          :value="utangPribadiTotal"
        >
          <UtangPribadiPanel hide-header />
        </CollapsiblePanel>
      </div>
    </div>

    <!-- Ringkasan tab — gamification first -->
    <div v-if="activeTabId === 'ringkasan'" class="space-y-5">

      <!-- Persona hero card — full gradient background -->
      <div
        v-if="persona && personaStyle"
        class="relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-center shadow-xl"
        :class="personaStyle.gradient"
      >
        <!-- Decorative circles -->
        <div class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div class="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
        <!-- Share button -->
        <button
          type="button"
          class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
          aria-label="Bagikan kartu"
          @click="shareOpen = true"
        >
          <Share2 :size="16" />
        </button>
        <!-- Content -->
        <span class="text-6xl drop-shadow-lg">{{ personaStyle.emoji }}</span>
        <h3 class="mt-3 text-3xl font-black tracking-tight text-white drop-shadow-md">
          {{ t(`persona.${persona.key}.label` as import('~/lib/copy/strings').CopyKey) }}
        </h3>
        <p class="mt-1.5 text-base font-medium text-white/90">
          {{ t(`persona.${persona.key}.tagline` as import('~/lib/copy/strings').CopyKey) }}
        </p>
        <div class="mt-5 flex justify-center gap-3">
          <div class="relative rounded-xl bg-white/20 px-4 py-2.5 backdrop-blur-sm">
            <div class="flex items-center gap-1">
              <p class="text-[11px] font-bold uppercase tracking-wide text-white/80">Sisa Uang/Bulan</p>
              <button type="button" class="text-white/60 hover:text-white" @click="explainer.open('savingsRate')">
                <Info :size="13" />
              </button>
            </div>
            <p class="text-xl font-black text-white">
              {{ derived.savingsRate != null ? `${Math.round(derived.savingsRate)}%` : '—' }}
            </p>
          </div>
          <div class="relative rounded-xl bg-white/20 px-4 py-2.5 backdrop-blur-sm">
            <div class="flex items-center gap-1">
              <p class="text-[11px] font-bold uppercase tracking-wide text-white/80">Bisa Bertahan</p>
              <button type="button" class="text-white/60 hover:text-white" @click="explainer.open('runway')">
                <Info :size="13" />
              </button>
            </div>
            <p class="text-xl font-black text-white">
              {{ derived.runway != null ? `${Math.round(derived.runway)} bln` : '—' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Share dialog for budget-kos persona -->
      <ShareDialog
        v-if="persona"
        :open="shareOpen"
        :share-text="shareText"
        :download-name="downloadName"
        @close="shareOpen = false"
      >
        <PersonaShareCard
          :persona-key="persona.key"
          :savings-rate="derived.savingsRate"
          :runway="derived.runway"
          :show-stats="showStats"
        />
        <template #controls>
          <div class="text-center">
            <button
              type="button"
              class="text-[11px] font-medium text-[var(--color-text-muted)] underline decoration-current/40 hover:text-[var(--color-text-secondary)]"
              @click="showStats = !showStats"
            >
              {{ showStats ? t('share.toggleStatsOff') : t('share.toggleStats') }}
            </button>
          </div>
        </template>
      </ShareDialog>

      <!-- No-data state -->
      <div
        v-else
        class="rounded-2xl border-2 border-dashed border-[var(--color-border)] p-8 text-center"
      >
        <LayoutDashboard class="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
        <h3 class="mt-3 text-lg font-semibold text-[var(--color-text-primary)]">
          Isi data dulu yuk!
        </h3>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          Balik ke tab Cash Flow, isi penghasilan &amp; pengeluaran — persona kamu langsung muncul.
        </p>
      </div>

      <!-- Surplus hero -->
      <div
        v-if="penghasilanTotal > 0"
        class="rounded-2xl border-2 p-5"
        :class="surplusAmt >= 0
          ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50'
          : 'border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50'"
      >
        <div class="flex items-center gap-1.5">
          <p class="text-xs font-bold uppercase tracking-widest" :class="surplusAmt >= 0 ? 'text-emerald-600' : 'text-rose-600'">
            Surplus Bulanan
          </p>
          <button type="button" class="text-emerald-400 hover:text-emerald-600" @click="explainer.open('surplusBulanan')">
            <Info :size="13" />
          </button>
        </div>
        <p class="mt-1 text-3xl font-extrabold tabular-nums" :class="surplusAmt >= 0 ? 'text-emerald-700' : 'text-rose-700'">
          {{ surplusAmt >= 0 ? '+' : '' }}{{ idr(surplusAmt) }}
        </p>
        <div class="mt-2 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
          <span>{{ surplusPct }}% dari penghasilan</span>
          <span class="text-[var(--color-text-muted)]">·</span>
          <span>Penghasilan {{ idr(penghasilanTotal) }}</span>
          <span class="text-[var(--color-text-muted)]">·</span>
          <span>Pengeluaran {{ idr(pengeluaranTotal) }}</span>
        </div>
      </div>

      <!-- Item C: Mini cashflow bar -->
      <div v-if="cashflowSegments.length > 0" class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
        <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Cashflow Bulanan</p>
        <div class="flex h-6 overflow-hidden rounded-full">
          <div
            v-for="seg in cashflowSegments"
            :key="seg.label"
            :class="seg.color"
            class="flex items-center justify-center transition-all duration-500"
            :style="{ width: `${(seg.amount / penghasilanTotal) * 100}%` }"
          >
            <span v-if="(seg.amount / penghasilanTotal) * 100 > 12" class="text-[9px] font-bold text-white drop-shadow-sm">{{ Math.round((seg.amount / penghasilanTotal) * 100) }}%</span>
          </div>
        </div>
        <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--color-text-secondary)]">
          <span v-for="seg in cashflowSegments" :key="seg.label" class="flex items-center gap-1">
            <span class="inline-block h-2 w-2 rounded-full" :class="seg.color" />
            {{ seg.label }} {{ idr(seg.amount) }}
          </span>
        </div>
      </div>

      <!-- Item B: Mini savings projection -->
      <div v-if="savingsProjection" class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4">
        <template v-if="savingsProjection.type === 'onTrack'">
          <p class="text-sm text-[var(--color-text-primary)]">
            💰 Konsisten nabung surplus → <strong class="text-emerald-600">{{ savingsProjection.months }} bulan</strong> lagi kekumpul dana darurat 3 bulan.
          </p>
        </template>
        <template v-else-if="savingsProjection.type === 'achieved'">
          <p class="text-sm font-medium text-emerald-600">✅ {{ savingsProjection.message }}</p>
        </template>
        <template v-else-if="savingsProjection.type === 'zero'">
          <p class="text-sm text-[var(--color-text-secondary)]">🎯 {{ savingsProjection.message }}</p>
        </template>
        <template v-else-if="savingsProjection.type === 'thin'">
          <p class="text-sm text-[var(--color-text-secondary)]">🎯 {{ savingsProjection.message }}</p>
        </template>
        <template v-else-if="savingsProjection.type === 'deficit' && savingsProjection.months">
          <p class="text-sm text-rose-600">
            ⚠️ Tabungan habis dalam ~{{ savingsProjection.months }} bulan kalau tetap defisit.
          </p>
        </template>
        <template v-else>
          <p class="text-sm text-rose-600">⚠️ {{ savingsProjection.message }}</p>
        </template>
      </div>

      <!-- Rent-to-income insight card -->
      <div
        v-if="rentRatio !== null && (snap.pengeluaran.biayaKos ?? 0) > 0"
        class="rounded-2xl border-2 p-5"
        :class="{
          'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50': rentRatioZone === 'safe',
          'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50': rentRatioZone === 'warning',
          'border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50': rentRatioZone === 'danger',
        }"
      >
        <div class="flex items-center gap-2">
          <Home class="h-4 w-4" :class="{
            'text-emerald-600': rentRatioZone === 'safe',
            'text-amber-600': rentRatioZone === 'warning',
            'text-rose-600': rentRatioZone === 'danger',
          }" />
          <p class="text-xs font-bold uppercase tracking-widest" :class="{
            'text-emerald-600': rentRatioZone === 'safe',
            'text-amber-600': rentRatioZone === 'warning',
            'text-rose-600': rentRatioZone === 'danger',
          }">
            {{ t('budgetKos.biayaKos.ratio.label') }}
          </p>
          <button type="button" class="text-emerald-400 hover:text-emerald-600" @click="explainer.open('rentToIncome')">
            <Info :size="13" />
          </button>
        </div>
        <p class="mt-2 text-3xl font-extrabold tabular-nums" :class="{
          'text-emerald-700': rentRatioZone === 'safe',
          'text-amber-700': rentRatioZone === 'warning',
          'text-rose-700': rentRatioZone === 'danger',
        }">
          {{ Math.round(rentRatio!) }}%
        </p>
        <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
          {{ rentRatioMsg }}
        </p>
        <div class="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
          <span>Biaya kos {{ idr(snap.pengeluaran.biayaKos || 0) }}</span>
          <span class="text-[var(--color-text-muted)]">·</span>
          <span>Penghasilan {{ idr(penghasilanTotal) }}</span>
        </div>
        <p v-if="rentRatioZone !== 'safe'" class="mt-2 text-xs font-medium" :class="{
          'text-amber-600': rentRatioZone === 'warning',
          'text-rose-600': rentRatioZone === 'danger',
        }">
          {{ rentRecommend }}
        </p>
        <!-- Item A: kos-to-surplus action bridge -->
        <div
          v-if="surplusIfRecommendedKos !== null && surplusIfRecommendedKos > surplusAmt && rentRatioZone !== 'safe'"
          class="mt-2.5 rounded-xl bg-[#EAF3DE] px-3 py-3 text-[#173404] shadow-sm dark:bg-emerald-950/30 dark:text-emerald-50"
        >
          <div class="flex items-start gap-3 border-l-4 border-[#7AA63A] pl-3">
            <span class="mt-0.5 shrink-0 text-sm text-[#27500A]">↗</span>
            <div class="min-w-0">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-[#27500A] dark:text-emerald-300">
                Dampak kalau pindah kos
              </p>
              <p class="mt-1 text-[13px] font-semibold leading-5 text-[#173404] dark:text-emerald-50">
                Kalau pindah ke kos {{ idr(recommendedMidKos) }}, surplus naik ke ~{{ idr(surplusIfRecommendedKos) }}/bulan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Mamikos — dynamic price range based on biayaKos -->
      <a
        :href="mamikosSearchUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-center gap-3 rounded-xl border border-l-4 border-[var(--color-border)] border-l-emerald-500 bg-[var(--color-surface-card)] p-4 transition-shadow hover:shadow-md"
      >
        <span class="text-2xl">🏢</span>
        <div class="min-w-0 flex-1">
          <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">
            Cari Kos Sesuai Budgetmu
          </h4>
          <p class="text-xs text-[var(--color-text-secondary)]">
            {{ mamikosSearchLabel }}
          </p>
        </div>
        <ExternalLink :size="14" class="shrink-0 text-emerald-600 group-hover:underline" />
      </a>

      <!-- Budget health grid -->
      <div v-if="kasTotal > 0 || totalUtang > 0" class="grid gap-3 sm:grid-cols-2">
        <!-- Kas card -->
        <div class="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div class="flex items-center gap-2">
            <Wallet class="h-4 w-4 text-emerald-600" />
            <p class="text-xs font-bold uppercase tracking-wide text-emerald-600">Kas & Tabungan</p>
          </div>
          <p class="mt-2 text-2xl font-extrabold tabular-nums text-emerald-700">{{ idr(kasTotal) }}</p>
          <p class="mt-0.5 text-xs text-emerald-600/70">Dana yang bisa diakses sekarang</p>
        </div>
        <!-- Utang card -->
        <div class="rounded-xl border border-rose-200 bg-rose-50/80 p-4">
          <div class="flex items-center gap-2">
            <CreditCard class="h-4 w-4 text-rose-600" />
            <p class="text-xs font-bold uppercase tracking-wide text-rose-600">Total Utang</p>
          </div>
          <p class="mt-2 text-2xl font-extrabold tabular-nums text-rose-700">{{ idr(totalUtang) }}</p>
          <p class="mt-0.5 text-xs text-rose-600/70">
            Cicilan/bln {{ idr(cicilanMonthly) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation footer -->
    <div class="rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-4 sm:p-3">
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
        <span>Data disimpan lokal di browser kamu, tidak dikirim ke server.</span>
      </p>
    </div>
  </div>
</template>
