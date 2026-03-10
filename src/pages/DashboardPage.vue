<template>
  <AppShell>
    <div class="px-5 pt-4 space-y-5" :style="{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-display font-bold">{{ greeting }}, {{ displayName }} 👋</h1>
          <p class="text-xs text-muted">{{ todayFormatted }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="$router.push('/profile')" class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center text-sm font-bold border border-primary/20">
            W&D
          </button>
        </div>
      </div>

      <!-- Balance Summary -->
      <BalanceSummary :balance="totalBalance" :income="monthIncome" :expense="monthExpense" />

      <!-- Wallet Carousel -->
      <WalletCarousel :wallets="walletsStore.activeWallets" @select="$router.push('/wallets')" />

      <!-- Quick Actions -->
      <QuickStats @action="handleQuickAction" />

      <!-- Budget Alerts -->
      <div v-if="overBudgets.length" class="space-y-2">
        <h3 class="text-sm font-semibold text-warning">⚠️ Peringatan Budget</h3>
        <div v-for="b in overBudgets" :key="b.id" class="p-3 rounded-xl bg-warning/10 border border-warning/20">
          <p class="text-xs text-warning">
            {{ b.category?.icon }} {{ b.category?.name }}: {{ b.percent }}% terpakai
          </p>
        </div>
      </div>

      <!-- Recent Transactions -->
      <RecentTransactions :transactions="txStore.recentTransactions" @select="openTxDetail" />
    </div>

    <!-- Transaction Form -->
    <TransactionForm
      v-model="showTxForm"
      :categories="categoriesList"
      :wallets="walletsStore.activeWallets"
      :initialType="txFormType"
      @submit="handleAddTransaction"
      @scan="showScanner = true"
    />

    <!-- Receipt Scanner -->
    <ReceiptScanner v-model="showScanner" @result="handleScanResult" />
    <ReceiptResultPanel v-model="showScanResult" :result="scanResultData" @apply="applyScanResult" />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import BalanceSummary from '@/components/dashboard/BalanceSummary.vue'
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
import QuickStats from '@/components/dashboard/QuickStats.vue'
import WalletCarousel from '@/components/dashboard/WalletCarousel.vue'
import TransactionForm from '@/components/transaction/TransactionForm.vue'
import ReceiptScanner from '@/components/transaction/ReceiptScanner.vue'
import ReceiptResultPanel from '@/components/transaction/ReceiptResultPanel.vue'

import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useWalletsStore } from '@/stores/wallets'
import { useBudgetsStore } from '@/stores/budgets'
import { useCategories } from '@/composables/useCategories'
import { useNotifications } from '@/composables/useNotifications'
import { getGreeting, formatDate, dayjs, getMonthRange } from '@/utils/date'

const router = useRouter()
const authStore = useAuthStore()
const txStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const budgetsStore = useBudgetsStore()
const { categories: categoriesList, fetchCategories } = useCategories()
const { requestPermission } = useNotifications()

const greeting = computed(() => getGreeting())
const displayName = computed(() => authStore.displayName)
const totalBalance = computed(() => walletsStore.totalBalance)
const todayFormatted = computed(() => formatDate(new Date(), 'dddd, D MMMM YYYY'))

const showTxForm = ref(false)
const txFormType = ref('expense')
const showScanner = ref(false)
const showScanResult = ref(false)
const scanResultData = ref(null)

// Monthly stats
const monthIncome = ref(0)
const monthExpense = ref(0)
const overBudgets = ref([])

async function loadData() {
  await Promise.all([
    walletsStore.fetchWallets(),
    txStore.fetchTransactions({ reset: true }),
    fetchCategories(),
    budgetsStore.fetchBudgets(dayjs().month() + 1, dayjs().year())
  ])

  // Calculate monthly stats
  const { start, end } = getMonthRange(dayjs().month() + 1, dayjs().year())
  const stats = await txStore.getStats(start, end)
  monthIncome.value = stats.income
  monthExpense.value = stats.expense

  // Calculate budget alerts
  const alerts = []
  for (const b of budgetsStore.budgets) {
    const catSpending = stats.byCategory.find(c => c.name === b.category?.name)
    if (catSpending) {
      const pct = Math.round((catSpending.total / Number(b.amount)) * 100)
      if (pct >= 80) {
        alerts.push({ ...b, percent: pct })
      }
    }
  }
  overBudgets.value = alerts
}

function handleQuickAction(type) {
  if (type === 'scan') {
    showScanner.value = true
  } else {
    txFormType.value = type
    showTxForm.value = true
  }
}

async function handleAddTransaction(data) {
  try {
    await txStore.addTransaction(data)
    await loadData()
  } catch (err) {
    console.error('Error adding transaction:', err)
  }
}

function openTxDetail(tx) {
  router.push('/transactions')
}

function handleScanResult(result) {
  scanResultData.value = result
  showScanner.value = false
  showScanResult.value = true
}

function applyScanResult(result) {
  showScanResult.value = false
  txFormType.value = 'expense'
  showTxForm.value = true
  // The form will receive the result data through the appropriate mechanism
}

onMounted(async () => {
  await loadData()
  requestPermission()
})
</script>
