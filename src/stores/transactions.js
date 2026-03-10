import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const pageSize = 20

  const recentTransactions = computed(() => transactions.value.slice(0, 5))

  async function fetchTransactions({ startDate, endDate, type, categoryId, walletId, search, offset = 0, reset = false } = {}) {
    loading.value = true
    try {
      let query = supabase
        .from('transactions')
        .select('*, category:categories(*), wallet:wallets(*), to_wallet:wallets!transactions_to_wallet_id_fkey(*)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (startDate) query = query.gte('date', startDate)
      if (endDate) query = query.lte('date', endDate)
      if (type) query = query.eq('type', type)
      if (categoryId) query = query.eq('category_id', categoryId)
      if (walletId) query = query.eq('wallet_id', walletId)
      if (search) query = query.ilike('note', `%${search}%`)

      const { data, error } = await query
      if (error) throw error

      if (reset || offset === 0) {
        transactions.value = data || []
      } else {
        transactions.value = [...transactions.value, ...(data || [])]
      }
      hasMore.value = (data?.length || 0) >= pageSize
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(tx) {
    const { data: { user } } = await supabase.auth.getUser()
    const payload = { ...tx, user_id: user.id }

    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select('*, category:categories(*), wallet:wallets(*)')
      .single()
    if (error) throw error

    // Update wallet balance
    if (tx.type === 'income') {
      await supabase.rpc('increment_wallet_balance', { wallet_uuid: tx.wallet_id, amount_val: tx.amount })
    } else if (tx.type === 'expense') {
      await supabase.rpc('increment_wallet_balance', { wallet_uuid: tx.wallet_id, amount_val: -tx.amount })
    } else if (tx.type === 'transfer') {
      await supabase.rpc('increment_wallet_balance', { wallet_uuid: tx.wallet_id, amount_val: -tx.amount })
      if (tx.to_wallet_id) {
        await supabase.rpc('increment_wallet_balance', { wallet_uuid: tx.to_wallet_id, amount_val: tx.amount })
      }
    }

    transactions.value.unshift(data)
    return data
  }

  async function updateTransaction(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(*), wallet:wallets(*)')
      .single()
    if (error) throw error

    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) transactions.value[idx] = data
    return data
  }

  async function deleteTransaction(id) {
    const tx = transactions.value.find(t => t.id === id)
    if (tx) {
      // Reverse balance change
      if (tx.type === 'income') {
        await supabase.rpc('increment_wallet_balance', { wallet_uuid: tx.wallet_id, amount_val: -tx.amount })
      } else if (tx.type === 'expense') {
        await supabase.rpc('increment_wallet_balance', { wallet_uuid: tx.wallet_id, amount_val: tx.amount })
      }
    }

    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  async function getStats(startDate, endDate) {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, category:categories(name, icon, color)')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error

    const income = (data || []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = (data || []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

    const byCategory = {}
    ;(data || []).filter(t => t.type === 'expense').forEach(t => {
      const name = t.category?.name || 'Lainnya'
      if (!byCategory[name]) {
        byCategory[name] = { name, icon: t.category?.icon || '💸', color: t.category?.color || '#64748B', total: 0, count: 0 }
      }
      byCategory[name].total += Number(t.amount)
      byCategory[name].count++
    })

    return { income, expense, net: income - expense, byCategory: Object.values(byCategory) }
  }

  return {
    transactions, loading, hasMore, recentTransactions,
    fetchTransactions, addTransaction, updateTransaction, deleteTransaction, getStats
  }
})
