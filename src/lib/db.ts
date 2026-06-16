import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  addDoc,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "./firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const db_ops = {
  get: async <T>(path: string, id: string): Promise<T | null> => {
    try {
      const docRef = doc(db, path, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as T) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${path}/${id}`);
      return null;
    }
  },
  
  list: async <T>(path: string, constraints: any[] = []): Promise<T[]> => {
    try {
      const colRef = collection(db, path);
      const q = query(colRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },
  
  create: async <T>(path: string, data: any, id?: string): Promise<string> => {
    try {
      const payload = {
        ...data,
        createdAt: serverTimestamp(),
      };
      if (id) {
        await setDoc(doc(db, path, id), payload);
        return id;
      } else {
        const docRef = await addDoc(collection(db, path), payload);
        return docRef.id;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return "";
    }
  },
  
  update: async (path: string, id: string, data: any): Promise<void> => {
    try {
      const docRef = doc(db, path, id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
    }
  },
  
  delete: async (path: string, id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  },

  subscribe: (path: string, constraints: any[], callback: (data: any[]) => void) => {
    const q = query(collection(db, path), ...constraints);
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};
