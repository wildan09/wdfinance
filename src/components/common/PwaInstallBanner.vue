<template>
  <Transition name="slide-up">
    <div
      v-if="show"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px]"
    >
      <div class="glass-strong rounded-2xl p-4 shadow-xl">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg shrink-0">
            📲
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-text">Install WilDev Finance</h4>
            <p class="text-xs text-muted mt-0.5">
              {{ isIOS ? 'Tap ikon Share lalu pilih "Add to Home Screen"' : 'Pasang aplikasi untuk pengalaman terbaik' }}
            </p>
          </div>
          <button @click="dismiss" class="text-muted hover:text-text transition-colors shrink-0">✕</button>
        </div>

        <button
          v-if="!isIOS && deferredPrompt"
          @click="install"
          class="mt-3 w-full py-2.5 bg-primary text-bg font-semibold rounded-xl text-sm hover:bg-primary-dark transition-colors btn-press"
        >
          Install WilDev Finance
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const show = ref(false)
const deferredPrompt = ref(null)
const isIOS = ref(false)

function dismiss() {
  show.value = false
  localStorage.setItem('pwa-banner-dismissed', Date.now().toString())
}

async function install() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    show.value = false
  }
  deferredPrompt.value = null
}

function handleBeforeInstall(e) {
  e.preventDefault()
  deferredPrompt.value = e
  checkShow()
}

function checkShow() {
  // Don't show if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) return
  if (navigator.standalone) return

  // Don't show if dismissed recently (24 hours)
  const dismissed = localStorage.getItem('pwa-banner-dismissed')
  if (dismissed && Date.now() - parseInt(dismissed) < 86400000) return

  show.value = true
}

onMounted(() => {
  // Detect iOS
  isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  window.addEventListener('beforeinstallprompt', handleBeforeInstall)

  // Show for iOS (manual instructions)
  if (isIOS.value) {
    checkShow()
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
})
</script>
