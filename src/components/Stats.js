import React, { useEffect, useState } from "react";
import { getUserStats } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";

export default function Stats() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ mcq: {}, tf: {} });

  useEffect(() => {
    if (currentUser) {
      getUserStats(currentUser.uid).then(setStats);
    }
  }, [currentUser]);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <h2 className="text-3xl font-bold text-purple-400 mb-6">📊 Your Quiz Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {["mcq", "tf"].map((type) => (
          <div key={type} className="bg-gray-800/80 border border-purple-700 rounded-2xl p-6 shadow-md backdrop-blur">
            <h3 className="text-xl font-semibold text-purple-300 mb-2 capitalize">{type} quizzes</h3>
            <p>Total Answered: <span className="font-medium">{stats[type]?.total || 0}</span></p>
            <p>Correct: <span className="font-medium text-green-300">{stats[type]?.correct || 0}</span></p>
            <p>Accuracy: <span className="font-medium text-yellow-300">{stats[type]?.percentage || 0}%</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}
