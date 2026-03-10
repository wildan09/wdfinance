<template>
  <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 glass-strong border-t border-white/5">
    <div class="flex items-center justify-around px-2" :style="{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px]"
        :class="isActive(item.path) ? 'text-primary' : 'text-muted hover:text-text'"
      >
        <span class="text-xl transition-transform duration-200" :class="isActive(item.path) ? 'scale-110' : ''">{{ item.icon }}</span>
        <span class="text-[10px] font-medium">{{ item.label }}</span>
        <div v-if="isActive(item.path)" class="w-1 h-1 bg-primary rounded-full mt-0.5"></div>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', icon: '🏠', label: 'Beranda' },
  { path: '/transactions', icon: '💳', label: 'Transaksi' },
  { path: '/budget', icon: '📊', label: 'Budget' },
  { path: '/report', icon: '📈', label: 'Laporan' },
  { path: '/profile', icon: '👤', label: 'Profil' }
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
