"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key="landing"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.45, ease: [0.4, 0.2, 0.2, 1] }}
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
      >
        <div className="bg-white/90 p-10 rounded-3xl shadow-2xl text-center max-w-xl">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-800 tracking-tight drop-shadow">Welcome to the User Management Dashboard</h1>
          <p className="mb-8 text-lg text-gray-600">Easily view, add, and manage users with this simple admin dashboard.</p>
          <a
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg"
          >
            Go to Dashboard
          </a>
        </div>
      </motion.main>
    </AnimatePresence>
  );
}
