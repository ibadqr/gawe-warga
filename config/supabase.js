// config/supabase.js

// 1. Kredensial Supabase Anda
export const supabaseUrl = "https://ltowncdmuuwxgvgspidt.supabase.co";
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0b3duY2RtdXV3eGd2Z3NwaWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzEzNjQsImV4cCI6MjA5OTYwNzM2NH0.cnnuT29S3uauyHAgXiWHjbiWxHpboujASL5oyGJNR4Y";

/**
 * Inisialisasi client Supabase secara aman.
 * Jika Anda menggunakan CDN di HTML, pastikan script CDN Supabase dipanggil sebelum modul ini.
 */
const getSupabaseClient = () => {
    if (typeof window !== 'undefined' && window.supabase) {
        return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    }
    // Fallback Mock Object agar VS Code IntelliSense & browser tidak error saat development offline
    return {
        auth: {
            signInWithPassword: async () => ({ data: { user: { id: "mock" } }, error: null }),
            signOut: async () => ({ error: null })
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: null })
                })
            })
        })
    };
};

export const supabase = getSupabaseClient();

/**
 * Helper global untuk mengecek status login warga di setiap halaman.
 */
export function checkSession() {
    if (typeof window === 'undefined') return null;
    
    const sessionStr = localStorage.getItem('userSession');
    if (!sessionStr) {
        window.location.href = 'index.html';
        return null;
    }
    
    try {
        return JSON.parse(sessionStr);
    } catch (e) {
        window.location.href = 'index.html';
        return null;
    }
}
