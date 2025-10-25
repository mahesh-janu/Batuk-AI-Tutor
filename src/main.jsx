import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Load PDF.js v3.11.174 locally with forced global export
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    // Prevent double load
    if (window.pdfjsLib) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/pdfjs/pdf.min.js';  // Local v3.11.174
    script.onload = () => {
      // v3 does NOT auto-export — FORCE GLOBAL
      window.pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'] || pdfjsLib;

      if (!window.pdfjsLib) {
        console.error('pdfjsLib failed to initialize');
        reject(new Error('pdfjsLib not found after script load'));
        return;
      }

      // Set worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';

      console.log('PDF.js v3.11.174 loaded successfully');
      resolve();
    };

    script.onerror = () => {
      console.error('Failed to load pdf.min.js');
      reject(new Error('Failed to load pdf.min.js'));
    };

    document.head.appendChild(script);
  });
};

// Load PDF.js first, then render React
loadPdfJs()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch(err => {
    // Show error in UI
    document.getElementById('root').innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; color: red;">
        <h2>PDF.js Failed to Load</h2>
        <p>${err.message}</p>
        <p>Check console and refresh.</p>
      </div>
    `;
    console.error(err);
  });
