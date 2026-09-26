/**
 * Layer 1 & 3: Lógica de Carrinho & Customizador de Lanches
 * BurguerSync Ourinhos
 */

export const TAXA_ENTREGA = 5.00;

export const PRODUTOS = [
  {
    id: 1,
    categoria: 'smash',
    nome: "Ourinhos Smash Burguer",
    descricao: "Pão brioche tostado na manteiga, 2x smash artesanais 80g de costela, queijo cheddar derretido e bacon crocante.",
    preco: 28.00,
    badge: "Mais Vendido",
    imagem: "https://lh3.googleusercontent.com/aida/AEtjO1WL-N7iNyIf6Yl_zQ4MPy1Ss0R5_pIAwoqEs3GzLM0oxj2mopjHzfGhLnFAhTEtm7bGaCJ7EeBswyfGmUczPkEIw8avAUq3YbDgoqSPLdnIzNp-2b_7MONPR0tie2iYGFlq7sQxyhbrMBCZsAqrxiE2y-EJ9c3kCeoDH5PCWV6AbBLJBLBuL6HZYea-mVyNHHsHA-atawCeNmRx63KlKd39LEwEWQzSvaAfaLFWq5Q6038n8MmxSltSuw"
  },
  {
    id: 2,
    categoria: 'smash',
    nome: "Monster Bacon SENAI",
    descricao: "Pão australiano tostado, blend 200g grelhado na brasa, muito bacon artesanal, queijo cheddar e anéis de cebola crocantes.",
    preco: 34.00,
    badge: "Especial Chef",
    imagem: "https://lh3.googleusercontent.com/aida/AEtjO1XtS0w9a7OiBFpBfz_HS2b2Cb33UeEHUPhujzqgHfhIeguuBNA7pq940ryfCu_1hLyud3s2h9Md-0xtecZwpfTpoyqxs3QtPJ31eE8fA9_5IYTVF-CwuWIowhEgPodW3AR25gUlHZ_BGkTpJhIheJDVYa3gQ3P09oSN__qY7VaHbmVVb8JEvbGzelzyxThADJD_pz6N_ZyfKh75rSu1KHekw0edCJa3Tv-3mxpU0KQI4EIx27C348nSCQ"
  },
  {
    id: 3,
    categoria: 'smash',
    nome: "Crispy Chicken Burguer",
    descricao: "Sobrecoxa empanada super crocante, salada coleslaw cremosa da casa, picles e maionese verde de ervas.",
    preco: 29.90,
    badge: "Crocante",
    imagem: "https://lh3.googleusercontent.com/aida/AEtjO1X7ixdieTmcrmAq0aZJgkUo4BzJ7ckxXC7u_8PHR2eRKrOLL_iD2IFaFhfk_JYlV9cOzMeOYRWwJmjTC7gNrhFBzWq0gAmeZEEX6WejLTyC7s6qlqk6Gcf51D56F4TM6ty5kDVL2EpVCH3rSzqNKkOnfqAsn2-7-iXR_JRmcBBkIUidVJ5X0xnQyyVWPStEQGw_KzEE8raVQ84a5I0j6w4gz-yv6ofhTI_u9GYjiMkkg_AmbukTmTM1w"
  },
  {
    id: 4,
    categoria: 'porcoes',
    nome: "Batata Rústica Suprema",
    descricao: "Batatas rústicas com casca, temperadas com alecrim fresco e flor de sal. Acompanha molho de cheddar e bacon.",
    preco: 18.00,
    badge: "Porção Especial",
    imagem: "https://lh3.googleusercontent.com/aida/AEtjO1W0WOio7vWXXxa5DjerQgQxdUn3t1UkPCk7ex6EhRAY-CYevNSn41pLllUtOa6ZR4vyw2BB5xHeOxMGXkq4fxHiZnTmmT2TAvrbxSEZFCB4u6T-vXFd0KfCYYagTr_psSW12gfJaYpA3V5Dc756p-NIxs1kIb3KMUTtVMWDv9jbJ3pifS01c744KkbdEqqOX3St_z5FjJQF-Ii_PAeUEGrO5hY4ocU5yupFjXaPuifL7hVWw34eVsm0gQ"
  },
  {
    id: 5,
    categoria: 'bebidas',
    nome: "Coca-Cola Original 350ml",
    descricao: "Lata gelada 350ml.",
    preco: 6.50,
    badge: "Gelada",
    imagem: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 6,
    categoria: 'bebidas',
    nome: "Suco Natural de Laranja 500ml",
    descricao: "100% fruta natural espremida na hora, sem conservantes.",
    preco: 9.00,
    badge: "Natural",
    imagem: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=60"
  }
];

