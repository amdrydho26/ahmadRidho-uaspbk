<script setup>
import IconHome from '~icons/mdi/home';
import IconDots from '~icons/mdi/dots-vertical';
import IconAlert from '~icons/mdi/alert-circle-outline';
import IconDownload from '~icons/mdi/download';
import * as XLSX from 'xlsx';
import { storeToRefs } from 'pinia';
import { useTransaksiStore } from '../store';
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import IconFilter from '~icons/mdi/filter-variant';
import IconContentCopy from '~icons/mdi/content-copy';
import logo from '../assets/logo.png';

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
const ripple = ref(null);
const showDownloadModal = ref(false);
const modalContentVisible = ref(false);
const downloadFileName = ref('data-transaksi.pdf');
const transaksiCardVisible = ref(false);
const animatedPemasukan = ref(0);
const animatedPengeluaran = ref(0);
const animatedSaldo = ref(0);

const searchQuery = ref('');
const filterJenis = ref('Semua');
const filterTanggal = ref('');
const showFilter = ref(false);
const copiedIdx = ref(null);
const searchInputRef = ref(null);
const sortBy = ref('terbaru'); // default urutkan

const sortedTransaksi = computed(() => {
  let arr = [...transaksi.value];
  arr.sort((a, b) => {
    if (sortBy.value === 'terbaru') {
      // Urutkan tanggal terbaru dulu, jika sama urutkan id terbesar dulu
      if (a.tanggal !== b.tanggal) return b.tanggal.localeCompare(a.tanggal);
      return Number(b.id) - Number(a.id);
    } else {
      // Urutkan tanggal terlama dulu, jika sama urutkan id terkecil dulu
      if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal);
      return Number(a.id) - Number(b.id);
    }
  });
  return arr;
});

const filteredTransaksi = computed(() => {
  return sortedTransaksi.value.filter(item => {
    // Filter jenis
    if (filterJenis.value !== 'Semua' && item.jenis !== filterJenis.value) return false;
    // Filter tanggal (hanya tanggal persis)
    if (filterTanggal.value && item.tanggal !== filterTanggal.value) return false;
    // Search
    const q = searchQuery.value.toLowerCase();
    if (q) {
      const nama = item.nama?.toLowerCase() || '';
      const deskripsi = item.deskripsi?.toLowerCase() || '';
      const jumlah = String(item.jumlah);
      if (!nama.includes(q) && !deskripsi.includes(q) && !jumlah.includes(q)) return false;
    }
    return true;
  });
});

watch(showFilter, (val) => {
  if (val) nextTick(() => { if (searchInputRef.value) searchInputRef.value.focus(); });
});

function copyJumlah(jumlah, idx) {
  navigator.clipboard.writeText(jumlah.toString().replace(/[^\d]/g, ''));
  copiedIdx.value = idx;
  setTimeout(() => { copiedIdx.value = null; }, 1200);
}

function animateValue(refValue, target, duration = 900) {
  const start = 0;
  const startTime = performance.now();
  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    refValue.value = Math.floor(progress * (target - start) + start);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      refValue.value = target;
    }
  }
  requestAnimationFrame(animate);
}

watch(showDownloadModal, (val) => {
  if (val) {
    modalContentVisible.value = true;
  }
});

// Remove count up from onMounted, use watch instead
watch(totalPemasukan, (newVal, oldVal) => {
  if (oldVal === 0 && newVal > 0) animateValue(animatedPemasukan, newVal);
});
watch(totalPengeluaran, (newVal, oldVal) => {
  if (oldVal === 0 && newVal > 0) animateValue(animatedPengeluaran, newVal);
});
watch(saldo, (newVal, oldVal) => {
  if (oldVal === 0 && newVal !== 0) animateValue(animatedSaldo, newVal);
});

onMounted(() => {
  animatedPemasukan.value = 0;
  animatedPengeluaran.value = 0;
  animatedSaldo.value = 0;
  animateValue(animatedPemasukan, totalPemasukan.value);
  animateValue(animatedPengeluaran, totalPengeluaran.value);
  animateValue(animatedSaldo, saldo.value);
  setTimeout(() => { transaksiCardVisible.value = true; }, 180);
});

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
  window.location.reload();
}

