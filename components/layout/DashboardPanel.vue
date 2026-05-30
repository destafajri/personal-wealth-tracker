<script setup lang="ts">
// All-empty contract (tech-design Screen 10 / design-guidelines): hero pair + the
// 6-card metric grid always render; per-metric "—" + hint copy handles the empty UX
// via MetricCard. No separate "blank dashboard" placeholder card — that's the path
// the round-4/round-5 Codex review flagged as drift from spec.
import HeroPair from '~/components/dashboard/HeroPair.vue'
import MetricGrid from '~/components/dashboard/MetricGrid.vue'
</script>

<template>
  <section class="flex flex-col gap-4 p-2">
    <HeroPair />
    <MetricGrid />
  </section>
</template>
