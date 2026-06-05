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
import { triggerBudgetKosDemo } from '~/lib/fixtures/demoSnapshot'
import { useFxRates } from '~/composables/usePrices'
import type { Currency, FxRatesMap, PricesView } from '~/lib/types/snapshot'
import {
  resolvePersona,
  hasInvestments,
  isSnapshotReady,
  type PersonaKey,
} from '~/lib/finance/persona'

definePageMeta({ layout: 'default', ssr: false })
useSeoMeta({ title: `Cek Tipe Anak Kos Kamu — ${t('brand.name')}` })

const snap = useSnapshotStore()
const derived = useDerivedStore()
const route = useRoute()
const router = useRouter()

// Force budgetKos mode
onMounted(() => {
  snap.mode = 'budgetKos'
  triggerBudgetKosDemo(snap, route, router)
})

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
  return rows.reduce((sum, row) => sum + (row.amount || 0), 0)
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

const PERSONA_STYLE: Record<PersonaKey, { gradient: string; emoji: string; bg: string }> = {
  sultanKos: { gradient: 'from-amber-400 via-yellow-400 to-orange-400', emoji: '\u{1F451}', bg: 'bg-amber-50' },
  investorKos: { gradient: 'from-emerald-400 via-teal-400 to-cyan-400', emoji: '\u{1F4C8}', bg: 'bg-emerald-50' },
  anakKosBijak: { gradient: 'from-blue-400 via-indigo-400 to-violet-400', emoji: '\u{1F44D}', bg: 'bg-blue-50' },
  pejuangAkhirBulan: { gradient: 'from-rose-400 via-pink-400 to-fuchsia-400', emoji: '\u{1F525}', bg: 'bg-rose-50' },
  sobatIndomie: { gradient: 'from-orange-400 via-amber-400 to-yellow-400', emoji: '\u{1F35C}', bg: 'bg-orange-50' },
}

const personaStyle = computed(() => persona.value ? PERSONA_STYLE[persona.value.key] : null)

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
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-5 px-4 pb-8 pt-4 sm:px-6">
    <h1 class="sr-only">Cek Tipe Anak Kos Kamu</h1>

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
      </div>

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
