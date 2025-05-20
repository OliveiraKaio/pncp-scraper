const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');

(async () => {
  const dadosDir = path.join(__dirname, '..', 'dados');
  const completoPath = path.join(dadosDir, 'completo.json');
  const hoje = dayjs().format('YYYY-MM-DD');
  const detalhadoHoje = path.join(dadosDir, hoje, 'editais_detalhados.json');

  try {
    await fs.ensureDir(dadosDir);

    let completos = [];
    let novosHoje = [];

    if (await fs.pathExists(completoPath)) {
      completos = await fs.readJson(completoPath);
    }

    if (await fs.pathExists(detalhadoHoje)) {
      const editaisHoje = await fs.readJson(detalhadoHoje);

      const idsExistentes = new Set(completos.map(e => e.idPNCP || e.linkDetalhe));

      novosHoje = editaisHoje.filter(edital => {
        const id = edital.idPNCP || edital.linkDetalhe;
        return !idsExistentes.has(id);
      });

      if (novosHoje.length > 0) {
        completos.push(...novosHoje);
        await fs.writeJson(completoPath, completos, { spaces: 2 });
        console.log(`Adicionados ${novosHoje.length} novos editais ao completo.json.`);
      } else {
        console.log('Nenhum edital novo encontrado hoje.');
      }
    } else {
      console.warn(`Arquivo do dia ${hoje} não encontrado: ${detalhadoHoje}`);
    }
  } catch (err) {
    console.error('Erro ao atualizar o completo.json:', err.message);
  }
})();
