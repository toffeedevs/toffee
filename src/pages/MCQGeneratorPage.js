import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay";
import { getDocument, updateDocumentText } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";

export default function MCQGeneratorPage() {
  const { currentUser } = useAuth();
  const { state } = useLocation(); // expects { docId }
  const navigate = useNavigate();

  const [focusAreas, setFocusAreas] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [sampleQuestions, setSampleQuestions] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!state?.docId || !currentUser) return alert("Missing document.");

    setLoading(true);
    try {
      const docData = await getDocument(currentUser.uid, state.docId);
      if (!docData) throw new Error("Document not found.");

      let text = docData.text || "";

      // If it's an Anki deck and the text field holds a URL
      if (docData.isAnki && text.startsWith("https://")) {
        const res = await axios.post("https://nougat-omega.vercel.app/nougat/import-anki", {
          url: text,
        });
        const cards = res.data.cards || [];
        text = cards.map((card) => `Q: ${card.front}\nA: ${card.back}`).join("\n\n");

        // 🔁 Replace the URL with parsed text in Firestore
        await updateDocumentText(currentUser.uid, state.docId, text);
      }

      if (!text.trim()) return alert("No document text available.");

      const payload = {
        number_of_questions: numQuestions,
        source_document: text,
        focus_areas: focusAreas.split(",").map((s) => s.trim()),
        sample_questions: sampleQuestions
          ? sampleQuestions.split(";").map((s) => s.trim())
          : [],
        difficulty,
      };

      const res = await axios.post(
        "https://nougat-omega.vercel.app/nougat/mcqtext",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      navigate("/quiz/mcq", {
        state: {
          type: "mcq",
          questions: res.data.questions,
        },
      });
    } catch (err) {
      console.error("❌ MCQ generation failed:", err);
      alert("Failed to generate MCQs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
      {loading && <LoadingOverlay message="Generating MCQs..." />}
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md relative z-10">
        <h1 className="text-2xl font-bold text-purple-400 mb-4">Configure MCQ Generation</h1>

        <div className="mb-3">
          <label className="block text-sm mb-1">Areas of Focus (comma-separated)</label>
          <input
            type="text"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
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
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Number of Questions</label>
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

        <div className="mb-3">
          <label className="block text-sm mb-1">Optional Sample Questions (semicolon-separated)</label>
          <textarea
            value={sampleQuestions}
            onChange={(e) => setSampleQuestions(e.target.value)}
            className="w-full p-2 bg-black border border-purple-600 rounded"
          />
        </div>

        <div className="flex justify-between gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-700 rounded">
            ← Back
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            {loading ? "Generating..." : "Generate MCQs"}
          </button>
        </div>
      </div>
    </div>
  );
}
