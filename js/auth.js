// js/auth.js
import { supabase } from '../config/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Tampilkan loading state agar pengguna tahu sistem sedang memproses
            Swal.fire({
                title: 'Mohon Tunggu...',
                text: 'Sedang memverifikasi data Anda',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const code = document.getElementById('login-code').value.trim();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                // 1. Ambil data Tenant berdasarkan Kode yang diinput user
                const { data: tenantData, error: tenantError } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('code', code)
                    .maybeSingle(); // Menggunakan maybeSingle agar tidak crash jika data kosong

                if (tenantError) {
                    throw new Error(`Database Tenant Error: ${tenantError.message}`);
                }

                if (!tenantData) {
                    throw new Error('Kode RT / Desa tidak terdaftar di sistem kami.');
                }

                // 2. Autentikasi User di Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (authError) {
                    throw new Error(`Autentikasi Gagal: ${authError.message}`);
                }

                // 3. Ambil data profil user untuk validasi wilayah/tenant dan role
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .maybeSingle();

                if (profileError) {
                    throw new Error(`Database Profile Error: ${profileError.message}`);
                }

                if (!profileData) {
                    throw new Error('Profil pengguna tidak ditemukan di database publik.');
                }

                // 4. Validasi kecocokan regional (Kecuali jika dia adalah developer global)
                if (profileData.role !== 'developer' && profileData.tenant_id !== tenantData.id) {
                    // Logout kembali jika mencoba masuk ke RT yang salah
                    await supabase.auth.signOut();
                    throw new Error('Akses ditolak! Akun Anda tidak terdaftar di wilayah RT ini.');
                }

                // 5. Simpan data sesi ke LocalStorage untuk digunakan di halaman dashboard/developer
                const userSession = {
                    userId: authData.user.id,
                    userName: profileData.full_name,
                    role: profileData.role,
                    tenantId: tenantData.id,
                    tenantName: tenantData.name
                };
                localStorage.setItem('userSession', JSON.stringify(userSession));

                // 6. Tampilkan pesan sukses dan arahkan halaman
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil Masuk!',
                    text: `Selamat datang kembali, ${profileData.full_name}!`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    if (profileData.role === 'developer') {
                        window.location.href = 'developer.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                });

            } catch (error) {
                // Menulis error lengkap di konsol browser untuk mempermudah pelacakan (F12)
                console.error("DEBUG ERROR GAWEWARGA:", error);

                // Tampilkan pesan error yang sangat detail ke user
                Swal.fire({
                    icon: 'error',
                    title: 'Waduh, Gagal Masuk!',
                    text: error.message || 'Terjadi kesalahan sistem yang tidak diketahui.',
                    confirmButtonText: 'Coba Lagi'
                });
            }
        });
    }
});
