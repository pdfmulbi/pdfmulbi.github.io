document.addEventListener("DOMContentLoaded", function () {
    const authButtons = document.getElementById("auth-buttons");
    const logoutLink = document.getElementById("logout-link");
    const dashboardButton = document.getElementById("dashboard-button");

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

    // Tampilkan tombol logout jika login
    if (logoutLink && token) {
        logoutLink.style.display = "block";
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
