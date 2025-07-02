<script setup>
import IconHome from '~icons/mdi/home';
import IconDots from '~icons/mdi/dots-vertical';
import IconAlert from '~icons/mdi/alert-circle-outline';
import IconDownload from '~icons/mdi/download';
import * as XLSX from 'xlsx';
import { storeToRefs } from 'pinia';
import { useTransaksiStore } from '../store';
import { ref, reactive, computed } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const store = useTransaksiStore();
const { transaksi, totalPemasukan, totalPengeluaran, saldo } = storeToRefs(store);
const showEditModal = ref(false);
const selectedTransaksi = reactive({
  id: null,
  nama: '',
  deskripsi: '',
  tanggal: '',
  jumlah: 0,
  jenis: 'Pemasukan',
});
const originalTransaksi = ref({});
const saldoComputed = computed(() => store.saldo);
const showWarning = ref(false);
const warningMessage = ref('');

function openEditModal(item) {
  Object.assign(selectedTransaksi, item);
  originalTransaksi.value = { ...item };
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  Object.assign(selectedTransaksi, {
    id: null,
    nama: '',
    deskripsi: '',
    tanggal: '',
    jumlah: 0,
    jenis: 'Pemasukan',
  });
}

function submitEdit() {
  const saldoTanpaTransaksiIni = saldoComputed.value + (selectedTransaksi.jenis === 'Pengeluaran' ? originalTransaksi.value.jumlah : 0) - (originalTransaksi.value.jenis === 'Pengeluaran' ? originalTransaksi.value.jumlah : 0);
  if (
    selectedTransaksi.jenis === 'Pengeluaran' &&
    Number(selectedTransaksi.jumlah) > saldoTanpaTransaksiIni
  ) {
    warningMessage.value = 'Jumlah pengeluaran tidak boleh melebihi saldo!';
    showWarning.value = true;
    return;
  }
  store.editTransaksi({ ...selectedTransaksi });
  closeEditModal();
}

function hapusTransaksi() {
  store.hapusTransaksi(selectedTransaksi.id);
  closeEditModal();
}

const isChanged = computed(() => {
  return (
    selectedTransaksi.nama !== originalTransaksi.value.nama ||
    selectedTransaksi.deskripsi !== originalTransaksi.value.deskripsi ||
    selectedTransaksi.tanggal !== originalTransaksi.value.tanggal ||
    selectedTransaksi.jumlah !== originalTransaksi.value.jumlah ||
    selectedTransaksi.jenis !== originalTransaksi.value.jenis
  );
});

function exportToExcel() {
  // Ringkasan
  const summary = [
    ["Total Pemasukan", totalPemasukan.value],
    ["Total Pengeluaran", totalPengeluaran.value],
    ["Saldo", saldo.value],
    [],
  ];
  // Data transaksi
  const data = transaksi.value.map(t => ({
    ID: t.id,
    Nama: t.nama,
    Deskripsi: t.deskripsi,
    Jenis: t.jenis,
    Tanggal: t.tanggal,
    Jumlah: t.jumlah
  }));
  const ws = XLSX.utils.json_to_sheet(data, { origin: summary.length });
  // Header tebal
  const header = ["ID", "Nama", "Deskripsi", "Jenis", "Tanggal", "Jumlah"];
  XLSX.utils.sheet_add_aoa(ws, [header], { origin: summary.length });
  // Ringkasan di atas
  XLSX.utils.sheet_add_aoa(ws, summary, { origin: 0 });
  // Border style (manual, sederhana)
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = summary.length; R <= range.e.r; ++R) {
    for (let C = 0; C <= 5; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell) {
        cell.s = { border: { top: {style: 'thin'}, left: {style: 'thin'}, right: {style: 'thin'}, bottom: {style: 'thin'} } };
      }
    }
  }
  // Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
  // Sheet style (header bold)
  ws['A' + (summary.length + 1)].s = ws['B' + (summary.length + 1)].s = ws['C' + (summary.length + 1)].s = ws['D' + (summary.length + 1)].s = ws['E' + (summary.length + 1)].s = ws['F' + (summary.length + 1)].s = { font: { bold: true } };
  XLSX.writeFile(wb, 'data-transaksi.xlsx');
}

