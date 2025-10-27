// src/pdfUtils.js
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const extractImageFromPage = async (url, pageNum = 1) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: PDF not found`);
    
    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength === 0) throw new Error('PDF is empty');
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Image extraction failed:', err);
    return null;
  }
};

export const extractTextFromPdf = async (url, onProgress = null) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: PDF not found`);
    
    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength === 0) throw new Error('PDF is empty');
    
    if (onProgress) onProgress('📄 Loading PDF document...');

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    const totalPages = pdf.numPages;

    if (onProgress) onProgress(`📖 Found ${totalPages} pages`);

    for (let i = 1; i <= totalPages; i++) {
      if (onProgress) {
        onProgress(`🔍 Reading page ${i}/${totalPages}...`);
      }
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `Page ${i}: ${pageText}\n\n`;
      
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (onProgress) {
      onProgress('✅ PDF text extraction complete!');
    }

    return fullText.trim();
  } catch (err) {
    console.error('PDF text extraction failed:', err);
    throw new Error(`PDF processing error: ${err.message}`);
  }
};
