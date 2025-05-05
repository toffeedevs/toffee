import { db } from "../App";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";

export async function deleteDocument(userId, docId) {
  const ref = doc(db, "users", userId, "documents", docId);
  await deleteDoc(ref);
}

export async function saveDocument(userId, text, tfQuestions, mcqQuestions, fitbQuestions, title = "") {
  const ref = await addDoc(collection(db, "users", userId, "documents"), {
    title,
    text,
    createdAt: new Date(),
    questions: { tf: tfQuestions, mcq: mcqQuestions, fitb: fitbQuestions },
    results: { tf: [], mcq: [], fitb: [] }
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
  const agg = { mcq: { ...base }, tf: { ...base }, fitb: { ...base } };

  snap.docs.forEach(doc => {
    const r = doc.data().results || {};
    for (const type of ["mcq", "tf", "fitb"]) {
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
    tf: calc("tf"),
    fitb: calc("fitb")
  };
}

export async function getUserStatsThisWeek(userId) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const snap = await getDocs(collection(db, "users", userId, "documents"));

  let docs = 0, quizzes = 0, correct = 0, total = 0;
  const activityMap = Array(7).fill(false);

  snap.docs.forEach(doc => {
    const data = doc.data();
    const created = new Date(data.createdAt?.seconds * 1000);
    const dayDiff = Math.floor((created - weekAgo) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      activityMap[dayDiff] = true;
      docs++;
    }

    const results = data.results || {};
    for (const type of ["mcq", "tf", "fitb"]) {
      if (results[type]) {
        const recent = results[type].filter(() => created >= weekAgo);
        if (recent.length > 0 && dayDiff >= 0 && dayDiff < 7) {
          activityMap[dayDiff] = true;
          quizzes += 1;
        }
        total += recent.length;
        correct += recent.filter(r => r.correct).length;
      }
    }
  });

  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  return { docs, quizzes, accuracy, streak: activityMap };
}