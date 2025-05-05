import React from "react";

export default function DocumentCard({ title, createdAt, onTakeMCQ, onTakeTF, onTakeFITB, onDelete }) {
  return (
    <div className="bg-gray-800/70 border border-purple-700 rounded-2xl p-6 shadow-md backdrop-blur text-white">
      <h3 className="text-xl font-semibold text-purple-300 mb-2">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">Created on {createdAt}</p>
      <div className="flex flex-col gap-2">
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
          Take True/False Quiz
        </button>
        <button
          onClick={onTakeFITB}
          className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
        >
          Take FITB Quiz
        </button>
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 text-sm mt-2 underline"
        >
          Delete Document
        </button>
      </div>
    </div>
  );
}