export const ADICIONAIS_CONFIG = [
  { id: 'bacon', nome: "Bacon Crocante Artesanal", preco: 5.00 },
  { id: 'cheddar', nome: "Queijo Cheddar Cremoso Extra", preco: 4.50 },
  { id: 'blend', nome: "Blend Smash Bovino Extra 80g", preco: 8.00 },
  { id: 'cebola', nome: "Cebola Caramelizada na Brasa", preco: 3.50 },
  { id: 'maionese', nome: "Maionese Verde da Casa", preco: 3.00 },
  { id: 'picles', nome: "Picles Artesanal Especial", preco: 2.50 }
];

export class CartController {
  constructor(onCartUpdated, onToast) {
    this.carrinho = [];
    this.produtoSendoCustomizado = null;
    this.qtdModalAtual = 1;
    this.adicionaisSelecionados = {};
    this.onCartUpdated = onCartUpdated || (() => {});
    this.onToast = onToast || (() => {});

    this.carregarDoLocalStorage();
  }

  carregarDoLocalStorage() {
    try {
      const salvo = localStorage.getItem('burguersync_cart');
      if (salvo) {
        this.carrinho = JSON.parse(salvo);
      }
    } catch (e) {
      console.warn('Não foi possível carregar carrinho do LocalStorage', e);
      this.carrinho = [];
    }
  }

  salvarNoLocalStorage() {
    try {
      localStorage.setItem('burguersync_cart', JSON.stringify(this.carrinho));
    } catch (e) {
      console.warn('Erro ao salvar carrinho no LocalStorage', e);
    }
  }

