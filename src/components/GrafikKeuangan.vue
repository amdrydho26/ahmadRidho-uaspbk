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
import { ref, onMounted } from 'vue';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// Data dummy, samakan dengan Dashboard.vue
const transaksi = [
  { id: 1, nama: 'Gaji Bulanan', deskripsi: 'Gaji dari kantor', jenis: 'Pemasukan', tanggal: '2024-07-01', jumlah: 5000000 },
  { id: 2, nama: 'Beli Buku', deskripsi: 'Buku kuliah', jenis: 'Pengeluaran', tanggal: '2024-07-02', jumlah: 150000 },
  { id: 3, nama: 'Freelance', deskripsi: 'Proyek desain', jenis: 'Pemasukan', tanggal: '2024-07-03', jumlah: 1200000 },
  { id: 4, nama: 'Makan Siang', deskripsi: 'Makan di luar', jenis: 'Pengeluaran', tanggal: '2024-07-03', jumlah: 50000 },
  { id: 5, nama: 'Bonus', deskripsi: 'Bonus tahunan', jenis: 'Pemasukan', tanggal: '2024-07-04', jumlah: 2000000 },
  { id: 6, nama: 'Transport', deskripsi: 'Ojek online', jenis: 'Pengeluaran', tanggal: '2024-07-04', jumlah: 30000 },
  { id: 7, nama: 'Hadiah', deskripsi: 'Dari orang tua', jenis: 'Pemasukan', tanggal: '2024-07-05', jumlah: 500000 },
  { id: 8, nama: 'Kopi', deskripsi: 'Ngopi bareng teman', jenis: 'Pengeluaran', tanggal: '2024-07-05', jumlah: 25000 },
  { id: 9, nama: 'Investasi', deskripsi: 'Dividen saham', jenis: 'Pemasukan', tanggal: '2024-07-06', jumlah: 300000 },
  { id: 10, nama: 'Internet', deskripsi: 'Bayar wifi', jenis: 'Pengeluaran', tanggal: '2024-07-06', jumlah: 150000 },
  { id: 11, nama: 'Jual Barang', deskripsi: 'Jual buku bekas', jenis: 'Pemasukan', tanggal: '2024-07-07', jumlah: 100000 },
  { id: 12, nama: 'Listrik', deskripsi: 'Bayar listrik', jenis: 'Pengeluaran', tanggal: '2024-07-07', jumlah: 200000 },
  { id: 13, nama: 'Proyek', deskripsi: 'Proyek freelance', jenis: 'Pemasukan', tanggal: '2024-07-08', jumlah: 800000 },
  { id: 14, nama: 'Makan Malam', deskripsi: 'Makan di luar', jenis: 'Pengeluaran', tanggal: '2024-07-08', jumlah: 60000 },
  { id: 15, nama: 'THR', deskripsi: 'Tunjangan Hari Raya', jenis: 'Pemasukan', tanggal: '2024-07-09', jumlah: 1000000 },
  { id: 16, nama: 'Pulsa', deskripsi: 'Isi pulsa', jenis: 'Pengeluaran', tanggal: '2024-07-09', jumlah: 50000 },
];

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

onMounted(() => {
  // Ambil semua tanggal unik
  const tanggalSet = Array.from(new Set(transaksi.map(t => t.tanggal)));
  // Data pemasukan dan pengeluaran per tanggal
  const pemasukan = tanggalSet.map(tgl => transaksi.filter(t => t.tanggal === tgl && t.jenis === 'Pemasukan').reduce((a, b) => a + b.jumlah, 0));
  const pengeluaran = tanggalSet.map(tgl => transaksi.filter(t => t.tanggal === tgl && t.jenis === 'Pengeluaran').reduce((a, b) => a + b.jumlah, 0));
  // Data saldo kumulatif per tanggal
  let saldo = 0;
  const saldoArr = tanggalSet.map((tgl, idx) => {
    saldo += pemasukan[idx] - pengeluaran[idx];
    return saldo;
  });
  chartData.value = {
    labels: tanggalSet,
    datasets: [
      {
        label: 'Pemasukan',
        borderColor: '#1dbf73',
        backgroundColor: 'rgba(29,191,115,0.12)',
        data: pemasukan,
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Pengeluaran',
        borderColor: '#e80000',
        backgroundColor: 'rgba(232,0,0,0.12)',
        data: pengeluaran,
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Saldo',
        borderColor: '#1a4d8f',
        backgroundColor: 'rgba(26,77,143,0.12)',
        data: saldoArr,
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