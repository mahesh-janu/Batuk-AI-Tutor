// src/components/AnimatedMagnesiumBurn.jsx
import { motion } from 'framer-motion';

export default function AnimatedMagnesiumBurn() {
  return (
    <motion.div
      className="relative w-64 h-64 bg-gradient-to-b from-gray-50 to-gray-200 rounded-2xl shadow-2xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Bunsen Burner */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-20">
        <div className="w-12 h-16 bg-gray-700 rounded-t-full mx-auto"></div>
        <div className="w-16 h-4 bg-gray-800 mx-auto -mt-1 rounded-b-full"></div>
      </div>

      {/* Tongs + Magnesium Ribbon */}
      <motion.div
        className="absolute top-12 left-8"
        animate={{
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="100" height="80" viewBox="0 0 100 80">
          {/* Tongs */}
          <path d="M 20 20 Q 30 10, 40 20" stroke="#8B4513" strokeWidth="4" fill="none" />
          <path d="M 20 20 Q 30 30, 40 20" stroke="#8B4513" strokeWidth="4" fill="none" />
          <line x1="40" y1="20" x2="70" y2="30" stroke="#8B4513" strokeWidth="4" />
          
          {/* Magnesium Ribbon */}
          <rect x="68" y="28" width="25" height="4" fill="#C0C0C0" rx="2" />
        </svg>
      </motion.div>

      {/* FLAME — BURNING */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80">
          <defs>
            <radialGradient id="flameGradient">
              <stop offset="0%" stopColor="#FF4500" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA500" />
            </radialGradient>
          </defs>
          <path
            d="M 30 70 Q 20 50, 25 30 Q 30 10, 35 30 Q 40 50, 30 70 Z"
            fill="url(#flameGradient)"
            opacity="0.9"
          />
          <path
            d="M 30 65 Q 22 48, 27 35 Q 30 20, 33 35 Q 38 48, 30 65 Z"
            fill="#FFFF00"
            opacity="0.7"
          />
        </svg>
      </motion.div>

      {/* WHITE ASH FALLING */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full shadow-md"
          initial={{ 
            x: 120 + (i % 3) * 20, 
            y: 80,
            opacity: 1 
          }}
          animate={{
            y: [80, 180],
            x: [120 + (i % 3) * 20, 100 + Math.random() * 40],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Watch Glass + Ash */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-20 h-4 bg-gradient-to-b from-transparent to-gray-300 rounded-full"></div>
        <div className="w-16 h-1 bg-white mx-auto mt-1 rounded-full shadow-inner"></div>
        <div className="w-10 h-1 bg-gray-200 mx-auto mt-1 rounded-full opacity-70"></div>
      </div>

      {/* LABEL */}
      <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
        Burning Magnesium → White Ash (MgO)
      </p>
    </motion.div>
  );
}
