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
</template>

<script setup>
import IconMinus from '~icons/mdi/minus';
import { ref } from 'vue';

const form = ref({
  nama: '',
  deskripsi: '',
  jenis: 'Pengeluaran',
  tanggal: '',
  jumlah: ''
});

function submitForm() {
  alert('Data berhasil disubmit!\n' + JSON.stringify(form.value, null, 2));
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
  background: #e80000;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover {
  background: #b80000;
}
/* Hilangkan spinner pada input type number */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style> 