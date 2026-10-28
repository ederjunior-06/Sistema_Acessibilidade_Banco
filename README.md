# NovoBanco — Simulação de App de Banco com Agente IA

> Um app de banco digital simulado com um **agente IA** embutido que ajuda o usuário a navegar pelo sistema usando linguagem natural em português.

---

## 🚀 Como rodar

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior

### Instalação

```bash
cd Sistema_Acessibilidade_Banco
npm install
npm start
```

Acesse: **http://localhost:3000**

### Credenciais de teste
| Campo | Valor |
|-------|-------|
| CPF   | `123.456.789-00` |
| Senha | `1234` |

---

## 🤖 Agente IA — Nova

O **Nova** é o assistente do NovoBanco. Após o login, um botão 🤖 aparece no canto da tela. Você pode conversar com ele em linguagem natural:

| O que dizer | O que acontece |
|---|---|
| "Ver meu saldo" | Vai para o Dashboard |
| "Quero fazer um PIX" | Abre a tela de PIX |
| "Pagar um boleto" | Abre a tela de Boleto |
| "Ver meu extrato" | Abre o Extrato |
| "Fazer uma transferência" | Abre a tela de TED |
| "Ver meu cartão" | Abre a tela do Cartão |
| "Meus dados" | Abre o Perfil |
| "Ajuda" | Lista todas as opções |

---

## 📁 Estrutura do projeto

```
Sistema_Acessibilidade_Banco/
├── package.json
├── server/
│   ├── index.js              # Servidor Express
│   ├── data/
│   │   └── database.js       # Dados simulados em memória
│   └── routes/
│       ├── auth.js           # Login
│       ├── conta.js          # Saldo e contas
│       ├── transacoes.js     # Extrato, PIX, Boleto, TED
│       ├── cartao.js         # Cartão de crédito
│       └── pix.js            # Chaves PIX
└── public/
    ├── index.html            # SPA com todas as telas
    ├── css/
    │   └── style.css         # Estilos completos
    └── js/
        ├── agente.js         # Motor do agente IA
        └── app.js            # Lógica do frontend
```

---

## 💡 Funcionalidades

- ✅ **Login** com CPF e senha
- ✅ **Dashboard** com saldo (mostrar/ocultar) e últimas transações
- ✅ **Extrato** completo com histórico
- ✅ **PIX** — envio com seleção de contatos ou chave manual
- ✅ **Boleto** — pagamento com código de barras
- ✅ **TED** — transferência para outros bancos
- ✅ **Cartão** — visualização do cartão e fatura
- ✅ **Perfil** — dados pessoais e chaves PIX
- ✅ **Agente IA** — navegação por linguagem natural em português

---

## 🛠️ Tecnologias

- **Backend:** Node.js + Express
- **Frontend:** HTML5 + CSS3 + JavaScript puro (SPA)
- **Agente IA:** Motor de intenções em português (sem API externa)
- **Dados:** JSON em memória (simulação)
