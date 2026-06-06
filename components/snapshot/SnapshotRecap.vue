<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Banknote,
  BarChart3,
  Bitcoin,
  ChevronDown,
  Coins,
  CreditCard,
  Home,
  Landmark,
  LineChart,
  Lock,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-vue-next'
import IconChip from '~/components/common/IconChip.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'
import { rateToIdr } from '~/lib/finance/fx'
import {
  calcTotalPengeluaran,
  effectiveStockPrice,
  sumCryptoIdr,
  sumEmasIdr,
  sumSbnIdr,
  sumStockIdr,
} from '~/lib/finance/metrics'
import { EMAS_VALUATION } from '~/lib/finance/emas'
import type { Currency, SnapshotState } from '~/lib/types/snapshot'

// Read-only recap rendered in the Ringkasan tab — itemizes every row the user
// has entered so they can audit their snapshot before moving on to Plan.
// Numbers reuse the same helpers as DashboardSummary / metrics for parity.

const snap = useSnapshotStore()
const derived = useDerivedStore()

const SYMBOL: Record<Currency, string> = {
  IDR: 'Rp',
  USD: '$',
  SGD: 'S$',
  EUR: '€',
  JPY: '¥',
  KRW: '₩',
}

function rowIdr(row: { amount: number; currency?: Currency }): number {
  const amt = row.amount || 0
  const cur = row.currency ?? 'IDR'
  if (cur === 'IDR') return amt
  const rate = rateToIdr(cur, derived.priceView?.fxRates) ?? 0
  return amt * rate
}

function fmtMoney(amount: number, currency?: Currency): string {
  const cur = currency ?? 'IDR'
  if (cur === 'IDR') return idr(amount)
  const formatted = amount.toLocaleString('id-ID')
  const idrEq = rowIdr({ amount, currency: cur })
  return idrEq > 0 ? `${SYMBOL[cur]} ${formatted} (≈ ${idr(idrEq)})` : `${SYMBOL[cur]} ${formatted}`
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

// ----- Penghasilan -----
const penghasilanTotal = computed(() => derived.penghasilanMonthlyIdr)
const gajiHasValue = computed(() => snap.penghasilan.amount > 0)
const penghasilanLainRows = computed(() => snap.penghasilanLain)

// ----- Pengeluaran -----
const pengeluaranTotal = computed(() =>
  calcTotalPengeluaran(snapState.value, derived.priceView ?? undefined),
)
const totalCicilanMonthly = computed(() =>
  snap.cicilanAktif.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0),
)

// ----- Aset Likuid -----
const kasRows = computed(() => snap.asetLikuid.kas)
const kasTotal = computed(() =>
  kasRows.value.reduce((s, r) => s + rowIdr(r), 0),
)

// ----- Investasi Pasif -----
const depositoRows = computed(() => snap.asetLikuid.deposito)
const rdRows = computed(() => snap.asetLikuid.reksaDana)
const sbnRows = computed(() => snap.asetLikuid.sbn)
const investasiPasifTotal = computed(
  () =>
    depositoRows.value.reduce((s, r) => s + rowIdr(r), 0) +
    rdRows.value.reduce((s, r) => s + rowIdr(r), 0) +
    sumSbnIdr(snapState.value, derived.priceView ?? undefined),
)

// ----- Emas (5 kategori) -----
const antamRate = computed(() => derived.priceView?.goldAntam1gIdr ?? 0)
const digitalRate = computed(() => derived.priceView?.goldDigitalIdrPerGram ?? 0)

interface EmasRow {
  label: string
  gram: number
  ratePerGram: number
  value: number
}

const emasRows = computed<EmasRow[]>(() => {
  const antam = antamRate.value
  const digital = digitalRate.value
  return [
    {
      label: 'Digital (Pegadaian)',
      gram: snap.emas.digitalGram,
      ratePerGram: digital,
      value: snap.emas.digitalGram * digital,
    },
    {
      label: 'Fisik Antam',
      gram: snap.emas.fisikAntamGram,
      ratePerGram: antam * EMAS_VALUATION.fisikAntamSpread,
      value: snap.emas.fisikAntamGram * antam * EMAS_VALUATION.fisikAntamSpread,
    },
    {
      label: 'Perhiasan 18K',
      gram: snap.emas.perhiasan18KGram,
      ratePerGram: antam * EMAS_VALUATION.perhiasan18K,
      value: snap.emas.perhiasan18KGram * antam * EMAS_VALUATION.perhiasan18K,
    },
    {
      label: 'Perhiasan 14K',
      gram: snap.emas.perhiasan14KGram,
      ratePerGram: antam * EMAS_VALUATION.perhiasan14K,
      value: snap.emas.perhiasan14KGram * antam * EMAS_VALUATION.perhiasan14K,
    },
    {
      label: 'Perhiasan 10K',
      gram: snap.emas.perhiasan10KGram,
      ratePerGram: antam * EMAS_VALUATION.perhiasan10K,
      value: snap.emas.perhiasan10KGram * antam * EMAS_VALUATION.perhiasan10K,
    },
  ].filter((r) => r.gram > 0)
})
const emasTotal = computed(() =>
  sumEmasIdr(snapState.value, derived.priceView ?? undefined),
)

