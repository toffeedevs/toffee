import React, { useState } from "react";

export default function QuestionRenderer({ questions }) {
  return (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <QuestionCard key={idx} q={q} />
      ))}
    </div>
  );
}

function QuestionCard({ q }) {
  const [selected, setSelected] = useState(null);
  const isCorrect = selected === q.answer;

  return (
    <div className="bg-gray-800 p-4 rounded shadow">
      <p className="text-lg font-semibold">{q.question}</p>
      {q.choices ? (
        <div className="space-y-2 mt-2">
          {q.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => setSelected(choice)}
              className={`block w-full text-left p-2 rounded ${selected === choice ? (isCorrect ? 'bg-green-600' : 'bg-red-600') : 'bg-black border border-purple-500'}`}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-x-2 mt-2">
          <button onClick={() => setSelected(true)} className="bg-black border border-purple-500 px-4 py-1 rounded">True</button>
          <button onClick={() => setSelected(false)} className="bg-black border border-purple-500 px-4 py-1 rounded">False</button>
        </div>
      )}
      {selected !== null && <p className="mt-2 text-sm text-gray-300">Explanation: {q.rationale}</p>}
    </div>
  );
}
