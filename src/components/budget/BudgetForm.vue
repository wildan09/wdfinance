<template>
  <BottomSheet v-model="show" :title="editMode ? 'Edit Budget' : 'Budget Baru'">
    <div class="px-5 pb-6 space-y-5">
      <!-- Category -->
      <div>
        <label class="text-xs text-muted mb-2 block">Kategori</label>
        <div class="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto">
          <button
            v-for="cat in expenseCategories"
            :key="cat.id"
            @click="form.category_id = cat.id"
            class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
            :class="form.category_id === cat.id ? 'bg-primary/15 ring-1 ring-primary/30' : 'glass hover:bg-white/10'"
          >
            <span class="text-xl">{{ cat.icon }}</span>
            <span class="text-[10px] truncate w-full text-center">{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- Amount -->
      <div>
        <label class="text-xs text-muted mb-1.5 block">Nominal Budget</label>
        <CurrencyInput v-model="form.amount" />
      </div>

      <!-- Period -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-muted mb-1.5 block">Bulan</label>
          <select v-model="form.month"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-text text-sm focus:outline-none focus:border-primary/50">
            <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-muted mb-1.5 block">Tahun</label>
          <select v-model="form.year"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-text text-sm focus:outline-none focus:border-primary/50">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <button
        @click="submit"
        :disabled="!isValid"
        class="w-full py-3.5 bg-primary text-bg rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40"
      >
        {{ editMode ? 'Perbarui' : 'Simpan' }}
      </button>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { getMonthName } from '@/utils/date'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
  editData: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const editMode = computed(() => !!props.editData)

const now = new Date()
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

const expenseCategories = computed(() => props.categories.filter(c => c.type === 'expense'))

const form = ref({
  category_id: null,
  amount: 0,
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  period: 'monthly'
})

const isValid = computed(() => form.value.category_id && form.value.amount > 0)

watch(() => props.editData, (val) => {
  if (val) {
    form.value = {
      category_id: val.category_id,
      amount: Number(val.amount),
      month: val.month,
      year: val.year,
      period: val.period || 'monthly'
    }
  }
}, { immediate: true })

watch(show, (v) => {
  if (v && !props.editData) {
    form.value = { category_id: null, amount: 0, month: now.getMonth() + 1, year: now.getFullYear(), period: 'monthly' }
  }
})

function submit() {
  emit('submit', { ...form.value })
  show.value = false
}
</script>
