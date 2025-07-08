<template>
  <div class="page-header chart-header-row">
    <div class="header-title-group">
      <span class="page-icon"><IconChartLine /></span>
      <h1>Grafik Keuangan</h1>
    </div>
    <div class="chart-filter-bar">
      <label for="filter-grafik" class="filter-label">Tampilkan:</label>
      <div class="dropdown-wrapper">
        <select v-model="filterMode" id="filter-grafik" class="filter-select">
          <option value="hari">Per Hari</option>
          <option value="bulan">Per Bulan</option>
          <option value="tahun">Per Tahun</option>
        </select>
        <svg class="dropdown-arrow" width="18" height="18" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#888" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
  </div>
  <div class="chart-container">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import IconChartLine from '~icons/mdi/chart-line';
import { Line } from 'vue-chartjs';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransaksiStore } from '../store';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const store = useTransaksiStore();
const { transaksi } = storeToRefs(store);

const filterMode = ref('hari');
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

const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function getAllMonthYearRange(transaksi) {
  if (!transaksi.length) return [];
  const dates = transaksi.map(t => t.tanggal).sort();
  const min = dates[0].slice(0,7);
  const max = dates[dates.length-1].slice(0,7);
  const [minYear, minMonth] = min.split('-').map(Number);
  const [maxYear, maxMonth] = max.split('-').map(Number);
  const result = [];
  let y = minYear, m = minMonth;
  while (y < maxYear || (y === maxYear && m <= maxMonth)) {
    result.push(`${y}-${String(m).padStart(2,'0')}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return result;
}

const bulanTahunKeys = computed(() => getAllMonthYearRange(transaksi.value));

const chartLabels = computed(() => {
  if (filterMode.value === 'hari') {
    return Array.from(new Set(transaksi.value.map(t => t.tanggal))).sort();
  } else if (filterMode.value === 'bulan') {
    return bulanTahunKeys.value.map(bln => {
      const [year, month] = bln.split('-');
      return monthNames[parseInt(month,10)-1] + ' ' + year;
    });
  } else if (filterMode.value === 'tahun') {
    return Array.from(new Set(transaksi.value.map(t => t.tanggal.slice(0,4)))).sort();
  }
  return [];
});

const pemasukan = computed(() => {
  if (filterMode.value === 'hari') {
    return chartLabels.value.map(tgl => transaksi.value.filter(t => t.tanggal === tgl && t.jenis === 'Pemasukan').reduce((a, b) => a + b.jumlah, 0));
  } else if (filterMode.value === 'bulan') {
    return bulanTahunKeys.value.map(bln => transaksi.value.filter(t => t.tanggal.startsWith(bln) && t.jenis === 'Pemasukan').reduce((a, b) => a + b.jumlah, 0));
  } else if (filterMode.value === 'tahun') {
    return chartLabels.value.map(thn => transaksi.value.filter(t => t.tanggal.startsWith(thn) && t.jenis === 'Pemasukan').reduce((a, b) => a + b.jumlah, 0));
  }
  return [];
});
const pengeluaran = computed(() => {
  if (filterMode.value === 'hari') {
    return chartLabels.value.map(tgl => transaksi.value.filter(t => t.tanggal === tgl && t.jenis === 'Pengeluaran').reduce((a, b) => a + b.jumlah, 0));
  } else if (filterMode.value === 'bulan') {
    return bulanTahunKeys.value.map(bln => transaksi.value.filter(t => t.tanggal.startsWith(bln) && t.jenis === 'Pengeluaran').reduce((a, b) => a + b.jumlah, 0));
  } else if (filterMode.value === 'tahun') {
    return chartLabels.value.map(thn => transaksi.value.filter(t => t.tanggal.startsWith(thn) && t.jenis === 'Pengeluaran').reduce((a, b) => a + b.jumlah, 0));
  }
  return [];
});
const saldoArr = computed(() => {
  let saldo = 0;
  if (filterMode.value === 'bulan') {
    return bulanTahunKeys.value.map((bln, idx) => {
      saldo += pemasukan.value[idx] - pengeluaran.value[idx];
      return saldo;
    });
  }
  return chartLabels.value.map((label, idx) => {
    saldo += pemasukan.value[idx] - pengeluaran.value[idx];
    return saldo;
  });
});

function updateChart() {
  chartData.value = {
    labels: chartLabels.value,
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
}

onMounted(updateChart);
watch([transaksi, filterMode], updateChart, { immediate: true });
</script>

<style scoped>
.page-header.chart-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  margin-top: 1rem;
}
.header-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
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
.chart-filter-bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0;
  margin-top: 0;
  justify-content: flex-end;
}
.dropdown-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.filter-select {
  padding: 0.5rem 2.1rem 0.5rem 1rem;
  border-radius: 9px;
  border: 1.5px solid #e9ecef;
  font-size: 1.07rem;
  background: #fff;
  color: #222;
  font-weight: 500;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  appearance: none;
  outline: none;
  transition: border 0.18s, box-shadow 0.18s;
  cursor: pointer;
}
.filter-select:focus, .filter-select:hover {
  border-color: #007AFF;
  box-shadow: 0 2px 8px rgba(0,122,255,0.07);
}
.dropdown-arrow {
  position: absolute;
  right: 1.1rem;
  pointer-events: none;
  font-size: 1.1em;
  color: #888;
  top: 50%;
  transform: translateY(-50%);
}
.filter-label {
  font-size: 0.98rem;
  font-weight: 500;
  color: #666;
  margin-right: 0.2rem;
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