<template>
  <Transition name="slide-up">
    <div
      v-if="showPrompt"
      class="fixed bottom-4 left-4 right-4 z-50 p-4 bg-surface border border-white/10 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-xl"
    >
      <div class="flex items-start gap-4">
        <!-- App Icon -->
        <div class="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-inner">
          <span class="text-xl font-display font-bold text-bg">W</span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pt-0.5">
          <h3 class="text-sm font-semibold text-text truncate">Install WilDev Finance</h3>
          <p class="text-xs text-muted mt-1 leading-relaxed">
            <template v-if="isIOS">
              Install aplikasi ini di iOS: tap icon <span class="inline-block mx-1 w-4 h-4 text-center bg-white/10 rounded border border-white/20">⇡</span> di bawah, lalu pilih <strong>"Add to Home Screen"</strong>
            </template>
            <template v-else>
              Tambahkan aplikasi ini ke layar utama agar akses lebih cepat dan bisa offline.
            </template>
          </p>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3 mt-3">
            <button
              @click="dismissPrompt"
              class="flex-1 py-2 px-3 text-xs font-medium text-text bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Nanti Saja
            </button>
            <button
              v-if="!isIOS"
              @click="installApp"
              class="flex-1 py-2 px-3 text-xs font-medium text-bg bg-primary hover:bg-primary-dark rounded-lg transition-colors btn-press shadow-lg shadow-primary/20"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showPrompt = ref(false)
const deferredPrompt = ref(null)
const isIOS = ref(false)

// Cek apakah user sudah dismiss
const PWA_DISMISSED_KEY = 'wildev_pwa_dismissed'

function checkIOS() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

function checkStandalone() {
  // Cek apakah sudah jalan di mode PWA (standalone)
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

onMounted(() => {
  // Jika sudah jalan di PWA mode atau sudah pernah di-dismiss, tidak perlu show lagi
  if (checkStandalone() || localStorage.getItem(PWA_DISMISSED_KEY) === 'true') {
    return
  }

  // 1. Logic untuk iOS (Safari tidak punya event beforeinstallprompt)
  isIOS.value = checkIOS()
  if (isIOS.value) {
    // Tunjukkan instruksi manual untuk iOS (tunggu 3 detik agar tidak mengganggu load awal)
    setTimeout(() => {
      showPrompt.value = true
    }, 3000)
  }

  // 2. Logic untuk Android / Chrome Desktop
  const handleBeforeInstallPrompt = (e) => {
    // Cegah Chrome Desktop dari menampilkan prompt secara otomatis
    e.preventDefault()
    // Simpan event sehingga bisa kita panggil lagi
    deferredPrompt.value = e
    // Tampilkan prompt UX milik kita
    setTimeout(() => {
      showPrompt.value = true
    }, 2000)
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  })
})

function dismissPrompt() {
  showPrompt.value = false
  localStorage.setItem(PWA_DISMISSED_KEY, 'true')
}

async function installApp() {
  if (!deferredPrompt.value) return

  // Tunjukkan install prompt native
  showPrompt.value = false
  deferredPrompt.value.prompt()

  // Tunggu untuk melihat hasil response user
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt')
  } else {
    console.log('User dismissed the install prompt')
  }
  
  // Event ini hanya bisa dipakai sekali
  deferredPrompt.value = null
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
