<template>
  <BottomSheet v-model="show" title="Scan Struk Belanja" maxHeight="90vh">
    <div class="px-5 pb-6">
      <!-- Choose source -->
      <div v-if="!previewUrl && !isScanning" class="space-y-3">
        <button @click="openCamera" class="w-full flex items-center gap-3 p-4 rounded-xl glass hover:bg-white/10 transition-colors btn-press">
          <span class="text-2xl">📷</span>
          <div class="text-left">
            <p class="text-sm font-medium">Buka Kamera</p>
            <p class="text-xs text-muted">Foto struk langsung</p>
          </div>
        </button>

        <button @click="openGallery" class="w-full flex items-center gap-3 p-4 rounded-xl glass hover:bg-white/10 transition-colors btn-press">
          <span class="text-2xl">🖼️</span>
          <div class="text-left">
            <p class="text-sm font-medium">Pilih dari Galeri</p>
            <p class="text-xs text-muted">Gunakan foto yang sudah ada</p>
          </div>
        </button>

        <input ref="cameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onFileSelected" />
        <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="onFileSelected" />
      </div>

      <!-- Preview -->
      <div v-if="previewUrl && !isScanning && !scanResult && !scanError" class="space-y-4">
        <div class="relative rounded-xl overflow-hidden">
          <img :src="previewUrl" alt="Preview struk" class="w-full max-h-[300px] object-contain bg-black/40 rounded-xl" />
        </div>
        <div class="flex gap-3">
          <button @click="reset" class="flex-1 py-3 rounded-xl glass text-muted text-sm font-medium hover:bg-white/10 transition-colors">
            Ganti Foto
          </button>
          <button @click="analyze" class="flex-1 py-3 rounded-xl bg-primary text-bg text-sm font-semibold hover:bg-primary-dark transition-colors btn-press">
            🔍 Analisis dengan AI
          </button>
        </div>
      </div>

      <!-- Scanning animation -->
      <div v-if="isScanning" class="space-y-4">
        <div class="relative rounded-xl overflow-hidden">
          <img :src="previewUrl" alt="Scanning" class="w-full max-h-[250px] object-contain bg-black/40 rounded-xl opacity-60" />
          <div class="scan-line-effect"></div>
        </div>
        <div class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
            <span class="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span class="text-sm text-muted">AI sedang membaca struk...</span>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="scanError" class="space-y-4">
        <div class="p-4 rounded-xl bg-expense/10 border border-expense/20 text-center">
          <span class="text-3xl block mb-2">❌</span>
          <p class="text-sm text-expense">{{ scanError }}</p>
        </div>
        <button @click="reset" class="w-full py-3 rounded-xl glass text-sm font-medium hover:bg-white/10 transition-colors">
          Coba Lagi
        </button>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import { useReceiptScanner } from '@/composables/useReceiptScanner'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'result'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const { isScanning, scanResult, scanError, previewUrl, scanReceipt, reset: resetScanner } = useReceiptScanner()

const cameraInput = ref(null)
const galleryInput = ref(null)
const selectedFile = ref(null)

function openCamera() { cameraInput.value?.click() }
function openGallery() { galleryInput.value?.click() }

function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function analyze() {
  if (!selectedFile.value) return
  const result = await scanReceipt(selectedFile.value)
  if (result) {
    emit('result', result)
  }
}

function reset() {
  resetScanner()
  selectedFile.value = null
  if (cameraInput.value) cameraInput.value.value = ''
  if (galleryInput.value) galleryInput.value.value = ''
}

watch(show, (v) => {
  if (!v) reset()
})
</script>
