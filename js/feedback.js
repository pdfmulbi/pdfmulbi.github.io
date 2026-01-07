// DOM Elements
const feedbackForm = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('submitBtn');
const formCard = document.getElementById('formCard');
const successCard = document.getElementById('successCard');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const messageInput = document.getElementById('messageInput');

// Base URL Backend
const API_BASE_URL = "https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger/pdfm";

// 1. Event: Saat Halaman Dimuat (Auto-Fill Data User)
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("authToken");

    // Jika user login, kita ambil datanya buat ngisi form otomatis
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/getone/users`, {
                headers: { "Authorization": "Bearer " + token }
            });

            if (response.ok) {
                const user = await response.json();
                // Isi input jika elemennya ada
                if (nameInput) nameInput.value = user.name || "";
                if (emailInput) emailInput.value = user.email || "";
            }
        } catch (e) {
            console.log("Guest mode atau gagal ambil data user:", e);
        }
    }
});

// 2. Event: Saat Tombol Kirim Ditekan
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        // [TAMBAHAN KEAMANAN] Cek jika tombol sudah disabled, hentikan proses
        if (submitBtn.disabled) return; 

        // Simpan teks asli tombol
        const originalBtnText = submitBtn.innerHTML;

        // UI Loading State 
        submitBtn.disabled = true; // Ini kunci agar tidak bisa diklik 2x
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Mengirim...';

        // Ambil Data dari Input Form
        const payload = {
            name: nameInput.value,
            email: emailInput.value,
            message: messageInput.value
        };

        // Siapkan Header (Cek Token lagi)
        const token = localStorage.getItem("authToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;

        try {
            // KIRIM KE BACKEND
            const res = await fetch(`${API_BASE_URL}/feedback`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // ============================================================
                // SUKSES
                // ============================================================
                
                // 1. Sembunyikan Form
                formCard.classList.add('d-none');
                
                // 2. Munculkan Card "Terima Kasih"
                successCard.classList.remove('d-none');

                // Catatan: Tidak ada kode NotificationManager di sini sesuai request.
                
            } else {
                // Gagal dari server (misal validasi error)
                const errData = await res.json();
                alert("Gagal mengirim feedback: " + (errData.message || "Terjadi kesalahan server"));
                
                // Kembalikan tombol seperti semula
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }

        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan jaringan. Periksa koneksi internet Anda.");
            
            // Kembalikan tombol seperti semula
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}