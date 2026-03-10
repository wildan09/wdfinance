<template>
  <div class="relative">
    <input
      ref="inputRef"
      type="text"
      :value="displayValue"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      :placeholder="placeholder"
      :class="[
        'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text text-right font-semibold text-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all',
        large ? 'text-3xl py-4 text-center' : ''
      ]"
      inputmode="numeric"
    />
    <span v-if="!large" class="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">Rp</span>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatNumber } from '@/utils/formatters'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  placeholder: { type: String, default: '0' },
  large: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
const inputRef = ref(null)
const focused = ref(false)

const displayValue = computed(() => {
  if (focused.value && props.modelValue === 0) return ''
  if (props.large) return props.modelValue ? `Rp ${formatNumber(props.modelValue)}` : ''
  return props.modelValue ? formatNumber(props.modelValue) : ''
})

function onInput(e) {
  const raw = e.target.value.replace(/[^\d]/g, '')
  const num = parseInt(raw, 10) || 0
  emit('update:modelValue', num)
}

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>
