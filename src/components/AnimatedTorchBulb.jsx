// src/components/AnimatedTorchBulb.jsx
import { motion } from 'framer-motion';

export default function AnimatedTorchBulb() {
  return (
    <motion.div
      className="relative w-80 h-80 bg-gradient-to-b from-blue-50 to-gray-100 rounded-3xl shadow-2xl p-8 overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Battery */}
      <div className="absolute top-16 left-8 w-20 h-32 bg-gradient-to-b from-gray-700 to-gray-600 rounded-lg shadow-lg">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full"></div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full"></div>
        <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white font-bold">+</p>
        <p className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-white font-bold">-</p>
      </div>

      {/* Wires */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Left wire: Battery+ to Switch */}
        <motion.path
          d="M 100 100 Q 120 80, 140 100 Q 160 120, 180 100"
          stroke="#22c55e"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        {/* Right wire: Switch to Bulb */}
        <motion.path
          d="M 180 100 Q 220 80, 260 100"
          stroke="#22c55e"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
        />
        {/* Bulb to Battery- */}
        <motion.path
          d="M 260 140 Q 220 160, 180 140 Q 140 120, 100 140"
          stroke="#22c55e"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        />
      </svg>

      {/* Switch (ON) */}
      <motion.div
        className="absolute top-20 left-40"
        initial={{ rotate: 0 }}
        animate={{ rotate: 45 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="w-12 h-6 bg-gray-600 rounded-full relative">
          <div className="absolute right-0 top-1 w-6 h-4 bg-green-500 rounded-full shadow-md"></div>
        </div>
      </motion.div>

      {/* Torch Bulb */}
      <motion.div
        className="absolute top-32 left-60"
        animate={{
          filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <svg width="80" height="100" viewBox="0 0 80 100">
          <circle cx="40" cy="50" r="25" fill="#f3f4f6" stroke="#94a3b8" strokeWidth="3" />
          <path d="M 30 50 Q 40 40, 50 50" stroke="#fbbf24" strokeWidth="3" fill="none" />
          <path d="M 32 52 Q 40 45, 48 52" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <circle cx="40" cy="50" r="8" fill="#fbbf24" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>

      {/* Light Rays */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-32 bg-yellow-300 opacity-30 rounded-full"
          style={{
            left: '50%',
            top: '150px',
            transformOrigin: 'top center',
            transform: `translateX(-50%) rotate(${i * 60}deg)`,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 2.5 + i * 0.2,
          }}
        />
      ))}

      {/* Label */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm font-bold text-gray-800">Electric Circuit → Bulb Glows</p>
        <p className="text-xs text-gray-600 mt-1">Current flows → Filament heats → Light</p>
      </div>
    </motion.div>
  );
}
