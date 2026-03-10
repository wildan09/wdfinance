# WilDev Finance 💰

**Aplikasi Pencatatan Keuangan Pribadi** — Mobile-first PWA

> Catat. Kelola. Sejahtera.

## 🚀 Tech Stack

- **Frontend**: Vue 3 (Composition API + `<script setup>`)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **State Management**: Pinia
- **Router**: Vue Router 4
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Charts**: ApexCharts (vue3-apexcharts)
- **Export**: jsPDF + SheetJS (xlsx)
- **AI**: Claude AI Vision via Supabase Edge Function
- **PWA**: vite-plugin-pwa (installable di Android & iOS)

## 📋 Fitur

- ✅ Single user login (tanpa register)
- ✅ Dashboard dengan saldo, wallet carousel, quick actions
- ✅ Catat pemasukan, pengeluaran, transfer
- ✅ Multi wallet (Tunai, Bank, E-Wallet, Investasi)
- ✅ Kategori dengan icon & warna
- ✅ Budget per kategori dengan progress bar
- ✅ Laporan & chart (donut, bar, line)
- ✅ Target tabungan dengan progress circular
- ✅ AI scan struk belanja (Claude Vision)
- ✅ Export PDF & Excel
- ✅ Web Notifications (budget alert, daily reminder)
- ✅ PWA installable
- ✅ Dark mode only
- ✅ Bahasa Indonesia

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Copy `.env.example` ke `.env` dan isi kredensial:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Buat user di Supabase Auth Dashboard:
   - Email: `wildandeva@wildevfinance.app`
   - Password: `wd12345678`

4. Jalankan SQL di `supabase/database/schema.sql` di SQL Editor

5. (Optional) Deploy Edge Function untuk AI scan struk:
   - Set secret `ANTHROPIC_API_KEY` di Supabase Dashboard
   - Deploy: `supabase functions deploy scan-receipt`

### 3. Jalankan Dev Server

```bash
npm run dev
```

### 4. Build Production

```bash
npm run build
```

## 🔐 Login

- **Username**: `wildan&deva`
- **Password**: `wd12345678`

## 📱 Install PWA

- **Android**: Buka di Chrome → Menu → "Add to Home Screen"
- **iOS**: Buka di Safari → Share → "Add to Home Screen"

## 🌐 Deploy ke Vercel

1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Set environment variables di Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy otomatis!

## 📁 Struktur Project

```
src/
├── assets/css/main.css     ← Tailwind v4 @theme
├── components/             ← 25 komponen Vue
├── composables/            ← 9 composable functions
├── stores/                 ← 5 Pinia stores
├── pages/                  ← 8 halaman
├── router/                 ← Vue Router + auth guard
├── utils/                  ← Currency, date, formatters
├── lib/supabase.js         ← Supabase client
├── App.vue
└── main.js
```

---

**WilDev Finance** v1.0.0 — Built with ❤️