function hapusTransaksi() {
  store.hapusTransaksi(selectedTransaksi.id);
  closeEditModal();
  window.location.reload();
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

function exportToPDF(filename = 'data-transaksi.pdf') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 24;
  const logoHeight = 24;
  doc.addImage(logo, 'PNG', 14, 10, logoWidth, logoHeight);
  // Tanggal dan jam download
  const now = new Date();
  const tanggalStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  const jamStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  doc.setFontSize(11);
  doc.text(`Diunduh pada: ${tanggalStr} ${jamStr}`, 14, 40);
  // Ringkasan
  doc.setFontSize(14);
  doc.text('Ringkasan Keuangan', 14, 54);
  doc.setFontSize(11);
  doc.text(`Total Pemasukan: Rp${totalPemasukan.value.toLocaleString('id-ID')}`, 14, 64);
  doc.text(`Total Pengeluaran: Rp${totalPengeluaran.value.toLocaleString('id-ID')}`, 14, 71);
  doc.text(`Saldo: Rp${saldo.value.toLocaleString('id-ID')}`, 14, 78);
  doc.setFontSize(14);
  doc.text('Data Transaksi', 14, 92);
  autoTable(doc, {
    startY: 96,
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
  doc.save(filename);
}

function handleDownloadClick(e) {
  exportToPDF();
  // Ripple animation
  const btn = e.currentTarget;
  const rippleEl = btn.querySelector('.ripple');
  if (rippleEl) {
    rippleEl.classList.remove('show');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    rippleEl.style.width = rippleEl.style.height = size + 'px';
    rippleEl.style.left = (e.clientX - rect.left - size/2) + 'px';
    rippleEl.style.top = (e.clientY - rect.top - size/2) + 'px';
    setTimeout(() => rippleEl.classList.add('show'), 10);
    setTimeout(() => rippleEl.classList.remove('show'), 500);
  }
}

function simpleDownloadClick() {
  exportToPDF();
  const btn = document.querySelector('.small-download');
  if (btn) {
    btn.classList.remove('scale-animate');
    void btn.offsetWidth; // force reflow
    btn.classList.add('scale-animate');
    setTimeout(() => btn.classList.remove('scale-animate'), 180);
  }
}

function biggerDownloadClick(e) {
  // Set default file name with current date and time
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}.${pad(now.getMinutes())}`;
  downloadFileName.value = `AturKuy - Data Transaksi ${dateStr} ${timeStr}.pdf`;
  showDownloadModal.value = true;
  // Remove scale animation for visual feedback
  const btn = e.currentTarget;
  btn.classList.remove('scale-animate');
  void btn.offsetWidth;
  btn.classList.add('scale-animate');
  setTimeout(() => btn.classList.remove('scale-animate'), 180);
}

function confirmDownload() {
  exportToPDF(downloadFileName.value);
  showDownloadModal.value = false;
}
function cancelDownload() {
  showDownloadModal.value = false;
}
function afterModalLeave() {
  // No-op, but can be used for cleanup if needed
}

function triggerShimmerOnce(e) {
  const btn = e.currentTarget;
  btn.classList.remove('shimmer-animate');
  void btn.offsetWidth;
  btn.classList.add('shimmer-animate');
  // Remove class after animation ends (350ms)
  setTimeout(() => btn.classList.remove('shimmer-animate'), 350);
}

const summaryCards = [
  { key: 'pemasukan', type: 'pemasukan', label: 'Pemasukan', value: computed(() => 'Rp' + animatedPemasukan.value.toLocaleString('id-ID')) },
  { key: 'pengeluaran', type: 'pengeluaran', label: 'Pengeluaran', value: computed(() => 'Rp' + animatedPengeluaran.value.toLocaleString('id-ID')) },
  { key: 'saldo', type: 'saldo', label: 'Saldo', value: computed(() => 'Rp' + animatedSaldo.value.toLocaleString('id-ID')) },
];

function resetFilter() {
  searchQuery.value = '';
  filterJenis.value = 'Semua';
  filterTanggal.value = '';
}
</script>

<template>
  <div class="dashboard-header">
    <div class="page-header">
      <span class="page-icon"><IconHome /></span>
      <h1>Dashboard</h1>
    </div>
    <div class="dashboard-header-actions">
      <button class="export-btn simple-download bigger-download-btn" @click="showFilter = !showFilter" @mouseenter="triggerShimmerOnce" :title="showFilter ? 'Sembunyikan Filter' : 'Tampilkan Filter'">
        <IconFilter />
      </button>
      <button class="export-btn simple-download bigger-download-btn" @click="biggerDownloadClick" @mouseenter="triggerShimmerOnce" title="Export PDF"><IconDownload class="download-icon bigger-download-icon" /></button>
    </div>
  </div>
  <div class="summary-cards">
    <div
      v-for="(card, idx) in summaryCards"
      :key="card.key"
      class="summary-card" :class="card.type + ' card-animate'"
      :style="{ animationDelay: (0.08 * idx) + 's' }"
    >
      <div class="label">{{ card.label }}</div>
      <div class="value">{{ card.value }}</div>
    </div>
  </div>
  <transition name="filter-fade-slide">
    <div v-if="showFilter" class="transaksi-filter-bar">
      <input ref="searchInputRef" v-model="searchQuery" type="text" placeholder="Cari transaksi..." class="filter-input" />
      <select v-model="filterJenis" class="filter-select">
        <option value="Semua">Semua</option>
        <option value="Pemasukan">Pemasukan</option>
        <option value="Pengeluaran">Pengeluaran</option>
      </select>
      <input v-model="filterTanggal" type="date" class="filter-date" />
      <select v-model="sortBy" class="filter-select">
        <option value="terbaru">Terbaru</option>
        <option value="terlama">Terlama</option>
      </select>
      <button class="btn-clear-filter" @click="resetFilter" title="Reset Filter">Reset</button>
      <div class="filter-count-card">
        {{ filteredTransaksi.length }} Transaksi ditemukan
      </div>
    </div>
  </transition>
  <div v-show="transaksiCardVisible" :class="['transaksi-list-card', 'transaksi-card-animate', { 'with-filter': showFilter }]">
    <div v-if="filteredTransaksi.length === 0" class="transaksi-empty">Belum ada transaksi.</div>
    <ul v-else class="transaksi-scrollable">
      <li v-for="(item, idx) in filteredTransaksi" :key="item.id" class="transaksi-item transaksi-animate" :style="{ animationDelay: (0.04 * idx) + 's' }" @click="copyJumlah(item.jumlah, idx)">
        <div class="transaksi-info">
          <div class="transaksi-nama">{{ item.nama }}</div>
          <div class="deskripsi">{{ item.deskripsi }}</div>
        </div>
        <div class="transaksi-jumlah" :class="item.jenis === 'Pemasukan' ? 'pemasukan' : 'pengeluaran'">
          {{ item.jenis === 'Pemasukan' ? '+' : '-' }}Rp{{ item.jumlah.toLocaleString('id-ID') }}
          <span v-if="copiedIdx === idx" class="copied-tooltip">Disalin!</span>
        </div>
        <span class="edit-icon" @click.stop="openEditModal(item)"><IconDots /></span>
        <div class="transaksi-tanggal">{{ item.tanggal }}</div>
      </li>
    </ul>
  </div>
  <div v-if="showEditModal" class="modal-overlay">
    <transition name="modal-slide-up">
      <div v-if="showEditModal" class="modal-content modal-slide-up">
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
    </transition>
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
  <div v-if="showDownloadModal" class="modal-overlay">
    <transition name="modal-slide-up">
      <div v-if="showDownloadModal" class="modal-content modal-slide-up">
        <h2>Konfirmasi Download</h2>
        <div style="margin-bottom:1rem;">Masukkan nama file untuk diunduh:</div>
        <input v-model="downloadFileName" type="text" class="modal-input" />
        <div class="modal-actions" style="margin-top:1.5rem;">
          <button @click="cancelDownload" class="btn-cancel">Batal</button>
          <button @click="confirmDownload" class="btn-save">Download</button>
        </div>
      </div>
    </transition>
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
  transition: margin-top 0.3s cubic-bezier(.4,1,.8,1);
}
.transaksi-list-card.with-filter {
  margin-top: 1.7rem;
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
  cursor: default;
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
.export-btn.fancy-download {
  background: linear-gradient(135deg, #007AFF 60%, #34C759 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  padding: 0.7rem;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,122,255,0.12);
  transition: background 0.2s, transform 0.18s, box-shadow 0.18s;
  position: relative;
  width: 48px;
  height: 48px;
}
.export-btn.fancy-download:hover {
  background: linear-gradient(135deg, #0051a8 60%, #28b44a 100%);
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(0,122,255,0.18);
}
.export-btn.fancy-download.square-download {
  border-radius: 12px;
  width: 52px;
  height: 52px;
  padding: 0;
  position: relative;
  overflow: hidden;
}
.export-btn.fancy-download.square-download .ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  background: rgba(255,255,255,0.4);
  pointer-events: none;
  z-index: 1;
  transition: transform 0.4s, opacity 0.4s;
  opacity: 0;
}
.export-btn.fancy-download.square-download .ripple.show {
  transform: scale(2.5);
  opacity: 1;
  transition: transform 0.4s, opacity 0.4s;
}
.animated-icon {
  z-index: 2;
  transition: transform 0.25s cubic-bezier(.4,2,.6,1);
}
.export-btn.fancy-download.square-download:hover .animated-icon {
  transform: rotate(-18deg) scale(1.12);
}
.download-icon {
  font-size: 2rem !important;
  color: #fff;
  margin: 0;
}
.export-btn.fancy-download.square-download.small-download {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  padding: 0;
  min-width: unset;
  min-height: unset;
}
.download-icon.simple-animated-icon {
  font-size: 1.3rem !important;
}
.export-btn.fancy-download.square-download.small-download:hover {
  background: linear-gradient(135deg, #007AFF 80%, #34C759 100%);
}
.export-btn.fancy-download.square-download.small-download.scale-animate {
  animation: scaleUp 0.18s cubic-bezier(.4,2,.6,1);
}
@keyframes scaleUp {
  0% { transform: scale(1); }
  60% { transform: scale(1.18); }
  100% { transform: scale(1); }
}
.export-btn.simple-download {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #007AFF;
  color: #fff;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s;
  box-shadow: none;
  min-width: unset;
  min-height: unset;
}
.export-btn.simple-download:hover {
  background: #0051a8;
}
.download-icon.simple-icon {
  font-size: 1.1rem !important;
  color: #fff;
}
.export-btn.simple-download.bigger-download-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
}
.export-btn.simple-download.bigger-download-btn::after {
  content: '';
  position: absolute;
  top: 6px;
  left: -60%;
  width: 60%;
  height: 70%;
  background: linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-20deg);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  filter: blur(4px);
  animation: none;
}
.export-btn.simple-download.bigger-download-btn.shimmer-animate::after {
  animation: shimmer-move 0.30s linear 1;
  opacity: 1;
}
@keyframes shimmer-move {
  0% { left: -60%; opacity: 0.2; }
  40% { opacity: 1; }
  100% { left: 120%; opacity: 0; }
}
.download-icon.bigger-download-icon {
  font-size: 1.5rem !important;
}
.export-btn.simple-download.bigger-download-btn:hover {
  background: #0051a8;
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 6px 18px rgba(0,122,255,0.13);
}
.export-btn.simple-download.bigger-download-btn {
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
}
.modal-input {
  width: 90%;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 1rem;
  font-family: inherit;
  background: #fff;
  color: inherit;
  outline: none;
  transition: border 0.2s;
  margin-top: 0.5rem;
}
.modal-input:focus {
  border-color: #bdbdbd;
}
.modal-slide-up {
  animation: fadeSlideUpModal 0.22s cubic-bezier(.4,1,.7,1) both;
}
@keyframes fadeSlideUpModal {
  0% {
    opacity: 0;
    transform: translateY(32px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.modal-slide-up-enter-active,
.modal-slide-up-leave-active {
  transition: opacity 0.22s cubic-bezier(.4,1,.7,1), transform 0.22s cubic-bezier(.4,1,.7,1);
}
.modal-slide-up-enter-from,
.modal-slide-up-leave-to {
  opacity: 0;
  transform: translateY(32px);
}
.modal-slide-up-enter-to,
.modal-slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.card-animate {
  opacity: 0;
  transform: translateY(24px);
  animation: cardFadeUp 0.38s cubic-bezier(.4,1,.7,1) forwards;
}
@keyframes cardFadeUp {
  to {
    opacity: 1;
    transform: none;
  }
}
.transaksi-animate {
  opacity: 0;
  transform: translateY(18px);
  animation: transaksiFadeUp 0.32s cubic-bezier(.4,1,.7,1) forwards;
}
@keyframes transaksiFadeUp {
  to {
    opacity: 1;
    transform: none;
  }
}
.transaksi-card-animate {
  opacity: 0;
  transform: translateY(32px);
  animation: cardFadeUp 0.38s cubic-bezier(.4,1,.7,1) 0.18s forwards;
}
.transaksi-filter-bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  /* margin-bottom: 1.1rem; */
  margin-top: 0.5rem;
}
.filter-input {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 1rem;
  min-width: 140px;
}
.filter-select {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 1rem;
}
.filter-date {
  padding: 0.45rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 1rem;
  min-width: 110px;
}
.btn-show-filter {
  background: #f6f6f6;
  color: #333;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0.7rem;
  transition: background 0.18s, border 0.18s;
}
.btn-show-filter:hover {
  background: #e9ecef;
  border-color: #d2d2d2;
}
.transaksi-filter-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.2rem;
}
.btn-icon-filter {
  background: #f6f6f6;
  border: 1px solid #e9ecef;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #007AFF;
  cursor: pointer;
  transition: background 0.18s, border 0.18s;
  box-shadow: none;
  padding: 0;
}
.btn-icon-filter:hover {
  background: #e9ecef;
  border-color: #d2d2d2;
}
.dashboard-header-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.dashboard-header-actions > .export-btn:first-child {
  background: #34C759;
  color: #fff;
}
.dashboard-header-actions > .export-btn:first-child:hover {
  background: #259e4c;
}
.dashboard-header-actions > .export-btn:first-child .download-icon,
.dashboard-header-actions > .export-btn:first-child svg {
  color: #fff;
}
.filter-count {
  margin-left: auto;
  color: #888;
  font-size: 0.98rem;
  font-weight: 500;
  white-space: nowrap;
}
.filter-count-badge {
  display: flex;
  align-items: center;
  background: #e8fbe9;
  color: #259e4c;
  font-size: 1.08rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 0.36rem 1.1rem 0.36rem 0.7rem;
  margin-left: 1.2rem;
  box-shadow: 0 1px 4px rgba(52,199,89,0.07);
  gap: 0.2rem;
  min-width: 54px;
  animation: badgePop 0.32s cubic-bezier(.4,1,.7,1);
}
.filter-count-badge svg {
  font-size: 1.18em;
}
.filter-count-badge text {
  font-size: 13px !important;
}
.filter-count-text {
  margin-left: 2px;
  font-weight: 500;
  color: #259e4c;
}
@keyframes badgePop {
  0% { opacity: 0; transform: translateY(10px) scale(0.9); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.badge-fade-enter-active, .badge-fade-leave-active {
  transition: opacity 0.22s, transform 0.22s;
}
.badge-fade-enter-from, .badge-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
.badge-fade-enter-to, .badge-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.filter-count-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0 0.9rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #259e4c;
  min-width: 120px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(52,199,89,0.07);
  height: 38px;
}
.filter-fade-slide-enter-active, .filter-fade-slide-leave-active {
  transition: opacity 0.28s, transform 0.28s;
}
.filter-fade-slide-enter-from, .filter-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
.filter-fade-slide-enter-to, .filter-fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.copy-btn {
  background: none;
  border: none;
  color: #bbb;
  margin-left: 0.4rem;
  cursor: pointer;
  font-size: 1.1em;
  vertical-align: middle;
  padding: 0;
  transition: color 0.18s;
  position: relative;
}
.copy-btn:hover {
  color: #007AFF;
}
.copied-tooltip {
  margin-left: 0.3rem;
  color: #000;
  font-size: 0.85em;
  font-weight: 500;
  opacity: 0.65;
  animation: fadeCopied 1.6s cubic-bezier(.4,1,.7,1);
}
@keyframes fadeCopied {
  0% { opacity: 0; transform: translateY(-6px); }
  18% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-6px); }
}
.btn-clear-filter {
  background: #f6f6f6;
  color: #888;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.45rem 1.1rem;
  font-size: 0.97rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 1.1rem;
  margin-right: 0.5rem;
  transition: background 0.18s, border 0.18s, color 0.18s;
}
.btn-clear-filter:hover {
  background: #e9ecef;
  color: #FF3B30;
  border-color: #FF3B30;
}
</style> 