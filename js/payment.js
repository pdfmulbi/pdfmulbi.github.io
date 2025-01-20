document.addEventListener("DOMContentLoaded", function () {
    const paymentDoneBtn = document.getElementById("paymentDoneBtn");
    const token = localStorage.getItem("authToken");
    const userName = localStorage.getItem("userName");
    const amount = localStorage.getItem("donationAmount");

    if (!token || !userName || !amount) {
        alert("Data pembayaran tidak valid. Silakan ulangi proses.");
        window.location.href = "supportus.html";
        return;
    }

    paymentDoneBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Sertakan token
                },
                body: JSON.stringify({
                    name: userName,
                    amount: parseInt(amount),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                alert("Gagal memproses pembayaran: " + (error.message || "Kesalahan tidak diketahui."));
                return;
            }

            const result = await response.json();
            alert(result.message || "Pembayaran berhasil diproses.");
            localStorage.removeItem("donationAmount"); // Hapus data setelah selesai
            window.location.href = "invoice.html"; // Arahkan ke halaman invoice
        } catch (error) {
            console.error("Error saat memproses pembayaran:", error);
            alert("Gagal memproses pembayaran. Silakan coba lagi.");
        }
    });
});
