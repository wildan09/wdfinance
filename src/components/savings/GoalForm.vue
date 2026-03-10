<template>
  <BottomSheet v-model="show" :title="editMode ? 'Edit Target' : 'Target Baru'">
    <div class="px-5 pb-6 space-y-5">
      <!-- Name -->
      <div>
        <label class="text-xs text-muted mb-1.5 block">Nama Target</label>
        <input v-model="form.name" type="text" placeholder="Contoh: Dana Darurat"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-primary/50 transition-colors" />
      </div>

      <!-- Icon & Color -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-muted mb-2 block">Ikon</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="e in emojis" :key="e" @click="form.icon = e"
              class="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
              :class="form.icon === e ? 'bg-primary/15 ring-1 ring-primary/30' : 'glass hover:bg-white/10'">
              {{ e }}
            </button>
          </div>
        </div>
        <div>
          <label class="text-xs text-muted mb-2 block">Warna</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="c in colors" :key="c" @click="form.color = c"
              class="w-8 h-8 rounded-lg transition-all"
              :class="form.color === c ? 'ring-2 ring-white/50 scale-110' : ''"
              :style="{ background: c }"></button>
          </div>
        </div>
      </div>

      <!-- Target Amount -->
      <div>
        <label class="text-xs text-muted mb-1.5 block">Target Nominal</label>
        <CurrencyInput v-model="form.target_amount" />
      </div>

      <!-- Deadline -->
      <div>
        <label class="text-xs text-muted mb-1.5 block">Deadline</label>
        <input v-model="form.deadline" type="date"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-primary/50 transition-colors" />
      </div>

      <!-- Linked Wallet -->
      <div v-if="wallets.length">
        <label class="text-xs text-muted mb-2 block">Wallet Terkait (opsional)</label>
        <div class="flex gap-2 scroll-x pb-1">
          <button v-for="w in wallets" :key="w.id" @click="form.wallet_id = form.wallet_id === w.id ? null : w.id"
            class="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
            :class="form.wallet_id === w.id ? 'bg-primary/15 ring-1 ring-primary/30' : 'glass hover:bg-white/10'">
            <span>{{ w.icon }}</span>
            <span class="text-xs">{{ w.name }}</span>
          </button>
        </div>
      </div>

      <button @click="submit" :disabled="!isValid"
        class="w-full py-3.5 bg-primary text-bg rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40">
        {{ editMode ? 'Perbarui' : 'Simpan' }}
      </button>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  wallets: { type: Array, default: () => [] },
  editData: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const editMode = computed(() => !!props.editData)

const emojis = ['🎯', '🏠', '🚗', '✈️', '💍', '📱', '🎓', '💰', '🎁', '⭐', '🌟', '💎']
const colors = ['#10B981', '#34D399', '#60A5FA', '#A78BFA', '#F472B6', '#FBBF24', '#FB923C', '#F87171']

const defaultForm = () => ({
  name: '',
  icon: '🎯',
  color: '#10B981',
  target_amount: 0,
  deadline: '',
  wallet_id: null
})

const form = ref(defaultForm())

const isValid = computed(() => form.value.name && form.value.target_amount > 0)

watch(() => props.editData, (val) => {
  if (val) {
    form.value = {
      name: val.name,
      icon: val.icon || '🎯',
      color: val.color || '#10B981',
      target_amount: Number(val.target_amount),
      deadline: val.deadline || '',
      wallet_id: val.wallet_id
    }
  }
}, { immediate: true })

watch(show, (v) => {
  if (v && !props.editData) form.value = defaultForm()
})

function submit() {
  emit('submit', { ...form.value })
  show.value = false
}
</script>
