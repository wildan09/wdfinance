import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useSavingsStore = defineStore('savings', () => {
  const goals = ref([])
  const loading = ref(false)

  const activeGoals = computed(() => goals.value.filter(g => !g.is_completed))
  const completedGoals = computed(() => goals.value.filter(g => g.is_completed))

  async function fetchGoals() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*, wallet:wallets!wallet_id(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      goals.value = data || []
    } finally {
      loading.value = false
    }
  }

  async function addGoal(goal) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ ...goal, user_id: user.id })
      .select('*, wallet:wallets!wallet_id(*)')
      .single()
    if (error) throw error
    goals.value.unshift(data)
    return data
  }

  async function updateGoal(id, updates) {
    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .select('*, wallet:wallets!wallet_id(*)')
      .single()
    if (error) throw error
    const idx = goals.value.findIndex(g => g.id === id)
    if (idx !== -1) goals.value[idx] = data
    return data
  }

  async function addFunds(id, amount) {
    const goal = goals.value.find(g => g.id === id)
    if (!goal) return
    const newAmount = Number(goal.current_amount) + Number(amount)
    const isCompleted = newAmount >= Number(goal.target_amount)
    return updateGoal(id, {
      current_amount: newAmount,
      is_completed: isCompleted
    })
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (error) throw error
    goals.value = goals.value.filter(g => g.id !== id)
  }

  return {
    goals, loading, activeGoals, completedGoals,
    fetchGoals, addGoal, updateGoal, addFunds, deleteGoal
  }
})
