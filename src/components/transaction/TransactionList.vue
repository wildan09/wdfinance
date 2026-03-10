<template>
  <div>
    <div v-if="groupedTransactions.length === 0">
      <EmptyState icon="📭" title="Belum ada transaksi" description="Mulai catat pemasukan dan pengeluaranmu!" actionLabel="Tambah Transaksi" @action="$emit('add')" />
    </div>

    <div v-else class="space-y-4">
      <div v-for="group in groupedTransactions" :key="group.label">
        <h4 class="text-xs text-muted font-medium mb-2 px-1">{{ group.label }}</h4>
        <div class="space-y-2">
          <TransactionItem
            v-for="tx in group.items"
            :key="tx.id"
            :transaction="tx"
            @click="$emit('select', tx)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TransactionItem from './TransactionItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getDateLabel } from '@/utils/date'

const props = defineProps({
  transactions: { type: Array, default: () => [] }
})

defineEmits(['select', 'add'])

const groupedTransactions = computed(() => {
  const groups = {}
  props.transactions.forEach(tx => {
    const label = getDateLabel(tx.date)
    if (!groups[label]) groups[label] = { label, items: [] }
    groups[label].items.push(tx)
  })
  return Object.values(groups)
})
</script>
