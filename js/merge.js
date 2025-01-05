import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

// Event listener for the first "Upload PDF" button
// When clicked, it triggers the hidden file input for the first PDF
document.getElementById('upload-btn1').addEventListener('click', () => {
    document.getElementById('pdf-files1').click();
});

// Event listener for the second "Upload PDF" button
// When clicked, it triggers the hidden file input for the second PDF
document.getElementById('upload-btn2').addEventListener('click', () => {
    document.getElementById('pdf-files2').click();
});

// Event listener for the form submission (merge button)
// Handles the PDF merging process
document.getElementById('merge-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the files selected by the user
    const file1 = document.getElementById('pdf-files1').files[0];
    const file2 = document.getElementById('pdf-files2').files[0];

    // Check if both files are uploaded, otherwise show an alert
    if (!file1 || !file2) {
        alert('Please upload both PDF files.');
        return;
    }

    try {
        // Read the first PDF file as an ArrayBuffer
        const pdfBytes1 = await file1.arrayBuffer();
        // Read the second PDF file as an ArrayBuffer
        const pdfBytes2 = await file2.arrayBuffer();

        // Load the first PDF document using PDF-lib
        const pdfDoc1 = await PDFDocument.load(pdfBytes1);
        // Load the second PDF document using PDF-lib
        const pdfDoc2 = await PDFDocument.load(pdfBytes2);

        // Create a new PDF document to hold the merged pages
        const mergedPdf = await PDFDocument.create();

        // Copy all pages from the first PDF to the merged document
        const copiedPages1 = await mergedPdf.copyPages(pdfDoc1, pdfDoc1.getPageIndices());
        copiedPages1.forEach(page => mergedPdf.addPage(page));

        // Copy all pages from the second PDF to the merged document
        const copiedPages2 = await mergedPdf.copyPages(pdfDoc2, pdfDoc2.getPageIndices());
        copiedPages2.forEach(page => mergedPdf.addPage(page));

        // Save the merged PDF as a byte array
        const mergedPdfBytes = await mergedPdf.save();

        // Create a URL for the merged PDF and open it in a new tab
        const mergedPdfUrl = URL.createObjectURL(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
        window.open(mergedPdfUrl, '_blank');

    } catch (error) {
        // Log and display any errors encountered during the merging process
        console.error('Error merging PDFs:', error);
        alert('Failed to merge PDFs. Please try again.');
    }
});
