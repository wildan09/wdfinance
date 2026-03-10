<template>
  <AppShell>
    <TopBar title="Laporan" />

    <div class="px-5 pb-4 space-y-5">
      <!-- Period Tabs -->
      <div class="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto scroll-x">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
          :class="activeTab === tab.key ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Summary Cards -->
      <ReportSummary :income="stats.income" :expense="stats.expense" :net="stats.net" />

      <!-- Donut Chart -->
      <div>
        <h3 class="text-sm font-semibold mb-3">Komposisi Pengeluaran</h3>
        <ChartDonut v-if="stats.byCategory.length" :data="stats.byCategory" />
        <p v-else class="text-center text-muted text-sm py-8">Belum ada data pengeluaran</p>
      </div>

      <!-- Bar Chart -->
      <div>
        <h3 class="text-sm font-semibold mb-3">Pemasukan vs Pengeluaran</h3>
        <ChartBar :categories="barLabels" :incomeData="barIncomeData" :expenseData="barExpenseData" />
      </div>

      <!-- Line Chart -->
      <div>
        <h3 class="text-sm font-semibold mb-3">Trend Saldo</h3>
        <ChartLine :labels="lineLabels" :data="lineData" />
      </div>

      <!-- Category Table -->
      <div v-if="stats.byCategory.length">
        <h3 class="text-sm font-semibold mb-3">Detail per Kategori</h3>
        <div class="glass rounded-2xl overflow-hidden">
          <div v-for="(cat, idx) in stats.byCategory" :key="idx"
            class="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
            <span class="text-lg">{{ cat.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ cat.name }}</p>
              <p class="text-xs text-muted">{{ cat.count }} transaksi</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold">{{ formatCurrency(cat.total) }}</p>
              <p class="text-[10px] text-muted">{{ catPercent(cat.total) }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Buttons -->
      <div class="flex gap-3">
        <button
          @click="handleExportPDF"
          :disabled="exporting"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-sm font-medium"
        >
          📄 Unduh PDF
        </button>
        <button
          @click="handleExportExcel"
          :disabled="exporting"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass hover:bg-white/10 transition-colors text-sm font-medium"
        >
          📊 Unduh Excel
        </button>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import TopBar from '@/components/layout/TopBar.vue'
import ReportSummary from '@/components/report/ReportSummary.vue'
import ChartDonut from '@/components/report/ChartDonut.vue'
import ChartBar from '@/components/report/ChartBar.vue'
import ChartLine from '@/components/report/ChartLine.vue'

import { useTransactionsStore } from '@/stores/transactions'
import { useWalletsStore } from '@/stores/wallets'
import { useExport } from '@/composables/useExport'
import { formatCurrency } from '@/utils/currency'
import { dayjs, getMonthName } from '@/utils/date'

const txStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const { exporting, exportPDF, exportExcel } = useExport()

const tabs = [
  { key: 'week', label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'year', label: 'Tahun Ini' }
]

const activeTab = ref('month')
const stats = ref({ income: 0, expense: 0, net: 0, byCategory: [] })
const allTransactions = ref([])

// Bar chart data (6 months)
const barLabels = ref([])
const barIncomeData = ref([])
const barExpenseData = ref([])

// Line chart data (30 days)
const lineLabels = ref([])
const lineData = ref([])

function getDateRange() {
  const now = dayjs()
  if (activeTab.value === 'week') {
    return { start: now.startOf('week').format('YYYY-MM-DD'), end: now.endOf('week').format('YYYY-MM-DD') }
  }
  if (activeTab.value === 'year') {
    return { start: now.startOf('year').format('YYYY-MM-DD'), end: now.endOf('year').format('YYYY-MM-DD') }
  }
  return { start: now.startOf('month').format('YYYY-MM-DD'), end: now.endOf('month').format('YYYY-MM-DD') }
}

function catPercent(total) {
  return stats.value.expense ? Math.round((total / stats.value.expense) * 100) : 0
}

async function loadData() {
  const { start, end } = getDateRange()
  stats.value = await txStore.getStats(start, end)

  await txStore.fetchTransactions({ startDate: start, endDate: end, reset: true })
  allTransactions.value = txStore.transactions

  // Bar chart - last 6 months
  const bLabels = []
  const bIncome = []
  const bExpense = []
  for (let i = 5; i >= 0; i--) {
    const m = dayjs().subtract(i, 'month')
    bLabels.push(getMonthName(m.month() + 1).slice(0, 3))
    const s = m.startOf('month').format('YYYY-MM-DD')
    const e = m.endOf('month').format('YYYY-MM-DD')
    const mStats = await txStore.getStats(s, e)
    bIncome.push(mStats.income)
    bExpense.push(mStats.expense)
  }
  barLabels.value = bLabels
  barIncomeData.value = bIncome
  barExpenseData.value = bExpense

  // Line chart - last 30 days balance trend (simplified)
  const lLabels = []
  const lData = []
  let runningBalance = walletsStore.totalBalance
  for (let i = 0; i < 30; i++) {
    const d = dayjs().subtract(29 - i, 'day')
    lLabels.push(d.format('D/M'))
    // Simplified: use total balance with random variation for demo
    lData.push(Math.max(0, runningBalance + (Math.random() - 0.5) * runningBalance * 0.05))
  }
  lineLabels.value = lLabels
  lineData.value = lData
}

async function handleExportPDF() {
  const periodLabel = tabs.find(t => t.key === activeTab.value)?.label || 'Laporan'
  await exportPDF(allTransactions.value, stats.value, periodLabel)
}

async function handleExportExcel() {
  await exportExcel(allTransactions.value, stats.value, walletsStore.wallets)
}

watch(activeTab, () => loadData())

onMounted(async () => {
  await walletsStore.fetchWallets()
  await loadData()
})
</script>
