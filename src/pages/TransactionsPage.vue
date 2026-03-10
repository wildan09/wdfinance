<template>
  <AppShell>
    <TopBar title="Transaksi">
      <template #actions>
        <button @click="showFilter = true" class="w-9 h-9 rounded-xl glass flex items-center justify-center text-sm">
          🔍
        </button>
      </template>
    </TopBar>

    <div class="px-5 pb-4">
      <!-- Search bar -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari catatan transaksi..."
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text placeholder-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
          @input="debouncedSearch"
        />
      </div>

      <!-- Loading -->
      <SkeletonCard v-if="loading && transactions.length === 0" :count="5" />

      <!-- Transaction List -->
      <TransactionList
        v-else
        :transactions="transactions"
        @select="openDetail"
        @add="openAddForm"
      />

      <!-- Load more -->
      <div v-if="hasMore && transactions.length > 0" class="py-4 text-center">
        <button @click="loadMore" class="px-6 py-2 rounded-xl glass text-sm text-muted hover:text-text transition-colors" :disabled="loading">
          {{ loading ? 'Memuat...' : 'Muat Lebih Banyak' }}
        </button>
      </div>
    </div>

    <!-- FAB -->
    <button
      @click="openAddForm"
      class="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-2xl text-bg shadow-lg shadow-primary/30 hover:scale-105 transition-transform btn-press z-40"
      style="max-width: calc((430px - 2rem)); right: max(1rem, calc((100vw - 430px) / 2 + 1rem))"
    >
      +
    </button>

    <!-- Forms -->
    <TransactionForm
      v-model="showForm"
      :categories="categoriesList"
      :wallets="walletsList"
      :editData="editTx"
      :initialType="formType"
      @submit="handleSubmit"
      @scan="showScanner = true"
    />

    <TransactionFilter
      v-model="showFilter"
      :categories="categoriesList"
      :wallets="walletsList"
      @apply="handleFilter"
    />

    <ReceiptScanner v-model="showScanner" @result="handleScanResult" />
    <ReceiptResultPanel v-model="showScanResult" :result="scanData" @apply="applyScan" />

    <!-- Detail Bottom Sheet -->
    <BottomSheet v-model="showDetail" title="Detail Transaksi">
      <div v-if="selectedTx" class="px-5 pb-6 space-y-4">
        <div class="text-center">
          <span class="text-4xl block mb-2">{{ selectedTx.category?.icon || '💰' }}</span>
          <p class="text-2xl font-bold"
            :class="selectedTx.type === 'income' ? 'text-income' : 'text-expense'">
            {{ selectedTx.type === 'income' ? '+' : '-' }}{{ formatCurrency(selectedTx.amount) }}
          </p>
          <p class="text-xs text-muted mt-1">{{ selectedTx.category?.name || 'Transfer' }}</p>
        </div>
        <div class="glass rounded-xl p-4 space-y-3 text-sm">
          <div class="flex justify-between"><span class="text-muted">Tanggal</span><span>{{ formatDate(selectedTx.date) }}</span></div>
          <div class="flex justify-between"><span class="text-muted">Wallet</span><span>{{ selectedTx.wallet?.name || '-' }}</span></div>
          <div v-if="selectedTx.note" class="flex justify-between"><span class="text-muted">Catatan</span><span>{{ selectedTx.note }}</span></div>
        </div>
        <div class="flex gap-3">
          <button @click="editTransaction" class="flex-1 py-3 rounded-xl glass text-sm font-medium hover:bg-white/10 transition-colors">✏️ Edit</button>
          <button @click="confirmDelete" class="flex-1 py-3 rounded-xl bg-expense/10 text-expense text-sm font-medium hover:bg-expense/20 transition-colors">🗑️ Hapus</button>
        </div>
      </div>
    </BottomSheet>
  </AppShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import TopBar from '@/components/layout/TopBar.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import TransactionList from '@/components/transaction/TransactionList.vue'
import TransactionForm from '@/components/transaction/TransactionForm.vue'
import TransactionFilter from '@/components/transaction/TransactionFilter.vue'
import ReceiptScanner from '@/components/transaction/ReceiptScanner.vue'
import ReceiptResultPanel from '@/components/transaction/ReceiptResultPanel.vue'

import { useTransactionsStore } from '@/stores/transactions'
import { useWalletsStore } from '@/stores/wallets'
import { useCategories } from '@/composables/useCategories'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { debounce } from '@/utils/formatters'

const txStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const { categories: categoriesList, fetchCategories } = useCategories()

const transactions = ref([])
const loading = ref(false)
const hasMore = ref(true)
const searchQuery = ref('')
const activeFilters = ref({})

const showForm = ref(false)
const showFilter = ref(false)
const showDetail = ref(false)
const showScanner = ref(false)
const showScanResult = ref(false)
const formType = ref('expense')
const editTx = ref(null)
const selectedTx = ref(null)
const scanData = ref(null)

const walletsList = ref([])

async function loadTransactions(reset = false) {
  loading.value = true
  try {
    await txStore.fetchTransactions({
      ...activeFilters.value,
      search: searchQuery.value || undefined,
      offset: reset ? 0 : txStore.transactions.length,
      reset
    })
    transactions.value = txStore.transactions
    hasMore.value = txStore.hasMore
  } finally {
    loading.value = false
  }
}

function loadMore() {
  loadTransactions(false)
}

const debouncedSearch = debounce(() => {
  loadTransactions(true)
}, 400)

function handleFilter(filters) {
  activeFilters.value = filters
  loadTransactions(true)
}

function openAddForm() {
  editTx.value = null
  formType.value = 'expense'
  showForm.value = true
}

function openDetail(tx) {
  selectedTx.value = tx
  showDetail.value = true
}

function editTransaction() {
  editTx.value = selectedTx.value
  showDetail.value = false
  showForm.value = true
}

async function handleSubmit(data) {
  try {
    if (editTx.value) {
      await txStore.updateTransaction(editTx.value.id, data)
    } else {
      await txStore.addTransaction(data)
    }
    await loadTransactions(true)
    await walletsStore.fetchWallets()
  } catch (err) {
    console.error(err)
  }
}

async function confirmDelete() {
  if (!selectedTx.value) return
  if (!confirm('Hapus transaksi ini?')) return
  try {
    await txStore.deleteTransaction(selectedTx.value.id)
    showDetail.value = false
    await loadTransactions(true)
    await walletsStore.fetchWallets()
  } catch (err) {
    console.error(err)
  }
}

function handleScanResult(result) {
  scanData.value = result
  showScanner.value = false
  showScanResult.value = true
}

function applyScan(result) {
  showScanResult.value = false
  formType.value = 'expense'
  showForm.value = true
}

onMounted(async () => {
  await Promise.all([fetchCategories(), walletsStore.fetchWallets()])
  walletsList.value = walletsStore.activeWallets
  await loadTransactions(true)
})
</script>
