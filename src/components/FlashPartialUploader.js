import React, {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import axios from "axios";
import {saveDocument} from "../services/firestoreService";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

export default function FlashPartialUploader() {
    const {currentUser} = useAuth();
    const navigate = useNavigate();

    const [fileName, setFileName] = useState("");
    const [text, setText] = useState("");
    const [selectedText, setSelectedText] = useState("");
    const [pdfBuffer, setPdfBuffer] = useState(null);
    const [mode, setMode] = useState("upload");
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    const cleanText = (input) =>
        String(input).replace(/\u0000/g, "").replace(/[\u0001-\u001F\u007F]/g, " ");

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        if (file.type === "text/plain") {
            reader.onload = (ev) => {
                setText(cleanText(ev.target.result));
                setPdfBuffer(null);
                setMode("highlight");
            };
            reader.readAsText(file);
        } else if (file.type === "application/pdf") {
            reader.onload = async (ev) => {
                const buffer = ev.target.result;
                const copiedBuffer = buffer.slice(0);
                setPdfBuffer(copiedBuffer);
                setMode("highlight");
                await extractTextFromPDF(buffer);
                await renderPDF(copiedBuffer);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Only .txt and .pdf files are supported.");
        }
    };

    const extractTextFromPDF = async (arrayBuffer) => {
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(" ");
            fullText += pageText + "\n\n";
        }

        setText(cleanText(fullText));
    };

    const renderPDF = async (arrayBuffer) => {
        const container = containerRef.current;
        container.innerHTML = "";

        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const containerWidth = container.clientWidth || 800;
            const viewport = page.getViewport({scale: containerWidth / page.getViewport({scale: 1}).width});

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({canvasContext: context, viewport}).promise;

            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.appendChild(canvas);

            const textLayerDiv = document.createElement("div");
            textLayerDiv.className = "textLayer";
            textLayerDiv.style.position = "absolute";
            textLayerDiv.style.top = 0;
            textLayerDiv.style.left = 0;
            textLayerDiv.style.height = `${viewport.height}px`;
            textLayerDiv.style.width = `${viewport.width}px`;
            wrapper.appendChild(textLayerDiv);

            container.appendChild(wrapper);

            const textContent = await page.getTextContent();
            const textItems = textContent.items;
            const textDivs = [];

            textItems.forEach((item) => {
                const span = document.createElement("span");
                span.textContent = item.str;

                const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
                const [fontHeightPx, x, y] = [Math.abs(transform[3]), transform[4], transform[5]];

                span.style.position = "absolute";
                span.style.left = `${x}px`;
                span.style.top = `${y - fontHeightPx}px`;
                span.style.fontSize = `${fontHeightPx}px`;
                span.style.fontFamily = item.fontName;
                span.className = "textLayerItem";

                textLayerDiv.appendChild(span);
                textDivs.push(span);
            });

            // Highlight selection
            textLayerDiv.addEventListener("mouseup", () => {
                const selection = window.getSelection();
                const selectedStr = selection.toString().trim();
                if (!selectedStr) return;

                const range = selection.getRangeAt(0);
                const contents = range.cloneContents();
                const spans = Array.from(contents.querySelectorAll("span"));

                spans.forEach((span) => {
                    const match = Array.from(textLayerDiv.querySelectorAll("span")).find(
                        (el) => el.textContent === span.textContent && !el.classList.contains("highlighted")
                    );
                    if (match) match.classList.add("highlighted");
                });

                selection.removeAllRanges();
                setSelectedText((prev) => `${prev}\n\n${selectedStr}`);
            });
        }
    };

    const handleSubmit = async () => {
        if (!selectedText.trim()) {
            alert("Please highlight and select some text before continuing.");
            return;
        }

        if (!currentUser) {
            alert("You must be logged in.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "google/gemini-2.0-flash-lite-001",
                    messages: [
                        {
                            role: "user",
                            content: `Summarize this text in one line for a flashcard deck title:\n\n${selectedText}`,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const summary = res.data.choices[0].message.content.trim();
            await saveDocument(currentUser.uid, selectedText, summary);
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to save:", err);
            alert("Error saving selection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-purple-400 mb-6">✂️ Flash Partial Upload</h1>

            {mode === "upload" && (
                <div className="bg-gray-800 p-6 rounded-xl max-w-2xl mx-auto">
                    <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="mb-4"/>
                    <p className="text-sm text-gray-400">
                        Upload a <code>.txt</code> or <code>.pdf</code> file to get started.
                    </p>
                </div>
            )}

            {mode === "highlight" && (
                <>
                    <div className="bg-gray-900 border border-purple-600 p-4 rounded-xl max-w-4xl mx-auto">
                        <h2 className="text-xl font-semibold text-purple-300 mb-2">📄 {fileName}</h2>

                        {pdfBuffer ? (
                            <div
                                ref={containerRef}
                                className="bg-black rounded border border-gray-700 p-2 max-h-[80vh] overflow-y-scroll"
                            />
                        ) : (
                            <div
                                onMouseUp={() =>
                                    setSelectedText(window.getSelection().toString().trim())
                                }
                                className="h-96 overflow-y-scroll whitespace-pre-wrap bg-black border border-gray-700 p-4 rounded text-sm text-white selection:bg-purple-600 selection:text-white"
                            >
                                {text}
                            </div>
                        )}
                    </div>

                    <div className="max-w-4xl mx-auto mt-6">
                        <h3 className="text-lg text-gray-300 mb-2">✅ Selected Text:</h3>
                        <textarea
                            className="w-full p-3 rounded bg-gray-800 border border-purple-600 text-white"
                            rows={6}
                            value={selectedText}
                            onChange={(e) => setSelectedText(e.target.value)}
                            placeholder="Selected text will appear here..."
                        />
                    </div>

                    <div className="flex justify-between max-w-4xl mx-auto mt-4">
                        <button
                            onClick={() => {
                                setPdfBuffer(null);
                                setText("");
                                setSelectedText("");
                                setFileName("");
                                setMode("upload");
                            }}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            ← Start Over
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded"
                        >
                            {loading ? "Saving..." : "Save Partial Selection"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
