import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/toffee-logo.png";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4 text-white">
      <img src={logo} alt="Toffee" className="w-20 mb-4" />
      <h1 className="text-4xl font-bold text-purple-500 mb-2">Welcome to Toffee</h1>
      <p className="text-gray-400 max-w-xl mb-6">
        Generate AI-powered quizzes from your study materials. Practice smarter with MCQ and True/False modes. Track your stats. Master anything.
      </p>
      <div className="space-x-4">
        <Link to="/register" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">Get Started</Link>
        <Link to="/login" className="px-4 py-2 border border-purple-500 rounded">Log In</Link>
      </div>
    </div>
  );
}
