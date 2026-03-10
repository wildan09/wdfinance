<template>
  <div class="glass rounded-2xl p-4">
    <apexchart
      type="donut"
      :height="240"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] }
})

const series = computed(() => props.data.map(d => d.total))

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    background: 'transparent',
    foreColor: '#94A3B8'
  },
  labels: props.data.map(d => `${d.icon} ${d.name}`),
  colors: props.data.map(d => d.color),
  stroke: { show: false },
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    fontSize: '11px',
    labels: { colors: '#94A3B8' },
    markers: { width: 8, height: 8, radius: 4 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: { fontSize: '12px', color: '#F1F5F9' },
          value: {
            fontSize: '18px',
            fontWeight: 700,
            color: '#F1F5F9',
            formatter: (val) => `Rp ${Number(val).toLocaleString('id-ID')}`
          },
          total: {
            show: true,
            label: 'Total',
            color: '#94A3B8',
            formatter: (w) => {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              return `Rp ${total.toLocaleString('id-ID')}`
            }
          }
        }
      }
    }
  },
  tooltip: { theme: 'dark' },
  responsive: [{
    breakpoint: 480,
    options: { chart: { height: 220 } }
  }]
}))
</script>
