<template>
  <div class="glass rounded-2xl p-5 relative overflow-hidden">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>

    <div class="relative">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-muted font-medium uppercase tracking-wider">Total Saldo</span>
        <button @click="toggleVisibility" class="text-muted hover:text-text transition-colors text-sm">
          {{ visible ? '👁️' : '🙈' }}
        </button>
      </div>

      <h2 class="text-3xl font-bold font-display mb-4 transition-all duration-300">
        <span v-if="visible">{{ formattedBalance }}</span>
        <span v-else class="tracking-widest">••••••••</span>
      </h2>

      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-income"></div>
          <div>
            <p class="text-[10px] text-muted">Pemasukan</p>
            <p class="text-sm font-semibold text-income">{{ visible ? formattedIncome : '•••' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-expense"></div>
          <div>
            <p class="text-[10px] text-muted">Pengeluaran</p>
            <p class="text-sm font-semibold text-expense">{{ visible ? formattedExpense : '•••' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  balance: { type: Number, default: 0 },
  income: { type: Number, default: 0 },
  expense: { type: Number, default: 0 }
})

const visible = ref(true)

const formattedBalance = computed(() => formatCurrency(props.balance))
const formattedIncome = computed(() => formatCurrency(props.income))
const formattedExpense = computed(() => formatCurrency(props.expense))

function toggleVisibility() {
  visible.value = !visible.value
}
</script>
