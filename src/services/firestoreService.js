import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import SHA256 from "crypto-js/sha256";

const firebaseConfig = {
  apiKey: "AIzaSyAL1dQyCk6bGrKyOAZStLnab9MBxIeAodI",
  authDomain: "toffee-2bdd4.firebaseapp.com",
  projectId: "toffee-2bdd4",
  storageBucket: "toffee-2bdd4.firebasestorage.app",
  messagingSenderId: "254874642056",
  appId: "1:254874642056:web:5683acb4379b81bf22e13d",
  measurementId: "G-F0EEBXC8M3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 🔐 Hashing
export async function computeTextHash(text) {
  return SHA256(text).toString();
}

// 📄 Document operations
export async function deleteDocument(userId, docId) {
  const ref = doc(db, "users", userId, "documents", docId);
  await deleteDoc(ref);
}

export const saveDocument = async (uid, text, summary, extras = {}) => {
  const docRef = await addDoc(collection(db, `users/${uid}/documents`), {
    text: text || "", // can be Anki URL initially
    summary,
    createdAt: serverTimestamp(),
    ...extras
  });
  return docRef.id;
};

export async function getUserDocuments(userId) {
  const snap = await getDocs(collection(db, "users", userId, "documents"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getDocument(userId, docId) {
  const ref = doc(db, "users", userId, "documents", docId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: docId, ...snap.data() } : null;
}

export const updateDocumentText = async (uid, docId, newText) => {
  const ref = doc(db, "users", uid, "documents", docId);
  await updateDoc(ref, { text: newText });
};

// 💬 Chat message persistence
export async function saveMessageToDocument(userId, docId, message) {
  const messageRef = collection(db, "users", userId, "documents", docId, "messages");
  await addDoc(messageRef, {
    ...message,
    createdAt: serverTimestamp()
  });
}

export async function getMessagesForDocument(userId, docId) {
  const messageRef = collection(db, "users", userId, "documents", docId, "messages");
  const snap = await getDocs(messageRef);
  return snap.docs
    .map(doc => doc.data())
    .sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
}

// 📊 Quiz & flashcard tracking
export async function logFlashcardSession(userId, docId, stats) {
  const sessionRef = collection(db, "users", userId, "documents", docId, "flashcardSessions");
  const totalCards = Object.keys(stats).length;
  const easyCount = Object.values(stats).filter((s) => s.easy > 0).length;
  const hardCount = Object.values(stats).filter((s) => s.hard > 0).length;

  await addDoc(sessionRef, {
    completedAt: serverTimestamp(),
    totalCards,
    easyCount,
    hardCount,
    cardIds: Object.keys(stats),
  });
}

export async function getQuestionsForDocument(userId, docId, type) {
  const ref = doc(db, "users", userId, "documents", docId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().questions?.[type] || [] : [];
}

// 🏪 Marketplace
export async function shareToMarketplace(userId, document, tags = []) {
  const profile = await getUserProfile(userId);
  const username = profile.username || "anonymous";
  const textHash = await computeTextHash(document.text);

  const q = query(
    collection(db, "marketplace"),
    where("sharedBy", "==", username),
    where("textHash", "==", textHash)
  );
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error("Already shared");

  const marketplaceDoc = {
    originalDocId: document.id,
    textHash,
    text: document.text,
    summary: document.summary,
    questions: document.questions || [],
    flashcards: document.flashcards || [],
    sharedBy: username,
    createdAt: new Date(),
    tags,
  };

  await addDoc(collection(db, "marketplace"), marketplaceDoc);
}

export async function getMarketplaceDocs(tag = null) {
  const ref = collection(db, "marketplace");
  const q = tag ? query(ref, where("tags", "array-contains", tag)) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function importMarketplaceDoc(currentUserId, sharedDocId) {
  const sharedDocRef = doc(db, "marketplace", sharedDocId);
  const snap = await getDoc(sharedDocRef);
  if (!snap.exists()) throw new Error("Shared document not found.");
  const sharedData = snap.data();
  const sharedTextHash = sharedData.textHash || await computeTextHash(sharedData.text);

  const q1 = query(
    collection(db, "users", currentUserId, "documents"),
    where("importedFrom", "==", sharedDocId)
  );
  const existingImport = await getDocs(q1);

  const q2 = query(
    collection(db, "users", currentUserId, "documents"),
    where("textHash", "==", sharedTextHash)
  );
  const existingHash = await getDocs(q2);

  if (!existingImport.empty || !existingHash.empty) {
    throw new Error("Already imported or duplicate document exists");
  }

  await addDoc(collection(db, "users", currentUserId, "documents"), {
    ...sharedData,
    importedFrom: sharedDocId,
    importedAt: new Date(),
  });
}

// 🧑 Profile & stats
export async function getUserProfile(userId) {
  const ref = doc(db, "users", userId, "profile", "info");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { username: "" };
}

export async function updateUserProfile(userId, profileData) {
  const ref = doc(db, "users", userId, "profile", "info");
  await setDoc(ref, { ...profileData, updatedAt: new Date() }, { merge: true });
}

export async function incrementQuizCount(userId, type, correct, total) {
  const ref = doc(db, "users", userId, "profile", "info");
  await setDoc(
    ref,
    {
      [`${type}_quizzes_taken`]: increment(1),
      [`${type}_correct`]: increment(correct),
      [`${type}_total`]: increment(total),
    },
    { merge: true }
  );
}

export const deleteThreadMessage = async (uid, docId, endedAt) => {
  const msgRef = collection(db, "users", uid, "documents", docId, "messages");
  const snap = await getDocs(msgRef);
  for (const doc of snap.docs) {
    const data = doc.data();
    if (
      data.text === "__THREAD_SAVE__" &&
      data.thread?.endedAt === endedAt
    ) {
      await deleteDoc(doc.ref);
      break;
    }
  }
};
