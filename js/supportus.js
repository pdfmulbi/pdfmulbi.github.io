document.addEventListener("DOMContentLoaded", function () {
    const donationOptions = document.querySelectorAll(".donation-option");
    const customAmountInput = document.getElementById("customAmount");
    const donateBtn = document.getElementById("donateBtn");
    const logoutLink = document.getElementById("logout-link"); // Tombol logout di footer

    let selectedAmount = 10000; // Default nominal donasi
    const token = localStorage.getItem("authToken");
    const userName = localStorage.getItem("userName"); // Ambil nama pengguna dari localStorage

    // Validasi token dan nama pengguna
    if (!token || !userName) {
        alert("Anda harus login untuk mendukung kami.");
        window.location.href = "https://pdfmulbi.github.io/login/";
        return;
    }

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
                        localStorage.clear(); // Hapus semua data di localStorage
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

    // Highlight pilihan donasi
    donationOptions.forEach((option) => {
        option.addEventListener("click", function () {
            donationOptions.forEach((opt) => opt.classList.remove("highlighted"));
            this.classList.add("highlighted");
            selectedAmount = parseInt(this.dataset.amount);
            customAmountInput.value = ""; // Reset custom amount
        });
    });

    // Update donasi berdasarkan input custom
    customAmountInput.addEventListener("input", function () {
        donationOptions.forEach((opt) => opt.classList.remove("highlighted"));
        selectedAmount = parseInt(this.value) || 0;
    });

    // Klik tombol "Lanjut Pembayaran"
    donateBtn.addEventListener("click", function () {
        if (selectedAmount < 10000) {
            alert("Nominal donasi minimum adalah Rp10.000!");
            return;
        }

        const confirmation = confirm(
            `Anda akan mendonasikan Rp${selectedAmount.toLocaleString()}. Lanjutkan ke pembayaran?`
        );

        if (confirmation) {
            // Simpan data ke localStorage dan arahkan ke halaman pembayaran
            localStorage.setItem("donationAmount", selectedAmount);
            window.location.href = "payment.html";
        }
    });
});
