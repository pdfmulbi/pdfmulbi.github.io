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

