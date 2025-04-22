import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/toffee-logo.png";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-black border-b border-purple-700 p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src={logo} alt="Toffee Logo" className="w-6 h-6" />
        <Link to="/" className="text-purple-500 font-bold text-xl">Toffee</Link>
      </div>
      <div className="flex gap-4 text-white">
        {currentUser && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/stats">Stats</Link>
            <button onClick={handleLogout} className="text-red-400">Logout</button>
          </>
        )}
        {!currentUser && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="border border-purple-500 px-2 py-1 rounded">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
