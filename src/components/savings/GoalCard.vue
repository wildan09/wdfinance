<template>
  <div class="glass rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:bg-white/5 transition-colors" @click="$emit('click', goal)">
    <div class="flex items-start gap-3">
      <!-- Circular progress -->
      <div class="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2.5"/>
          <circle cx="18" cy="18" r="15.915" fill="none"
            :stroke="goal.color || '#10B981'" stroke-width="2.5"
            stroke-linecap="round"
            :stroke-dasharray="`${percent}, 100`"
            class="transition-all duration-700"/>
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-lg">{{ goal.icon }}</span>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <p class="text-sm font-medium truncate">{{ goal.name }}</p>
          <span class="text-xs font-bold" :class="goal.is_completed ? 'text-income' : 'text-muted'">{{ percent }}%</span>
        </div>
        <p class="text-xs text-muted mb-2">
          {{ formatCurrency(goal.current_amount) }} / {{ formatCurrency(goal.target_amount) }}
        </p>

        <!-- Progress bar -->
        <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500"
            :style="{ width: percent + '%', background: goal.color || '#10B981' }"></div>
        </div>

        <div v-if="goal.deadline && !goal.is_completed" class="flex items-center gap-1 mt-2">
          <span class="text-[10px] text-muted">⏰ {{ daysLeft >= 0 ? `${daysLeft} hari lagi` : 'Sudah lewat' }}</span>
        </div>

        <!-- Completed badge -->
        <div v-if="goal.is_completed" class="mt-2 flex items-center gap-1 text-income text-xs font-medium">
          🎉 Tercapai!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'
import { dayjs } from '@/utils/date'

const props = defineProps({
  goal: { type: Object, required: true }
})

defineEmits(['click'])

const percent = computed(() => {
  if (!props.goal.target_amount) return 0
  return Math.min(Math.round((Number(props.goal.current_amount) / Number(props.goal.target_amount)) * 100), 100)
})

const daysLeft = computed(() => {
  if (!props.goal.deadline) return null
  return dayjs(props.goal.deadline).diff(dayjs(), 'day')
})
</script>
