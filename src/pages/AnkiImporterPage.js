import React, { useState } from "react";
import { put } from "@vercel/blob";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { saveDocument } from "../services/firestoreService";
import axios from "axios";
import LoadingOverlay from "../components/LoadingOverlay";

export default function AnkiImporterPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
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
      // Step 1: Upload to Vercel Blob
      const { url } = await put(`anki/${file.name}`, file, { access: "public", token: "vercel_blob_rw_fyzWGRnpnhJh1e7A_phoY7wFbFYvjfE2ipCoh7VwHvET840" });

      // Step 2: Call backend to convert Anki
      const res = await axios.post("https://nougat-omega.vercel.app/nougat/import-anki", { url });
      const cards = res.data.cards || [];

      if (cards.length === 0) {
        alert("No cards found in Anki file.");
        return;
      }

      // Step 3: Convert cards into plain text
      const text = cards
        .map(card => `Q: ${card.front}\nA: ${card.back}`)
        .join("\n\n");

      const summary = `Imported ${cards.length} flashcards from Anki.`;

      // Step 4: Save document to Firestore (text-only)
      const docId = await saveDocument(currentUser.uid, text, summary);

      // Step 5: Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Anki import failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      {loading && <LoadingOverlay message="Importing Anki Deck..." />}
      <h1 className="text-2xl text-purple-400 mb-6">📥 Import Anki Deck (.apkg)</h1>

      <input type="file" accept=".apkg" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleImport}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded disabled:opacity-50"
        disabled={!file || loading}
      >
        Upload & Convert
      </button>
    </div>
  );
}
