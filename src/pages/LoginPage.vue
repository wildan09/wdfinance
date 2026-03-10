<template>
  <div class="min-h-[100dvh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
    <!-- Background effects -->
    <div class="absolute inset-0 bg-gradient-to-br from-bg via-surface to-bg"></div>
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]"></div>

    <div class="relative w-full max-w-[340px] space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
          <span class="text-3xl font-display font-bold text-bg">W</span>
        </div>
        <h1 class="text-2xl font-display font-bold gradient-text">WilDev Finance</h1>
        <p class="text-sm text-muted mt-1">Catat. Kelola. Sejahtera.</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="text-xs text-muted mb-1.5 block font-medium">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="wildandeva"
            autocomplete="username"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-text placeholder-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <p class="text-xs text-muted/50 mt-1.5 pl-1">Gunakan: <span class="text-primary/70">wildandeva</span></p>
        </div>

        <div>
          <label class="text-xs text-muted mb-1.5 block font-medium">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-text placeholder-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Error message -->
        <Transition name="fade">
          <p v-if="error" class="text-sm text-expense bg-expense/10 border border-expense/20 px-4 py-2.5 rounded-xl">
            {{ error }}
          </p>
        </Transition>

        <button
          type="submit"
          :disabled="loading || !username || !password"
          class="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-bg font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 btn-press"
        >
          <span v-if="loading" class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin"></span>
            Masuk...
          </span>
          <span v-else>Masuk</span>
        </button>
      </form>

      <p class="text-center text-xs text-muted/50">
        v1.0.0 — WilDev Finance
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) return
  loading.value = true
  error.value = ''

  try {
    await authStore.login(username.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
