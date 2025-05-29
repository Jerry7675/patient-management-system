// src/services/firebase/firestore.js
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

class FirestoreService {
  // Generic CRUD operations

  // Add document to collection
  async addDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        success: true,
        id: docRef.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get document by ID
  async getDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        return {
          success: false,
          error: 'Document not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update document
  async updateDocument(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete document
  async deleteDocument(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all documents from collection
  async getCollection(collectionName, conditions = []) {
    try {
      let q = collection(db, collectionName);
      
      // Apply conditions if provided
      if (conditions.length > 0) {
        const constraints = conditions.map(condition => {
          if (condition.type === 'where') {
            return where(condition.field, condition.operator, condition.value);
          } else if (condition.type === 'orderBy') {
            return orderBy(condition.field, condition.direction || 'asc');
          } else if (condition.type === 'limit') {
            return limit(condition.value);
          }
        });
        q = query(q, ...constraints);
      }

      const querySnapshot = await getDocs(q);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      return {
        success: true,
        data: documents
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Real-time listener for collection
  onCollectionSnapshot(collectionName, callback, conditions = []) {
    let q = collection(db, collectionName);
    
    if (conditions.length > 0) {
      const constraints = conditions.map(condition => {
        if (condition.type === 'where') {
          return where(condition.field, condition.operator, condition.value);
        } else if (condition.type === 'orderBy') {
          return orderBy(condition.field, condition.direction || 'asc');
        }
      });
      q = query(q, ...constraints);
    }

    return onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    });
  }

  // Real-time listener for document
  onDocumentSnapshot(collectionName, docId, callback) {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }

  // Batch operations
  async batchWrite(operations) {
    try {
      const batch = writeBatch(db);
      
      operations.forEach(operation => {
        const docRef = doc(db, operation.collection, operation.id);
        
        if (operation.type === 'set') {
          batch.set(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp()
          });
        } else if (operation.type === 'update') {
          batch.update(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp()
          });
        } else if (operation.type === 'delete') {
          batch.delete(docRef);
        }
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Specific methods for Patient Management System

  // User management
  async getUsersByRole(role) {
    return this.getCollection('users', [
      { type: 'where', field: 'role', operator: '==', value: role }
    ]);
  }

  async updateUserStatus(userId, status) {
    return this.updateDocument('users', userId, { status });
  }

  // Patient records management
  async getPatientRecords(patientId) {
    return this.getCollection('medicalRecords', [
      { type: 'where', field: 'patientId', operator: '==', value: patientId },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' }
    ]);
  }

  async getDoctorPendingRecords(doctorId) {
    return this.getCollection('medicalRecords', [
      { type: 'where', field: 'doctorId', operator: '==', value: doctorId },
      { type: 'where', field: 'status', operator: '==', value: 'pending' },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' }
    ]);
  }

  // Notifications
  async getUserNotifications(userId) {
    return this.getCollection('notifications', [
      { type: 'where', field: 'userId', operator: '==', value: userId },
      { type: 'where', field: 'read', operator: '==', value: false },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' }
    ]);
  }

  async markNotificationAsRead(notificationId) {
    return this.updateDocument('notifications', notificationId, { read: true });
  }

  // Correction requests
  async getCorrectionRequests(doctorId) {
    return this.getCollection('correctionRequests', [
      { type: 'where', field: 'doctorId', operator: '==', value: doctorId },
      { type: 'where', field: 'status', operator: '==', value: 'pending' },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' }
    ]);
  }
}

export default new FirestoreService();