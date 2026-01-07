// ==========================================
// 1. SETUP GLOBAL & LIBRARY
// ==========================================
// Mengatur Worker untuk PDF.js (Wajib agar bisa baca PDF)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// URL Backend (Pastikan URL ini benar sesuai projectmu)
const BACKEND_URL = "https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger/pdfm/log/convert";

// ==========================================
// 2. SISTEM LOGGING DATABASE (DINAMIS)
// ==========================================
async function saveConvertLog(fileName, fromFormat, toFormat) {
    const token = localStorage.getItem("authToken"); 
    
    // Kalau tidak login, tidak perlu catat log (atau bisa dialihkan ke login)
    if (!token) return; 

    try {
        await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            // Payload dikirim dinamis sesuai fitur yang dipakai
            body: JSON.stringify({
                file_name: fileName,
                source_format: fromFormat,
                target_format: toFormat
            })
        });
        console.log(`✅ Log sukses: ${fromFormat} -> ${toFormat}`);
    } catch (error) {
        console.error("❌ Gagal simpan log:", error);
    }
}

// ==========================================
// 3. FITUR SWITCH TAB (Ganti Tampilan)
// ==========================================
window.switchTab = function(mode) {
    // Ambil Elemen UI
    const tabWord = document.getElementById('tabWord');
    const tabPdf = document.getElementById('tabPdf');
    const panelWord = document.getElementById('panelWord');
    const panelPdf = document.getElementById('panelPdf');
    const pageTitle = document.getElementById('pageTitle');
    const pageDesc = document.getElementById('pageDesc');

    if (mode === 'word') {
        // Tampilkan Panel Word
        panelWord.classList.remove('d-none');
        panelPdf.classList.add('d-none');
        
        // Update Gaya Tombol
        tabWord.className = "btn btn-active-mode shadow-sm";
        tabPdf.className = "btn btn-inactive-mode";
        tabWord.style.background = ""; // Reset ke default CSS
        tabPdf.style.background = "";
        tabPdf.style.color = "";

        // Update Judul Halaman
        pageTitle.innerText = "Word to PDF Converter";
        pageTitle.className = "fw-bold text-primary";
        pageDesc.innerText = "Ubah dokumen Word (.docx) menjadi PDF di browser.";

    } else {
        // Tampilkan Panel PDF
        panelWord.classList.add('d-none');
        panelPdf.classList.remove('d-none');
        
        // Update Gaya Tombol (Merah untuk PDF)
        tabWord.className = "btn btn-inactive-mode";
        tabPdf.className = "btn btn-active-mode shadow-sm";
        tabPdf.style.background = "#dc3545"; // Merah
        tabPdf.style.color = "white";

        // Update Judul Halaman
        pageTitle.innerText = "PDF to Word Converter";
        pageTitle.className = "fw-bold text-danger";
        pageDesc.innerText = "Ubah dokumen PDF menjadi format Word (.doc) yang bisa diedit.";
    }
};

// ==========================================
// 4. LOGIKA A: WORD KE PDF
// ==========================================
const wordUploadZone = document.getElementById('wordUploadZone');
const wordInput = document.getElementById('wordInput');
const wordPreviewContainer = document.getElementById('wordPreviewContainer');
const wordDocumentPreview = document.getElementById('wordDocumentPreview');
const wordActionArea = document.getElementById('wordActionArea');
const wordDownloadBtn = document.getElementById('wordDownloadBtn');
let wordFileName = "document.pdf";

