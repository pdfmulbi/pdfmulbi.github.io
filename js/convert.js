const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const statusText = document.getElementById('statusMessage'); // Pastikan ada elemen ini di HTML untuk pesan status
const downloadBtn = document.getElementById('downloadBtn');

// 1. Klik Upload Zone
uploadZone.addEventListener('click', () => fileInput.click());

// 2. Saat File PDF Dipilih (Logic OCR dimulai disini)
fileInput.addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi: Pastikan file adalah PDF
    if (file.type !== 'application/pdf') {
        alert("Mohon upload file PDF!");
        return;
    }

    // Tampilkan status loading (karena AI butuh waktu proses)
    uploadZone.innerHTML = `<i class="fas fa-cog fa-spin fa-3x mb-3"></i><h5>Sedang memproses AI OCR...</h5>`;
    
    // Siapkan data untuk dikirim ke Backend Go
    const formData = new FormData();
    formData.append('pdfFile', file); // 'pdfFile' adalah kunci yang akan dibaca di Go

    try {
        // Kirim ke Backend Go (Endpoint API yang akan kita buat)
        const response = await fetch('/api/ocr-convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error("Gagal memproses OCR di server.");
        }

        // Backend mengirim balik file Word (Blob)
        const blob = await response.blob();
        
        // Buat link download otomatis
        const downloadUrl = window.URL.createObjectURL(blob);
        const originalName = file.name.replace('.pdf', '');
        
        // Update UI: Siap Download
        handleSuccess(originalName, downloadUrl);

    } catch (err) {
        handleError(err);
    }
});

// Fungsi Menampilkan Hasil Sukses
function handleSuccess(fileName, downloadUrl) {
    // Ubah tampilan upload zone
    uploadZone.innerHTML = `<i class="fas fa-check-circle text-success fa-3x mb-3"></i><h5>Konversi Berhasil!</h5>`;

    // Tampilkan tombol download
    actionArea.classList.remove('d-none');
    
    // Setup tombol download untuk mengunduh file hasil dari Backend
    downloadBtn.onclick = function() {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${fileName}_converted.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };
    
    // Ubah teks tombol download
    downloadBtn.innerHTML = '<i class="fas fa-file-word"></i> Download Word Document';
}

// Fungsi Error
function handleError(err) {
    console.error(err);
    uploadZone.innerHTML = `<i class="fas fa-exclamation-triangle text-danger fa-3x mb-3"></i><h5>Gagal Memproses</h5>`;
    alert("Terjadi kesalahan saat konversi OCR: " + err.message);
}