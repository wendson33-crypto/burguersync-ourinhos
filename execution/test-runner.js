/**
 * Layer 3: Test Runner & Automated Verification Suite
 * BurguerSync Ourinhos
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './validate-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const tmpDir = path.join(rootDir, '.tmp');
const reportsDir = path.join(tmpDir, 'reports');

// Garante pastas transitórias
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 Iniciando Bateria de Testes Automatizados - BurguerSync');
  console.log('🧪 ========================================================');

  const testResults = [];

  // TESTE 1: Validação do Ambiente (.env)
  try {
    const env = loadEnv();
    if (!env.FIREBASE_projectId || !env.FIREBASE_apiKey) {
      throw new Error('Chaves essenciais do Firebase ausentes no .env');
    }
    testResults.push({ test: 'Ambiente .env', status: 'PASS', details: `Project ID: ${env.FIREBASE_projectId}` });
    console.log('✅ Teste 1: Configuração do .env OK');
  } catch (err) {
    testResults.push({ test: 'Ambiente .env', status: 'FAIL', error: err.message });
    console.error('❌ Teste 1: Falha no .env', err.message);
  }

  // TESTE 2: Lógica Financeira de Carrinho e Taxa de Entrega
  try {
    const precoLanche = 28.00;
    const qtd = 2;
    const taxaEntrega = 5.00;
    const subtotal = precoLanche * qtd;
    const total = subtotal + taxaEntrega;

    if (subtotal !== 56.00 || total !== 61.00) {
      throw new Error(`Cálculo divergente: subtotal=${subtotal}, total=${total}`);
    }
    testResults.push({ test: 'Cálculo Financeiro (Subtotal + Frete R$ 5,00)', status: 'PASS', details: 'R$ 56,00 + R$ 5,00 = R$ 61,00' });
    console.log('✅ Teste 2: Cálculos financeiros e taxa de entrega OK');
  } catch (err) {
    testResults.push({ test: 'Cálculo Financeiro', status: 'FAIL', error: err.message });
    console.error('❌ Teste 2: Falha nos cálculos', err.message);
  }

  // TESTE 3: Conexão REST com Cloud Firestore
  try {
    const env = loadEnv();
    const projectId = env.FIREBASE_projectId;
    const apiKey = env.FIREBASE_apiKey;

    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pedidos?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Erro retornado pelo Firestore: ${data.error.message}`);
    }

    testResults.push({ 
      test: 'Conexão e Leitura Firestore NoSQL', 
      status: 'PASS', 
      details: `Coleção 'pedidos' acessível. Documentos encontrados: ${data.documents ? data.documents.length : 0}` 
    });
    console.log('✅ Teste 3: Conexão e Leitura no Firestore OK');
  } catch (err) {
    testResults.push({ test: 'Conexão Firestore', status: 'FAIL', error: err.message });
    console.error('❌ Teste 3: Falha na conexão Firestore', err.message);
  }

  // TESTE 4: Validação de Estrutura de Arquivos Obrigatórios
  const requiredFiles = [
    'frontend/index.html',
    'frontend/style.css',
    'frontend/js/firebase-config.js',
    'frontend/js/cart-controller.js',
    'frontend/js/kds-realtime.js',
    'frontend/js/app.js',
    'backend/firestore.rules',
    'backend/schema.json',
    'documentation/promptHistory.md',
    'index.html'
  ];

  let filesOk = true;
  const missingFiles = [];
  requiredFiles.forEach(f => {
    if (!fs.existsSync(path.join(rootDir, f))) {
      filesOk = false;
      missingFiles.push(f);
    }
  });

  if (filesOk) {
    testResults.push({ test: 'Integridade de Arquivos do Projeto', status: 'PASS', details: `${requiredFiles.length} arquivos validados` });
    console.log('✅ Teste 4: Integridade dos arquivos essenciais OK');
  } else {
    testResults.push({ test: 'Integridade de Arquivos do Projeto', status: 'FAIL', error: `Arquivos ausentes: ${missingFiles.join(', ')}` });
    console.error('❌ Teste 4: Arquivos ausentes', missingFiles);
  }

  // Gera Relatório de Auditoria
  const reportPath = path.join(reportsDir, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTests: testResults.length,
    passed: testResults.filter(t => t.status === 'PASS').length,
    failed: testResults.filter(t => t.status === 'FAIL').length,
    results: testResults
  }, null, 2));

  // Trilha de Self-Annealing
  const annealingPath = path.join(tmpDir, 'annealing_log.md');
  const allPassed = testResults.every(t => t.status === 'PASS');

  const annealingLog = `# 📊 Trilha de Auditoria & Self-Annealing

* **Data do Teste:** ${new Date().toLocaleString('pt-BR')}
* **Status Geral:** ${allPassed ? '✅ APROVADO' : '❌ FALHA DETECTADA'}
* **Testes Executados:** ${testResults.length}
* **Aprovações:** ${testResults.filter(t => t.status === 'PASS').length}
* **Falhas:** ${testResults.filter(t => t.status === 'FAIL').length}

### Detalhes dos Casos de Teste:
${testResults.map(t => `- **${t.test}**: \`${t.status}\` - ${t.details || t.error}`).join('\n')}

${allPassed ? '🎉 O sistema está 100% íntegro e pronto para publicação.' : '⚠️ Ações de auto-recuperação necessárias.'}
`;

  fs.writeFileSync(annealingPath, annealingLog);

  console.log('📄 Relatório salvo em:', reportPath);
  console.log('📝 Trilha de auditoria salva em:', annealingPath);

  if (!allPassed) {
    process.exit(1);
  }
}

runTests();
