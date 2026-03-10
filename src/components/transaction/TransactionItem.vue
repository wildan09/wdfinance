<template>
  <div
    class="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 transition-colors cursor-pointer"
    @click="$emit('click', transaction)"
  >
    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
      :style="{ background: categoryColor + '20' }">
      {{ categoryIcon }}
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium truncate">{{ categoryName }}</p>
      <p class="text-xs text-muted truncate">{{ transaction.note || walletName }}</p>
    </div>
    <div class="text-right shrink-0">
      <span class="text-sm font-semibold"
        :class="transaction.type === 'income' ? 'text-income' : transaction.type === 'expense' ? 'text-expense' : 'text-info'">
        {{ prefix }}{{ formatCurrency(transaction.amount) }}
      </span>
      <p class="text-[10px] text-muted">{{ formatDate(transaction.date, 'D MMM') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const props = defineProps({
  transaction: { type: Object, required: true }
})

defineEmits(['click'])

const categoryIcon = computed(() =>
  props.transaction.type === 'transfer' ? '⇄' : (props.transaction.category?.icon || '💰')
)
const categoryName = computed(() =>
  props.transaction.type === 'transfer' ? 'Transfer' : (props.transaction.category?.name || 'Lainnya')
)
const categoryColor = computed(() =>
  props.transaction.category?.color || '#64748B'
)
const walletName = computed(() =>
  props.transaction.wallet?.name || ''
)
const prefix = computed(() =>
  props.transaction.type === 'income' ? '+' : '-'
)
</script>
