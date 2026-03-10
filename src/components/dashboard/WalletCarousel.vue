<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold">Dompet Saya</h3>
      <router-link to="/wallets" class="text-xs text-primary hover:text-primary-dark transition-colors">
        Kelola →
      </router-link>
    </div>

    <div v-if="wallets.length === 0" class="text-center py-4 text-muted text-sm">
      Belum ada dompet
    </div>

    <div v-else class="flex gap-3 scroll-x pb-2 -mx-1 px-1">
      <div
        v-for="wallet in wallets"
        :key="wallet.id"
        class="shrink-0 w-[160px] rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        :style="{ background: `linear-gradient(135deg, ${wallet.color}15, ${wallet.color}08)`, border: `1px solid ${wallet.color}25` }"
        @click="$emit('select', wallet)"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-2xl">{{ wallet.icon }}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted">{{ typeLabel(wallet.type) }}</span>
        </div>
        <p class="text-xs text-muted truncate mb-0.5">{{ wallet.name }}</p>
        <p class="text-sm font-bold" :class="Number(wallet.balance) >= 0 ? 'text-text' : 'text-expense'">
          {{ formatCurrency(wallet.balance) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currency'
import { getWalletTypeLabel } from '@/utils/formatters'

defineProps({
  wallets: { type: Array, default: () => [] }
})

defineEmits(['select'])

function typeLabel(type) {
  return getWalletTypeLabel(type)
}
</script>
