// src/components/DocumentCard.js

import React from "react";
import { deleteDocument } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";

export default function DocumentCard({
  doc = {},
  onTakeMCQ = () => {},
  onTakeTF = () => {},
  onTakeFITB = () => {},
  onDeleted = () => {},
}) {
  const { currentUser } = useAuth();

  const handleDelete = async () => {
    try {
      if (!doc?.id || !currentUser?.uid) return;
      await deleteDocument(currentUser.uid, doc.id);
      onDeleted(doc.id); // ✅ triggers refresh in parent
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const createdAt = doc?.createdAt?.toDate?.()?.toLocaleString?.() || "Unknown";

  return (
    <div className="bg-zinc-900 p-4 rounded-xl mb-4 relative">
      <div className="absolute top-2 right-2">
        <button onClick={handleDelete} className="text-red-400 hover:text-red-500">✖</button>
      </div>

      <h2 className="text-lg font-semibold mb-1 text-purple-300">
        {doc?.title || "Untitled"}
      </h2>
      <p className="text-xs text-gray-500">Uploaded: {createdAt}</p>

      <div className="mt-3 flex gap-2">
        <button onClick={onTakeMCQ} className="text-sm bg-purple-700 px-3 py-1 rounded">📚 MCQ</button>
        <button onClick={onTakeTF} className="text-sm bg-purple-700 px-3 py-1 rounded">✅ True/False</button>
        <button onClick={onTakeFITB} className="text-sm bg-purple-700 px-3 py-1 rounded">✍️ Fill in the Blank</button>
      </div>
    </div>
  );
}