// ----- Investasi Pasar — Saham -----
const sahamRows = computed(() =>
  snap.saham
    .filter((s) => s.ticker)
    .map((s) => {
      const livePrice = derived.priceView?.idxByTicker?.[s.ticker] ?? null
      const price = effectiveStockPrice(s, livePrice)
      const value = s.lot * 100 * price
      return {
        ticker: s.ticker,
        lot: s.lot,
        price,
        value,
      }
    }),
)
const sahamTotal = computed(() =>
  sumStockIdr(snap.saham, derived.priceView ?? undefined),
)

// ----- Investasi Pasar — Crypto -----
interface CryptoRecapRow {
  id: string
  label: string
  detail: string
  value: number
}

const cryptoRows = computed<CryptoRecapRow[]>(() =>
  snap.crypto.map((c) => {
    if (c.mode === 'idr') {
      return {
        id: c.id,
        label: c.coinId || c.label || 'Crypto',
        detail: 'manual IDR',
        value: c.amount || 0,
      }
    }
    if (c.mode === 'usd') {
      const fx = derived.priceView?.fxRates?.USD ?? 0
      return {
        id: c.id,
        label: c.coinId || c.label || 'Crypto',
        detail: `$ ${(c.amount || 0).toLocaleString('id-ID')}`,
        value: (c.amount || 0) * fx,
      }
    }
    if (c.mode === 'krw') {
      const fx = derived.priceView?.fxRates?.KRW ?? 0
      return {
        id: c.id,
        label: c.coinId || c.label || 'Crypto',
        detail: `₩ ${(c.amount || 0).toLocaleString('id-ID')}`,
        value: (c.amount || 0) * fx,
      }
    }
    // unit mode
    const cid = (c.coinId || '').toLowerCase()
    const rate = derived.priceView?.cryptoByCoinId?.[cid]?.idr ?? 0
    const units = c.units || 0
    return {
      id: c.id,
      label: c.coinId || 'Crypto',
      detail: `${units} unit`,
      value: units * rate,
    }
  }),
)
const cryptoTotal = computed(() =>
  sumCryptoIdr(snap.crypto, derived.priceView ?? undefined),
)

// ----- Aset Non-Likuid -----
const propertiRows = computed(() => snap.asetNonLikuid.properti)
const kendaraanRows = computed(() => snap.asetNonLikuid.kendaraan)
const pensiunRows = computed(() => snap.asetNonLikuid.pensiun)
const asetTetapTotal = computed(
  () =>
    propertiRows.value.reduce((s, r) => s + rowIdr(r), 0) +
    kendaraanRows.value.reduce((s, r) => s + rowIdr(r), 0) +
    pensiunRows.value.reduce((s, r) => s + rowIdr(r), 0),
)

// ----- Cicilan Aktif -----
const cicilanRows = computed(() => snap.cicilanAktif)
const cicilanSisaTotal = computed(() =>
  snap.cicilanAktif.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)

// ----- Utang Pribadi -----
const utangPribadiRows = computed(() => snap.utangPribadi)
const utangPribadiTotal = computed(() =>
  snap.utangPribadi.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)

// ----- Gadai -----
const gadaiRows = computed(() => snap.gadai)
const gadaiTotal = computed(() =>
  snap.gadai.reduce((s, r) => s + (r.piutangIdr || 0), 0),
)

