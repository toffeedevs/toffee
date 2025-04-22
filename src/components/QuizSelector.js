import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function QuizSelector() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Choose Quiz Type</h1>
      <div className="space-x-4">
        <button
          className="bg-purple-600 px-4 py-2 rounded"
          onClick={() => navigate("/quiz/mcq", { state: { docId: state.docId, type: "mcq" } })}
        >
          MCQ Quiz
        </button>
        <button
          className="bg-purple-600 px-4 py-2 rounded"
          onClick={() => navigate("/quiz/tf", { state: { docId: state.docId, type: "tf" } })}
        >
          True/False Quiz
        </button>
      </div>
    </div>
  );
}
