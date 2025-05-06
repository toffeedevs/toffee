import React from "react";
import StreakTracker from "./StreakTracker";

export default function WeeklyProgressBox({ stats }) {
  if (!stats) return null;

  return (
    <div className="bg-gray-900 border border-purple-700 rounded-2xl p-6 text-white w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-purple-300 mb-3">📅 Your Weekly Progress</h2>
      <div className="space-y-1 text-sm text-gray-300 mb-4">
        <p>📝 <span className="text-white">Documents Added:</span> {stats.docs}</p>
        <p>🧪 <span className="text-white">Quizzes Taken:</span> {stats.quizzes}</p>
        <p>🎯 <span className="text-white">Accuracy:</span> {stats.accuracy}%</p>
      </div>

      <StreakTracker streak={stats.streak} />

      <h3 className="text-md font-semibold mt-4 text-purple-300">🔥 Weekly Activity</h3>
      <div className="flex gap-3 mt-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              stats.streak?.[i] ? "bg-purple-500 text-white" : "bg-gray-700 text-gray-400"
            }`}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
