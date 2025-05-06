// src/pages/Profile.js
import React, {useEffect, useState} from "react";
import {useAuth} from "../context/AuthContext";
import {getUserProfile, getUserStats, getUserStatsThisWeek, updateUserProfile,} from "../services/firestoreService";
import StreakTracker from "../components/StreakTracker";
import WeeklyProgressBox from "../components/WeeklyProgressBox";

export default function Profile() {
    const {currentUser} = useAuth();
    const [username, setUsername] = useState("");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState(null);
    const [weekStats, setWeekStats] = useState(null);

    useEffect(() => {
        if (currentUser) {
            loadProfile();
            loadStats();
        }
    }, [currentUser]);

    const loadProfile = async () => {
        const profile = await getUserProfile(currentUser.uid);
        setUsername(profile.username || "");
    };

    const loadStats = async () => {
        const quizStats = await getUserStats(currentUser.uid);
        const weeklyStats = await getUserStatsThisWeek(currentUser.uid);
        setStats(quizStats);
        setWeekStats(weeklyStats);
    };

    const handleSaveUsername = async () => {
        if (!username.trim()) return;
        setSaving(true);
        await updateUserProfile(currentUser.uid, {username});
        setEditing(false);
        setSaving(false);
    };

    return (
        <div className="p-6 min-h-screen bg-gradient-to-b from-black to-gray-900 text-white max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-purple-400 mb-6">👤 My Profile</h1>

            {/* Username Edit */}
            <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                {editing ? (
                    <div className="flex gap-3">
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-black border border-purple-600 px-4 py-2 rounded text-sm w-full"
                            placeholder="Enter username"
                        />
                        <button
                            onClick={handleSaveUsername}
                            className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <p className="text-lg">{username || "No username set."}</p>
                        <button
                            onClick={() => setEditing(true)}
                            className="text-purple-400 hover:underline text-sm"
                        >
                            ✏️ Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Lifetime Stats */}
            {stats && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">📊 Lifetime Stats</h2>
                    <ul className="text-sm space-y-2">
                        <li>MCQ Quizzes: {stats.mcq.total} (✅ {stats.mcq.correct})</li>
                        <li>TF Quizzes: {stats.tf.total} (✅ {stats.tf.correct})</li>
                        <li>FITB Quizzes: {stats.fitb.total} (✅ {stats.fitb.correct})</li>
                        <li>
                            Flashcards Studied: {stats.flashcardsStudied}
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
