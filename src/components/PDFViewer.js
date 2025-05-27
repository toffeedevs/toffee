// src/components/PDFViewer.js
import React, {useEffect, useRef, useState} from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// This is CRUCIAL — set up the PDF worker correctly.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

export default function PDFViewer({file}) {
    const containerRef = useRef(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!file) return;

        const loadPDF = async () => {
            try {
                const pdf = await pdfjsLib.getDocument({data: file}).promise;

                // Clear existing canvas
                const container = containerRef.current;
                container.innerHTML = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const containerWidth = container.clientWidth || 800;
                    const viewport = page.getViewport({scale: containerWidth / page.getViewport({scale: 1}).width});

                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    container.appendChild(canvas);

                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                    }).promise;
                }
            } catch (err) {
                console.error("Error rendering PDF:", err);
                setError("Failed to render PDF file.");
            }
        };

        loadPDF();
    }, [file]);

    return (
        <div className="bg-black p-4 border border-gray-700 rounded text-white">
            {error && <p className="text-red-400">{error}</p>}
            <div ref={containerRef} className="space-y-4"/>
        </div>
    );
}
