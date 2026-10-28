// ============================================================
//  NovoBanco — App Controller (dark theme + phone frame)
// ============================================================

const API = 'http://localhost:3000/api';

// ── Estado global ────────────────────────────────────────────
let estado = {
  usuario: null,
  contas: [],
  transacoes: [],
  cartoes: [],
  contatos: [],
  contaAtiva: null,
  saldoVisivel: false,
  confirmarCallback: null
};

// ── Utilitários ───────────────────────────────────────────────
function fmt(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(data, hora) {
  return new Date(data + 'T' + hora).toLocaleDateString('pt-BR') + ' ' + hora;
}

function categoriaIcon(cat) {
  const m = { pix: '📲', boleto: '🧾', ted: '🏦', salario: '💼', transferencia: '🔄' };
  return m[cat] || '💰';
}

function mostrarAlerta(msg, tipo = 'erro') {
  const el = document.getElementById('alerta');
  el.textContent = msg;
  el.className = `alerta alerta-${tipo} visivel`;
  setTimeout(() => el.classList.remove('visivel'), 3500);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.erro || 'Erro desconhecido');
  return json;
}

// ── Highlight pulsante do agente ─────────────────────────────
// Adiciona borda amarela pulsante ao elemento com o id "target"
// e remove após 4 segundos
let _highlightTimer = null;
function destacarElemento(targetId) {
  // Remove highlight anterior
  document.querySelectorAll('.agente-highlight')
    .forEach(el => el.classList.remove('agente-highlight'));
  if (_highlightTimer) clearTimeout(_highlightTimer);

  if (!targetId) return;

  const el = document.getElementById(targetId);
  if (!el) return;

  el.classList.add('agente-highlight');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  _highlightTimer = setTimeout(() => {
    el.classList.remove('agente-highlight');
  }, 4000);
}

