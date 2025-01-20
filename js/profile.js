document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken");
    const userName = localStorage.getItem("userName");

    // Jika token tidak ditemukan, arahkan ke halaman login
    if (!token || !userName) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "https://pdfmulbi.github.io/login/";
        return;
    }

    // Fungsi Logout
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", function () {
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
                        localStorage.removeItem("authToken");
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
                    alert("Terjadi kesalahan saat logout.");
                });
        });
    }

    // Ambil data pengguna
    fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/getone/users", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Gagal mengambil data pengguna.");
            }
        })
        .then((user) => {
            // Tampilkan data pengguna di profil
            document.getElementById("name").textContent = user.name;
            document.getElementById("email").textContent = user.email;
            document.getElementById("password").textContent = "******"; // Password tidak ditampilkan langsung

            // Isi form edit profil
            document.getElementById("name-input").value = user.name;
            document.getElementById("email-input").value = user.email;
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Gagal memuat data profil.");
        });

    // Simpan perubahan profil
    document.getElementById("profile-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const updatedData = {
            name: document.getElementById("name-input").value,
            email: document.getElementById("email-input").value,
            password: document.getElementById("password-input").value,
        };

        fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/update/users", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        })
            .then((response) => {
                if (response.ok) {
                    alert("Profil berhasil diperbarui.");
                    window.location.reload();
                } else {
                    return response.json().then((data) => {
                        alert("Gagal memperbarui profil: " + (data.message || "Kesalahan tidak diketahui"));
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Terjadi kesalahan saat memperbarui profil.");
            });
    });

    // Event Listener untuk Edit Profil
    document.getElementById("edit-profile").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("profile-view").style.display = "none";
        document.getElementById("profile-edit").style.display = "block";
    });

    document.getElementById("cancel-edit").addEventListener("click", function () {
        document.getElementById("profile-edit").style.display = "none";
        document.getElementById("profile-view").style.display = "block";
    });
});
