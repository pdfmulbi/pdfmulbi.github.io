document.addEventListener("DOMContentLoaded", function () {
    const paymentDoneBtn = document.getElementById("paymentDoneBtn");
    const token = localStorage.getItem("authToken");
    const amount = localStorage.getItem("donationAmount");
    const userName = localStorage.getItem("userName");

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

    paymentDoneBtn.addEventListener("click", async function () {
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
                localStorage.removeItem("donationAmount"); // Hapus data setelah selesai
                window.location.href = "invoice.html"; // Arahkan ke halaman invoice
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