// ── App principal ─────────────────────────────────────────────
const App = {

  // ── Login ──────────────────────────────────────────────────
  async login() {
    const cpf   = document.getElementById('input-cpf').value.trim();
    const senha = document.getElementById('input-senha').value.trim();
    if (!cpf || !senha) return mostrarAlerta('Preencha CPF e senha.');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ cpf, senha })
      });
      estado.usuario = data.usuario;
      await App.carregarDados();

      // Mostra elementos pós-login
      document.getElementById('bottom-nav').style.display  = 'flex';
      document.getElementById('agente-widget').classList.add('visivel');

      App.ir('dashboard');

      // Abre o chat com boas-vindas após 800ms
      setTimeout(() => {
        AgenteUI.abrir();
        AgenteUI.addMsg(Agente.boasVindas(estado.usuario.nome.split(' ')[0]), 'agente');
        AgenteUI.mostrarSugestoes(['Ver saldo', 'Fazer PIX', 'Pagar boleto', 'Ver extrato']);
      }, 800);

    } catch (e) {
      mostrarAlerta(e.message);
    }
  },

  // ── Carrega dados após login ────────────────────────────────
  async carregarDados() {
    const uid = estado.usuario.id;
    [estado.contas, estado.cartoes, estado.contatos] = await Promise.all([
      apiFetch('/conta/' + uid),
      apiFetch('/cartao/' + uid),
      apiFetch('/pix/contatos/lista')
    ]);
    estado.contaAtiva = estado.contas.find(c => c.tipo === 'Conta Corrente') || estado.contas[0];
    estado.transacoes = await apiFetch('/transacoes/' + estado.contaAtiva.id);
  },

  // ── Navegação entre telas ───────────────────────────────────
  ir(telaNome) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    const tela = document.getElementById('tela-' + telaNome);
    if (!tela) return;
    tela.classList.add('ativa');

    // Atualiza nav ativo
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('ativo'));
    const navMap = { dashboard: 'nav-home', extrato: 'nav-extrato', pix: 'nav-pix', cartao: 'nav-cartao', perfil: 'nav-perfil' };
    const navBtn = document.getElementById(navMap[telaNome]);
    if (navBtn) navBtn.classList.add('ativo');

    // Renderiza conteúdo
    const renders = {
      dashboard:    App.renderDashboard,
      extrato:      App.renderExtrato,
      pix:          App.renderPix,
      cartao:       App.renderCartao,
      perfil:       App.renderPerfil,
      'chaves-pix': App.renderChavesPix
    };
    if (renders[telaNome]) renders[telaNome]();
  },

  // ── Dashboard ───────────────────────────────────────────────
  renderDashboard() {
    if (!estado.contaAtiva) return;
    const u = estado.usuario;
    const h = new Date().getHours();
    const s = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    document.getElementById('dash-saudacao').textContent = `${s}, ${u.nome.split(' ')[0]}!`;
    document.getElementById('dash-conta').textContent =
      `${estado.contaAtiva.tipo} • Ag. ${estado.contaAtiva.agencia} • C/C ${estado.contaAtiva.numero}`;
    App.atualizarSaldo();
    const lista = document.getElementById('dash-transacoes');
    lista.innerHTML = estado.transacoes.slice(0, 5).map(App.htmlTransacao).join('');
  },

  atualizarSaldo() {
    const el = document.getElementById('dash-saldo');
    const btn = document.getElementById('btn-toggle-saldo');
    if (estado.saldoVisivel) {
      el.textContent  = fmt(estado.contaAtiva.saldo);
      btn.textContent = '🙈 Ocultar saldo';
    } else {
      el.textContent  = 'R$ ••••••';
      btn.textContent = '👁 Mostrar saldo';
    }
  },

  toggleSaldo() {
    estado.saldoVisivel = !estado.saldoVisivel;
    App.atualizarSaldo();
  },

  // ── Extrato ─────────────────────────────────────────────────
  renderExtrato() {
    document.getElementById('extrato-lista').innerHTML =
      estado.transacoes.map(App.htmlTransacao).join('');
  },

  htmlTransacao(t) {
    const sinal = t.tipo === 'credito' ? '+' : '−';
    return `
      <div class="transacao-item">
        <div class="transacao-icone ${t.tipo}">${categoriaIcon(t.categoria)}</div>
        <div class="transacao-info">
          <div class="transacao-desc">${t.descricao}</div>
          <div class="transacao-data">${fmtData(t.data, t.hora)}</div>
        </div>
        <div class="transacao-valor ${t.tipo}">${sinal} ${fmt(t.valor)}</div>
      </div>`;
  },

  // ── PIX ─────────────────────────────────────────────────────
  renderPix() {
    document.getElementById('pix-contatos').innerHTML =
      estado.contatos.map(c => `
        <div class="contato-item" onclick="App.selecionarContato('${c.chave}', '${c.nome}')">
          <div class="contato-avatar">${c.nome[0]}</div>
          <div>
            <div class="contato-nome">${c.nome}</div>
            <div class="contato-chave">${c.chave} · ${c.banco}</div>
          </div>
        </div>`).join('');
  },

  selecionarContato(chave, nome) {
    document.getElementById('pix-chave').value = chave;
    document.querySelectorAll('.contato-item').forEach(el => {
      el.classList.toggle('selecionado', el.textContent.includes(nome));
    });
  },

  confirmarPix() {
    const chave = document.getElementById('pix-chave').value.trim();
    const valor = parseFloat(document.getElementById('pix-valor').value);
    const desc  = document.getElementById('pix-descricao').value.trim();
    if (!chave) return mostrarAlerta('Informe a chave PIX do destinatário.');
    if (!valor || valor <= 0) return mostrarAlerta('Informe um valor válido.');

    App.abrirConfirm([
      { label: 'Para', valor: chave },
      { label: 'Valor', valor: fmt(valor) },
      { label: 'Descrição', valor: desc || '—' },
      { label: 'Tipo', valor: 'PIX' }
    ], async () => {
      const data = await apiFetch('/transacoes/pix', {
        method: 'POST',
        body: JSON.stringify({ contaId: estado.contaAtiva.id, chaveDestino: chave, valor, descricao: desc })
      });
      estado.contaAtiva.saldo = data.novoSaldo;
      estado.transacoes.unshift(data.transacao);
      App.mostrarSucesso('PIX enviado!', `${fmt(valor)} enviado com sucesso.`);
    });
  },

  // ── Boleto ───────────────────────────────────────────────────
  confirmarBoleto() {
    const codigo = document.getElementById('boleto-codigo').value.trim();
    const desc   = document.getElementById('boleto-descricao').value.trim();
    const valor  = parseFloat(document.getElementById('boleto-valor').value);
    if (!codigo) return mostrarAlerta('Informe o código de barras.');
    if (!valor || valor <= 0) return mostrarAlerta('Informe um valor válido.');

    App.abrirConfirm([
      { label: 'Descrição', valor: desc || 'Boleto' },
      { label: 'Valor', valor: fmt(valor) },
      { label: 'Tipo', valor: 'Boleto bancário' }
    ], async () => {
      const data = await apiFetch('/transacoes/boleto', {
        method: 'POST',
        body: JSON.stringify({ contaId: estado.contaAtiva.id, codigoBoleto: codigo, valor, descricao: desc })
      });
      estado.contaAtiva.saldo = data.novoSaldo;
      estado.transacoes.unshift(data.transacao);
      App.mostrarSucesso('Boleto pago!', `${fmt(valor)} debitado com sucesso.`);
    });
  },

  // ── TED ──────────────────────────────────────────────────────
  confirmarTed() {
    const nome    = document.getElementById('ted-nome').value.trim();
    const agencia = document.getElementById('ted-agencia').value.trim();
    const conta   = document.getElementById('ted-conta').value.trim();
    const valor   = parseFloat(document.getElementById('ted-valor').value);
    if (!nome || !agencia || !conta) return mostrarAlerta('Preencha todos os dados.');
    if (!valor || valor <= 0) return mostrarAlerta('Informe um valor válido.');

    App.abrirConfirm([
      { label: 'Favorecido', valor: nome },
      { label: 'Agência', valor: agencia },
      { label: 'Conta', valor: conta },
      { label: 'Valor', valor: fmt(valor) },
      { label: 'Tipo', valor: 'TED' }
    ], async () => {
      const data = await apiFetch('/transacoes/ted', {
        method: 'POST',
        body: JSON.stringify({ contaId: estado.contaAtiva.id, agenciaDestino: agencia, contaDestino: conta, valor, nomeFavorecido: nome })
      });
      estado.contaAtiva.saldo = data.novoSaldo;
      estado.transacoes.unshift(data.transacao);
      App.mostrarSucesso('TED enviada!', `${fmt(valor)} transferido com sucesso.`);
    });
  },

  // ── Cartão ───────────────────────────────────────────────────
  renderCartao() {
    const cartao = estado.cartoes[0];
    if (!cartao) return;
    const nome = estado.usuario.nome.toUpperCase();
    document.getElementById('cartao-visual-container').innerHTML = `
      <div class="cartao-visual">
        <div class="cartao-bandeira">${cartao.bandeira}</div>
        <div class="cartao-numero">${cartao.numero}</div>
        <div class="cartao-info">
          <div>
            <div class="cartao-nome">${nome}</div>
            <div class="cartao-validade">Validade ${cartao.validade}</div>
          </div>
          <div style="font-size:26px">💳</div>
        </div>
      </div>`;
    document.getElementById('cartao-detalhes').innerHTML = `
      <div class="info-row">
        <span class="info-label">Limite total</span>
        <span class="info-valor">${fmt(cartao.limite)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fatura atual</span>
        <span class="info-valor" style="color:var(--danger)">${fmt(cartao.faturaAtual)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Disponível</span>
        <span class="info-valor" style="color:var(--success)">${fmt(cartao.limite - cartao.faturaAtual)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="badge badge-success">${cartao.status}</span>
      </div>`;
  },

  // ── Perfil ────────────────────────────────────────────────────
  async renderPerfil() {
    const u = estado.usuario;
    document.getElementById('perfil-nome').textContent  = u.nome;
    document.getElementById('perfil-email').textContent = u.email;
    document.getElementById('perfil-dados').innerHTML = `
      <div class="info-row"><span class="info-label">CPF</span><span class="info-valor">${u.cpf}</span></div>
      <div class="info-row"><span class="info-label">Telefone</span><span class="info-valor">${u.telefone}</span></div>
      <div class="info-row"><span class="info-label">Nascimento</span><span class="info-valor">${new Date(u.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')}</span></div>
      <div class="info-row"><span class="info-label">E-mail</span><span class="info-valor">${u.email}</span></div>`;
    const chaves = await apiFetch('/pix/' + u.id + '/chaves');
    document.getElementById('perfil-pix').innerHTML = chaves.map(c => `
      <div class="info-row">
        <span class="info-label">${c.tipo.toUpperCase()}</span>
        <span class="info-valor">${c.chave}</span>
      </div>`).join('');
  },

  // ── Chaves PIX ────────────────────────────────────────────────
  async renderChavesPix() {
    const chaves = await apiFetch('/pix/' + estado.usuario.id + '/chaves');
    document.getElementById('chaves-pix-lista').innerHTML = chaves.map(c => `
      <div class="info-row">
        <div>
          <div class="info-valor">${c.chave}</div>
          <div class="info-label">${c.apelido}</div>
        </div>
        <span class="badge badge-success">${c.tipo}</span>
      </div>`).join('');
  },

  // ── Confirm overlay ───────────────────────────────────────────
  abrirConfirm(linhas, callback) {
    estado.confirmarCallback = callback;
    document.getElementById('confirm-detalhes').innerHTML = linhas.map(l =>
      `<div class="confirm-row"><span class="confirm-label">${l.label}</span><span class="confirm-valor">${l.valor}</span></div>`
    ).join('');
    document.getElementById('confirm-overlay').classList.add('visivel');
    document.getElementById('confirm-btn-ok').onclick = App.executarConfirm;
  },

  async executarConfirm() {
    const btn = document.getElementById('confirm-btn-ok');
    btn.disabled = true;
    try {
      await estado.confirmarCallback();
      App.fecharConfirm();
    } catch (e) {
      App.fecharConfirm();
      mostrarAlerta(e.message);
    } finally {
      btn.disabled = false;
    }
  },

  fecharConfirm() {
    document.getElementById('confirm-overlay').classList.remove('visivel');
  },

  // ── Sucesso overlay ───────────────────────────────────────────
  mostrarSucesso(titulo, sub) {
    document.getElementById('sucesso-titulo').textContent = titulo;
    document.getElementById('sucesso-sub').textContent    = sub;
    document.getElementById('sucesso-overlay').classList.add('visivel');
  },

  fecharSucesso() {
    document.getElementById('sucesso-overlay').classList.remove('visivel');
    App.ir('dashboard');
  },

  // ── Logout ────────────────────────────────────────────────────
  logout() {
    estado = { usuario: null, contas: [], transacoes: [], cartoes: [], contatos: [], contaAtiva: null, saldoVisivel: false, confirmarCallback: null };
    document.getElementById('bottom-nav').style.display = 'none';
    document.getElementById('agente-widget').classList.remove('visivel', 'expandido');
    document.getElementById('chat-msgs').innerHTML = '';
    App.ir('login');
  }
};

