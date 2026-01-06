
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { db, storage } from "./firebase";
import { SBO, User, Comment } from "./types";

export const uploadSBOImage = async (base64Data: string, userId: string): Promise<string> => {
  try {
    const fileName = `sbo_images/${userId}_${Date.now()}.png`;
    const storageRef = ref(storage, fileName);
    await uploadString(storageRef, base64Data, 'data_url');
    return getDownloadURL(storageRef);
  } catch (err) {
    console.error("Storage Error:", err);
    throw new Error("Failed to upload image. Please check your storage quota or permissions.");
  }
};

export const createSBO = async (sbo: Omit<SBO, 'id'>): Promise<string> => {
  try {
    const sboCollection = collection(db, 'sbos');
    const docRef = await addDoc(sboCollection, {
      ...sbo,
      timestamp: Timestamp.fromDate(new Date(sbo.timestamp))
    });
    return docRef.id;
  } catch (err) {
    console.error("Firestore Error:", err);
    throw new Error("Failed to save SBO. Attempting to save locally...");
  }
};

export const getUserSBOs = async (userId: string, role: string): Promise<SBO[]> => {
  const sboCollection = collection(db, 'sbos');
  let q;

  try {
    if (role === 'hse') {
      q = query(sboCollection, orderBy('timestamp', 'desc'));
    } else if (role === 'manager') {
      q = query(sboCollection, where('areaMgr', 'in', ['John Doe', 'Sarah Smith', 'Michael Chen', 'Olu Bakare']), orderBy('timestamp', 'desc'));
    } else {
      q = query(sboCollection, where('observer.id', '==', userId), orderBy('timestamp', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp).toMillis()
    } as SBO));

    // Cache results for offline use
    localStorage.setItem(`gzi_sbo_cache_${userId}`, JSON.stringify(results));
    return results;
  } catch (err) {
    console.error("Fetch Error:", err);
    throw err;
  }
};

export const addComment = async (sboId: string, comment: Comment) => {
  try {
    const docRef = doc(db, 'sbos', sboId);
    await updateDoc(docRef, {
      comments: arrayUnion(comment),
      status: 'pending'
    });
  } catch (err) {
    throw new Error("Failed to add comment.");
  }
};

export const reassignSBO = async (sboId: string, newManager: string) => {
  try {
    const docRef = doc(db, 'sbos', sboId);
    await updateDoc(docRef, {
      areaMgr: newManager,
      status: 'open'
    });
  } catch (err) {
    throw new Error("Reassignment failed.");
  }
};

export const closeSBO = async (sboId: string, userId: string) => {
  try {
    const docRef = doc(db, 'sbos', sboId);
    await updateDoc(docRef, {
      status: 'closed',
      closedAt: Date.now(),
      closedBy: userId
    });
  } catch (err) {
    throw new Error("Failed to close SBO.");
  }
};
