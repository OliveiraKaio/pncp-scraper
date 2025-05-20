const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Rota padrão só para teste
app.get('/', (req, res) => {
  res.send('Servidor PNCP ativo. Use /buscar para iniciar a coleta.');
});

// Sua rota de coleta (exemplo)
app.get('/buscar', async (req, res) => {
  try {
    const resultado = await require('./scripts/buscarLista');
    res.send('Coleta finalizada!');
  } catch (err) {
    res.status(500).send('Erro na coleta: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
