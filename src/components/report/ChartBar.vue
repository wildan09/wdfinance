<template>
  <div class="glass rounded-2xl p-4">
    <apexchart
      type="bar"
      :height="250"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  incomeData: { type: Array, default: () => [] },
  expenseData: { type: Array, default: () => [] }
})

const series = computed(() => [
  { name: 'Pemasukan', data: props.incomeData },
  { name: 'Pengeluaran', data: props.expenseData }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    background: 'transparent',
    foreColor: '#94A3B8',
    toolbar: { show: false },
    stacked: false
  },
  colors: ['#34D399', '#F87171'],
  plotOptions: {
    bar: { borderRadius: 6, columnWidth: '60%' }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: props.categories,
    labels: { style: { fontSize: '10px', colors: '#94A3B8' } },
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
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    fontSize: '11px',
    labels: { colors: '#94A3B8' }
  }
}))
</script>
