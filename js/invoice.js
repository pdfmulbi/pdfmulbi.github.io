/**
 * Invoice Page JavaScript
 * Mengambil dan menampilkan invoice milik user yang login
 * Berdasarkan backend GetInvoicesHandler yang filter by email
 */

document.addEventListener("DOMContentLoaded", async function () {
    const invoiceList = document.getElementById("invoice-list");
    const invoiceContainer = document.querySelector(".invoice-container");
    const token = localStorage.getItem("authToken");
    const userName = localStorage.getItem("userName");

    // Update judul dengan nama user
    const titleElement = invoiceContainer.querySelector("h2");
    if (titleElement && userName) {
        titleElement.textContent = `Invoice - ${userName}`;
    }

    // Cek apakah user sudah login
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

    // Tampilkan loading state
    invoiceList.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #ef4444;"></i>
                <p style="margin-top: 10px; color: #666;">Memuat invoice...</p>
            </td>
        </tr>
    `;

    try {
        const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/invoices", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        // Handle different error responses
        if (response.status === 401) {
            // Token expired atau invalid
            localStorage.clear();
            Swal.fire({
                icon: "warning",
                title: "Sesi Berakhir",
                text: "Silakan login kembali.",
                confirmButtonText: "Login"
            }).then(() => {
                window.location.href = "login.html";
            });
            return;
        }

        if (response.status === 404) {
            Swal.fire({
                icon: "error",
                title: "User Tidak Ditemukan",
                text: "Akun Anda tidak ditemukan. Silakan login ulang.",
                confirmButtonText: "OK"
            });
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const invoices = await response.json();

        // Bersihkan loading state
        invoiceList.innerHTML = "";

        // Cek apakah ada invoice
        if (!invoices || invoices.length === 0) {
            invoiceList.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-file-invoice" style="font-size: 48px; color: #ddd; margin-bottom: 15px;"></i>
                        <p style="color: #888; font-size: 16px;">Belum ada invoice</p>
                        <p style="color: #aaa; font-size: 14px;">Invoice akan muncul setelah Anda melakukan donasi</p>
                        <a href="supportus.html" class="support-btn" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #ef4444; color: white; border-radius: 6px; text-decoration: none;">
                            <i class="fas fa-heart"></i> Support Us
                        </a>
                    </td>
                </tr>
            `;
            return;
        }

        // Urutkan invoice berdasarkan tanggal terbaru
        invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Render setiap invoice
        invoices.forEach((invoice, index) => {
            const row = document.createElement("tr");
            row.style.animation = `fadeIn 0.3s ease-in-out ${index * 0.1}s forwards`;
            row.style.opacity = "0";

            // Format tanggal dengan lebih baik
            const invoiceDate = new Date(invoice.createdAt);
            const formattedDate = invoiceDate.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
            const formattedTime = invoiceDate.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
            });

            // Format amount dengan currency
            const formattedAmount = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }).format(invoice.amount || 0);

            // Status badge dengan icon
            const statusClass = `status-${(invoice.status || "pending").toLowerCase()}`;
            const statusIcon = invoice.status === "Paid" ? "fa-check-circle" :
                invoice.status === "Pending" ? "fa-clock" : "fa-times-circle";

            row.innerHTML = `
                <td>
                    <div class="date-cell">
                        <span class="date-main">${formattedDate}</span>
                        <span class="date-time">${formattedTime}</span>
                    </div>
                </td>
                <td>
                    <span class="${statusClass}">
                        <i class="fas ${statusIcon}"></i> ${invoice.status || "Pending"}
                    </span>
                </td>
                <td>${invoice.details || "Support Payment"}</td>
                <td class="amount-cell">${formattedAmount}</td>
                <td>
                    <span class="payment-method">
                        <i class="fas fa-qrcode"></i> ${invoice.paymentMethod || "QRIS"}
                    </span>
                </td>
            `;

            invoiceList.appendChild(row);
        });

        // Tampilkan total di bawah tabel
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const formattedTotal = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(totalAmount);

        // Tambahkan summary row
        const summaryRow = document.createElement("tr");
        summaryRow.className = "summary-row";
        summaryRow.innerHTML = `
            <td colspan="3" style="text-align: right; font-weight: bold;">Total Donasi:</td>
            <td class="amount-cell" style="font-weight: bold; color: #ef4444;">${formattedTotal}</td>
            <td></td>
        `;
        invoiceList.appendChild(summaryRow);

    } catch (error) {
        console.error("Error fetching invoices:", error);
        invoiceList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff9800;"></i>
                    <p style="margin-top: 15px; color: #666;">Gagal memuat invoice</p>
                    <p style="color: #888; font-size: 14px;">${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn" style="margin-top: 15px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </td>
            </tr>
        `;
    }

    // Setup logout handler
    setupLogoutHandler(token);
});

/**
 * Setup logout button handler
 */
function setupLogoutHandler(token) {
    const logoutLink = document.getElementById("logout-link");

    if (!logoutLink || !token) return;

    logoutLink.style.display = "block";
    logoutLink.addEventListener("click", async function (e) {
        e.preventDefault();

        const result = await Swal.fire({
            icon: "question",
            title: "Konfirmasi Logout",
            text: "Apakah Anda yakin ingin logout?",
            showCancelButton: true,
            confirmButtonText: "Ya, Logout",
            cancelButtonText: "Batal",
            confirmButtonColor: "#ef4444"
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch("https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

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
                const data = await response.json();
                Swal.fire({
                    icon: "error",
                    title: "Gagal Logout",
                    text: data.message || "Kesalahan tidak diketahui.",
                    confirmButtonText: "OK"
                });
            }
        } catch (error) {
            console.error("Logout error:", error);
            // Force logout on client side
            localStorage.clear();
            window.location.href = "index.html";
        }
    });
}
