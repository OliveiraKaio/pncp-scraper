const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const buscarLista = require('./scripts/buscarLista');

app.get('/', async (req, res) => {
  const modoTeste = req.query.teste === 'true';
  console.log(`🟢 Requisição recebida. modoTeste: ${modoTeste}`);
  try {
    await buscarLista({ modoTeste });
    res.send('✅ Execução do buscarLista finalizada.');
  } catch (err) {
    console.error('Erro na execução do buscarLista:', err);
    res.status(500).send('Erro na execução.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ouvindo na porta ${PORT}`);
});
