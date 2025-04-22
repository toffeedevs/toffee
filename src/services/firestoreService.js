import { db } from "../App";
import { doc, collection, addDoc, getDoc, getDocs, updateDoc } from "firebase/firestore";

export async function saveSession(userId, type, text, questions) {
  const sessionRef = await addDoc(collection(db, "users", userId, "sessions"), {
    type,
    originalText: text,
    createdAt: new Date(),
    questions,
    results: []
  });
  return sessionRef.id;
}

export async function recordAnswer(userId, sessionId, questionIndex, correct) {
  const sessionRef = doc(db, "users", userId, "sessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);
  if (sessionSnap.exists()) {
    const data = sessionSnap.data();
    const results = data.results || [];
    results.push({ questionIndex, correct });
    await updateDoc(sessionRef, { results });
  }
}

export async function getUserStats(userId) {
  const sessionsRef = collection(db, "users", userId, "sessions");
  const snapshots = await getDocs(sessionsRef);
  let total = 0, correct = 0;
  snapshots.forEach(doc => {
    const { results } = doc.data();
    if (results) {
      total += results.length;
      correct += results.filter(r => r.correct).length;
    }
  });
  return { total, correct, percentage: total ? Math.round((correct / total) * 100) : 0 };
}
