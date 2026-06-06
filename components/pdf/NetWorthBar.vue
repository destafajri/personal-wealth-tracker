<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalAset: number
  totalUtang: number
  formatIdr: (v: number) => string
}>()

const maxVal = computed(() => Math.max(props.totalAset, props.totalUtang, 1))
const asetPct = computed(() => (props.totalAset / maxVal.value) * 100)
const utangPct = computed(() => (props.totalUtang / maxVal.value) * 100)
</script>

<template>
  <div style="width: 300px; height: 200px; padding: 8px; background: white; font-family: sans-serif;">
    <div style="display: flex; align-items: flex-end; justify-content: center; gap: 40px; height: 160px; padding-top: 24px;">
      <!-- Aset bar -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <span style="font-size: 11px; font-weight: 600; color: #059669; white-space: nowrap;">{{ formatIdr(totalAset) }}</span>
        <div
          :style="{
            width: '60px',
            height: Math.max(asetPct, 4) + '%',
            background: '#10b981',
            borderRadius: '4px 4px 0 0',
          }"
        />
        <span style="font-size: 10px; color: #666;">Aset</span>
      </div>
      <!-- Utang bar -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <span style="font-size: 11px; font-weight: 600; color: #e11d48; white-space: nowrap;">{{ formatIdr(totalUtang) }}</span>
        <div
          :style="{
            width: '60px',
            height: Math.max(utangPct, 4) + '%',
            background: '#f43f5e',
            borderRadius: '4px 4px 0 0',
          }"
        />
        <span style="font-size: 10px; color: #666;">Utang</span>
      </div>
    </div>
  </div>
</template>
