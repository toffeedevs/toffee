import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { saveDocument } from "../services/firestoreService";

export default function DocumentUploader({ onDocumentCreated }) {
  const { currentUser } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    const instruction = `
      Summarize this study content in 1 short, catchy sentence suitable as a flashcard deck title. Avoid generic words like 'summary' or 'overview'.

      TEXT:
      ${text}

      Only return the summary text. No formatting.
    `;

    const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemini-2.0-flash-lite-001",
      messages: [{ role: "user", content: instruction }],
    }, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      }
    });

    return res.data.choices[0].message.content.trim();
  };

  const generateQuestions = async () => {
    setLoading(true);

    const title = await generateSummary();

    const [tfRes, mcqRes] = await Promise.all([
      axios.post("https://nougat-omega.vercel.app/nougat/tftext", { text }),
      axios.post("https://nougat-omega.vercel.app/nougat/mcqtext", { text })
    ]);

    const docId = await saveDocument(
      currentUser.uid,
      text,
      tfRes.data.questions,
      mcqRes.data.questions,
      title // pass title to Firestore
    );

    setLoading(false);
    setText("");
    onDocumentCreated(docId);
  };

  return (
    <div className="space-y-4">
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-black border border-purple-600 p-4 rounded-xl text-sm placeholder:text-gray-400"
        placeholder="Paste study content here..."
      />
      <button
        onClick={generateQuestions}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition"
      >
        {loading ? "Generating..." : "Add Document & Generate Questions"}
      </button>
    </div>
  );
}