function exportToPDF() {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Ringkasan Keuangan', 14, 16);
  doc.setFontSize(11);
  doc.text(`Total Pemasukan: Rp${totalPemasukan.value.toLocaleString('id-ID')}`, 14, 26);
  doc.text(`Total Pengeluaran: Rp${totalPengeluaran.value.toLocaleString('id-ID')}`, 14, 33);
  doc.text(`Saldo: Rp${saldo.value.toLocaleString('id-ID')}`, 14, 40);
  doc.setFontSize(14);
  doc.text('Data Transaksi', 14, 54);
  autoTable(doc, {
    startY: 58,
    head: [["ID", "Nama", "Deskripsi", "Jenis", "Tanggal", "Jumlah"]],
    body: transaksi.value.map(t => [
      t.id,
      t.nama,
      t.deskripsi,
      t.jenis,
      t.tanggal,
      `Rp${t.jumlah.toLocaleString('id-ID')}`
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 122, 255] },
    margin: { left: 14, right: 14 }
  });
  doc.save('data-transaksi.pdf');
}
</script>

<template>
  <div class="dashboard-header">
    <div class="page-header">
      <span class="page-icon"><IconHome /></span>
      <h1>Dashboard</h1>
    </div>
    <button class="export-btn" @click="exportToPDF" title="Export PDF"><IconDownload /></button>
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
        <span class="edit-icon" @click="openEditModal(item)"><IconDots /></span>
        <div class="transaksi-tanggal">{{ item.tanggal }}</div>
      </li>
    </ul>
  </div>
  <div v-if="showEditModal" class="modal-overlay">
    <div class="modal-content">
      <h2>Edit Transaksi</h2>
      <form @submit.prevent="submitEdit">
        <div class="form-group">
          <label>Nama Transaksi</label>
          <input v-model="selectedTransaksi.nama" type="text" required />
        </div>
        <div class="form-group">
          <label>Deskripsi Transaksi</label>
          <input v-model="selectedTransaksi.deskripsi" type="text" />
        </div>
        <div class="form-group">
          <label>Tanggal</label>
          <input v-model="selectedTransaksi.tanggal" type="date" required />
        </div>
        <div class="form-group">
          <label>Jumlah</label>
          <input v-model.number="selectedTransaksi.jumlah" type="number" min="0" required />
        </div>
        <div class="form-group">
          <label>Jenis</label>
          <select v-model="selectedTransaksi.jenis" required>
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" @click="hapusTransaksi" class="btn-delete">Hapus</button>
          <div class="modal-actions-right">
            <button type="button" @click="closeEditModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save" :disabled="!isChanged">Simpan</button>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div v-if="showWarning" class="modal-overlay">
    <div class="modal-content warning-modal" style="max-width:340px;min-width:260px;text-align:center;">
      <div class="warning-header">
        <IconAlert class="icon-alert" />
        <span class="warning-title">Peringatan</span>
      </div>
      <p style="margin-bottom:1.5rem;">{{ warningMessage }}</p>
      <button @click="showWarning=false" class="btn-save" style="width:100%;">OK</button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  z-index: 2;
  position: relative;
}
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
  color: #34C759;
}
.transaksi-jumlah.pengeluaran {
  color: #FF3B30;
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
  color: #34C759;
}
.summary-card.pengeluaran .value {
  color: #FF3B30;
}
.summary-card.saldo .value {
  color: #007AFF;
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
.edit-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}
.edit-icon:hover {
  color: #007AFF;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  min-width: 420px;
  max-width: 600px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  position: relative;
}
.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.2rem;
  font-size: 1.3rem;
  font-weight: 600;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.modal-actions-right {
  display: flex;
  gap: 1rem;
}
.btn-cancel {
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #ccc;
}
.btn-delete {
  background: #FF3B30;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-right: auto;
}
.btn-delete:hover {
  background: #b2271c;
}
.btn-save {
  background: #007AFF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-save:hover {
  background: #0051a8;
}
.btn-save:disabled {
  background: #bcd6fa;
  color: #fff;
  cursor: not-allowed;
  opacity: 1;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.modal-content .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.modal-content .form-group label {
  font-size: 1rem;
  font-weight: 500;
}
.modal-content .form-group input {
  padding: 0.6rem 0.9rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: #fff;
  color: inherit;
  outline: none;
  transition: border 0.2s;
}
.modal-content .form-group input:focus {
  border-color: #bdbdbd;
}
.modal-content .form-group select {
  padding: 0.6rem 0.9rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: #fff;
  color: inherit;
  outline: none;
  transition: border 0.2s;
}
.modal-content .form-group select:focus {
  border-color: #bdbdbd;
}
/* Hilangkan spinner pada input type number di modal */
.modal-content input[type=number]::-webkit-inner-spin-button, 
.modal-content input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.warning-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.warning-header .icon-alert {
  color: #FF9500;
  font-size: 2rem;
}
.warning-header .warning-title {
  font-weight: 600;
  font-size: 1.5rem;
}
.modal-content.warning-modal {
  min-height: 180px;
}
.export-btn {
  background: #007AFF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.export-btn:hover {
  background: #0051a8;
}
</style> 