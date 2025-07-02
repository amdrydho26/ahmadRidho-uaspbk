<template>
  <div class="page-header">
    <span class="page-icon"><IconChartLine /></span>
    <h1>Grafik Keuangan</h1>
  </div>
  <div class="chart-container">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import IconChartLine from '~icons/mdi/chart-line';
import { Line } from 'vue-chartjs';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransaksiStore } from '../store';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const store = useTransaksiStore();
const { transaksi } = storeToRefs(store);

const chartData = ref(null);
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: { display: true },
    tooltip: { enabled: true },
  },
  scales: {
    x: { stacked: false },
    y: { beginAtZero: true, stacked: false }
  }
});

const tanggalSet = computed(() => Array.from(new Set(transaksi.value.map(t => t.tanggal))));
const pemasukan = computed(() => tanggalSet.value.map(tgl => transaksi.value.filter(t => t.tanggal === tgl && t.jenis === 'Pemasukan').reduce((a, b) => a + b.jumlah, 0)));
const pengeluaran = computed(() => tanggalSet.value.map(tgl => transaksi.value.filter(t => t.tanggal === tgl && t.jenis === 'Pengeluaran').reduce((a, b) => a + b.jumlah, 0)));
const saldoArr = computed(() => {
  let saldo = 0;
  return tanggalSet.value.map((tgl, idx) => {
    saldo += pemasukan.value[idx] - pengeluaran.value[idx];
    return saldo;
  });
});

onMounted(() => {
  chartData.value = {
    labels: tanggalSet.value,
    datasets: [
      {
        label: 'Pemasukan',
        borderColor: '#34C759',
        backgroundColor: 'rgba(29,191,115,0.12)',
        data: pemasukan.value,
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Pengeluaran',
        borderColor: '#FF3B30',
        backgroundColor: 'rgba(232,0,0,0.12)',
        data: pengeluaran.value,
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Saldo',
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0,122,255,0.12)',
        data: saldoArr.value,
        fill: false,
        tension: 0.3,
        pointStyle: 'rectRot',
        borderWidth: 2,
      },
    ]
  };
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.page-header h1 {
  font-weight: 600;
}
.page-icon {
  display: flex;
  align-items: center;
  color: inherit;
  font-size: 2rem;
}
.chart-container {
  margin-top: 0.8rem;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #d2d2d2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  padding: 2rem 2.5rem 2rem 2.5rem;
  width: 100%;
  height: calc(100vh - 50rem);
  min-height: calc(100vh - 10.7rem);
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: none;
  justify-content: center;
  align-items: center;
}
/* Pastikan chart tidak terlalu melebar */
.chart-container canvas {
  max-width: 100%;
  height: auto !important;
}
</style> 