<template>
  <BottomSheet v-model="show" :title="editMode ? 'Edit Transaksi' : 'Transaksi Baru'" maxHeight="90vh">
    <div class="px-5 pb-6 space-y-5">
      <!-- Type selector -->
      <div class="flex gap-2 p-1 bg-white/5 rounded-xl">
        <button
          v-for="t in types"
          :key="t.value"
          @click="form.type = t.value"
          class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          :class="form.type === t.value ? t.activeClass : 'text-muted hover:text-text'"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Amount -->
      <div>
        <label class="text-xs text-muted mb-1.5 block">Nominal</label>
        <CurrencyInput v-model="form.amount" :large="true" placeholder="0" />
      </div>

      <!-- Category (not for transfer) -->
      <div v-if="form.type !== 'transfer'">
        <label class="text-xs text-muted mb-2 block">Kategori</label>
        <div class="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto">
          <button
            v-for="cat in filteredCategories"
            :key="cat.id"
            @click="form.category_id = cat.id"
            class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150"
            :class="form.category_id === cat.id ? 'bg-primary/15 ring-1 ring-primary/30' : 'glass hover:bg-white/10'"
          >
            <span class="text-xl">{{ cat.icon }}</span>
            <span class="text-[10px] text-center leading-tight truncate w-full">{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- Wallet -->
      <div>
        <label class="text-xs text-muted mb-2 block">{{ form.type === 'transfer' ? 'Dari Wallet' : 'Wallet' }}</label>
        <div class="flex gap-2 scroll-x pb-1">
          <button
            v-for="w in wallets"
            :key="w.id"
            @click="form.wallet_id = w.id"
            class="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            :class="form.wallet_id === w.id ? 'bg-primary/15 ring-1 ring-primary/30' : 'glass hover:bg-white/10'"
          >
            <span>{{ w.icon }}</span>
            <span class="text-xs">{{ w.name }}</span>
          </button>
        </div>
      </div>

      <!-- To Wallet (transfer only) -->
      <div v-if="form.type === 'transfer'">
        <label class="text-xs text-muted mb-2 block">Ke Wallet</label>
        <div class="flex gap-2 scroll-x pb-1">
          <button
            v-for="w in wallets.filter(x => x.id !== form.wallet_id)"
            :key="w.id"
            @click="form.to_wallet_id = w.id"
            class="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            :class="form.to_wallet_id === w.id ? 'bg-info/15 ring-1 ring-info/30' : 'glass hover:bg-white/10'"
          >
            <span>{{ w.icon }}</span>
            <span class="text-xs">{{ w.name }}</span>
          </button>
        </div>
      </div>

      <!-- Date -->
      <div>
        <label class="text-xs text-muted mb-1.5 block">Tanggal</label>
        <input
          v-model="form.date"
          type="date"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <!-- Note -->
      <div>
        <label class="text-xs text-muted mb-1.5 block">Catatan</label>
        <textarea
          v-model="form.note"
          rows="2"
          placeholder="Tambahkan catatan..."
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors"
        ></textarea>
      </div>

      <!-- Scan Receipt Button -->
      <button
        @click="$emit('scan')"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass hover:bg-white/10 transition-colors"
      >
        <span>📷</span>
        <span class="text-sm">Scan Struk</span>
        <span class="ai-badge">AI</span>
      </button>

      <!-- Submit -->
      <button
        @click="submit"
        :disabled="!isValid || saving"
        class="w-full py-3.5 rounded-xl font-semibold text-bg transition-all duration-200 disabled:opacity-40"
        :class="form.type === 'income' ? 'bg-income hover:bg-income/80' : form.type === 'expense' ? 'bg-expense hover:bg-expense/80' : 'bg-info hover:bg-info/80'"
      >
        <span v-if="saving" class="inline-flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin"></span>
          Menyimpan...
        </span>
        <span v-else>{{ editMode ? 'Perbarui' : 'Simpan' }}</span>
      </button>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { dayjs } from '@/utils/date'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
  wallets: { type: Array, default: () => [] },
  editData: { type: Object, default: null },
  initialType: { type: String, default: 'expense' }
})

const emit = defineEmits(['update:modelValue', 'submit', 'scan'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const editMode = computed(() => !!props.editData)

const types = [
  { value: 'income', label: 'Pemasukan', activeClass: 'bg-income/20 text-income' },
  { value: 'expense', label: 'Pengeluaran', activeClass: 'bg-expense/20 text-expense' },
  { value: 'transfer', label: 'Transfer', activeClass: 'bg-info/20 text-info' }
]

const defaultForm = () => ({
  type: props.initialType,
  amount: 0,
  category_id: null,
  wallet_id: null,
  to_wallet_id: null,
  date: dayjs().format('YYYY-MM-DD'),
  note: ''
})

const form = ref(defaultForm())
const saving = ref(false)

const filteredCategories = computed(() =>
  props.categories.filter(c => c.type === form.value.type)
)

const isValid = computed(() => {
  if (!form.value.amount || form.value.amount <= 0) return false
  if (!form.value.wallet_id) return false
  if (form.value.type !== 'transfer' && !form.value.category_id) return false
  if (form.value.type === 'transfer' && !form.value.to_wallet_id) return false
  return true
})

watch(() => props.editData, (val) => {
  if (val) {
    form.value = {
      type: val.type,
      amount: Number(val.amount),
      category_id: val.category_id,
      wallet_id: val.wallet_id,
      to_wallet_id: val.to_wallet_id,
      date: val.date,
      note: val.note || ''
    }
  }
}, { immediate: true })

watch(show, (v) => {
  if (v && !props.editData) {
    form.value = defaultForm()
  }
})

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    emit('submit', { ...form.value })
    show.value = false
  } finally {
    saving.value = false
  }
}
</script>
