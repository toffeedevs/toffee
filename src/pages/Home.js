import React from "react";
import logo from "../assets/toffee-logo.png"; // You can rename the uploaded logo
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-white h-[80vh] px-6 text-center">
      <img src={logo} alt="Toffee Logo" className="w-20 mb-4" />
      <h1 className="text-4xl font-bold text-purple-500">Welcome to Toffee</h1>
      <p className="text-gray-400 mt-2 max-w-xl">AI-generated questions from any text. Practice smarter, retain longer. Built by med students, trivia nerds, and GenAI fanatics.</p>
      <div className="mt-6 space-x-4">
        <Link to="/register" className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">Get Started</Link>
        <Link to="/login" className="px-4 py-2 border border-purple-500 rounded">Log In</Link>
      </div>
    </div>
  );
}
