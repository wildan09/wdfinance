<template>
  <div class="grid grid-cols-2 gap-3">
    <button
      v-for="action in actions"
      :key="action.label"
      @click="$emit('action', action.type)"
      class="flex flex-col items-center gap-2 p-4 rounded-2xl glass hover:bg-white/10 transition-all duration-200 btn-press"
    >
      <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        :style="{ background: action.color + '20' }">
        {{ action.icon }}
      </div>
      <span class="text-xs font-medium text-text">{{ action.label }}</span>
    </button>
  </div>
</template>

<script setup>
const actions = [
  { type: 'income', icon: '➕', label: 'Pemasukan', color: '#34D399' },
  { type: 'expense', icon: '➖', label: 'Pengeluaran', color: '#F87171' },
  { type: 'transfer', icon: '⇄', label: 'Transfer', color: '#60A5FA' },
  { type: 'scan', icon: '📷', label: 'Scan Struk', color: '#A78BFA' }
]

defineEmits(['action'])
</script>
