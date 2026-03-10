<template>
  <div class="grid grid-cols-3 gap-3">
    <div class="glass rounded-2xl p-3 text-center">
      <p class="text-[10px] text-muted mb-1">Pemasukan</p>
      <p class="text-sm font-bold text-income">{{ formatCurrency(income) }}</p>
    </div>
    <div class="glass rounded-2xl p-3 text-center">
      <p class="text-[10px] text-muted mb-1">Pengeluaran</p>
      <p class="text-sm font-bold text-expense">{{ formatCurrency(expense) }}</p>
    </div>
    <div class="glass rounded-2xl p-3 text-center">
      <p class="text-[10px] text-muted mb-1">Selisih</p>
      <p class="text-sm font-bold" :class="net >= 0 ? 'text-income' : 'text-expense'">{{ formatCurrency(net) }}</p>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currency'

defineProps({
  income: { type: Number, default: 0 },
  expense: { type: Number, default: 0 },
  net: { type: Number, default: 0 }
})
</script>
