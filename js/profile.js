document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "https://pdfmulbi.github.io/login/";
        return;
    }

    // Fetch user profile
    const fetchUserProfile = async () => {
        try {
            const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/getone/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error Response:", errorData);
                throw new Error(errorData.message || "Gagal mengambil data pengguna.");
            }

            const user = await response.json();
            console.log("User Data:", user);

            // Populate profile view
            document.getElementById("name").textContent = user.name || "Nama tidak ditemukan";
            document.getElementById("email").textContent = user.email || "Email tidak ditemukan";
            document.getElementById("password").textContent = "******"; // Password hidden

            // Populate profile edit form
            document.getElementById("name-input").value = user.name || "";
            document.getElementById("email-input").value = user.email || "";

            // Store user ID in form data attribute
            document.getElementById("profile-form").dataset.userId = user.id;

        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Gagal memuat data profil. Silakan coba lagi.");
        }
    };

    // Fetch and display user profile on page load
    fetchUserProfile();

    // Show edit form when "Ubah" is clicked
    document.getElementById("edit-profile").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("profile-view").style.display = "none";
        document.getElementById("profile-edit").style.display = "block";
    });

    // Hide edit form when "Cancel" is clicked
    document.getElementById("cancel-edit").addEventListener("click", function () {
        document.getElementById("profile-edit").style.display = "none";
        document.getElementById("profile-view").style.display = "block";
    });

    // Save profile changes
    document.getElementById("profile-form").addEventListener("submit", async function (e) {
        e.preventDefault();

        const userId = document.getElementById("profile-form").dataset.userId; // Get user ID
        const updatedData = {
            id: userId, // Include ID in request
            name: document.getElementById("name-input").value,
            email: document.getElementById("email-input").value,
            password: document.getElementById("password-input").value || undefined, // Optional
        };

        console.log("Updated Data:", updatedData);

        try {
            const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/update/users", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error Response:", errorData);
                throw new Error(errorData.message || "Gagal memperbarui profil.");
            }

            alert("Profil berhasil diperbarui.");
            window.location.reload(); // Reload page to refresh profile view

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Terjadi kesalahan saat memperbarui profil.");
        }
    });

      // Tampilkan tombol logout jika login
      if (logoutLink) {
        logoutLink.style.display = "block";
        logoutLink.addEventListener("click", function () {
            fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/logout", {
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
                    alert("Gagal logout. Silakan coba lagi.");
                });
        });
    };
});
