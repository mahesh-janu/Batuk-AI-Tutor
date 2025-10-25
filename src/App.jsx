import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame, BookOpen, Send, Bot, Upload } from 'lucide-react';
import { askGroq } from './api.js';
import { extractTextFromPdf } from './utils.js';

function App() {
  const [streak, setStreak] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleCorrect = () => {
    setStreak(s => s + 1);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00CC5C', '#FF6B6B', '#FFB800']
    });
  };

  const appendMessage = (content, role = 'ai') => {
    setMessages(m => [...m, { role, content }]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey.trim()) {
      setError('Enter Groq API key');
      return;
    }

    appendMessage(input, 'user');
    setInput('');
    setThinking(true);
    setError('');

    try {
      let context = '';
      if (uploadedFile && notes) {
        context = `Use ONLY this content from uploaded notes:\n${notes}\n\n`;
        appendMessage(`Using notes from: ${uploadedFile}`, 'ai');
      }

      const prompt = `${context}You are a Grade 8 Math tutor. Answer using only the provided notes if available. Question: ${input}`;
      const answer = await askGroq(prompt, apiKey);
      appendMessage(answer, 'ai');
      handleCorrect();
    } catch (err) {
      appendMessage(`Error: ${err.message}`, 'ai');
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="w-72 bg-white shadow-2xl p-6 flex flex-col border-r border-gray-100"
      >
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-9 h-9 text-green-600" />
          <h1 className="text-2xl font-bold text-green-700">Batuk AI Tutor</h1>
        </div>

        <div className="space-y-8 flex-1">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Today's Streak</p>
            <motion.div className="flex items-center gap-2 text-4xl font-bold text-orange-600">
              {streak}
              <Flame className={`w-10 h-10 ${streak > 0 ? 'animate-pulse text-orange-500' : 'text-gray-300'}`} />
            </motion.div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Subject</p>
            <p className="text-lg font-semibold text-gray-800">Grade 8 Math - Fractions</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Start Lesson
          </motion.button>

          {/* GROQ API KEY */}
          <div className="mt-6 border-t pt-6">
            <input
              type="password"
              placeholder="Groq API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              name="groq-api-key"
              className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">Get free key: console.groq.com</p>
          </div>

          {/* PDF UPLOAD */}
          <div className="mt-4 border-t pt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload PDF Notes
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setUploadedFile(file.name);
                appendMessage(`Extracting text from ${file.name}...`, 'ai');
                try {
                  const text = await extractTextFromPdf(file);
                  console.log('RAW EXTRACTED TEXT:', text);
                  console.log('TEXT LENGTH:', text.length);
                  if (text.length === 0) {
                    appendMessage(`PDF loaded but NO TEXT found. Is it a scanned image?`, 'ai');
                  } else {
                    const limited = text.slice(0, 30000);
                    setNotes(limited);
                    appendMessage(`Notes loaded (${text.length} chars → ${limited.length} used)`, 'ai');
                  }
                } catch (err) {
                  console.error('PDF EXTRACT ERROR:', err);
                  appendMessage(`Failed to read PDF: ${err.message}`, 'ai');
                }
              }}
            />
            {uploadedFile && (
              <p className="text-xs text-green-600 mt-2 truncate">📄 {uploadedFile}</p>
            )}
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col bg-gray-50/50">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl px-6 py-4 rounded-3xl shadow-lg ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                {m.role === 'ai' && <Bot className="w-6 h-6 inline mr-2 text-green-600" />}
                <span className="text-base leading-relaxed whitespace-pre-wrap">{m.content}</span>
              </div>
            </motion.div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-white px-6 py-4 rounded-3xl shadow-lg border">
                <div className="flex space-x-2">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-3 h-3 bg-gray-400 rounded-full" />
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-3 h-3 bg-gray-400 rounded-full" />
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-3 h-3 bg-gray-400 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about fractions..."
              name="question"
              className="flex-1 px-6 py-4 rounded-2xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={sendMessage}
              className="bg-green-600 text-white p-4 rounded-2xl shadow-lg hover:bg-green-700 transition"
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
