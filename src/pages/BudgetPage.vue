<template>
  <AppShell>
    <TopBar :title="`Budget ${monthLabel} ${year}`" />

    <div class="px-5 pb-4 space-y-4">
      <!-- Month/Year Selector -->
      <div class="flex items-center justify-between">
        <button @click="prevMonth" class="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-text">←</button>
        <span class="text-sm font-semibold">{{ monthLabel }} {{ year }}</span>
        <button @click="nextMonth" class="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-text">→</button>
      </div>

      <!-- Progress overview -->
      <BudgetProgress :totalBudget="totalBudget" :totalSpent="totalSpent" />

      <!-- Loading -->
      <SkeletonCard v-if="loading" :count="3" />

      <!-- Budget list -->
      <div v-else-if="budgetsWithSpent.length" class="space-y-3">
        <BudgetCard
          v-for="b in budgetsWithSpent"
          :key="b.id"
          :budget="b"
          :spent="b.spent"
        />
      </div>

      <EmptyState v-else icon="📊" title="Belum ada budget" description="Buat budget untuk mengontrol pengeluaranmu." actionLabel="Tambah Budget" @action="showForm = true" />
    </div>

    <!-- FAB -->
    <button
      @click="showForm = true"
      class="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-2xl text-bg shadow-lg shadow-primary/30 hover:scale-105 transition-transform btn-press z-40"
      style="right: max(1rem, calc((100vw - 430px) / 2 + 1rem))"
    >
      +
    </button>

    <!-- Budget Form -->
    <BudgetForm
      v-model="showForm"
      :categories="categoriesList"
      @submit="handleAddBudget"
    />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import TopBar from '@/components/layout/TopBar.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BudgetCard from '@/components/budget/BudgetCard.vue'
import BudgetForm from '@/components/budget/BudgetForm.vue'
import BudgetProgress from '@/components/budget/BudgetProgress.vue'

import { useBudgetsStore } from '@/stores/budgets'
import { useTransactionsStore } from '@/stores/transactions'
import { useCategories } from '@/composables/useCategories'
import { getMonthName, getMonthRange, dayjs } from '@/utils/date'

const budgetsStore = useBudgetsStore()
const txStore = useTransactionsStore()
const { categories: categoriesList, fetchCategories } = useCategories()

const month = ref(dayjs().month() + 1)
const year = ref(dayjs().year())
const showForm = ref(false)
const categorySpending = ref({})
const loading = computed(() => budgetsStore.loading)

const monthLabel = computed(() => getMonthName(month.value))

const budgetsWithSpent = computed(() =>
  budgetsStore.budgets.map(b => ({
    ...b,
    spent: categorySpending.value[b.category?.name] || 0
  }))
)

const totalBudget = computed(() =>
  budgetsStore.budgets.reduce((s, b) => s + Number(b.amount), 0)
)

const totalSpent = computed(() =>
  Object.values(categorySpending.value).reduce((s, v) => s + v, 0)
)

function prevMonth() {
  if (month.value === 1) { month.value = 12; year.value-- }
  else { month.value-- }
}

function nextMonth() {
  if (month.value === 12) { month.value = 1; year.value++ }
  else { month.value++ }
}

async function loadData() {
  await budgetsStore.fetchBudgets(month.value, year.value)
  const { start, end } = getMonthRange(month.value, year.value)
  const stats = await txStore.getStats(start, end)
  const spending = {}
  stats.byCategory.forEach(c => { spending[c.name] = c.total })
  categorySpending.value = spending
}

async function handleAddBudget(data) {
  try {
    await budgetsStore.addBudget({
      ...data,
      month: month.value,
      year: year.value
    })
    await loadData()
  } catch (err) {
    console.error(err)
  }
}

watch([month, year], () => loadData())

onMounted(async () => {
  await fetchCategories()
  await loadData()
})
</script>
