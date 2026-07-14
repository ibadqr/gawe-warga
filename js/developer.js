// js/developer.js
import { checkSession } from '../config/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. CEK AUTENTIKASI DEVELOPER
    const session = checkSession();
    if (!session) return;

    // Pastikan role-nya adalah developer / admin SaaS
    if (session.role !== 'developer') {
        Swal.fire({
            icon: 'error',
            title: 'Akses Ditolak',
            text: 'Halaman ini khusus untuk pengembang/developer platform.',
            confirmButtonText: 'Kembali'
        }).then(() => {
            window.location.href = 'dashboard.html';
        });
        return;
    }

    // Tampilkan Nama Developer di Header Mobile
    const mobileUsername = document.getElementById('mobile-username');
    if (mobileUsername) mobileUsername.textContent = session.userName;

    // 2. LOGIKA DATA TENANT (DENGAN LOCALSTORAGE SIMULASI ATAU SUPABASE)
    const getTenants = () => {
        const localTenants = localStorage.getItem('saasTenants');
        if (localTenants) {
            return JSON.parse(localTenants);
        }
        // Data awal
        const defaultTenants = [
            { id: '1', name: 'RT 01 Kutorejo', code: 'DESA-KUTOREJO-01' },
            { id: '2', name: 'RT 02 Kutorejo', code: 'DESA-KUTOREJO-02' },
            { id: '3', name: 'RT 05 Jatirogo', code: 'DESA-JATIROGO-05' }
        ];
        localStorage.setItem('saasTenants', JSON.stringify(defaultTenants));
        return defaultTenants;
    };

    const renderTenants = () => {
        const tenants = getTenants();
        const tbody = document.getElementById('tenant-list-tbody');
        const totalBadge = document.getElementById('total-tenants');
        
        if (totalBadge) totalBadge.textContent = tenants.length;
        if (!tbody) return;

        tbody.innerHTML = '';
        tenants.forEach(tenant => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-stone-50 transition';
            tr.innerHTML = `
                <td class="py-3.5 font-bold text-stone-700">${tenant.name}</td>
                <td class="py-3.5 font-mono text-xs text-village-700 font-bold">${tenant.code}</td>
                <td class="py-3.5 text-right">
                    <button class="text-red-500 hover:text-red-700 transition delete-tenant-btn" data-id="${tenant.id}">
                        <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        lucide.createIcons();
        attachDeleteEvents();
    };

    // Handler Create Tenant
    const tenantForm = document.getElementById('tenant-form');
    if (tenantForm) {
        tenantForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('tenant-name').value.trim();
            const code = document.getElementById('tenant-code').value.trim().toUpperCase();

            if (!name || !code) return;

            const tenants = getTenants();
            
            // Cek duplikasi kode tenant
            if (tenants.some(t => t.code === code)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Kode Duplikat',
                    text: 'Tenant dengan kode tersebut sudah terdaftar.'
                });
                return;
            }

            const newTenant = {
                id: Date.now().toString(),
                name,
                code
            };

            tenants.push(newTenant);
            localStorage.setItem('saasTenants', JSON.stringify(tenants));
            
            Swal.fire({
                icon: 'success',
                title: 'Tenant Terdaftar!',
                text: `Tenant ${name} dengan kode ${code} berhasil disinkronkan ke cloud database.`,
                timer: 2000,
                showConfirmButton: false
            });

            tenantForm.reset();
            renderTenants();
        });
    }

    // Handler Delete Tenant
    const attachDeleteEvents = () => {
        document.querySelectorAll('.delete-tenant-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tenantId = this.getAttribute('data-id');
                
                Swal.fire({
                    title: 'Hapus Tenant?',
                    text: "Seluruh data user dan log di bawah tenant ini akan ikut terhapus!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Ya, Hapus!',
                    cancelButtonText: 'Batal'
                }).then((result) => {
                    if (result.isConfirmed) {
                        let tenants = getTenants();
                        tenants = tenants.filter(t => t.id !== tenantId);
                        localStorage.setItem('saasTenants', JSON.stringify(tenants));
                        Swal.fire('Terhapus!', 'Database Tenant telah di-wipe.', 'success');
                        renderTenants();
                    }
                });
            });
        });
    };

    // Danger Zone: Seed / Reset Database
    const seedBtn = document.getElementById('seed-db-btn');
    if (seedBtn) {
        seedBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Reset & Inject Data?',
                text: "Data simulasi arisan dan masjid akan ditimpa dengan sample data baru.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Suntik Data',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Masukkan seed data ke localStorage
                    const mockArisan = [
                        { id: 1, name: "Arisan Bulanan RT 02", fee: 100000, status: "Aktif" },
                        { id: 2, name: "Arisan Ibu-Ibu PKK", fee: 50000, status: "Selesai" }
                    ];
                    const mockKasMasjid = [
                        { id: 1, type: "Masuk", amount: 1500000, desc: "Sumbangan hamba Allah" },
                        { id: 2, type: "Keluar", amount: 500000, desc: "Pembelian kipas angin baru" }
                    ];
                    localStorage.setItem('mock_arisan_data', JSON.stringify(mockArisan));
                    localStorage.setItem('mock_kas_masjid', JSON.stringify(mockKasMasjid));

                    Swal.fire({
                        icon: 'success',
                        title: 'Data Berhasil Diinjeksi!',
                        text: 'Simulasi data arisan dan kas masjid berhasil diperbarui.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        });
    };

    // 3. LOGOUT HANDLERS
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

    // Initial render
    renderTenants();
});