<script setup lang="ts">
import { ArrowRight, ChevronRight, CloudOff, FileText, Lock, PieChart, Play } from 'lucide-vue-next'
import { ref } from 'vue'
import Badge from '~/components/common/Badge.vue'
import ButtonCTA from '~/components/common/ButtonCTA.vue'
import IconChip from '~/components/common/IconChip.vue'
import { t } from '~/lib/copy/strings'
import { useSnapshotStore } from '~/stores/snapshot'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: `${t('brand.name')} × Mamikos — ${t('brand.tagline')}`,
  description: `${t('landing.hero.subtitle')} ${t('landing.hero.trust')}`,
})

const snap = useSnapshotStore()
const showModal = ref(false)
const modalTitle = ref('')
const pendingMode = ref<'budgetKos' | 'wealthTracker'>('budgetKos')

const modalRoute = computed(() =>
  pendingMode.value === 'budgetKos' ? '/app/budget-kos' : '/app/snapshot',
)

function openModal(title: string, mode: 'budgetKos' | 'wealthTracker') {
  modalTitle.value = title
  pendingMode.value = mode
  showModal.value = true
}

function startFresh() {
  snap.reset()
  snap.mode = pendingMode.value
}

function budgetKosDemo() {
  snap.mode = pendingMode.value
}
</script>

