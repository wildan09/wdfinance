<template>
  <div class="animate-pulse space-y-3">
    <div v-for="i in count" :key="i" class="rounded-2xl p-4 glass">
      <div class="flex items-center gap-3">
        <div class="skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-4 w-3/4 rounded"></div>
          <div class="skeleton h-3 w-1/2 rounded"></div>
        </div>
        <div class="skeleton h-5 w-20 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 3 }
})
</script>
