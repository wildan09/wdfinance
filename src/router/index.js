import { createRouter, createWebHistory } from 'vue-router'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/pages/TransactionsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/budget',
    name: 'Budget',
    component: () => import('@/pages/BudgetPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/pages/ReportPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/savings',
    name: 'Savings',
    component: () => import('@/pages/SavingsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wallets',
    name: 'Wallets',
    component: () => import('@/pages/WalletsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  if (!isSupabaseConfigured) {
    // If Supabase isn't configured, allow login page, redirect everything else to login
    if (to.meta.requiresAuth) next('/login')
    else next()
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (to.meta.requiresAuth && !session) {
      next('/login')
    } else if (to.path === '/login' && session) {
      next('/')
    } else {
      next()
    }
  } catch (e) {
    if (to.meta.requiresAuth) next('/login')
    else next()
  }
})

export default router
