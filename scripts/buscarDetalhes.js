const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');

// ✅ Altere para false para rodar em modo completo
const modoTeste = true;

(async () => {
  const dataHoje = dayjs().format('YYYY-MM-DD');
  const pasta = path.join(__dirname, '..', 'dados', dataHoje);
  const listaPath = path.join(pasta, 'editais_lista.json');
  const resultadoPath = path.join(pasta, 'editais_detalhados.json');

  if (!await fs.pathExists(listaPath)) {
    console.error(`Arquivo não encontrado: ${listaPath}`);
    process.exit(1);
  }

  const listaEditais = await fs.readJson(listaPath);
  const resultados = [];

  const editaisParaProcessar = modoTeste ? listaEditais.slice(0, 10) : listaEditais;
  console.log(`Modo ${modoTeste ? 'teste' : 'completo'} ativado. Total a processar: ${editaisParaProcessar.length}`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

  for (let i = 0; i < editaisParaProcessar.length; i++) {
    const edital = editaisParaProcessar[i];
    console.log(`Detalhando edital ${i + 1}/${editaisParaProcessar.length}`);

    try {
      await page.goto(edital.linkDetalhe, { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay manual

      const detalhes = await page.evaluate(() => {
        const texto = document.body.innerText;

        function extrairTexto(label) {
          const regex = new RegExp(`${label}\\s*:\\s*(.*?)\\n`);
          return texto.match(regex)?.[1]?.trim();
        }

        const cnpj = extrairTexto('CNPJ');
        const local = extrairTexto('Local');
        const orgao = extrairTexto('Órgão');
        const unidadeCompradora = texto.match(/Unidade compradora:\s*(.*?)\n/)?.[1]?.trim();
        const modalidade = extrairTexto('Modalidade da contratação');
        const tipo = extrairTexto('Tipo');
        const modoDisputa = extrairTexto('Modo de disputa');
        const registroPreco = extrairTexto('Registro de preço');
        const fonteOrcamentaria = extrairTexto('Fonte orçamentária');
        const dataDivulgacao = extrairTexto('Data de divulgação no PNCP');
        const situacao = extrairTexto('Situação');
        const dataInicioRecebimento = texto.match(/Data de início de recebimento de propostas:\s*(\d{2}\/\d{2}\/\d{4})/)?.[1];
        const dataFimRecebimento = texto.match(/Data fim de recebimento de propostas:\s*(\d{2}\/\d{2}\/\d{4})/)?.[1];
        const valorTotal = texto.match(/VALOR TOTAL ESTIMADO DA COMPRA\s*R\$\s*([\d.,]+)/)?.[1];
        const objetoDetalhado = document.querySelector('.conteudo-objeto')?.innerText.trim();

        const itens = Array.from(document.querySelectorAll('datatable-body-row')).map(row => {
          const colunas = row.querySelectorAll('datatable-body-cell');
          return {
            numero: colunas[0]?.innerText.trim(),
            descricao: colunas[1]?.innerText.trim(),
            quantidade: colunas[2]?.innerText.trim(),
            valorUnitario: colunas[3]?.innerText.trim(),
            valorTotal: colunas[4]?.innerText.trim()
          };
        });

        return {
          cnpj,
          local,
          orgao,
          unidadeCompradora,
          modalidade,
          tipo,
          modoDisputa,
          registroPreco,
          fonteOrcamentaria,
          dataDivulgacao,
          situacao,
          dataInicioRecebimento,
          dataFimRecebimento,
          valorTotal,
          objetoDetalhado,
          itens
        };
      });

      resultados.push({ ...edital, ...detalhes });

    } catch (err) {
      console.error(`Erro ao acessar ${edital.linkDetalhe}:`, err.message);
    }
  }

  await browser.close();
  await fs.writeJson(resultadoPath, resultados, { spaces: 2 });
  console.log(`Salvo em ${resultadoPath} - Total: ${resultados.length}`);
})();
