/**
 * Layer 3: Execution - Configuração e Inicialização do Firebase Firestore SDK v10
 * BurguerSync Ourinhos
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  enableIndexedDbPersistence
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Configuração do Firebase carregada a partir do projeto
export const firebaseConfig = {
  apiKey: "AIzaSyD7uwlZZbsd2NtFPJPL5TLytQ5ClmeTc0M",
  authDomain: "burguersyncwendson.firebaseapp.com",
  projectId: "burguersyncwendson",
  storageBucket: "burguersyncwendson.firebasestorage.app",
  messagingSenderId: "771458306472",
  appId: "1:771458306472:web:3cea339940fd66b37c4d9d"
};

// Inicializa a aplicação Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Referência para a coleção principal de pedidos
export const pedidosCollection = collection(db, 'pedidos');

// Utilitários exportados para uso determinístico
export {
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
};

console.log('🔥 Firebase SDK v10 inicializado com sucesso para o projeto:', firebaseConfig.projectId);
