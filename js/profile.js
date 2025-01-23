document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "login.html";
        return;
    }

    // Fetch user profile
    fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/getone/users", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    })
        .then((response) => response.json())
        .then((user) => {
            document.getElementById("name").textContent = user.name;
            document.getElementById("email").textContent = user.email;
            document.getElementById("password").textContent = "******";

            document.getElementById("name-input").value = user.name;
            document.getElementById("email-input").value = user.email;
        })
        .catch((error) => {
            console.error("Error fetching user profile:", error);
            alert("Gagal memuat profil pengguna.");
        });

    // Show Edit Form
    document.getElementById("edit-profile").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("profile-view").style.display = "none";
        document.getElementById("profile-edit").style.display = "block";
    });

    // Hide Edit Form
    document.getElementById("cancel-edit").addEventListener("click", function () {
        document.getElementById("profile-edit").style.display = "none";
        document.getElementById("profile-view").style.display = "block";
    });

    // Save Profile Changes
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
                    throw new Error("Gagal memperbarui profil.");
                }
            })
            .catch((error) => {
                console.error("Error updating profile:", error);
                alert("Terjadi kesalahan saat memperbarui profil.");
            });
    });

    // Logout
    document.getElementById("logout-link").addEventListener("click", function () {
        localStorage.removeItem("authToken");
        alert("Logout berhasil.");
        window.location.href = "login.html";
    });
});
