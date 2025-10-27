// ✅ Unified file extractor (PDF, DOCX, PPTX, XLSX, JPG, PNG)
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import JSZip from 'jszip';

export async function readFileAsText(file, onProgress = () => {}) {
  try {
    const ext = file.name.split('.').pop().toLowerCase();
    onProgress(`📂 Uploading ${file.name}...`);

    // -------------------------------
    // 1️⃣ PDF FILES
    // -------------------------------
    if (ext === 'pdf') {
      onProgress('📘 PDF detected — extracting text...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(' ');
        fullText += `\n\n[Page ${i}]\n${text}`;
      }

      onProgress(`✅ Loaded FULL content (${fullText.length} characters).`);
      return fullText.trim();
    }

    // -------------------------------
    // 2️⃣ WORD / DOCX FILES
    // -------------------------------
    if (ext === 'docx' || ext === 'doc') {
      onProgress('📝 Word document detected — extracting text...');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      onProgress(`✅ Extracted ${result.value.length} characters from DOCX.`);
      return result.value.trim();
    }

    // -------------------------------
    // 3️⃣ EXCEL FILES (XLSX / XLS)
    // -------------------------------
    if (ext === 'xlsx' || ext === 'xls') {
      onProgress('📊 Excel file detected — reading data...');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      let fullText = '';

      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        fullText += `\n\n[Sheet: ${sheetName}]\n`;
        fullText += XLSX.utils.sheet_to_csv(sheet);
      });

      onProgress(`✅ Extracted ${fullText.length} characters from Excel.`);
      return fullText.trim();
    }

    // -------------------------------
    // 4️⃣ PPT / PPTX FILES
    // -------------------------------
    if (ext === 'pptx' || ext === 'ppt') {
      onProgress('📽️ PowerPoint file detected — extracting slides...');
      const zip = new JSZip();
      const data = await zip.loadAsync(file);
      let text = '';

      for (const [key, value] of Object.entries(data.files)) {
        if (key.endsWith('.xml') && key.includes('slide')) {
          const xml = await value.async('string');
          text += xml.replace(/<[^>]+>/g, ' ');
        }
      }

      onProgress(`✅ Extracted ${text.length} characters from PowerPoint.`);
      return text.trim();
    }

    // -------------------------------
    // 5️⃣ IMAGES (JPG / JPEG / PNG)
    // -------------------------------
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      onProgress('🖼️ Image detected — running OCR...');
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => onProgress(`🔍 ${Math.round(m.progress * 100)}% OCR...`)
      });
      onProgress(`✅ Extracted ${result.data.text.length} characters from image.`);
      return result.data.text.trim();
    }

    // -------------------------------
    // 6️⃣ UNKNOWN FILE TYPES
    // -------------------------------
    onProgress('⚠️ Unsupported file type. Returning raw text...');
    const text = await file.text();
    return text.trim();

  } catch (err) {
    console.error('❌ File extraction failed:', err);
    onProgress(`❌ Error while reading file: ${err.message}`);
    return '';
  }
}

