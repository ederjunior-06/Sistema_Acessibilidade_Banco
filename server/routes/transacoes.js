const express = require('express');
const router = express.Router();
const db = require('../data/database');

// GET /api/transacoes/:contaId — extrato da conta
router.get('/:contaId', (req, res) => {
  const contaId = parseInt(req.params.contaId);
  const transacoes = db.transacoes
    .filter(t => t.contaId === contaId)
    .sort((a, b) => new Date(b.data + 'T' + b.hora) - new Date(a.data + 'T' + a.hora));
  res.json(transacoes);
});

// POST /api/transacoes/pix — simula envio de PIX
router.post('/pix', (req, res) => {
  const { contaId, chaveDestino, valor, descricao } = req.body;
  const conta = db.contas.find(c => c.id === contaId);
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada.' });
  if (valor <= 0) return res.status(400).json({ erro: 'Valor inválido.' });
  if (conta.saldo < valor) return res.status(400).json({ erro: 'Saldo insuficiente.' });

  conta.saldo -= valor;

  const novaTransacao = {
    id: db.transacoes.length + 1,
    contaId,
    tipo: 'debito',
    categoria: 'pix',
    descricao: `PIX enviado - ${descricao || chaveDestino}`,
    valor,
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    status: 'concluida'
  };
  db.transacoes.push(novaTransacao);

  res.json({ sucesso: true, transacao: novaTransacao, novoSaldo: conta.saldo });
});

// POST /api/transacoes/boleto — simula pagamento de boleto
router.post('/boleto', (req, res) => {
  const { contaId, codigoBoleto, valor, descricao } = req.body;
  const conta = db.contas.find(c => c.id === contaId);
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada.' });
  if (valor <= 0) return res.status(400).json({ erro: 'Valor inválido.' });
  if (conta.saldo < valor) return res.status(400).json({ erro: 'Saldo insuficiente.' });

  conta.saldo -= valor;

  const novaTransacao = {
    id: db.transacoes.length + 1,
    contaId,
    tipo: 'debito',
    categoria: 'boleto',
    descricao: `Pagamento Boleto - ${descricao || 'Boleto'}`,
    valor,
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    status: 'concluida'
  };
  db.transacoes.push(novaTransacao);

  res.json({ sucesso: true, transacao: novaTransacao, novoSaldo: conta.saldo });
});

// POST /api/transacoes/ted — simula transferência TED
router.post('/ted', (req, res) => {
  const { contaId, agenciaDestino, contaDestino, valor, nomeFavorecido } = req.body;
  const conta = db.contas.find(c => c.id === contaId);
  if (!conta) return res.status(404).json({ erro: 'Conta não encontrada.' });
  if (valor <= 0) return res.status(400).json({ erro: 'Valor inválido.' });
  if (conta.saldo < valor) return res.status(400).json({ erro: 'Saldo insuficiente.' });

  conta.saldo -= valor;

  const novaTransacao = {
    id: db.transacoes.length + 1,
    contaId,
    tipo: 'debito',
    categoria: 'ted',
    descricao: `TED enviado - ${nomeFavorecido}`,
    valor,
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    status: 'concluida'
  };
  db.transacoes.push(novaTransacao);

  res.json({ sucesso: true, transacao: novaTransacao, novoSaldo: conta.saldo });
});

module.exports = router;
