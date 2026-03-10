<template>
  <BottomSheet v-model="show" title="Hasil Scan Struk" maxHeight="85vh">
    <div class="px-5 pb-6 space-y-4">
      <!-- Confidence badge -->
      <div class="flex items-center gap-2">
        <span class="ai-badge">AI</span>
        <span class="text-xs"
          :class="{
            'text-income': result?.confidence === 'high',
            'text-warning': result?.confidence === 'medium',
            'text-expense': result?.confidence === 'low'
          }">
          Akurasi: {{ confidenceLabel }}
        </span>
      </div>

      <!-- Merchant & Date -->
      <div class="glass rounded-xl p-4 space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-xs text-muted">Merchant</span>
          <span class="text-sm font-medium">{{ result?.merchant_name || '-' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-muted">Tanggal</span>
          <span class="text-sm font-medium">{{ result?.date || '-' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-muted">Pembayaran</span>
          <span class="text-sm font-medium">{{ result?.payment_method || '-' }}</span>
        </div>
      </div>

      <!-- Items -->
      <div v-if="result?.items?.length" class="glass rounded-xl p-4">
        <h4 class="text-xs text-muted mb-3">Daftar Item</h4>
        <div class="space-y-2">
          <div v-for="(item, idx) in result.items" :key="idx" class="flex justify-between text-sm">
            <span class="text-text/80 truncate flex-1">{{ item.name }} × {{ item.qty }}</span>
            <span class="font-medium shrink-0 ml-2">{{ formatCurrency(item.subtotal) }}</span>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-white/10 flex justify-between font-semibold">
          <span>Total</span>
          <span class="text-primary">{{ formatCurrency(result?.total_amount) }}</span>
        </div>
      </div>

      <!-- Category suggestion -->
      <div class="glass rounded-xl p-4 flex justify-between items-center">
        <span class="text-xs text-muted">Kategori (saran AI)</span>
        <span class="text-sm font-medium text-primary">{{ result?.category_suggestion || '-' }}</span>
      </div>

      <!-- Notes -->
      <div v-if="result?.notes" class="glass rounded-xl p-4">
        <span class="text-xs text-muted block mb-1">Catatan AI</span>
        <p class="text-sm text-text/80">{{ result.notes }}</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button @click="show = false" class="flex-1 py-3 rounded-xl glass text-muted text-sm font-medium hover:bg-white/10 transition-colors">
          Batal
        </button>
        <button @click="apply" class="flex-1 py-3 rounded-xl bg-primary text-bg text-sm font-semibold hover:bg-primary-dark transition-colors btn-press">
          ✅ Gunakan Data Ini
        </button>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup>
import { computed } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  result: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'apply'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const confidenceLabel = computed(() => {
  const map = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }
  return map[props.result?.confidence] || 'Tidak Diketahui'
})

function apply() {
  emit('apply', props.result)
  show.value = false
}
</script>
