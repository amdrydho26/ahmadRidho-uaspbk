<template>
  <div class="page-header">
    <span class="page-icon"><IconMinus /></span>
    <h1>Tambah Pengeluaran</h1>
  </div>
  <div class="form-calc-row">
    <form class="form-tambah form-animate" v-show="formVisible" @submit.prevent="submitForm">
      <div class="form-group">
        <label>Nama Transaksi</label>
        <input ref="namaInput" v-model="form.nama" type="text" required placeholder="Masukkan nama transaksi" />
      </div>
      <div class="form-group">
        <label>Deskripsi Transaksi</label>
        <input v-model="form.deskripsi" type="text" placeholder="Masukkan deskripsi transaksi" />
      </div>
      <div class="form-group">
        <label>Tanggal</label>
        <input v-model="form.tanggal" type="date" required />
      </div>
      <div class="form-group jumlah-group">
        <label>Jumlah</label>
        <div class="jumlah-input-row">
          <input v-model="form.jumlah" type="number" min="0" required placeholder="0" />
          <button type="button" class="btn-calc-toggle" @click="showCalc = !showCalc" :aria-label="showCalc ? 'Tutup Kalkulator' : 'Buka Kalkulator'">
            <IconCalculator class="calc-icon" />
          </button>
        </div>
      </div>
      <button type="submit" class="btn-submit">Tambah Pengeluaran</button>
    </form>
    <transition name="calc-fade-slide">
      <div v-if="showCalc" class="calc-card">
        <div class="calc-section-title">Kalkulator</div>
        <div class="calc-harga-row">
          <input ref="calcInputRef" v-model="calcInput" class="calc-input" placeholder="Hitung" />
        </div>
        <div class="calc-result">= {{ calcResult }}</div>
        <div class="calc-buttons">
          <button @click="calcAppend('7')" type="button">7</button>
          <button @click="calcAppend('8')" type="button">8</button>
          <button @click="calcAppend('9')" type="button">9</button>
          <button @click="calcAppend('/')" type="button" class="op">÷</button>
          <button @click="calcAppend('4')" type="button">4</button>
          <button @click="calcAppend('5')" type="button">5</button>
          <button @click="calcAppend('6')" type="button">6</button>
          <button @click="calcAppend('*')" type="button" class="op">×</button>
          <button @click="calcAppend('1')" type="button">1</button>
          <button @click="calcAppend('2')" type="button">2</button>
          <button @click="calcAppend('3')" type="button">3</button>
          <button @click="calcAppend('-')" type="button" class="op">−</button>
          <button @click="calcAppend('0')" type="button">0</button>
          <button @click="calcAppend('00')" type="button">00</button>
          <button @click="calcAppend('000')" type="button">000</button>
          <button @click="calcAppend('+')" type="button" class="op">+</button>
          <button @click="calcDel" type="button" class="util">⌫</button>
          <button @click="calcClear" type="button" class="util">C</button>
          <button @click="calcCopyToJumlah" type="button" class="calc-copy">Salin ke Jumlah</button>
        </div>
      </div>
    </transition>
  </div>
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
import IconCalculator from '~icons/mdi/calculator';
import { onMounted, ref, computed, watch, nextTick } from 'vue';
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
const formVisible = ref(false);
const showCalc = ref(false);
const namaInput = ref(null);
const calcInputRef = ref(null);
onMounted(() => {
  setTimeout(() => {
    formVisible.value = true;
    nextTick(() => {
      if (namaInput.value) namaInput.value.focus();
    });
  }, 120);
});

watch(showCalc, (val) => {
  if (val) nextTick(() => { if (calcInputRef.value) calcInputRef.value.focus(); });
});

const calcInput = ref('');
const calcResult = ref('');
function calcAppend(val) { calcInput.value += val; }
function calcClear() { calcInput.value = ''; calcResult.value = ''; }
function calcDel() { calcInput.value = calcInput.value.slice(0, -1); }
function calcEval() {
  try {
    if (/^[\d+\-*/. ()]+$/.test(calcInput.value)) {
      // eslint-disable-next-line no-eval
      calcResult.value = eval(calcInput.value).toString();
    } else {
      calcResult.value = 'Err';
    }
  } catch { calcResult.value = 'Err'; }
}
function calcCopyToJumlah() {
  if (!isNaN(Number(calcResult.value))) form.value.jumlah = Number(calcResult.value);
}

