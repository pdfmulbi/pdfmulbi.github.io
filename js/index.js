document.addEventListener("DOMContentLoaded", function () {
    const authButtons = document.getElementById("auth-buttons");
    const logoutLink = document.getElementById("logout-link");
    const dashboardButton = document.getElementById("dashboard-button");

    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin");

    // Show dashboard button only if user is admin
    if (isAdmin === "true") {
        dashboardButton.style.display = "block";
    } else {
        dashboardButton.style.display = "none";
    }

    // Jika user sudah login, sembunyikan tombol login & tampilkan logout
    if (token) {
        // Jika token ditemukan
        authButtons.style.display = "none";
        logoutLink.style.display = "block";
    } else {
        // Jika token tidak ditemukan
        authButtons.style.display = "flex";
        logoutLink.style.display = "none";
    }

    // Fungsi Logout
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
            const token = localStorage.getItem("authToken");

            if (!token) {
                alert("Anda belum login.");
                return;
            }

            const logoutUrl = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/logout";

            fetch(logoutUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (response.ok) {
                        localStorage.clear();
                        alert("Logout berhasil.");
                        window.location.href = "https://pdfmulbi.github.io/";
                    } else {
                        return response.json().then((data) => {
                            alert("Gagal logout: " + (data.message || "Kesalahan tidak diketahui"));
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    alert("Terjadi kesalahan saat logout. Silakan coba lagi.");
                });
        });
    }
});
