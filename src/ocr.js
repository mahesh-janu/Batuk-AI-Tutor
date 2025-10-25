import { createWorker } from 'tesseract.js';

// Use let instead of const for worker
let worker = null;

const getWorker = async () => {
  if (worker) return worker;
  worker = await createWorker('eng', 1, {
    logger: m => console.log('OCR:', m),
  });
  return worker;
};

export const ocrPdf = async (file) => {
  const workerInstance = await getWorker();  // Local instance
  const arrayBuffer = await file.arrayBuffer();
  const { data } = await workerInstance.recognize(arrayBuffer);
  await workerInstance.terminate();
  worker = null;  // Reset global
  return data.text;
};
