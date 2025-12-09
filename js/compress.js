// --- SETUP GLOBAL ---
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const settingsCard = document.getElementById('settingsCard');
const methodSelect = document.getElementById('methodSelect');
const sliderContainer = document.getElementById('sliderContainer');
const qualityRange = document.getElementById('qualityRange');
const processBtn = document.getElementById('processBtn');
const resultCard = document.getElementById('resultCard');
const downloadBtn = document.getElementById('downloadBtn');

let processedBlob = null;

// 1. Event Upload
uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
        fileNameDisplay.innerText = this.files[0].name;
        settingsCard.classList.remove('d-none');
        resultCard.classList.add('d-none');
    }
});

// 2. Toggle Slider (Hilang jika pilih metode Safe)
methodSelect.addEventListener('change', function () {
    if (this.value === 'safe') {
        sliderContainer.classList.add('d-none');
    } else {
        sliderContainer.classList.remove('d-none');
    }
});

// 3. Update Label Slider
qualityRange.addEventListener('input', function () {
    document.getElementById('qualityValue').innerText = Math.round(this.value * 100) + "%";
});

// --- LOGIKA UTAMA (MAIN RUNNER) ---
processBtn.addEventListener('click', async function () {
    const file = fileInput.files[0];
    const method = methodSelect.value;
    const quality = parseFloat(qualityRange.value);

    // STOPWATCH MULAI
    const startTime = performance.now();

    processBtn.disabled = true;
    processBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Memproses...';

    try {
        // PENGCABANGAN METODE
        if (method === 'raster') {
            processedBlob = await compressRaster(file, quality);
        } else if (method === 'bw') {
            processedBlob = await compressBW(file, quality); // Logika BW mirip Raster tapi ada filter
        } else if (method === 'safe') {
            processedBlob = await compressSafe(file);
        }

        // STOPWATCH SELESAI
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2); // Detik

        // Tampilkan Hasil
        document.getElementById('timeStat').innerText = `⏱ Waktu Proses: ${duration} detik (Metode: ${method.toUpperCase()})`;
        document.getElementById('originalSize').innerText = formatBytes(file.size);
        document.getElementById('compressedSize').innerText = formatBytes(processedBlob.size);

        resultCard.classList.remove('d-none');

        // Add notification for successful compression
        if (window.NotificationManager) {
            const reduction = ((1 - processedBlob.size / file.size) * 100).toFixed(0);
            window.NotificationManager.add(
                'compress',
                `Compressed PDF: ${formatBytes(file.size)} → ${formatBytes(processedBlob.size)} (${reduction}% smaller)`,
                file.name
            );
        }

    } catch (error) {
        console.error(error);
        alert("Gagal: " + error.message);
    } finally {
        processBtn.disabled = false;
        processBtn.innerText = "Mulai Kompresi";
    }
});

// --- ALGORITMA 1: RASTERIZATION (JPEG) ---
async function compressRaster(file, quality) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Logika Skala: Turunkan resolusi jika kualitas rendah
        let scale = quality < 0.5 ? 0.8 : 1.5;
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        const imgData = canvas.toDataURL('image/jpeg', quality);
        if (i > 1) doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, 0, w, h, undefined, 'FAST');
    }
    return doc.output('blob');
}

// --- ALGORITMA 2: B&W (GRAYSCALE SIMULATION) ---
async function compressBW(file, quality) {
    // Logikanya mirip Raster, tapi kita manipulasi pixel jadi hitam putih
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 }); // Scale standar

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        // MANIPULASI PIXEL (JADI HITAM PUTIH)
        const imgDataRaw = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgDataRaw.data;
        for (let j = 0; j < data.length; j += 4) {
            const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
            const color = avg > 128 ? 255 : 0; // Thresholding
            data[j] = color;     // R
            data[j + 1] = color;   // G
            data[j + 2] = color;   // B
        }
        ctx.putImageData(imgDataRaw, 0, 0);

        // Simpan
        const imgData = canvas.toDataURL('image/jpeg', quality);
        if (i > 1) doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, 0, w, h, undefined, 'FAST');
    }
    return doc.output('blob');
}

// --- ALGORITMA 3: SAFE COMPRESS (PDF-LIB) ---
async function compressSafe(file) {
    const arrayBuffer = await file.arrayBuffer();
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Teknik: Hapus Metadata & Gunakan Object Streams
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

    return new Blob([pdfBytes], { type: 'application/pdf' });
}

// Helper Format Bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Download Action
downloadBtn.addEventListener('click', () => {
    if (processedBlob) {
        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "result_" + fileInput.files[0].name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});