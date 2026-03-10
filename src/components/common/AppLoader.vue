<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div class="flex flex-col items-center gap-4">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
        <span class="absolute inset-0 flex items-center justify-center text-2xl font-display font-bold gradient-text">W</span>
      </div>
      <p class="text-sm text-muted animate-pulse">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: true },
  message: { type: String, default: 'Memuat...' }
})
</script>
