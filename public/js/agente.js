// ============================================================
//  Agente IA do NovoBanco — Motor de intenção e navegação
//  Retorna JSON: { mensagem, target, acao }
//  "target" = id do elemento a destacar com borda amarela pulsante
// ============================================================

const Agente = (() => {

  // ── Mapa de intenções ────────────────────────────────────────
  // target: id do botão/elemento que o agente vai destacar visualmente
  const intencoes = [
    {
      nome: 'saldo',
      padroes: [
        /saldo/i, /quanto.*tenho/i, /meu dinheiro/i, /quanto (tem|há|ha|tenho)/i,
        /ver (minha|meu) conta/i
      ],
      mensagem: 'Aqui está o seu saldo! 💰 Veja o valor exibido no topo da tela Home.',
      acao: 'navegar:dashboard',
      target: 'btn-toggle-saldo'
    },
    {
      nome: 'extrato',
      padroes: [
        /extrato/i, /histórico/i, /historico/i, /transaç/i, /transac/i,
        /movimentaç/i, /movimentac/i, /últimas.*compras/i, /ultimas.*compras/i,
        /o que.*gastei/i, /entradas.*saídas/i
      ],
      mensagem: 'Abrindo o seu extrato! 📋 Veja todas as suas movimentações.',
      acao: 'navegar:extrato',
      target: 'btn-extrato'
    },
    {
      nome: 'pix',
      padroes: [
        /pix/i, /mandar.*dinheiro/i, /enviar.*dinheiro/i, /transferi/i,
        /manda.*grana/i, /pagar.*alguém/i, /fazer.*pix/i
      ],
      mensagem: 'Vou abrir o PIX para você! 📲 Escolha um contato ou digite a chave.',
      acao: 'navegar:pix',
      target: 'btn-pix'
    },
    {
      nome: 'boleto',
      padroes: [
        /boleto/i, /pagar.*conta/i, /pagamento/i, /vencimento/i,
        /pagar.*fatura/i, /quitar/i, /pagar.*luz/i, /pagar.*água/i,
        /pagar.*internet/i, /pagar.*aluguel/i
      ],
      mensagem: 'Abrindo o pagamento de boleto! 🧾 Digite o código de barras.',
      acao: 'navegar:boleto',
      target: null
    },
    {
      nome: 'ted',
      padroes: [
        /ted/i, /transferência/i, /transferencia/i, /transferir/i,
        /outro banco/i
      ],
      mensagem: 'Vou abrir a transferência TED! 🏦 Informe os dados do destinatário.',
      acao: 'navegar:ted',
      target: 'btn-transferir'
    },
    {
      nome: 'cartao',
      padroes: [
        /cartão/i, /cartao/i, /fatura/i, /crédito/i, /credito/i,
        /débito/i, /debito/i, /limite/i
      ],
      mensagem: 'Mostrando seu cartão! 💳 Veja limite, fatura e status.',
      acao: 'navegar:cartao',
      target: 'nav-cartao'
    },
    {
      nome: 'perfil',
      padroes: [
        /perfil/i, /meus dados/i, /dados pessoais/i,
        /informações pessoais/i, /editar dados/i, /atualizar cadastro/i
      ],
      mensagem: 'Abrindo o seu perfil! 👤 Aqui estão seus dados pessoais.',
      acao: 'navegar:perfil',
      target: 'nav-perfil'
    },
    {
      nome: 'ajuda',
      padroes: [
        /ajuda/i, /help/i, /o que.*faz/i, /como.*usar/i, /o que.*pode/i,
        /funcionalidades/i, /me ajuda/i, /não sei/i, /nao sei/i,
        /dúvida/i, /duvida/i
      ],
      mensagem: null, // gerada dinamicamente
      acao: 'ajuda',
      target: null
    },
    {
      nome: 'saudacao',
      padroes: [
        /^(oi|olá|ola|hey|e aí|e ai|bom dia|boa tarde|boa noite|tudo bem|tudo bom|salve)[\s!?]*$/i
      ],
      mensagem: null, // gerada dinamicamente
      acao: 'saudacao',
      target: null
    },
    {
      nome: 'agradecimento',
      padroes: [
        /obrigad/i, /valeu/i, /vlw/i, /obg/i, /grat/i, /show/i, /ótimo/i, /otimo/i
      ],
      mensagem: 'De nada! Estou sempre aqui para ajudar. 😊',
      acao: null,
      target: null
    },
    {
      nome: 'chave_pix',
      padroes: [
        /minha.*chave/i, /chave.*pix/i, /ver.*chave/i, /minhas chaves/i
      ],
      mensagem: 'Mostrando suas chaves PIX! 🔑',
      acao: 'navegar:chaves-pix',
      target: 'nav-perfil'
    }
  ];

  // ── Mensagens dinâmicas ──────────────────────────────────────
  const boasVindas = (nome) =>
    `Olá, ${nome}! 👋 Sou o <b>Nova</b>, seu assistente do NovoBanco.\n\nPosso te guiar pelo app! Tente:\n• "Ver meu saldo"\n• "Fazer um PIX"\n• "Pagar um boleto"\n• "Ver extrato"`;

  const ajudaMensagem = () =>
    `Posso te ajudar com:\n\n💰 <b>Saldo</b> — "Qual meu saldo?"\n📋 <b>Extrato</b> — "Ver extrato"\n📲 <b>PIX</b> — "Quero fazer um PIX"\n🧾 <b>Boleto</b> — "Pagar um boleto"\n🏦 <b>TED</b> — "Transferência TED"\n💳 <b>Cartão</b> — "Ver cartão"\n👤 <b>Perfil</b> — "Meus dados"`;

  const naoEntendeu = () => {
    const frases = [
      'Não entendi muito bem. 🤔 Tente "ver saldo", "fazer pix" ou "ajuda".',
      'Hmm, pode reformular? Exemplos: "extrato", "pagar boleto", "transferir".',
      'Não consegui reconhecer isso. Digite <b>"ajuda"</b> para ver o que posso fazer!'
    ];
    return frases[Math.floor(Math.random() * frases.length)];
  };

  // ── Processamento principal — retorna JSON ───────────────────
  function processar(texto, nomeUsuario) {
    const t = texto.trim();
    if (!t) return null;

    for (const intencao of intencoes) {
      for (const padrao of intencao.padroes) {
        if (padrao.test(t)) {
          let mensagem = intencao.mensagem;

          if (intencao.acao === 'ajuda') {
            mensagem = ajudaMensagem();
          } else if (intencao.acao === 'saudacao') {
            const h = new Date().getHours();
            const s = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
            mensagem = `${s}, ${nomeUsuario}! 😊 Como posso te ajudar?\n\nDigite <b>"ajuda"</b> para ver tudo que posso fazer.`;
          }

          // Retorna JSON com mensagem + target para highlight
          return {
            intencao: intencao.nome,
            mensagem,
            acao: intencao.acao,
            target: intencao.target
          };
        }
      }
    }

    return {
      intencao: 'desconhecida',
      mensagem: naoEntendeu(),
      acao: null,
      target: null
    };
  }

  return { processar, boasVindas };

})();

if (typeof module !== 'undefined') module.exports = Agente;
