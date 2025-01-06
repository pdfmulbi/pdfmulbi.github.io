// Import fungsi postJSON
import { postJSON } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.0/api.js';

// Event Listener setelah DOM dimuat
document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".submit-btn");
    const googleLoginButton = document.querySelector(".google-btn");

    // Login Manual
    if (loginButton) {
        loginButton.addEventListener("click", function (event) {
            event.preventDefault(); // Mencegah reload halaman

            // Ambil input email dan password
            const email = document.querySelector("input[name='email']").value || "";
            const password = document.querySelector("#password").value || "";

            // Validasi input
            if (!email || !password) {
                alert("Mohon isi email dan kata sandi.");
                return;
            }

            // Data yang akan dikirim ke backend
            const data = { email, password };
            const target_url = "https://asia-southeast1-pdfmulbi.cloudfunctions.net/pdfmulbi/pdfm/login";

            // Kirim data ke backend
            postJSON(
                target_url,
                "Content-Type",
                "application/json",
                data,
                function (response) {
                    // Tindak lanjut respons backend
                    if (response.status >= 200 && response.status < 300) {
                        alert("Login berhasil! Token: " + response.data.token);
                        console.log("User Data:", response.data);
                        // Reset input setelah berhasil login
                        document.querySelector("input[name='email']").value = "";
                        document.querySelector("#password").value = "";
                    } else {
                        alert("Gagal login: " + (response.data.message || "Kesalahan tidak diketahui"));
                    }
                }
            );
        });
    }

    // Login dengan Google
    if (googleLoginButton) {
        googleLoginButton.addEventListener("click", function () {
            // Simulasi token Google untuk uji coba (ganti dengan implementasi OAuth Google jika diperlukan)
            const token = prompt("Masukkan token Google Anda untuk simulasi login:");

            if (!token) {
                alert("Token Google tidak valid!");
                return;
            }

            // Data yang akan dikirim ke backend
            const data = { token };
            const target_url = "https://asia-southeast2-civil-epigram-429004-t8.cloudfunctions.net/webhook/google-login";

            // Kirim token ke backend
            postJSON(
                target_url,
                "Content-Type",
                "application/json",
                data,
                function (response) {
                    // Tindak lanjut respons backend
                    if (response.status >= 200 && response.status < 300) {
                        alert("Google Login berhasil!");
                        console.log("Google User Data:", response.data);
                    } else {
                        alert("Google Login gagal: " + (response.data.message || "Kesalahan tidak diketahui"));
                    }
                }
            );
        });
    } else {
        console.error("Tombol Google Login tidak ditemukan.");
    }
});
