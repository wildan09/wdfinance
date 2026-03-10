<template>
  <AppShell>
    <div class="px-5 pt-6 pb-4 space-y-5" :style="{paddingTop:'calc(1.5rem + env(safe-area-inset-top,0px))'}">
      <!-- Avatar & Name -->
      <div class="flex flex-col items-center gap-3">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-primary-dark/40 flex items-center justify-center text-2xl font-display font-bold border-2 border-primary/20">
          W&D
        </div>
        <div class="text-center">
          <h2 class="text-lg font-display font-bold">{{ displayName }}</h2>
          <p class="text-xs text-muted">wildandeva@wildevfinance.app</p>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="glass rounded-2xl p-4 space-y-4">
        <h3 class="text-sm font-semibold flex items-center gap-2">🔔 Notifikasi</h3>
        <div class="flex items-center justify-between">
          <div><p class="text-sm">Peringatan Budget</p><p class="text-xs text-muted">Notif saat mendekati limit</p></div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="notifSettings.budget_alert" @change="saveNotif" class="sr-only peer">
            <div class="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <div><p class="text-sm">Pengingat Harian</p><p class="text-xs text-muted">Ingatkan catat pengeluaran</p></div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="notifSettings.daily_reminder" @change="saveNotif" class="sr-only peer">
            <div class="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <div><p class="text-sm">Target Tabungan</p><p class="text-xs text-muted">Notif deadline mendekat</p></div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="notifSettings.goal_alert" @change="saveNotif" class="sr-only peer">
            <div class="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="glass rounded-2xl overflow-hidden">
        <router-link to="/wallets" class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5">
          <span>💳</span><span class="flex-1 text-sm">Kelola Wallet</span><span class="text-muted text-xs">→</span>
        </router-link>
        <router-link to="/savings" class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5">
          <span>🎯</span><span class="flex-1 text-sm">Target Tabungan</span><span class="text-muted text-xs">→</span>
        </router-link>
        <button @click="exportAll" class="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors w-full text-left border-b border-white/5">
          <span>📊</span><span class="flex-1 text-sm">Ekspor Semua Data</span><span class="text-muted text-xs">→</span>
        </button>
      </div>

      <!-- App Info -->
      <div class="glass rounded-2xl p-4 space-y-2">
        <h3 class="text-sm font-semibold">ℹ️ Informasi Aplikasi</h3>
        <div class="flex justify-between text-sm"><span class="text-muted">Versi</span><span>1.0.0</span></div>
        <div class="flex justify-between text-sm"><span class="text-muted">Build</span><span>2026.03.10</span></div>
      </div>

      <!-- Logout -->
      <button @click="handleLogout" class="w-full py-3.5 rounded-xl bg-expense/10 text-expense font-semibold hover:bg-expense/20 transition-colors">
        Keluar
      </button>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useWalletsStore } from '@/stores/wallets'
import { useNotifications } from '@/composables/useNotifications'
import { useExport } from '@/composables/useExport'

const router = useRouter()
const authStore = useAuthStore()
const txStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const { settings, fetchSettings, updateSettings } = useNotifications()
const { exportExcel } = useExport()

const displayName = computed(() => authStore.displayName)
const notifSettings = ref({ budget_alert: true, daily_reminder: false, goal_alert: true })

async function saveNotif() {
  try { await updateSettings(notifSettings.value) } catch(e) { console.error(e) }
}

async function exportAll() {
  await txStore.fetchTransactions({ reset: true })
  await walletsStore.fetchWallets()
  const stats = await txStore.getStats('2020-01-01', '2099-12-31')
  await exportExcel(txStore.transactions, stats, walletsStore.wallets)
}

async function handleLogout() {
  if (!confirm('Yakin keluar?')) return
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await fetchSettings()
  if (settings.value) {
    notifSettings.value = {
      budget_alert: settings.value.budget_alert,
      daily_reminder: settings.value.daily_reminder,
      goal_alert: settings.value.goal_alert
    }
  }
})
</script>
