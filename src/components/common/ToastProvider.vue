<template>
  <Teleport to="body">
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-[400px] px-4 space-y-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-xl border',
            typeStyles[toast.type]
          ]"
        >
          <span class="text-lg shrink-0">{{ typeIcons[toast.type] }}</span>
          <p class="text-sm flex-1">{{ toast.message }}</p>
          <button @click="remove(toast.id)" class="text-white/50 hover:text-white/80 shrink-0">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, provide } from 'vue'

const toasts = ref([])
let counter = 0

const typeStyles = {
  success: 'bg-income/90 border-income/30 text-white',
  error: 'bg-expense/90 border-expense/30 text-white',
  warning: 'bg-warning/90 border-warning/30 text-black',
  info: 'bg-info/90 border-info/30 text-white'
}

const typeIcons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}

function show(message, type = 'info', duration = 3000) {
  const id = ++counter
  toasts.value.push({ id, message, type })
  setTimeout(() => remove(id), duration)
}

function remove(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

provide('toast', { show })

defineExpose({ show })
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