watch(calcInput, (val) => {
  try {
    if (/^[\d+\-*/. ()]+$/.test(val) && val) {
      // eslint-disable-next-line no-eval
      calcResult.value = eval(val).toString();
    } else {
      calcResult.value = '';
    }
  } catch { calcResult.value = 'Err'; }
});

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
.form-animate {
  opacity: 0;
  transform: translateY(32px);
  animation: cardFadeUp 0.38s cubic-bezier(.4,1,.7,1) 0.12s forwards;
}
@keyframes cardFadeUp {
  to {
    opacity: 1;
    transform: none;
  }
}
.form-calc-row {
  display: flex;
  flex-direction: row;
  gap: 2.2rem;
  align-items: stretch;
  min-height: 480px;
}
.form-tambah, .calc-card {
  height: calc(100vh - 0);
}
.calc-card {
  max-width: 300px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.2rem 1.1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.7rem;
}
.calc-section-title {
  font-weight: 600;
  font-size: 1.08rem;
  margin-bottom: 0.7rem;
  color: #111;
  letter-spacing: 0.01em;
}
.calc-harga-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.3rem;
}
.calc-input {
  width: 100%;
  font-size: 1.13rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  background: #f8f8f8;
  color: #333;
  text-align: right;
}
.calc-result {
  font-size: 1.13rem;
  color: #259e4c;
  font-weight: 600;
  min-height: 1.2em;
  margin-bottom: 0.5rem;
}
.calc-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}
.calc-buttons button {
  font-size: 1.13rem;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  background: #f6f6f6;
  color: #333;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  padding: 0.55rem 0.2rem;
}
.calc-buttons button.op {
  background: #eaf4ff;
  color: #007AFF;
  font-weight: 600;
}
.calc-buttons button.eq {
  background: #34C759;
  color: #fff;
  font-weight: 700;
}
.calc-buttons button.util {
  background: #fbeaea;
  color: #FF3B30;
}
.calc-buttons button:hover {
  background: #e9ecef;
  color: #007AFF;
}
.calc-buttons button.eq:hover {
  background: #259e4c;
}
.calc-buttons button.op:hover {
  background: #d2eaff;
}
.calc-buttons button.util:hover {
  background: #ffeaea;
  color: #b2271c;
}
.calc-copy {
  grid-column: span 4;
  background: #007AFF;
  color: #fff;
  font-weight: 600;
  border: none;
  margin-top: 0.75rem;
  border-radius: 8px;
  font-size: 1.01rem;
}
.calc-copy:hover {
  background: #0051a8;
}
.jumlah-group {
  margin-bottom: 0.7rem;
}
.jumlah-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.jumlah-input-row input[type="number"] {
  min-width: 160px;
  flex: 1;
}
.btn-calc-toggle {
  min-height: 45px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  background: #f6f6f6;
  border: 1px solid #e9ecef;
  border-radius: 7px;
  padding: 0.38rem 0.7rem;
  font-size: 1.18rem;
  cursor: pointer;
  transition: background 0.18s, border 0.18s;
  margin-left: 0.2rem;
  color: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-calc-toggle:hover {
  background: #e9ecef;
  border-color: #bdbdbd;
}
.calc-icon {
  font-size: 1.18em;
}
.calc-fade-slide-enter-active, .calc-fade-slide-leave-active {
  transition: opacity 0.32s cubic-bezier(.4,1,.7,1), transform 0.32s cubic-bezier(.4,1,.7,1);
}
.calc-fade-slide-enter-from, .calc-fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-32px) scale(0.98);
}
.calc-fade-slide-enter-to, .calc-fade-slide-leave-from {
  opacity: 1;
  transform: none;
}
</style> 