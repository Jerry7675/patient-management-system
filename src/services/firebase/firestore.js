import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  startAfter
} from 'firebase/firestore';
import { db } from './config';

// Export db for direct access
export { db };

class FirestoreService {
  // Set document (create or overwrite)
  async setDocument(collectionName, docId, data) {
    try {
      await setDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Set document error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single document
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
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      console.error('Get document error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update document
  async updateDocument(collectionName, docId, data) {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Update document error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete document
  async deleteDocument(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error) {
      console.error('Delete document error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add document (auto-generated ID)
  async addDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Add document error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get collection with optional filters
  async getCollection(collectionName, filters = [], orderByField = null, limitCount = null) {
    try {
      let q = collection(db, collectionName);
      
      // Apply filters
      if (filters && filters.length > 0) {
        const queryConstraints = [];
        
        filters.forEach(filter => {
          if (filter.type === 'where') {
            queryConstraints.push(where(filter.field, filter.operator, filter.value));
          }
        });
        
        if (orderByField) {
          queryConstraints.push(orderBy(orderByField));
        }
        
        if (limitCount) {
          queryConstraints.push(limit(limitCount));
        }
        
        q = query(q, ...queryConstraints);
      } else {
        const queryConstraints = [];
        
        if (orderByField) {
          queryConstraints.push(orderBy(orderByField));
        }
        
        if (limitCount) {
          queryConstraints.push(limit(limitCount));
        }
        
        if (queryConstraints.length > 0) {
          q = query(q, ...queryConstraints);
        }
      }

      const querySnapshot = await getDocs(q);
      const data = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data };
    } catch (error) {
      console.error('Get collection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      return await this.getCollection('users', [
        { type: 'where', field: 'role', operator: '==', value: role }
      ]);
    } catch (error) {
      console.error('Get users by role error:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time listener for document
  onDocumentSnapshot(collectionName, docId, callback) {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ success: true, data: { id: doc.id, ...doc.data() } });
      } else {
        callback({ success: false, error: 'Document not found' });
      }
    }, (error) => {
      callback({ success: false, error: error.message });
    });
  }

  // Real-time listener for collection
  onCollectionSnapshot(collectionName, filters = [], callback) {
    try {
      let q = collection(db, collectionName);
      
      if (filters && filters.length > 0) {
        const queryConstraints = filters.map(filter => {
          if (filter.type === 'where') {
            return where(filter.field, filter.operator, filter.value);
          }
        }).filter(Boolean);
        
        if (queryConstraints.length > 0) {
          q = query(q, ...queryConstraints);
        }
      }

      return onSnapshot(q, (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        callback({ success: true, data });
      }, (error) => {
        callback({ success: false, error: error.message });
      });
    } catch (error) {
      console.error('Collection snapshot error:', error);
      callback({ success: false, error: error.message });
    }
  }

  // Batch operations
  async batchWrite(operations) {
    try {
      const batch = writeBatch(db);
      
      operations.forEach(operation => {
        const { type, collectionName, docId, data } = operation;
        const docRef = doc(db, collectionName, docId);
        
        switch (type) {
          case 'set':
            batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'update':
            batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Batch write error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search documents by text field
  async searchDocuments(collectionName, field, searchTerm, exactMatch = false) {
    try {
      let filters;
      
      if (exactMatch) {
        filters = [
          { type: 'where', field: field, operator: '==', value: searchTerm }
        ];
      } else {
        // For partial matching, we'll get all docs and filter client-side
        // This is not ideal for large datasets, but Firestore doesn't support full-text search
        const allDocs = await this.getCollection(collectionName);
        
        if (allDocs.success) {
          const filteredData = allDocs.data.filter(doc => 
            doc[field] && 
            doc[field].toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
          return { success: true, data: filteredData };
        }
        return allDocs;
      }
      
      return await this.getCollection(collectionName, filters);
    } catch (error) {
      console.error('Search documents error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get documents with pagination
  async getPaginatedCollection(collectionName, filters = [], orderByField = 'createdAt', limitCount = 10, lastVisible = null) {
    try {
      let queryConstraints = [];
      
      // Add filters
      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          if (filter.type === 'where') {
            queryConstraints.push(where(filter.field, filter.operator, filter.value));
          }
        });
      }
      
      // Add ordering
      queryConstraints.push(orderBy(orderByField));
      
      // Add limit
      queryConstraints.push(limit(limitCount));
      
      // Add start after for pagination
      if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }
      
      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { 
        success: true, 
        data, 
        lastVisible: lastVisibleDoc,
        hasMore: querySnapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('Get paginated collection error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export instance
const firestoreService = new FirestoreService();
export default firestoreService;