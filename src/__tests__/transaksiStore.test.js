import { setActivePinia, createPinia } from 'pinia'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { useTransaksiStore } from '../store/index'
import axios from 'axios'

vi.mock('axios')

describe('useTransaksiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  test('state awal', () => {
    const store = useTransaksiStore()
    expect(store.transaksi).toEqual([])
    expect(store.nextId).toBe(1)
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  test('getter totalPemasukan, totalPengeluaran, saldo', () => {
    const store = useTransaksiStore()
    store.transaksi = [
      { id: '1', nama: 'A', jumlah: 1000, jenis: 'Pemasukan' },
      { id: '2', nama: 'B', jumlah: 500, jenis: 'Pengeluaran' },
      { id: '3', nama: 'C', jumlah: 2000, jenis: 'Pemasukan' }
    ]
    expect(store.totalPemasukan).toBe(3000)
    expect(store.totalPengeluaran).toBe(500)
    expect(store.saldo).toBe(2500)
  })

  test('tambahTransaksi menambah transaksi dan nextId bertambah', async () => {
    const store = useTransaksiStore()
    axios.post.mockResolvedValue({ data: { id: '1', nama: 'A', jumlah: 1000, jenis: 'Pemasukan' } })
    await store.tambahTransaksi({ nama: 'A', jumlah: 1000, jenis: 'Pemasukan' })
    expect(store.transaksi).toHaveLength(1)
    expect(store.transaksi[0].nama).toBe('A')
    expect(store.nextId).toBe('2')
    expect(store.error).toBe(null)
  })
}) 