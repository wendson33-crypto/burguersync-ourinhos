/**
 * Layer 2 & 3: Orquestração do Frontend & Bootstrap
 * BurguerSync Ourinhos
 */

import { 
  pedidosCollection, 
  addDoc, 
  serverTimestamp 
} from './firebase-config.js';

import { 
  PRODUTOS, 
  CartController, 
  TAXA_ENTREGA 
} from './cart-controller.js';

import { KDSController } from './kds-realtime.js';

// Gerenciador de Toast
let toastTimeout;
export function showToast(mensagem, icone = '✅') {
  const toast = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastMessage');
  const toastIcon = toast ? toast.querySelector('.toast-icon') : null;

  if (!toast || !toastText) return;

  toastText.textContent = mensagem;
  if (toastIcon) toastIcon.textContent = icone;
  toast.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3800);
}

// Inicializa controladores
export const cart = new CartController(() => {}, (msg) => showToast(msg));
export const kds = new KDSController((msg) => showToast(msg, '🔔'));

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
  renderizarCatalogo('todos');
  cart.renderizarCarrinho();
  kds.iniciarEscutadorRealtime();
  configurarEventosUI();
});

// Renderização do Catálogo de Produtos
export function renderizarCatalogo(filtro = 'todos') {
  const grade = document.getElementById('gradeLanches');
  if (!grade) return;
  grade.innerHTML = '';

  const filtrados = filtro === 'todos' 
    ? PRODUTOS 
    : PRODUTOS.filter(p => p.categoria === filtro);

  filtrados.forEach(prod => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', prod.id);

    card.innerHTML = `
      <div class="product-image-container">
        <img src="${prod.imagem}" alt="${prod.nome}" class="product-image" loading="lazy">
        <span class="badge-tag">${prod.badge}</span>
      </div>
      <div class="product-info">
        <h3 class="product-name">${prod.nome}</h3>
        <p class="product-description">${prod.descricao}</p>
        <div class="product-bottom">
          <span class="product-price">R$ ${prod.preco.toFixed(2).replace('.', ',')}</span>
          <button class="btn-add-cart" type="button" data-id="${prod.id}">
            <span>+ Adicionar</span>
          </button>
        </div>
      </div>
    `;

    // Clique no card ou no botão abre o modal de personalização
    card.onclick = (e) => {
      cart.abrirCustomizador(prod.id);
    };

    const btnAdd = card.querySelector('.btn-add-cart');
    btnAdd.onclick = (e) => {
      e.stopPropagation();
      cart.abrirCustomizador(prod.id);
    };

    grade.appendChild(card);
  });
}