<template>
  <section class="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
    <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
      Cermat
    </p>

    <h1
      class="text-balance text-4xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl"
    >
      {{ t('landing.hero.titlePrefix') }}
      <span class="text-[var(--color-primary)]">{{ t('landing.hero.titleWord1') }}</span>
      {{ t('landing.hero.titleWord2') }}
      <span class="text-[var(--color-primary)]">{{ t('landing.hero.titleWord3') }}</span>
    </h1>

    <p class="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-[var(--color-text-secondary)]">
      {{ t('landing.hero.subtitle') }}
    </p>

    <!-- Trust pills — moved closer to CTA for better conversion -->
    <div class="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-3">
      <Badge size="md">
        <template #icon><Lock class="h-3.5 w-3.5" /></template>
        {{ t('landing.trust.pill.noRegister') }}
      </Badge>
      <Badge size="md">
        <template #icon><CloudOff class="h-3.5 w-3.5" /></template>
        {{ t('landing.trust.pill.noCloud') }}
      </Badge>
    </div>

    <!-- Two entry-point cards — both trigger the fresh/demo modal -->
    <div class="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
      <button
        type="button"
        class="group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 text-left shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]"
        @click="openModal(t('landing.cta.snapshot.label'), 'budgetKos')"
      >
        <div
          class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"
        />
        <div class="flex items-start gap-3">
          <span class="text-3xl">🏠</span>
          <div>
            <h2 class="text-lg font-bold text-[var(--color-text-primary)]">
              {{ t('landing.cta.snapshot.label') }}
            </h2>
            <p class="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {{ t('landing.cta.snapshot.body') }}
            </p>
          </div>
        </div>
        <span class="mt-auto flex w-full items-center justify-center gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-all group-hover:shadow-[var(--shadow-md)]">
          {{ t('landing.cta.snapshot.action') }}
          <ChevronRight class="h-4 w-4" />
        </span>
      </button>

      <button
        type="button"
        class="group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 text-left shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]"
        @click="openModal(t('landing.cta.demo.label'), 'wealthTracker')"
      >
        <div
          class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"
        />
        <div class="flex items-start gap-3">
          <span class="text-3xl">📊</span>
          <div>
            <h2 class="text-lg font-bold text-[var(--color-text-primary)]">
              {{ t('landing.cta.demo.label') }}
            </h2>
            <p class="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {{ t('landing.cta.demo.body') }}
            </p>
          </div>
        </div>
        <span class="mt-auto flex w-full items-center justify-center gap-2 rounded-[var(--radius-input)] border border-[var(--color-primary)] bg-[var(--color-accent-emerald-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-all group-hover:shadow-[var(--shadow-sm)]">
          {{ t('landing.cta.demo.action') }}
          <ArrowRight class="h-4 w-4" />
        </span>
      </button>
    </div>

    <!-- CTA Mamikos as horizontal collaboration banners -->
    <div class="mx-auto mt-6 max-w-3xl space-y-3">
      <a
        href="https://mamikos.com/cari?suggestion_type=location&rent=2&sort=price,-&price=10000-20000000&singgahsini=0"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-center gap-4 rounded-[var(--radius-card)] border border-emerald-200 bg-emerald-50 p-4 text-left transition-all hover:bg-emerald-100 hover:shadow-[var(--shadow-sm)]"
      >
        <span class="text-2xl">🏢</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-emerald-800">
            {{ t('cta.mamikos.landing.label') }}
          </p>
          <p class="mt-0.5 text-xs text-emerald-600">
            {{ t('cta.mamikos.landing.body') }}
          </p>
        </div>
        <span class="shrink-0 text-xs font-medium text-emerald-600 group-hover:underline">
          {{ t('cta.mamikos.action') }}
        </span>
      </a>

      <a
        href="https://mamikos.com/jual/cari?type=Rumah"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-center gap-4 rounded-[var(--radius-card)] border border-blue-200 bg-blue-50 p-4 text-left transition-all hover:bg-blue-100 hover:shadow-[var(--shadow-sm)]"
      >
        <span class="text-2xl">🏠</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-blue-800">
            {{ t('cta.mamikos.rumah.label') }}
          </p>
          <p class="mt-0.5 text-xs text-blue-600">
            {{ t('cta.mamikos.rumah.body') }}
          </p>
        </div>
        <span class="shrink-0 text-xs font-medium text-blue-600 group-hover:underline">
          {{ t('cta.mamikos.action') }}
        </span>
      </a>

      <a
        href="https://mamikos.com/jual/cari?type=Kost"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-center gap-4 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-4 text-left transition-all hover:bg-amber-100 hover:shadow-[var(--shadow-sm)]"
      >
        <span class="text-2xl">👑</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-amber-800">
            {{ t('cta.mamikos.invest.label') }}
          </p>
          <p class="mt-0.5 text-xs text-amber-600">
            {{ t('cta.mamikos.invest.body') }}
          </p>
        </div>
        <span class="shrink-0 text-xs font-medium text-amber-600 group-hover:underline">
          {{ t('cta.mamikos.action') }}
        </span>
      </a>
    </div>

    <!-- Modal: fresh or demo — NuxtLinks only, no navigateTo -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="showModal = false"
    >
      <div
        class="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-lg)]"
        role="dialog"
        aria-modal="true"
        :aria-label="modalTitle"
      >
        <h3 class="text-lg font-bold text-[var(--color-text-primary)]">
          {{ modalTitle }}
        </h3>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <NuxtLink
            :to="modalRoute"
            class="group flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 text-left transition-all hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)]"
            @click="startFresh"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">📝</span>
              <span class="text-sm font-semibold text-[var(--color-text-primary)]">
                {{ t('landing.modal.fresh.label') }}
              </span>
            </div>
            <p class="text-xs text-[var(--color-text-secondary)]">
              {{ t('landing.modal.fresh.body') }}
            </p>
            <ButtonCTA tag="span" size="md" block>
              {{ t('landing.modal.fresh.action') }}
              <ChevronRight class="h-3.5 w-3.5" />
            </ButtonCTA>
          </NuxtLink>

          <NuxtLink
            :to="`${modalRoute}?demo=1`"
            class="group flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 text-left transition-all hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)]"
            @click="budgetKosDemo"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">🎮</span>
              <span class="text-sm font-semibold text-[var(--color-text-primary)]">
                {{ t('landing.modal.demo.label') }}
              </span>
            </div>
            <p class="text-xs text-[var(--color-text-secondary)]">
              {{ t('landing.modal.demo.body') }}
            </p>
            <ButtonCTA tag="span" variant="outline" size="md" block>
              {{ t('landing.modal.demo.action') }}
              <ChevronRight class="h-3.5 w-3.5" />
            </ButtonCTA>
          </NuxtLink>
        </div>
        <button
          type="button"
          class="mt-4 w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          @click="showModal = false"
        >
          Batal
        </button>
      </div>
    </div>
  </section>
</template>
