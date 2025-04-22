import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import DocumentUploader from "../components/DocumentUploader";
import DocumentCard from "../components/DocumentCard";
import { getUserDocuments } from "../services/firestoreService";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadDocuments();
    }
  }, [currentUser]);

  const loadDocuments = async () => {
    if (!currentUser) return;
    const docs = await getUserDocuments(currentUser.uid);
    setDocuments(docs);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-black to-gray-900">
      <h1 className="text-4xl font-bold text-purple-300 mb-6 tracking-tight">📚 Your Study Vault</h1>

      <div className="bg-gray-800/60 border border-purple-700 rounded-2xl p-6 shadow-lg backdrop-blur-md">
        <DocumentUploader onDocumentCreated={loadDocuments} />
      </div>

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            title={doc.text.substring(0, 60) + "..."}
            createdAt={new Date(doc.createdAt.seconds * 1000).toLocaleString()}
            onTakeMCQ={() => navigate("/quiz/mcq", { state: { docId: doc.id, type: "mcq" } })}
            onTakeTF={() => navigate("/quiz/tf", { state: { docId: doc.id, type: "tf" } })}
          />
        ))}
      </div>
    </div>
  );
}
