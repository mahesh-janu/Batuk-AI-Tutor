import { useState } from 'react';
import { auth, db, doc, setDoc } from '../firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function AuthModal({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save Groq key in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), { groqKey });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(userCredential.user.groqKey || groqKey);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-4">{isRegister ? 'Register' : 'Login'}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        />
        {isRegister && (
          <input
            type="text"
            placeholder="Groq API Key"
            value={groqKey}
            onChange={e => setGroqKey(e.target.value)}
            className="w-full p-3 border rounded mb-3"
          />
        )}
        <button onClick={handleAuth} className="w-full bg-green-600 text-white p-3 rounded mb-2">
          {isRegister ? 'Register' : 'Login'}
        </button>
        <p className="text-center text-sm text-gray-500 cursor-pointer" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
}

