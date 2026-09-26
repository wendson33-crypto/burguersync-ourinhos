/**
 * Layer 3: GitHub Deterministic Repository Publisher via REST API
 * BurguerSync Ourinhos
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './validate-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REPO_NAME = 'burguersync-ourinhos';
const REPO_DESCRIPTION = 'BurguerSync Ourinhos - Plataforma de Autoatendimento e KDS Realtime com Google Antigravity, Google Stitch e Firebase Firestore';

async function githubRequest(endpoint, method = 'GET', body = null, token = '') {
  const url = `https://api.github.com${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'Antigravity-Deployer-v2',
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok && response.status !== 404 && response.status !== 409) {
    const errorMsg = data.message || JSON.stringify(data);
    throw new Error(`GitHub API Error [${response.status}] em ${method} ${endpoint}: ${errorMsg}`);
  }

  return { status: response.status, data };
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    // Ignora pastas proibidas ou arquivos com credenciais sensíveis
    if (
      file === 'node_modules' || 
      file === '.tmp' || 
      file === '.git' || 
      file === '.env' ||
      file === 'mcp-server.json' ||
      file.endsWith('.log')
    ) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push({
        fullPath,
        relativePath
      });
    }
  });

  return arrayOfFiles;
}

export async function publishToGitHub() {
  console.log('🚀 ========================================================');
  console.log('🚀 Publicador Automatizado GitHub REST API - BurguerSync');
  console.log('🚀 ========================================================');

  const env = loadEnv();
  const token = env.GITHUB_PERSONA_KEY;

  if (!token) {
    throw new Error('Token GITHUB_PERSONA_KEY não encontrado no .env');
  }

  // 1. Obter usuário autenticado
  console.log('🔑 Autenticando com a API do GitHub...');
  const userRes = await githubRequest('/user', 'GET', null, token);
  if (userRes.status !== 200) {
    throw new Error(`Falha na autenticação do GitHub: ${JSON.stringify(userRes.data)}`);
  }
  const username = userRes.data.login;
  console.log(`👤 Usuário autenticado: @${username}`);

  // 2. Verificar se o repositório existe
  console.log(`🔍 Verificando existência do repositório '${username}/${REPO_NAME}'...`);
  let checkRepo = await githubRequest(`/repos/${username}/${REPO_NAME}`, 'GET', null, token);
  let repoData;

  if (checkRepo.status === 404) {
    console.log(`✨ Criando novo repositório '${REPO_NAME}' no GitHub...`);
    const createRepo = await githubRequest('/user/repos', 'POST', {
      name: REPO_NAME,
      description: REPO_DESCRIPTION,
      private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: false,
      auto_init: true
    }, token);

    if (createRepo.status !== 201) {
      throw new Error(`Falha ao criar repositório: ${JSON.stringify(createRepo.data)}`);
    }
    repoData = createRepo.data;
    console.log(`✅ Repositório criado com sucesso: ${repoData.html_url}`);
  } else {
    repoData = checkRepo.data;
    console.log(`✅ Repositório existente encontrado: ${repoData.html_url}`);
  }

  // Se o repositório estiver vazio, inicializa com o primeiro arquivo via Contents API
  const checkBranch = await githubRequest(`/repos/${username}/${REPO_NAME}/git/refs/heads/main`, 'GET', null, token);
  if (checkBranch.status === 404 || checkBranch.status === 409) {
    console.log('🌱 Repositório vazio. Inicializando commit base via Contents API...');
    const readmeContent = fs.existsSync(path.join(rootDir, 'README.md')) 
      ? fs.readFileSync(path.join(rootDir, 'README.md'), 'utf-8')
      : '# BurguerSync Ourinhos';
    
    const initRes = await githubRequest(`/repos/${username}/${REPO_NAME}/contents/README.md`, 'PUT', {
      message: 'Initial commit: BurguerSync Ourinhos',
      content: Buffer.from(readmeContent).toString('base64')
    }, token);

    if (initRes.status !== 200 && initRes.status !== 201) {
      throw new Error(`Falha ao inicializar commit no repositório: ${JSON.stringify(initRes.data)}`);
    }
    console.log('✅ Commit base criado com sucesso!');
    await new Promise(r => setTimeout(r, 1500));
  }

  // 3. Coletar arquivos do projeto
  const allFiles = getAllFiles(rootDir);
  console.log(`📁 Encontrados ${allFiles.length} arquivos para upload no repositório.`);

  // 4. Criar Blobs para cada arquivo
  console.log('📤 Enviando conteúdo dos arquivos (Git Blobs)...');
  const treeItems = [];

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const content = fs.readFileSync(file.fullPath);
    const base64Content = content.toString('base64');

    const blobRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/blobs`, 'POST', {
      content: base64Content,
      encoding: 'base64'
    }, token);

    if (blobRes.status !== 201) {
      throw new Error(`Falha ao criar blob para ${file.relativePath}: ${JSON.stringify(blobRes.data)}`);
    }

    treeItems.push({
      path: file.relativePath,
      mode: '100644',
      type: 'blob',
      sha: blobRes.data.sha
    });

    if ((i + 1) % 20 === 0 || i === allFiles.length - 1) {
      console.log(`   - Blobs enviados: ${i + 1}/${allFiles.length}`);
    }
  }

  // 5. Criar Git Tree
  console.log('🌳 Criando árvore de arquivos Git Tree...');
  const treeRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/trees`, 'POST', {
    tree: treeItems
  }, token);

  if (treeRes.status !== 201) {
    throw new Error(`Falha ao criar Git Tree: ${JSON.stringify(treeRes.data)}`);
  }
  const treeSha = treeRes.data.sha;
  console.log(`✅ Git Tree criado: ${treeSha.substring(0, 7)}`);

  // 6. Obter commit pai
  let parentCommitSha = null;
  const refRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/refs/heads/main`, 'GET', null, token);
  if (refRes.status === 200) {
    parentCommitSha = refRes.data.object.sha;
    console.log(`📌 Commit pai: ${parentCommitSha.substring(0, 7)}`);
  }

  // 7. Criar Commit
  console.log('📝 Criando Commit com a árvore completa...');
  const commitPayload = {
    message: '🚀 BurguerSync Ourinhos: Release com Google Antigravity, Google Stitch e Firebase Realtime',
    tree: treeSha,
    parents: parentCommitSha ? [parentCommitSha] : []
  };

  const commitRes = await githubRequest(`/repos/${username}/${REPO_NAME}/git/commits`, 'POST', commitPayload, token);
  if (commitRes.status !== 201) {
    throw new Error(`Falha ao criar commit: ${JSON.stringify(commitRes.data)}`);
  }
  const newCommitSha = commitRes.data.sha;
  console.log(`✅ Commit criado com sucesso: ${newCommitSha.substring(0, 7)}`);

  // 8. Atualizar branch main
  console.log('🔄 Atualizando branch main no GitHub...');
  await githubRequest(`/repos/${username}/${REPO_NAME}/git/refs/heads/main`, 'PATCH', {
    sha: newCommitSha,
    force: true
  }, token);

  // 9. Configurar GitHub Pages
  try {
    console.log('🌐 Configurando GitHub Pages no branch main...');
    await githubRequest(`/repos/${username}/${REPO_NAME}/pages`, 'POST', {
      source: {
        branch: 'main',
        path: '/'
      }
    }, token);
    console.log('✅ GitHub Pages configurado!');
  } catch (pagesErr) {
    console.log('ℹ️ GitHub Pages status:', pagesErr.message);
  }

  console.log('\n🎉 ========================================================');
  console.log(`🎉 PROJETO PUBLICADO COM SUCESSO NO GITHUB!`);
  console.log(`🔗 Repositório: https://github.com/${username}/${REPO_NAME}`);
  console.log(`🌐 GitHub Pages: https://${username}.github.io/${REPO_NAME}/`);
  console.log('🎉 ========================================================');

  return {
    repoUrl: `https://github.com/${username}/${REPO_NAME}`,
    pagesUrl: `https://${username}.github.io/${REPO_NAME}/`
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  publishToGitHub().catch(err => {
    console.error('❌ Falha na publicação:', err.message);
    process.exit(1);
  });
}
