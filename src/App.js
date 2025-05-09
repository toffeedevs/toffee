import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuizTaker from "./components/QuizTaker";
import FlashcardSession from "./components/FlashcardSession";
import ResultsViewer from "./components/ResultsViewer";
import Stats from "./components/Stats";
import FeynmanSession from "./components/FeynmanSession";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import MCQGeneratorPage from "./pages/MCQGeneratorPage";

import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyAL1dQyCk6bGrKyOAZStLnab9MBxIeAodI",
  authDomain: "toffee-2bdd4.firebaseapp.com",
  projectId: "toffee-2bdd4",
  storageBucket: "toffee-2bdd4.firebasestorage.app",
  messagingSenderId: "254874642056",
  appId: "1:254874642056:web:5683acb4379b81bf22e13d",
  measurementId: "G-F0EEBXC8M3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/quiz/:type" element={user ? <QuizTaker /> : <Navigate to="/login" />} />
          <Route path="/flashcards" element={user ? <FlashcardSession /> : <Navigate to="/login" />} />
          <Route path="/feynman" element={user ? <FeynmanSession /> : <Navigate to="/login" />} />
          <Route path="/results" element={user ? <ResultsViewer /> : <Navigate to="/login" />} />
          <Route path="/marketplace" element={user ? <Marketplace /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/generate/mcq" element={user ? <MCQGeneratorPage /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
