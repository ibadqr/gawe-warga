# GaweWarga (Platform Sistem Operasi Komunitas Desa)

Sistem operasi komunitas tingkat RT/RW dan platform SaaS modular mikro yang dirancang khusus agar ramah lansia (Dual-Face UI) dan hemat performa (no-build SPA).

## 🚀 Fitur Utama

- **Otentikasi Mandiri:** Login instan ramah lansia.
- **Dual-Face Layout:** Dashboard mobile-first untuk warga, dan dashboard desktop ultra-compact untuk developer/SaaS operator.
- **Arsitektur Modular:** Mengunci dan membuka fitur secara dinamis berdasarkan status lisensi berlangganan desa (`village_subscriptions`).

## 🛠️ Persyaratan Awal

Untuk menjalankan frontend, Anda tidak membutuhkan compiler seperti Node.js. Namun, jika ingin melakukan sinkronisasi database, pastikan Anda memiliki:
- [Supabase CLI](https://supabase.com/docs/guides/cli) (opsional, untuk pengembangan backend lokal)
- Web Server statis sederhana (seperti ekstensi VS Code Live Server)

## 💻 Cara Menjalankan Aplikasi secara Lokal

1. Kloning repositori ini ke komputer lokal Anda:
   ```bash
   git clone https://github.com/username/gawe-warga.git
   cd gawe-warga