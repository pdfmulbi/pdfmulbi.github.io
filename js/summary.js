// 1. Import Library AI dari CDN (Hugging Face)
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';

// Konfigurasi: Matikan local model check (biar download dari internet)
env.allowLocalModels = false;

// Setup Worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const statusArea = document.getElementById('statusArea');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const resultCard = document.getElementById('resultCard');
const summaryOutput = document.getElementById('summaryOutput');
const copyBtn = document.getElementById('copyBtn');

let summarizer = null; // Variabel untuk menyimpan model AI

// Trigger Upload
uploadZone.addEventListener('click', () => fileInput.click());

// Saat File Dipilih
fileInput.addEventListener('change', async function() {
    if (this.files.length === 0) return;
    
    const file = this.files[0];

    // Reset UI
    resultCard.classList.add('d-none');
    statusArea.classList.remove('d-none');
    progressBar.style.width = '10%';
    
    try {
        // LANGKAH 1: Load Model AI (Hanya sekali di awal)
        if (!summarizer) {
            statusText.innerText = "Sedang mendownload Model AI (DistilBART)... Mohon tunggu, ini butuh kuota ±40MB.";
            
            // Kita pakai model 'distilbart-cnn-6-6' (Versi ringan dari BART)
            summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
                progress_callback: (data) => {
                    // Update progress bar saat download model
                    if (data.status === 'progress') {
                        const percent = Math.round(data.progress || 0);
                        progressBar.style.width = percent + '%';
                    }
                }
            });
        }

        // LANGKAH 2: Ekstrak Teks dari PDF
        statusText.innerText = "Membaca isi PDF...";
        progressBar.style.width = '50%';
        const text = await extractTextFromPDF(file);

        if (text.length < 50) {
            throw new Error("Teks PDF terlalu pendek atau berupa gambar (scan).");
        }

        // LANGKAH 3: Proses Summarization
        statusText.innerText = "Sedang Meringkas (AI Berpikir)...";
        progressBar.style.width = '75%';
        
        // AI PROCESS
        // max_length: panjang maksimum ringkasan
        // min_length: panjang minimum ringkasan
        const output = await summarizer(text, {
            max_new_tokens: 200, // Sesuaikan panjang output
            min_new_tokens: 50,
        });

        // Tampilkan Hasil
        progressBar.style.width = '100%';
        setTimeout(() => {
            statusArea.classList.add('d-none');
            resultCard.classList.remove('d-none');
            summaryOutput.innerText = output[0].summary_text;
        }, 500);

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
        statusArea.classList.add('d-none');
    }
});

// --- FUNGSI PEMBANTU: BACA PDF ---
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";

    // Batasi hanya 5 halaman pertama agar browser tidak crash
    const maxPages = Math.min(pdf.numPages, 5);

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Gabungkan teks per halaman
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + " ";
    }

    // Bersihkan spasi berlebih
    return fullText.replace(/\s+/g, ' ').trim();
}

// Copy Text Button
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(summaryOutput.innerText);
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
    setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Salin Teks', 2000);
});