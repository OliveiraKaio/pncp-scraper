const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');

async function atualizarCompleto() {
  const dataHoje = dayjs().format('YYYY-MM-DD');
  const pastaData = path.join('data', dataHoje);

  // 1. Remove todas as pastas dentro de "data/", exceto a do dia atual
  const dataDir = path.resolve('data');
  if (fs.existsSync(dataDir)) {
    const pastas = fs.readdirSync(dataDir);
    for (const pasta of pastas) {
      const fullPath = path.join(dataDir, pasta);
      if (fs.lstatSync(fullPath).isDirectory() && pasta !== dataHoje) {
        fs.removeSync(fullPath);
        console.log(`Pasta antiga removida: ${pasta}`);
      }
    }
  }

  // 2. Cria nova pasta para hoje
  fs.ensureDirSync(pastaData);

  // 3. Copia os arquivos JSON para a pasta do dia atual
  fs.copyFileSync('editais_lista.json', path.join(pastaData, 'editais_lista.json'));
  fs.copyFileSync('editais_detalhados.json', path.join(pastaData, 'editais_detalhados.json'));

  // 4. Atualiza o arquivo completo.json (exemplo: sobrescreve com os dados do dia)
  const detalhados = JSON.parse(fs.readFileSync('editais_detalhados.json'));
  fs.writeFileSync('completo.json', JSON.stringify(detalhados, null, 2));

  console.log(`Atualização completa para ${dataHoje}.`);
}

atualizarCompleto().catch(err => {
  console.error('Erro ao atualizar completo:', err);
  process.exit(1);
});
