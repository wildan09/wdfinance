<template>
  <AppShell>
    <TopBar title="Target Tabungan" />

    <div class="px-5 pb-4 space-y-4">
      <SkeletonCard v-if="loading" :count="3" />

      <template v-else>
        <!-- Active Goals -->
        <div v-if="activeGoals.length" class="space-y-3">
          <h3 class="text-sm font-semibold text-muted">Sedang Berjalan</h3>
          <GoalCard v-for="goal in activeGoals" :key="goal.id" :goal="goal" @click="openDetail(goal)" />
        </div>

        <!-- Completed Goals -->
        <div v-if="completedGoals.length" class="space-y-3">
          <h3 class="text-sm font-semibold text-muted">Tercapai 🎉</h3>
          <GoalCard v-for="goal in completedGoals" :key="goal.id" :goal="goal" @click="openDetail(goal)" />
        </div>

        <EmptyState
          v-if="!activeGoals.length && !completedGoals.length"
          icon="🎯"
          title="Belum ada target tabungan"
          description="Buat target untuk memotivasi kamu menabung!"
          actionLabel="Buat Target"
          @action="showForm = true"
        />
      </template>
    </div>

    <!-- FAB -->
    <button
      @click="showForm = true"
      class="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-2xl text-bg shadow-lg shadow-primary/30 hover:scale-105 transition-transform btn-press z-40"
      style="right: max(1rem, calc((100vw - 430px) / 2 + 1rem))"
    >
      +
    </button>

    <!-- Goal Form -->
    <GoalForm v-model="showForm" :wallets="walletsList" :editData="editGoal" @submit="handleAddGoal" />

    <!-- Detail & Add Funds -->
    <BottomSheet v-model="showDetail" title="Detail Target">
      <div v-if="selectedGoal" class="px-5 pb-6 space-y-4">
        <div class="text-center">
          <span class="text-5xl block mb-2">{{ selectedGoal.icon }}</span>
          <p class="text-lg font-bold">{{ selectedGoal.name }}</p>
          <p class="text-sm text-muted">{{ formatCurrency(selectedGoal.current_amount) }} / {{ formatCurrency(selectedGoal.target_amount) }}</p>
        </div>

        <!-- Add funds -->
        <div v-if="!selectedGoal.is_completed" class="space-y-3">
          <label class="text-xs text-muted block">Tambah Dana</label>
          <CurrencyInput v-model="addFundAmount" />
          <button @click="handleAddFunds" :disabled="addFundAmount <= 0"
            class="w-full py-3 rounded-xl bg-primary text-bg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40">
            ➕ Tambah Dana
          </button>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button @click="handleEdit" class="flex-1 py-3 rounded-xl glass text-sm font-medium hover:bg-white/10 transition-colors">
            ✏️ Edit Target
          </button>
          <button @click="handleDelete" class="flex-1 py-3 rounded-xl bg-expense/10 text-expense text-sm font-medium hover:bg-expense/20 transition-colors">
            🗑️ Hapus
          </button>
        </div>
      </div>
    </BottomSheet>

    <!-- Confetti -->
    <Teleport to="body">
      <div v-if="showConfetti" class="fixed inset-0 z-[500] pointer-events-none">
        <div v-for="i in 50" :key="i"
          class="absolute w-3 h-3 rounded-sm"
          :style="{
            left: Math.random() * 100 + '%',
            background: ['#34D399','#F87171','#FBBF24','#60A5FA','#A78BFA','#F472B6'][i % 6],
            animation: `confetti-fall ${1.5 + Math.random() * 2}s linear forwards`,
            animationDelay: Math.random() * 0.5 + 's'
          }"></div>
      </div>
    </Teleport>
  </AppShell>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import TopBar from '@/components/layout/TopBar.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import GoalCard from '@/components/savings/GoalCard.vue'
import GoalForm from '@/components/savings/GoalForm.vue'

import { useSavingsStore } from '@/stores/savings'
import { useWalletsStore } from '@/stores/wallets'
import { useNotifications } from '@/composables/useNotifications'
import { formatCurrency } from '@/utils/currency'

const savingsStore = useSavingsStore()
const walletsStore = useWalletsStore()
const { sendGoalComplete } = useNotifications()
const toast = inject('toast')

const loading = ref(false)
const showForm = ref(false)
const showDetail = ref(false)
const showConfetti = ref(false)
const selectedGoal = ref(null)
const editGoal = ref(null)
const addFundAmount = ref(0)


const activeGoals = ref([])
const completedGoals = ref([])
const walletsList = ref([])

async function loadData() {
  loading.value = true
  try {
    await savingsStore.fetchGoals()
    activeGoals.value = savingsStore.activeGoals
    completedGoals.value = savingsStore.completedGoals
  } finally {
    loading.value = false
  }
}

function openDetail(goal) {
  selectedGoal.value = goal
  addFundAmount.value = 0
  showDetail.value = true
}

function handleEdit() {
  editGoal.value = selectedGoal.value
  showDetail.value = false
  showForm.value = true
}

async function handleAddGoal(data) {
  try {
    if (editGoal.value) {
      await savingsStore.updateGoal(editGoal.value.id, data)
      toast.show({ title: 'Berhasil', message: 'Target berhasil diperbarui.', type: 'success' })
    } else {
      await savingsStore.addGoal(data)
      toast.show({ title: 'Berhasil', message: 'Target baru berhasil ditambahkan.', type: 'success' })
    }
    showForm.value = false
    editGoal.value = null
    await loadData()
  } catch (err) {
    console.error(err)
    toast.show({ title: 'Gagal', message: 'Terjadi kesalahan saat menyimpan target.', type: 'error' })
  }
}

async function handleAddFunds() {
  if (!selectedGoal.value || addFundAmount.value <= 0) return
  try {
    const result = await savingsStore.addFunds(selectedGoal.value.id, addFundAmount.value)
    if (result?.is_completed) {
      showConfetti.value = true
      sendGoalComplete(selectedGoal.value.name)
      setTimeout(() => { showConfetti.value = false }, 3000)
    }
    showDetail.value = false
    await loadData()
  } catch (err) {
    console.error(err)
  }
}

async function handleDelete() {
  if (!selectedGoal.value) return
  if (!confirm('Hapus target ini secara permanen?')) return
  try {
    await savingsStore.deleteGoal(selectedGoal.value.id)
    showDetail.value = false
    toast.show({ title: 'Berhasil', message: 'Target dihapus.', type: 'success' })
    await loadData()
  } catch (err) {
    console.error(err)
    toast.show({ title: 'Gagal', message: err.message || 'Gagal menghapus target.', type: 'error' })
  }
}

onMounted(async () => {
  await walletsStore.fetchWallets()
  walletsList.value = walletsStore.activeWallets
  await loadData()
})
</script>
