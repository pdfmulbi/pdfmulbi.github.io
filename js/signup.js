import {
    postJSON
} from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js";

document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.getElementById("registerButton");

    registerButton.addEventListener("click", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            alert("Silakan isi semua kolom.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Kata sandi dan konfirmasi kata sandi tidak cocok.");
            return;
        }

        // Prepare data
        const data = {
            name: name,
            email: email,
            password: password,
        };

        // URL endpoint backend
        const target_url = "https://asia-southeast1-pdfmulbi.cloudfunctions.net/pdfmulbi/pdfm/register";

        // Tampilkan spinner loading (opsional)
        document.getElementById("loading-spinner").style.display = "block";

        postJSON(
            target_url,
            "Content-Type",
            "application/json",
            data,
            function (response) {
            // Sembunyikan spinner loading
            document.getElementById("loading-spinner").style.display = "none";

            if (response.status >= 200 && response.status < 300) {
                alert("Registration successful! Token: " + response.data.token);
                // Reset form setelah berhasil
                document.getElementById("nameInput").value = "";
                document.getElementById("emailInput").value = "";
                document.getElementById("passwordInput").value = "";
                document.getElementById("confirmPasswordInput").value = "";
            } else {
                alert("Error: " + response.data.message);
            }
        });
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
        if (isPassword) {
            eyeIcon.innerHTML = `
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M17.94 17.94C16.64 18.85 15 19 12 19s-4.64-.15-5.94-1.06"></path>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });
});