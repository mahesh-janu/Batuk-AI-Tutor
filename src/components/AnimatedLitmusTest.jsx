// src/components/AnimatedLitmusTest.jsx
import { motion } from 'framer-motion';

export default function AnimatedLitmusTest() {
  return (
    <motion.div
      className="relative w-96 h-80 bg-gradient-to-b from-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Beaker with Acid */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-32 h-40 bg-gradient-to-b from-transparent to-blue-200 rounded-b-full border-4 border-blue-400 rounded-t-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-300 to-transparent opacity-50"></div>
        <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-800">Acid</p>
      </div>

      {/* Litmus Paper (Blue → Red) */}
      <motion.div
        className="absolute top-24 left-1/2 transform -translate-x-1/2 w-8 h-24 bg-blue-600 rounded-t-lg shadow-lg"
        animate={{
          backgroundColor: ['#2563eb', '#dc2626'],
        }}
        transition={{ duration: 2, delay: 1 }}
      >
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-white rounded-full"></div>
        <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold rotate-90 origin-center">Litmus</p>
      </motion.div>

      {/* Droplets */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-blue-400 rounded-full opacity-70"
          initial={{ y: -20, x: 140 + i * 10 }}
          animate={{ y: 180, x: 140 + i * 10 + Math.random() * 20 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 + i * 0.2 }}
        />
      ))}

      {/* Bubbles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`bubble-${i}`}
          className="absolute w-4 h-4 bg-white rounded-full opacity-60"
          initial={{ y: 220, x: 160 + i * 15, scale: 0 }}
          animate={{ y: 100, scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Label */}
      <motion.div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <p className="text-sm font-bold text-red-700">Blue Litmus → Red</p>
        <p className="text-xs text-gray-700 mt-1">Acidic Solution</p>
      </motion.div>
    </motion.div>
  );
}
