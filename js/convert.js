const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
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

// Fungsi Menampilkan Hasil di Preview
function displayResult(result) {
    // Masukkan HTML hasil konversi ke dalam div preview
    documentPreview.innerHTML = result.value;

    // Tampilkan area preview dan tombol download
    previewContainer.classList.remove('d-none');
    actionArea.classList.remove('d-none');

    // Ubah info upload box
    uploadZone.innerHTML = `<i class="fas fa-check-circle text-success fa-3x mb-3"></i><h5>${fileName} Siap!</h5>`;
}

// Fungsi Error
function handleError(err) {
    console.log(err);
    alert("Gagal membaca file Word. Pastikan formatnya .docx (bukan .doc)");
}

// 3. Saat Tombol Download PDF Ditekan
downloadBtn.addEventListener('click', function() {
    // Ubah tombol jadi loading
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sedang Membuat PDF...';
    downloadBtn.disabled = true;

    // Konfigurasi html2pdf
    const opt = {
        margin:       10, // Margin PDF (mm)
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 }, // Resolusi (2 = Tajam)
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Eksekusi Convert (Ambil elemen preview -> jadikan PDF)
    html2pdf().set(opt).from(documentPreview).save().then(() => {
        // Reset Tombol setelah selesai
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    });
});