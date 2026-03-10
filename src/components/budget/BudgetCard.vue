<template>
  <div class="glass rounded-2xl p-4">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        :style="{ background: (budget.category?.color || '#64748B') + '20' }">
        {{ budget.category?.icon || '📊' }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">{{ budget.category?.name || 'Kategori' }}</p>
        <p class="text-xs text-muted">{{ formatCurrency(spent) }} dari {{ formatCurrency(budget.amount) }}</p>
      </div>
      <span class="text-sm font-bold"
        :class="percentClass">
        {{ percent }}%
      </span>
    </div>

    <!-- Progress bar -->
    <div class="h-2 bg-white/5 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :style="{ width: Math.min(percent, 100) + '%', background: progressColor }"
      ></div>
    </div>

    <p class="text-xs mt-2" :class="remaining >= 0 ? 'text-muted' : 'text-expense'">
      {{ remaining >= 0 ? `Sisa ${formatCurrency(remaining)}` : `Melebihi ${formatCurrency(Math.abs(remaining))}` }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  budget: { type: Object, required: true },
  spent: { type: Number, default: 0 }
})

const percent = computed(() => {
  if (!props.budget.amount) return 0
  return Math.round((props.spent / Number(props.budget.amount)) * 100)
})

const remaining = computed(() => Number(props.budget.amount) - props.spent)

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
