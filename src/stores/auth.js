import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(() => profile.value?.full_name || 'Wildan & Deva')

  async function init() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        user.value = session.user
        await fetchProfile()
      }
    } finally {
      loading.value = false
    }

    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
      if (session?.user) fetchProfile()
      else profile.value = null
    })
  }

  async function login(username, password) {
    const EMAIL_MAP = {
      'wildan&deva': 'wildandeva@wildevfinance.app'
    }
    const email = EMAIL_MAP[username.toLowerCase().trim()]
    if (!email) throw new Error('Username tidak ditemukan')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Username atau password salah')
    user.value = data.user
    await fetchProfile()
    return data
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    if (data) profile.value = data
  }

  async function updateProfile(updates) {
    if (!user.value) return
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.value.id)
      .select()
      .single()
    if (error) throw error
    profile.value = data
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return {
    user, profile, loading, isAuthenticated, displayName,
    init, login, fetchProfile, updateProfile, logout
  }
})
