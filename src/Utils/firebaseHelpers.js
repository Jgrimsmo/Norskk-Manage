// src/utils/firebaseHelpers.js

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../Firebase/firebaseConfig";

// ───── Read Collection ─────
export const fetchCollection = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

// ───── Read Single Document ─────
export const fetchDocById = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// ───── Add New Document ─────
export const addToCollection = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
};

// ───── Update Existing Document ─────
export const updateDocById = async (collectionName, id, updates) => {
  try {
    await updateDoc(doc(db, collectionName, id), updates);
  } catch (error) {
    console.error(`Error updating ${collectionName} doc ${id}:`, error);
    throw error;
  }
};

// ───── Delete Document ─────
export const deleteDocById = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error(`Error deleting ${collectionName} doc ${id}:`, error);
    throw error;
  }
};

// ───── Subcollection Helper Functions ─────

// Fetch documents from a subcollection
export const fetchSubcollection = async (parentPath, subcollectionName) => {
  try {
    const snapshot = await getDocs(collection(db, `${parentPath}/${subcollectionName}`));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching subcollection ${parentPath}/${subcollectionName}:`, error);
    throw error;
  }
};

// Add document to a subcollection
export const addToSubcollection = async (parentPath, subcollectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, `${parentPath}/${subcollectionName}`), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding to subcollection ${parentPath}/${subcollectionName}:`, error);
    throw error;
  }
};

// Update document in a subcollection
export const updateSubcollectionDoc = async (parentPath, subcollectionName, docId, updates) => {
  try {
    await updateDoc(doc(db, `${parentPath}/${subcollectionName}/${docId}`), updates);
  } catch (error) {
    console.error(`Error updating subcollection doc ${parentPath}/${subcollectionName}/${docId}:`, error);
    throw error;
  }
};

// Delete document from a subcollection
export const deleteSubcollectionDoc = async (parentPath, subcollectionName, docId) => {
  try {
    await deleteDoc(doc(db, `${parentPath}/${subcollectionName}/${docId}`));
  } catch (error) {
    console.error(`Error deleting subcollection doc ${parentPath}/${subcollectionName}/${docId}:`, error);
    throw error;
  }
};

// ───── Set Document (Create or Update) ─────
export const setDocById = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), data);
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// ───── Batch Operations ─────

// Fetch multiple subcollections in parallel for better performance
export const fetchMultipleSubcollections = async (parentPaths, subcollectionName) => {
  try {
    const promises = parentPaths.map(parentPath => 
      fetchSubcollection(parentPath, subcollectionName)
    );
    const results = await Promise.all(promises);
    return results.map((items, index) => ({
      parentPath: parentPaths[index],
      items
    }));
  } catch (error) {
    console.error('Error fetching multiple subcollections:', error);
    throw error;
  }
};

// ───── Query Collection ─────
export const queryCollection = async (collectionName, ...queryConstraints) => {
  try {
    const { query } = await import("firebase/firestore");
    const q = query(collection(db, collectionName), ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    throw error;
  }
};
