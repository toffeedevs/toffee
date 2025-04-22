import React from "react";

export default function DocumentCard({ title, createdAt, onTakeTF, onTakeMCQ }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-lg border border-purple-700 hover:scale-[1.01] transition-all duration-150">
      <h3 className="text-xl font-semibold text-purple-400 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">Added: {createdAt}</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onTakeMCQ}
          className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
        >
          Take MCQ Quiz
        </button>
        <button
          onClick={onTakeTF}
          className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
        >
          Take TF Quiz
        </button>
      </div>
    </div>
  );
}
