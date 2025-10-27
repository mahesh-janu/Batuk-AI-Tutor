// src/extractTextFromPdf.js
import { getDocument } from 'pdfjs-dist';

const initWorker = () => {
  if (!window.pdfjsWorker) {
    const worker = new Worker(new URL('/pdf.worker.min.js', import.meta.url));
    window.pdfjsWorker = worker;
    return worker;
  }
  return window.pdfjsWorker;
};

export const extractTextFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const worker = initWorker();
  const pdf = await getDocument({
    data: arrayBuffer,
    worker,
  }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};