const hasAnyData = computed(
  () =>
    gajiHasValue.value ||
    penghasilanLainRows.value.length > 0 ||
    snap.pengeluaran.pokok > 0 ||
    snap.pengeluaran.lifestyle > 0 ||
    snap.pengeluaranLain.length > 0 ||
    kasRows.value.length > 0 ||
    depositoRows.value.length > 0 ||
    rdRows.value.length > 0 ||
    sbnRows.value.length > 0 ||
    emasRows.value.length > 0 ||
    sahamRows.value.length > 0 ||
    cryptoRows.value.length > 0 ||
    propertiRows.value.length > 0 ||
    kendaraanRows.value.length > 0 ||
    pensiunRows.value.length > 0 ||
    cicilanRows.value.length > 0 ||
    utangPribadiRows.value.length > 0 ||
    gadaiRows.value.length > 0,
)

// Collapsible sections — default closed so the page is compact
type SectionKey =
  | 'penghasilan'
  | 'pengeluaran'
  | 'kas'
  | 'investasi-pasif'
  | 'investasi-pasar'
  | 'aset-tetap'
  | 'cicilan'
  | 'utang-pribadi'
  | 'gadai'

const openSections = ref<Set<SectionKey>>(new Set())

function toggleSection(key: SectionKey) {
  const next = new Set(openSections.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  openSections.value = next
}

function isOpen(key: SectionKey) {
  return openSections.value.has(key)
}

const RD_JENIS_LABELS: Record<string, string> = {
  pasarUang: 'Pasar Uang',
  pendapatanTetap: 'Pendapatan Tetap',
  campuran: 'Campuran',
  saham: 'Saham',
  indeks: 'Indeks',
  lain: 'Lainnya',
}

function rdJenisLabel(jenis: string): string {
  return RD_JENIS_LABELS[jenis] ?? jenis
}

const CATEGORY_BADGE = 'inline-block rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide'
const AVATAR_BADGE = 'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold leading-none text-white'
</script>

<template>
  <section v-if="hasAnyData" class="space-y-3">
    <header>
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        Detail Snapshot
      </h3>
      <p class="text-xs text-[var(--color-text-secondary)]">
        Recap semua data yang sudah kamu input. Klik section untuk buka detail.
      </p>
    </header>

    <div class="grid items-start gap-3 overflow-hidden sm:grid-cols-2">
      <!-- ===== Penghasilan ===== -->
      <article
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('penghasilan')"
          :aria-expanded="isOpen('penghasilan')"
          aria-controls="section-penghasilan"
        >
          <IconChip variant="emerald" size="md">
            <TrendingUp :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">
              Penghasilan / bulan
            </h4>
          </div>
          <span class="shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ idr(penghasilanTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('penghasilan') && 'rotate-180'" />
        </button>
        <div id="section-penghasilan" v-show="isOpen('penghasilan')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li v-if="gajiHasValue" class="flex items-baseline justify-between gap-3 py-1.5">
              <span class="min-w-0 text-[var(--color-text-secondary)]">Gaji Bersih</span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ fmtMoney(snap.penghasilan.amount, snap.penghasilan.currency) }}
              </span>
            </li>
            <li
              v-for="row in penghasilanLainRows"
              :key="row.id"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate text-[var(--color-text-secondary)]">
                {{ row.label || 'Penghasilan lain' }}
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ fmtMoney(row.amount, row.currency) }}
              </span>
            </li>
            <li
              v-if="derived.dividendMonthly > 0"
              class="flex items-baseline justify-between gap-3 py-1.5 text-xs italic text-[var(--color-text-muted)]"
            >
              <span>Estimasi dividen saham (auto)</span>
              <span class="shrink-0 tabular-nums">{{ idr(derived.dividendMonthly) }}</span>
            </li>
            <li
              v-if="derived.bungaSbnMonthly > 0"
              class="flex items-baseline justify-between gap-3 py-1.5 text-xs italic text-[var(--color-text-muted)]"
            >
              <span>Estimasi bunga SBN (auto)</span>
              <span class="shrink-0 tabular-nums">{{ idr(derived.bungaSbnMonthly) }}</span>
            </li>
            <li
              v-if="derived.bungaDepositoMonthly > 0"
              class="flex items-baseline justify-between gap-3 py-1.5 text-xs italic text-[var(--color-text-muted)]"
            >
              <span>Estimasi bunga deposito (auto)</span>
              <span class="shrink-0 tabular-nums">{{ idr(derived.bungaDepositoMonthly) }}</span>
            </li>
          </ul>
        </div>
      </article>

      <!-- ===== Pengeluaran ===== -->
      <article
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('pengeluaran')"
          :aria-expanded="isOpen('pengeluaran')"
          aria-controls="section-pengeluaran"
        >
          <IconChip variant="rose" size="md">
            <ShoppingCart :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">
              Pengeluaran / bulan
            </h4>
          </div>
          <span class="shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ idr(pengeluaranTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('pengeluaran') && 'rotate-180'" />
        </button>
        <div id="section-pengeluaran" v-show="isOpen('pengeluaran')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li
              v-if="snap.pengeluaran.pokok > 0"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="text-[var(--color-text-secondary)]">Pokok</span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ fmtMoney(snap.pengeluaran.pokok, snap.pengeluaran.pokokCurrency) }}
              </span>
            </li>
            <li
              v-if="snap.pengeluaran.lifestyle > 0"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="text-[var(--color-text-secondary)]">Lifestyle</span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ fmtMoney(snap.pengeluaran.lifestyle, snap.pengeluaran.lifestyleCurrency) }}
              </span>
            </li>
            <li
              v-for="row in snap.pengeluaranLain"
              :key="row.id"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate text-[var(--color-text-secondary)]">
                {{ row.label || 'Pengeluaran lain' }}
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ fmtMoney(row.amount, row.currency) }}
              </span>
            </li>
            <li
              v-if="totalCicilanMonthly > 0"
              class="flex items-baseline justify-between gap-3 py-1.5 text-xs italic text-[var(--color-text-muted)]"
            >
              <span>Σ Cicilan aktif / bln (auto)</span>
              <span class="shrink-0 tabular-nums">{{ idr(totalCicilanMonthly) }}</span>
            </li>
          </ul>
        </div>
      </article>

      <!-- ===== Kas ===== -->
      <article
        v-if="kasRows.length > 0"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('kas')"
          :aria-expanded="isOpen('kas')"
          aria-controls="section-kas"
        >
          <IconChip variant="emerald" size="md">
            <Wallet :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Kas / Tabungan</h4>
          </div>
          <span class="shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ idr(kasTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('kas') && 'rotate-180'" />
        </button>
        <div id="section-kas" v-show="isOpen('kas')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li
              v-for="row in kasRows"
              :key="row.id"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate text-[var(--color-text-secondary)]">
                {{ row.label || 'Kas' }}
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ fmtMoney(row.amount, row.currency) }}
              </span>
            </li>
          </ul>
        </div>
      </article>

      <!-- ===== Investasi Pasif ===== -->
      <article
        v-if="depositoRows.length + rdRows.length + sbnRows.length + emasRows.length > 0"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('investasi-pasif')"
          :aria-expanded="isOpen('investasi-pasif')"
          aria-controls="section-investasi-pasif"
        >
          <IconChip variant="neutral" size="md">
            <Landmark :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Investasi Pasif</h4>
          </div>
          <span class="shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ idr(investasiPasifTotal + emasTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('investasi-pasif') && 'rotate-180'" />
        </button>
        <div id="section-investasi-pasif" v-show="isOpen('investasi-pasif')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li
              v-for="row in depositoRows"
              :key="row.id"
              class="space-y-0.5 py-1.5"
            >
              <div class="flex items-baseline justify-between gap-3">
                <span class="min-w-0 truncate">
                  <span :class="AVATAR_BADGE + ' bg-sky-500'">D</span>
                  <span class="ml-1.5 text-[var(--color-text-secondary)]">{{ row.label || 'Deposito' }}</span>
                </span>
                <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                  {{ fmtMoney(row.amount, row.currency) }}
                </span>
              </div>
              <p v-if="row.sukuBungaPercent" class="pl-[52px] text-[10px] text-[var(--color-text-muted)]">
                {{ row.sukuBungaPercent }}%/th
              </p>
            </li>
            <li
              v-for="row in rdRows"
              :key="row.id"
              class="space-y-0.5 py-1.5"
            >
              <div class="flex items-baseline justify-between gap-3">
                <span class="min-w-0 truncate">
                  <span :class="AVATAR_BADGE + ' bg-teal-500'">RD</span>
                  <span class="ml-1.5 text-[var(--color-text-secondary)]">{{ row.label || 'Reksa Dana' }}</span>
                </span>
                <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                  {{ fmtMoney(row.amount, row.currency) }}
                </span>
              </div>
              <p v-if="row.rdJenis" class="pl-[52px] text-[10px] text-[var(--color-text-muted)]">
                {{ rdJenisLabel(row.rdJenis) }}
              </p>
            </li>
            <li
              v-for="row in sbnRows"
              :key="row.id"
              class="space-y-0.5 py-1.5"
            >
              <div class="flex items-baseline justify-between gap-3">
                <span class="min-w-0 truncate">
                  <span :class="AVATAR_BADGE + ' bg-indigo-500'">SN</span>
                  <span class="ml-1.5 text-[var(--color-text-secondary)]">{{ row.label || 'SBN' }}</span>
                </span>
                <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                  {{ fmtMoney(row.amount, row.currency) }}
                </span>
              </div>
              <p v-if="row.sukuBungaPercent" class="pl-[52px] text-[10px] text-[var(--color-text-muted)]">
                {{ row.sukuBungaPercent }}%/th
              </p>
            </li>
            <li
              v-for="row in emasRows"
              :key="row.label"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate">
                <Coins :size="12" :stroke-width="2" class="-mt-0.5 mr-1 inline-block text-amber-500" />
                <span class="text-[var(--color-text-secondary)]">{{ row.label }}</span>
                <span class="ml-1 text-[10px] text-[var(--color-text-muted)]">
                  · {{ row.gram }}g
                </span>
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ idr(row.value) }}
              </span>
            </li>
          </ul>
        </div>
      </article>

      <!-- ===== Investasi Pasar ===== -->
      <article
        v-if="sahamRows.length + cryptoRows.length > 0"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('investasi-pasar')"
          :aria-expanded="isOpen('investasi-pasar')"
          aria-controls="section-investasi-pasar"
        >
          <IconChip variant="amber" size="md">
            <BarChart3 :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Investasi Pasar</h4>
          </div>
          <span class="shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ idr(sahamTotal + cryptoTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('investasi-pasar') && 'rotate-180'" />
        </button>
        <div id="section-investasi-pasar" v-show="isOpen('investasi-pasar')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li
              v-for="row in sahamRows"
              :key="row.ticker"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate">
                <LineChart :size="11" :stroke-width="1.75" class="-mt-0.5 mr-1 inline-block text-[var(--color-warning-amber)]" />
                <span class="font-medium text-[var(--color-text-primary)]">{{ row.ticker }}</span>
                <span class="ml-1 text-[10px] text-[var(--color-text-muted)]">
                  · {{ row.lot }} lot @ {{ idr(row.price) }}
                </span>
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ idr(row.value) }}
              </span>
            </li>
            <li
              v-for="row in cryptoRows"
              :key="row.id"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate">
                <Bitcoin :size="11" :stroke-width="1.75" class="-mt-0.5 mr-1 inline-block text-[var(--color-warning-amber)]" />
                <span class="font-medium uppercase text-[var(--color-text-primary)]">{{ row.label }}</span>
                <span class="ml-1 text-[10px] text-[var(--color-text-muted)]">
                  · {{ row.detail }}
                </span>
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ idr(row.value) }}
              </span>
            </li>
          </ul>
        </div>
      </article>

      <!-- ===== Aset Tetap ===== -->
      <article
        v-if="propertiRows.length + kendaraanRows.length + pensiunRows.length > 0"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('aset-tetap')"
          :aria-expanded="isOpen('aset-tetap')"
          aria-controls="section-aset-tetap"
        >
          <IconChip variant="neutral" size="md">
            <Home :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Aset Tetap</h4>
          </div>
          <span class="shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
            {{ idr(asetTetapTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('aset-tetap') && 'rotate-180'" />
        </button>
        <div id="section-aset-tetap" v-show="isOpen('aset-tetap')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li
              v-for="row in propertiRows"
              :key="row.id"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate">
                <span :class="CATEGORY_BADGE + ' bg-gray-100 text-[var(--color-text-secondary)]'">Properti</span>
                <span class="ml-1.5 text-[var(--color-text-secondary)]">{{ row.label || 'Properti' }}</span>
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ idr(row.amount || 0) }}
              </span>
            </li>
            <li
              v-for="row in kendaraanRows"
              :key="row.id"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate">
                <span :class="CATEGORY_BADGE + ' bg-gray-100 text-[var(--color-text-secondary)]'">Kendaraan</span>
                <span class="ml-1.5 text-[var(--color-text-secondary)]">{{ row.label || 'Kendaraan' }}</span>
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ idr(row.amount || 0) }}
              </span>
            </li>
            <li
              v-for="row in pensiunRows"
              :key="row.id"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate">
                <span :class="CATEGORY_BADGE + ' bg-gray-100 text-[var(--color-text-secondary)]'">Pensiun</span>
                <span class="ml-1.5 text-[var(--color-text-secondary)]">{{ row.label || 'Pensiun' }}</span>
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ idr(row.amount || 0) }}
              </span>
            </li>
          </ul>
        </div>
      </article>

      <!-- ===== Cicilan Aktif ===== -->
      <article
        v-if="cicilanRows.length > 0"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('cicilan')"
          :aria-expanded="isOpen('cicilan')"
          aria-controls="section-cicilan"
        >
          <IconChip variant="rose" size="md">
            <CreditCard :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Cicilan Aktif</h4>
          </div>
          <span class="min-w-0 break-all text-right text-sm font-semibold tabular-nums text-[var(--color-danger-rose)]">
            {{ idr(cicilanSisaTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('cicilan') && 'rotate-180'" />
        </button>
        <div id="section-cicilan" v-show="isOpen('cicilan')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li
              v-for="row in cicilanRows"
              :key="row.id"
              class="space-y-0.5 py-1.5"
            >
              <div class="flex items-baseline justify-between gap-3">
                <span class="min-w-0 truncate">
                  <span class="text-[10px] uppercase tracking-wide text-[var(--color-danger-rose)]">{{ row.tipe }}</span>
                  <span class="ml-1 text-[var(--color-text-secondary)]">{{ row.label || row.tipe }}</span>
                </span>
                <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                  {{ idr(row.sisaPokok || 0) }}
                </span>
              </div>
              <p class="text-[10px] text-[var(--color-text-muted)]">
                {{ idr(row.cicilanPerBulan || 0) }}/bln
                <template v-if="row.sukuBunga !== undefined && row.sukuBunga !== null">
                  · {{ row.sukuBunga }}%/th
                </template>
              </p>
            </li>
          </ul>
        </div>
      </article>

      <!-- ===== Utang Pribadi ===== -->
      <article
        v-if="utangPribadiRows.length > 0"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('utang-pribadi')"
          :aria-expanded="isOpen('utang-pribadi')"
          aria-controls="section-utang-pribadi"
        >
          <IconChip variant="rose" size="md">
            <Banknote :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Utang Pribadi</h4>
          </div>
          <span class="min-w-0 break-all text-right text-sm font-semibold tabular-nums text-[var(--color-danger-rose)]">
            {{ idr(utangPribadiTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('utang-pribadi') && 'rotate-180'" />
        </button>
        <div id="section-utang-pribadi" v-show="isOpen('utang-pribadi')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li
              v-for="row in utangPribadiRows"
              :key="row.id"
              class="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span class="min-w-0 truncate text-[var(--color-text-secondary)]">
                {{ row.label || 'Utang pribadi' }}
              </span>
              <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                {{ idr(row.sisaPokok || 0) }}
              </span>
            </li>
          </ul>
        </div>
      </article>

      <!-- ===== Gadai ===== -->
      <article
        v-if="gadaiRows.length > 0"
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 p-3 text-left"
          @click="toggleSection('gadai')"
          :aria-expanded="isOpen('gadai')"
          aria-controls="section-gadai"
        >
          <IconChip variant="rose" size="md">
            <Lock :size="14" :stroke-width="1.75" />
          </IconChip>
          <div class="min-w-0 flex-1">
            <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">Gadai</h4>
          </div>
          <span class="min-w-0 break-all text-right text-sm font-semibold tabular-nums text-[var(--color-danger-rose)]">
            {{ idr(gadaiTotal) }}
          </span>
          <ChevronDown :size="14" class="shrink-0 text-[var(--color-text-muted)] transition-transform" :class="isOpen('gadai') && 'rotate-180'" />
        </button>
        <div id="section-gadai" v-show="isOpen('gadai')" class="border-t border-[var(--color-border)] px-3 pb-3">
          <ul class="divide-y divide-[var(--color-border)] text-sm">
            <li
              v-for="row in gadaiRows"
              :key="row.id"
              class="space-y-0.5 py-1.5"
            >
              <div class="flex items-baseline justify-between gap-3">
                <span class="min-w-0 truncate text-[var(--color-text-secondary)]">
                  Jaminan: <span class="text-[var(--color-text-primary)]">{{ row.jaminan }}</span>
                </span>
                <span class="min-w-0 break-all text-right tabular-nums text-[var(--color-text-primary)]">
                  {{ idr(row.piutangIdr || 0) }}
                </span>
              </div>
              <p
                v-if="row.gramTertahan && row.jaminan.startsWith('emas:')"
                class="text-[10px] text-[var(--color-text-muted)]"
              >
                {{ row.gramTertahan }}g tertahan
              </p>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>
