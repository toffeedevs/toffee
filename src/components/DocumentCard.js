import React from "react";
import {useNavigate} from "react-router-dom";

export default function DocumentCard({
                                         doc,
                                         onTakeTF,
                                         onTakeFITB,
                                         onReviewFlashcards,
                                         onStartFeynman,
                                         onDeleted,
                                         onShare,
                                     }) {
    const navigate = useNavigate();

    return (
        <div
            className="relative bg-gray-800/60 border border-purple-700 rounded-2xl p-6 flex flex-col shadow-md backdrop-blur-sm">
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
                <button
                    onClick={() => navigate("/generate/mcq", {state: {docId: doc.id, docText: doc.text}})}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                    📝 MCQ
                </button>
                <button
                    onClick={() => navigate("/generate/tf", {state: {docId: doc.id, docText: doc.text}})}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                    ✅ True/False
                </button>

                <button
                    onClick={() => navigate("/generate/fitb", {state: {docId: doc.id, docText: doc.text}})}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                    ✍️ Fill-in-the-Blank
                </button>
                <button
                    onClick={() => navigate("/generate/flashcards", {state: {docId: doc.id, docText: doc.text}})}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                    🃏 Flashcards
                </button>
                <button onClick={onStartFeynman}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                    🧠 Feynman
                </button>
                <button onClick={onShare}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition">
                    🌍 Share
                </button>
            </div>
        </div>
    );
}
