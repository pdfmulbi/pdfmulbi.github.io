document.addEventListener("DOMContentLoaded", function () {
    const donationOptions = document.querySelectorAll(".donation-option");
    const customAmountInput = document.getElementById("customAmount");
    const donateBtn = document.getElementById("donateBtn");
    const logoutLink = document.getElementById("logout-link");
    let selectedAmount = 10000; // Default nominal donasi
    const token = localStorage.getItem("authToken");

    // Validasi login
    if (!token) {
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
                            localStorage.clear();
                            Swal.fire({
                                icon: "success",
                                title: "Logout Berhasil!",
                                text: "Anda telah berhasil logout.",
                                confirmButtonText: "OK"
                            }).then(() => {
                                window.location.href = "https://pdfmulbi.github.io/";
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

    // Highlight pilihan donasi saat diklik
    donationOptions.forEach((option) => {
        option.addEventListener("click", function () {
            // Reset highlight pada semua opsi
            donationOptions.forEach((opt) => opt.classList.remove("highlighted"));
            // Highlight opsi yang dipilih
            this.classList.add("highlighted");
            // Set nominal donasi berdasarkan opsi
            selectedAmount = parseInt(this.dataset.amount);
            // Reset custom amount input
            if (customAmountInput) customAmountInput.value = "";
        });
    });

    // Update nominal donasi berdasarkan input custom amount
    if (customAmountInput) {
        customAmountInput.addEventListener("input", function () {
            // Reset highlight pada opsi default
            donationOptions.forEach((opt) => opt.classList.remove("highlighted"));
            // Set nominal donasi berdasarkan input pengguna
            selectedAmount = parseInt(this.value) || 0;
        });
    }

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
            // Simpan nominal donasi ke localStorage
            localStorage.setItem("donationAmount", selectedAmount);
            window.location.href = "payment.html"; // Arahkan ke halaman pembayaran
        }
    });
});
