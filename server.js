const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/buscar', async (req, res) => {
  try {
    const { exec } = require('child_process');
    exec('node scripts/buscarLista.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro: ${error.message}`);
        return res.status(500).send(error.message);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res.status(500).send(stderr);
      }
      console.log(`Saída: ${stdout}`);
      res.send('✅ Execução iniciada:\n' + stdout);
    });
  } catch (err) {
    res.status(500).send('❌ Erro na execução: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