  abrirCustomizador(produtoId) {
    const produto = PRODUTOS.find(p => p.id === produtoId);
    if (!produto) return;

    this.produtoSendoCustomizado = produto;
    this.qtdModalAtual = 1;
    this.adicionaisSelecionados = {};

    // Popula modal no DOM
    const imgEl = document.getElementById('modalImgLanche');
    const titEl = document.getElementById('modalTituloLanche');
    const descEl = document.getElementById('modalDescLanche');
    const badgeEl = document.getElementById('modalBadgeLanche');

    if (imgEl) {
      imgEl.src = produto.imagem;
      imgEl.alt = produto.nome;
    }
    if (titEl) titEl.textContent = produto.nome;
    if (descEl) descEl.textContent = produto.descricao;
    if (badgeEl) badgeEl.textContent = produto.categoria === 'porcoes' ? 'Personalize sua Porção' : 'Personalize seu Burguer';

    // Se for bebida ou produto simples sem carne, esconde seção de ponto de carne
    const secPonto = document.getElementById('secPontoCarne');
    if (secPonto) {
      secPonto.style.display = produto.categoria === 'smash' ? 'block' : 'none';
    }

    // Reseta rádio de ponto da carne
    const pontoRadios = document.querySelectorAll('input[name="pontoCarne"]');
    if (pontoRadios.length > 0) pontoRadios[0].checked = true;

    // Reseta remoções
    document.querySelectorAll('input[name="removerIngrediente"]').forEach(chk => chk.checked = false);

    // Reseta observações
    const notas = document.getElementById('modalObsTexto');
    if (notas) {
      notas.value = '';
      const charCount = document.getElementById('modalNotasCharCount');
      if (charCount) charCount.textContent = '0/140';
    }

    // Renderiza lista de adicionais
    this.renderizarAdicionaisModal();

    // Atualiza quantidade e valor
    const qtdEl = document.getElementById('modalQtdLanche');
    if (qtdEl) qtdEl.textContent = this.qtdModalAtual;

    this.atualizarTotalModal();

    // Abre modal
    const modal = document.getElementById('modalCustomizacao');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }
  }

  renderizarAdicionaisModal() {
    const container = document.getElementById('listaAdicionaisModal');
    if (!container) return;
    container.innerHTML = '';

    ADICIONAIS_CONFIG.forEach(ad => {
      const qtdAtual = this.adicionaisSelecionados[ad.id] || 0;
      const itemDiv = document.createElement('div');
      itemDiv.className = `addon-item ${qtdAtual > 0 ? 'selected' : ''}`;
      itemDiv.id = `addon-row-${ad.id}`;

      itemDiv.innerHTML = `
        <div class="addon-info">
          <span class="addon-name">${ad.nome}</span>
          <span class="addon-price">+ R$ ${ad.preco.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="addon-counter">
          <button type="button" class="btn-addon-ctrl" data-id="${ad.id}" data-action="dec" aria-label="Remover adicional">-</button>
          <span class="addon-count-val" id="addon-val-${ad.id}">${qtdAtual}</span>
          <button type="button" class="btn-addon-ctrl" data-id="${ad.id}" data-action="inc" aria-label="Adicionar adicional">+</button>
        </div>
      `;

      itemDiv.querySelector('[data-action="dec"]').onclick = () => this.alterarQtdAdicional(ad.id, -1);
      itemDiv.querySelector('[data-action="inc"]').onclick = () => this.alterarQtdAdicional(ad.id, 1);

      container.appendChild(itemDiv);
    });
  }

  alterarQtdAdicional(adId, delta) {
    const atual = this.adicionaisSelecionados[adId] || 0;
    const novo = Math.max(0, atual + delta);
    if (novo === 0) {
      delete this.adicionaisSelecionados[adId];
    } else {
      this.adicionaisSelecionados[adId] = novo;
    }

    const valEl = document.getElementById(`addon-val-${adId}`);
    if (valEl) valEl.textContent = novo;

    const rowEl = document.getElementById(`addon-row-${adId}`);
    if (rowEl) {
      if (novo > 0) rowEl.classList.add('selected');
      else rowEl.classList.remove('selected');
    }

    this.atualizarTotalModal();
  }

  alterarQtdModal(delta) {
    this.qtdModalAtual = Math.max(1, this.qtdModalAtual + delta);
    const qtdEl = document.getElementById('modalQtdLanche');
    if (qtdEl) qtdEl.textContent = this.qtdModalAtual;
    this.atualizarTotalModal();
  }

  calcularPrecoUnitarioCustomizado() {
    if (!this.produtoSendoCustomizado) return 0;
    let unit = this.produtoSendoCustomizado.preco;

    for (const [adId, qtd] of Object.entries(this.adicionaisSelecionados)) {
      const itemCfg = ADICIONAIS_CONFIG.find(a => a.id === adId);
      if (itemCfg) {
        unit += itemCfg.preco * qtd;
      }
    }
    return unit;
  }

  atualizarTotalModal() {
    const unitario = this.calcularPrecoUnitarioCustomizado();
    const total = unitario * this.qtdModalAtual;
    const btnTotal = document.getElementById('modalPrecoTotalBtn');
    if (btnTotal) {
      btnTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
  }

  fecharModal() {
    const modal = document.getElementById('modalCustomizacao');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    this.produtoSendoCustomizado = null;
  }

  confirmarAdicao() {
    if (!this.produtoSendoCustomizado) return;

    const unitario = this.calcularPrecoUnitarioCustomizado();
    const pontoRadio = document.querySelector('input[name="pontoCarne"]:checked');
    const ponto = (this.produtoSendoCustomizado.categoria === 'smash' && pontoRadio) ? pontoRadio.value : '';

    const adicionaisArray = [];
    for (const [adId, qtd] of Object.entries(this.adicionaisSelecionados)) {
      if (qtd > 0) {
        const cfg = ADICIONAIS_CONFIG.find(a => a.id === adId);
        if (cfg) {
          adicionaisArray.push(`${qtd > 1 ? qtd + 'x ' : ''}${cfg.nome}`);
        }
      }
    }

    const remocoesArray = [];
    document.querySelectorAll('input[name="removerIngrediente"]:checked').forEach(chk => {
      remocoesArray.push(chk.value);
    });

    const notasEl = document.getElementById('modalObsTexto');
    const obsTexto = notasEl ? notasEl.value.trim() : '';

    const novoItem = {
      id: Date.now(),
      produtoId: this.produtoSendoCustomizado.id,
      nome: this.produtoSendoCustomizado.nome,
      precoUnitarioTotal: unitario,
      precoBase: this.produtoSendoCustomizado.preco,
      quantidade: this.qtdModalAtual,
      pontoCarne: ponto,
      adicionaisTexto: adicionaisArray.join(', '),
      remocoesTexto: remocoesArray.join(', '),
      obs: obsTexto
    };

    this.carrinho.push(novoItem);
    this.salvarNoLocalStorage();
    this.renderizarCarrinho();
    this.onToast(`+ ${this.qtdModalAtual}x ${this.produtoSendoCustomizado.nome} adicionado ao pedido!`);
    this.fecharModal();
  }

  alterarQuantidade(index, delta) {
    if (!this.carrinho[index]) return;
    this.carrinho[index].quantidade += delta;
    if (this.carrinho[index].quantidade <= 0) {
      this.carrinho.splice(index, 1);
    }
    this.salvarNoLocalStorage();
    this.renderizarCarrinho();
  }

  removerItem(index) {
    if (!this.carrinho[index]) return;
    this.carrinho.splice(index, 1);
    this.salvarNoLocalStorage();
    this.renderizarCarrinho();
    this.onToast("Item removido do pedido");
  }

  atualizarObsItem(index, valor) {
    if (this.carrinho[index]) {
      this.carrinho[index].obs = valor;
      this.salvarNoLocalStorage();
    }
  }

  limparCarrinho() {
    this.carrinho = [];
    this.salvarNoLocalStorage();
    this.renderizarCarrinho();
  }

  calcularTotais() {
    let subtotal = 0;
    let totalItens = 0;

    this.carrinho.forEach(item => {
      const preco = item.precoUnitarioTotal || item.preco || 0;
      subtotal += preco * item.quantidade;
      totalItens += item.quantidade;
    });

    const total = subtotal > 0 ? subtotal + TAXA_ENTREGA : 0;

    return {
      subtotal,
      taxaEntrega: subtotal > 0 ? TAXA_ENTREGA : 0,
      total,
      totalItens
    };
  }

  renderizarCarrinho() {
    const lista = document.getElementById('listaItensCarrinho');
    const subtotalEl = document.getElementById('subtotalPedido');
    const taxaEl = document.getElementById('taxaEntrega');
    const totalEl = document.getElementById('totalPedido');
    const countEl = document.getElementById('itensCountBadge');
    const btnSubmit = document.getElementById('btnFinalizarPedido');

    if (!lista) return;
    lista.innerHTML = '';

    const { subtotal, taxaEntrega, total, totalItens } = this.calcularTotais();

    if (this.carrinho.length === 0) {
      lista.innerHTML = `
        <li class="cart-empty-message">
          🛒 Seu carrinho está vazio.<br>
          <small style="color: var(--text-muted); display:inline-block; margin-top: 4px;">Escolha um lanche para começar!</small>
        </li>
      `;
      if (subtotalEl) subtotalEl.textContent = "R$ 0,00";
      if (taxaEl) taxaEl.textContent = "R$ 0,00";
      if (totalEl) totalEl.textContent = "R$ 0,00";
      if (countEl) countEl.textContent = "(0 itens)";
      if (btnSubmit) btnSubmit.disabled = true;
      this.onCartUpdated(this.carrinho);
      return;
    }

    if (btnSubmit) btnSubmit.disabled = false;

    this.carrinho.forEach((item, idx) => {
      const itemPrecoUnit = item.precoUnitarioTotal || item.preco || 0;
      const itemSubtotal = itemPrecoUnit * item.quantidade;

      let detalhesHtml = '';
      if (item.pontoCarne || item.adicionaisTexto || item.remocoesTexto) {
        detalhesHtml = `
          <div class="cart-item-customs">
            ${item.pontoCarne ? `<span>🥩 <strong>Ponto:</strong> ${item.pontoCarne}</span>` : ''}
            ${item.adicionaisTexto ? `<span>✨ <strong>Adicionais:</strong> ${item.adicionaisTexto}</span>` : ''}
            ${item.remocoesTexto ? `<span>🚫 <strong>Sem:</strong> ${item.remocoesTexto}</span>` : ''}
          </div>
        `;
      }

      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div class="cart-item-header">
          <span class="cart-item-title">${item.quantidade}x ${item.nome}</span>
          <span class="cart-item-subtotal">R$ ${itemSubtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        ${detalhesHtml}
        <input type="text" class="input-obs-item" placeholder="Obs: Ex. Sem picles, bem passado..." 
               value="${item.obs || ''}" aria-label="Observações do item">
        <div class="cart-item-actions">
          <div class="qty-counter">
            <button type="button" class="btn-qty btn-dec" aria-label="Diminuir">-</button>
            <span class="qty-value">${item.quantidade}</span>
            <button type="button" class="btn-qty btn-inc" aria-label="Aumentar">+</button>
          </div>
          <button type="button" class="btn-remove-item">Remover</button>
        </div>
      `;

      li.querySelector('.btn-dec').onclick = () => this.alterarQuantidade(idx, -1);
      li.querySelector('.btn-inc').onclick = () => this.alterarQuantidade(idx, 1);
      li.querySelector('.btn-remove-item').onclick = () => this.removerItem(idx);
      li.querySelector('.input-obs-item').onchange = (e) => this.atualizarObsItem(idx, e.target.value);

      lista.appendChild(li);
    });

    if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (taxaEl) taxaEl.textContent = `R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`;
    if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (countEl) countEl.textContent = `(${totalItens} ${totalItens === 1 ? 'item' : 'itens'})`;

    this.onCartUpdated(this.carrinho);
  }
}
