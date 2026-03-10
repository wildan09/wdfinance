import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const store = useAuthStore()
  return {
    user: store.user,
    profile: store.profile,
    loading: store.loading,
    isAuthenticated: store.isAuthenticated,
    displayName: store.displayName,
    login: store.login,
    logout: store.logout,
    updateProfile: store.updateProfile,
    init: store.init
  }
}
