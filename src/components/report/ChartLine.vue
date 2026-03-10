<template>
  <div class="glass rounded-2xl p-4">
    <apexchart
      type="area"
      :height="200"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] }
})

const series = computed(() => [{
  name: 'Saldo',
  data: props.data
}])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    background: 'transparent',
    foreColor: '#94A3B8',
    toolbar: { show: false },
    sparkline: { enabled: false }
  },
  colors: ['#6EE7B7'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100]
    }
  },
  stroke: { curve: 'smooth', width: 2 },
  dataLabels: { enabled: false },
  xaxis: {
    categories: props.labels,
    labels: { style: { fontSize: '9px', colors: '#94A3B8' }, rotate: -45 },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { fontSize: '10px', colors: '#94A3B8' },
      formatter: (val) => `${(val / 1000000).toFixed(1)}jt`
    }
  },
  grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val) => `Rp ${val.toLocaleString('id-ID')}` }
  }
}))
</script>
