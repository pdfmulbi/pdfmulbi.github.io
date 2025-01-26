document.addEventListener("DOMContentLoaded", async function () {
    const invoiceList = document.getElementById("invoice-list");
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Anda harus login untuk melihat invoice.");
        window.location.href = "https://pdfmulbi.github.io/login/";
        return;
    }

    try {
        const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/invoices", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data invoice");
        }

        const invoices = await response.json();

        invoices.forEach((invoice) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td class="status-${invoice.status.toLowerCase()}">${invoice.status}</td>
                <td>${invoice.details || "N/A"}</td>
                <td>Rp${parseInt(invoice.amount || 0).toLocaleString()}</td>
                <td>${invoice.paymentMethod || "QRIS"}</td>
            `;

            invoiceList.appendChild(row);
        });

    } catch (error) {
        alert("Error memuat data invoice: " + error.message);
    }

    // Fungsi Logout
    window.logout = function () {
        const token = localStorage.getItem("authToken");

        if (!token) {
            alert("Anda belum login.");
            window.location.href = "https://pdfmulbi.github.io/login/";
            return;
        }

        const logoutUrl = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/logout";

        fetch(logoutUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    localStorage.removeItem("authToken");
                    alert("Logout berhasil.");
                    window.location.href = "login.html";
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
    };
});
