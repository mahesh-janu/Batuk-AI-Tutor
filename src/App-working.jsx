// src/App.jsx
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame, BookOpen, Send, Bot, Upload, Mic, Square, VolumeX, LogOut } from 'lucide-react';
import { askGroq } from './api.js';
import { readFileAsText } from './utils.js';
import { ocrPdf } from './ocr.js';
import { extractImageFromPage, extractTextFromPdf } from './pdfUtils.js';
import AnimatedMagnesiumBurn from './components/AnimatedMagnesiumBurn.jsx';
import AnimatedTorchBulb from './components/AnimatedTorchBulb.jsx';
import LoginModal from './components/LoginModal.jsx';
import { auth, db, doc, getDoc, signOut } from './firebase.js';

// SAFE SPEECH RECOGNITION
let SpeechRecognition = null;
let useSpeechRecognition = () => ({
  transcript: '',
  resetTranscript: () => {},
  browserSupportsSpeechRecognition: false,
});

function App() {
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loadingModels, setLoadingModels] = useState(true);

  // MODE
  const [mode, setMode] = useState('general');

  // TEXTBOOK
  const [availableBoards, setAvailableBoards] = useState([]);
  const [board, setBoard] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [indexData, setIndexData] = useState({});
  const [loadingBoard, setLoadingBoard] = useState(true);

  // PROMPTS
  const [prompts, setPrompts] = useState({});

  // VISUALS
  const [currentFigure, setCurrentFigure] = useState(null);
  const [showMagnesiumAnimation, setShowMagnesiumAnimation] = useState(false);
  const [showTorchAnimation, setShowTorchAnimation] = useState(false);

  // SPEECH
  const utteranceRef = useRef(null);
  const silenceTimer = useRef(null);
  const { transcript = '', resetTranscript = () => {}, browserSupportsSpeechRecognition = false } = useSpeechRecognition();

  const fileInputRef = useRef(null);

  // SAFE import of react-speech-recognition
  useEffect(() => {
    (async () => {
      try {
        const module = await import('react-speech-recognition');
        SpeechRecognition = module.default;
      } catch (err) {
        console.warn('Speech recognition not available');
      }
    })();
  }, []);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const docSnap = await getDoc(doc(db, 'users', u.uid));
        if (docSnap.exists() && docSnap.data().groqKey) {
          setApiKey(docSnap.data().groqKey);
          setLoggedIn(true);
        }
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    });
    return unsubscribe;
  }, []);

  // Load models
  useEffect(() => {
    fetch('/models.json')
      .then(r => r.json())
      .then(data => {
        setModels(data);
        setSelectedModel(data[0] || '');
      })
      .catch(() => setError('Failed to load models'))
      .finally(() => setLoadingModels(false));
  }, []);

  // Load prompts
  useEffect(() => {
    fetch('/prompts.json')
      .then(r => r.json())
      .then(setPrompts);
  }, []);

  // AUTO DETECT BOARD
  useEffect(() => {
    const checkBoard = async (name) => {
      try {
        const res = await fetch(`/${name}/notes_index.json`, { method: 'HEAD' });
        return res.ok;
      } catch {
        return false;
      }
    };

    Promise.all([checkBoard('sslc'), checkBoard('cbse')])
      .then(([hasSSLC, hasCBSE]) => {
        const boards = [];
        if (hasSSLC) boards.push('SSLC');
        if (hasCBSE) boards.push('CBSE');
        setAvailableBoards(boards);
        setBoard(boards[0] || '');
        setLoadingBoard(false);
      });
  }, []);

  // Load index when board changes
  useEffect(() => {
    if (!board || mode !== 'textbook') return;
    fetch(`/${board.toLowerCase()}/notes_index.json`)
      .then(r => r.json())
      .then(data => {
        setIndexData(data);
        const subjects = Object.keys(data);
        if (subjects.length > 0) setSubject(subjects[0]);
      })
      .catch(err => setError('Failed to load textbook index'));
  }, [board, mode]);

  // Load chapter when subject changes
  useEffect(() => {
    if (!board || !subject || mode !== 'textbook') return;
    const chapters = indexData[subject] || {};
    const first = Object.keys(chapters)[0];
    if (first) {
      setChapter(first);
      loadChapterPdf(indexData[subject][first]);
    }
  }, [subject, indexData, mode]);

