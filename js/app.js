// js/app.js
import { showToast } from './ui.js';
import { initDashboard } from './modules/dashboard.js';

// State Global Aplikasi
export const AppState = {
    user: null,
    village: {
        id: 'aa3a1bde-4672-466d-b8d9-fc3d98ef732a', // Default ID RT 02 Jatirogo dari seed.sql
        name: 'RT 02 Jatirogo'
    },
    subscriptions: {
        arisan: true,
        masjid: true,
        karang_taruna: false,
        pinjam_alat: false
    }
};

// Fungsi Router Tab / Switch Screen
export function switchScreen(screenId) {
    // Sembunyikan semua screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Tampilkan screen target
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Pemicu inisialisasi modul jika layar berganti
        if (screenId === 'screen-forum') {
            import('./modules/forum.js').then(module => module.initForum());
        } else if (screenId === 'screen-developer') {
            import('./modules/developer.js').then(module => module.initDeveloperPanel());
        } else if (screenId === 'screen-beranda') {
            initDashboard(); // refresh status dashboard setiap masuk beranda
        }
    }
}

// Handler Navigasi Modul Berlangganan
export function navigateToModule(moduleName) {
    const hasAccess = AppState.subscriptions[moduleName];
    
    if (hasAccess) {
        if (moduleName === 'arisan') {
            showToast('Membuka Modul Arisan...', 'success');
        } else if (moduleName === 'masjid') {
            showToast('Membuka Modul Kas Masjid...', 'success');
        }
    } else {
        showLockPopup(moduleName);
    }
}

// Handler Pop-up untuk Modul Terkunci
export function showLockPopup(moduleName) {
    showToast(`Modul "${moduleName.replace('_', ' ')}" Belum Aktif! Hubungi Admin.`, 'error');
}

// Daftarkan fungsi ke window global agar aman diakses dari elemen HTML onclick
window.switchScreen = switchScreen;
window.navigateToModule = navigateToModule;
window.showLockPopup = showLockPopup;

// Inisialisasi awal saat dokumen siap
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initDashboard(); // Muat status card di awal
    console.log("GaweWarga SPA Core initialized.");
});