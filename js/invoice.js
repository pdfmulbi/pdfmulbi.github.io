document.addEventListener("DOMContentLoaded", async function () {
    const invoiceList = document.getElementById("invoice-list");
    const token = localStorage.getItem("authToken");
    const userName = localStorage.getItem("userName");

    if (!token || userName) {
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
                <td><button class="download-btn" data-id="${invoice._id}">Download</button></td>
            `;

            invoiceList.appendChild(row);
        });

        // Tambahkan event listener untuk download
        document.querySelectorAll(".download-btn").forEach((button) => {
            button.addEventListener("click", function () {
                const invoiceId = this.getAttribute("data-id");
                const invoice = invoices.find((inv) => inv._id === invoiceId);
                if (!invoice) {
                    alert("Invoice tidak ditemukan.");
                    return;
                }
                generatePDF(invoice);
            });
        });
    } catch (error) {
        alert("Error memuat data invoice: " + error.message);
    }
});

// Fungsi untuk menghasilkan PDF menggunakan jsPDF
function generatePDF(invoice) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("Invoice", 105, 20, { align: "center" });

    pdf.setFontSize(12);
    pdf.text(`Invoice ID: ${invoice._id}`, 10, 40);
    pdf.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 10, 50);
    pdf.text(`Amount: Rp${parseInt(invoice.amount || 0).toLocaleString()}`, 10, 60);
    pdf.text(`Status: ${invoice.status}`, 10, 70);
    pdf.text(`Payment Method: ${invoice.paymentMethod || "QRIS"}`, 10, 80);
    pdf.text(`Details: ${invoice.details || "N/A"}`, 10, 90);

    pdf.setFontSize(10);
    pdf.text("Thank you for your support!", 105, 280, { align: "center" });

    pdf.save(`invoice_${invoice._id}.pdf`);
}
