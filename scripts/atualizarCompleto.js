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
      try {
        completos = await fs.readJson(completoPath);
        if (!Array.isArray(completos)) {
          console.warn(`Arquivo ${completoPath} não é um array. Será reinicializado.`);
          completos = [];
        }
      } catch (err) {
        console.error(`Erro ao ler ${completoPath}:`, err.message);
        completos = [];
      }
    }

    if (await fs.pathExists(detalhadoHoje)) {
      let editaisHoje = [];

      try {
        editaisHoje = await fs.readJson(detalhadoHoje);
        if (!Array.isArray(editaisHoje)) {
          throw new Error('O arquivo não contém uma lista de editais');
        }
      } catch (err) {
        console.error(`Erro ao ler ${detalhadoHoje}:`, err.message);
        return;
      }

      const idsExistentes = new Set(completos.map(e => e.idPNCP || e.linkDetalhe));

      novosHoje = editaisHoje.filter(edital => {
        const id = edital.idPNCP || edital.linkDetalhe;
        return !idsExistentes.has(id);
      });

      if (novosHoje.length > 0) {
        completos.push(...novosHoje);

        try {
          await fs.writeJson(completoPath, completos, { spaces: 2 });
          console.log(`Adicionados ${novosHoje.length} novos editais ao completo.json.`);
        } catch (err) {
          console.error('Erro ao salvar o arquivo completo.json:', err.message);
        }

        // Validação da integridade do arquivo salvo
        try {
          const verificado = await fs.readJson(completoPath);
          if (!Array.isArray(verificado)) {
            throw new Error('O conteúdo salvo não é um array válido.');
          }
        } catch (err) {
          console.error('Erro ao verificar integridade do completo.json:', err.message);
        }
      } else {
        console.log('Nenhum edital novo encontrado hoje.');
      }

      console.log(`Total no completo.json agora: ${completos.length}`);
    } else {
      console.warn(`Arquivo do dia ${hoje} não encontrado: ${detalhadoHoje}`);
    }
  } catch (err) {
    console.error('Erro inesperado ao atualizar o completo.json:', err.message);
  }
})();