const loadChapterPdf = async (path) => {
  if (!path) return;
  try {
    appendMessage(`📖 Loading textbook chapter from: /${path}`, 'ai');
    
    const res = await fetch(`/${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    
    // Check if it's actually a PDF
    const contentType = res.headers.get('content-type');
    appendMessage(`📄 Content-Type: ${contentType}`, 'ai');
    
    if (path.endsWith('.pdf') || contentType?.includes('pdf')) {
      appendMessage(`🔍 Processing PDF file...`, 'ai');
      
      const blob = await res.blob();
      appendMessage(`📦 PDF size: ${blob.size} bytes`, 'ai');
      
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }

      // Try direct text extraction first
      try {
        const text = await extractTextFromPdf(`/${path}`, (progressMsg) => {
          appendMessage(progressMsg, 'ai');
        });
        
        if (!text || text.length < 20) {
          throw new Error('No readable text found');
        }
        
        setNotes(text);
        appendMessage(`✅ Loaded textbook content (${text.length} characters).`, 'ai');
      } catch (pdfError) {
        appendMessage(`⚠️ PDF text extraction failed: ${pdfError.message}`, 'ai');
        appendMessage(`🔄 Trying OCR as fallback...`, 'ai');
        
        // Fallback to OCR
        const arrayBuffer = await blob.arrayBuffer();
        const text = await ocrPdf(arrayBuffer, (progressMsg) => {
          appendMessage(progressMsg, 'ai');
        });
        
        setNotes(text);
        appendMessage(`✅ Loaded via OCR (${text.length} characters).`, 'ai');
      }

    } else {
      // Handle text files
      const text = await res.text();
      setNotes(text);
      appendMessage(`✅ Loaded textbook content (${text.length} characters).`, 'ai');
    }

    // Extract figure on load
    if (path.includes('chapter1') || path.includes('chapter12')) {
      appendMessage(`🎨 Extracting figure from PDF...`, 'ai');
      const imgData = await extractImageFromPage(`/${path}`, 1);
      if (imgData) {
        setCurrentFigure(imgData);
        appendMessage(`✅ Figure extracted successfully`, 'ai');
      } else {
        appendMessage(`⚠️ Could not extract figure`, 'ai');
      }
    } else {
      setCurrentFigure(null);
    }
  } catch (err) {
    console.error('Load chapter failed:', err);
    appendMessage(`❌ Failed to load chapter: ${err.message}`, 'ai');
  }
};
	const extractAndSetNotes = async (file) => {
	  appendMessage(`📂 Uploading ${file.name}...`, 'ai');
	  let accumulatedText = '';

	  const onProgress = (msg) => appendMessage(msg, 'ai');

	  const text = await readFileAsText(file, onProgress);

	  if (!text || text.length < 20) {
	    appendMessage('⚠️ No readable text found. Try another file.', 'ai');
	    return;
	  }

	  accumulatedText = text;
	  setNotes(accumulatedText);
	  appendMessage(`✅ Loaded FULL content (${accumulatedText.length} characters).`, 'ai');
	};


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file.name);
    await extractAndSetNotes(file);
  };

const getPrompt = () => {
  if (mode === 'textbook') {
    return `You are an AI tutor for students around 15 years old.
Source: ${subject} - ${chapter}
Textbook content:
${notes}
Student question: ${input || ''}
Answer ONLY from the above content, naturally and clearly, like a human teacher. Quote page numbers when applicable.`;
  }

  if (mode === 'uploads') {
    return `You are analyzing uploaded documents.
Source: 1 file
File content:
${notes}
Question: ${input || ''}
Answer ONLY from the above content, clearly and naturally.`;
  }

  // general mode
  return `You are a helpful AI assistant.
Question: ${input || ''}`;
};

  const sendMessage = async (text = input) => {
    if (!text.trim() || !apiKey.trim()) return;
    appendMessage(text, 'user');
    setInput('');
    setThinking(true);

    try {
      const basePrompt = getPrompt();
      const context = (notes && (mode === 'uploads' || mode === 'textbook')) ? `Use ONLY this content:\n${notes}\n\n` : '';
      const prompt = `${basePrompt}\n\n${context}Question: ${text}`;
      const answer = await askGroq(prompt, apiKey, selectedModel);
      appendMessage(answer, 'ai');
      handleCorrect();
      speak(answer);

      // Animations
      const lowerInput = text.toLowerCase();
      const lowerAnswer = answer.toLowerCase();
      if (mode === 'textbook' && chapter === 'Chapter 1' && (lowerInput.includes('magnesium') || lowerAnswer.includes('magnesium'))) setShowMagnesiumAnimation(true);
      if (mode === 'textbook' && chapter === 'Chapter 12' && (lowerInput.includes('torch') || lowerAnswer.includes('torch'))) setShowTorchAnimation(true);
    } catch (err) {
      appendMessage(`Error: ${err.message}`, 'ai');
    } finally {
      setThinking(false);
    }
  };

  const appendMessage = (content, role = 'ai') => setMessages(m => [...m, { role, content }]);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    stopSpeaking();
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_]+/g, '').trim());
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => { if (speechSynthesis.speaking) speechSynthesis.cancel(); setIsSpeaking(false); };

  const startListening = () => { if (!SpeechRecognition) return; setIsListening(true); SpeechRecognition.startListening({ continuous: true }); };
  const stopListeningAndSend = () => { setIsListening(false); SpeechRecognition?.stopListening(); if (transcript.trim()) { setInput(transcript); resetTranscript(); } };

  const handleCorrect = () => { setStreak(s => s + 1); confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } }); };

  const handleLogout = async () => { await signOut(auth); setLoggedIn(false); setUser(null); setApiKey(''); };

  if (!loggedIn) return <LoginModal />;

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <motion.aside className="w-80 bg-white shadow-2xl p-6 flex flex-col border-r">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-9 h-9 text-green-600" />
          <h1 className="text-2xl font-bold text-green-700">Batuk AI Tutor</h1>
        </div>
        <div className="space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-gray-600">Streak: {streak}</p>
            <button onClick={handleLogout} className="p-1 rounded-lg hover:bg-gray-200"><LogOut className="w-5 h-5 text-red-500" /></button>
          </div>

          {/* MODE */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Mode</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setMode('general')} className={`p-2 rounded-lg text-xs font-medium ${mode === 'general' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>General</button>
              <button onClick={() => setMode('uploads')} className={`p-2 rounded-lg text-xs font-medium ${mode === 'uploads' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Uploads</button>
              <button onClick={() => setMode('textbook')} className={`p-2 rounded-lg text-xs font-medium ${mode === 'textbook' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>Textbook</button>
            </div>
          </div>

          {/* UPLOAD */}
          {mode === 'uploads' && (
            <div>
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> Upload File
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              {uploadedFile && <p className="text-xs text-green-600 mt-1 truncate">File: {uploadedFile}</p>}
            </div>
          )}

          {/* TEXTBOOK SELECTION */}
          {mode === 'textbook' && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Board</p>
                <select value={board} onChange={e => setBoard(e.target.value)} className="w-full border rounded-lg p-2">
                  {availableBoards.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Subject</p>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full border rounded-lg p-2">
                  {Object.keys(indexData).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Chapter</p>
                <select value={chapter} onChange={e => { setChapter(e.target.value); loadChapterPdf(indexData[subject][e.target.value]); }} className="w-full border rounded-lg p-2">
                  {subject && Object.keys(indexData[subject] || {}).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}

          {/* MODEL SELECTION */}
          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium text-gray-600">Model</p>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {models.map(m => (
                  <option key={m} value={m}>
                    {m.includes('70b') ? '⚡ ' : m.includes('8b') ? '⚡ ' : '🐢 '}
                    {m.split('-')[1].toUpperCase()} ({m.includes('70b') ? 'Pro' : m.includes('8b') ? 'Fast' : 'Free'})
                  </option>
                ))}
              </select>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-6 py-4 rounded-3xl shadow-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                {m.role === 'ai' && <Bot className="w-5 h-5 inline mr-2 text-green-600" />}
                <span className="text-base whitespace-pre-wrap">{m.content}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t">
          <div className="flex gap-3 max-w-4xl mx-auto items-center">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Ask anything..." className="flex-1 px-6 py-4 rounded-2xl border text-lg" />
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={isListening ? stopListeningAndSend : startListening} className={`p-4 rounded-2xl shadow-lg ${isListening ? 'bg-red-600 animate-pulse' : 'bg-blue-600'} text-white`}>
              {isListening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </motion.button>
            {isSpeaking && (
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={stopSpeaking} className="p-4 rounded-2xl shadow-lg bg-orange-600 text-white">
                <VolumeX className="w-6 h-6" />
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => sendMessage()} className="bg-green-600 text-white p-4 rounded-2xl shadow-lg">
              <Send className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

