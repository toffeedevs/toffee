import React, {useState} from "react";
import axios from "axios";
import {useAuth} from "../context/AuthContext";
import {saveDocument} from "../services/firestoreService";
import * as pdfjsLib from "pdfjs-dist";
import {GlobalWorkerOptions} from "pdfjs-dist/build/pdf";

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

export default function DocumentUploader({onDocumentCreated}) {
    const {currentUser} = useAuth();
    const [mode, setMode] = useState(null); // "text" | "file" | "youtube"
    const [text, setText] = useState("");
    const [fileName, setFileName] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");

    const handleFile = async (file) => {
        setFileName(file.name);
        const reader = new FileReader();

        if (file.type === "text/plain") {
            reader.onload = (e) => setText(e.target.result);
            reader.readAsText(file);
        } else if (file.type === "application/pdf") {
            reader.onload = async (e) => {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument({data: typedarray}).promise;
                let fullText = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map((item) => item.str).join(" ");
                    fullText += strings + "\n\n";
                }
                setText(fullText);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Unsupported file type. Please upload a .txt or .pdf file.");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleManualUpload = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const generateSummary = async () => {
        const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemini-2.0-flash-lite-001",
            messages: [
                {role: "user", content: `Summarize this text in one line for a flashcard deck title:\n\n${text}`}
            ]
        }, {
            headers: {
                Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return res.data.choices[0].message.content.trim();
    };

    const generateQuestions = async () => {
        if (!text.trim()) return alert("Text is empty!");
        setLoading(true);

        const title = await generateSummary();

        const [tfRes, mcqRes, fitbRes] = await Promise.all([
            axios.post("https://nougat-omega.vercel.app/nougat/tftext", {text}),
            axios.post("https://nougat-omega.vercel.app/nougat/mcqtext", {text}),
            axios.post("https://nougat-omega.vercel.app/nougat/fitb", {text})
        ]);

        const docId = await saveDocument(
            currentUser.uid,
            text,
            tfRes.data.questions,
            mcqRes.data.questions,
            fitbRes.data.questions,
            title
        );

        setLoading(false);
        setText("");
        setFileName("");
        setYoutubeUrl("");
        setMode(null);
        onDocumentCreated(docId);
    };

    return (
        <div className="space-y-6">
            {/* Mode Selection */}
            {!mode && (
                <div className="flex gap-4 flex-wrap">
                    <button onClick={() => setMode("text")}
                            className="bg-purple-700 text-white px-6 py-3 rounded-xl w-full hover:bg-purple-800">🔤 Paste
                        Text
                    </button>
                    <button onClick={() => setMode("file")}
                            className="bg-purple-700 text-white px-6 py-3 rounded-xl w-full hover:bg-purple-800">📎
                        Upload File
                    </button>
                    <button onClick={() => setMode("youtube")}
                            className="bg-purple-700 text-white px-6 py-3 rounded-xl w-full hover:bg-purple-800">🎥
                        YouTube Link
                    </button>
                </div>
            )}

            {/* Text Paste Mode */}
            {mode === "text" && (
                <>
          <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-black border border-purple-600 p-4 rounded-xl text-sm placeholder:text-gray-400"
              placeholder="Paste study content here..."
          />
                    <div className="flex gap-4">
                        <button onClick={generateQuestions} disabled={loading}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl">
                            {loading ? "Generating..." : "Generate Questions"}
                        </button>
                        <button onClick={() => {
                            setMode(null);
                            setText("");
                        }} className="text-sm text-gray-400 underline">← Back
                        </button>
                    </div>
                </>
            )}

            {/* File Upload Mode */}
            {mode === "file" && (
                <>
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`w-full p-6 text-center border-2 border-dashed rounded-xl transition-all ${isDragging ? "border-purple-400 bg-gray-800" : "border-gray-500 bg-black"}`}
                    >
                        <p className="text-sm text-gray-300 mb-2">📎 Drag and drop
                            a <code>.txt</code> or <code>.pdf</code> file here, or select one:</p>
                        <input type="file" accept=".txt,.pdf" onChange={handleManualUpload}
                               className="mx-auto block text-white file:mr-4 file:px-4 file:py-2 file:rounded file:border-0 file:bg-purple-600 hover:file:bg-purple-700"/>
                        {fileName && <p className="mt-2 text-xs text-purple-400">Uploaded: {fileName}</p>}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={generateQuestions} disabled={loading}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl">{loading ? "Generating..." : "Generate Questions"}</button>
                        <button onClick={() => {
                            setMode(null);
                            setText("");
                            setFileName("");
                        }} className="text-sm text-gray-400 underline">← Back
                        </button>
                    </div>
                </>
            )}

            {/* YouTube Link Mode */}
            {mode === "youtube" && (
                <>
                    <input
                        type="text"
                        placeholder="Paste YouTube video URL"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-black border border-purple-600 p-4 rounded-xl text-sm placeholder:text-gray-400 text-white"
                    />
                    <div className="flex gap-4">
                        <button
                            disabled={loading}
                            onClick={async () => {
                                setLoading(true);
                                setError("");
                                try {
                                    const res = await axios.post("https://nougat-omega.vercel.app/nougat/transcriptify", {
                                        text: youtubeUrl
                                    });
                                    setText(res.data.transcript);
                                    setMode("text"); // Reuse text entry flow
                                } catch (err) {
                                    setError("Could not extract transcript. Please ensure the video has captions.");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl"
                        >
                            {loading ? "Fetching..." : "Fetch Transcript"}
                        </button>
                        <button onClick={() => {
                            setMode(null);
                            setYoutubeUrl("");
                        }} className="text-sm text-gray-400 underline">← Back
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </>
            )}
        </div>
    );
}