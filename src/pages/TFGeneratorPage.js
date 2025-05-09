import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";

export default function TFGeneratorPage() {
    const {state} = useLocation(); // { docId, docText }
    const navigate = useNavigate();
    const [focusAreas, setFocusAreas] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [sampleQuestions, setSampleQuestions] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Ensure docText is a string, clean problematic characters, and flatten to paragraph
            const safeDocText = String(state.docText)
                .replace(/\u0000/g, "")                                // remove null characters
                .replace(/[\u0001-\u001F\u007F]/g, " ")               // replace control chars with space
                .replace(/\s+/g, " ")                                 // collapse multiple spaces/newlines to single space
                .trim();                                              // remove leading/trailing spaces

            const payload = {
                source_document: safeDocText,
                focus_areas: focusAreas.split(",").map(s => s.trim()),
                sample_questions: sampleQuestions
                    ? sampleQuestions.split(";").map(s => s.trim())
                    : [],
                difficulty
            };

            const res = await axios.post("https://nougat-omega.vercel.app/nougat/tftext", payload, {
                headers: {"Content-Type": "application/json"}
            });

            navigate("/quiz/tf", {
                state: {
                    type: "tf",
                    questions: res.data.questions
                }
            });
        } catch (err) {
            alert("Failed to generate True/False questions.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div
            className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
            <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
                <h1 className="text-2xl font-bold text-purple-400 mb-4">Configure True/False Generation</h1>
                <div className="mb-3">
                    <label className="block text-sm mb-1">Areas of Focus (comma-separated)</label>
                    <input
                        type="text"
                        value={focusAreas}
                        onChange={(e) => setFocusAreas(e.target.value)}
                        className="w-full p-2 bg-black border border-purple-600 rounded"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-sm mb-1">Difficulty</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full p-2 bg-black border border-purple-600 rounded"
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="block text-sm mb-1">Optional Sample Questions (semicolon-separated)</label>
                    <textarea
                        value={sampleQuestions}
                        onChange={(e) => setSampleQuestions(e.target.value)}
                        className="w-full p-2 bg-black border border-purple-600 rounded"
                    />
                </div>
                <div className="flex justify-between gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-700 rounded"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
                    >
                        {loading ? "Generating..." : "Generate T/F"}
                    </button>
                </div>
            </div>
        </div>
    );
}
