import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay";
import { getDocument, updateDocumentText } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";

export default function FeynmanSession() {
  const { currentUser } = useAuth();
  const { state } = useLocation(); // { docId, text }
  const navigate = useNavigate();
  const { docId } = state || {};

  const [text, setText] = useState("");
  const [keyterms, setKeyterms] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      if (!docId || !currentUser) return;

      try {
        const docData = await getDocument(currentUser.uid, docId);
        if (!docData) throw new Error("Document not found");

        let rawText = docData.text || "";

        // If it's an Anki doc, fetch real content
        if (docData.isAnki && docData.ankiUrl) {
          const res = await axios.post(
            "https://nougat-omega.vercel.app/nougat/import-anki",
            { url: docData.ankiUrl },
            { headers: { "Content-Type": "application/json" } }
          );
          const cards = res.data.cards || [];
          rawText = cards.map((card) => `Q: ${card.front}\nA: ${card.back}`).join("\n\n");

          // Overwrite Firestore 'text' field with resolved content for future use
          await updateDocumentText(currentUser.uid, docId, rawText);
        }

        setText(rawText);

        // Now fetch keyterms
        const keytermRes = await axios.post(
          "https://nougat-omega.vercel.app/nougat/keyterms",
          { text: rawText },
          { headers: { "Content-Type": "application/json" } }
        );
        const termsArray = Array.isArray(keytermRes.data.terms) ? keytermRes.data.terms : [];
        const extractedQuestions = termsArray
          .map(item => item.question)
          .filter(q => q !== null && q !== undefined);

        setKeyterms(extractedQuestions);
      } catch (err) {
        console.error("Feynman initialization failed:", err);
        alert("Failed to initialize Feynman session.");
      } finally {
        setInitializing(false);
      }
    };

    initializeSession();
  }, [docId, currentUser]);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;

    const term = keyterms[currentIdx];
    setLoading(true);

    try {
      const res = await axios.post(
        "https://nougat-omega.vercel.app/nougat/feynman",
        { term, text, response: userAnswer },
        { headers: { "Content-Type": "application/json" } }
      );

      setFeedback(res.data);
    } catch (err) {
      console.error("Error validating Feynman response:", err);
      setFeedback({ feedback: "There was an error analyzing your explanation." });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < keyterms.length) {
      setCurrentIdx(prev => prev + 1);
      setUserAnswer("");
      setFeedback(null);
    } else {
      setSessionDone(true);
    }
  };

  if (initializing) {
    return <LoadingOverlay message="Preparing Feynman questions..." />;
  }

  if (!docId || !text) {
    return (
      <div className="text-center mt-20 text-white">
        <p>Invalid session. Please go back to your documents.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="underline text-purple-400 mt-4"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="text-center text-white mt-20">
        <h2 className="text-2xl font-semibold mb-2">🎉 You’ve completed the Feynman session!</h2>
        <p className="text-gray-400">Well done. You’ve gone through all the questions.</p>
        <button
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          onClick={() => navigate("/dashboard")}
        >
          🔁 Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 text-white relative">
      {loading && <LoadingOverlay message="Analyzing your explanation..." />}

      <h1 className="text-3xl font-bold mb-4 text-purple-400">🧠 Feynman Recall</h1>

      <div className="mb-6">
        <h2 className="text-lg text-gray-300 mb-2">
          Question {currentIdx + 1} of {keyterms.length}
        </h2>
        <div className="bg-gray-800 p-4 rounded-xl border border-purple-700">
          <span className="text-purple-300 font-semibold">{keyterms[currentIdx]}</span>
        </div>
      </div>

      <textarea
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Explain this question as if teaching it to a 5-year-old..."
        className="w-full h-32 bg-black border border-purple-600 p-4 rounded-xl text-sm placeholder:text-gray-400"
        disabled={loading || feedback}
      />

      <div className="mt-4 flex gap-4">
        {!feedback && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-xl text-white"
          >
            {loading ? "Analyzing..." : "📤 Submit Answer"}
          </button>
        )}
        {feedback && (
          <button
            onClick={handleNext}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl text-white"
          >
            ➡️ Next Question
          </button>
        )}
      </div>

      {feedback && (
        <div className="mt-6 bg-gray-800 p-4 rounded-xl border border-purple-700 text-sm">
          <h3 className="text-purple-300 mb-2 font-semibold">📝 Feedback</h3>
          <p><strong>Clarity:</strong> {feedback.clarity ?? "-"}</p>
          <p><strong>Accuracy:</strong> {feedback.accuracy ?? "-"}</p>
          <p><strong>Completeness:</strong> {feedback.completeness ?? "-"}</p>
          <p className="mt-2 text-gray-300">{feedback.feedback}</p>
        </div>
      )}
    </div>
  );
}
