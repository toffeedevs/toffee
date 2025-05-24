import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../App";
import { logFlashcardSession } from "../services/firestoreService";

export default function FlashcardSession() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { docId, text, flashcards } = state;

  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({});
  const [sessionCardStats, setSessionCardStats] = useState({});
  const [cardNotes, setCardNotes] = useState([]);
  const [idx, setIdx] = useState(0);
  const [showBack, setShowBack] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [sessionComplete, setSessionComplete] = useState(false);

  function prioritizeFlashcards(cards, stats) {
    return cards
      .map((card, i) => {
        const s = stats[i] || { views: 0, easy: 0, hard: 0 };
        const struggleRatio = s.views === 0 ? 1 : (s.hard + 1) / (s.views + 2);
        return { card, index: i, score: struggleRatio };
      })
      .sort((a, b) => b.score - a.score);
  }

  async function resetCard(uid, docId, cardIndex) {
    const baseRef = doc(db, "users", uid, "documents", docId, "flashcardStats", String(cardIndex));
    const notesRef = collection(baseRef, "notes");
    const noteDocs = await getDocs(notesRef);
    for (const note of noteDocs.docs) {
      await deleteDoc(note.ref);
    }
    await deleteDoc(baseRef);
  }

  async function deleteNote(uid, docId, cardIndex, noteId) {
    const noteRef = doc(
      db,
      "users",
      uid,
      "documents",
      docId,
      "flashcardStats",
      String(cardIndex),
      "notes",
      noteId
    );
    await deleteDoc(noteRef);
  }

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const qs = flashcards;
        const statsSnap = await getDocs(
          collection(db, "users", currentUser.uid, "documents", docId, "flashcardStats")
        );
        const statData = {};
        statsSnap.docs.forEach((d) => {
          if (d.id !== "stats") {
            statData[d.id] = d.data();
          }
        });
        const sorted = prioritizeFlashcards(qs, statData);
        setCards(sorted.map((e) => e.card));
        setShowBack(true);
      } catch (error) {
        console.error("Failed to load flashcards:", error);
      }
    })();
  }, [currentUser, docId, flashcards]);

  useEffect(() => {
    if (!currentUser || !cards.length) return;
    const fetchNotes = async () => {
      const ref = collection(
        db,
        "users",
        currentUser.uid,
        "documents",
        docId,
        "flashcardStats",
        String(idx),
        "notes"
      );
      const snap = await getDocs(ref);
      setCardNotes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchNotes();
  }, [idx, currentUser, docId, cards]);

  if (!cards.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading flashcards…
      </div>
    );
  }

  const card = cards[idx];
  const key = String(idx);
  const cardStat = stats[key] || { views: 0, easy: 0, hard: 0 };

  const respond = async (easy) => {
    const updated = {
      views: cardStat.views + 1,
      easy: easy ? cardStat.easy + 1 : cardStat.easy,
      hard: !easy ? cardStat.hard + 1 : cardStat.hard,
    };

    await setDoc(
      doc(db, "users", currentUser.uid, "documents", docId, "flashcardStats", key),
      updated,
      { merge: true }
    );

    if (noteText.trim()) {
      await addDoc(
        collection(db, "users", currentUser.uid, "documents", docId, "flashcardStats", key, "notes"),
        { text: noteText.trim(), createdAt: serverTimestamp() }
      );
    }

    const newStats = { ...sessionCardStats, [key]: updated };
    setSessionCardStats(newStats);
    setStats((prev) => ({ ...prev, [key]: updated }));
    setNoteText("");
    setShowBack(true);

    if (idx + 1 === cards.length) {
      await logFlashcardSession(currentUser.uid, docId, newStats);
      setSessionComplete(true);
    } else {
      setIdx((i) => i + 1);
      setShowBack(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col items-center py-12 px-4">
      <button
        onClick={() => navigate(-1)}
        className="self-start mb-4 text-purple-400 hover:text-purple-300 transition"
      >
        ← Back
      </button>

      {!sessionComplete ? (
        <>
          <div className="mb-3 px-4 py-1 rounded-full bg-gray-800 border border-purple-700 text-purple-300 text-sm font-semibold">
            Card {idx + 1} of {cards.length}
          </div>

          <div className="w-96 h-64 md:w-[600px] md:h-[360px] mb-6" style={{ perspective: "1000px" }}>
            <div
              onClick={() => setShowBack((prev) => !prev)}
              className="relative w-full h-full cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 0.6s ease-in-out",
                transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="absolute w-full h-full bg-gray-800/80 border-2 border-purple-600 rounded-2xl shadow-xl flex items-center justify-center text-2xl text-white p-4"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-center space-y-2">
                  <div className="text-xl font-bold">{card.front}</div>
                  {card.back?.citation && (
                    <div className="text-xs italic text-purple-300 max-w-xs mx-auto">
                      {card.back.citation}
                    </div>
                  )}
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute w-full h-full bg-gray-800/80 border-2 border-purple-600 rounded-2xl shadow-xl flex items-center justify-center text-2xl text-white p-4"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-center">
                  {card.back.definition || card.back["fill in the blank"]}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-6 mb-6">
            <button
              onClick={() => respond(false)}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Hard
            </button>
            <button
              onClick={() => respond(true)}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              Easy
            </button>
          </div>

          <div className="w-full max-w-xl mt-6">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="✏️ Add a note to this card..."
              className="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
              rows={2}
            />
            <div className="text-right mt-2">
              <button
                onClick={async () => {
                  await resetCard(currentUser.uid, docId, idx);
                  const newStats = { ...stats };
                  delete newStats[idx];
                  setStats(newStats);
                  setNoteText("");
                  setCardNotes([]);
                }}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                🗑️ Reset Progress for this Card
              </button>
            </div>
          </div>

          {cardNotes.length > 0 && (
            <div className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-sm text-gray-300 space-y-2 max-w-xl w-full">
              <h4 className="font-semibold text-white mb-2">🗒️ Your Notes:</h4>
              {cardNotes.map((note) => (
                <div
                  key={note.id}
                  className="border-b border-gray-600 pb-2 last:border-b-0 flex justify-between items-start"
                >
                  <div>
                    <div className="whitespace-pre-line">{note.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {note.createdAt?.seconds
                        ? new Date(note.createdAt.seconds * 1000).toLocaleString()
                        : "Just now"}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteNote(currentUser.uid, docId, idx, note.id);
                      setCardNotes((prev) => prev.filter((n) => n.id !== note.id));
                    }}
                    className="ml-4 text-red-400 hover:text-red-300 text-xs"
                    title="Delete note"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-gray-300 mt-4">
            Views: {cardStat.views} &nbsp;|&nbsp; Easy: {cardStat.easy} &nbsp;|&nbsp; Hard: {cardStat.hard}
          </div>
        </>
      ) : (
        <div className="mt-8 p-6 bg-gray-800/80 rounded-2xl border-2 border-purple-700 text-center text-white w-full max-w-2xl shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-purple-400">🎉 Session Complete</h3>
          <p className="text-lg text-gray-300 mb-2">You reviewed {cards.length} flashcards.</p>
          <p className="text-lg text-gray-300 mb-6">
            ✅ Easy: {Object.values(sessionCardStats).filter((s) => s.easy > 0).length} &nbsp;|&nbsp;
            ❌ Hard: {Object.values(sessionCardStats).filter((s) => s.hard > 0).length}
          </p>
          <button
            onClick={() => {
              setIdx(0);
              setSessionComplete(false);
              setShowBack(true);
              setNoteText("");
              setSessionCardStats({});
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition"
          >
            🔁 Restart Session
          </button>
        </div>
      )}
    </div>
  );
}
