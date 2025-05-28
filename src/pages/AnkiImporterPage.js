import React, {useState} from "react";
import {put} from "@vercel/blob";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {saveDocument} from "../services/firestoreService";
import LoadingOverlay from "../components/LoadingOverlay";

export default function AnkiImporterPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const {currentUser} = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected?.name.endsWith(".apkg")) {
            setFile(selected);
        } else {
            alert("Please select a valid .apkg file.");
        }
    };

    const handleImport = async () => {
        if (!file || !currentUser) return;
        setLoading(true);

        try {
            const blobPath = `anki/${file.name}`;
            const blobUrl = `https://blob.vercel-storage.com/${blobPath}`;
            let url = blobUrl;

            // Step 1: Check if file exists in Vercel Blob
            const headRes = await fetch(blobUrl, {method: "HEAD"});

            if (headRes.status === 404) {
                // Step 2: Upload to Blob if it doesn't exist
                const result = await put(blobPath, file, {
                    access: "public",
                    token: "vercel_blob_rw_fyzWGRnpnhJh1e7A_phoY7wFbFYvjfE2ipCoh7VwHvET840",
                });
                url = result.url;
                console.log("✅ Uploaded new file:", url);
            } else if (headRes.ok) {
                console.log("📦 Using existing blob:", url);
            } else {
                throw new Error(`Blob check failed with status ${headRes.status}`);
            }

            // Step 3: Save document to Firestore
            const summary = `Anki Deck: ${file.name.replace(".apkg", "")}`;
            await saveDocument(currentUser.uid, url, `Anki Deck: ${file.name}`, {
                isAnki: true,
                ankiUrl: url,
            });


            alert("✅ Anki deck imported successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Anki upload failed:", err);
            alert("Anki import failed. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
            {loading && <LoadingOverlay message="Importing Anki Deck..."/>}
            <h1 className="text-2xl text-purple-400 mb-6">📥 Import Anki Deck (.apkg)</h1>

            <input
                type="file"
                accept=".apkg"
                onChange={handleFileChange}
                className="mb-4 text-sm text-gray-300"
            />
            <button
                onClick={handleImport}
                disabled={!file || loading}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded disabled:opacity-50"
            >
                {loading ? "Uploading..." : "Upload & Save"}
            </button>
        </div>
    );
}
