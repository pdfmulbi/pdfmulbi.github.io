document.addEventListener("DOMContentLoaded", async function () {
    const historyList = document.getElementById("history-list");
    const token = localStorage.getItem("authToken");

    if (!token) {
        Swal.fire({
            icon: "warning",
            title: "Akses Ditolak",
            text: "Anda harus login untuk melihat history.",
            confirmButtonText: "Login",
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "login.html";
            }
        });
        return;
    }

    // Load history data
    await loadHistory();

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

// Load history from API
async function loadHistory() {
    const historyList = document.getElementById("history-list");
    const token = localStorage.getItem("authToken");

    // Clear existing content
    historyList.innerHTML = '';

    try {
        const response = await fetch("https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger/pdfm/history/all", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data history");
        }

        const data = await response.json();
        const history = data.history || [];

        // Cek jika history kosong
        if (!history || history.length === 0) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-history" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                    <span style="font-size: 16px;">Belum ada aktivitas</span><br>
                    <small style="color: #999;">Gunakan fitur PDF Merger untuk melihat riwayat aktivitas Anda!</small>
                </td>
            `;
            historyList.appendChild(emptyRow);
            return;
        }

        history.forEach((item) => {
            const row = document.createElement("tr");
            row.id = `history-row-${item.id}`;

            // Determine action icon and class
            let actionIcon = '';
            let actionClass = '';
            let actionLabel = '';

            switch (item.type) {
                case 'merge':
                    actionIcon = '<i class="fas fa-object-group"></i>';
                    actionClass = 'action-merge';
                    actionLabel = 'Merge PDF';
                    break;
                case 'compress':
                    actionIcon = '<i class="fas fa-compress-alt"></i>';
                    actionClass = 'action-compress';
                    actionLabel = 'Compress PDF';
                    break;
                case 'convert':
                    actionIcon = '<i class="fas fa-exchange-alt"></i>';
                    actionClass = 'action-convert';
                    actionLabel = 'Convert PDF';
                    break;
                case 'summary':
                    actionIcon = '<i class="fas fa-file-alt"></i>';
                    actionClass = 'action-summary';
                    actionLabel = 'Summary PDF';
                    break;
                default:
                    actionIcon = '<i class="fas fa-file-pdf"></i>';
                    actionClass = 'action-merge';
                    actionLabel = 'PDF Action';
            }

            const createdAt = new Date(item.created_at);

            row.innerHTML = `
                <td class="date-cell">
                    <span class="date-main"><i class="fas fa-calendar"></i> ${createdAt.toLocaleDateString('id-ID')}</span>
                    <span class="date-time"><i class="fas fa-clock"></i> ${createdAt.toLocaleTimeString('id-ID')}</span>
                </td>
                <td><span class="${actionClass}">${actionIcon} ${actionLabel}</span></td>
                <td>${escapeHtml(item.description || '-')}</td>
                <td class="file-name"><i class="fas fa-file-pdf"></i> ${escapeHtml(item.file_name || '-')}</td>
                <td>
                    <button class="delete-btn" onclick="deleteHistory('${item.id}', '${item.type}')" title="Hapus">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;

            historyList.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching history:", error);

        // Tampilkan pesan error yang lebih ramah
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px; display: block; color: #e74c3c;"></i>
                <span style="font-size: 16px;">Gagal memuat history</span><br>
                <small style="color: #999;">Silakan refresh halaman atau coba lagi nanti.</small>
            </td>
        `;
        historyList.appendChild(errorRow);
    }
}

// Delete history item
async function deleteHistory(id, type) {
    const token = localStorage.getItem("authToken");

    // Confirmation dialog
    const result = await Swal.fire({
        icon: "warning",
        title: "Hapus History?",
        text: "Anda yakin ingin menghapus riwayat ini?",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch("https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger/pdfm/history/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                id: id,
                type: type
            })
        });

        if (!response.ok) {
            throw new Error("Gagal menghapus history");
        }

        // Show success message
        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "History berhasil dihapus.",
            confirmButtonText: "OK",
            timer: 2000,
            timerProgressBar: true
        });

        // Reload history
        await loadHistory();

    } catch (error) {
        console.error("Error deleting history:", error);
        Swal.fire({
            icon: "error",
            title: "Gagal Menghapus",
            text: "Silakan coba lagi.",
            confirmButtonText: "OK"
        });
    }
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
