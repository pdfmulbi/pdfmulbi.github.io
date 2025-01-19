document.addEventListener("DOMContentLoaded", async function () {
    const invoiceList = document.getElementById("invoice-list");

    try {
        // Fetch invoices from the backend
        const response = await fetch("http://127.0.0.1:8080/pdfm/invoices");
        if (!response.ok) {
            throw new Error("Failed to fetch invoices");
        }

        const invoices = await response.json();

        // Populate the table with invoices
        invoices.forEach((invoice) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td class="status-${invoice.status.toLowerCase()}">${invoice.status}</td>
                <td>${invoice.details || "N/A"}</td>
                <td>Rp${parseInt(invoice.amount || 0).toLocaleString()}</td>
                <td>${invoice.paymentMethod || "Unknown"}</td>
                <td><button class="download-btn" data-id="${invoice._id}">Download</button></td>
            `;

            invoiceList.appendChild(row);
        });

        // Add event listener for download buttons
        const downloadButtons = document.querySelectorAll(".download-btn");
        downloadButtons.forEach((button) => {
            button.addEventListener("click", async function () {
                const invoiceId = this.getAttribute("data-id");

                // Find the selected invoice data
                const invoice = invoices.find((inv) => inv._id === invoiceId);
                if (!invoice) {
                    alert("Invoice not found");
                    return;
                }

                // Generate PDF Invoice
                try {
                    generatePDF(invoice);
                } catch (pdfError) {
                    alert("Error generating PDF: " + pdfError.message);
                }
            });
        });
    } catch (error) {
        alert("Error loading invoices: " + error.message);
    }
});

// Function to generate PDF using jsPDF
function generatePDF(invoice) {
    const { jsPDF } = window.jspdf;

    // Create a new PDF document
    const pdf = new jsPDF();

    // Add title
    pdf.setFontSize(20);
    pdf.text("Invoice", 105, 20, { align: "center" });

    // Add invoice details
    pdf.setFontSize(12);
    pdf.text(`Invoice ID: ${invoice._id}`, 10, 40);
    pdf.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 10, 50);
    pdf.text(`Amount: Rp${parseInt(invoice.amount || 0).toLocaleString()}`, 10, 60);
    pdf.text(`Status: ${invoice.status}`, 10, 70);
    pdf.text(`Payment Method: ${invoice.paymentMethod || "Unknown"}`, 10, 80);
    pdf.text(`Details: ${invoice.details || "N/A"}`, 10, 90);

    // Footer
    pdf.setFontSize(10);
    pdf.text("Thank you for your support!", 105, 280, { align: "center" });

    // Save the PDF
    const fileName = `invoice_${invoice._id}.pdf`;
    pdf.save(fileName);
}
