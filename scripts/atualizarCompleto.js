const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');

async function atualizarCompleto() {
  const dataHoje = dayjs().format('YYYY-MM-DD');
  const pastaBase = path.resolve(__dirname, '..', 'dados'); // Corrige o caminho base
  const pastaData = path.join(pastaBase, dataHoje);

  // 1. Remove pastas antigas, exceto a do dia atual
  if (await fs.pathExists(pastaBase)) {
    const pastas = await fs.readdir(pastaBase);
    for (const pasta of pastas) {
      const fullPath = path.join(pastaBase, pasta);
      const isDir = (await fs.lstat(fullPath)).isDirectory();
      if (isDir && pasta !== dataHoje) {
        await fs.remove(fullPath);
        console.log(`Pasta antiga removida: ${pasta}`);
      }
    }
  }

  // 2. Garante a pasta de hoje
  await fs.ensureDir(pastaData);

  // 3. Verifica e copia os arquivos de origem
  const listaPath = path.resolve('editais_lista.json');
  const detalhadosPath = path.resolve('editais_detalhados.json');

  if (!(await fs.pathExists(listaPath)) || !(await fs.pathExists(detalhadosPath))) {
    throw new Error('Arquivos editais_lista.json ou editais_detalhados.json não encontrados na raiz.');
  }

  await fs.copy(listaPath, path.join(pastaData, 'editais_lista.json'));
  await fs.copy(detalhadosPath, path.join(pastaData, 'editais_detalhados.json'));

  // 4. Atualiza completo.json
  const detalhados = await fs.readJson(detalhadosPath);
  await fs.writeJson('completo.json', detalhados, { spaces: 2 });

  console.log(`Atualização completa para ${dataHoje}.`);
}

atualizarCompleto().catch(err => {
  console.error('Erro ao atualizar completo:', err.message);
  process.exit(1);
});
