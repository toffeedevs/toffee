import React from "react";
import { X } from "lucide-react"; // Optional: install via `npm install lucide-react`

export default function DocumentCard({ title, createdAt, onTakeTF, onTakeMCQ, onDelete }) {
  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-lg border border-purple-700 hover:scale-[1.01] transition-all duration-150">
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition"
          title="Delete this document"
        >
          <X size={18} />
        </button>
      )}
      <h3 className="text-xl font-semibold text-purple-400 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">Added: {createdAt}</p>
      <div className="flex flex-wrap gap-3">
        <button onClick={onTakeMCQ} className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition">
          Take MCQ Quiz
        </button>
        <button onClick={onTakeTF} className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition">
          Take TF Quiz
        </button>
      </div>
    </div>
  );
}
