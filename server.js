// server.js
const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Servidor PNCP ativo. Use /buscar para iniciar a coleta.');
});

app.get('/buscar', async (req, res) => {
  const offset = parseInt(req.query.offset || '0');
  const limit = parseInt(req.query.limit || '9999');
  const modoTeste = req.query.teste === 'true';

  console.log(`🟢 Iniciando coleta com offset=${offset}, limit=${limit}, teste=${modoTeste}`);

  process.env.OFFSET = offset;
  process.env.LIMIT = limit;
  process.env.MODO_TESTE = modoTeste;

  exec('node scripts/buscarLista.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro: ${error.message}`);
      return res.status(500).send('Erro ao executar o script.');
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log(`Saída: ${stdout}`);
    res.send('✅ Script executado com sucesso.');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
