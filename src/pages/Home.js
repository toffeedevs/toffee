import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/toffee-logo.png";
import { useAuth } from "../context/AuthContext";
import { getUserStatsThisWeek } from "../services/firestoreService";

export default function Home() {
  const { currentUser } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState(null);

  useEffect(() => {
    async function load() {
      if (currentUser) {
        const stats = await getUserStatsThisWeek(currentUser.uid);
        setWeeklyStats(stats);
      }
    }
    load();
  }, [currentUser]);

  // First letters for Mon–Sun
  const dayInitials = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-black to-gray-900 text-white text-center">
      {/* Logo & Header */}
      <img src={logo} alt="Toffee" className="w-20 mb-4" />
      <h1 className="text-4xl font-bold text-purple-500 mb-2">toffee</h1>
      <h4 className="text-2xl font-bold text-gray-300 mb-2">make information stick.</h4>
      <p className="text-gray-400 max-w-xl mb-6">
        Generate AI-powered quizzes from your study materials. Practice smarter with MCQ,
        True/False, and Fill-in-the-Blank modes. Track your stats. Master anything.
      </p>

      {/* Logged-out CTA */}
      {!currentUser && (
        <div className="space-x-4">
          <Link
            to="/register"
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 border border-purple-500 rounded hover:bg-purple-800 transition"
          >
            Log In
          </Link>
        </div>
      )}

      {/* Logged-in Dashboard */}
      {currentUser && weeklyStats && (
        <div className="bg-gray-800/60 border border-purple-700 rounded-2xl p-6 mt-6 shadow-md backdrop-blur w-full max-w-md text-left">
          {/* Weekly summary */}
          <h2 className="text-xl font-semibold text-purple-300 mb-3">📆 Your Weekly Progress</h2>
          <ul className="text-sm space-y-2 mb-4">
            <li>📝 Documents Added: <span className="text-white font-medium">{weeklyStats.docs}</span></li>
            <li>🧪 Quizzes Taken: <span className="text-white font-medium">{weeklyStats.quizzes}</span></li>
            <li>🎯 Accuracy: <span className="text-white font-medium">{weeklyStats.accuracy}%</span></li>
          </ul>

          {/* Streak tracker */}
          {/* Weekly activity circles */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">🔥 Weekly Activity</h3>
            <div className="flex space-x-2">
              {weeklyStats.streak.map((active, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    active ? "bg-purple-500" : "bg-gray-700"
                  }`}
                >
                  <span className="text-sm font-semibold text-white">
                    {dayInitials[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}