const express = require('express');
const router = express.Router();
const db = require('../data/database');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { cpf, senha } = req.body;
  const usuario = db.usuarios.find(u => u.cpf === cpf && u.senha === senha);
  if (!usuario) {
    return res.status(401).json({ erro: 'CPF ou senha inválidos.' });
  }
  const { senha: _, ...dadosPublicos } = usuario;
  res.json({ sucesso: true, usuario: dadosPublicos });
});

module.exports = router;
