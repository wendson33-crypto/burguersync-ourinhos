# 🛠️ Guia de Instruções & Comandos CLI - BurguerSync Ourinhos

Este documento reúne todos os comandos de terminal necessários para inicializar, testar, validar e publicar a aplicação **BurguerSync Ourinhos**.

---

## 🚀 1. Inicialização Rápida (Windows)

Dê um duplo clique no arquivo:
```bat
executar.bat
```
Ou execute via terminal:
```bash
npm start
```
*O servidor local inicializará na porta `3000` e abrirá seu navegador automaticamente em `http://localhost:3000`.*

---

## 🧪 2. Validação de Ambiente e Testes Automatizados

### Validar credenciais do `.env`:
```bash
npm run validate
```

### Executar bateria de testes com auditoria:
```bash
npm test
```
*Gera relatórios em `.tmp/reports/audit_report.json` e trilha de self-annealing em `.tmp/annealing_log.md`.*

---

## 🌐 3. Publicação no GitHub & Deploy

Para criar o repositório remoto no GitHub do usuário e fazer o commit de todos os arquivos via API REST:
```bash
npm run publish:github
```

---

## 📁 4. Estrutura de Arquivos

* `/frontend`: Interface web do cliente e painel KDS em tempo real (HTML5, CSS3 Neon, Módulos ESM).
* `/backend`: Regras de segurança do Firestore (`firestore.rules`) e esquemas de dados (`schema.json`).
* `/execution`: Scripts determinísticos de automação (servidor, testes, validação e deploy).
* `/directives`: Especificações e SOPs de negócio e design do projeto.
* `/documentation`: Documentações técnicas e histórico integral de prompts (`promptHistory.md`).

---
*BurguerSync Ourinhos · Desenvolvido com Google Antigravity & Stitch*
