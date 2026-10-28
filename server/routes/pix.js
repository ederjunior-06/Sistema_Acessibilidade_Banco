const express = require('express');
const router = express.Router();
const db = require('../data/database');

// GET /api/pix/:usuarioId/chaves
router.get('/:usuarioId/chaves', (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const chaves = db.pixKeys.filter(p => p.usuarioId === usuarioId);
  res.json(chaves);
});

// GET /api/pix/contatos
router.get('/contatos/lista', (req, res) => {
  res.json(db.contatos);
});

module.exports = router;
