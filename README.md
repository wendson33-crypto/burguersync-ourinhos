# 🍔 BurguerSync Ourinhos · Realtime KDS & Autoatendimento

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Antigravity-IA%20Agentic-orange?style=for-the-badge&logo=google" alt="Google Antigravity">
  <img src="https://img.shields.io/badge/Google%20Stitch-Design%20System-blue?style=for-the-badge&logo=google" alt="Google Stitch">
  <img src="https://img.shields.io/badge/Firebase-Firestore%20Realtime-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Firestore">
  <img src="https://img.shields.io/badge/Frontend-ESM%20%2B%20CSS3%20Neon-04D361?style=for-the-badge&logo=javascript" alt="Frontend">
  <img src="https://img.shields.io/badge/Arquitetura-3%20Camadas%20(SOP)-purple?style=for-the-badge" alt="Arquitetura">
</p>

---

## 🇧🇷 Português (Brasil)

### 📌 Sobre o Projeto
O **BurguerSync Ourinhos** é uma plataforma completa de autoatendimento e controle de pedidos para hamburguerias artesanais, inspirada no visual moderno Dark Mode High-Contrast (estilo iFood) com sincronização em tempo real para painel de cozinha (**Kitchen Display System - KDS**).

O sistema elimina comandas de papel e atrasos operacionais: quando o cliente conclui o pedido pelo cardápio, a comanda surge instantaneamente na tela da chapa da cozinha sem necessidade de recarregar a página (Zero Refresh via **Firebase Firestore Realtime**).

### ✨ Principais Funcionalidades
- 🍔 **Cardápio Artesanal & Vitrine Interativa:** Seleção de categorias (Smash & Blends, Porções, Bebidas) com fotos em alta definição integradas via Google Stitch.
- 🛠️ **Customizador de Lanches (Modal Dinâmico):** Escolha do ponto da carne, adicionais artesanais com contadores individuais, remoção de ingredientes e observações personalizadas.
- 🛒 **Carrinho Inteligente & Checkout:** Resumo financeiro instantâneo com cálculo de subtotal, taxa fixa de entrega (R$ 5,00) e cálculo automático de troco.
- ⚡ **Pagamento com Modal Pix:** Suporte a Pix Copia e Cola, Cartão na Entrega e Dinheiro.
- 👨‍🍳 **Painel KDS Realtime com Efeitos Sonoros:** Lista reativa com fluxo de status operacional (`Recebido` ➔ `Em Preparo` ➔ `Saiu para Entrega` ➔ `Entregue`).
- 🔄 **Resiliência e Self-Annealing:** Reconexão automática com backoff exponencial no listener do Firestore.

### 🤖 Engenharia com Google Antigravity
Este projeto foi desenvolvido e orquestrado utilizando o **Google Antigravity**, aplicando:
- **Arquitetura em 3 Camadas:**
  - *Layer 1 (Diretivas/SOPs):* Especificação de negócio e design em `/directives/`.
  - *Layer 2 (Orquestrador IA):* Inteligência de decisão e auto-recuperação.
  - *Layer 3 (Execução Determinística):* Scripts modulares em `/execution/` e `/frontend/`.
- **Skill Packs & Integrações:** `StitchMCP` (Design System e Prototipação UI), `Firebase Firestore` e automação CI/CD.

### 🚀 Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/wendson33-crypto/burguersync-ourinhos.git
   cd burguersync-ourinhos
   ```
2. **Inicialização Rápida no Windows:**
   Dê um duplo clique no arquivo `executar.bat` ou execute no terminal:
   ```bash
   npm start
   ```
3. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000)

---

## 🇺🇸 English

### 📌 About the Project
**BurguerSync Ourinhos** is a full-stack real-time self-service and kitchen management platform for craft burger restaurants. Built with a high-contrast Neon Dark Mode aesthetic (inspired by apps like iFood and Rappi), it connects customer orders with an instant **Kitchen Display System (KDS)**.

### ✨ Key Features
- 🍔 **Craft Burger Catalog:** Dynamic category filtering and high-res imagery generated with Google Stitch.
- 🛠️ **Burger Customizer Modal:** Patty doneness selection, artisan extra toppings, ingredient removal, and special notes.
- 🛒 **Realtime Cart & Checkout:** Instant subtotal calculations, fixed R$ 5.00 delivery fee, and change calculator for cash payments.
- ⚡ **Pix & Multi-Payment Checkout:** Seamless Pix copy-and-paste modal, card on delivery, and cash.
- 👨‍🍳 **Realtime KDS Dashboard:** Zero-refresh reactive board using Firebase Firestore `onSnapshot` with sound alerts and status state transitions (`Received` ➔ `In Prep` ➔ `Out for Delivery` ➔ `Delivered`).

### 🤖 Built with Google Antigravity
- **3-Layer Architecture:** Pure separation between business directives (`/directives`), AI decision orchestration, and deterministic execution (`/execution`, `/frontend`).
- **Google Stitch Integration:** Visual tokens, design system synchronization, and production-ready UI components.

---

### 📂 Project Structure / Estrutura de Pastas

```
├── .env                       # Environment credentials (Firebase & GitHub)
├── executar.bat               # Windows quick launch script
├── index.html                 # Root entrypoint
├── instruction.md             # Developer CLI handbook
├── README.md                  # Bilingual documentation
├── /frontend                  # Client UI & Realtime Web App
│   ├── index.html
│   ├── style.css              # Neon Dark Mode Design System
│   └── /js
│       ├── app.js             # Application bootstrap & UI logic
│       ├── cart-controller.js # Cart state & customization modal
│       ├── firebase-config.js # Firebase SDK Web v10 initialization
│       └── kds-realtime.js    # Firestore realtime listener & KDS
├── /backend                   # Firestore Rules & Schemas
│   ├── firebase.json
│   ├── firestore.indexes.json
│   ├── firestore.rules        # Security rules
│   └── schema.json            # JSON schema validation
├── /directives                # Business Directives & Design Specs (Layer 1)
│   ├── projeto.md
│   └── /desing/desing.md
├── /documentation             # System docs & session prompt history
│   ├── architecture.md
│   ├── api-firestore.md
│   └── promptHistory.md
└── /execution                 # Deterministic scripts (Layer 3)
    ├── publish-github.js      # GitHub REST API publishing tool
    ├── server.js              # Native local server
    ├── test-runner.js         # Automated test suite
    └── validate-env.js        # Environment validator
```

---
*Developed with ❤️ using Google Antigravity & SENAI Ourinhos standards.*