// Configuração de Eventos Globais da Interface
function configurarEventosUI() {
  // Navegação entre Tabs (Cardápio vs Cozinha)
  const btnCliente = document.getElementById('btnModoCliente');
  const btnCozinha = document.getElementById('btnModoCozinha');

  if (btnCliente) {
    btnCliente.onclick = () => alternarVisao('cliente');
  }
  if (btnCozinha) {
    btnCozinha.onclick = () => alternarVisao('cozinha');
  }

  // Filtro de Categorias
  const catBtns = document.querySelectorAll('.cat-btn');
  catBtns.forEach(btn => {
    btn.onclick = () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const categoria = btn.getAttribute('data-cat') || 'todos';
      renderizarCatalogo(categoria);
    };
  });

  // Modal de Customização
  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) {
    btnCloseModal.onclick = () => cart.fecharModal();
  }

  const modalCustom = document.getElementById('modalCustomizacao');
  if (modalCustom) {
    modalCustom.onclick = (e) => {
      if (e.target.id === 'modalCustomizacao') {
        cart.fecharModal();
      }
    };
  }

  const btnDecModal = document.getElementById('btnDecModal');
  const btnIncModal = document.getElementById('btnIncModal');
  if (btnDecModal) btnDecModal.onclick = () => cart.alterarQtdModal(-1);
  if (btnIncModal) btnIncModal.onclick = () => cart.alterarQtdModal(1);

  const btnConfirmModal = document.getElementById('btnConfirmModal');
  if (btnConfirmModal) {
    btnConfirmModal.onclick = () => cart.confirmarAdicao();
  }

  const notesArea = document.getElementById('modalObsTexto');
  if (notesArea) {
    notesArea.oninput = () => {
      const charCount = document.getElementById('modalNotasCharCount');
      if (charCount) charCount.textContent = `${notesArea.value.length}/140`;
    };
  }

  // Opções de Pagamento (Toggle Troco)
  const radiosPag = document.querySelectorAll('input[name="tipoPagamento"]');
  radiosPag.forEach(r => {
    r.onchange = () => {
      const trocoContainer = document.getElementById('trocoContainer');
      const valorTroco = document.getElementById('valorTroco');
      if (r.value === 'dinheiro' && r.checked) {
        if (trocoContainer) trocoContainer.classList.remove('hidden');
        if (valorTroco) valorTroco.focus();
      } else {
        if (trocoContainer) trocoContainer.classList.add('hidden');
      }
    };
  });

  // Formatação de Máscara de Telefone (14) 99881-2233
  const telInput = document.getElementById('telefoneCliente');
  if (telInput) {
    telInput.oninput = (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);
      if (v.length > 6) {
        v = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      } else if (v.length > 2) {
        v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
      }
      e.target.value = v;
    };
  }

  // Formatação de Troco em Moeda
  const trocoInput = document.getElementById('valorTroco');
  if (trocoInput) {
    trocoInput.oninput = (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (!v) {
        e.target.value = '';
        return;
      }
      v = (parseInt(v) / 100).toFixed(2).replace('.', ',');
      v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
      v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
      e.target.value = `R$ ${v}`;
    };
  }

  // Submissão do Formulário de Checkout
  const formCheckout = document.getElementById('formCheckout');
  if (formCheckout) {
    formCheckout.onsubmit = handleEnviarPedido;
  }

  // Modal Pix Fechar
  const btnClosePix = document.getElementById('btnClosePixModal');
  if (btnClosePix) {
    btnClosePix.onclick = () => {
      const modalPix = document.getElementById('modalPixSucesso');
      if (modalPix) modalPix.classList.add('hidden');
      alternarVisao('cozinha');
    };
  }

  // Botão Copiar Pix
  const btnCopyPix = document.getElementById('btnCopyPix');
  if (btnCopyPix) {
    btnCopyPix.onclick = () => {
      const chavePix = document.getElementById('pixChaveValor').textContent;
      navigator.clipboard.writeText(chavePix).then(() => {
        showToast('📋 Chave Pix copiada com sucesso!');
      }).catch(() => {
        showToast('Chave Pix selecionada para cópia!');
      });
    };
  }
}

// Alternância entre Visão Cliente e Cozinha
export function alternarVisao(visao) {
  const visaoCliente = document.getElementById('visaoCliente');
  const visaoCozinha = document.getElementById('visaoCozinha');
  const btnCliente = document.getElementById('btnModoCliente');
  const btnCozinha = document.getElementById('btnModoCozinha');

  if (visao === 'cliente') {
    if (visaoCliente) visaoCliente.classList.remove('hidden');
    if (visaoCozinha) visaoCozinha.classList.add('hidden');
    if (btnCliente) btnCliente.classList.add('active');
    if (btnCozinha) btnCozinha.classList.remove('active');
  } else {
    if (visaoCliente) visaoCliente.classList.add('hidden');
    if (visaoCozinha) visaoCozinha.classList.remove('hidden');
    if (btnCliente) btnCliente.classList.remove('active');
    if (btnCozinha) btnCozinha.classList.add('active');
  }
}

