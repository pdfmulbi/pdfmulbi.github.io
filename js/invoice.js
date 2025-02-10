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

      // Tampilkan tombol logout jika login
        if (logoutLink && token) {
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
});
