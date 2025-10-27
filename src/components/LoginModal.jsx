import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

export default function LoginModal({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (isSignup && !groqKey)) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // Create new user
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), { groqKey }, { merge: true });
        onLogin(groqKey);
      } else {
        // Login existing user
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const docRef = doc(db, 'users', userCred.user.uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const key = userDoc.data().groqKey;
          if (key) {
            onLogin(key);
          } else {
            setError('No Groq key found. Please sign up again.');
          }
        } else {
          setError('User data not found.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          {isSignup ? 'Create Account' : 'Login'}
        </h2>

        {/* Email */}
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-3">
          <Mail className="w-5 h-5 text-gray-500" />
          <input
            type="email"
            placeholder="Email"
            className="w-full outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-3">
          <Lock className="w-5 h-5 text-gray-500" />
          <input
            type="password"
            placeholder="Password"
            className="w-full outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Groq Key — only for signup */}
        {isSignup && (
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 mb-3">
            <KeyRound className="w-5 h-5 text-gray-500" />
            <input
              type="password"
              placeholder="Groq API Key (console.groq.com)"
              className="w-full outline-none"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition"
        >
          {loading
            ? 'Please wait...'
            : isSignup
            ? 'Sign Up'
            : 'Login'}
        </button>

        <p className="text-sm text-center mt-4 text-gray-600">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsSignup(false)}
                className="text-blue-600 font-semibold"
              >
                Login
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button
                onClick={() => setIsSignup(true)}
                className="text-blue-600 font-semibold"
              >
                Create Account
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}

