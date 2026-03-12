import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(() => profile.value?.full_name || 'Wildan & Deva')
  const avatarUrl = computed(() => profile.value?.avatar_url || null)

  async function init() {
    loading.value = true
    try {
      if (!isSupabaseConfigured) {
        console.warn('Supabase belum dikonfigurasi. Silakan isi .env dengan kredensial Supabase.')
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        user.value = session.user
        await fetchProfile()
      }
    } catch (e) {
      console.error('Auth init error:', e)
    } finally {
      loading.value = false
    }

    try {
      supabase.auth.onAuthStateChange((event, session) => {
        user.value = session?.user || null
        if (session?.user) fetchProfile()
        else profile.value = null
      })
    } catch (e) {
      // ignore auth listener errors when not configured
    }
  }

  async function login(username, password) {
    const EMAIL_MAP = {
      'wildan&deva': 'wildandeva@finance.app',
      'vicki' : 'wildandeva@finance.app',
      'admin': 'wildandeva@finance.app'
    }
    const email = EMAIL_MAP[username.toLowerCase().trim()]
    if (!email) throw new Error('Username tidak ditemukan. Gunakan: wildandeva')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Password salah. Silakan coba lagi.')
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

  async function uploadAvatar(file) {
    if (!user.value) throw new Error('User not authenticated')

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.value.id}-${Math.random()}.${fileExt}`

    let { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) throw new Error('Gagal mengunggah foto profil.')

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    await updateProfile({ avatar_url: publicUrl })
    return publicUrl
  }

  return {
    user, profile, loading, isAuthenticated, displayName, avatarUrl,
    init, login, fetchProfile, updateProfile, uploadAvatar, logout
  }
})
