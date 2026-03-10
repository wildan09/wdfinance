<template>
  <BottomSheet v-model="show" title="Filter Transaksi">
    <div class="px-5 pb-6 space-y-5">
      <!-- Date Range -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-muted mb-1.5 block">Dari Tanggal</label>
          <input v-model="filters.startDate" type="date"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-text text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label class="text-xs text-muted mb-1.5 block">Sampai Tanggal</label>
          <input v-model="filters.endDate" type="date"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-text text-sm focus:outline-none focus:border-primary/50" />
        </div>
      </div>

      <!-- Type -->
      <div>
        <label class="text-xs text-muted mb-2 block">Tipe</label>
        <div class="flex gap-2">
          <button v-for="t in typeOptions" :key="t.value" @click="filters.type = filters.type === t.value ? null : t.value"
            class="px-4 py-2 rounded-xl text-sm transition-all"
            :class="filters.type === t.value ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'glass text-muted hover:text-text'">
            {{ t.label }}
          </button>
        </div>
      </div>

      <!-- Category -->
      <div>
        <label class="text-xs text-muted mb-2 block">Kategori</label>
        <div class="flex flex-wrap gap-2">
          <button v-for="cat in categories" :key="cat.id" @click="toggleCategory(cat.id)"
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all"
            :class="filters.categoryId === cat.id ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'glass text-muted'">
            <span>{{ cat.icon }}</span> {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Wallet -->
      <div>
        <label class="text-xs text-muted mb-2 block">Wallet</label>
        <div class="flex flex-wrap gap-2">
          <button v-for="w in wallets" :key="w.id" @click="filters.walletId = filters.walletId === w.id ? null : w.id"
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all"
            :class="filters.walletId === w.id ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'glass text-muted'">
            <span>{{ w.icon }}</span> {{ w.name }}
          </button>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button @click="reset" class="flex-1 py-3 rounded-xl glass text-muted text-sm font-medium hover:bg-white/10 transition-colors">
          Reset
        </button>
        <button @click="apply" class="flex-1 py-3 rounded-xl bg-primary text-bg text-sm font-semibold hover:bg-primary-dark transition-colors">
          Terapkan
        </button>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
  wallets: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'apply'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const typeOptions = [
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'transfer', label: 'Transfer' }
]

const filters = ref({
  startDate: '',
  endDate: '',
  type: null,
  categoryId: null,
  walletId: null
})

function toggleCategory(id) {
  filters.value.categoryId = filters.value.categoryId === id ? null : id
}

function reset() {
  filters.value = { startDate: '', endDate: '', type: null, categoryId: null, walletId: null }
}

function apply() {
  emit('apply', { ...filters.value })
  show.value = false
}
</script>
