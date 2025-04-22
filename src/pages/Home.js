import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/toffee-logo.png";
import { useAuth } from "../context/AuthContext";
import { getUserStatsThisWeek } from "../services/firestoreService";
import StreakTracker from "../components/StreakTracker";

export default function Home() {
  const { currentUser } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (currentUser) {
        const stats = await getUserStatsThisWeek(currentUser.uid);
        setWeeklyStats(stats);
      }
    };
    load();
  }, [currentUser]);

  return (
      <div
          className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-black to-gray-900 text-white text-center">
          <img src={logo} alt="Toffee" className="w-20 mb-4"/>
          <h1 className="text-4xl font-bold text-purple-500 mb-2">toffee</h1>
          <h4 className="text-2xl font-bold text-white-250 mb-2">make information stick.</h4>
          <p className="text-gray-400 max-w-xl mb-6">
              Generate AI-powered quizzes from your study materials. Practice smarter with MCQ and True/False modes.
              Track your stats. Master anything.
          </p>

          {!currentUser && (
              <div className="space-x-4">
                  <Link to="/register" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">Get
                      Started</Link>
                  <Link to="/login" className="px-4 py-2 border border-purple-500 rounded">Log In</Link>
              </div>
          )}

          {currentUser && weeklyStats && (
              <div
                  className="bg-gray-800/60 border border-purple-700 rounded-2xl p-6 mt-6 shadow-md backdrop-blur w-full max-w-md text-left">
                  <h2 className="text-xl font-semibold text-purple-300 mb-3">📆 Your Weekly Progress</h2>
                  <ul className="text-sm space-y-2">
                      <li>📝 Documents Added: <span className="text-white font-medium">{weeklyStats.docs}</span></li>
                      <li>🧪 Quizzes Taken: <span className="text-white font-medium">{weeklyStats.quizzes}</span></li>
                      <li>🎯 Accuracy: <span className="text-white font-medium">{weeklyStats.accuracy}%</span></li>
                  </ul>
                  <StreakTracker streak={weeklyStats.streak}/>
              </div>
          )}
      </div>
  );
}
