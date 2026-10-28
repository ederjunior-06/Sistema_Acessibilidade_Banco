// Banco de dados simulado em memória

const database = {
  usuarios: [
    {
      id: 1,
      nome: "Carlos Eduardo Silva",
      cpf: "123.456.789-00",
      email: "carlos.silva@email.com",
      senha: "1234",
      telefone: "(11) 98765-4321",
      dataNascimento: "1990-05-15",
      foto: null
    }
  ],

  contas: [
    {
      id: 1,
      usuarioId: 1,
      agencia: "0001",
      numero: "12345-6",
      tipo: "Conta Corrente",
      saldo: 4850.75,
      limite: 2000.00,
      rendimento: 0.0
    },
    {
      id: 2,
      usuarioId: 1,
      agencia: "0001",
      numero: "78901-2",
      tipo: "Conta Poupança",
      saldo: 12340.00,
      limite: 0,
      rendimento: 0.5
    }
  ],

  cartoes: [
    {
      id: 1,
      contaId: 1,
      numero: "**** **** **** 4521",
      bandeira: "Visa",
      validade: "12/28",
      limite: 5000.00,
      faturaAtual: 876.40,
      status: "ativo"
    }
  ],

  transacoes: [
    {
      id: 1,
      contaId: 1,
      tipo: "credito",
      categoria: "salario",
      descricao: "Salário - Empresa XYZ",
      valor: 5500.00,
      data: "2025-01-05",
      hora: "09:00",
      status: "concluida"
    },
    {
      id: 2,
      contaId: 1,
      tipo: "debito",
      categoria: "pix",
      descricao: "PIX enviado - Ana Paula",
      valor: 350.00,
      data: "2025-01-08",
      hora: "14:32",
      status: "concluida"
    },
    {
      id: 3,
      contaId: 1,
      tipo: "debito",
      categoria: "boleto",
      descricao: "Pagamento Boleto - Conta de Luz",
      valor: 189.50,
      data: "2025-01-10",
      hora: "10:15",
      status: "concluida"
    },
    {
      id: 4,
      contaId: 1,
      tipo: "credito",
      categoria: "pix",
      descricao: "PIX recebido - João Marcos",
      valor: 120.00,
      data: "2025-01-12",
      hora: "18:45",
      status: "concluida"
    },
    {
      id: 5,
      contaId: 1,
      tipo: "debito",
      categoria: "ted",
      descricao: "TED enviado - Maria Fernanda",
      valor: 1500.00,
      data: "2025-01-15",
      hora: "11:20",
      status: "concluida"
    },
    {
      id: 6,
      contaId: 1,
      tipo: "debito",
      categoria: "boleto",
      descricao: "Pagamento Boleto - Internet",
      valor: 99.90,
      data: "2025-01-18",
      hora: "08:00",
      status: "concluida"
    },
    {
      id: 7,
      contaId: 1,
      tipo: "credito",
      categoria: "transferencia",
      descricao: "Transferência recebida - Pai",
      valor: 500.00,
      data: "2025-01-20",
      hora: "16:00",
      status: "concluida"
    },
    {
      id: 8,
      contaId: 1,
      tipo: "debito",
      categoria: "pix",
      descricao: "PIX enviado - Mercado Central",
      valor: 230.15,
      data: "2025-01-22",
      hora: "19:30",
      status: "concluida"
    }
  ],

  pixKeys: [
    {
      id: 1,
      usuarioId: 1,
      tipo: "cpf",
      chave: "123.456.789-00",
      apelido: "Minha chave CPF"
    },
    {
      id: 2,
      usuarioId: 1,
      tipo: "email",
      chave: "carlos.silva@email.com",
      apelido: "Minha chave E-mail"
    }
  ],

  contatos: [
    { id: 1, nome: "Ana Paula", chave: "ana.paula@email.com", tipo: "email", banco: "NovoBanco" },
    { id: 2, nome: "João Marcos", chave: "11987654321", tipo: "telefone", banco: "NovoBanco" },
    { id: 3, nome: "Maria Fernanda", chave: "987.654.321-00", tipo: "cpf", banco: "Outro Banco" },
    { id: 4, nome: "Empresa XYZ", chave: "00.123.456/0001-78", tipo: "cnpj", banco: "NovoBanco" }
  ]
};

module.exports = database;
