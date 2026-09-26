# 📡 Documentação de Integração Firebase Firestore Realtime

Este documento detalha o consumo e integração com o **Google Cloud Firestore NoSQL** em modo Realtime via SDK Web v10 e REST.

---

## 1. Configuração do SDK

A conexão utiliza módulos ESM nativos sem dependência de bundlers pesados:
```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
```

---

## 2. Operações Principais

### A. Criação de Pedido (Visão Cliente)
Disparado no envio do formulário de checkout:
```javascript
const docRef = await addDoc(collection(db, 'pedidos'), pedidoData);
```

### B. Escutador em Tempo Real com Backoff (Visão Cozinha KDS)
Permite a atualização instantânea das comandas na cozinha sem necessidade de recarregar a tela (zero refresh):
```javascript
const q = query(collection(db, 'pedidos'), orderBy('criadoEm', 'desc'));

onSnapshot(q, (snapshot) => {
  snapshot.forEach(doc => {
    const pedido = doc.data();
    // Renderiza card no KDS
  });
}, (error) => {
  // Tratamento com reconexão exponencial (1s, 2s, 4s, 8s, 16s)
});
```

### C. Transição de Status
Atualiza o status operacional do pedido:
```javascript
await updateDoc(doc(db, 'pedidos', idDoc), {
  status: 'Em Preparo',
  atualizadoEm: new Date().toISOString()
});
```

---

## 3. Regras de Segurança (Security Rules)
As regras definidas em `backend/firestore.rules` garantem a integridade dos dados, permitindo gravação somente com os campos obrigatórios e limitando transições de status válidas.
