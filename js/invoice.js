document.addEventListener("DOMContentLoaded", async function () {
    const invoiceList = document.getElementById("invoice-list");
    const token = localStorage.getItem("authToken");

    if (!token) {
        Swal.fire({
            icon: "warning",
            title: "Akses Ditolak",
            text: "Anda harus login untuk melihat invoice.",
            confirmButtonText: "Login",
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "login.html";
            }
        });
        return;
    }

    try {
        const response = await fetch("https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger/pdfm/invoices", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data invoice");
        }

        const invoices = await response.json();

        // Cek jika invoice kosong
        if (!invoices || invoices.length === 0) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-file-invoice" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                    <span style="font-size: 16px;">Belum ada invoice</span><br>
                    <small style="color: #999;">Dukung kami untuk mendapatkan invoice pertama Anda!</small>
                </td>
            `;
            invoiceList.appendChild(emptyRow);
            return;
        }

        invoices.forEach((invoice) => {
            const row = document.createElement("tr");

            // Determine status icon
            let statusIcon = '';
            let statusClass = invoice.status.toLowerCase();
            if (statusClass === 'paid') {
                statusIcon = '<i class="fas fa-check-circle"></i>';
            } else if (statusClass === 'pending') {
                statusIcon = '<i class="fas fa-clock"></i>';
            } else if (statusClass === 'failed') {
                statusIcon = '<i class="fas fa-times-circle"></i>';
            }

            row.innerHTML = `
                <td class="date-cell">
                    <span class="date-main"><i class="fas fa-calendar"></i> ${new Date(invoice.createdAt).toLocaleDateString()}</span>
                    <span class="date-time"><i class="fas fa-clock"></i> ${new Date(invoice.createdAt).toLocaleTimeString()}</span>
                </td>
                <td><span class="status-${statusClass}">${statusIcon} ${invoice.status}</span></td>
                <td><i class="fas fa-file-invoice" style="color: #6b7280; margin-right: 6px;"></i>${invoice.details || "N/A"}</td>
                <td class="amount-cell"><i class="fas fa-rupiah-sign" style="color: #10b981; margin-right: 4px;"></i>Rp${parseInt(invoice.amount || 0).toLocaleString()}</td>
                <td><span class="payment-method"><i class="fas fa-qrcode"></i> ${invoice.paymentMethod || "QRIS"}</span></td>
            `;

            invoiceList.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching invoices:", error);

        // Tampilkan pesan error yang lebih ramah
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px; display: block; color: #e74c3c;"></i>
                <span style="font-size: 16px;">Gagal memuat invoice</span><br>
                <small style="color: #999;">Silakan refresh halaman atau coba lagi nanti.</small>
            </td>
        `;
        invoiceList.appendChild(errorRow);
    }

    // Tampilkan tombol logout jika login
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink && token) {
        logoutLink.style.display = "block";
        logoutLink.addEventListener("click", function () {
            fetch("https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger/pdfm/logout", {
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
                            window.location.href = "index.html";
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
