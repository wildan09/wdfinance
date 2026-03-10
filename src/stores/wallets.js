import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useWalletsStore = defineStore('wallets', () => {
  const wallets = ref([])
  const loading = ref(false)

  const totalBalance = computed(() =>
    wallets.value.filter(w => w.is_active).reduce((sum, w) => sum + Number(w.balance), 0)
  )

  const activeWallets = computed(() => wallets.value.filter(w => w.is_active))

  async function fetchWallets() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      wallets.value = data || []
    } finally {
      loading.value = false
    }
  }

  async function addWallet(wallet) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('wallets')
      .insert({ ...wallet, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    wallets.value.push(data)
    return data
  }

  async function updateWallet(id, updates) {
    const { data, error } = await supabase
      .from('wallets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const idx = wallets.value.findIndex(w => w.id === id)
    if (idx !== -1) wallets.value[idx] = data
    return data
  }

  async function deleteWallet(id) {
    const { error } = await supabase.from('wallets').delete().eq('id', id)
    if (error) throw error
    wallets.value = wallets.value.filter(w => w.id !== id)
  }

  function getWalletById(id) {
    return wallets.value.find(w => w.id === id)
  }

  return {
    wallets, loading, totalBalance, activeWallets,
    fetchWallets, addWallet, updateWallet, deleteWallet, getWalletById
  }
})
