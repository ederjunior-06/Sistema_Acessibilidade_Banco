const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/conta', require('./routes/conta'));
app.use('/api/transacoes', require('./routes/transacoes'));
app.use('/api/cartao', require('./routes/cartao'));
app.use('/api/pix', require('./routes/pix'));

// Todas as outras rotas entregam o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ NovoBanco rodando em http://localhost:${PORT}`);
  console.log(`   Login: CPF 123.456.789-00 | Senha: 1234\n`);
});
