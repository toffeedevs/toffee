import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay"; // ✅ Import if using loading overlay

export default function FlashcardGeneratorPage() {
  const { state } = useLocation(); // { docId, docText }
  const navigate = useNavigate();

  const [focusAreas, setFocusAreas] = useState("");
  const [sampleQuestions, setSampleQuestions] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [numQuestions, setNumQuestions] = useState(10); // ✅ NEW
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://nougat-omega.vercel.app/nougat/cards", {
        number_of_questions: numQuestions, // ✅ INCLUDED
        source_document: state.docText,
        focus_areas: focusAreas.split(",").map((s) => s.trim()),
        sample_questions: sampleQuestions ? sampleQuestions.split(";").map((s) => s.trim()) : [],
        difficulty
      });

      navigate("/flashcards", {
        state: {
          docId: state.docId,
          text: state.docText,
          flashcards: res.data.cards
        }
      });
    } catch (err) {
      alert("Failed to generate flashcards.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
      {loading && <LoadingOverlay message="Generating Flashcards..." />}
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md relative z-10">
        <h1 className="text-2xl font-bold text-purple-400 mb-4">Configure Flashcard Generation</h1>

        <div className="mb-3">
          <label className="block text-sm mb-1">Areas of Focus (comma-separated)</label>
          <input
            type="text"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
            placeholder="e.g., biology, cells"
            className="w-full p-2 bg-black border border-purple-600 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Sample Questions (semicolon-separated, optional)</label>
          <input
            type="text"
            value={sampleQuestions}
            onChange={(e) => setSampleQuestions(e.target.value)}
            placeholder="e.g., What is a cell?;Define mitochondria"
            className="w-full p-2 bg-black border border-purple-600 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 bg-black border border-purple-600 rounded"
          >
            <option value="Easy">Easy</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Number of Flashcards</label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="w-full p-2 bg-black border border-purple-600 rounded"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            ← Back
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            {loading ? "Generating..." : "Start Flashcards"}
          </button>
        </div>
      </div>
    </div>
  );
}
