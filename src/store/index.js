import { defineStore } from 'pinia'
import axios from 'axios'

export const useTransaksiStore = defineStore('transaksi', {
  state: () => ({
    transaksi: [],
    nextId: 1,
    loading: false,
    error: null
  }),
  getters: {
    totalPemasukan: (state) => state.transaksi.filter(t => t.jenis === 'Pemasukan').reduce((a, b) => a + b.jumlah, 0),
    totalPengeluaran: (state) => state.transaksi.filter(t => t.jenis === 'Pengeluaran').reduce((a, b) => a + b.jumlah, 0),
    saldo: (state) => {
      return state.transaksi.filter(t => t.jenis === 'Pemasukan').reduce((a, b) => a + b.jumlah, 0) -
             state.transaksi.filter(t => t.jenis === 'Pengeluaran').reduce((a, b) => a + b.jumlah, 0)
    }
  },
  actions: {
    async fetchTransaksi() {
      this.loading = true;
      try {
        const res = await axios.get('http://localhost:3000/transaksi');
        this.transaksi = res.data;
        this.nextId = this.transaksi.length > 0 ? Math.max(...this.transaksi.map(t => t.id)) + 1 : 1;
        this.error = null;
      } catch (e) {
        this.error = 'Gagal mengambil data transaksi';
      } finally {
        this.loading = false;
      }
    },
    async tambahTransaksi(data) {
      try {
        const res = await axios.post('http://localhost:3000/transaksi', { ...data, id: this.nextId });
        this.transaksi.push(res.data);
        this.nextId++;
        this.error = null;
      } catch (e) {
        this.error = 'Gagal menambah transaksi';
      }
    },
    async hapusTransaksi(id) {
      try {
        await axios.delete(`http://localhost:3000/transaksi/${id}`);
        this.transaksi = this.transaksi.filter(t => t.id !== id);
        this.error = null;
      } catch (e) {
        this.error = 'Gagal menghapus transaksi';
      }
    },
    async editTransaksi(data) {
      try {
        const res = await axios.put(`http://localhost:3000/transaksi/${data.id}`, data);
        const idx = this.transaksi.findIndex(t => t.id === data.id);
        if (idx !== -1) {
          this.transaksi.splice(idx, 1, res.data);
        }
        this.error = null;
      } catch (e) {
        this.error = 'Gagal mengedit transaksi';
      }
    }
  }
}) 