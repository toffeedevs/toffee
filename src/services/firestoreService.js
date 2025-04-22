import { db } from "../App";
import { collection, doc, addDoc, setDoc, getDocs, getDoc, updateDoc } from "firebase/firestore";

export async function saveDocument(userId, text, tfQuestions, mcqQuestions) {
  const ref = await addDoc(collection(db, "users", userId, "documents"), {
    text,
    createdAt: new Date(),
    questions: { tf: tfQuestions, mcq: mcqQuestions },
    results: { tf: [], mcq: [] }
  });
  return ref.id;
}

export async function getUserDocuments(userId) {
  const snap = await getDocs(collection(db, "users", userId, "documents"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getQuestionsForDocument(userId, docId, type) {
  const ref = doc(db, "users", userId, "documents", docId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().questions[type] || [] : [];
}

export async function recordQuizResults(userId, docId, type, results) {
  const ref = doc(db, "users", userId, "documents", docId);
  const snap = await getDoc(ref);
  const prev = snap.exists() && snap.data().results?.[type] || [];
  await updateDoc(ref, { [`results.${type}`]: [...prev, ...results] });
}

export async function getUserStats(userId) {
  const snap = await getDocs(collection(db, "users", userId, "documents"));
  const base = { total: 0, correct: 0 };
  const agg = { mcq: { ...base }, tf: { ...base } };

  snap.docs.forEach(doc => {
    const r = doc.data().results || {};
    for (const type of ["mcq", "tf"]) {
      if (r[type]) {
        agg[type].total += r[type].length;
        agg[type].correct += r[type].filter(res => res.correct).length;
      }
    }
  });

  const calc = type => ({
    total: agg[type].total,
    correct: agg[type].correct,
    percentage: agg[type].total ? Math.round((agg[type].correct / agg[type].total) * 100) : 0
  });

  return {
    mcq: calc("mcq"),
    tf: calc("tf")
  };
}
