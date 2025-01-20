document.addEventListener("DOMContentLoaded", function () {
    const donationOptions = document.querySelectorAll(".donation-option");
    const customAmountInput = document.getElementById("customAmount");
    const donateBtn = document.getElementById("donateBtn");
    const logoutLink = document.getElementById("logout-link"); // Tombol logout di footer

    let selectedAmount = 10000; // Default nominal donasi
    const userName = localStorage.getItem("userName"); // Nama pengguna dari localStorage
    const token = localStorage.getItem("authToken");

    if (userName || token) {
        // Jika token ditemukan
        logoutLink.style.display = "block"; // Tampilkan tombol logout
    } else {
        // Jika token tidak ditemukan
        alert("Anda harus login untuk mendukung kami.");
        window.location.href = "https://pdfmulbi.github.io/login/";
        logoutLink.style.display = "none"; // Sembunyikan tombol logout
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
