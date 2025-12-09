document.addEventListener("DOMContentLoaded", function () {
    const paymentDoneBtn = document.getElementById("paymentDoneBtn");
    const token = localStorage.getItem("authToken");
    const amount = localStorage.getItem("donationAmount");
    const userName = localStorage.getItem("userName");
    const countdownElement = document.getElementById("countdown");

    // Validasi Data Awal
    if (!token || !amount || !userName) {
        Swal.fire({
            icon: "error",
            title: "Data Tidak Valid",
            text: "Data pembayaran tidak valid. Silakan ulangi proses.",
            confirmButtonText: "OK"
        }).then(() => {
            window.location.href = "supportus.html";
        });
        return;
    }

    // --- LOGIKA TIMER 5 MENIT ---
    const TIME_LIMIT = 5 * 60 * 1000; // 5 menit dalam milidetik
    let endTime = localStorage.getItem("paymentEndTime");

    // Jika belum ada waktu akhir tersimpan, buat baru sekarang + 5 menit
    if (!endTime) {
        const now = new Date().getTime();
        endTime = now + TIME_LIMIT;
        localStorage.setItem("paymentEndTime", endTime);
    }

    const timerInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = endTime - now;

        // Hitung menit dan detik
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Tampilkan hasil format 00:00
        countdownElement.innerHTML = 
            (minutes < 10 ? "0" + minutes : minutes) + ":" + 
            (seconds < 10 ? "0" + seconds : seconds);

        // Jika waktu habis
        if (distance < 0) {
            clearInterval(timerInterval);
            countdownElement.innerHTML = "WAKTU HABIS";
            paymentDoneBtn.disabled = true; // Matikan tombol
            paymentDoneBtn.style.backgroundColor = "#ccc"; // Ubah warna jadi abu
            
            // Hapus session waktu
            localStorage.removeItem("paymentEndTime");

            Swal.fire({
                icon: "warning",
                title: "Waktu Habis",
                text: "Waktu pembayaran telah habis. Silakan ulangi donasi.",
                confirmButtonText: "Ulangi"
            }).then(() => {
                window.location.href = "supportus.html";
            });
        }
    }, 1000);
    // ---------------------------

    paymentDoneBtn.addEventListener("click", async function () {
        // Matikan timer saat tombol diklik agar tidak redirect otomatis saat proses loading
        clearInterval(timerInterval); 
        
        try {
            const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: userName,
                    amount: parseInt(amount),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                Swal.fire({
                    icon: "error",
                    title: "Pembayaran Gagal",
                    text: "Gagal memproses pembayaran: " + (error.message || "Kesalahan tidak diketahui."),
                    confirmButtonText: "OK"
                });
                return;
            }

            const result = await response.json();
            Swal.fire({
                icon: "success",
                title: "Pembayaran Berhasil",
                text: result.message || "Pembayaran berhasil diproses.",
                confirmButtonText: "Lihat Invoice"
            }).then(() => {
                // Hapus data setelah selesai agar bersih untuk transaksi berikutnya
                localStorage.removeItem("donationAmount"); 
                localStorage.removeItem("paymentEndTime"); // Hapus timer
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