// Envio do Pedido para o Firestore
async function handleEnviarPedido(e) {
  e.preventDefault();

  if (cart.carrinho.length === 0) {
    showToast('Adicione pelo menos um lanche ao carrinho!', '⚠️');
    return;
  }

  const nome = document.getElementById('nomeCliente').value.trim();
  const celular = document.getElementById('telefoneCliente').value.trim();
  const endereco = document.getElementById('enderecoCliente').value.trim();
  const obsEntrega = document.getElementById('referenciaEntrega').value.trim();
  const radioChecked = document.querySelector('input[name="tipoPagamento"]:checked');
  const tipoPagamento = radioChecked ? radioChecked.value : 'pix';
  const trocoPara = document.getElementById('valorTroco').value.trim();

  if (!nome || !celular || !endereco) {
    showToast('Preencha os campos obrigatórios de entrega!', '⚠️');
    return;
  }

  const btnSubmit = document.getElementById('btnFinalizarPedido');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span>Enviando para a Cozinha...</span> ⏳`;
  }

  const { subtotal, taxaEntrega, total } = cart.calcularTotais();
  const agora = new Date();
  const horaStr = agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const numeroPedido = Math.floor(100 + Math.random() * 900); // Ex: 412

  // Constrói objeto do pedido de acordo com o Schema
  const pedidoData = {
    numeroPedido: numeroPedido,
    horario: horaStr,
    criadoEm: agora.toISOString(),
    status: 'Recebido',
    cliente: {
      nome,
      celular,
      endereco,
      obsEntrega: obsEntrega || ''
    },
    itens: cart.carrinho.map(item => ({
      id: item.produtoId,
      nome: item.nome,
      preco: item.precoUnitarioTotal || item.precoBase,
      quantidade: item.quantidade,
      pontoCarne: item.pontoCarne || '',
      adicionaisTexto: item.adicionaisTexto || '',
      remocoesTexto: item.remocoesTexto || '',
      obsItem: item.obs || ''
    })),
    pagamento: {
      metodo: tipoPagamento === 'pix' ? 'Pix' : (tipoPagamento === 'cartao' ? 'Cartão na Entrega' : 'Dinheiro na Entrega'),
      trocoPara: tipoPagamento === 'dinheiro' ? trocoPara : ''
    },
    valores: {
      subtotal,
      taxaEntrega,
      total
    }
  };

  try {
    console.log('📦 Gravando pedido no Firestore...', pedidoData);
    const docRef = await addDoc(pedidosCollection, pedidoData);
    console.log('✅ Pedido gravado com sucesso! ID:', docRef.id);

    // Limpa formulário e carrinho
    cart.limparCarrinho();
    document.getElementById('formCheckout').reset();
    const trocoContainer = document.getElementById('trocoContainer');
    if (trocoContainer) trocoContainer.classList.add('hidden');

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>Confirmar e Enviar Pedido</span> <span class="icon-arrow">➔</span>`;
    }

    if (tipoPagamento === 'pix') {
      exibirModalPix(numeroPedido, total);
    } else {
      showToast(`🎉 Pedido #${numeroPedido} enviado para a chapa com sucesso!`);
      setTimeout(() => {
        alternarVisao('cozinha');
      }, 1200);
    }

  } catch (error) {
    console.error('❌ Erro ao salvar pedido no Firestore:', error);
    showToast(`Erro ao enviar pedido: ${error.message}`, '❌');

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>Tentar Novamente</span> <span class="icon-arrow">➔</span>`;
    }
  }
}

// Exibe o modal de instrução Pix
function exibirModalPix(numPedido, valorTotal) {
  const modalPix = document.getElementById('modalPixSucesso');
  const numSpan = document.getElementById('pixNumPedido');
  const valSpan = document.getElementById('pixValorTotal');

  if (numSpan) numSpan.textContent = `#${numPedido}`;
  if (valSpan) valSpan.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;

  if (modalPix) {
    modalPix.classList.remove('hidden');
  }
}
