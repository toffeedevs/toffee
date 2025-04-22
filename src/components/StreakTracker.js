import React from "react";

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

export default function StreakTracker({ streak }) {
  const todayIndex = new Date().getDay();
  const labels = Array.from({ length: 7 }, (_, i) =>
    dayLabels[(todayIndex - 6 + i + 7) % 7]
  );

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-300 mb-2">🔥 Weekly Streak</h3>
      <div className="flex gap-2 justify-center">
        {streak.map((active, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              active ? "bg-purple-500 text-white" : "bg-gray-700 text-gray-400"
            }`}
          >
            {labels[i]}
          </div>
        ))}
      </div>
    </div>
  );
}
