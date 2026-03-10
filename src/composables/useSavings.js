import { useSavingsStore } from '@/stores/savings'
import { storeToRefs } from 'pinia'

export function useSavings() {
  const store = useSavingsStore()
  const { goals, loading, activeGoals, completedGoals } = storeToRefs(store)

  return {
    goals,
    loading,
    activeGoals,
    completedGoals,
    fetchGoals: store.fetchGoals,
    addGoal: store.addGoal,
    updateGoal: store.updateGoal,
    addFunds: store.addFunds,
    deleteGoal: store.deleteGoal
  }
}
