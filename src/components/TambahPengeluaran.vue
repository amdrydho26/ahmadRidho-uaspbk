<template>
  <div class="page-header">
    <span class="page-icon"><IconMinus /></span>
    <h1>Tambah Pengeluaran</h1>
  </div>
  <form class="form-tambah" @submit.prevent="submitForm">
    <div class="form-group">
      <label>Nama Transaksi</label>
      <input v-model="form.nama" type="text" required placeholder="Masukkan nama transaksi" />
    </div>
    <div class="form-group">
      <label>Deskripsi Transaksi</label>
      <input v-model="form.deskripsi" type="text" placeholder="Masukkan deskripsi transaksi" />
    </div>
    <div class="form-group">
      <label>Tanggal</label>
      <input v-model="form.tanggal" type="date" required />
    </div>
    <div class="form-group">
      <label>Jumlah</label>
      <input v-model="form.jumlah" type="number" min="0" required placeholder="0" />
    </div>
    <button type="submit" class="btn-submit">Tambah Pengeluaran</button>
  </form>
  <div v-if="showWarning" class="modal-overlay">
    <div class="modal-content warning-modal" style="max-width:340px;min-width:260px;text-align:center;">
      <div class="warning-header">
        <IconAlert class="icon-alert" />
        <span class="warning-title">Peringatan</span>
      </div>
      <p style="margin-bottom:1rem;">{{ warningMessage }}</p>
      <div class="saldo-card">
        <IconCash class="saldo-icon" />
        <span class="saldo-label">Saldo Anda</span>
        <span class="saldo-value">Rp{{ saldo.toLocaleString('id-ID') }}</span>
      </div>
      <button @click="showWarning=false" class="btn-save success-btn-bottom">OK</button>
    </div>
  </div>
  <div v-if="showSuccess" class="modal-overlay">
    <div class="modal-content warning-modal" style="max-width:340px;min-width:260px;text-align:center;">
      <div class="warning-header">
        <IconCheckCircle class="icon-alert" style="color:#34C759;" />
        <span class="warning-title">Sukses</span>
      </div>
      <p style="margin-bottom:1rem;">{{ successMessage }}</p>
      <div class="saldo-card">
        <IconCash class="saldo-icon" />
        <span class="saldo-label">Saldo Anda</span>
        <span class="saldo-value">Rp{{ saldo.toLocaleString('id-ID') }}</span>
      </div>
      <button @click="showSuccess=false" class="btn-save success-btn-bottom">OK</button>
    </div>
  </div>
</template>

<script setup>
import IconMinus from '~icons/mdi/minus';
import IconAlert from '~icons/mdi/alert-circle-outline';
import IconCheckCircle from '~icons/mdi/check-circle-outline';
import IconCash from '~icons/mdi/cash';
import { ref, computed } from 'vue';
import { useTransaksiStore } from '../store';

const store = useTransaksiStore();

const form = ref({
  nama: '',
  deskripsi: '',
  jenis: 'Pengeluaran',
  tanggal: '',
  jumlah: ''
});

const saldo = computed(() => store.saldo);
const showWarning = ref(false);
const warningMessage = ref('');
const showSuccess = ref(false);
const successMessage = ref('');

function submitForm() {
  if (Number(form.value.jumlah) > saldo.value) {
    warningMessage.value = 'Jumlah pengeluaran tidak boleh melebihi saldo!';
    showWarning.value = true;
    return;
  }
  store.tambahTransaksi({
    nama: form.value.nama,
    deskripsi: form.value.deskripsi,
    jenis: 'Pengeluaran',
    tanggal: form.value.tanggal,
    jumlah: Number(form.value.jumlah)
  });
  form.value = { nama: '', deskripsi: '', jenis: 'Pengeluaran', tanggal: '', jumlah: '' };
  successMessage.value = 'Pengeluaran berhasil ditambahkan!';
  showSuccess.value = true;
}
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
.form-tambah {
  max-width: 420px;
  width: 100%;
  height: calc(100vh - 50rem);
  min-height: calc(100vh - 9.7rem);
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #d2d2d2;
  padding: 2rem 1.2rem 1.2rem 1.2rem;
  flex-shrink: 0;
  flex-grow: 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  position: relative;
}
.form-tambah::-webkit-scrollbar {
  display: none;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group label {
  font-size: 1rem;
  font-weight: 500;
}
.form-group input {
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
.form-group input:focus {
  border-color: #bdbdbd;
}
.btn-submit {
  margin-top: auto;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: #FF3B30;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover {
  background: #b2271c;
}
/* Hilangkan spinner pada input type number */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.warning-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-left: 0;
}
.warning-header .icon-alert {
  color: #FF9500;
  font-size: 2rem;
}
.warning-header .warning-title {
  font-weight: 600;
  font-size: 1.5rem;
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
.modal-content.warning-modal {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  min-width: 420px;
  max-width: 600px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  position: relative;
  min-height: 180px;
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
.saldo-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: #eafaf1;
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  margin: 0.3rem auto 2rem auto;
  width: fit-content;
  font-size: 1.08rem;
  font-weight: 500;
}
.saldo-icon {
  color: #34C759;
  font-size: 1.3rem;
}
.saldo-label {
  color: #34C759;
  font-weight: 600;
}
.saldo-value {
  color: #34C759;
  font-weight: 700;
  margin-left: 0.3rem;
}
.success-btn-bottom {
  margin-top: auto;
  width: 100%;
}
</style> 