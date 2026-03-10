<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <span class="text-5xl mb-4">{{ icon }}</span>
    <h3 class="text-lg font-semibold text-text mb-1">{{ title }}</h3>
    <p class="text-sm text-muted mb-6 max-w-[260px]">{{ description }}</p>
    <button
      v-if="actionLabel"
      @click="$emit('action')"
      class="px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors btn-press"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, default: 'Belum ada data' },
  description: { type: String, default: 'Data akan muncul di sini setelah kamu menambahkannya.' },
  actionLabel: { type: String, default: '' }
})

defineEmits(['action'])
</script>
