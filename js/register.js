// =========================================
// REGISTER FUNCTIONALITY
// =========================================

document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.getElementById("registerButton");
    const registerForm = document.getElementById("registerForm");

    if (registerButton && registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            // Ambil nilai input
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            // Validasi sederhana
            if (!name || !email || !password) {
                Swal.fire({
                    icon: "warning",
                    title: "Peringatan!",
                    text: "Silakan isi semua kolom.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#e53e3e"
                });
                return;
            }

            // Cek format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Swal.fire({
                    icon: "error",
                    title: "Email Tidak Valid!",
                    text: "Harap masukkan email yang benar.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#e53e3e"
                });
                return;
            }

            // Validasi password minimal 6 karakter
            if (password.length < 6) {
                Swal.fire({
                    icon: "warning",
                    title: "Password Terlalu Pendek!",
                    text: "Password harus minimal 6 karakter.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#e53e3e"
                });
                return;
            }

            // Show loading state
            registerButton.disabled = true;
            registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

            // Data yang akan dikirim ke backend
            const data = {
                name: name,
                email: email,
                password: password,
            };

            try {
                // URL endpoint backend
                const targetUrl = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/register";

                // Kirim data ke backend
                const response = await fetch(targetUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                // Periksa status respons
                if (response.ok) {
                    const result = await response.json();

                    // Notifikasi sukses dengan redirect otomatis
                    Swal.fire({
                        icon: "success",
                        title: "Registrasi Berhasil!",
                        text: result.message || "Anda akan diarahkan ke halaman login.",
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true
                    }).then(() => {
                        // Reset form setelah sukses
                        document.getElementById("name").value = "";
                        document.getElementById("email").value = "";
                        document.getElementById("password").value = "";

                        // Redirect ke halaman login
                        window.location.href = "https://pdfmulbi.github.io/login";
                    });

                } else {
                    const errorData = await response.json();

                    // Reset button state
                    registerButton.disabled = false;
                    registerButton.innerHTML = 'Register';

                    Swal.fire({
                        icon: "error",
                        title: "Registrasi Gagal!",
                        text: errorData.message || "Email mungkin sudah terdaftar. Silakan coba lagi.",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#e53e3e"
                    });
                }
            } catch (error) {
                console.error("Error during registration:", error);

                // Reset button state
                registerButton.disabled = false;
                registerButton.innerHTML = 'Register';

                Swal.fire({
                    icon: "error",
                    title: "Terjadi Kesalahan!",
                    text: "Tidak dapat terhubung ke server. Silakan coba lagi nanti.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#e53e3e"
                });
            }
        });
    }

    // =========================================
    // PASSWORD TOGGLE FUNCTIONALITY
    // =========================================
    const passwordInput = document.getElementById("password");
    const togglePasswordButton = document.getElementById("togglePassword");

    if (togglePasswordButton && passwordInput) {
        const toggleIcon = togglePasswordButton.querySelector("i");

        togglePasswordButton.addEventListener("click", () => {
            const isPasswordVisible = passwordInput.type === "text";
            passwordInput.type = isPasswordVisible ? "password" : "text";
            toggleIcon.classList.toggle("fa-eye-slash", isPasswordVisible);
            toggleIcon.classList.toggle("fa-eye", !isPasswordVisible);
        });
    }
});
