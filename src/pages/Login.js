import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed.");
    }
  };

  return (
    <div className="flex justify-center mt-20 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded shadow w-96 space-y-4">
        <h2 className="text-xl font-bold text-purple-500">Login to Toffee</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-black border border-purple-500 rounded" required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 bg-black border border-purple-500 rounded" required />
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 rounded p-2">Login</button>
      </form>
    </div>
  );
}
