<template>
  <div class="glass rounded-2xl p-5">
    <h3 class="text-sm font-semibold mb-3">Ringkasan Budget</h3>
    <div class="flex items-center gap-4 mb-4">
      <div class="relative w-20 h-20">
        <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3"/>
          <circle cx="18" cy="18" r="15.915" fill="none" :stroke="progressColor" stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="`${percent}, 100`"
            class="transition-all duration-700"/>
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-sm font-bold" :class="percentClass">
          {{ percent }}%
        </span>
      </div>
      <div class="flex-1">
        <p class="text-xs text-muted">Total Budget</p>
        <p class="text-lg font-bold">{{ formatCurrency(totalBudget) }}</p>
        <p class="text-xs mt-1" :class="remaining >= 0 ? 'text-muted' : 'text-expense'">
          Terpakai {{ formatCurrency(totalSpent) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  totalBudget: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 }
})

const percent = computed(() => {
  if (!props.totalBudget) return 0
  return Math.min(Math.round((props.totalSpent / props.totalBudget) * 100), 100)
})

const remaining = computed(() => props.totalBudget - props.totalSpent)

const progressColor = computed(() => {
  if (percent.value >= 100) return '#F87171'
  if (percent.value >= 80) return '#FBBF24'
  return '#34D399'
})

const percentClass = computed(() => {
  if (percent.value >= 100) return 'text-expense'
  if (percent.value >= 80) return 'text-warning'
  return 'text-income'
})
</script>
