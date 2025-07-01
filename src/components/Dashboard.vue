<script setup>
import IconHome from '~icons/mdi/home';
import { ref, computed } from 'vue';

const transaksi = ref([
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
]);

// Ringkasan
const totalPemasukan = computed(() => transaksi.value.filter(t => t.jenis === 'Pemasukan').reduce((a, b) => a + b.jumlah, 0));
const totalPengeluaran = computed(() => transaksi.value.filter(t => t.jenis === 'Pengeluaran').reduce((a, b) => a + b.jumlah, 0));
const saldo = computed(() => totalPemasukan.value - totalPengeluaran.value);
</script>

<template>
  <div class="page-header">
    <span class="page-icon"><IconHome /></span>
    <h1>Dashboard</h1>
  </div>
  <div class="summary-cards">
    <div class="summary-card pemasukan">
      <div class="label">Pemasukan</div>
      <div class="value">Rp{{ totalPemasukan.toLocaleString('id-ID') }}</div>
    </div>
    <div class="summary-card pengeluaran">
      <div class="label">Pengeluaran</div>
      <div class="value">Rp{{ totalPengeluaran.toLocaleString('id-ID') }}</div>
    </div>
    <div class="summary-card saldo">
      <div class="label">Saldo</div>
      <div class="value">Rp{{ saldo.toLocaleString('id-ID') }}</div>
    </div>
  </div>
  <div class="transaksi-list-card">
    <div v-if="transaksi.length === 0" class="transaksi-empty">Belum ada transaksi.</div>
    <ul v-else class="transaksi-scrollable">
      <li v-for="item in transaksi" :key="item.id" class="transaksi-item">
        <div class="transaksi-info">
          <div class="transaksi-nama">{{ item.nama }}</div>
          <div class="deskripsi">{{ item.deskripsi }}</div>
        </div>
        <div class="transaksi-jumlah" :class="item.jenis === 'Pemasukan' ? 'pemasukan' : 'pengeluaran'">
          {{ item.jenis === 'Pemasukan' ? '+' : '-' }}Rp{{ item.jumlah.toLocaleString('id-ID') }}
        </div>
        <div class="transaksi-tanggal">{{ item.tanggal }}</div>
      </li>
    </ul>
  </div>
</template>

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
.transaksi-list-card {
  margin-top: 1.5rem;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #d2d2d2;
  box-sizing: border-box;
  padding: 0.5rem 2.5rem 1.2rem 0;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.transaksi-empty {
  color: #bbb;
  text-align: center;
  padding: 2rem 0;
}
.transaksi-item {
  display: flex;
  align-items: center;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  transition: background 0.18s;
  border-radius: 0;
}
.transaksi-item:last-child {
  border-bottom: none;
}
.transaksi-item:hover {
  background: #f5f7fa;
  border-radius: 10px;
}
.transaksi-info {
  flex: 1 1 0;
  min-width: 0;
}
.transaksi-nama {
  font-size: 1.08rem;
  font-weight: 600;
}
.deskripsi {
  color: #888;
  font-size: 0.95rem;
  margin-top: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.transaksi-jumlah {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: right;
  flex: 0 0 140px;
}
.transaksi-jumlah.pemasukan {
  color: #1dbf73;
}
.transaksi-jumlah.pengeluaran {
  color: #e80000;
}
.transaksi-tanggal {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  text-align: center;
  font-size: 0.97rem;
  color: #666;
  pointer-events: none;
  background: transparent;
}
.summary-cards {
  display: flex;
  gap: 1.5rem;
  margin: 0.8rem 0 1.2rem 0;
}
.summary-card {
  flex: 1 1 0;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #d2d2d2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  padding: 1.2rem 1.5rem 1.1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}
.summary-card .label {
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.3rem;
}
.summary-card .value {
  font-size: 1.25rem;
  font-weight: 700;
}
.summary-card.pemasukan .value {
  color: #1dbf73;
}
.summary-card.pengeluaran .value {
  color: #e80000;
}
.summary-card.saldo .value {
  color: #1a4d8f;
}
.transaksi-scrollable {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #d2d2d2 transparent; /* thumb, track */
}
.transaksi-scrollable::-webkit-scrollbar {
  width: 8px;
  background: transparent;
  border-radius: 8px;
}
.transaksi-scrollable::-webkit-scrollbar-thumb {
  background: #d2d2d2;
  border-radius: 8px;
}
.transaksi-scrollable::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}
.transaksi-scrollable::-webkit-scrollbar-button {
  background: transparent;
  display: block;
  width: 0;
  height: 0;
}
.transaksi-scrollable::-webkit-scrollbar-button:single-button {
  display: none;
  width: 0;
  height: 0;
}
</style> 