// ── UI do Agente ──────────────────────────────────────────────
const AgenteUI = {

  abrir() {
    const w = document.getElementById('agente-widget');
    w.classList.add('expandido');
  },

  fechar() {
    document.getElementById('agente-widget').classList.remove('expandido');
  },

  toggle() {
    const w = document.getElementById('agente-widget');
    w.classList.toggle('expandido');
    if (w.classList.contains('expandido')) {
      setTimeout(() => document.getElementById('chat-input').focus(), 100);
    }
  },

  addMsg(texto, origem) {
    const el = document.getElementById('chat-msgs');
    const div = document.createElement('div');
    div.className = `msg msg-${origem}`;
    div.innerHTML = texto.replace(/\n/g, '<br>');
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    return div;
  },

  mostrarTyping() {
    const el = document.getElementById('chat-msgs');
    const div = document.createElement('div');
    div.className = 'typing';
    div.id = 'typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  },

  removerTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  },

  mostrarSugestoes(chips) {
    document.getElementById('chat-sugestoes').innerHTML = chips.map(c =>
      `<button class="chip" onclick="AgenteUI.enviarTexto('${c}')">${c}</button>`
    ).join('');
  },

  async enviar() {
    const input = document.getElementById('chat-input');
    const texto = input.value.trim();
    if (!texto) return;
    input.value = '';
    await AgenteUI.enviarTexto(texto);
  },

  async enviarTexto(texto) {
    document.getElementById('chat-sugestoes').innerHTML = '';
    AgenteUI.addMsg(texto, 'usuario');
    AgenteUI.mostrarTyping();

    await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
    AgenteUI.removerTyping();

    const nomeUsuario = estado.usuario ? estado.usuario.nome.split(' ')[0] : 'usuário';
    const resultado = Agente.processar(texto, nomeUsuario);

    // Exibe a resposta do agente (campo agora é "mensagem")
    AgenteUI.addMsg(resultado.mensagem, 'agente');

    // ── Destaca o elemento alvo com borda amarela pulsante ──
    if (resultado.target) {
      destacarElemento(resultado.target);
    }

    // ── Navega para a tela correta ──────────────────────────
    if (resultado.acao && resultado.acao.startsWith('navegar:')) {
      const destino = resultado.acao.replace('navegar:', '');
      setTimeout(() => App.ir(destino), 600);
    }

    // ── Sugestões contextuais ───────────────────────────────
    const sugestoesMap = {
      saldo:        ['Ver extrato', 'Fazer PIX', 'Pagar boleto'],
      extrato:      ['Fazer PIX', 'Pagar boleto', 'Ver cartão'],
      pix:          ['Ver saldo', 'Pagar boleto', 'Ver extrato'],
      boleto:       ['Ver saldo', 'Fazer PIX', 'Ver extrato'],
      ted:          ['Ver saldo', 'Ver extrato', 'Fazer PIX'],
      cartao:       ['Ver saldo', 'Fazer PIX', 'Ver extrato'],
      perfil:       ['Ver saldo', 'Fazer PIX', 'Ver extrato'],
      chave_pix:    ['Fazer PIX', 'Ver saldo', 'Ver extrato'],
      ajuda:        ['Ver saldo', 'Fazer PIX', 'Pagar boleto', 'Ver extrato'],
      saudacao:     ['Ver saldo', 'Fazer PIX', 'Pagar boleto', 'Ajuda'],
      desconhecida: ['Ver saldo', 'Fazer PIX', 'Pagar boleto', 'Ajuda']
    };
    const chips = sugestoesMap[resultado.intencao];
    if (chips) setTimeout(() => AgenteUI.mostrarSugestoes(chips), 700);
  }
};

// ── Event listeners ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-login').addEventListener('click', App.login);
  document.getElementById('btn-toggle-saldo').addEventListener('click', App.toggleSaldo);

  document.getElementById('input-senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') App.login();
  });
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') AgenteUI.enviar();
  });
});
