import React, { useState } from "react";
import axios from "axios";

export default function TextUpload({ setQuestions }) {
  const [text, setText] = useState("");
  const [type, setType] = useState("mcq");

  const handleGenerate = async () => {
    const endpoint = type === "mcq" ? "/nougat/mcqtext" : "/nougat/tftext";
    const res = await axios.post(`https://nougat-eight.vercel.app${endpoint}`, {
      text: text
    }, );
    setQuestions(res.data.questions);
  };

  return (
    <div className="bg-gray-900 p-6 rounded text-white space-y-4 mb-6">
      <textarea value={text} onChange={e => setText(e.target.value)} rows={5} className="w-full p-2 bg-black border border-purple-500 rounded" placeholder="Paste your study content here..." />
      <div className="flex justify-between items-center">
        <select onChange={e => setType(e.target.value)} className="bg-black border border-purple-500 rounded p-2 text-white">
          <option value="mcq">MCQ</option>
          <option value="tf">True/False</option>
        </select>
        <button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">Generate</button>
      </div>
    </div>
  );
}
