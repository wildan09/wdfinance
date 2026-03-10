<template>
  <div id="wildev-app">
    <AppLoader v-if="appLoading" message="Memuat WilDev Finance..." />
    <template v-else>
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </template>
    <ToastProvider ref="toastRef" />
    <PwaInstallPrompt />
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ToastProvider from '@/components/common/ToastProvider.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import PwaInstallPrompt from '@/components/common/PwaInstallPrompt.vue'

const authStore = useAuthStore()
const appLoading = ref(true)
const toastRef = ref(null)

provide('toast', { show: (...args) => toastRef.value?.show(...args) })

onMounted(async () => {
  try {
    await authStore.init()
  } catch (e) {
    console.error('App init error:', e)
  } finally {
    appLoading.value = false
    console.log('App loaded, appLoading =', appLoading.value)
  }
})
</script>
