// src/utils/firebaseHelpers.js

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../services/firebaseConfig";

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

// ───── Photo Upload Functions ─────
export const uploadPhoto = async (file, path) => {
  try {
    console.log('Uploading photo to path:', path, 'Size:', file.size);
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Check if storage is properly configured
    if (!storage) {
      throw new Error('Firebase Storage not configured');
    }
    
    const storageRef = ref(storage, path);
    console.log('Storage reference created:', storageRef);
    
    // Create upload task with progress monitoring
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      // Extend timeout to 60 seconds for larger files
      const timeout = setTimeout(() => {
        console.log('Upload timeout, canceling...');
        uploadTask.cancel();
        reject(new Error('Upload timeout after 60 seconds'));
      }, 60000);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', Math.round(progress) + '%');
        },
        (error) => {
          clearTimeout(timeout);
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          clearTimeout(timeout);
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Upload completed, URL:', downloadURL);
            resolve(downloadURL);
          } catch (urlError) {
            console.error('Error getting download URL:', urlError);
            reject(urlError);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const uploadPhotos = async (photos, reportId) => {
  try {
    console.log('uploadPhotos called with:', { photosCount: photos?.length || 0, reportId });
    
    if (!photos || photos.length === 0) {
      console.log('No photos to upload');
      return [];
    }
    
    const uploadPromises = photos.map(async (photo, index) => {
      console.log(`Processing photo ${index}:`, photo);
      
      if (photo.file && photo.file instanceof File) {
        // New photo to upload
        console.log(`Uploading new photo ${index}:`, photo.name);
        const fileName = `${Date.now()}_${index}_${photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `daily-reports/${reportId}/photos/${fileName}`;
        
        try {
          const url = await uploadPhoto(photo.file, path);
          console.log(`Photo ${index} uploaded successfully:`, url);
          return {
            name: photo.name,
            url: url,
            path: path
          };
        } catch (uploadError) {
          console.error(`Failed to upload photo ${index}:`, uploadError);
          throw uploadError;
        }
      } else if (photo.url) {
        // Existing photo (already uploaded)
        console.log(`Using existing photo ${index}:`, photo.url);
        return {
          name: photo.name,
          url: photo.url,
          path: photo.path || `daily-reports/${reportId}/photos/${photo.name}`
        };
      } else {
        console.warn(`Photo ${index} has no file or URL, skipping:`, photo);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const validResults = results.filter(result => result !== null);
    console.log('All photos processed, valid results:', validResults.length);
    return validResults;
  } catch (error) {
    console.error('Error uploading photos:', error);
    throw error;
  }
};

export const deletePhoto = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

// ───── Test Functions (for debugging) ─────
export const testFirebaseStorage = async () => {
  try {
    console.log('Testing Firebase Storage connection...');
    
    // Create a simple test file
    const testData = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
    const testFile = new File([testData], 'test.txt', { type: 'text/plain' });
    
    const testPath = `test/${Date.now()}_test.txt`;
    const storageRef = ref(storage, testPath);
    
    console.log('Uploading test file to:', testPath);
    const uploadTask = uploadBytesResumable(storageRef, testFile);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Test upload progress:', progress + '%');
        },
        (error) => {
          console.error('Test upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Test upload completed, URL:', downloadURL);
            resolve(downloadURL);
          } catch (urlError) {
            console.error('Error getting download URL:', urlError);
            reject(urlError);
          }
        }
      );
    });
  } catch (error) {
    console.error('Test Firebase Storage error:', error);
    throw error;
  }
};

export const testPhotoUpload = async (file) => {
  try {
    console.log('Testing photo upload with file:', file);
    const testReportId = 'test-report-' + Date.now();
    const result = await uploadPhotos([{
      name: file.name,
      file: file,
      url: URL.createObjectURL(file)
    }], testReportId);
    console.log('Test photo upload result:', result);
    return result;
  } catch (error) {
    console.error('Test photo upload error:', error);
    throw error;
  }
};

// Make test functions available globally for debugging
if (typeof window !== 'undefined') {
  window.testFirebaseStorage = testFirebaseStorage;
  window.testPhotoUpload = testPhotoUpload;
  
  // Simple test function that doesn't require imports
  window.simpleStorageTest = async () => {
    console.log('🧪 Running simple storage test...');
    try {
      // Test if Firebase Storage is accessible
      const { storage } = await import('../../services/firebaseConfig');
      const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      
      console.log('✅ Firebase modules loaded successfully');
      
      // Create test data
      const testData = new Blob(['Hello from simple test!'], { type: 'text/plain' });
      const testFile = new File([testData], 'simple-test.txt', { type: 'text/plain' });
      
      const testPath = `simple-test/${Date.now()}_test.txt`;
      const storageRef = ref(storage, testPath);
      
      console.log('📤 Uploading test file to:', testPath);
      
      const uploadTask = uploadBytesResumable(storageRef, testFile);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('📊 Upload progress:', Math.round(progress) + '%');
          },
          (error) => {
            console.error('❌ Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Upload completed! URL:', downloadURL);
              resolve(downloadURL);
            } catch (urlError) {
              console.error('❌ Error getting download URL:', urlError);
              reject(urlError);
            }
          }
        );
      });
    } catch (error) {
      console.error('❌ Simple storage test failed:', error);
      throw error;
    }
  };
  
  console.log('🔧 Firebase Storage test functions loaded:');
  console.log('  - window.testFirebaseStorage()');
  console.log('  - window.simpleStorageTest()');
  console.log('  - window.testPhotoUpload(file)');
}
