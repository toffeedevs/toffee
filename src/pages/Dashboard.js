// src/pages/Dashboard.js
import React, {useEffect, useState} from "react";
import {useAuth} from "../context/AuthContext";
import DocumentUploader from "../components/DocumentUploader";
import DocumentCard from "../components/DocumentCard";
import {deleteDocument, getUserDocuments, shareToMarketplace} from "../services/firestoreService";
import {useNavigate} from "react-router-dom";


export default function Dashboard() {
    const {currentUser} = useAuth();
    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) loadDocuments();
    }, [currentUser]);

    const loadDocuments = async () => {
        const docs = await getUserDocuments(currentUser.uid);
        setDocuments(docs);
    };

    const handleDelete = async (docId) => {
        await deleteDocument(currentUser.uid, docId);
        loadDocuments();
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-purple-400 mb-6">📂 Your Documents</h1>

            <DocumentUploader onDocumentCreated={loadDocuments}/>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {documents.map((doc) => (
                    <DocumentCard
                        key={doc.id}
                        doc={doc}
                        onTakeMCQ={() =>
                            navigate("/quiz/mcq", {state: {docId: doc.id, type: "mcq", text: doc.text}})
                        }
                        onTakeTF={() =>
                            navigate("/quiz/tf", {state: {docId: doc.id, type: "tf", text: doc.text}})
                        }
                        onTakeFITB={() =>
                            navigate("/quiz/fitb", {state: {docId: doc.id, type: "fitb", text: doc.text}})
                        }
                        onReviewFlashcards={() =>
                            navigate("/flashcards", {state: {docId: doc.id, text: doc.text}})
                        }
                        onStartFeynman={() =>
                            navigate("/feynman", {state: {docId: doc.id, text: doc.text}})
                        }
                        onDeleted={() => handleDelete(doc.id)}
                        onShare={async () => {
                            try {
                                const tagInput = prompt("Enter comma-separated tags (e.g., biology, enzymes)");
                                if (tagInput === null) return;
                                const tags = tagInput
                                    .split(",")
                                    .map((t) => t.trim().toLowerCase())
                                    .filter((t) => t.length > 0);

                                await shareToMarketplace(currentUser.uid, doc, tags);
                                alert("📤 Shared to marketplace!");
                            } catch (err) {
                                console.error("Share error:", err);
                                if (err.message.includes("Already shared")) {
                                    alert("⚠️ You’ve already shared this document.");
                                } else {
                                    alert("Failed to share document.");
                                }
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
