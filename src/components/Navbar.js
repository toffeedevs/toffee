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
      <Link to="/" className="flex items-center gap-2 text-purple-500 font-bold text-xl">
        <img src={logo} className="w-6" />
        Toffee
      </Link>
      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} className="text-red-500">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="border border-purple-500 px-2 py-1 rounded">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
