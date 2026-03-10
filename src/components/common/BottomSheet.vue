<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-end justify-center" @click.self="close">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
        <Transition name="slide-up">
          <div
            v-if="modelValue"
            class="relative w-full max-w-[430px] bg-surface rounded-t-3xl overflow-hidden"
            :style="{ maxHeight: maxHeight }"
          >
            <!-- Handle bar -->
            <div class="flex justify-center pt-3 pb-2 cursor-grab" @click="close">
              <div class="w-10 h-1 bg-white/20 rounded-full"></div>
            </div>

            <!-- Title -->
            <div v-if="title" class="px-5 pb-3 flex items-center justify-between">
              <h3 class="text-lg font-semibold font-display">{{ title }}</h3>
              <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <span class="text-muted text-lg">✕</span>
              </button>
            </div>

            <!-- Content -->
            <div class="overflow-y-auto overscroll-contain" :style="{ maxHeight: `calc(${maxHeight} - 60px)` }">
              <slot></slot>
            </div>

            <!-- Safe area bottom padding -->
            <div class="h-[env(safe-area-inset-bottom,0px)]"></div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  maxHeight: { type: String, default: '85vh' }
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>
