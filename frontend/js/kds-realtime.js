/**
 * Layer 3: KDS Realtime Controller & Firestore Synchronization
 * BurguerSync Ourinhos
 */

import { 
  db, 
  pedidosCollection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc 
} from './firebase-config.js';

export class KDSController {
  constructor(onToast) {
    this.pedidos = [];
    this.unsubscribe = null;
    this.retryDelay = 1000;
    this.maxRetryDelay = 16000;
    this.onToast = onToast || (() => {});
    this.audioContext = null;
    this.primeiraCarga = true;
  }

  tocarSinoNovoPedido() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioContext.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not allowed yet without user interaction');
    }
  }

  iniciarEscutadorRealtime() {
    console.log('📡 Iniciando escutador em tempo real do Firestore no KDS...');
    
    // Consulta ordenada por horário descendente
    const q = query(pedidosCollection, orderBy('criadoEm', 'desc'));

    this.conectarComRetry(q);
  }

  conectarComRetry(q) {
    try {
      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          this.retryDelay = 1000; // Reseta backoff em caso de sucesso
          const pedidosAtualizados = [];

          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            pedidosAtualizados.push({
              idDoc: docSnapshot.id,
              ...data
            });
          });

          // Verifica se chegou pedido novo após a primeira carga
          if (!this.primeiraCarga && pedidosAtualizados.length > this.pedidos.length) {
            this.tocarSinoNovoPedido();
            const novo = pedidosAtualizados[0];
            this.onToast(`🔔 Nova comanda recebida: Pedido #${novo.numeroPedido || novo.idDoc.substring(0, 5)}!`);
          }

          this.primeiraCarga = false;
          this.pedidos = pedidosAtualizados;
          this.renderizarKDS();
          this.atualizarContadorBadge();
        },
        (error) => {
          console.error(`⚠️ Erro no Firestore onSnapshot: ${error.message}. Tentando reconectar em ${this.retryDelay}ms...`);
          
          // Fallback de backoff exponencial
          setTimeout(() => {
            this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);
            this.conectarComRetry(q);
          }, this.retryDelay);
        }
      );
    } catch (err) {
      console.error('Falha ao conectar listener Firestore:', err);
    }
  }

  async avancarStatus(idDoc, proximoStatus) {
    try {
      const pedidoRef = doc(db, 'pedidos', idDoc);
      await updateDoc(pedidoRef, {
        status: proximoStatus,
        atualizadoEm: new Date().toISOString()
      });

      const mensagens = {
        'preparo': '🔥 Comanda iniciada na chapa!',
        'entrega': '🛵 Pedido despachado para entrega!',
        'concluido': '✅ Pedido finalizado com sucesso!'
      };

      this.onToast(mensagens[proximoStatus] || `Status atualizado para ${proximoStatus}`);
    } catch (err) {
      console.error('Erro ao atualizar status no Firestore:', err);
      this.onToast(`❌ Erro ao atualizar status: ${err.message}`);
    }
  }

  formatarTempoRelativo(dataIso) {
    if (!dataIso) return 'agora';
    try {
      const data = new Date(dataIso);
      const diffMs = Date.now() - data.getTime();
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin <= 0) return 'agora mesmo';
      if (diffMin === 1) return 'há 1 min';
      if (diffMin < 60) return `há ${diffMin} min`;
      const diffHoras = Math.floor(diffMin / 60);
      return `há ${diffHoras}h`;
    } catch (e) {
      return 'recente';
    }
  }

  renderizarKDS() {
    const container = document.getElementById('listaPedidos');
    if (!container) return;
    container.innerHTML = '';

    if (this.pedidos.length === 0) {
      container.innerHTML = `
        <div class="kds-empty-state">
          <span style="font-size: 2.8rem; display:block; margin-bottom: 0.75rem;">👨‍🍳</span>
          <p style="font-size: 1.1rem; font-weight: 600;">Nenhuma comanda ativa no momento.</p>
          <small style="color: var(--text-muted); display:inline-block; margin-top: 4px;">Os pedidos enviados pelo cardápio aparecerão aqui instantaneamente.</small>
        </div>
      `;
      return;
    }

    this.pedidos.forEach(pedido => {
      const card = document.createElement('article');
      const statusNormalizado = (pedido.status || 'recebido').toLowerCase().replace(' ', '_');
      card.className = `order-kds-card state-${statusNormalizado}`;
      card.setAttribute('data-order-id', pedido.idDoc);

      let badgeClass = 'status-recebido';
      let badgeLabel = 'Recebido';
      let actionBtnHtml = '';

      if (statusNormalizado === 'recebido') {
        badgeClass = 'status-recebido';
        badgeLabel = 'Recebido';
        actionBtnHtml = `<button type="button" class="btn-step" data-action="preparo">Iniciar Preparo ➔</button>`;
      } else if (statusNormalizado === 'preparo' || statusNormalizado === 'em_preparo') {
        badgeClass = 'status-preparo';
        badgeLabel = 'Em Preparo';
        actionBtnHtml = `<button type="button" class="btn-step btn-step-entrega" data-action="entrega">Despachar 🛵</button>`;
      } else if (statusNormalizado === 'entrega' || statusNormalizado === 'saiu_para_entrega') {
        badgeClass = 'status-entrega';
        badgeLabel = 'Saiu p/ Entrega';
        actionBtnHtml = `<button type="button" class="btn-step btn-step-concluido" data-action="concluido">Finalizar Entrega ✅</button>`;
      } else if (statusNormalizado === 'concluido' || statusNormalizado === 'entregue') {
        badgeClass = 'status-concluido';
        badgeLabel = 'Entregue / Concluído';
        actionBtnHtml = `<span style="display:block; text-align:center; color: var(--accent-green); font-size: 0.813rem; font-weight:800; padding: 0.5rem 0;">Pedido Finalizado ✅</span>`;
      }

      const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
      const itemsHtml = itens.map(item => {
        let obsFormatada = item.obsItem || item.obs || '';
        const addons = Array.isArray(item.adicionais) ? item.adicionais.join(', ') : (item.adicionaisTexto || '');
        const removals = Array.isArray(item.remocoes) ? item.remocoes.join(', ') : (item.remocoesTexto || '');
        const ponto = item.pontoCarne ? `[${item.pontoCarne}]` : '';

        const tags = [];
        if (ponto) tags.push(ponto);
        if (addons) tags.push(`+ ${addons}`);
        if (removals) tags.push(`Sem: ${removals}`);
        if (obsFormatada) tags.push(`"${obsFormatada}"`);

        return `
          <li>
            <strong>${item.quantidade || item.qtd || 1}x</strong> ${item.nome}
            ${tags.length > 0 ? `<span class="item-alert-obs">⚠️ ${tags.join(' | ')}</span>` : ''}
          </li>
        `;
      }).join('');

      const horaExibida = pedido.horario || (pedido.criadoEm ? new Date(pedido.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '19:00');
      const tempoRelativo = this.formatarTempoRelativo(pedido.criadoEm);
      const clienteNome = (pedido.cliente && pedido.cliente.nome) || pedido.cliente || 'Cliente';
      const clienteCelular = (pedido.cliente && pedido.cliente.celular) || pedido.telefone || '';
      const clienteEndereco = (pedido.cliente && pedido.cliente.endereco) || pedido.endereco || '';
      const refEntrega = pedido.cliente && pedido.cliente.obsEntrega ? ` (${pedido.cliente.obsEntrega})` : '';
      const metodoPag = (pedido.pagamento && pedido.pagamento.metodo) || pedido.pagamento || 'Pix';
      const totalFormatado = pedido.valores && pedido.valores.total ? `R$ ${pedido.valores.total.toFixed(2).replace('.', ',')}` : (pedido.total || 'R$ 0,00');

      card.innerHTML = `
        <header class="order-kds-header">
          <div>
            <span class="order-number">Pedido #${pedido.numeroPedido || pedido.idDoc.substring(0, 5).toUpperCase()}</span>
            <span class="order-time">${horaExibida} (${tempoRelativo})</span>
          </div>
          <span class="status-badge ${badgeClass}">${badgeLabel}</span>
        </header>

        <div class="order-kds-body">
          <div class="customer-data">
            <strong>${clienteNome}</strong> · ${clienteCelular}<br>
            <small class="address-text">${clienteEndereco}${refEntrega}</small>
            <span class="order-payment-tag">${metodoPag} · Total: ${totalFormatado}</span>
          </div>

          <ul class="order-items-checklist">
            ${itemsHtml}
          </ul>
        </div>

        <footer class="order-kds-actions">
          ${actionBtnHtml}
        </footer>
      `;

      const btnAction = card.querySelector('.btn-step');
      if (btnAction) {
        const targetState = btnAction.getAttribute('data-action');
        btnAction.onclick = () => this.avancarStatus(pedido.idDoc, targetState);
      }

      container.appendChild(card);
    });
  }

  atualizarContadorBadge() {
    const badge = document.getElementById('contadorPedidosCozinha');
    if (!badge) return;
    const ativos = this.pedidos.filter(p => {
      const st = (p.status || '').toLowerCase();
      return st !== 'concluido' && st !== 'entregue';
    }).length;

    badge.textContent = ativos;
    badge.style.transform = 'scale(1.25)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 200);
  }
}
