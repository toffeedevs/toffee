// src/pages/Marketplace.js
import React, { useEffect, useState } from "react";
import { getMarketplaceDocs, importMarketplaceDoc } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";

export default function Marketplace() {
  const { currentUser } = useAuth();
  const [marketplaceDocs, setMarketplaceDocs] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState(null);

  useEffect(() => {
    loadDocs();
  }, [selectedTag]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs = await getMarketplaceDocs(selectedTag);
      setMarketplaceDocs(docs);
      extractTags(docs);
    } catch (err) {
      console.error("Error loading marketplace documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractTags = (docs) => {
    const allTags = docs.flatMap((doc) => doc.tags || []);
    const unique = [...new Set(allTags)];
    setTags(unique);
  };

  const handleImport = async (docId) => {
    if (!currentUser) return;

    try {
      setImportingId(docId);
      await importMarketplaceDoc(currentUser.uid, docId);
      alert("📥 Document imported to your dashboard!");
    } catch (err) {
      console.error("Import error:", err);
      if (err.message.includes("Already imported")) {
        alert("⚠️ You already have this document.");
      } else {
        alert("❌ Failed to import document.");
      }
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <h1 className="text-3xl font-bold text-purple-400 mb-4">🌐 Explore Marketplace</h1>

      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full border ${
              selectedTag === null ? "bg-purple-600" : "bg-gray-700"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full border ${
                selectedTag === tag ? "bg-purple-600" : "bg-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading shared documents...</p>
      ) : marketplaceDocs.length === 0 ? (
        <p className="text-gray-500">No documents found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaceDocs.map((doc) => (
            <div key={doc.id} className="bg-gray-800 border border-purple-600 rounded-xl p-5 shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-white">
                {doc.summary || "Untitled Document"}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Shared by: <span className="text-purple-300">{doc.sharedBy}</span>
              </p>

              {doc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  {doc.tags.map((t) => (
                    <span key={t} className="bg-purple-700 text-white px-2 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleImport(doc.id)}
                disabled={importingId === doc.id}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition"
              >
                {importingId === doc.id ? "Importing..." : "📥 Import"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
