# AturKuy - Aplikasi Manajemen Keuangan

Aplikasi web untuk mengelola keuangan pribadi dengan antarmuka yang modern dan intuitif. Dibangun menggunakan Vue 3, Vite, dan Pinia untuk state management.

## 🚀 Fitur Utama

- **Dashboard Keuangan**: Tampilan ringkasan pemasukan, pengeluaran, dan saldo
- **Tambah Transaksi**: Input pemasukan dan pengeluaran dengan form yang user-friendly
- **Grafik Keuangan**: Visualisasi data keuangan dengan Chart.js
- **Export Data**: Export data ke PDF dan Excel
- **Responsive Design**: Tampilan yang responsif untuk desktop dan mobile
- **Unit Testing**: Test coverage menggunakan Vitest dan Vue Test Utils

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Vue 3 + Vite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **UI Components**: Custom components dengan CSS modern
- **Charts**: Chart.js + vue-chartjs
- **Export**: jsPDF, jspdf-autotable, XLSX
- **Testing**: Vitest + Vue Test Utils
- **Icons**: Unplugin Icons (Material Design Icons)
- **Backend**: JSON Server (development)

## 📦 Instalasi

### Prerequisites
- Node.js (versi 16 atau lebih baru)
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <URL_REPOSITORY>
   cd uas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan JSON Server (untuk backend)**
   ```bash
   npm run json-server
   ```

4. **Jalankan aplikasi development**
   ```bash
   npm run dev
   ```

5. **Buka browser**
   Navigasi ke `http://localhost:5173`

## 🧪 Testing

### Menjalankan Unit Tests
```bash
# Jalankan semua test
npm run test

# Jalankan test dengan mode watch
npm run test:watch

# Jalankan test tertentu
npm run test src/__tests__/Login.test.js
```

### Struktur Test
```
src/__tests__/
├── Login.test.js           # Test komponen Login
└── transaksiStore.test.js  # Test Pinia store
```

## 📁 Struktur Project

```
uas/
├── src/
│   ├── components/         # Vue components
│   │   ├── Dashboard.vue
│   │   ├── Login.vue
│   │   ├── Sidebar.vue
│   │   ├── TambahPemasukan.vue
│   │   ├── TambahPengeluaran.vue
│   │   └── GrafikKeuangan.vue
│   ├── store/             # Pinia store
│   │   └── index.js
│   ├── router/            # Vue Router
│   │   └── index.js
│   ├── assets/            # Static assets
│   └── __tests__/         # Unit tests
├── public/                # Public assets
├── db.json               # JSON Server database
└── package.json
```

## 🎯 Fitur Detail

### Dashboard
- Ringkasan total pemasukan, pengeluaran, dan saldo
- Daftar transaksi terbaru
- Filter dan pencarian transaksi
- Export data ke PDF/Excel

### Manajemen Transaksi
- Tambah pemasukan dengan kalkulator built-in
- Tambah pengeluaran dengan validasi saldo
- Edit dan hapus transaksi
- Validasi input real-time

### Grafik Keuangan
- Visualisasi tren pemasukan vs pengeluaran
- Grafik bulanan dan tahunan
- Interaktif dengan Chart.js

## 🔧 Scripts

```bash
# Development
npm run dev              # Jalankan development server
npm run build            # Build untuk production
npm run preview          # Preview build production

# Testing
npm run test             # Jalankan semua test
npm run test:watch       # Test dengan mode watch

# Backend
npm run json-server      # Jalankan JSON Server
```

## 🧪 Unit Testing

Project ini menggunakan Vitest dan Vue Test Utils untuk unit testing:

- **Komponen Testing**: Test render dan interaksi komponen Vue
- **Store Testing**: Test state management dengan Pinia
- **Mocking**: Mock untuk axios dan router

### Contoh Test
```javascript
import { mount } from '@vue/test-utils'
import { describe, test, expect } from 'vitest'
import Login from '../components/Login.vue'

describe('Login.vue', () => {
  test('renders login form', () => {
    const wrapper = mount(Login)
    expect(wrapper.find('h2').text()).toBe('Login ke AturKuy')
  })
})
```

## 🚀 Deployment

### Build untuk Production
```bash
npm run build
```

### Deploy ke Platform
- **Vercel**: Connect repository dan deploy otomatis
- **Netlify**: Drag & drop folder `dist`
- **GitHub Pages**: Setup GitHub Actions

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Project ini dibuat untuk UAS Praktikum Pemrograman Berbasis Komponen.

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan Vue 3 dan teknologi modern lainnya.

---

**AturKuy** - Atur Keuanganmu dengan Mudah! 💰
