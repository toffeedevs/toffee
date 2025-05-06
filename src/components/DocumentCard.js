// src/components/DocumentCard.js
import React from "react";

export default function DocumentCard({
  doc,
  onTakeMCQ,
  onTakeTF,
  onTakeFITB,
  onReviewFlashcards,
  onStartFeynman,
  onDeleted,
  onShare, // 🆕 added
}) {
  return (
    <div className="relative bg-gray-800/60 border border-purple-700 rounded-2xl p-6 flex flex-col shadow-md backdrop-blur-sm">
      <button
        onClick={onDeleted}
        className="absolute top-3 right-3 text-red-400 hover:text-red-500 transition text-lg"
        aria-label="Delete document"
      >
        ❌
      </button>

      <h3 className="text-lg font-semibold text-white mb-6">
        {doc.summary || "No summary available"}
      </h3>

      <div className="mt-auto flex flex-wrap gap-2">
        <button onClick={onTakeMCQ} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
          📝 MCQ
        </button>
        <button onClick={onTakeTF} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
          ✅ True/False
        </button>
        <button onClick={onTakeFITB} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
          ✍️ Fill-in-the-Blank
        </button>
        <button onClick={onReviewFlashcards} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
          🃏 Flashcards
        </button>
        <button onClick={onStartFeynman} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
          🧠 Feynman
        </button>
        <button onClick={onShare} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition">
          🌍 Share
        </button>
      </div>
    </div>
  );
}
