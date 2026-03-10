import { useBudgetsStore } from '@/stores/budgets'
import { storeToRefs } from 'pinia'

export function useBudgets() {
  const store = useBudgetsStore()
  const { budgets, loading } = storeToRefs(store)

  return {
    budgets,
    loading,
    fetchBudgets: store.fetchBudgets,
    addBudget: store.addBudget,
    updateBudget: store.updateBudget,
    deleteBudget: store.deleteBudget
  }
}
