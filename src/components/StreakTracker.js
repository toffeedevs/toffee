import React from "react";

export default function StreakTracker({ streakData = [] }) {
  if (!Array.isArray(streakData)) {
    return <p className="text-red-500 text-sm">Streak data unavailable</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {streakData.map((day, idx) => (
        <div
          key={idx}
          className={`w-4 h-4 rounded ${day?.completed ? "bg-green-400" : "bg-zinc-600"}`}
          title={day?.date || "Unknown"}
        />
      ))}
    </div>
  );
}
