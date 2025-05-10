// src/services/firestoreService.js

import {initializeApp} from "firebase/app";
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

const firebaseConfig = {
    apiKey: "AIzaSyAL1dQyCk6bGrKyOAZStLnab9MBxIeAodI",
    authDomain: "toffee-2bdd4.firebaseapp.com",
    projectId: "toffee-2bdd4",
    storageBucket: "toffee-2bdd4.firebasestorage.app",
    messagingSenderId: "254874642056",
    appId: "1:254874642056:web:5683acb4379b81bf22e13d",
    measurementId: "G-F0EEBXC8M3"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Delete a document.
 */
export async function deleteDocument(userId, docId) {
    const ref = doc(db, "users", userId, "documents", docId);
    await deleteDoc(ref);
}

export async function saveDocument(userId, text, summary = "") {
    const ref = await addDoc(collection(db, "users", userId, "documents"), {
        title: summary,
        summary,
        text,
        createdAt: new Date()
    });
    return ref.id;
}


export async function getUserDocuments(userId) {
    const snap = await getDocs(collection(db, "users", userId, "documents"));
    return snap.docs.map((doc) => ({id: doc.id, ...doc.data()}));
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
    await updateDoc(ref, {[`results.${type}`]: [...prev, ...results]});
}

export async function getUserStats(userId) {
    const snap = await getDocs(collection(db, "users", userId, "documents"));
    const base = {total: 0, correct: 0};
    const agg = {
        mcq: {...base},
        tf: {...base},
        fitb: {...base},
        flashcardsStudied: 0,
    };
    snap.docs.forEach((doc) => {
        const r = doc.data().results || {};
        for (const type of ["mcq", "tf", "fitb"]) {
            if (r[type]) {
                agg[type].total += r[type].length;
                agg[type].correct += r[type].filter((res) => res.correct).length;
            }
        }
    });

    // Count total flashcards studied from all flashcardSessions
    for (const docSnap of snap.docs) {
        const sessionSnap = await getDocs(collection(docSnap.ref, "flashcardSessions"));
        sessionSnap.forEach((s) => {
            const d = s.data();
            if (d?.totalCards) {
                agg.flashcardsStudied += d.totalCards;
            } else if (d?.cardIds) {
                agg.flashcardsStudied += d.cardIds.length;
            }
        });
    }

    const calc = (type) => ({
        total: agg[type].total,
        correct: agg[type].correct,
        percentage: agg[type].total
            ? Math.round((agg[type].correct / agg[type].total) * 100)
            : 0,
    });

    return {
        mcq: calc("mcq"),
        tf: calc("tf"),
        fitb: calc("fitb"),
        flashcardsStudied: agg.flashcardsStudied,
    };

}

export async function getUserStatsThisWeek(userId) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const snap = await getDocs(collection(db, "users", userId, "documents"));

    let docs = 0,
        quizzes = 0,
        correct = 0,
        total = 0;
    const activityMap = Array(7).fill(false);

    snap.docs.forEach((doc) => {
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
                correct += recent.filter((r) => r.correct).length;
            }
        }
    });

    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    return {docs, quizzes, accuracy, streak: activityMap};
}

export async function getFlashcardStats(userId, docId) {
    const statsRef = doc(
        db,
        "users",
        userId,
        "documents",
        docId,
        "flashcardStats",
        "stats"
    );
    const snap = await getDoc(statsRef);
    return snap.exists() ? snap.data() : {};
}

export async function updateFlashcardStat(userId, docId, cardId, stat) {
    const cardRef = doc(
        db,
        "users",
        userId,
        "documents",
        docId,
        "flashcardStats",
        cardId
    );
    await setDoc(cardRef, stat, {merge: true});
}

export async function addCardNote(userId, docId, cardId, noteText) {
    const notesCol = collection(
        db,
        "users",
        userId,
        "documents",
        docId,
        "flashcardStats",
        cardId,
        "notes"
    );
    await addDoc(notesCol, {
        text: noteText,
        createdAt: serverTimestamp(),
    });
}

export async function logFlashcardSession(userId, docId, stats) {
    const sessionRef = collection(
        db,
        "users",
        userId,
        "documents",
        docId,
        "flashcardSessions"
    );

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

export async function shareToMarketplace(userId, document, tags = []) {
    const profile = await getUserProfile(userId);
    const username = profile.username || "anonymous";

    // Avoid duplicate shares: check for matching user + summary + text
    const q = query(
        collection(db, "marketplace"),
        where("sharedBy", "==", username),
        where("summary", "==", document.summary)
    );
    const existing = await getDocs(q);
    if (!existing.empty) throw new Error("Already shared");

    const marketplaceDoc = {
        text: document.text,
        summary: document.summary,
        questions: document.questions || [],  // ✅ FIX: replace undefined with []
        flashcards: document.flashcards || [],
        sharedBy: username,
        createdAt: new Date(),
        tags,
    };

    await addDoc(collection(db, "marketplace"), marketplaceDoc);
}


export async function getMarketplaceDocs(tag = null) {
    const ref = collection(db, "marketplace");

    const q = tag
        ? query(ref, where("tags", "array-contains", tag))
        : ref;

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({id: doc.id, ...doc.data()}));
}


export async function importMarketplaceDoc(currentUserId, sharedDocId) {
    const sharedDocRef = doc(db, "marketplace", sharedDocId);
    const snap = await getDoc(sharedDocRef);

    if (!snap.exists()) throw new Error("Shared document not found.");
    const sharedData = snap.data();

    // ❌ Block only if user already imported (even if they were the sharer)
    const q = query(
        collection(db, "users", currentUserId, "documents"),
        where("importedFrom", "==", sharedDocId)
    );
    const existing = await getDocs(q);

    // ALSO check for same text/summary (in case user shared directly)
    const q2 = query(
        collection(db, "users", currentUserId, "documents"),
        where("summary", "==", sharedData.summary),
        where("text", "==", sharedData.text)
    );
    const duplicate = await getDocs(q2);

    if (!existing.empty || !duplicate.empty) {
        throw new Error("Already imported");
    }

    // ✅ Import allowed
    await addDoc(collection(db, "users", currentUserId, "documents"), {
        ...sharedData,
        importedFrom: sharedDocId,
        importedAt: new Date(),
    });
}

export async function getUserProfile(userId) {
    const ref = doc(db, "users", userId, "profile", "info");
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {username: ""};
}

export async function updateUserProfile(userId, profileData) {
    const ref = doc(db, "users", userId, "profile", "info");
    await setDoc(ref, {...profileData, updatedAt: new Date()}, {merge: true});
}


export async function incrementQuizCount(userId, type, correct, total) {
    const ref = doc(db, "users", userId, "profile", "info");
    await setDoc(ref, {
        [`${type}_quizzes_taken`]: increment(1),
        [`${type}_correct`]: increment(correct),
        [`${type}_total`]: increment(total)
    }, {merge: true});
}
