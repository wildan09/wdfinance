import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useNotifications() {
  const permission = ref(Notification.permission || 'default')
  const settings = ref(null)

  async function requestPermission() {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      permission.value = result
      return result
    }
    return 'denied'
  }

  async function fetchSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // No settings found, create defaults
      const { data: newData } = await supabase
        .from('notification_settings')
        .insert({ user_id: user.id })
        .select()
        .single()
      settings.value = newData
    } else if (data) {
      settings.value = data
    }
  }

  async function updateSettings(updates) {
    if (!settings.value) return
    const { data, error } = await supabase
      .from('notification_settings')
      .update(updates)
      .eq('id', settings.value.id)
      .select()
      .single()
    if (error) throw error
    settings.value = data
  }

  function sendNotification(title, body, options = {}) {
    if (permission.value !== 'granted') return
    try {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        ...options
      })
    } catch (e) {
      // Fallback for mobile
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-64x64.png',
            ...options
          })
        })
      }
    }
  }

  function checkBudgetAlert(categoryName, spent, budget, threshold) {
    const percent = Math.round((spent / budget) * 100)
    if (percent >= threshold) {
      const remaining = budget - spent
      sendNotification(
        '⚠️ Budget Hampir Habis',
        `Budget ${categoryName} ${percent}% terpakai (sisa Rp ${remaining.toLocaleString('id-ID')})`
      )
    }
  }

  function sendGoalAlert(goalName, daysLeft, percent, remaining) {
    if (daysLeft === 7) {
      sendNotification('🎯 Target Tabungan', `${goalName} — 7 hari lagi! Progress: ${percent}%`)
    } else if (daysLeft === 1) {
      sendNotification('⏰ Target Tabungan', `${goalName} — Besok deadline! Kurang Rp ${remaining.toLocaleString('id-ID')}`)
    }
  }

  function sendGoalComplete(goalName) {
    sendNotification('🎉 Selamat!', `${goalName} berhasil dicapai!`)
  }

  function sendDailyReminder() {
    sendNotification('📝 Pengingat Harian', 'Hei Wildan & Deva, sudah catat pengeluaran hari ini?')
  }

  return {
    permission, settings,
    requestPermission, fetchSettings, updateSettings,
    sendNotification, checkBudgetAlert, sendGoalAlert, sendGoalComplete, sendDailyReminder
  }
}
