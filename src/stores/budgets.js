import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = ref([])
  const loading = ref(false)

  async function fetchBudgets(month, year) {
    loading.value = true
    try {
      let query = supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false })

      if (month) query = query.eq('month', month)
      if (year) query = query.eq('year', year)

      const { data, error } = await query
      if (error) throw error
      budgets.value = data || []
    } finally {
      loading.value = false
    }
  }

  async function addBudget(budget) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...budget, user_id: user.id })
      .select('*, category:categories(*)')
      .single()
    if (error) throw error
    budgets.value.push(data)
    return data
  }

  async function updateBudget(id, updates) {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()
    if (error) throw error
    const idx = budgets.value.findIndex(b => b.id === id)
    if (idx !== -1) budgets.value[idx] = data
    return data
  }

  async function deleteBudget(id) {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error
    budgets.value = budgets.value.filter(b => b.id !== id)
  }

  return {
    budgets, loading,
    fetchBudgets, addBudget, updateBudget, deleteBudget
  }
})
