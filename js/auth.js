/**
 * auth.js - Authentication state handler for all pages
 * Handles hide/show of login and signup buttons based on login state
 * Also handles logout functionality
 */

document.addEventListener("DOMContentLoaded", function () {
    const logoutLink = document.getElementById("logout-link");

    // Cari elemen login dan signup secara spesifik
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');

    const token = localStorage.getItem("authToken");

    // Jika user sudah login, sembunyikan hanya tombol login & signup
    if (token) {
        // Jika token ditemukan - sembunyikan tombol login dan signup saja
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        if (logoutLink) logoutLink.style.display = "block";
    } else {
        // Jika token tidak ditemukan - tampilkan tombol login dan signup
        if (loginBtn) loginBtn.style.display = "inline-flex";
        if (signupBtn) signupBtn.style.display = "inline-flex";
        if (logoutLink) logoutLink.style.display = "none";
    }

    // Handle logout
    if (logoutLink && token) {
        logoutLink.addEventListener("click", function () {
            fetch("https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger/pdfm/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (response.ok) {
                        localStorage.clear();
                        Swal.fire({
                            icon: "success",
                            title: "Logout Berhasil!",
                            text: "Anda telah berhasil logout.",
                            confirmButtonText: "OK"
                        }).then(() => {
                            window.location.href = "index.html";
                        });
                    } else {
                        return response.json().then((data) => {
                            Swal.fire({
                                icon: "error",
                                title: "Gagal Logout",
                                text: data.message || "Kesalahan tidak diketahui.",
                                confirmButtonText: "OK"
                            });
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Gagal Logout",
                        text: "Silakan coba lagi.",
                        confirmButtonText: "OK"
                    });
                });
        });
    }
});
