document.addEventListener("DOMContentLoaded", function () {
    const paymentDoneBtn = document.getElementById("paymentDoneBtn");

    paymentDoneBtn.addEventListener("click", async function () {
        const name = "Sam"; // Nama pengguna (ganti dengan nama dinamis jika ada sistem login)
        const amount = new URLSearchParams(window.location.search).get("amount");

        if (!name || !amount || isNaN(amount) || parseInt(amount) <= 0) {
            alert("Data pembayaran tidak valid.");
            return;
        }

        try {
            const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    amount: parseInt(amount),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                alert("Error dari server: " + (error.message || "Terjadi kesalahan."));
                return;
            }

            const result = await response.json();
            alert(result.message || "Pembayaran berhasil diproses.");
            window.location.href = "invoice.html"; // Redirect ke halaman invoice
        } catch (error) {
            console.error("Error saat memproses pembayaran:", error);
            alert("Gagal memproses pembayaran. Silakan coba lagi.");
        }
    });
});