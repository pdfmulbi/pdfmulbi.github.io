document.addEventListener("DOMContentLoaded", async function () {
    const paymentDoneBtn = document.getElementById("paymentDoneBtn");
    const paymentText = document.getElementById("paymentAmountText");
    const countdownEl = document.getElementById("countdown");
    const token = localStorage.getItem("authToken");
    const donationAmount = parseInt(localStorage.getItem("donationAmount")) || 0;

    // Tampilkan nominal pembayaran
    if (donationAmount > 0) {
        paymentText.textContent = `Silahkan bayar sejumlah Rp${donationAmount.toLocaleString()}`;
    }

    // Validasi login
    if (!token) {
        Swal.fire({
            icon: "warning",
            title: "Akses Ditolak",
            text: "Anda harus login untuk melakukan pembayaran.",
            confirmButtonText: "Login",
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "login.html";
            }
        });
        return;
    }

    // Countdown timer (5 menit)
    let timeLeft = 5 * 60; // 5 menit dalam detik
    const timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            Swal.fire({
                icon: "warning",
                title: "Waktu Habis",
                text: "Waktu pembayaran telah habis. Silakan ulangi proses donasi.",
                confirmButtonText: "OK",
                allowOutsideClick: false
            }).then(() => {
                window.location.href = "supportus.html";
            });
        }
        timeLeft--;
    }, 1000);

    // Ambil data user dari token
    let userName = "";
    try {
        const userResponse = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/getone/users", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!userResponse.ok) {
            throw new Error("Gagal mengambil data user");
        }

        const userData = await userResponse.json();
        userName = userData.name;
    } catch (error) {
        console.error("Error fetching user data:", error);
        Swal.fire({
            icon: "error",
            title: "Kesalahan",
            text: "Gagal mengambil data user. Silakan login ulang.",
            confirmButtonText: "Login",
            allowOutsideClick: false
        }).then(() => {
            localStorage.clear();
            window.location.href = "login.html";
        });
        return;
    }

    // Handler untuk tombol "Pembayaran selesai"
    paymentDoneBtn.addEventListener("click", async function () {
        // Validasi nominal donasi
        if (donationAmount < 1) {
            Swal.fire({
                icon: "warning",
                title: "Nominal Tidak Valid",
                text: "Nominal donasi tidak valid. Silakan ulangi proses donasi.",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "supportus.html";
            });
            return;
        }

        // Tampilkan loading
        Swal.fire({
            title: "Memproses pembayaran...",
            text: "Mohon tunggu sebentar",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: userName,
                    amount: donationAmount
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Gagal memproses pembayaran");
            }

            const result = await response.json();

            // Hentikan timer
            clearInterval(timerInterval);

            // Hapus donationAmount dari localStorage
            localStorage.removeItem("donationAmount");

            // Tampilkan sukses dan redirect ke invoice
            Swal.fire({
                icon: "success",
                title: "Pembayaran Berhasil!",
                text: "Terima kasih atas dukungan Anda!",
                confirmButtonText: "Lihat Invoice",
                allowOutsideClick: false
            }).then(() => {
                window.location.href = "invoice.html";
            });

        } catch (error) {
            console.error("Error saat memproses pembayaran:", error);
            Swal.fire({
                icon: "error",
                title: "Kesalahan",
                text: "Gagal memproses pembayaran. Silakan coba lagi.",
                confirmButtonText: "OK"
            });
        }
    });
});

function klikSignup() {
    window.location.href = 'register.html';
}
