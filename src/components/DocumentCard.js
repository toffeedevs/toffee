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
}) {
  return (
    <div className="relative bg-gray-800/60 border border-purple-700 rounded-2xl p-6 flex flex-col shadow-md backdrop-blur-sm">
      {/* ❌ Delete button in top-right */}
      <button
        onClick={onDeleted}
        className="absolute top-3 right-3 text-red-400 hover:text-red-500 transition text-lg"
        aria-label="Delete document"
      >
        ❌
      </button>

      {/* Summary */}
      <h3 className="text-lg font-semibold text-white mb-6">
        {doc.summary || "No summary available"}
      </h3>

      {/* Action buttons */}
      <div className="mt-auto flex flex-wrap gap-2">
        <button onClick={onTakeMCQ} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2">
          <span>📝</span>
          <span>MCQ</span>
        </button>
        <button onClick={onTakeTF} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2">
          <span>✅</span>
          <span>True/False</span>
        </button>
        <button onClick={onTakeFITB} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2">
          <span>✍️</span>
          <span>Fill-in-the-Blank</span>
        </button>
        <button onClick={onReviewFlashcards} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2">
          <span>🃏</span>
          <span>Flashcards</span>
        </button>
        <button onClick={onStartFeynman} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2">
          <span>🧠</span>
          <span>Feynman</span>
        </button>
      </div>
    </div>
  );
}
