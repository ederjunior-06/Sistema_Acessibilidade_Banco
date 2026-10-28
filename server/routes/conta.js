const express = require('express');
const router = express.Router();
const db = require('../data/database');

// GET /api/conta/:usuarioId — lista contas do usuário
router.get('/:usuarioId', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const contas = db.contas.filter(c => c.usuarioId === usuarioId);
  if (!contas.length) return res.status(404).json({ erro: 'Nenhuma conta encontrada.' });
  res.json(contas);
});

// GET /api/conta/:usuarioId/saldo — saldo resumido
router.get('/:usuarioId/saldo', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const contas = db.contas.filter(c => c.usuarioId === usuarioId);
  const saldoTotal = contas.reduce((acc, c) => acc + c.saldo, 0);
  res.json({ saldoTotal, contas: contas.map(c => ({ tipo: c.tipo, saldo: c.saldo, numero: c.numero })) });
});

module.exports = router;
