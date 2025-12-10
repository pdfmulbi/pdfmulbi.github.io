const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const statusText = document.getElementById('statusMessage'); // Pastikan ada elemen ini di HTML untuk pesan status
const documentPreview = document.getElementById('documentPreview');
const actionArea = document.getElementById('actionArea');
const downloadBtn = document.getElementById('downloadBtn');

let fileName = "document.pdf";

// 1. Klik Upload Zone
uploadZone.addEventListener('click', () => fileInput.click());

// 2. Saat File Word Dipilih
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    fileName = file.name.replace('.docx', '.pdf');

    // Baca File menggunakan FileReader
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;

        // Gunakan Mammoth untuk convert DOCX -> HTML
        mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
            .then(displayResult)
            .catch(handleError);
    };

    reader.readAsArrayBuffer(file);
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