// js/dashboard.js
import { checkSession } from '../config/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. CEK AUTENTIKASI WARGA
    const session = checkSession();
    if (!session) return; // Jika gagal, otomatis di-redirect di checkSession

    // 2. TAMPILKAN DATA PENGGUNA DI DOM (DESKTOP & MOBILE)
    const desktopUsername = document.getElementById('desktop-username');
    const mobileUsername = document.getElementById('mobile-username');
    const desktopRole = document.getElementById('desktop-role');
    const desktopTenantBadge = document.getElementById('desktop-tenant-badge');
    const mobileTenantBadge = document.getElementById('mobile-tenant-badge');

    if (desktopUsername) desktopUsername.textContent = session.userName;
    if (mobileUsername) mobileUsername.textContent = session.userName;
    if (desktopRole) desktopRole.textContent = session.role;
    
    if (desktopTenantBadge) desktopTenantBadge.textContent = session.tenantCode;
    if (mobileTenantBadge) mobileTenantBadge.textContent = session.tenantCode;

    // Tampilkan panel developer jika user yang masuk adalah "developer" / admin SaaS
    const desktopDevLink = document.getElementById('desktop-dev-link');
    if (desktopDevLink && session.role === 'developer') {
        desktopDevLink.classList.remove('hidden');
    }

    // 3. HANDLER TOMBOL LOGOUT (DESKTOP & MOBILE)
    const logoutHandler = () => {
        Swal.fire({
            title: 'Yakin Ingin Keluar?',
            text: "Sesi masuk Anda akan dihapus secara lokal.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('userSession');
                window.location.href = 'index.html';
            }
        });
    };

    const desktopLogoutBtn = document.getElementById('desktop-logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    if (desktopLogoutBtn) desktopLogoutBtn.addEventListener('click', logoutHandler);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', logoutHandler);
});