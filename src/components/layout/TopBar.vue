<template>
  <header class="sticky top-0 z-40 glass-strong" :style="{ paddingTop: 'env(safe-area-inset-top, 0px)' }">
    <div class="flex items-center justify-between px-5 py-3">
      <div class="flex items-center gap-3 min-w-0">
        <button v-if="showBack" @click="$router.back()" class="text-muted hover:text-text transition-colors">
          ←
        </button>
        <div class="min-w-0">
          <h1 class="text-lg font-bold font-display truncate">{{ title }}</h1>
          <p v-if="subtitle" class="text-xs text-muted truncate">{{ subtitle }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  showBack: { type: Boolean, default: false }
})
</script>
