<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold">Transaksi Terakhir</h3>
      <router-link to="/transactions" class="text-xs text-primary hover:text-primary-dark transition-colors">
        Lihat Semua →
      </router-link>
    </div>

    <div v-if="transactions.length === 0" class="text-center py-6 text-muted text-sm">
      Belum ada transaksi
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="tx in transactions"
        :key="tx.id"
        class="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 transition-colors cursor-pointer"
        @click="$emit('select', tx)"
      >
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          :style="{ background: (tx.category?.color || '#64748B') + '20' }">
          {{ tx.category?.icon || (tx.type === 'transfer' ? '⇄' : '💰') }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">
            {{ tx.type === 'transfer' ? 'Transfer' : (tx.category?.name || 'Lainnya') }}
          </p>
          <p class="text-xs text-muted truncate">{{ tx.note || formatDate(tx.date, 'D MMM') }}</p>
        </div>
        <span class="text-sm font-semibold shrink-0"
          :class="tx.type === 'income' ? 'text-income' : tx.type === 'expense' ? 'text-expense' : 'text-info'">
          {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

defineProps({
  transactions: { type: Array, default: () => [] }
})

defineEmits(['select'])
</script>
