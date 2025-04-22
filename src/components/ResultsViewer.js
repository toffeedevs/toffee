import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResultsViewer() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const results = state.questions.map((q, i) => {
    const userAnswer = state.answers[i];
    const isCorrect = userAnswer === q.answer;
    return {
      question: q.question,
      answer: q.answer,
      userAnswer,
      correct: isCorrect,
      rationale: q.rationale,
      choices: q.choices || null
    };
  });

  const correctCount = results.filter(r => r.correct).length;
  const total = results.length;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <h2 className="text-3xl font-bold text-purple-400 mb-6">🎯 Quiz Results</h2>
      <p className="text-lg mb-6">
        You got <span className="text-green-400 font-bold">{correctCount}</span> out of{" "}
        <span className="text-purple-300 font-bold">{total}</span> correct (
        {Math.round((correctCount / total) * 100)}%)
      </p>

      <div className="space-y-6">
        {results.map((r, idx) => (
          <div key={idx} className={`p-5 rounded-xl shadow border ${r.correct ? "bg-green-900 border-green-500" : "bg-red-900 border-red-500"}`}>
            <p className="text-lg font-medium">{idx + 1}. {r.question}</p>
            {r.choices && (
              <ul className="list-disc list-inside text-sm mt-2">
                {r.choices.map((choice, i) => (
                  <li key={i} className={choice === r.answer ? "text-green-300 font-semibold" : ""}>{choice}</li>
                ))}
              </ul>
            )}
            <p className="text-sm mt-2">
              <strong>Your Answer:</strong> {String(r.userAnswer)} <br />
              <strong>Correct Answer:</strong> {String(r.answer)}
            </p>
            <p className="text-xs text-gray-300 mt-1"><strong>Rationale:</strong> {r.rationale}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-purple-600 px-6 py-2 rounded-xl hover:bg-purple-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
