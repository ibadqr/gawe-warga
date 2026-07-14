# Dokumen Desain Sistem: GaweWarga
> **Sistem Operasi Komunitas Desa & Platform SaaS Modular Mikro**
> *Dioptimalkan untuk Solo Developer menggunakan HTML5, Tailwind CSS (CDN), Vanilla JavaScript, dan Supabase.*

---

## 1. Ringkasan Proyek & Visi Produk

**GaweWarga** adalah aplikasi web super (*super-app*) lokal yang dirancang khusus untuk menjembatani kebutuhan sosial dan finansial warga di tingkat pedesaan (RT/RW/Dusun). 

Aplikasi ini menggunakan pendekatan **Dual-Face UI/UX** untuk merangkul dua demografi utama di desa:
1. **Pemuda (Karang Taruna/Pengurus):** Bertindak sebagai operator yang menginput data, mengelola iuran, dan mengatur logistik lapangan melalui HP.
2. **Orang Tua (Bapak/Ibu Warga):** Bertindak sebagai konsumen informasi pasif yang membutuhkan tampilan sederhana, tulisan besar, login instan tanpa password, serta integrasi notifikasi langsung ke WhatsApp.

### Model Bisnis: Modular SaaS (Pay-per-Feature)
Aplikasi ini ditawarkan secara **Freemium**. Fitur informasi dasar diberikan secara gratis guna memicu instalasi massal oleh warga (*pancingan pasar*). Desa/RT hanya membayar biaya langganan bulanan mikro untuk setiap modul spesifik (premium) yang mereka aktifkan sesuai kebutuhan.

---

## 2. Arsitektur Teknologi & Batasan Sistem

Sebagai proyek yang dikembangkan oleh *solo developer*, arsitektur teknologi sengaja dipilih yang paling efisien, minim biaya pemeliharaan (*zero-maintenance cost* di awal), dan tanpa proses kompilasi (*no-build step*):

*   **Frontend:** Single File HTML5, Tailwind CSS (via CDN), dan Vanilla JavaScript (DOM Manipulation & State Management).
*   **Database & Auth:** Supabase (PostgreSQL) menggunakan fitur bawaan Row Level Security (RLS) dan Auth via WhatsApp OTP/Email.
*   **Hosting:** Vercel / GitHub Pages (Statik & Gratis).
*   **WhatsApp Gateway:** Fonnte / Wablas API (Pihak ketiga untuk integrasi notifikasi WhatsApp otomatis).

---

## 3. Skema Database (Supabase / PostgreSQL)

Database dirancang menggunakan arsitektur **Multi-Tenant** berbasis kolom `village_id` sehingga satu basis data dapat melayani banyak desa secara terisolasi dan aman.

```sql
-- ========================================================
-- 1. TABEL UTAMA DESA (TENANT)
-- ========================================================
CREATE TABLE villages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sub_district VARCHAR(255) NOT NULL,
    regency VARCHAR(255) NOT NULL, -- Contoh: Tuban
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================================
-- 2. TABEL AKUN PENGGUNA (WARGA & ADMIN)
-- ========================================================
CREATE TABLE users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'warga' NOT NULL, -- 'warga', 'admin_rt', 'super_admin'
    rt_rw VARCHAR(10) NOT NULL, -- Contoh: "02/01"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================================
-- 3. SAKLAR LISENSI MODUL (SAAS MODULAR CONFIGURATION)
-- ========================================================
CREATE TABLE village_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    module_name VARCHAR(100) NOT NULL, -- 'arisan', 'karang_taruna', 'masjid'
    is_subscribed BOOLEAN DEFAULT FALSE NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL,
    expired_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(village_id, module_name)
);

-- ========================================================
-- 4. TABEL DATA MODUL GRATIS: FORUM & INFORMASI
-- ========================================================
CREATE TABLE announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'kegiatan', 'berita_duka', 'iuran', 'umum'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================================
-- 5. TABEL DATA MODUL PREMIUM: ARISAN IBU-IBU
-- ========================================================
CREATE TABLE arisan_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    monthly_dues NUMERIC(10, 2) NOT NULL, -- Nominal iuran
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE arisan_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES arisan_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    has_won BOOLEAN DEFAULT FALSE NOT NULL, -- Menandai jika sudah pernah menang kocokan
    payment_status VARCHAR(50) DEFAULT 'unpaid' NOT NULL, -- 'paid', 'unpaid'
    won_at TIMESTAMP WITH TIME ZONE
);

-- ========================================================
-- 6. TABEL DATA MODUL PREMIUM: KAS & DONASI MASJID
-- ========================================================
CREATE TABLE mosque_funds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'income' (masuk), 'expense' (keluar)
    amount NUMERIC(12, 2) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE mosque_needs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    qty_needed INT NOT NULL,
    qty_fulfilled INT DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL -- 'pending', 'partial', 'completed'
);