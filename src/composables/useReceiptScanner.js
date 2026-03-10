import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useReceiptScanner() {
  const isScanning = ref(false)
  const scanResult = ref(null)
  const scanError = ref(null)
  const previewUrl = ref(null)

  const compressImage = (file) => new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      const max = 1600
      let w = img.width
      let h = img.height
      if (w > max || h > max) {
        if (w > h) { h = (h / w) * max; w = max }
        else { w = (w / h) * max; h = max }
      }
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob(resolve, 'image/jpeg', 0.82)
    }
    img.src = URL.createObjectURL(file)
  })

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const scanReceipt = async (file) => {
    isScanning.value = true
    scanError.value = null
    scanResult.value = null
    previewUrl.value = URL.createObjectURL(file)

    try {
      const compressed = await compressImage(file)
      const base64 = await toBase64(compressed)

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: { image: base64, mimeType: 'image/jpeg' }
      })

      if (error) throw error
      if (data.error) {
        scanError.value = data.error
        return null
      }

      scanResult.value = data
      return data
    } catch (err) {
      scanError.value = 'Gagal membaca struk. Pastikan foto jelas dan cukup terang.'
      return null
    } finally {
      isScanning.value = false
    }
  }

  const reset = () => {
    isScanning.value = false
    scanResult.value = null
    scanError.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = null
  }

  return { isScanning, scanResult, scanError, previewUrl, scanReceipt, reset }
}
