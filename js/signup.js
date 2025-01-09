import {
    postJSON
} from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js";

document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.getElementById("registerButton");

    registerButton.addEventListener("click", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Basic validation
        if (!name || !email || !password) {
            alert("Silakan isi semua kolom.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Kata sandi dan konfirmasi kata sandi tidak cocok.");
            return;
        }

        // Cek nama unik di backend
        try {
            const checkUrl = `https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/check-name?name=${encodeURIComponent(name)}`;
            const checkResponse = await fetch(checkUrl);

            if (!checkResponse.ok) {
                throw new Error("Gagal memeriksa ketersediaan nama.");
            }

            const checkData = await checkResponse.json();

            if (checkData.exists) {
                alert("Nama sudah digunakan. Silakan gunakan nama lain.");
                return;
            }

            // Prepare data for registration
            const data = {
                name: name,
                email: email,
                password: password,
            };

            // URL endpoint backend
            const target_url = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/register";

            // Tampilkan spinner loading (opsional)
            document.getElementById("loading-spinner").style.display = "block";

            // Kirim data ke backend
            const response = await postJSON(
                target_url,
                "Content-Type",
                "application/json",
                data
            );

            // Sembunyikan spinner loading
            document.getElementById("loading-spinner").style.display = "none";

            if (response.status >= 200 && response.status < 300) {
                alert("Registration successful!");
                // Reset form setelah berhasil
                document.getElementById("name").value = "";
                document.getElementById("email").value = "";
                document.getElementById("password").value = "";
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("Terjadi kesalahan saat melakukan registrasi. Silakan coba lagi.");
            document.getElementById("loading-spinner").style.display = "none";
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');

    // Toggle password visibility
    togglePassword.addEventListener('click', function () {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

        // Ganti ikon mata
        eyeIcon.innerHTML = isPassword
            ? '<line x1="1" y1="1" x2="23" y2="23"></line><path d="M17.94 17.94C16.64 18.85 15 19 12 19s-4.64-.15-5.94-1.06"></path>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    });
});