// Klik Upload Zone -> Buka File
if(wordUploadZone) {
    wordUploadZone.addEventListener('click', () => wordInput.click());

    // Saat File Word Dipilih
    wordInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Siapkan nama file output
        wordFileName = file.name.replace('.docx', '.pdf');

        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            // Gunakan Mammoth.js untuk render DOCX ke HTML Preview
            mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                .then(result => {
                    wordDocumentPreview.innerHTML = result.value;
                    
                    // Munculkan Preview & Tombol
                    wordPreviewContainer.classList.remove('d-none');
                    wordActionArea.classList.remove('d-none');
                    
                    // Ubah tampilan upload box jadi "Siap"
                    wordUploadZone.innerHTML = `<i class="fas fa-check-circle text-success fa-3x mb-3"></i><h5>${file.name} Siap!</h5>`;
                })
                .catch(err => alert("Gagal membaca file Word: " + err.message));
        };
        reader.readAsArrayBuffer(file);
    });

    // Saat Tombol Download PDF Ditekan
    wordDownloadBtn.addEventListener('click', function() {
        const originalText = wordDownloadBtn.innerHTML;
        wordDownloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        wordDownloadBtn.disabled = true;

        const opt = {
            margin: 10,
            filename: wordFileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Gunakan html2pdf untuk simpan preview jadi PDF
        html2pdf().set(opt).from(wordDocumentPreview).save().then(async() => {
            wordDownloadBtn.innerHTML = originalText;
            wordDownloadBtn.disabled = false;
            
            // LOG DATABASE & NOTIFIKASI
            await saveConvertLog(wordFileName, "docx", "pdf");
            
            if (window.NotificationManager) {
                window.NotificationManager.add('convert', 'Berhasil convert Word ke PDF', wordFileName);
            }
        });
    });
}

// ==========================================
// 5. LOGIKA B: PDF KE WORD
// ==========================================
const pdfUploadZone = document.getElementById('pdfUploadZone');
const pdfInput = document.getElementById('pdfInput');
const pdfPreviewContainer = document.getElementById('pdfPreviewContainer');
const pdfDocumentPreview = document.getElementById('pdfDocumentPreview');
const pdfActionArea = document.getElementById('pdfActionArea');
const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
let pdfFileName = "document.doc";

if(pdfUploadZone) {
    // Klik Upload Zone
    pdfUploadZone.addEventListener('click', () => pdfInput.click());

    // Saat File PDF Dipilih
    pdfInput.addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        pdfFileName = file.name.replace('.pdf', '.doc');
        
        // Tampilkan loading di upload box
        pdfUploadZone.innerHTML = '<div class="spinner-border text-danger" role="status"></div><h5 class="mt-2">Membaca PDF...</h5>';

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let extractedText = "";

            // Loop semua halaman PDF dan ambil teksnya
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(" ");
                extractedText += pageText + "\n\n";
            }

            // Tampilkan Hasil di Preview
            pdfDocumentPreview.innerHTML = extractedText.replace(/\n/g, '<br>');
            pdfPreviewContainer.classList.remove('d-none');
            pdfActionArea.classList.remove('d-none');
            pdfUploadZone.innerHTML = `<i class="fas fa-check-circle text-success fa-3x mb-3"></i><h5>${file.name} Siap!</h5>`;

        } catch (err) {
            console.error(err);
            alert("Gagal membaca PDF. Pastikan file tidak dipassword.");
            // Reset upload box jika gagal
            pdfUploadZone.innerHTML = `<i class="fas fa-file-pdf fa-3x text-danger mb-3"></i><h5>Pilih File PDF (.pdf)</h5>`;
        }
    });

    // Saat Tombol Download Word Ditekan
    pdfDownloadBtn.addEventListener('click', async function() {
        const originalText = pdfDownloadBtn.innerHTML;
        pdfDownloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        pdfDownloadBtn.disabled = true;

        // TEKNIK: Bungkus teks HTML dalam format Word XML sederhana
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + pdfDocumentPreview.innerHTML + footer;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        
        // Buat link download palsu dan klik otomatis
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = pdfFileName;
        fileDownload.click();
        document.body.removeChild(fileDownload);

        // LOG DATABASE & NOTIFIKASI
        await saveConvertLog(pdfFileName, "pdf", "docx");

        if (window.NotificationManager) {
            window.NotificationManager.add('convert', 'Berhasil convert PDF ke Word', pdfFileName);
        }

        pdfDownloadBtn.innerHTML = originalText;
        pdfDownloadBtn.disabled = false;
    });
}