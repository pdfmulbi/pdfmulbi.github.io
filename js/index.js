document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.querySelector('.logout-btn'); // Logout button in header
    const logoutLink = document.getElementById("logout-link"); // For backwards compatibility
    const dashboardButton = document.getElementById("dashboard-button");

    // Cari elemen login dan signup secara spesifik
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');

    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin");

    console.log("Token:", token);
    console.log("isAdmin dari localStorage:", isAdmin);

    // Cek apakah isAdmin tersimpan sebagai string "true"
    if (isAdmin === "true") {
        dashboardButton.style.display = "block";
    } else {
        dashboardButton.style.display = "none";
    }

    // Jika user sudah login, sembunyikan hanya tombol login & signup, bukan seluruh auth-buttons
    if (token) {
        // Jika token ditemukan - sembunyikan tombol login dan signup saja
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        // Show logout button in header
        if (logoutBtn) logoutBtn.style.display = "inline-flex";
        // Hide logout link in footer (if exists)
        if (logoutLink) logoutLink.style.display = "none";
    } else {
        // Jika token tidak ditemukan - tampilkan tombol login dan signup
        if (loginBtn) loginBtn.style.display = "inline-flex";
        if (signupBtn) signupBtn.style.display = "inline-flex";
        // Hide logout button in header
        if (logoutBtn) logoutBtn.style.display = "none";
        if (logoutLink) logoutLink.style.display = "none";
    }

    // Handle logout from header button
    if (logoutBtn && token) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    // Handle logout from footer link (backwards compatibility)
    if (logoutLink && token) {
        logoutLink.addEventListener("click", handleLogout);
    }

    function handleLogout() {
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
    }
});

