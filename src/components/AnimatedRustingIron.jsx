// src/components/AnimatedRustingIron.jsx
import { motion } from 'framer-motion';

export default function AnimatedRustingIron() {
  return (
    <motion.div
      className="relative w-80 h-80 bg-gradient-to-b from-sky-100 to-blue-100 rounded-3xl shadow-2xl p-8 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Iron Nail */}
      <motion.div
        className="absolute top-20 left-1/2 transform -translate-x-1/2 w-8 h-32 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"
        animate={{
          background: ['linear-gradient(to bottom, #94a3b8, #6b7280)', 'linear-gradient(to bottom, #ef4444, #991b1b)'],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Water Droplets */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-blue-400 rounded-full opacity-70"
          initial={{ y: -100, x: 100 + i * 20 }}
          animate={{ y: 200, x: 100 + i * 20 + Math.random() * 40 }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Rust Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`rust-${i}`}
          className="absolute w-2 h-2 bg-red-700 rounded-full"
          initial={{ scale: 0, opacity: 0, x: 140, y: 180 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], y: 300 }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 + i * 0.2 }}
        />
      ))}

      {/* Label */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm font-bold text-red-800">Rusting of Iron</p>
        <p className="text-xs text-gray-700 mt-1">Fe + O₂ + H₂O → Fe₂O₃·H₂O</p>
      </div>
    </motion.div>
  );
}
