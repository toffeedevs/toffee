import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/toffee-logo.png";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { currentUser } = useAuth();
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
    </div>
  );
}