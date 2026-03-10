import { useWalletsStore } from '@/stores/wallets'
import { storeToRefs } from 'pinia'

export function useWallets() {
  const store = useWalletsStore()
  const { wallets, loading, totalBalance, activeWallets } = storeToRefs(store)

  return {
    wallets,
    loading,
    totalBalance,
    activeWallets,
    fetchWallets: store.fetchWallets,
    addWallet: store.addWallet,
    updateWallet: store.updateWallet,
    deleteWallet: store.deleteWallet,
    getWalletById: store.getWalletById
  }
}
