<template>
  <div id="wildev-app">
    <ToastProvider ref="toastRef">
      <AppLoader v-if="loading" message="Memuat WilDev Finance..." />
      <router-view v-else v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </ToastProvider>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ToastProvider from '@/components/common/ToastProvider.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const authStore = useAuthStore()
const loading = ref(true)
const toastRef = ref(null)

provide('toast', { show: (...args) => toastRef.value?.show(...args) })

onMounted(async () => {
  await authStore.init()
  loading.value = false
})
</script>
