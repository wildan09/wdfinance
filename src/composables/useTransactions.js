import { useTransactionsStore } from '@/stores/transactions'
import { storeToRefs } from 'pinia'

export function useTransactions() {
  const store = useTransactionsStore()
  const { transactions, loading, hasMore, recentTransactions } = storeToRefs(store)

  return {
    transactions,
    loading,
    hasMore,
    recentTransactions,
    fetchTransactions: store.fetchTransactions,
    addTransaction: store.addTransaction,
    updateTransaction: store.updateTransaction,
    deleteTransaction: store.deleteTransaction,
    getStats: store.getStats
  }
}
