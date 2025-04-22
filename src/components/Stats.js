import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserStats } from "../services/firestoreService";

export default function Stats() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ total: 0, correct: 0, percentage: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getUserStats(currentUser.uid);
      setStats(data);
    };
    if (currentUser) fetchStats();
  }, [currentUser]);

  return (
    <div className="mt-10 text-white text-center">
      <h2 className="text-xl font-bold mb-2">Your Stats</h2>
      <p>Total Questions Answered: {stats.total}</p>
      <p>Correct: {stats.correct}</p>
      <p>Accuracy: {stats.percentage}%</p>
    </div>
  );
}
