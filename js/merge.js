import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

// Event Listener setelah DOM dimuat
document.addEventListener("DOMContentLoaded", function () {
    const authButtons = document.getElementById("auth-buttons");
    const logoutLink = document.getElementById("logout-link");

    // Periksa token di localStorage
    const token = localStorage.getItem("authToken");
    if (token) {
        // Jika token ditemukan, sembunyikan login/signup dan tampilkan logout
        authButtons.style.display = "none";
        logoutLink.style.display = "block";
    } else {
        // Jika token tidak ditemukan, tampilkan login/signup dan sembunyikan logout
        authButtons.style.display = "flex";
        logoutLink.style.display = "none";
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
        alert('Please upload at least two PDF files.');
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
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('Failed to merge PDFs. Please try again.');
    }
});
