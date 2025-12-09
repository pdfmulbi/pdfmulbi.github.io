import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

// Event Listener setelah DOM dimuat
document.addEventListener("DOMContentLoaded", function () {
    const authButtons = document.getElementById("auth-buttons");
    const logoutLink = document.getElementById("logout-link");
    const token = localStorage.getItem("authToken");

    // Jika user sudah login, sembunyikan tombol login & tampilkan logout
    if (token) {
        // Jika token ditemukan
        authButtons.style.display = "none";
        logoutLink.style.display = "block";
    } else {
        // Jika token tidak ditemukan
        authButtons.style.display = "flex";
        logoutLink.style.display = "none";
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

// Kode pengelolaan PDF (merge) di bawah:
let fileCount = 2; // Mulai dari 2 karena sudah ada 2 tombol awal

// Fungsi untuk menambahkan tombol upload baru
function addUploadButton() {
    fileCount++;

    // Buat elemen input file baru
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.id = `pdf-files${fileCount}`;
    inputFile.name = `files${fileCount}`;
    inputFile.accept = '.pdf';
    inputFile.hidden = true;

    // Buat tombol upload baru
    const uploadButton = document.createElement('button');
    uploadButton.type = 'button';
    uploadButton.id = `upload-btn${fileCount}`;
    uploadButton.className = 'select-pdf';
    uploadButton.textContent = `Upload PDF ${fileCount}`;

    // Tambahkan event listener untuk membuka file input
    uploadButton.addEventListener('click', () => {
        inputFile.click();
    });

    // Event listener untuk mengubah teks tombol setelah file diunggah
    inputFile.addEventListener('change', (event) => {
        const fileName = event.target.files[0]?.name || `Upload PDF ${fileCount}`;
        uploadButton.textContent = fileName;

        // Tambahkan tombol baru hanya jika tombol terakhir ini memiliki file
        if (!document.getElementById(`pdf-files${fileCount + 1}`)) {
            addUploadButton();
        }
    });

    // Tambahkan input file dan tombol baru ke dalam form
    const additionalButtons = document.getElementById('additional-buttons');
    additionalButtons.appendChild(inputFile);
    additionalButtons.appendChild(uploadButton);
    additionalButtons.appendChild(document.createElement('br'));
}

// Event listener untuk tombol awal
document.getElementById('upload-btn1').addEventListener('click', () => {
    document.getElementById('pdf-files1').click();
});
document.getElementById('pdf-files1').addEventListener('change', (event) => {
    const fileName = event.target.files[0]?.name || 'Upload First PDF';
    document.getElementById('upload-btn1').textContent = fileName;
    if (!document.getElementById('pdf-files3')) {
        addUploadButton();
    }
});

document.getElementById('upload-btn2').addEventListener('click', () => {
    document.getElementById('pdf-files2').click();
});
document.getElementById('pdf-files2').addEventListener('change', (event) => {
    const fileName = event.target.files[0]?.name || 'Upload Second PDF';
    document.getElementById('upload-btn2').textContent = fileName;
    if (!document.getElementById('pdf-files3')) {
        addUploadButton();
    }
});

// Event listener untuk form submission
document.getElementById('merge-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const pdfFiles = [];
    for (let i = 1; i <= fileCount; i++) {
        const fileInput = document.getElementById(`pdf-files${i}`);
        if (fileInput && fileInput.files[0]) {
            pdfFiles.push(await fileInput.files[0].arrayBuffer());
        }
    }

    if (pdfFiles.length < 2) {
        Swal.fire({
            icon: "warning",
            title: "Upload Gagal",
            text: "Please upload at least two PDF files.",
            confirmButtonText: "OK"
        });
        return;
    }

    try {
        const mergedPdf = await PDFDocument.create();

        for (const pdfBytes of pdfFiles) {
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const mergedPdfUrl = URL.createObjectURL(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
        window.open(mergedPdfUrl, '_blank');

        // Add notification for successful merge
        if (window.NotificationManager) {
            window.NotificationManager.add(
                'merge',
                `Successfully merged ${pdfFiles.length} PDF files`,
                'merged_output.pdf'
            );
        }
    } catch (error) {
        console.error('Error merging PDFs:', error);
        Swal.fire({
            icon: "error",
            title: "Merge Gagal",
            text: "Failed to merge PDFs. Please try again.",
            confirmButtonText: "OK"
        });
    }
});

