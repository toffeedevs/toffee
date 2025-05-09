import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function Navbar() {
    const {currentUser, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <nav className="bg-black border-b border-purple-700 px-6 py-4 flex justify-between items-center">
            <div className="text-purple-500 font-bold text-xl tracking-wide">
                <Link to="/">toffee</Link>
            </div>
            <div className="flex gap-6 text-sm text-white">
                {currentUser && (
                    <>
                        <Link to="/dashboard" className="hover:text-purple-300">Dashboard</Link>
                        <Link to="/marketplace" className="hover:text-purple-300">Marketplace</Link>
                        <Link to="/profile" className="hover:text-purple-300">Profile</Link>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
                    </>
                )}
                {!currentUser && (
                    <>
                        <Link to="/login" className="hover:text-purple-300">Login</Link>
                        <Link to="/register" className="hover:text-purple-300">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
