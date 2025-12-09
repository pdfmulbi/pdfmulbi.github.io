// =========================================
// LOGIN FUNCTIONALITY
// =========================================

document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".submit-btn");

    if (loginButton) {
        loginButton.addEventListener("click", async function (event) {
            event.preventDefault();

            const email = document.querySelector("input[name='email']").value.trim();
            const password = document.querySelector("#password").value.trim();

            if (!email || !password) {
                Swal.fire({
                    icon: "warning",
                    title: "Peringatan!",
                    text: "Mohon isi email dan kata sandi.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#e53e3e"
                });
                return;
            }

            // Show loading state
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

            const data = { email, password };
            const target_url = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/login";

            try {
                const response = await fetch(target_url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`Login gagal dengan status: ${response.status}`);
                }

                const result = await response.json();

                // Debugging: Lihat response dari server
                console.log("Response dari server:", result);

                // Pastikan data yang dibutuhkan ada
                if (!result.token || !result.userName) {
                    throw new Error("Data login tidak lengkap.");
                }

                // Pastikan isAdmin dikembalikan sebagai boolean
                const isAdmin = result.hasOwnProperty("isAdmin") ? result.isAdmin : false;

                // Debugging: Log nilai isAdmin sebelum disimpan
                console.log("isAdmin dari server:", isAdmin);

                // Simpan data ke localStorage
                localStorage.setItem("authToken", result.token);
                localStorage.setItem("userName", result.userName);
                localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

                // Notifikasi login sukses dengan redirect
                Swal.fire({
                    icon: "success",
                    title: "Login Berhasil!",
                    text: "Anda akan dialihkan...",
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = "https://pdfmulbi.github.io/";
                });

            } catch (error) {
                console.error("Error saat login:", error);

                // Reset button state
                loginButton.disabled = false;
                loginButton.innerHTML = 'Log in';

                Swal.fire({
                    icon: "error",
                    title: "Login Gagal!",
                    text: "Email atau kata sandi salah. Silakan coba lagi.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#e53e3e"
                });
            }
        });
    }
});

// =========================================
// PASSWORD TOGGLE FUNCTIONALITY
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("password");
    const togglePasswordButton = document.getElementById("togglePassword");

    if (togglePasswordButton && passwordInput) {
        const toggleIcon = togglePasswordButton.querySelector("i");

        togglePasswordButton.addEventListener("click", () => {
            // Check current state
            const isPasswordVisible = passwordInput.type === "text";

            // Toggle password visibility
            passwordInput.type = isPasswordVisible ? "password" : "text";

            // Toggle the icon
            toggleIcon.classList.toggle("fa-eye", !isPasswordVisible);
            toggleIcon.classList.toggle("fa-eye-slash", isPasswordVisible);
        });
    }
});
