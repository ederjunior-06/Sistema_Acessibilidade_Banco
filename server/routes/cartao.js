const express = require('express');
const router = express.Router();
const db = require('../data/database');

// GET /api/cartao/:usuarioId
router.get('/:usuarioId', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const contas = db.contas.filter(c => c.usuarioId === usuarioId).map(c => c.id);
  const cartoes = db.cartoes.filter(c => contas.includes(c.contaId));
  res.json(cartoes);
});

module.exports = router;
