<template>
  <div class="min-h-[100dvh] relative">
    <slot></slot>
    <!-- Bottom nav spacer -->
    <div class="h-20"></div>
    <BottomNav />
    <PwaInstallBanner />
    <!-- Offline banner -->
    <Transition name="slide-up">
      <div v-if="isOffline" class="fixed top-0 left-0 right-0 z-[300] bg-warning/90 text-bg text-center py-2 text-xs font-medium max-w-[430px] mx-auto">
        📡 Kamu sedang offline
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BottomNav from './BottomNav.vue'
import PwaInstallBanner from '@/components/common/PwaInstallBanner.vue'

const isOffline = ref(!navigator.onLine)

function goOnline() { isOffline.value = false }
function goOffline() { isOffline.value = true }

onMounted(() => {
  window.addEventListener('online', goOnline)
  window.addEventListener('offline', goOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', goOnline)
  window.removeEventListener('offline', goOffline)
})
</script>
