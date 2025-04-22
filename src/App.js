import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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
import ResultsViewer from "./components/ResultsViewer";
import Stats from "./components/Stats";
import './index.css';

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

  if (checking) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/quiz/:type" element={user ? <QuizTaker /> : <Navigate to="/login" />} />
          <Route path="/results" element={user ? <ResultsViewer /> : <Navigate to="/login" />} />
          <Route path="/stats" element={user ? <Stats /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}