import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserDocuments,
  deleteDocument as deleteDocumentById,
  saveMessageToDocument,
  getMessagesForDocument,
  saveDocument,
} from "../services/firestoreService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

export default function CaramelChatPage() {
  const { currentUser } = useAuth();
  const { docId } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const loadDoc = async () => {
      const docs = await getUserDocuments(currentUser.uid);
      const found = docs.find((d) => d.id === docId);
      setDoc(found || null);
    };
    if (currentUser) loadDoc();
  }, [currentUser, docId]);

  useEffect(() => {
    const loadHistory = async () => {
      const docs = await getUserDocuments(currentUser.uid);
      setHistory(docs);
    };
    if (currentUser) loadHistory();
  }, [currentUser]);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessagesForDocument(currentUser.uid, docId);
      setMessages(msgs);
    };
    if (currentUser && docId) loadMessages();
  }, [currentUser, docId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = async () => {
    const newId = await saveDocument(currentUser.uid, "", "New Chat");
    navigate(`/chat/${newId}`);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    await saveMessageToDocument(currentUser.uid, docId, userMsg);
    setInput("");
    setLoading(true);

    const res = await fetch("https://nougat-omega.vercel.app/nougat/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: doc.text, question: input }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";
    const startTime = new Date().toLocaleTimeString();
    const caramelMsg = { sender: "caramel", text: "", time: startTime };
    setMessages((prev) => [...prev, caramelMsg]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      try {
        const parsed = JSON.parse(chunk);
        if (parsed.result) {
          result += parsed.result;
        }
      } catch {
        result += chunk;
      }
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = result;
        return [...updated];
      });
    }

    const finalMessage = { ...caramelMsg, text: result };
    await saveMessageToDocument(currentUser.uid, docId, finalMessage);
    setLoading(false);
  };

  if (!doc) return <div className="text-white p-6">Loading document...</div>;

  return (
    <div className="h-screen w-screen bg-black text-white flex">
      {sidebarOpen && (
        <div className="w-64 bg-black p-4 border-r border-purple-600 overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-4 flex justify-between items-center">
            Chat History
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-sm bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition transform duration-200 hover:scale-105"
            >
              ✕
            </button>
          </h2>
          <button
            onClick={startNewChat}
            className="w-full text-center text-sm bg-purple-600 px-2 py-1 rounded hover:bg-purple-700 transition transform duration-200 hover:scale-105 mb-4"
          >
            + New Chat
          </button>
          <ul className="space-y-2">
            {history.map((session, idx) => (
              <li
                key={idx}
                onClick={() => navigate(`/chat/${session.id}`)}
                className="cursor-pointer hover:text-purple-400 flex justify-between items-center transition duration-200"
              >
                <span className="truncate w-4/5">
                  {session.summary || `Session ${idx + 1}`}
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteDocumentById(currentUser.uid, session.id);
                    setHistory(history.filter((doc) => doc.id !== session.id));
                  }}
                  className="text-red-500 hover:text-red-400 transition"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col flex-1 relative">
        <div className="py-4 flex justify-between items-center px-4">
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-purple-400 hover:underline text-sm transition"
            >
              ← Back
            </button>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700 text-sm transition transform hover:scale-105"
              >
                ☰ History
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-purple-400 text-center flex-1">
            💬 Chat with Caramel
          </h1>
        </div>

        <p className="text-purple-300 text-sm mb-4 text-center">
          Based on: <strong>{doc.summary || "Untitled Document"}</strong>
        </p>

        <div className="flex-1 overflow-y-auto bg-zinc-900 rounded-t-xl px-2 py-4 space-y-4 flex flex-col items-center">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 w-full max-w-2xl ${
                  msg.sender === "user"
                    ? "justify-start flex-row-reverse pr-4"
                    : "justify-end pl-4"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold">
                  {msg.sender === "user" ? "🧑" : "🤖"}
                </div>
                <div
                  className={`whitespace-pre-wrap p-6 text-lg rounded-xl max-w-xl w-fit ${
                    msg.sender === "user"
                      ? "bg-white text-black text-right"
                      : "bg-purple-700 text-white"
                  }`}
                >
                  <ReactMarkdown children={msg.text} remarkPlugins={[remarkGfm]} />
                  <div className="text-xs text-gray-400 text-right mt-1">
                    {msg.sender === "user" ? "You" : "Caramel"} · {msg.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <div className="w-full py-4 flex items-center gap-3 bg-black border-t border-purple-600 px-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Caramel a question..."
            className="flex-1 p-4 rounded-lg bg-black border border-purple-600 text-white placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-white transition transform duration-200 hover:scale-105"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
